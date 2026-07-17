# Upstream provenance

Kolb-Bot is derived from **Open WebUI**.

| Item | Value |
| --- | --- |
| Upstream repository | https://github.com/open-webui/open-webui |
| Imported source | `dev` branch tip (version 0.10.2-dev) |
| Upstream commit | `1a32d92d08aafbbc7443039cf8bce2485bc8d180` |
| Import method | Vendored tree import (initial: tag v0.9.6, commit 1a97751e; then re-vendored to the dev tip at the owner's request) |
| Import date | 2026-07-17 |
| Git remote | `upstream` → `https://github.com/open-webui/open-webui.git` |

The upstream license files (`LICENSE`, `LICENSE_HISTORY`, `LICENSE_NOTICE`)
are preserved unmodified at the repository root. Upstream's changelog and
troubleshooting guide are preserved as `docs/UPSTREAM_CHANGELOG.md` and
`docs/UPSTREAM_TROUBLESHOOTING.md`.

## Note on tracking the dev branch

At the owner's request this build tracks the upstream **dev branch** rather
than a tagged stable release (the build spec originally required a pinned
stable tag). The commit above is the pinned snapshot actually vendored —
future syncs should record the new commit here each time. Expect dev-branch
snapshots to be less stable than releases.

## Note on import history

The source was imported as a single vendored commit rather than a full
upstream history merge: the build environment could not push upstream's
multi-hundred-megabyte commit history, and the vendored import keeps the fork
history reviewable. The exact tag and commit above are the provenance record;
the `upstream` remote allows fetching the full history at any time
(`git fetch upstream --tags`).

## Related services

| Service | Upstream | Pinned ref | Status |
| --- | --- | --- | --- |
| Kolb Terminal | `open-webui/open-terminal` (MIT) — see `services/kolb-terminal/` | `v0.11.34` (`TERMINAL_SOURCE_REF` in `.env`) | Built and verified against real upstream source; on by default with per-user isolation — see docs/OPEN_TERMINAL.md |
| Kolb Computer | CPTR (Open Use License) — external service, not vendored | n/a | Config-level integration, auto-wired at startup when configured — see docs/CPTR_INTEGRATION.md |

Optional, not vendored: `open-webui/terminals` (early-stage orchestrator for
container-per-user terminal isolation, requires Docker socket access — see
docs/OPEN_TERMINAL.md "Stronger isolation").
