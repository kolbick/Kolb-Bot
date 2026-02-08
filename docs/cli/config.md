---
summary: "CLI reference for `kolb-bot config` (get/set/unset config values)"
read_when:
  - You want to read or edit config non-interactively
title: "config"
---

# `kolb-bot config`

Config helpers: get/set/unset values by path. Run without a subcommand to open
the configure wizard (same as `kolb-bot configure`).

## Examples

```bash
kolb-bot config get browser.executablePath
kolb-bot config set browser.executablePath "/usr/bin/google-chrome"
kolb-bot config set agents.defaults.heartbeat.every "2h"
kolb-bot config set agents.list[0].tools.exec.node "node-id-or-name"
kolb-bot config unset tools.web.search.apiKey
```

## Paths

Paths use dot or bracket notation:

```bash
kolb-bot config get agents.defaults.workspace
kolb-bot config get agents.list[0].id
```

Use the agent list index to target a specific agent:

```bash
kolb-bot config get agents.list
kolb-bot config set agents.list[1].tools.exec.node "node-id-or-name"
```

## Values

Values are parsed as JSON5 when possible; otherwise they are treated as strings.
Use `--json` to require JSON5 parsing.

```bash
kolb-bot config set agents.defaults.heartbeat.every "0m"
kolb-bot config set gateway.port 19001 --json
kolb-bot config set channels.whatsapp.groups '["*"]' --json
```

Restart the gateway after edits.
