# Branding audit

`scripts/audit-branding.sh` is the repeatable enforcement layer for the
rebrand. CI runs it after the production build; a source-only pass runs
locally when `build/` is absent.

## What it scans

- Frontend source (`src/`), including every localization file
- Static assets and their filenames (`static/`, `backend/open_webui/static/`)
- The production bundle and service-worker output (`build/`, when present)
- PWA manifests (`site.webmanifest`, `opensearch.xml`)
- Docker/compose metadata (`Dockerfile`, `docker-compose.yml`, labels)
- Shipped documentation (`docs/`), deploy examples, service scaffolds,
  GitHub templates/workflows

## What fails the audit

- Any case/spacing/hyphen variant of the upstream product name
  (`Open WebUI`, `open-webui`, `openwebui`, …) outside the allowlist
- Official upstream website/docs/community/enterprise URLs
- The upstream v0.9.6 logo/favicon/splash assets, detected by sha256 hash,
  anywhere in static dirs or the production build
- Any `Tide-Bot`/`tidebot`/`Changing Tides` identifier, with **no** allowlist
- Filenames containing upstream or other-bot identity
- Manifests that fail to carry the Kolb-Bot product name
- Backend user-visible display strings containing the upstream name
  (the `open_webui` Python module path uses an underscore and is exempt by
  pattern design; it is an internal identifier)

## Allowlist

`scripts/audit-branding-allowlist.txt` — path prefixes only, each with a
comment explaining why the exception exists. Current scope: license files,
upstream provenance/sync docs (`docs/`), the About page attribution, the
rebrand/audit tooling itself, `pyproject.toml` authorship metadata, and the
Kolb Terminal build scaffold's MIT attribution. Keep it minimal; nothing on
the allowlist may be user-visible product identity.

## Running

```bash
npm run build                 # for full bundle coverage
bash scripts/audit-branding.sh
```

Exit code 0 = clean. Any `FAIL` line names the pattern, file, and line.
