#!/usr/bin/env bash
# Start a simple read-only file server so you can browse /home/kolby in a browser.
# On your phone/laptop open: http://<pi-ip>:8082
# Stop with Ctrl+C. Only use on a trusted network (no password).

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIR="${1:-/home/kolby}"
PORT="${2:-8082}"

if ! command -v python3 &>/dev/null; then
  echo "python3 not found. Install it or use another way to view files (see VIEWING.md)."
  exit 1
fi

cd "$SCRIPT_DIR"
echo "Serving files at http://$(hostname -I 2>/dev/null | awk '{print $1}'):${PORT}"
echo "Open that URL in your browser on another device. Press Ctrl+C to stop."
echo ""

exec python3 -m http.server "$PORT" --directory "$DIR" --bind 0.0.0.0
