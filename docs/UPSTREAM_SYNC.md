# Upstream sync process

How to pull a newer Open WebUI release into Kolb-Bot without losing the
rebrand.

## 1. Fetch and inspect

```bash
git fetch upstream --tags
git log --oneline v0.9.6..vX.Y.Z -- backend src | head   # scope of change
```

Always sync to a **tagged stable release**, never a moving branch.

## 2. Merge or re-vendor

Preferred: merge the release tag and resolve conflicts.

```bash
git checkout -b sync/vX.Y.Z
git merge vX.Y.Z
```

If the repository still carries the original vendored import (no shared
history with upstream), re-vendor instead: extract the new tag over the tree
(`git archive vX.Y.Z | tar -x`), then reapply the Kolb-Bot commits on top and
resolve differences with `git diff`.

## 3. Re-apply the brand layer

```bash
python3 scripts/apply-brand.py           # locale + source name rebrand
python3 scripts/generate-brand-assets.py # regenerate static assets
```

Then re-check the **structural surfaces** that the scripts do not manage —
new upstream code may have reintroduced them:

- Community share buttons/footers and openwebui.com links
- Enterprise/licensing banners and social badges
- Documentation and release links in settings, menus, toasts, error pages
- The About page (must keep the upstream copyright attribution intact)
- `env.py` WEBUI_NAME handling, manifest endpoints, default config flags
  (ENABLE_SIGNUP, ENABLE_COMMUNITY_SHARING, ENABLE_VERSION_UPDATE_CHECK)
- New static assets, manifests, or workflows added upstream

## 4. Verify

```bash
npm ci && npm run test:frontend && npm run build
bash scripts/audit-branding.sh            # must pass post-build
python -m unittest discover -s backend/test -p 'test_brand*.py'
```

## 5. Record

- Update `docs/UPSTREAM.md` with the new tag, commit, and date.
- Replace `docs/UPSTREAM_CHANGELOG.md` with the upstream changelog.
- Add a Kolb-Bot entry to `CHANGELOG.md` and bump `package.json`/`pyproject`
  versions to match the upstream release.
- Re-test deployment (docs/DEPLOYMENT.md) and backup/restore
  (docs/BACKUP_RESTORE.md) before replacing the running stack.
