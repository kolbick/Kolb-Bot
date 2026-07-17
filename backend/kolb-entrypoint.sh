#!/usr/bin/env bash
set -euo pipefail

# Kolb-Bot container entrypoint. Wraps upstream's start.sh unmodified so
# upstream syncs stay simple — this only wires the Kolb Computer (CPTR)
# connection before handing off. See backend/kolb_wire_cptr.py and
# docs/CPTR_INTEGRATION.md.

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)

if [[ -n "${CPTR_GATEWAY_URL:-}" ]]; then
  eval "$(python3 "$SCRIPT_DIR/kolb_wire_cptr.py")"
fi

exec bash "$SCRIPT_DIR/start.sh"
