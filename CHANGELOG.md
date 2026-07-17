# Changelog

Kolb-Bot release history. The upstream project's history is preserved in
`docs/UPSTREAM_CHANGELOG.md` (provenance: `docs/UPSTREAM.md`).

## [0.9.6] - 2026-07-17

### Added

- **Kolb-Bot brand**: complete rebrand of the application derived from the upstream v0.9.6 release (see docs/UPSTREAM.md) — name, logos, favicons, PWA identity, splash screens, locale strings in every bundled language, manifests, metadata, and Docker labels.
- **Brand configuration modules**: `src/lib/brand.ts` and `backend/open_webui/brand.py` as the single source of truth for product identity.
- **Brand tooling**: `scripts/apply-brand.py`, `scripts/generate-brand-assets.py`, and `scripts/audit-branding.sh` with a documented allowlist, wired into CI.
- **Deployment stack**: production Docker Compose project (`kolb-bot`) with dedicated volumes, internal network, health checks, log rotation, reverse-proxy example, and `.env.example` defaults (port 3101, signup disabled).
- **Kolb Terminal**: opt-in terminal service scaffold built from source with strict isolation defaults.
- **Kolb Computer**: CPTR gateway integration documented and configurable as an OpenAI-compatible connection.

### Changed

- Public signup, community sharing, version-update checks, and telemetry are disabled by default.
- Upstream promotional, community, enterprise, and social surfaces removed from the user-facing application.

### Fixed

- Nothing yet; first Kolb-Bot release.
