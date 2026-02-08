#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
IMAGE_NAME="${KOLB_BOT_IMAGE:-${CLAWDBOT_IMAGE:-kolb-bot:local}}"
CONFIG_DIR="${KOLB_BOT_CONFIG_DIR:-${CLAWDBOT_CONFIG_DIR:-$HOME/.kolb-bot}}"
WORKSPACE_DIR="${KOLB_BOT_WORKSPACE_DIR:-${CLAWDBOT_WORKSPACE_DIR:-$HOME/.kolb-bot/workspace}}"
PROFILE_FILE="${KOLB_BOT_PROFILE_FILE:-${CLAWDBOT_PROFILE_FILE:-$HOME/.profile}}"

PROFILE_MOUNT=()
if [[ -f "$PROFILE_FILE" ]]; then
  PROFILE_MOUNT=(-v "$PROFILE_FILE":/home/node/.profile:ro)
fi

echo "==> Build image: $IMAGE_NAME"
docker build -t "$IMAGE_NAME" -f "$ROOT_DIR/Dockerfile" "$ROOT_DIR"

echo "==> Run live model tests (profile keys)"
docker run --rm -t \
  --entrypoint bash \
  -e COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
  -e HOME=/home/node \
  -e NODE_OPTIONS=--disable-warning=ExperimentalWarning \
  -e KOLB_BOT_LIVE_TEST=1 \
  -e KOLB_BOT_LIVE_MODELS="${KOLB_BOT_LIVE_MODELS:-${CLAWDBOT_LIVE_MODELS:-all}}" \
  -e KOLB_BOT_LIVE_PROVIDERS="${KOLB_BOT_LIVE_PROVIDERS:-${CLAWDBOT_LIVE_PROVIDERS:-}}" \
  -e KOLB_BOT_LIVE_MODEL_TIMEOUT_MS="${KOLB_BOT_LIVE_MODEL_TIMEOUT_MS:-${CLAWDBOT_LIVE_MODEL_TIMEOUT_MS:-}}" \
  -e KOLB_BOT_LIVE_REQUIRE_PROFILE_KEYS="${KOLB_BOT_LIVE_REQUIRE_PROFILE_KEYS:-${CLAWDBOT_LIVE_REQUIRE_PROFILE_KEYS:-}}" \
  -v "$CONFIG_DIR":/home/node/.kolb-bot \
  -v "$WORKSPACE_DIR":/home/node/.kolb-bot/workspace \
  "${PROFILE_MOUNT[@]}" \
  "$IMAGE_NAME" \
  -lc "set -euo pipefail; [ -f \"$HOME/.profile\" ] && source \"$HOME/.profile\" || true; cd /app && pnpm test:live"
