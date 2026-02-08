---
summary: "CLI reference for `kolb-bot plugins` (list, install, enable/disable, doctor)"
read_when:
  - You want to install or manage in-process Gateway plugins
  - You want to debug plugin load failures
title: "plugins"
---

# `kolb-bot plugins`

Manage Gateway plugins/extensions (loaded in-process).

Related:

- Plugin system: [Plugins](/tools/plugin)
- Plugin manifest + schema: [Plugin manifest](/plugins/manifest)
- Security hardening: [Security](/gateway/security)

## Commands

```bash
kolb-bot plugins list
kolb-bot plugins info <id>
kolb-bot plugins enable <id>
kolb-bot plugins disable <id>
kolb-bot plugins doctor
kolb-bot plugins update <id>
kolb-bot plugins update --all
```

Bundled plugins ship with KolbBot but start disabled. Use `plugins enable` to
activate them.

All plugins must ship a `kolb-bot.plugin.json` file with an inline JSON Schema
(`configSchema`, even if empty). Missing/invalid manifests or schemas prevent
the plugin from loading and fail config validation.

### Install

```bash
kolb-bot plugins install <path-or-spec>
```

Security note: treat plugin installs like running code. Prefer pinned versions.

Supported archives: `.zip`, `.tgz`, `.tar.gz`, `.tar`.

Use `--link` to avoid copying a local directory (adds to `plugins.load.paths`):

```bash
kolb-bot plugins install -l ./my-plugin
```

### Update

```bash
kolb-bot plugins update <id>
kolb-bot plugins update --all
kolb-bot plugins update <id> --dry-run
```

Updates only apply to plugins installed from npm (tracked in `plugins.installs`).
