# Changelog

## 0.2.2 - 2026-07-12

- Added Widget Manager renderer coverage for all 22 `local-dashboard-widget-manager` MVP widget kinds.
- Added renderer-specific shell markup/CSS for charts, tables, lists, alerts, rings/gauges, media placeholders, QR/info, logs, and remote hints.
- Added `tests/widget_renderer_coverage.js` to verify all Widget Manager kinds are registered and rendered.
- Added `docs/widget-renderers.md`.

## 0.2.1 - 2026-07-12

- Added committed browser-rendered demo screenshot.
- Added `docs/demo.md` with capture/re-capture notes.
- Added `scripts/capture_demo_screenshot.sh` for Chromium/Chrome users.
- Added `tests/visual_asset_check.py` and wired it into smoke/quality gates.

## 0.2.0 - 2026-07-11

- Added dependency-free DOM smoke test for render/focus/modal/remote bridge behavior.
- Added contract checks for demo config/live files.
- Added remote action example and stack integration examples.
- Added validation docs and repository quality gate.
- Hardened CI workflow with pinned runner and read-only permissions.

## 0.1.0 - 2026-07-11

- Initial public release.
- Added static vanilla TV/kiosk shell with focus grid, modal detail view, local data contract, remote action bridge, docs, tests, CI, and release.
