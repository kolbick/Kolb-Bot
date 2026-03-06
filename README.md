# Kolb-Bot

Your AI pirate crew, running on a Raspberry Pi. Kolb-Bot is a self-hosted AI agent platform with a browser-based UI, real-time agent monitoring, and voice interaction — all managed from a single command.

**Open WebUI pinned to: v0.8.8** (2026-03-02)

## Quick Start

```bash
# Clone and start (one command)
git clone https://github.com/kolbick/Kolb-Bot.git
cd Kolb-Bot
./kolb-bot up
```

This builds and starts all services via Docker Compose. On first run, it auto-generates secrets in `.env`.

**Open the UI:** `http://<your-pi-ip>:3000`

On first visit, create an admin account. You're running.

**Access from another device:** Use your Pi's IP in the browser on your phone, tablet, or another computer. Same Wi‑Fi: `http://<pi-lan-ip>:3000`. Anywhere via Tailscale: `http://<tailscale-ip>:3000` or `http://<hostname>:3000` (e.g. `http://kolbypi5:3000`). Run `./kolb-bot up` or `./kolb-bot help` to see your current IPs. NoVNC (watch the bot browse): `http://<ip>:6080/vnc.html`.

**No terminal experience?** Run `./kolb-bot` with no arguments to open the interactive menu (whiptail). Start/stop services, manage agents and AI providers, and edit API keys without typing commands.

## URLs

| Service     | URL                     | Purpose                               |
| ----------- | ----------------------- | ------------------------------------- |
| Open WebUI  | `http://<pi-ip>:3000`   | Chat, Workshop, Pirate Ship dashboard |
| Gateway API | `ws://localhost:18789`  | Core agent WebSocket API              |
| Bridge API  | `http://localhost:8000` | OpenAI-compatible REST API            |
| Voice       | `http://localhost:8100` | STT/TTS endpoints                     |
| Telemetry   | `ws://localhost:8200`   | Real-time agent event stream          |

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  Open WebUI │────▶│ Kolb-Bot     │────▶│ Kolb-Bot     │
│  (browser)  │     │ Bridge       │     │ Gateway API  │
│  :3000      │     │ :8000        │     │ :18789       │
└──────┬──────┘     └──────────────┘     └──────────────┘
       │
       │  ┌──────────────┐     ┌──────────────┐
       ├─▶│ Voice Service│     │ Telemetry    │
       │  │ :8100        │     │ :8200        │
       │  └──────────────┘     └──────────────┘
       │
       └─▶ Workshop tab, Pirate Ship tab (injected JS)
```

- **Gateway API**: Core agent runtime (Node.js). Manages agents, tool execution, multi-platform messaging.
- **Bridge**: Translates Gateway's WebSocket API → OpenAI-compatible HTTP for Open WebUI. Also serves Workshop agent CRUD and telemetry forwarding.
- **Open WebUI**: Browser UI (v0.8.8) with Kolb-Bot branding, Workshop tab, and Pirate Ship tab.
- **Voice**: Whisper STT + Edge TTS with full-duplex WebSocket for barge-in.
- **Telemetry**: Collects gateway events and maps them to nautical metaphors for the Pirate Ship dashboard.

## AI Providers

The bridge can route chat to multiple backends. Configured providers are stored in the bridge data volume and survive restarts.

| Provider         | Type    | Purpose                      |
| ---------------- | ------- | ---------------------------- |
| Kolb-Bot Gateway | gateway | Built-in agent runtime       |
| OpenAI           | API     | GPT-4o-mini, etc.            |
| Anthropic Claude | API     | Claude Sonnet/Haiku          |
| Google Gemini    | API     | Gemini 2.5 Flash/Pro         |
| OpenRouter       | API     | Many models via one key      |
| Ollama           | API     | Local models (e.g. llama3.2) |
| Claude CLI       | CLI     | Host-installed `claude`      |
| Codex CLI        | CLI     | Host-installed `codex`       |
| Gemini CLI       | CLI     | Host-installed `gemini`      |

**Manage providers:** Use the interactive menu (`./kolb-bot` → Manage AI providers) or:

```bash
./kolb-bot provider list
./kolb-bot provider add <id> <type> <url_or_cmd> [key]
./kolb-bot provider test <id>
```

API keys live in `.env` (e.g. `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`). Edit via the menu (Settings) or directly.

## CLI Reference

```bash
# Interactive menu (recommended if you prefer not to type commands)
./kolb-bot              # Opens menu — start/stop, agents, providers, settings
./kolb-bot menu         # Same

