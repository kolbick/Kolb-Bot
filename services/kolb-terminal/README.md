# Kolb Terminal service

Kolb Terminal is this stack's terminal service: a from-source build of the
MIT-licensed **Open Terminal** project (`open-webui/open-terminal`, pinned
to `v0.11.34` by default via `TERMINAL_SOURCE_REF`), presented inside
Kolb-Bot as "Kolb Terminal" while retaining Open Terminal's copyright and
license notice (`/app/LICENSE` in the built image).

Runs with per-user isolation on by default (`OPEN_TERMINAL_MULTI_USER=true`):
each Kolb-Bot user gets their own Linux account and home directory inside
the container, keyed by the `X-User-Id` header the app's terminal proxy
already sends. See `docs/OPEN_TERMINAL.md` for what that isolation does and
doesn't guarantee, and for the stronger container-per-user option
(`open-webui/terminals`) if you outgrow it.

The full (non-slim) upstream image is used deliberately: multi-user mode
needs `useradd`/`sudo`, which the slim/alpine variants omit.

## Security posture

- The service is attached only to the `kolb-bot-internal` network; no host
  port is published. Users reach it exclusively through Kolb-Bot's
  authenticated `/api/v1/terminals` proxy.
- `TERMINAL_API_KEY` (mapped to the image's `OPEN_TERMINAL_API_KEY`) lives
  only in server-side environment (`.env`, never committed). It must never
  appear in client JavaScript or public output.
- Docker isolation by default with a dedicated volume (`kolb-terminal-data`,
  mounted at `/home`). No Docker socket, no host mounts by default.
- Disable at any time by removing `terminal` from `COMPOSE_PROFILES` and/or
  setting `TERMINAL_ENABLED=false` — no rebuild required. The main app
  tolerates the service being absent.
