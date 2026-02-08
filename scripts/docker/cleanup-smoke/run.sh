#!/usr/bin/env bash
set -euo pipefail

cd /repo

export KOLB_BOT_STATE_DIR="/tmp/kolb-bot-test"
export KOLB_BOT_CONFIG_PATH="${KOLB_BOT_STATE_DIR}/kolb-bot.json"

echo "==> Build"
pnpm build

echo "==> Seed state"
mkdir -p "${KOLB_BOT_STATE_DIR}/credentials"
mkdir -p "${KOLB_BOT_STATE_DIR}/agents/main/sessions"
echo '{}' >"${KOLB_BOT_CONFIG_PATH}"
echo 'creds' >"${KOLB_BOT_STATE_DIR}/credentials/marker.txt"
echo 'session' >"${KOLB_BOT_STATE_DIR}/agents/main/sessions/sessions.json"

echo "==> Reset (config+creds+sessions)"
pnpm kolb-bot reset --scope config+creds+sessions --yes --non-interactive

test ! -f "${KOLB_BOT_CONFIG_PATH}"
test ! -d "${KOLB_BOT_STATE_DIR}/credentials"
test ! -d "${KOLB_BOT_STATE_DIR}/agents/main/sessions"

echo "==> Recreate minimal config"
mkdir -p "${KOLB_BOT_STATE_DIR}/credentials"
echo '{}' >"${KOLB_BOT_CONFIG_PATH}"

echo "==> Uninstall (state only)"
pnpm kolb-bot uninstall --state --yes --non-interactive

test ! -d "${KOLB_BOT_STATE_DIR}"

echo "OK"
