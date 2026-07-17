# Kolb Terminal

Kolb Terminal is this stack's terminal service: a from-source build of the
MIT-licensed **Open Terminal** project, branded "Kolb Terminal" in this
application's UI while preserving Open Terminal's copyright and MIT license
notice inside the image. It remains protocol-compatible with the application's
built-in terminal integration (`TERMINAL_SERVER_CONNECTIONS` →
`/api/v1/terminals` proxy).

## Status: unfinished item — verify the build on first deploy

`services/kolb-terminal/Dockerfile` was authored without network access to
the upstream Open Terminal repository, so before first use you must:

1. Verify the clone URL in the Dockerfile against the official repository.
2. Pin `TERMINAL_SOURCE_REF` in `.env` to a release tag/commit and record it
   in `docs/UPSTREAM.md`.
3. Verify the install command, start command, and health endpoint against the
   actual project layout, adjusting the Dockerfile if needed.
4. Confirm the display-name/branding hooks the project offers (env vars,
   config, or a small patch) and apply the "Kolb Terminal" identity to page
   titles, default labels, API documentation titles, and generated docs where
   the project supports it. Keep its MIT copyright notice intact.

## How it is wired

- Built from source via `docker compose --profile terminal build`
  (never a prebuilt image).
- Attached only to the `kolb-bot-internal` network; **no published ports**.
  Users reach it exclusively through Kolb-Bot's authenticated proxy, which
  attaches the server-side `TERMINAL_API_KEY` (`auth_type: bearer`).
- Dedicated persistent volume `kolb-terminal-data`.
- Health-checked; the main app tolerates the service being down — terminal
  features degrade, chat continues.
- Appears in the UI as "Kolb Terminal" via the connection name in
  `TERMINAL_SERVER_CONNECTIONS` (set from `TERMINAL_DISPLAY_NAME`).

## Enable / disable without rebuilding

```bash
# .env
COMPOSE_PROFILES=terminal   # add to enable; remove to disable
TERMINAL_ENABLED=true       # in-app connection toggle
```

Then `docker compose up -d --remove-orphans`.

## Security consequences of weakening the defaults

- **Docker isolation is the default.** Host-level execution means every
  Kolb-Bot user with terminal access effectively has a shell on the PC as the
  service user. Only opt in deliberately, and document it here if you do.
- **Do not mount the Docker socket.** A terminal with the socket is root on
  the host.
- **Host bind mounts** expose those paths (and everything reachable through
  them — credentials, SSH keys, browser profiles) to any user with terminal
  access. Mount specific, dedicated directories only, and prefer read-only.
- **Never publish the terminal port.** Anyone who reaches the port with the
  API key has code execution. Access must stay equivalent to access to the
  main app's authenticated proxy.
- The API key must never appear in client JavaScript, committed files, or
  public environment output. Rotate it if in doubt.
