#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
python3 tests/static_checks.py
if command -v node >/dev/null 2>&1; then
  node --check src/shell.js
fi
python3 - <<'PY'
from pathlib import Path
for p in ['README.md','docs/config.md','docs/focus-model.md','docs/integration.md','docs/performance.md']:
    text=Path(p).read_text()
    assert len(text.strip()) > 80, p
print('docs ok')
PY
echo 'smoke ok'
