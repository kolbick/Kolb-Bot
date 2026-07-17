# Architecture

## Overview

Kolb-Bot is a single-container web application derived from Open WebUI
(SvelteKit frontend served by a FastAPI backend), deployed as its own Docker
Compose project behind a host reverse proxy, with an optional isolated
terminal service and an optional connection to a CPTR computer-workspace
gateway running outside the stack.

```
                    HTTPS (kolb-bot.com)
Internet ──────────► reverse proxy (nginx, host)
                        │  127.0.0.1:3101
                        ▼
              ┌──────────────────────┐   kolb-bot-internal network
              │  kolb-bot (app)      │◄────────────────────────────┐
              │  FastAPI + built     │                             │
              │  SvelteKit frontend  │      ┌──────────────────────┴─┐
              │  port 8080 (internal)│      │ kolb-terminal (opt-in) │
              └─────────┬────────────┘      │ Open Terminal build    │
                        │                   │ no published ports     │
              kolb-bot-data volume          └──────────┬─────────────┘
                        │                     kolb-terminal-data volume
                        ▼
               SQLite (default) under /app/backend/data
                        │
                        ▼  host.docker.internal (host-gateway)
              CPTR gateway ("Kolb Computer", optional, host-side)
```

## Components

| Component | Role | Isolation |
| --- | --- | --- |
| `kolb-bot` app | Chat UI, auth, RAG, tools, provider connections | Only service with a (localhost-bound) host port |
| `kolb-terminal` | Terminal/file tools via the app's authenticated `/api/v1/terminals` proxy | Internal network only, own volume, opt-in compose profile |
| CPTR gateway | "Kolb Computer" OpenAI-compatible model endpoint | Runs outside the stack; reached via host-gateway; never proxied publicly |
| Reverse proxy | TLS termination, WebSocket upgrade, rate limiting | Host-managed; certificates never enter images |

## Key paths

- `src/lib/brand.ts`, `backend/open_webui/brand.py` — brand configuration
- `backend/open_webui/` — FastAPI application (upstream package name kept as
  an internal identifier)
- `backend/open_webui/routers/terminals.py` — authenticated terminal proxy;
  the terminal API key never reaches the browser
- `scripts/` — brand, asset, audit, and health tooling
- `services/kolb-terminal/` — terminal image build scaffold
- `docker-compose.yml`, `.env.example`, `deploy/` — deployment

## Data

All application state lives in the `kolb-bot-data` volume
(`/app/backend/data`): SQLite database, uploads, vector DB, caches. Terminal
state lives separately in `kolb-terminal-data`. Neither volume is shared with
any other stack, and both survive container replacement (see
docs/BACKUP_RESTORE.md).
