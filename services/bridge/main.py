"""
Kolb-Bot Bridge: translates between Kolb-Bot's native WebSocket gateway API
and OpenAI-compatible HTTP endpoints that Open WebUI expects.

Also serves:
  - /v1/workshop/* — agent/sub-agent CRUD for the Workshop tab
  - /v1/telemetry/ws — WebSocket feed for the Pirate Ship dashboard
"""

from __future__ import annotations

import asyncio
import json
import os
import time
import uuid
from contextlib import asynccontextmanager
from typing import Any, AsyncGenerator

import httpx
import websockets
from fastapi import FastAPI, HTTPException, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

import providers as prov

GATEWAY_URL = os.environ.get("KOLB_BOT_GATEWAY_URL", "ws://kolbbot-api:18789")
GATEWAY_TOKEN = os.environ.get("KOLB_BOT_GATEWAY_TOKEN", "")
BRIDGE_SECRET = os.environ.get("BRIDGE_SECRET", "")

gateway_ws: websockets.WebSocketClientProtocol | None = None
gateway_lock = asyncio.Lock()
telemetry_subscribers: set[asyncio.Queue] = set()
agent_store: dict[str, dict] = {}

# Live memory: shared context that the First Mate always has access to.
# Updated by crew activity, tool results, and explicit memory writes.
memory_log: list[dict] = []
MEMORY_MAX = 200

FIRST_MATE_SYSTEM = """You are Kolb-Bot, the First Mate. You are the user's primary AI assistant.

Your role:
- You are the brain. The user talks to you and you decide what to do.
- You have a Crew of specialist agents. Delegate tasks to them when appropriate.
- You always know what's happening because your memory updates live.
- You speak clearly and get things done. No filler.

Crew management:
- When a task needs a specialist, delegate it to the right crew member.
- If no crew member fits, do it yourself or suggest recruiting one.
- Always report back what the crew accomplished.

Your memory is below. It updates in real time as crew members work.
"""


def add_memory(entry: dict):
    memory_log.append({**entry, "timestamp": time.time()})
    if len(memory_log) > MEMORY_MAX:
        del memory_log[:len(memory_log) - MEMORY_MAX]


def get_memory_context() -> str:
    if not memory_log:
        return ""
    recent = memory_log[-30:]
    lines = []
    for m in recent:
        ts = time.strftime("%H:%M:%S", time.localtime(m.get("timestamp", 0)))
        source = m.get("source", "system")
        content = m.get("content", "")
        lines.append(f"[{ts}] {source}: {content}")
    return "\n".join(lines)


def build_first_mate_messages(user_messages: list[dict]) -> list[dict]:
    """Prepend First Mate system prompt + live memory to the user's messages."""
    memory_ctx = get_memory_context()
    system_content = FIRST_MATE_SYSTEM
    if memory_ctx:
        system_content += f"\n\n--- LIVE MEMORY ---\n{memory_ctx}\n--- END MEMORY ---"

    crew_summary = ""
    if agent_store:
        crew_lines = []
        for a in agent_store.values():
            crew_lines.append(f"- {a.get('name', '?')} ({a.get('role', 'general')}): {a.get('status', 'idle')}")
        crew_summary = "\n\nCrew roster:\n" + "\n".join(crew_lines)
        system_content += crew_summary

    return [{"role": "system", "content": system_content}] + user_messages


async def get_gateway() -> websockets.WebSocketClientProtocol:
    global gateway_ws
    async with gateway_lock:
        if gateway_ws is None or gateway_ws.closed:
            headers = {}
            if GATEWAY_TOKEN:
                headers["Authorization"] = f"Bearer {GATEWAY_TOKEN}"
            gateway_ws = await websockets.connect(
                GATEWAY_URL,
                additional_headers=headers,
                ping_interval=20,
                ping_timeout=10,
            )
        return gateway_ws


async def gateway_rpc(method: str, params: dict | None = None) -> Any:
    ws = await get_gateway()
    req_id = str(uuid.uuid4())
    msg = {"jsonrpc": "2.0", "id": req_id, "method": method}
    if params:
        msg["params"] = params
    await ws.send(json.dumps(msg))

    async for raw in ws:
        data = json.loads(raw)
        if data.get("id") == req_id:
            if "error" in data:
                raise HTTPException(502, data["error"].get("message", "Gateway error"))
            return data.get("result")
    raise HTTPException(502, "Gateway connection lost")


