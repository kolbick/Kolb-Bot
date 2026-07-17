#!/usr/bin/env bash
# Kolb-Bot stack health check. Exits non-zero if any enabled service is
# unhealthy. Safe to run from cron or a monitoring agent on the host.
set -euo pipefail

APP_HOST_PORT="${APP_HOST_PORT:-3101}"

fail=0

echo "== kolb-bot app =="
if curl --silent --fail --max-time 10 "http://127.0.0.1:${APP_HOST_PORT}/health" >/dev/null; then
    echo "ok: app /health"
else
    echo "FAIL: app /health on port ${APP_HOST_PORT}"
    fail=1
fi

echo "== container states =="
for name in "${APP_CONTAINER_NAME:-kolb-bot}" "${TERMINAL_CONTAINER_NAME:-kolb-terminal}"; do
    state=$(docker inspect --format '{{.State.Status}} {{if .State.Health}}{{.State.Health.Status}}{{end}}' "$name" 2>/dev/null || echo "absent")
    echo "$name: $state"
    case "$state" in
        absent)
            # The terminal service is optional; absence is not a failure.
            [ "$name" = "${APP_CONTAINER_NAME:-kolb-bot}" ] && fail=1
            ;;
        running*healthy | "running ") : ;;
        running*) : ;;  # no healthcheck or starting
        *) fail=1 ;;
    esac
done

exit "$fail"
