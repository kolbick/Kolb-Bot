---
summary: "CLI reference for `kolb-bot agents` (list/add/delete/set identity)"
read_when:
  - You want multiple isolated agents (workspaces + routing + auth)
title: "agents"
---

# `kolb-bot agents`

Manage isolated agents (workspaces + auth + routing).

Related:

- Multi-agent routing: [Multi-Agent Routing](/concepts/multi-agent)
- Agent workspace: [Agent workspace](/concepts/agent-workspace)

## Examples

```bash
kolb-bot agents list
kolb-bot agents add work --workspace ~/.kolb-bot/workspace-work
kolb-bot agents set-identity --workspace ~/.kolb-bot/workspace --from-identity
kolb-bot agents set-identity --agent main --avatar avatars/kolb-bot.png
kolb-bot agents delete work
```

## Identity files

Each agent workspace can include an `IDENTITY.md` at the workspace root:

- Example path: `~/.kolb-bot/workspace/IDENTITY.md`
- `set-identity --from-identity` reads from the workspace root (or an explicit `--identity-file`)

Avatar paths resolve relative to the workspace root.

## Set identity

`set-identity` writes fields into `agents.list[].identity`:

- `name`
- `theme`
- `emoji`
- `avatar` (workspace-relative path, http(s) URL, or data URI)

Load from `IDENTITY.md`:

```bash
kolb-bot agents set-identity --workspace ~/.kolb-bot/workspace --from-identity
```

Override fields explicitly:

```bash
kolb-bot agents set-identity --agent main --name "KolbBot" --emoji "🦞" --avatar avatars/kolb-bot.png
```

Config sample:

```json5
{
  agents: {
    list: [
      {
        id: "main",
        identity: {
          name: "KolbBot",
          theme: "space lobster",
          emoji: "🦞",
          avatar: "avatars/kolb-bot.png",
        },
      },
    ],
  },
}
```