def broadcast_telemetry(event: dict):
    for q in list(telemetry_subscribers):
        try:
            q.put_nowait(event)
        except asyncio.QueueFull:
            pass


@asynccontextmanager
async def lifespan(app: FastAPI):
    prov.init_providers()
    asyncio.create_task(_gateway_listener())
    yield
    global gateway_ws
    if gateway_ws and not gateway_ws.closed:
        await gateway_ws.close()


async def _gateway_listener():
    """Background task that listens to gateway events and forwards them to
    telemetry subscribers. Also writes significant events to live memory."""
    while True:
        try:
            ws = await get_gateway()
            async for raw in ws:
                data = json.loads(raw)
                if "method" in data and not data.get("id"):
                    broadcast_telemetry(data)

                    method = data.get("method", "")
                    params = data.get("params", {})
                    agent_name = params.get("agent_name", params.get("name", params.get("node", "")))

                    if method == "agent.tool_call":
                        tool = params.get("tool", "unknown")
                        add_memory({"source": agent_name or "crew", "content": f"Used tool: {tool}"})
                    elif method == "agent.task_completed":
                        add_memory({"source": agent_name or "crew", "content": "Task completed"})
                    elif method == "agent.error":
                        error = params.get("error", "unknown error")
                        add_memory({"source": agent_name or "crew", "content": f"Error: {error}"})
        except Exception:
            await asyncio.sleep(2)


app = FastAPI(title="Kolb-Bot Bridge", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
if os.path.isdir(STATIC_DIR):
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "kolbbot-bridge"}


# ---------------------------------------------------------------------------
# OpenAI-compatible Chat Completions
# ---------------------------------------------------------------------------

class ChatMessage(BaseModel):
    role: str
    content: str | list | None = None

class ChatRequest(BaseModel):
    model: str = "kolb-bot"
    messages: list[ChatMessage] = []
    stream: bool = False
    temperature: float = 0.7
    max_tokens: int | None = None

class ModelInfo(BaseModel):
    id: str
    object: str = "model"
    created: int = Field(default_factory=lambda: int(time.time()))
    owned_by: str = "kolb-bot"


@app.get("/v1/models")
async def list_models():
    models = [
        ModelInfo(id="kolb-bot", owned_by="kolb-bot"),
        ModelInfo(id="kolb-bot-fast", owned_by="kolb-bot"),
    ]
    try:
        result = await gateway_rpc("node.list")
        if isinstance(result, list):
            for node in result:
                name = node.get("name", node.get("id", "unknown"))
                models.append(ModelInfo(id=f"kolb-bot-{name}", owned_by="kolb-bot"))
    except Exception:
        pass

    # Add models from all configured providers
    for p in prov.list_providers():
        if not p.get("enabled"):
            continue
        try:
            provider_models = await prov.provider_list_models(p["id"])
            for pm in provider_models:
                models.append(ModelInfo(
                    id=pm["id"],
                    owned_by=pm.get("provider", p["name"]),
                ))
        except Exception:
            pass

    return {"object": "list", "data": [m.model_dump() for m in models]}


