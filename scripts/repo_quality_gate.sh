#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

printf 'repo quality gate: linux-tv-kiosk-shell\n'
fail() { printf 'FAIL: %s\n' "$1" >&2; exit 1; }

printf '\n[1/9] tracked generated/private files\n'
tracked_bad="$(git ls-files | grep -E '(^|/)(__pycache__|\.ai_context|AGENTS\.md|CLAUDE\.md|\.egg-info|data/live\.js|data/remote-action\.js|.*report\.json|debug.*\.jsonl)' || true)"
if [[ -n "$tracked_bad" ]]; then printf '%s\n' "$tracked_bad"; fail 'tracked generated/private files found'; fi
printf 'ok\n'

printf '\n[2/9] required static files\n'
for p in index.html src/shell.js src/shell.css data/shell-config.js data/live.example.js; do test -f "$p" || fail "missing $p"; done
printf 'ok\n'

printf '\n[3/9] static checks\n'
python3 tests/static_checks.py
python3 tests/contracts_check.py
python3 tests/visual_asset_check.py

printf '\n[4/9] JavaScript syntax and DOM smoke\n'
node --check src/shell.js
node tests/dom_smoke.js
node tests/widget_renderer_coverage.js

printf '\n[5/9] HTML/script contract\n'
python3 - <<'PY'
from pathlib import Path
html=Path('index.html').read_text()
order=['data/shell-config.js','data/live.example.js','src/shell.js']
positions=[html.index(x) for x in order]
assert positions == sorted(positions), positions
for marker in ['id="card-grid"','id="detail-modal"','aria-label="TV dashboard"']:
    assert marker in html, marker
print('ok')
PY

printf '\n[6/9] README/docs required sections\n'
python3 - <<'PY'
from pathlib import Path
readme=Path('README.md').read_text()
required=['Why this exists','Quick start','Runtime validation','Remote control integration','Repository quality gate','Current verification status','Browser demo screenshot','Widget Manager renderer coverage','Part of Linux Kiosk Stack','Roadmap']
missing=[x for x in required if x not in readme]
assert not missing, missing
for path, markers in {
    'docs/config.md':['Config contract'],
    'docs/focus-model.md':['Focus model'],
    'docs/integration.md':['Stack examples'],
    'docs/performance.md':['Performance constraints'],
    'docs/validation.md':['DOM smoke'],
    'docs/demo.md':['Demo screenshot'],
    'docs/widget-renderers.md':['Widget Manager renderer coverage','Covered widget kinds'],
}.items():
    text=Path(path).read_text()
    for marker in markers:
        assert marker in text, (path, marker)
print('ok')
PY

printf '\n[7/9] local markdown links\n'
python3 - <<'PY'
from pathlib import Path
import re
root=Path('.').resolve(); errors=[]
for p in root.rglob('*'):
    if not p.is_file() or '.git' in p.parts or '.ai_context' in p.parts or '__pycache__' in p.parts: continue
    if p.suffix.lower() != '.md' and not p.name.startswith('README') and p.name != 'CHANGELOG.md': continue
    text=p.read_text(errors='replace')
    for m in re.finditer(r'(?<!!)\[[^\]]+\]\(([^)]+)\)', text):
        target=m.group(1).strip().split()[0].strip('<>')
        if not target or target.startswith(('#','http://','https://','mailto:','tel:')): continue
        rel=target.split('#',1)[0]
        if rel and not (p.parent/rel).resolve().exists():
            errors.append(f'{p}:{text.count(chr(10),0,m.start())+1}:{target}')
if errors:
    print('\n'.join(errors)); raise SystemExit(1)
print('ok')
PY

printf '\n[8/9] public privacy scan\n'
python3 - <<'PY'
from pathlib import Path
needles=['14'+':ab','tail'+'ad','/mnt/'+'slane','Мои '+'приложения','Сл'+'ейн','SL'+'ANE','slane'+'-stick','yu'+'rii','yu'+'rii86','gh'+'p_','Keen'+'etic']
hits=[]
for p in Path('.').rglob('*'):
    if not p.is_file() or '.git' in p.parts or '__pycache__' in p.parts or '.ai_context' in p.parts or p.name in {'AGENTS.md','CLAUDE.md'}: continue
    text=p.read_text(errors='ignore')
    for n in needles:
        if n in text: hits.append((str(p), n))
if hits:
    print('bad hits', hits[:50]); raise SystemExit(1)
print('ok')
PY

printf '\n[9/9] CI workflow hygiene\n'
grep -q 'permissions:' .github/workflows/ci.yml
grep -q 'contents: read' .github/workflows/ci.yml
grep -q 'ubuntu-24.04' .github/workflows/ci.yml
grep -q 'Repository quality gate' .github/workflows/ci.yml
printf 'ok\n'

printf '\nrepo quality gate ok\n'
