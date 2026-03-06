# Kolb-Bot Architecture

**Open WebUI pinned to: v0.8.8**

## System Overview

Kolb-Bot runs as a Docker Compose stack of five services:

```
                                    ┌────────────────────┐
                                    │   Kolb-Bot Gateway  │
                                    │   (Node.js)         │
                               ┌───▶│   :18789 WebSocket  │
                               │    └────────────────────┘
                               │
┌───────────────┐    ┌─────────┴──────────┐
│   Open WebUI  │───▶│   Kolb-Bot Bridge   │
│   (Svelte)    │    │   (FastAPI/Python)   │
│   :3000       │    │   :8000             │
└───────┬───────┘    └────────────────────┘
        │
        │    ┌────────────────────┐
        ├───▶│   Voice Service    │
        │    │   (FastAPI/Python) │
        │    │   :8100            │
        │    └────────────────────┘
        │
        │    ┌────────────────────┐
        └───▶│   Telemetry Service│
             │   (FastAPI/Python) │
             │   :8200            │
             └────────────────────┘
```

## Service Responsibilities

### kolbbot-api (Gateway)

- Core agent runtime from the Kolb-Bot fork
- WebSocket-based JSON-RPC API on port 18789
- Agent execution, tool dispatch, multi-platform messaging
- Persistent state in Docker volume `kolbbot-data`

### kolbbot-bridge

- Translates Gateway's native WebSocket API → OpenAI-compatible HTTP endpoints
- Open WebUI connects to it as an "OpenAI API" at `http://kolbbot-bridge:8000/v1`
- Exposes Workshop REST API (`/v1/workshop/*`) for agent CRUD
- Forwards gateway events to telemetry subscribers via in-process fanout

Key endpoints:

- `GET /v1/models` — Lists available models
- `POST /v1/chat/completions` — Chat with streaming support
- `GET/POST/PUT/DELETE /v1/workshop/agents/*` — Agent management
- `WS /v1/telemetry/ws` — Real-time event stream

### openwebui

- Official Open WebUI v0.8.8 container
- Configured via environment variables for Kolb-Bot branding
- Custom JavaScript injected for Workshop and Pirate Ship tabs
- Audio settings pointed at the voice service

### kolbbot-voice

- STT via OpenAI Whisper (local, no API key)
- TTS via Edge TTS (free Microsoft service)
- Full-duplex WebSocket at `/v1/voice/stream` for barge-in
- OpenAI-compatible endpoints (`/v1/audio/transcriptions`, `/v1/audio/speech`)

### kolbbot-telemetry

- Subscribes to Gateway WebSocket events
- Maps raw events to nautical metaphors (Pirate Ship theme)
- Maintains crew state (agent → crew member mapping)
- WebSocket feed at `/v1/pirate-ship/ws` for dashboard
- REST endpoints for crew status, cargo manifest, storm warnings

## Open WebUI Integration

### Extension Point Decisions

| Feature          | Extension Used          | Rationale                                                           |
| ---------------- | ----------------------- | ------------------------------------------------------------------- |
| Chat with agents | OpenAI API connection   | Open WebUI natively connects to OpenAI-compat endpoints             |
| Agent Skills     | Open WebUI Skills       | First-class markdown instruction sets, lazy-loaded via `view_skill` |
| Workshop UI      | Custom script injection | No native tab extension point; JS injection is officially supported |
| Pirate Ship UI   | Custom script injection | Same as Workshop                                                    |
| Voice STT        | Admin → Audio config    | Open WebUI supports custom Whisper endpoints                        |
| Voice TTS        | Admin → Audio config    | Open WebUI supports custom TTS endpoints                            |
| Tool permissions | Safe Mode defaults      | Tools/Functions are privileged; safe defaults enforced              |

### Skills vs Tools/Functions/Pipelines

**Skills** (used for agent behavior):

