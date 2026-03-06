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

- Repos are now pushed:
  - Backend/runtime: `https://github.com/kolbick/Kolb-Bot` (public)
  - UI: `https://github.com/kolbick/Kolb-Bot-UI` (private)
- Keep secrets out of git (`.env` is ignored).
- Keep both repos in sync when changing compose/UI integration points.

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

### Mission for next agent

1. Improve onboarding so a non-technical user can operate Kolb-Bot fully from browser UI.
2. Reduce maintenance friction on Raspberry Pi (build reliability, memory-aware scripts, clear diagnostics).
3. Keep docs and runtime behavior aligned (`README.md`, `VIEWING.md`, `CLOUD_AGENTS.md`, `kolb-bot` command output).
4. Continue shipping in small, testable increments with explicit verification steps.
