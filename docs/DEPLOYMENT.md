# Deployment

Kolb-Bot runs on the owner's PC as its own Docker Compose project behind a
reverse proxy that serves `https://kolb-bot.com`.

## First deployment

```bash
git clone <this-repo> kolb-bot && cd kolb-bot
cp .env.example .env
openssl rand -hex 32        # -> WEBUI_SECRET_KEY in .env
docker compose up -d --build
```

The app listens on `127.0.0.1:3101` (configurable via `APP_HOST_PORT`; the
container listens on 8080 internally). Port 3101 must not conflict with any
other stack on the machine.

First visit creates the admin account. Public signup is disabled by default
(`ENABLE_SIGNUP=false`); create further users from the admin panel or approve
explicitly.

## Reverse proxy

Install `deploy/nginx/kolb-bot.conf.example` (adjust paths), which includes
TLS, forwarded headers (`Host`, `X-Real-IP`, `X-Forwarded-For`,
`X-Forwarded-Proto`), WebSocket upgrade, and auth-endpoint rate limiting.
Set `FORWARDED_ALLOW_IPS` in `.env` to the proxy address. TLS certificates
live on the host — never in images.

## Enabling Kolb Terminal

```bash
# in .env
COMPOSE_PROFILES=terminal
TERMINAL_ENABLED=true
TERMINAL_API_KEY=<openssl rand -hex 32>
TERMINAL_SOURCE_REF=<pinned upstream tag>
docker compose up -d --build
```

See docs/OPEN_TERMINAL.md, including the first-deploy verification steps.
Disable at any time by reverting those values (no rebuild needed):
`docker compose up -d --remove-orphans`.

## Enabling Kolb Computer (CPTR)

See docs/CPTR_INTEGRATION.md. CPTR runs outside this stack; the app reaches
it via `host.docker.internal` (the compose file maps the Linux host-gateway).

## Upgrade

```bash
bash scripts/backup.sh            # or the manual steps in BACKUP_RESTORE.md
git pull                          # or apply the synced release branch
docker compose build
docker compose up -d
docker compose logs -f kolb-bot   # watch migrations complete
bash scripts/healthcheck.sh
```

Database migrations run automatically on startup. Data persists in the named
volumes across container replacement.

## Rollback

```bash
git checkout <previous-release-tag-or-commit>
docker compose build && docker compose up -d
```

If the newer version migrated the database schema, restore the pre-upgrade
backup first (docs/BACKUP_RESTORE.md) — schema migrations are not guaranteed
to be backward compatible.

## Operations

- Health: `bash scripts/healthcheck.sh` (app `/health` + container states)
- Logs: `docker compose logs` (json-file driver, rotated at 10 MB × 3)
- Restart policy: `unless-stopped` on all services
