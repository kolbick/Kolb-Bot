"""
Provider registry: route requests through CLIs, APIs, or the native gateway.

Supported provider types:
  - "gateway"   — Kolb-Bot's own gateway (default)
  - "openai"    — Any OpenAI-compatible API (OpenAI, Groq, Together, OpenRouter, etc.)
  - "anthropic" — Anthropic Claude API
  - "gemini"    — Google Gemini API
  - "ollama"    — Local Ollama instance
  - "cli"       — Any CLI tool (codex, gemini, claude, aider, etc.)
"""

from __future__ import annotations

import asyncio
import json
import os
import shutil
import time
import uuid
from dataclasses import dataclass, field, asdict
from typing import AsyncGenerator

import httpx

PROVIDERS_FILE = os.environ.get("PROVIDERS_FILE", "/data/providers.json")

@dataclass
class Provider:
    id: str
    name: str
    type: str  # gateway | openai | anthropic | gemini | ollama | cli
    enabled: bool = True

    # API providers
    api_base: str = ""
    api_key: str = ""
    default_model: str = ""

    # CLI providers
    cli_command: str = ""  # e.g. "codex", "gemini", "claude"
    cli_args: list[str] = field(default_factory=list)
    cli_env: dict[str, str] = field(default_factory=dict)

    def to_dict(self) -> dict:
        d = asdict(self)
        # Mask API key in responses
        if d.get("api_key"):
            d["api_key"] = d["api_key"][:8] + "..." if len(d["api_key"]) > 8 else "***"
        return d

    def to_dict_full(self) -> dict:
        return asdict(self)


# In-memory store, persisted to JSON file
_providers: dict[str, Provider] = {}


def _load_providers():
    global _providers
    if os.path.exists(PROVIDERS_FILE):
        try:
            with open(PROVIDERS_FILE) as f:
                data = json.load(f)
            for p in data:
                _providers[p["id"]] = Provider(**p)
        except Exception:
            pass

    # Always have the gateway provider
    if "gateway" not in _providers:
        _providers["gateway"] = Provider(
            id="gateway",
            name="Kolb-Bot Gateway",
            type="gateway",
            enabled=True,
        )


def _save_providers():
    os.makedirs(os.path.dirname(PROVIDERS_FILE) or ".", exist_ok=True)
    with open(PROVIDERS_FILE, "w") as f:
        json.dump([p.to_dict_full() for p in _providers.values()], f, indent=2)


def init_providers():
    _load_providers()


def list_providers() -> list[dict]:
    return [p.to_dict() for p in _providers.values()]


def get_provider(provider_id: str) -> Provider | None:
    return _providers.get(provider_id)


def add_provider(data: dict) -> Provider:
    pid = data.get("id") or str(uuid.uuid4())[:8]
    p = Provider(
        id=pid,
        name=data.get("name", pid),
        type=data.get("type", "openai"),
        enabled=data.get("enabled", True),
        api_base=data.get("api_base", ""),
        api_key=data.get("api_key", ""),
        default_model=data.get("default_model", ""),
        cli_command=data.get("cli_command", ""),
        cli_args=data.get("cli_args", []),
        cli_env=data.get("cli_env", {}),
    )
    _providers[pid] = p
    _save_providers()
    return p


def update_provider(pid: str, data: dict) -> Provider | None:
    p = _providers.get(pid)
    if not p:
        return None
    for k, v in data.items():
        if hasattr(p, k) and k != "id":
            setattr(p, k, v)
    _save_providers()
    return p


def delete_provider(pid: str) -> bool:
    if pid == "gateway":
        return False
    if pid in _providers:
        del _providers[pid]
        _save_providers()
        return True
    return False


# ---------------------------------------------------------------------------
# Provider execution
# ---------------------------------------------------------------------------

async def provider_chat(
    provider_id: str,
    messages: list[dict],
    model: str | None = None,
    stream: bool = False,
    temperature: float = 0.7,
) -> dict | AsyncGenerator[str, None]:
    """Route a chat request to the appropriate provider."""
    p = _providers.get(provider_id)
    if not p:
        raise ValueError(f"Provider not found: {provider_id}")

    if p.type == "openai":
        return await _chat_openai_compat(p, messages, model, stream, temperature)
    elif p.type == "anthropic":
        return await _chat_anthropic(p, messages, model, stream, temperature)
    elif p.type == "gemini":
        return await _chat_gemini(p, messages, model, stream, temperature)
    elif p.type == "ollama":
        return await _chat_openai_compat(p, messages, model, stream, temperature)
    elif p.type == "cli":
        return await _chat_cli(p, messages, model)
    else:
        raise ValueError(f"Unknown provider type: {p.type}")


