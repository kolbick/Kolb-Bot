# Kolb Terminal

Kolb Terminal is this stack's terminal service: a from-source build of the
MIT-licensed **Open Terminal** project (`open-webui/open-terminal`,
pinned to `v0.11.34`), branded "Kolb Terminal" in this application's UI
while preserving Open Terminal's copyright and MIT license notice inside the
image (`/app/LICENSE`). It stays protocol-compatible with the application's
built-in terminal integration (`TERMINAL_SERVER_CONNECTIONS` →
`/api/v1/terminals` proxy).

**On by default.** `.env.example` ships with `COMPOSE_PROFILES=terminal`
and `TERMINAL_ENABLED=true`, so a fresh `docker compose up -d --build` gives
every user a working, isolated terminal with no extra configuration beyond
setting `TERMINAL_API_KEY`.

## Per-user isolation

Kolb Terminal runs with `OPEN_TERMINAL_MULTI_USER=true` by default. Each
distinct Kolb-Bot user — identified by the `X-User-Id` header the app's
terminal proxy (`backend/open_webui/routers/terminals.py`) already sends on
every request and WebSocket connection — gets a dedicated Linux account and
home directory (`/home/<derived-username>`) inside the container the first
time they open a terminal. Files, commands, and processes are isolated
between users by standard Unix file permissions (`chmod 2770` on each home
directory); nobody can read or write another user's files.

**Read this before relying on it for anything sensitive:** this is
upstream's *single-container* multi-user mode. All users still share the
same kernel, network namespace, and system resources — there is no hard
security boundary between them the way there would be between separate
containers. Upstream's own words: *"This mode exists as a lightweight
convenience for small, trusted groups — not as a security model you should
rely on."* That matches this deployment's own scale limit (≤ 50 users), but
if you outgrow "small, trusted group," see **Stronger isolation** below.

Disable multi-user mode with `TERMINAL_MULTI_USER=false` in `.env` if you'd
rather have one shared terminal workspace for everyone instead.

## Stronger isolation: container-per-user

For real container-level isolation — a separate Open Terminal container per
user, not just a separate Linux account inside one container — upstream
publishes a companion orchestrator: **`open-webui/terminals`**. It exposes
the `policies`/`lifecycle`/`refresh` API that this app's backend already
knows how to talk to (`backend/open_webui/routers/configs.py`,
`server_type: "orchestrator"`); the connection type is auto-detected when
you point a terminal connection at an orchestrator's URL instead of a plain
Open Terminal's.

This is **not** wired into the default stack: the orchestrator needs its own
access to Docker (to spin up per-user containers), which is a materially
bigger security footprint than anything else in this stack — it's the kind
of Docker-socket exposure this project avoids by default (see
docs/SECURITY.md). It's early-stage software (v0.0.x at last check) and
would need its own evaluation before being added here. If you want it, the
integration point is: build/run the orchestrator wherever you're comfortable
giving it Docker access, then add it as a terminal connection in Admin
Settings — the app already supports both connection types side by side.

## How it is wired

- Built from source via `docker compose --profile terminal build` (never a
  prebuilt image).
- Attached only to the `kolb-bot-internal` network; **no published ports**.
  Users reach it exclusively through Kolb-Bot's authenticated proxy, which
  attaches the server-side `TERMINAL_API_KEY` (`auth_type: bearer`).
- Dedicated persistent volume `kolb-terminal-data`, mounted at `/home` (where
  every user's home directory lives).
- Health-checked (`/health`, unauthenticated); the main app tolerates the
  service being down — terminal features degrade, chat continues.
- Appears in the UI as "Kolb Terminal" via the connection name in
  `TERMINAL_SERVER_CONNECTIONS` (set from `TERMINAL_DISPLAY_NAME`).

## Enable / disable without rebuilding

```bash
# .env
COMPOSE_PROFILES=terminal   # remove entirely to stop building/running it
TERMINAL_ENABLED=true       # in-app connection toggle (service can stay up)
```

Then `docker compose up -d --remove-orphans`.

## Security consequences of weakening the defaults

- **Multi-user mode trades some isolation for convenience** — see above.
  Don't use it as a substitute for real access control on who gets a Kolb-Bot
  account in the first place.
- **Docker isolation (the container boundary) is still the default and
  should stay that way.** Host-level execution means every Kolb-Bot user
  with terminal access effectively has a shell on the PC itself. Only opt
  into that deliberately, and document it here if you do.
- **Do not mount the Docker socket.** A terminal with the socket is root on
  the host. (The image ships the Docker CLI for users who explicitly mount
  the socket themselves; it is not mounted here.)
- **Host bind mounts** expose those paths — and everything reachable through
  them — to every user with terminal access. Mount specific, dedicated
  directories only, and prefer read-only.
- **Never publish the terminal port.** Anyone who reaches it with the API
  key has code execution across every provisioned user account.
- The API key must never appear in client JavaScript, committed files, or
  public environment output. Rotate it if in doubt.
