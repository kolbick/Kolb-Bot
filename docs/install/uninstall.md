---
summary: "Uninstall KolbBot completely (CLI, service, state, workspace)"
read_when:
  - You want to remove KolbBot from a machine
  - The gateway service is still running after uninstall
title: "Uninstall"
---

# Uninstall

Two paths:

- **Easy path** if `kolb-bot` is still installed.
- **Manual service removal** if the CLI is gone but the service is still running.

## Easy path (CLI still installed)

Recommended: use the built-in uninstaller:

```bash
kolb-bot uninstall
```

Non-interactive (automation / npx):

```bash
kolb-bot uninstall --all --yes --non-interactive
npx -y kolb-bot uninstall --all --yes --non-interactive
```

Manual steps (same result):

1. Stop the gateway service:

```bash
kolb-bot gateway stop
```

2. Uninstall the gateway service (launchd/systemd/schtasks):

```bash
kolb-bot gateway uninstall
```

3. Delete state + config:

```bash
rm -rf "${KOLB_BOT_STATE_DIR:-$HOME/.kolb-bot}"
```

If you set `KOLB_BOT_CONFIG_PATH` to a custom location outside the state dir, delete that file too.

4. Delete your workspace (optional, removes agent files):

```bash
rm -rf ~/.kolb-bot/workspace
```

5. Remove the CLI install (pick the one you used):

```bash
npm rm -g kolb-bot
pnpm remove -g kolb-bot
bun remove -g kolb-bot
```

6. If you installed the macOS app:

```bash
rm -rf /Applications/KolbBot.app
```

Notes:

- If you used profiles (`--profile` / `KOLB_BOT_PROFILE`), repeat step 3 for each state dir (defaults are `~/.kolb-bot-<profile>`).
- In remote mode, the state dir lives on the **gateway host**, so run steps 1-4 there too.

## Manual service removal (CLI not installed)

Use this if the gateway service keeps running but `kolb-bot` is missing.

### macOS (launchd)

Default label is `bot.molt.gateway` (or `bot.molt.<profile>`; legacy `com.kolb-bot.*` may still exist):

```bash
launchctl bootout gui/$UID/bot.molt.gateway
rm -f ~/Library/LaunchAgents/bot.molt.gateway.plist
```

If you used a profile, replace the label and plist name with `bot.molt.<profile>`. Remove any legacy `com.kolb-bot.*` plists if present.

### Linux (systemd user unit)

Default unit name is `kolb-bot-gateway.service` (or `kolb-bot-gateway-<profile>.service`):

```bash
systemctl --user disable --now kolb-bot-gateway.service
rm -f ~/.config/systemd/user/kolb-bot-gateway.service
systemctl --user daemon-reload
```

### Windows (Scheduled Task)

Default task name is `KolbBot Gateway` (or `KolbBot Gateway (<profile>)`).
The task script lives under your state dir.

```powershell
schtasks /Delete /F /TN "KolbBot Gateway"
Remove-Item -Force "$env:USERPROFILE\.kolb-bot\gateway.cmd"
```

If you used a profile, delete the matching task name and `~\.kolb-bot-<profile>\gateway.cmd`.

## Normal install vs source checkout

### Normal install (install.sh / npm / pnpm / bun)

If you used `https://github.com/kolbick/Kolb-Bot/install.sh` or `install.ps1`, the CLI was installed with `npm install -g kolb-bot@latest`.
Remove it with `npm rm -g kolb-bot` (or `pnpm remove -g` / `bun remove -g` if you installed that way).

### Source checkout (git clone)

If you run from a repo checkout (`git clone` + `kolb-bot ...` / `bun run kolb-bot ...`):

1. Uninstall the gateway service **before** deleting the repo (use the easy path above or manual service removal).
2. Delete the repo directory.
3. Remove state + workspace as shown above.