async def provider_list_models(provider_id: str) -> list[dict]:
    """List models available from a provider."""
    p = _providers.get(provider_id)
    if not p:
        return []

    if p.type in ("openai", "ollama"):
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                headers = {}
                if p.api_key:
                    headers["Authorization"] = f"Bearer {p.api_key}"
                r = await client.get(f"{p.api_base}/models", headers=headers)
                data = r.json()
                return [
                    {"id": f"{p.id}:{m['id']}", "name": m.get("id", ""), "provider": p.name}
                    for m in data.get("data", data.get("models", []))
                ]
        except Exception:
            return []

    elif p.type == "anthropic":
        return [
            {"id": f"{p.id}:claude-sonnet-4-20250514", "name": "Claude Sonnet 4", "provider": p.name},
            {"id": f"{p.id}:claude-3-5-haiku-20241022", "name": "Claude 3.5 Haiku", "provider": p.name},
            {"id": f"{p.id}:claude-3-5-sonnet-20241022", "name": "Claude 3.5 Sonnet", "provider": p.name},
        ]

    elif p.type == "gemini":
        return [
            {"id": f"{p.id}:gemini-2.5-flash", "name": "Gemini 2.5 Flash", "provider": p.name},
            {"id": f"{p.id}:gemini-2.5-pro", "name": "Gemini 2.5 Pro", "provider": p.name},
            {"id": f"{p.id}:gemini-2.0-flash-lite", "name": "Gemini 2.0 Flash Lite", "provider": p.name},
        ]

    elif p.type == "cli":
        cmd = p.cli_command
        return [{"id": f"{p.id}:default", "name": f"{cmd} (CLI)", "provider": p.name}]

    return []


# ---------------------------------------------------------------------------
# Provider backends
# ---------------------------------------------------------------------------

async def _chat_openai_compat(
    p: Provider, messages: list[dict], model: str | None,
    stream: bool, temperature: float,
) -> dict:
    """OpenAI-compatible API (works for OpenAI, Groq, Together, OpenRouter, Ollama)."""
    use_model = model or p.default_model or "gpt-4o-mini"
    headers = {"Content-Type": "application/json"}
    if p.api_key:
        headers["Authorization"] = f"Bearer {p.api_key}"

    body = {
        "model": use_model,
        "messages": messages,
        "temperature": temperature,
        "stream": False,
    }

    async with httpx.AsyncClient(timeout=120) as client:
        r = await client.post(f"{p.api_base}/chat/completions", json=body, headers=headers)
        r.raise_for_status()
        return r.json()


async def _chat_anthropic(
    p: Provider, messages: list[dict], model: str | None,
    stream: bool, temperature: float,
) -> dict:
    """Anthropic Messages API."""
    use_model = model or p.default_model or "claude-sonnet-4-20250514"

    system_msg = ""
    chat_messages = []
    for m in messages:
        if m["role"] == "system":
            system_msg += (m.get("content") or "") + "\n"
        else:
            chat_messages.append({"role": m["role"], "content": m.get("content") or ""})

    body: dict = {
        "model": use_model,
        "messages": chat_messages,
        "max_tokens": 4096,
        "temperature": temperature,
    }
    if system_msg.strip():
        body["system"] = system_msg.strip()

    headers = {
        "Content-Type": "application/json",
        "x-api-key": p.api_key,
        "anthropic-version": "2023-06-01",
    }

    async with httpx.AsyncClient(timeout=120) as client:
        r = await client.post("https://api.anthropic.com/v1/messages", json=body, headers=headers)
        r.raise_for_status()
        data = r.json()

    content = ""
    for block in data.get("content", []):
        if block.get("type") == "text":
            content += block.get("text", "")

    return {
        "choices": [{"message": {"role": "assistant", "content": content}, "finish_reason": "stop"}],
        "model": use_model,
    }


async def _chat_gemini(
    p: Provider, messages: list[dict], model: str | None,
    stream: bool, temperature: float,
) -> dict:
    """Google Gemini API."""
    use_model = model or p.default_model or "gemini-2.0-flash"

    system_instruction = ""
    contents = []
    for m in messages:
        if m["role"] == "system":
            system_instruction += (m.get("content") or "") + "\n"
        else:
            role = "user" if m["role"] == "user" else "model"
            contents.append({"role": role, "parts": [{"text": m.get("content") or ""}]})

    body: dict = {
        "contents": contents,
        "generationConfig": {"temperature": temperature, "maxOutputTokens": 4096},
    }
    if system_instruction.strip():
        body["system_instruction"] = {"parts": [{"text": system_instruction.strip()}]}

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{use_model}:generateContent?key={p.api_key}"

    async with httpx.AsyncClient(timeout=120) as client:
        r = await client.post(url, json=body)
        r.raise_for_status()
        data = r.json()

    content = ""
    for candidate in data.get("candidates", []):
        for part in candidate.get("content", {}).get("parts", []):
            content += part.get("text", "")

    return {
        "choices": [{"message": {"role": "assistant", "content": content}, "finish_reason": "stop"}],
        "model": use_model,
    }


