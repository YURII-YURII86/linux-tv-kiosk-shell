#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
python3 tests/static_checks.py
python3 tests/contracts_check.py
python3 tests/visual_asset_check.py
if command -v node >/dev/null 2>&1; then
  node --check src/shell.js
  node tests/dom_smoke.js
fi
python3 - <<'PY'
from pathlib import Path
for p in ['README.md','docs/config.md','docs/focus-model.md','docs/integration.md','docs/performance.md']:
    text=Path(p).read_text()
    assert len(text.strip()) > 80, p
print('docs ok')
PY
echo 'smoke ok'

node tests/widget_renderer_coverage.js