@app.post("/v1/chat/completions")
async def chat_completions(req: ChatRequest):
    raw_messages = [{"role": m.role, "content": m.content} for m in req.messages]
    messages_payload = build_first_mate_messages(raw_messages)

    user_msg = next((m for m in reversed(raw_messages) if m["role"] == "user"), None)
    if user_msg:
        add_memory({"source": "user", "content": str(user_msg.get("content", ""))[:200]})

    # Check if the model is provider-prefixed (e.g. "openai:gpt-4o", "codex-cli:default")
    provider_id = None
    provider_model = None
    if ":" in req.model:
        provider_id, provider_model = req.model.split(":", 1)

    # Route to external provider if specified
    if provider_id and prov.get_provider(provider_id):
        try:
            result = await prov.provider_chat(
                provider_id, messages_payload, provider_model,
                stream=False, temperature=req.temperature,
            )
            content = result["choices"][0]["message"]["content"]
        except Exception as e:
            content = f"Provider error ({provider_id}): {e}"

        add_memory({"source": f"provider:{provider_id}", "content": content[:200]})

        return {
            "id": f"chatcmpl-{uuid.uuid4().hex[:12]}",
            "object": "chat.completion",
            "created": int(time.time()),
            "model": req.model,
            "choices": [{"index": 0, "message": {"role": "assistant", "content": content}, "finish_reason": "stop"}],
            "usage": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0},
        }

    # Default: route through gateway
    if req.stream:
        return StreamingResponse(
            _stream_chat(messages_payload, req.model, req.temperature),
            media_type="text/event-stream",
        )

    try:
        result = await gateway_rpc("node.invoke", {
            "node": req.model.removeprefix("kolb-bot-") or "default",
            "messages": messages_payload,
            "options": {"temperature": req.temperature},
        })
        content = result.get("content", "") if isinstance(result, dict) else str(result)
    except Exception as e:
        content = f"Error communicating with Kolb-Bot gateway: {e}"

    add_memory({"source": "first-mate", "content": content[:200]})

    return {
        "id": f"chatcmpl-{uuid.uuid4().hex[:12]}",
        "object": "chat.completion",
        "created": int(time.time()),
        "model": req.model,
        "choices": [{
            "index": 0,
            "message": {"role": "assistant", "content": content},
            "finish_reason": "stop",
        }],
        "usage": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0},
    }


async def _stream_chat(
    messages: list[dict], model: str, temperature: float
) -> AsyncGenerator[str, None]:
    chunk_id = f"chatcmpl-{uuid.uuid4().hex[:12]}"

    try:
        ws = await get_gateway()
        req_id = str(uuid.uuid4())
        await ws.send(json.dumps({
            "jsonrpc": "2.0",
            "id": req_id,
            "method": "node.invoke",
            "params": {
                "node": model.removeprefix("kolb-bot-") or "default",
                "messages": messages,
                "options": {"temperature": temperature, "stream": True},
            },
        }))

        broadcast_telemetry({
            "method": "agent.task_started",
            "params": {"model": model, "timestamp": time.time()},
        })

        async for raw in ws:
            data = json.loads(raw)

            if "method" in data and not data.get("id"):
                broadcast_telemetry(data)
                continue

            if data.get("id") != req_id:
                continue

            if "error" in data:
                err_chunk = {
                    "id": chunk_id,
                    "object": "chat.completion.chunk",
                    "created": int(time.time()),
                    "model": model,
                    "choices": [{
                        "index": 0,
                        "delta": {"content": f"\n[Error: {data['error'].get('message', 'unknown')}]"},
                        "finish_reason": "stop",
                    }],
                }
                yield f"data: {json.dumps(err_chunk)}\n\n"
                yield "data: [DONE]\n\n"
                return

            result = data.get("result", {})
            if isinstance(result, dict):
                content = result.get("delta", result.get("content", ""))
                done = result.get("done", False)
            else:
                content = str(result)
                done = True

            if content:
                chunk = {
                    "id": chunk_id,
                    "object": "chat.completion.chunk",
                    "created": int(time.time()),
                    "model": model,
                    "choices": [{
                        "index": 0,
                        "delta": {"content": content},
                        "finish_reason": None,
                    }],
                }
                yield f"data: {json.dumps(chunk)}\n\n"

            if done:
                final_chunk = {
                    "id": chunk_id,
                    "object": "chat.completion.chunk",
                    "created": int(time.time()),
                    "model": model,
                    "choices": [{
                        "index": 0,
                        "delta": {},
                        "finish_reason": "stop",
                    }],
                }
                yield f"data: {json.dumps(final_chunk)}\n\n"
                yield "data: [DONE]\n\n"

                broadcast_telemetry({
                    "method": "agent.task_completed",
                    "params": {"model": model, "timestamp": time.time()},
                })
                return

    except Exception as e:
        err_chunk = {
            "id": chunk_id,
            "object": "chat.completion.chunk",
            "created": int(time.time()),
            "model": model,
            "choices": [{
                "index": 0,
                "delta": {"content": f"\n[Connection error: {e}]"},
                "finish_reason": "stop",
            }],
        }
        yield f"data: {json.dumps(err_chunk)}\n\n"
        yield "data: [DONE]\n\n"


# ---------------------------------------------------------------------------
# Workshop: Agent / Sub-Agent Management
# ---------------------------------------------------------------------------