- Markdown instruction sets that teach models how to approach tasks
- Lazy-loaded: only the name+description goes into the system prompt; full content loaded on-demand via `view_skill` tool
- Reusable across models
- Safe: not executable code
- Managed in Open WebUI Workspace → Skills

**Tools** (used for executable capabilities):

- Python scripts that give the LLM abilities (web search, file access, etc.)
- Execute on the server — equivalent to shell access
- Gated by permissions: off by default in Safe Mode
- Managed in Open WebUI Workspace → Tools

**Functions** (used for platform extensions):

- Extend Open WebUI itself (not the LLM)
- Admin-only management
- Used sparingly: only for custom filters or provider adapters

**Pipelines** (not used):

- Separate container for heavy processing
- Not needed: the bridge service handles translation directly

### Branding Customization

Open WebUI branding is applied via:

1. Environment variables: `WEBUI_NAME`, `CUSTOM_NAME`
2. Custom JavaScript injection: Workshop tab, Pirate Ship tab
3. The JS files are served from `openwebui/branding/` and injected on page load

## Real-Time Updates

### Event Flow

```
Gateway (WS events)
    │
    ▼
Bridge service (receives events, broadcasts to subscribers)
    │
    ├──▶ Bridge telemetry WS (/v1/telemetry/ws)
    │
    ▼
Telemetry service (also subscribes to Gateway directly)
    │
    ├──▶ Pirate Ship WS (/v1/pirate-ship/ws)
    │         │
    │         ▼
    │    Dashboard JS (WebSocket client in browser)
    │
    ├──▶ REST endpoints (/v1/pirate-ship/crew, /cargo, /storms)
    │
    └──▶ Event log (in-memory deque, last 500 events)
```

### Transport

- **Gateway → Bridge/Telemetry**: WebSocket (persistent connection with auto-reconnect)
- **Telemetry → Dashboard**: WebSocket (per-client connection)
- **Fallback**: REST polling available for crew/cargo/storms endpoints

### Event Types

| Gateway Event          | Nautical Mapping | Dashboard Display                 |
| ---------------------- | ---------------- | --------------------------------- |
| `agent.task_started`   | Setting sail     | Crew card: active, anchor icon    |
| `agent.thinking`       | Plotting course  | Crew card: compass icon           |
| `agent.tool_call`      | Hoisting sails   | Crew card: wrench icon, tool name |
| `agent.tool_result`    | Deck work        | Crew card: gear icon              |
| `agent.error`          | Storm warning    | Red warning card with drill-down  |
| `agent.task_completed` | Port reached     | Crew card: flag icon              |

## Voice Architecture

### Barge-In Flow

```
User speaks ──▶ WebSocket audio frames ──▶ Voice service
                                              │
                    ┌─────────────────────────┘
                    ▼
              Whisper STT (transcribe)
                    │
                    ▼
              Bridge /v1/chat/completions
                    │
                    ▼
              Response text
                    │
                    ▼
              Edge TTS (stream audio chunks)
                    │
                    ▼
              WebSocket audio frames ──▶ User hears response
```

**Barge-in**: If the user sends new audio while TTS is streaming, the voice service:

1. Sets `barge_in_event`
2. Stops the current TTS stream immediately
3. Processes the new user input
4. Begins a new response cycle

### Configuration

- STT engine: `whisper` (local) or `openai` (API)
- TTS engine: `edge-tts` (free) or `openai` (API)
- Whisper model size: `tiny` → `large` (trade-off: speed vs accuracy)
- Default TTS voice: `en-US-AriaNeural` (configurable via env)

## Security Model

See [SECURITY.md](SECURITY.md) for the full threat model.

Key architectural decisions:

1. All inter-service communication is on the internal Docker network (`kolbbot-net`)
2. Only Open WebUI (:3000) and Gateway (:18789) are exposed to the host
3. Gateway requires token authentication (`KOLB_BOT_GATEWAY_TOKEN`)
4. Bridge validates requests against `BRIDGE_SECRET`
5. Safe Mode restricts tool access by default
6. No default passwords — secrets auto-generated on first run
