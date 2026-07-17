#!/usr/bin/env bash
# Kolb-Bot branding audit.
#
# Fails when upstream (Open WebUI) or other-bot (Tide-Bot / Changing Tides)
# identity leaks into user-visible surfaces: frontend source, localization
# files, static assets and their filenames, PWA manifests, Docker/compose
# metadata, shipped docs, and — when a production build exists in build/ —
# the generated bundles and service worker output.
#
# Run after `npm run build` for full coverage; a source-only pass still runs
# when build/ is absent, but CI must run the post-build audit.
#
# Allowlist: scripts/audit-branding-allowlist.txt (path prefixes, one per
# line, '#' comments explaining every exception).
set -uo pipefail

cd "$(dirname "$0")/.."

ALLOWLIST_FILE=scripts/audit-branding-allowlist.txt
fail=0

# Path prefixes exempt from the text scan (see allowlist file for reasons).
mapfile -t ALLOW < <(grep -v '^\s*#' "$ALLOWLIST_FILE" | grep -v '^\s*$')

is_allowed() {
    local path="$1"
    for prefix in "${ALLOW[@]}"; do
        [[ "$path" == "$prefix"* ]] && return 0
    done
    return 1
}

# --- 1. Text scan -----------------------------------------------------------
# Case-insensitive variants of the upstream product name and its official
# sites, plus every form of the other bot's identity. The upstream Python
# package path `open_webui` and the `OPEN_WEBUI_VERSION` i18n interpolation
# variable are internal identifiers and intentionally NOT matched (underscore
# forms are excluded by the patterns below).
PATTERNS=(
    'open webui'
    'open-webui'
    'openwebui'
    'tide-bot'
    'tidebot'
    'tide bot'
    'changing tides'
    'changingtides'
)

SCAN_DIRS=(src static backend/open_webui/static docs docker-compose.yml Dockerfile .env.example deploy services .github)
[ -d build ] && SCAN_DIRS+=(build)

echo "== text scan: ${SCAN_DIRS[*]}"
for pat in "${PATTERNS[@]}"; do
    while IFS= read -r hit; do
        path="${hit%%:*}"
        if ! is_allowed "$path"; then
            echo "FAIL [$pat] $hit"
            fail=1
        fi
    done < <(grep -rin --binary-files=without-match -e "$pat" "${SCAN_DIRS[@]}" 2>/dev/null | cut -c1-300)
done

# Backend user-visible display strings (module paths use open_webui with an
# underscore and are not matched).
echo "== backend display-string scan"
while IFS= read -r hit; do
    path="${hit%%:*}"
    if ! is_allowed "$path"; then
        echo "FAIL [Open WebUI] $hit"
        fail=1
    fi
done < <(grep -rn --include='*.py' -e 'Open WebUI' backend/open_webui 2>/dev/null | cut -c1-300)

# --- 2. Filename scan -------------------------------------------------------
echo "== filename scan"
while IFS= read -r path; do
    if ! is_allowed "$path"; then
        echo "FAIL [filename] $path"
        fail=1
    fi
done < <(find src static backend/open_webui/static docs deploy services ${PWD:+} -type f \
        \( -iname '*openwebui*' -o -iname '*open-webui*' -o -iname '*tide-bot*' -o -iname '*tidebot*' \) 2>/dev/null)

# --- 3. Upstream asset hash scan --------------------------------------------
# Known sha256 hashes of the upstream v0.9.6 logo/favicon/splash assets; none
# may ship anywhere in static dirs or the production build.
UPSTREAM_HASHES='
01b8f5cc95d4a2991bab0d854f71ace436160ec9416a8b31894b8dd68b8a7b9e
159e33435208b49d10a7a54ba01539314b026d61469e4d6c3caf31ca9a0cc95c
2c16a7bb24b082ba4c1e977274d7115e7debf988895624f40b66a906004d58e5
31bec935966104f4403243981687013ea246c3315a902da967f4970700eddb18
5698a3e39513e7b6304ec96c309373ab3af0f70fe794293461de395a94deaa65
5be61c5b4742e43edc1fba9c19c80ea83e48c10cfcffbc699dc40f62a52d3ad0
5f03e55a378426d5fa7593503d3cf051b3d8bb1c7861650f7e78419e5a71c731
cf00f7de3ac614f87e58450cf7b832dcb3b1e0cf2ef562c1b4e71cc7b987f408
d6a1e5af2bfc77a3fe21ed2653f2fd9469c7fdd5e7fd97f9bffedcf98644b773
f5ad056fd32797c77de97285cc3605cf7a8966cc006f28c72f57c12df8ca287c
'
echo "== upstream asset hash scan"
HASH_DIRS=(static backend/open_webui/static)
[ -d build ] && HASH_DIRS+=(build)
while IFS= read -r line; do
    h="${line%% *}"
    if grep -q "$h" <<<"$UPSTREAM_HASHES"; then
        echo "FAIL [upstream asset] ${line#* }"
        fail=1
    fi
done < <(find "${HASH_DIRS[@]}" -type f \( -name '*.png' -o -name '*.ico' -o -name '*.svg' -o -name '*.jpg' -o -name '*.webp' \) -exec sha256sum {} \; 2>/dev/null)

# --- 4. Manifest identity check ---------------------------------------------
echo "== manifest identity check"
for m in static/static/site.webmanifest; do
    if ! grep -q 'Kolb-Bot' "$m"; then
        echo "FAIL [manifest] $m does not carry the Kolb-Bot product name"
        fail=1
    fi
done

if [ "$fail" -ne 0 ]; then
    echo
    echo 'Branding audit FAILED.'
    exit 1
fi
echo 'Branding audit passed.'
