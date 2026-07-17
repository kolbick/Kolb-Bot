# Kolb Terminal service

Kolb Terminal is this stack's terminal service: a from-source build of the
MIT-licensed **Open Terminal** project, presented inside Kolb-Bot as
"Kolb Terminal" while retaining Open Terminal's copyright and license notice.

## Status: build must be verified on first deploy

This directory was authored in an environment without network access to the
upstream Open Terminal repository. Before first use:

1. Confirm the upstream clone URL in `Dockerfile` and pin
   `TERMINAL_SOURCE_REF` (in `.env`) to a specific release tag or commit.
2. Confirm the install and start commands match the upstream project layout
   and adjust the `RUN pip install ...` / `CMD` lines if needed.
3. Confirm the health endpoint path used by the `HEALTHCHECK` and
   `docker-compose.yml`.
4. Record the pinned tag/commit in `docs/UPSTREAM.md`.

This is tracked as an unfinished item in `docs/OPEN_TERMINAL.md`.

## Security posture (do not weaken casually)

- The service is attached only to the `kolb-bot-internal` network; no host
  port is published. Users reach it exclusively through Kolb-Bot's
  authenticated `/api/v1/terminals` proxy.
- `TERMINAL_API_KEY` lives only in server-side environment (`.env`, never
  committed). It must never appear in client JavaScript or public output.
- Execution is Docker-isolated by default with its own volume
  (`kolb-terminal-data`). Host-level execution or host bind mounts are an
  explicit, documented opt-in — see `docs/OPEN_TERMINAL.md` for the
  consequences before adding any.
- The Docker socket is not mounted, and must not be mounted by default.
- Disable terminal access at any time by removing `terminal` from
  `COMPOSE_PROFILES` and setting `TERMINAL_ENABLED=false` — no rebuild
  required. The main app tolerates the service being absent.
