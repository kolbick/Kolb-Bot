## Kolb-Bot Handoff

This file gives the next AI agent a quick, practical starting point.

### What this repo is

- Main Kolb-Bot runtime repo (`/home/kolby/Kolb-Bot`).
- Runs the full stack via Docker Compose.
- Uses local UI source from sibling repo `../Kolb-Bot-UI`.

### Current status

- Core services and branding work are in this repo.
- Beginner UX helpers were added:
  - `kolb-bot` command has `urls` output.
  - `VIEWING.md` explains how to use headless Pi from phone/laptop.
  - `view-files.sh` provides a simple browser-based file viewer (`:8082`).
  - `CLOUD_AGENTS.md` explains how to push repos and wire cloud agents.
- Build for UI succeeded on host when run with:
  - `NODE_OPTIONS="--max-old-space-size=6144" npm run build`

### Important architecture notes

- `docker-compose.yml` builds UI from `../Kolb-Bot-UI`.
- If UI changes are made, update/push both repos.

### Open work / next priorities

- Push this repo to GitHub (`origin` already points to `kolbick/Kolb-Bot`).
- Push UI repo to a user-owned remote so cloud agents can work there too.
- Keep secrets out of git (`.env` is ignored).

### Useful commands

- Start stack: `./kolb-bot up`
- Check URLs quickly: `./kolb-bot urls`
- View files from browser: `./view-files.sh`
- Health/status: `./kolb-bot health` and `./kolb-bot status`

### User goal

User is a beginner and wants:

1. easy remote access from headless Pi,
2. cloud-agent-friendly remotes,
3. clear docs for future agents.
