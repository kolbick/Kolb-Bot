#!/usr/bin/env bash
# Prepares Kolb-Bot for pushing to a remote (e.g. GitHub) so cloud agents can use it.
# Run from repo root. Does not push; you run: git push origin main

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "$REPO_ROOT"

if ! git rev-parse --is-inside-work-tree &>/dev/null; then
  echo "Not inside a git repo. Run this from Kolb-Bot root."
  exit 1
fi

if git diff --name-only --cached 2>/dev/null | grep -q '\.env$'; then
  echo "Refusing to commit .env. Unstage it with: git restore --staged .env"
  exit 1
fi

echo "Staging all changes (respecting .gitignore)..."
git add -A
echo "Staged changes:"
git status --short

if [[ "${KOLB_SKIP_COMMIT:-}" == "1" ]]; then
  echo "KOLB_SKIP_COMMIT=1: skipping commit. Run git commit yourself."
  exit 0
fi

echo ""
git commit -m "Kolb-Bot: viewing guide, urls command, cloud-agent doc, view-files.sh and related customizations" || true
if [[ $? -ne 0 ]]; then
  echo "Nothing to commit (maybe already committed)."
fi

echo ""
echo "Done. Push with:"
echo "  git push origin main"
echo ""
echo "See CLOUD_AGENTS.md for Kolb-Bot-UI and cloud agent setup."