class AgentConfig(BaseModel):
    name: str
    role: str = ""
    system_instructions: str = ""
    model: str = "kolb-bot"
    skills: list[str] = []
    tool_permissions: list[str] = []
    memory_enabled: bool = False
    integrations: list[str] = []
    parent_agent_id: str | None = None
    safe_mode: bool = True

class AgentTemplate(BaseModel):
    name: str
    description: str = ""
    config: AgentConfig


@app.get("/v1/workshop/agents")
async def list_agents():
    return {"agents": list(agent_store.values())}


@app.post("/v1/workshop/agents")
async def create_agent(config: AgentConfig):
    agent_id = str(uuid.uuid4())
    agent = {
        "id": agent_id,
        "created_at": time.time(),
        "status": "idle",
        **config.model_dump(),
    }

    if config.safe_mode:
        agent["tool_permissions"] = [
            t for t in agent["tool_permissions"]
            if t in ("read_file", "list_files", "search", "web_search")
        ]

    agent_store[agent_id] = agent

    broadcast_telemetry({
        "method": "workshop.agent_created",
        "params": {"agent_id": agent_id, "name": config.name},
    })

    add_memory({"source": "crew-mgmt", "content": f"New crew member recruited: {config.name} ({config.role})"})

    return {"agent": agent}


@app.get("/v1/workshop/agents/{agent_id}")
async def get_agent(agent_id: str):
    if agent_id not in agent_store:
        raise HTTPException(404, "Agent not found")
    return {"agent": agent_store[agent_id]}


@app.put("/v1/workshop/agents/{agent_id}")
async def update_agent(agent_id: str, config: AgentConfig):
    if agent_id not in agent_store:
        raise HTTPException(404, "Agent not found")
    agent_store[agent_id].update(config.model_dump())
    return {"agent": agent_store[agent_id]}


@app.delete("/v1/workshop/agents/{agent_id}")
async def delete_agent(agent_id: str):
    if agent_id not in agent_store:
        raise HTTPException(404, "Agent not found")
    del agent_store[agent_id]
    return {"deleted": True}


@app.get("/v1/workshop/agents/{agent_id}/sub-agents")
async def list_sub_agents(agent_id: str):
    subs = [a for a in agent_store.values() if a.get("parent_agent_id") == agent_id]
    return {"sub_agents": subs}


@app.post("/v1/workshop/agents/{agent_id}/sub-agents")
async def create_sub_agent(agent_id: str, config: AgentConfig):
    if agent_id not in agent_store:
        raise HTTPException(404, "Parent agent not found")

    parent = agent_store[agent_id]
    config.parent_agent_id = agent_id

    allowed_tools = set(parent.get("tool_permissions", []))
    config.tool_permissions = [t for t in config.tool_permissions if t in allowed_tools]

    return await create_agent(config)


@app.get("/v1/workshop/agents/{agent_id}/export")
async def export_agent(agent_id: str):
    if agent_id not in agent_store:
        raise HTTPException(404, "Agent not found")
    agent = agent_store[agent_id]
    subs = [a for a in agent_store.values() if a.get("parent_agent_id") == agent_id]
    return {"agent": agent, "sub_agents": subs, "export_version": "1.0"}


@app.post("/v1/workshop/agents/import")
async def import_agent(request: Request):
    data = await request.json()
    agent_data = data.get("agent", {})
    agent_id = str(uuid.uuid4())
    agent_data["id"] = agent_id
    agent_data["created_at"] = time.time()
    agent_store[agent_id] = agent_data

    for sub in data.get("sub_agents", []):
        sub_id = str(uuid.uuid4())
        sub["id"] = sub_id
        sub["parent_agent_id"] = agent_id
        sub["created_at"] = time.time()
        agent_store[sub_id] = sub

    return {"agent_id": agent_id, "imported": True}