# Lifecycle
./kolb-bot up              # Start everything
./kolb-bot down            # Stop everything
./kolb-bot restart         # Restart all services
./kolb-bot status          # Show container status
./kolb-bot logs [service]  # Tail logs
./kolb-bot health          # Health check all services

# Agent management
./kolb-bot agent list
./kolb-bot agent create "Research Bot" researcher
./kolb-bot agent delete <agent-id>
./kolb-bot agent export <agent-id>
./kolb-bot agent import agent.json
./kolb-bot agent templates

# Provider management
./kolb-bot provider list     # Show AI providers
./kolb-bot provider quick    # Quick-add options
./kolb-bot provider add      # Add OpenAI, Claude, Ollama, etc.
./kolb-bot provider test <id>

# Features
./kolb-bot voice status    # Voice service health
./kolb-bot pirate          # Pirate Ship status (CLI)
./kolb-bot verify          # Branding verification
./kolb-bot help            # Full usage
```

## Creating Agents in Workshop

1. Open the UI at `http://<pi-ip>:3000`
2. Click **Workshop** in the sidebar
3. Choose a template or click **Create Agent**
4. Fill in: name, role, system instructions, model, skills, tool permissions
5. Toggle **Safe Mode** (on by default — restricts dangerous tools)
6. Click **Create**

### Sub-Agents

From an agent's detail view, click **Add Sub-Agent**. Sub-agents:

- Inherit the parent's constraints
- Cannot exceed the parent's tool permissions
- Have their own role and instructions

### Export/Import

- Export: click the export icon on any agent → downloads JSON
- Import: Workshop → Import Agent → paste JSON

### Skills

Skills are markdown-based instruction sets that teach agents how to approach tasks. They attach to models in Open WebUI's Workspace → Skills tab. Key concepts:

- Skills are **not executable code** — they're guidelines/playbooks
- Attach to models via Workspace → Models → select skills
- Invoke on-demand in chat with `$` mention
- Pre-built skills in `openwebui/skills/`: `safe-defaults`, `agent-template`

## Voice

The voice service enables real-time conversation with Kolb-Bot:

1. **STT**: Whisper (runs locally, no API key needed)
2. **TTS**: Edge TTS (free, high-quality, no API key needed)
3. **Barge-in**: Interrupt the assistant mid-speech by talking

### Enable Voice

Voice starts automatically with `./kolb-bot up`. Configure in `.env`:

```bash
STT_ENGINE=whisper       # or: openai
TTS_ENGINE=edge-tts      # or: openai
WHISPER_MODEL=base       # tiny|base|small|medium|large
```

Open WebUI's built-in audio settings (Admin → Settings → Audio) are pre-configured to use the voice service.

## Pirate Ship Dashboard

The Pirate Ship tab shows what agents are doing in real time, as a crew on a ship:

- **Crew cards**: Each agent is a crew member with role, current task, and status
- **Cargo manifest**: Active task queue
- **Deck activity**: What's happening now (plotting course = thinking, hoisting sails = tool calls, repairs = debugging)
- **Storm warnings**: Errors with drill-down logs and suggested fixes
- **Deck log**: Chronological event stream

All data is real-time via WebSocket from the telemetry service, grounded in actual gateway events (tool calls, model calls, task transitions).

## Security

See [docs/SECURITY.md](docs/SECURITY.md) for the full threat model.

Key defaults:

- **Safe Mode ON**: Risky tools disabled by default
- **No public signup**: `ENABLE_SIGNUP=false`
- **Strong secrets**: Auto-generated on first run
- **Auth on all services**: Gateway token required
- **CORS locked down in production**
- **Tools/Functions are privileged code**: Only install from trusted sources

## Open WebUI Version

Pinned to **v0.8.8** (released 2026-03-02). Key features used:

- Skills (lazy-loaded markdown instruction sets with `view_skill` builtin)
- Native function-calling mode for tools
- Admin Panel → Settings → Audio for STT/TTS configuration
- Workspace tabs: Models, Prompts, Knowledge, Skills, Tools, Notes
- Custom script injection for Workshop and Pirate Ship tabs
- WebSocket support for streaming

## License

MIT — see [LICENSE](LICENSE).
