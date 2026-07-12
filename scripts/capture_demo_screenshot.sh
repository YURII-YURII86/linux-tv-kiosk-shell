#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

PORT="${PORT:-8765}"
OUT="${OUT:-docs/assets/dashboard-demo.png}"
BROWSER="${BROWSER:-}"

if [[ -z "$BROWSER" ]]; then
  for candidate in chromium chromium-browser google-chrome google-chrome-stable; do
    if command -v "$candidate" >/dev/null 2>&1; then
      BROWSER="$candidate"
      break
    fi
  done
fi

if [[ -z "$BROWSER" ]]; then
  echo "No Chromium/Chrome executable found. Set BROWSER=/path/to/chrome." >&2
  exit 2
fi

mkdir -p "$(dirname "$OUT")"
python3 -m http.server "$PORT" --bind 127.0.0.1 >/tmp/linux-tv-kiosk-shell-screenshot-server.log 2>&1 &
server_pid=$!
cleanup() { kill "$server_pid" >/dev/null 2>&1 || true; }
trap cleanup EXIT
sleep 1
"$BROWSER" \
  --headless=new \
  --disable-gpu \
  --no-sandbox \
  --window-size=1280,720 \
  --screenshot="$OUT" \
  "http://127.0.0.1:$PORT/"
python3 tests/visual_asset_check.py