BUILTIN_TEMPLATES = [
    {
        "name": "Research Assistant",
        "description": "Web search and summarization agent with safe defaults",
        "config": {
            "name": "Research Assistant",
            "role": "researcher",
            "system_instructions": "You are a research assistant. Search the web, summarize findings, and cite sources.",
            "model": "kolb-bot",
            "skills": ["web-search"],
            "tool_permissions": ["web_search", "read_file"],
            "memory_enabled": True,
            "integrations": [],
            "safe_mode": True,
        },
    },
    {
        "name": "Code Navigator",
        "description": "Reads and explains codebases without making changes",
        "config": {
            "name": "Code Navigator",
            "role": "code-reader",
            "system_instructions": "You help navigate and understand code. Read files, search for patterns, explain architecture. Do not modify files.",
            "model": "kolb-bot",
            "skills": ["coding-agent"],
            "tool_permissions": ["read_file", "list_files", "search"],
            "memory_enabled": False,
            "integrations": [],
            "safe_mode": True,
        },
    },
    {
        "name": "Pirate Quartermaster",
        "description": "Task planning and delegation agent with pirate flair",
        "config": {
            "name": "Pirate Quartermaster",
            "role": "planner",
            "system_instructions": "Ye be the Quartermaster! Plan tasks, delegate to sub-agents, track progress. Speak with nautical flair but stay precise.",
            "model": "kolb-bot",
            "skills": [],
            "tool_permissions": ["read_file", "list_files"],
            "memory_enabled": True,
            "integrations": [],
            "safe_mode": True,
        },
    },
]


@app.get("/v1/workshop/templates")
async def list_templates():
    return {"templates": BUILTIN_TEMPLATES}


# ---------------------------------------------------------------------------
# Providers: manage CLIs, APIs, and connections
# ---------------------------------------------------------------------------

@app.get("/v1/providers")
async def api_list_providers():
    return {"providers": prov.list_providers()}


@app.get("/v1/providers/quick-add")
async def api_quick_add_list():
    """Pre-built provider configs for one-click setup."""
    return {"providers": prov.QUICK_ADD_PROVIDERS}


@app.post("/v1/providers")
async def api_add_provider(request: Request):
    data = await request.json()
    p = prov.add_provider(data)
    add_memory({"source": "providers", "content": f"Added provider: {p.name} ({p.type})"})
    return {"provider": p.to_dict()}


@app.put("/v1/providers/{provider_id}")
async def api_update_provider(provider_id: str, request: Request):
    data = await request.json()
    p = prov.update_provider(provider_id, data)
    if not p:
        raise HTTPException(404, "Provider not found")
    return {"provider": p.to_dict()}


@app.delete("/v1/providers/{provider_id}")
async def api_delete_provider(provider_id: str):
    if not prov.delete_provider(provider_id):
        raise HTTPException(400, "Cannot delete this provider")
    return {"deleted": True}


@app.get("/v1/providers/{provider_id}/models")
async def api_provider_models(provider_id: str):
    models = await prov.provider_list_models(provider_id)
    return {"models": models}


@app.post("/v1/providers/{provider_id}/test")
async def api_test_provider(provider_id: str):
    """Send a test message to verify the provider works."""
    try:
        result = await prov.provider_chat(
            provider_id,
            [{"role": "user", "content": "Say 'Provider connected!' in 5 words or less."}],
            stream=False,
        )
        content = result["choices"][0]["message"]["content"]
        return {"status": "ok", "response": content}
    except Exception as e:
        return {"status": "error", "error": str(e)}


# ---------------------------------------------------------------------------
# Telemetry WebSocket (Pirate Ship dashboard)
# ---------------------------------------------------------------------------

@app.websocket("/v1/telemetry/ws")
async def telemetry_ws(ws: WebSocket):
    await ws.accept()
    queue: asyncio.Queue = asyncio.Queue(maxsize=256)
    telemetry_subscribers.add(queue)
    try:
        while True:
            event = await queue.get()
            await ws.send_json(event)
    except WebSocketDisconnect:
        pass
    finally:
        telemetry_subscribers.discard(queue)


# ---------------------------------------------------------------------------
# Live Memory API
# ---------------------------------------------------------------------------

@app.get("/v1/memory")
async def get_memory(limit: int = 50):
    return {"entries": memory_log[-limit:], "total": len(memory_log)}


@app.post("/v1/memory")
async def write_memory(request: Request):
    data = await request.json()
    add_memory({
        "source": data.get("source", "user"),
        "content": data.get("content", ""),
    })
    return {"written": True}


@app.delete("/v1/memory")
async def clear_memory():
    memory_log.clear()
    return {"cleared": True}
