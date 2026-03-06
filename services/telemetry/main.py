"""
Kolb-Bot Telemetry Service: collects real-time agent events from the gateway
and exposes them to the Pirate Ship dashboard via WebSocket + REST.

Events are mapped to nautical metaphors:
  - agent.task_started    → "Setting sail"
  - agent.tool_call       → "Hoisting sails" / activity on deck
  - agent.thinking        → "Plotting course"
  - agent.error           → "Storm warning"
  - agent.task_completed  → "Port reached"
"""

from __future__ import annotations

import asyncio
import json
import os
import time
from collections import deque
from contextlib import asynccontextmanager
from typing import Any

import websockets
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

GATEWAY_URL = os.environ.get("KOLB_BOT_GATEWAY_URL", "ws://kolbbot-api:18789")
GATEWAY_TOKEN = os.environ.get("KOLB_BOT_GATEWAY_TOKEN", "")

subscribers: set[asyncio.Queue] = set()
event_log: deque[dict] = deque(maxlen=500)
crew_state: dict[str, dict] = {}


def event_to_nautical(event: dict) -> dict:
    """Map raw gateway events to Pirate Ship metaphors."""
    method = event.get("method", "")
    params = event.get("params", {})
    ts = params.get("timestamp", time.time())
    agent_id = params.get("agent_id", params.get("node", "captain"))
    agent_name = params.get("agent_name", params.get("name", agent_id))

    mapping = {
        "agent.task_started": {
            "activity": "setting_sail",
            "deck_status": "Preparing to leave port",
            "icon": "anchor",
        },
        "node.invoke": {
            "activity": "plotting_course",
            "deck_status": "Consulting the charts",
            "icon": "compass",
        },
        "agent.thinking": {
            "activity": "plotting_course",
            "deck_status": "Captain is thinking",
            "icon": "compass",
        },
        "agent.tool_call": {
            "activity": "hoisting_sails",
            "deck_status": f"Working with tool: {params.get('tool', 'unknown')}",
            "icon": "wrench",
        },
        "agent.tool_result": {
            "activity": "deck_work",
            "deck_status": "Processing tool results",
            "icon": "gear",
        },
        "agent.error": {
            "activity": "storm_warning",
            "deck_status": f"Storm: {params.get('error', 'unknown error')}",
            "icon": "warning",
        },
        "agent.task_completed": {
            "activity": "port_reached",
            "deck_status": "Mission complete, docking",
            "icon": "flag",
        },
        "workshop.agent_created": {
            "activity": "new_crew_member",
            "deck_status": f"Welcome aboard: {agent_name}",
            "icon": "person_add",
        },
    }

    meta = mapping.get(method, {
        "activity": "on_deck",
        "deck_status": method,
        "icon": "boat",
    })

    crew_member = {
        "id": agent_id,
        "name": agent_name,
        "role": params.get("role", "sailor"),
        "status": meta["activity"],
        "current_task": meta["deck_status"],
        "icon": meta["icon"],
        "last_update": ts,
    }
    crew_state[agent_id] = crew_member

    return {
        "type": "pirate_ship_event",
        "timestamp": ts,
        "crew_member": crew_member,
        "raw_method": method,
        "raw_params": params,
        "cargo_queue_size": len([c for c in crew_state.values() if c["status"] not in ("port_reached", "idle")]),
        "storm_warnings": [
            c for c in crew_state.values() if c["status"] == "storm_warning"
        ],
    }


def broadcast(event: dict):
    for q in list(subscribers):
        try:
            q.put_nowait(event)
        except asyncio.QueueFull:
            pass


async def _gateway_listener():
    while True:
        try:
            headers = {}
            if GATEWAY_TOKEN:
                headers["Authorization"] = f"Bearer {GATEWAY_TOKEN}"
            async with websockets.connect(
                GATEWAY_URL,
                additional_headers=headers,
                ping_interval=20,
            ) as ws:
                async for raw in ws:
                    data = json.loads(raw)
                    if "method" in data and not data.get("id"):
                        nautical = event_to_nautical(data)
                        event_log.append(nautical)
                        broadcast(nautical)
        except Exception:
            await asyncio.sleep(3)


@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(_gateway_listener())
    yield
    task.cancel()


app = FastAPI(title="Kolb-Bot Telemetry", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "kolbbot-telemetry"}


@app.get("/v1/pirate-ship/crew")
async def get_crew():
    """Current state of all crew members (agents)."""
    return {
        "crew": list(crew_state.values()),
        "total": len(crew_state),
        "active": len([c for c in crew_state.values() if c["status"] not in ("port_reached", "idle")]),
    }


@app.get("/v1/pirate-ship/cargo")
async def get_cargo():
    """Task queue as cargo manifest."""
    active = [c for c in crew_state.values() if c["status"] not in ("port_reached", "idle")]
    return {
        "manifest": [
            {
                "crew_member": c["name"],
                "task": c["current_task"],
                "status": c["status"],
            }
            for c in active
        ],
        "total_cargo": len(active),
    }


@app.get("/v1/pirate-ship/storms")
async def get_storms():
    """Active error/storm warnings with drill-down."""
    storms = [e for e in event_log if e.get("raw_method") == "agent.error"]
    return {
        "storms": storms[-20:],
        "total": len(storms),
        "suggested_fixes": [
            {
                "storm": s.get("raw_params", {}).get("error", "unknown"),
                "suggestion": "Check agent logs and retry the failed operation",
            }
            for s in storms[-5:]
        ],
    }


@app.get("/v1/pirate-ship/log")
async def get_event_log(limit: int = 50):
    """Recent event log."""
    return {"events": list(event_log)[-limit:]}


@app.websocket("/v1/pirate-ship/ws")
async def pirate_ship_ws(ws: WebSocket):
    """Real-time WebSocket feed for the Pirate Ship dashboard."""
    await ws.accept()

    await ws.send_json({
        "type": "initial_state",
        "crew": list(crew_state.values()),
        "recent_events": list(event_log)[-20:],
    })

    queue: asyncio.Queue = asyncio.Queue(maxsize=256)
    subscribers.add(queue)
    try:
        while True:
            event = await queue.get()
            await ws.send_json(event)
    except WebSocketDisconnect:
        pass
    finally:
        subscribers.discard(queue)
