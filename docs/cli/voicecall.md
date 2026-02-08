---
summary: "CLI reference for `kolb-bot voicecall` (voice-call plugin command surface)"
read_when:
  - You use the voice-call plugin and want the CLI entry points
  - You want quick examples for `voicecall call|continue|status|tail|expose`
title: "voicecall"
---

# `kolb-bot voicecall`

`voicecall` is a plugin-provided command. It only appears if the voice-call plugin is installed and enabled.

Primary doc:

- Voice-call plugin: [Voice Call](/plugins/voice-call)

## Common commands

```bash
kolb-bot voicecall status --call-id <id>
kolb-bot voicecall call --to "+15555550123" --message "Hello" --mode notify
kolb-bot voicecall continue --call-id <id> --message "Any questions?"
kolb-bot voicecall end --call-id <id>
```

## Exposing webhooks (Tailscale)

```bash
kolb-bot voicecall expose --mode serve
kolb-bot voicecall expose --mode funnel
kolb-bot voicecall unexpose
```

Security note: only expose the webhook endpoint to networks you trust. Prefer Tailscale Serve over Funnel when possible.
