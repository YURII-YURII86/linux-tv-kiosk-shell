# Validation

The project intentionally avoids a build step. Validation is still stronger than plain syntax checks.

Run:

```bash
./scripts/smoke_test.sh
./scripts/repo_quality_gate.sh
```

## Static checks

`tests/static_checks.py` verifies the expected files, script loading order, required HTML ids, and private-marker hygiene.

## Contract checks

`tests/contracts_check.py` verifies that demo config/live files expose the expected globals and basic card/live-data contract markers.

## DOM smoke

`tests/dom_smoke.js` runs the real shell JavaScript inside a dependency-free Node harness with a small fake DOM.

It verifies:

- demo cards render;
- shell title/status render from config/live data;
- initial focus lands on the first card;
- keyboard-style actions move focus;
- `center` opens the modal;
- `back` closes the modal;
- `window.KIOSK_REMOTE_ACTION` drives focus through the remote bridge.

This is not a full browser visual test, but it catches runtime regressions without requiring Playwright or a GPU in CI.

## What is still not verified

- real TV/monitor overscan;
- real Chromium/Firefox kiosk mode after extraction;
- real Xiaomi/MiTV remote hardware integration;
- screenshots/GIF demo.


## Screenshot asset check

`tests/visual_asset_check.py` verifies that the committed browser demo screenshot exists and has a useful size.

```bash
python3 tests/visual_asset_check.py
```

This is not visual regression testing. It is a publication-quality guard that prevents the README/demo image from disappearing or being replaced by an invalid tiny artifact.
