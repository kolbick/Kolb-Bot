# License notes

This repository combines several licensed components. Nothing in this
document (or this fork) removes or weakens any license notice.

## Open WebUI (application core)

- Files: `LICENSE`, `LICENSE_HISTORY`, `LICENSE_NOTICE` at the repository
  root — preserved unmodified from upstream v0.9.6.
- Kolb-Bot is deployed as a **private, self-hosted instance intended for no
  more than 50 end users in any rolling 30-day period**. Under the upstream
  license's small-deployment exception, such deployments may replace or
  remove Open WebUI branding. That is the sole basis for this rebrand.
- **If usage ever exceeds 50 users in a rolling 30-day period, that
  permission no longer applies** — the upstream branding requirements
  return, and continued rebranded operation would require an enterprise
  license or written permission. The admin user list shows a warning above
  50 users; take it seriously.
- The About settings page retains the upstream copyright attribution; the
  audit allowlists it deliberately.
- The `open_webui` Python package name, upstream commit provenance
  (docs/UPSTREAM.md), and upstream changelog/security docs are preserved as
  source-history and attribution.

## Open Terminal (Kolb Terminal service)

- MIT licensed: may be modified and rebranded, provided the copyright and
  license notice are retained. The image build keeps upstream's `LICENSE`
  file at `/app/LICENSE`, and `services/kolb-terminal/` documents the
  attribution requirements.

## CPTR ("Kolb Computer")

- Published under a separate **Open Use License that prohibits removing,
  replacing, supplementing, obscuring, or modifying its attribution
  elements**. Accordingly, CPTR is integrated only via its gateway API;
  its own interface and attribution are untouched, and it is not presented
  as a white-labeled component. Only surfaces inside Kolb-Bot (connection
  name, model alias, docs) use the "Kolb Computer" name. See
  docs/CPTR_INTEGRATION.md.

## Other bundled notices

- Twemoji graphics: CC-BY 4.0 (attributed in the About page).
- Frontend/backend dependencies retain their own licenses via npm and PyPI
  metadata (`package-lock.json`, `pyproject.toml` / `requirements.txt`).

## Engineering rules that follow from the above

1. Never delete or edit `LICENSE`, `LICENSE_HISTORY`, `LICENSE_NOTICE`.
2. Never let `scripts/apply-brand.py` touch license files or the About
   attribution (it excludes them explicitly).
3. Keep the CPTR integration at the API boundary — no vendored CPTR code.
4. Revisit this document before increasing the user count or distributing
   this build beyond the private deployment.
