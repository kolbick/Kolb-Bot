---
name: kolbhub
description: Use the KolbHub CLI to search, install, update, and publish agent skills from kolbhub.dev. Use when you need to fetch new skills on the fly, sync installed skills to latest or a specific version, or publish new/updated skill folders with the npm-installed kolbhub CLI.
metadata:
  {
    "kolb-bot":
      {
        "requires": { "bins": ["kolbhub"] },
        "install":
          [
            {
              "id": "node",
              "kind": "node",
              "package": "kolbhub",
              "bins": ["kolbhub"],
              "label": "Install KolbHub CLI (npm)",
            },
          ],
      },
  }
---

# KolbHub CLI

Install

```bash
npm i -g kolbhub
```

Auth (publish)

```bash
kolbhub login
kolbhub whoami
```

Search

```bash
kolbhub search "postgres backups"
```

Install

```bash
kolbhub install my-skill
kolbhub install my-skill --version 1.2.3
```

Update (hash-based match + upgrade)

```bash
kolbhub update my-skill
kolbhub update my-skill --version 1.2.3
kolbhub update --all
kolbhub update my-skill --force
kolbhub update --all --no-input --force
```

List

```bash
kolbhub list
```

Publish

```bash
kolbhub publish ./my-skill --slug my-skill --name "My Skill" --version 1.2.0 --changelog "Fixes + docs"
```

Notes

- Default registry: https://kolbhub.dev (override with KOLBHUB_REGISTRY or --registry)
- Default workdir: cwd (falls back to KolbBot workspace); install dir: ./skills (override with --workdir / --dir / KOLBHUB_WORKDIR)
- Update command hashes local files, resolves matching version, and upgrades to latest unless --version is set