async def _chat_cli(
    p: Provider, messages: list[dict], model: str | None,
) -> dict:
    """Run a CLI tool with the last user message as input."""
    cmd = p.cli_command
    if not cmd:
        raise ValueError("CLI provider has no command configured")

    if not shutil.which(cmd):
        raise ValueError(f"CLI tool not found in PATH: {cmd}")

    user_msg = ""
    for m in reversed(messages):
        if m["role"] == "user":
            user_msg = m.get("content") or ""
            break

    args = [cmd] + list(p.cli_args)
    env = {**os.environ, **p.cli_env}

    # Common CLI patterns
    if cmd in ("codex", "openai"):
        if "codex" in cmd:
            args = [cmd, "--quiet", "-m", model or p.default_model or "o4-mini", user_msg]
        else:
            args = [cmd, "api", "chat.completions.create",
                    "-m", model or p.default_model or "gpt-4o-mini",
                    "-g", "user", user_msg]
    elif cmd in ("gemini",):
        args = [cmd, "-p", user_msg]
    elif cmd in ("claude",):
        args = [cmd, "-p", user_msg, "--no-input"]
    elif cmd in ("aider",):
        args = [cmd, "--message", user_msg, "--yes", "--no-git"]
    else:
        args.append(user_msg)

    try:
        proc = await asyncio.create_subprocess_exec(
            *args,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            env=env,
        )
        stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=300)
        output = stdout.decode("utf-8", errors="replace").strip()
        if not output and stderr:
            output = f"(stderr) {stderr.decode('utf-8', errors='replace').strip()}"
    except asyncio.TimeoutError:
        output = "CLI command timed out after 5 minutes"
    except Exception as e:
        output = f"CLI error: {e}"

    return {
        "choices": [{"message": {"role": "assistant", "content": output}, "finish_reason": "stop"}],
        "model": f"{cmd}-cli",
    }


# Pre-built provider configs for quick setup
QUICK_ADD_PROVIDERS = [
    {
        "id": "openai",
        "name": "OpenAI",
        "type": "openai",
        "api_base": "https://api.openai.com/v1",
        "default_model": "gpt-4o-mini",
        "needs": ["api_key"],
    },
    {
        "id": "anthropic",
        "name": "Anthropic Claude",
        "type": "anthropic",
        "api_base": "https://api.anthropic.com",
        "default_model": "claude-sonnet-4-20250514",
        "needs": ["api_key"],
    },
    {
        "id": "gemini",
        "name": "Google Gemini",
        "type": "gemini",
        "api_base": "https://generativelanguage.googleapis.com",
        "default_model": "gemini-2.0-flash",
        "needs": ["api_key"],
    },
    {
        "id": "ollama",
        "name": "Ollama (local)",
        "type": "ollama",
        "api_base": "http://host.docker.internal:11434/v1",
        "default_model": "llama3.2",
        "needs": [],
    },
    {
        "id": "groq",
        "name": "Groq",
        "type": "openai",
        "api_base": "https://api.groq.com/openai/v1",
        "default_model": "llama-3.3-70b-versatile",
        "needs": ["api_key"],
    },
    {
        "id": "openrouter",
        "name": "OpenRouter",
        "type": "openai",
        "api_base": "https://openrouter.ai/api/v1",
        "default_model": "anthropic/claude-sonnet-4",
        "needs": ["api_key"],
    },
    {
        "id": "codex-cli",
        "name": "Codex CLI",
        "type": "cli",
        "cli_command": "codex",
        "default_model": "o4-mini",
        "needs": ["OPENAI_API_KEY in env"],
    },
    {
        "id": "claude-cli",
        "name": "Claude CLI",
        "type": "cli",
        "cli_command": "claude",
        "default_model": "claude-sonnet-4-20250514",
        "needs": ["ANTHROPIC_API_KEY in env"],
    },
    {
        "id": "gemini-cli",
        "name": "Gemini CLI",
        "type": "cli",
        "cli_command": "gemini",
        "default_model": "gemini-2.5-pro",
        "needs": ["GEMINI_API_KEY in env"],
    },
    {
        "id": "aider-cli",
        "name": "Aider",
        "type": "cli",
        "cli_command": "aider",
        "default_model": "",
        "needs": ["API key for chosen model in env"],
    },
]
