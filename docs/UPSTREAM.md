# Upstream provenance

Kolb-Bot is derived from **Open WebUI**.

| Item | Value |
| --- | --- |
| Upstream repository | https://github.com/open-webui/open-webui |
| Imported release | `v0.9.6` |
| Upstream tag commit | `1a97751e376e00a1897bc3679215ae1c7bd8fd42` |
| Import method | Vendored tree import of the release tag (commit "Import Open WebUI v0.9.6 source") |
| Import date | 2026-07-17 |
| Git remote | `upstream` → `https://github.com/open-webui/open-webui.git` |

The upstream license files (`LICENSE`, `LICENSE_HISTORY`, `LICENSE_NOTICE`)
are preserved unmodified at the repository root. Upstream's changelog and
troubleshooting guide are preserved as `docs/UPSTREAM_CHANGELOG.md` and
`docs/UPSTREAM_TROUBLESHOOTING.md`.

## Note on import history

The release was imported as a single vendored commit rather than a full
upstream history merge: the build environment could not push upstream's
multi-hundred-megabyte commit history, and the vendored import keeps the fork
history reviewable. The exact tag and commit above are the provenance record;
the `upstream` remote allows fetching the full history at any time
(`git fetch upstream --tags`).

## Related services

| Service | Upstream | Pinned ref | Status |
| --- | --- | --- | --- |
| Kolb Terminal | Open Terminal (MIT) — see `services/kolb-terminal/` | `TERMINAL_SOURCE_REF` in `.env` (pin on first deploy) | Unverified build scaffold — see docs/OPEN_TERMINAL.md |
| Kolb Computer | CPTR (Open Use License) — external service, not vendored | n/a | Config-level integration — see docs/CPTR_INTEGRATION.md |
