# Security

## Default posture

- Public signup disabled; admin-created or explicitly approved users only
  (`ENABLE_SIGNUP=false`, `DEFAULT_USER_ROLE=pending`).
- No default credentials anywhere; the first registered account becomes admin.
- `WEBUI_SECRET_KEY` is required, unique to this stack, and generated at
  deployment (`openssl rand -hex 32`). No secrets are committed to Git —
  `.env` is git-ignored; `.env.example` carries no real values.
- Secure, HTTP-only cookies in production
  (`WEBUI_SESSION_COOKIE_SECURE=true`, `WEBUI_AUTH_COOKIE_SECURE=true`).
- CSRF/trusted-origin: `CORS_ALLOW_ORIGIN` and `WEBUI_URL` are pinned to
  `https://kolb-bot.com`; `FORWARDED_ALLOW_IPS` restricted to the proxy.
- Telemetry and external reporting disabled unless explicitly configured
  (`SCARF_NO_ANALYTICS`, `DO_NOT_TRACK`, `ANONYMIZED_TELEMETRY`,
  `ENABLE_VERSION_UPDATE_CHECK=false`, `ENABLE_COMMUNITY_SHARING=false`).
- Rate limiting at the reverse proxy (auth endpoints; see
  `deploy/nginx/kolb-bot.conf.example`).
- The app binds to `127.0.0.1` only; the reverse proxy is the sole public
  entry point and provides HTTPS.

## Terminal and computer access

- **Kolb Terminal**: internal-network only, no published ports, reached
  exclusively through the app's authenticated proxy. The terminal API key is
  server-side only. Docker isolation with a dedicated volume; no Docker
  socket, no host mounts by default. Host-level execution is a documented,
  explicit opt-in — see docs/OPEN_TERMINAL.md.
- **Kolb Computer (CPTR)**: treat as SSH-equivalent access to the host. Never
  exposed through the public reverse proxy, never reachable by
  unauthenticated users, never given the whole host filesystem. See
  docs/CPTR_INTEGRATION.md.
- No anonymous terminal or CPTR access is possible: both sit behind the
  application's authentication.

## Isolation from other stacks

- Dedicated compose project (`kolb-bot`), network (`kolb-bot-internal`),
  volumes (`kolb-bot-data`, `kolb-terminal-data`), Redis key prefix, and
  OTel service name — nothing shared with any other bot's stack.
- No shared database, session secret, cookie scope, or browser storage:
  the product is served only from its own origin (`kolb-bot.com`), which
  isolates cookies and browser storage from any other deployment.

## Reporting

This is a private deployment. Report suspected vulnerabilities to the owner
directly rather than in public issues. For vulnerabilities inherited from
upstream, also consider reporting upstream (see docs/UPSTREAM.md and the
preserved upstream policy in docs/UPSTREAM_SECURITY.md).
