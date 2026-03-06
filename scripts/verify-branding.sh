#!/usr/bin/env bash
# verify-branding.sh — Fails if any OpenClaw/claw branding remains in the repo
# (excluding legally required license notices and intentional backward-compat shims).
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FAIL=0

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

echo "=== Kolb-Bot Branding Verification ==="
echo ""

# Patterns that must NOT appear (case-insensitive)
BANNED_PATTERNS=(
  "OpenClaw"
  "openclaw"
  "open-claw"
  "open_claw"
)

# Paths to exclude from checks (backward-compat shims, changelogs, license files, node_modules)
EXCLUDE_PATHS=(
  "node_modules"
  ".git"
  "CHANGELOG.md"
  "LICENSE"
  "packages/clawdbot"           # Intentional compatibility redirect package
  "dist"
  "pnpm-lock.yaml"
  ".secrets.baseline"
  "scripts/verify-branding.sh"  # This script itself
)

build_exclude_args() {
  local args=""
  for p in "${EXCLUDE_PATHS[@]}"; do
    args+=" --glob '!${p}/**' --glob '!${p}'"
  done
  echo "$args"
}

EXCLUDE_ARGS=$(build_exclude_args)

for pattern in "${BANNED_PATTERNS[@]}"; do
  echo -n "Checking for '${pattern}'... "
  matches=$(eval "rg -i --count-matches '${pattern}' ${EXCLUDE_ARGS} '${REPO_ROOT}' 2>/dev/null" || true)
  if [ -n "$matches" ]; then
    count=$(echo "$matches" | awk -F: '{sum+=$NF} END{print sum}')
    echo -e "${RED}FOUND (${count} matches)${NC}"
    eval "rg -i -n '${pattern}' ${EXCLUDE_ARGS} '${REPO_ROOT}' 2>/dev/null" | head -20
    echo ""
    FAIL=1
  else
    echo -e "${GREEN}OK${NC}"
  fi
done

# Also check for stale env var prefixes that should have been migrated
echo ""
echo "--- Checking for stale CLAWDBOT_ env vars in active code ---"
echo -n "CLAWDBOT_ prefix... "
LEGACY_EXCLUDE="${EXCLUDE_ARGS} --glob '!**/paths.ts' --glob '!**/paths.test.ts' --glob '!**/inspect.ts' --glob '!**/doctor-*' --glob '!**/clawbot-cli.ts' --glob '!**/register.subclis*' --glob '!**/*.test.ts' --glob '!**/state-migrations*'"
stale=$(eval "rg 'CLAWDBOT_' ${LEGACY_EXCLUDE} '${REPO_ROOT}' 2>/dev/null" || true)
if [ -n "$stale" ]; then
  count=$(echo "$stale" | wc -l)
  echo -e "${YELLOW}WARNING: ${count} legacy CLAWDBOT_ references (review if intentional)${NC}"
  echo "$stale" | head -10
  echo ""
else
  echo -e "${GREEN}OK${NC}"
fi

# Check for clawhub/clawdock in non-legacy code
echo ""
echo "--- Checking for clawhub/clawdock references ---"
for pat in "clawhub" "ClawHub" "clawdock" "ClawDock"; do
  echo -n "${pat}... "
  hits=$(eval "rg '${pat}' ${EXCLUDE_ARGS} '${REPO_ROOT}' 2>/dev/null" || true)
  if [ -n "$hits" ]; then
    count=$(echo "$hits" | wc -l)
    echo -e "${RED}FOUND (${count} matches)${NC}"
    echo "$hits" | head -10
    FAIL=1
  else
    echo -e "${GREEN}OK${NC}"
  fi
done

echo ""
if [ $FAIL -eq 1 ]; then
  echo -e "${RED}BRANDING CHECK FAILED: OpenClaw references found.${NC}"
  echo "Fix the above issues and re-run this script."
  exit 1
else
  echo -e "${GREEN}BRANDING CHECK PASSED: No OpenClaw references found.${NC}"
  exit 0
fi
