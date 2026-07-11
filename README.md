# Linux TV Kiosk Shell

[![CI](https://github.com/YURII-YURII86/linux-tv-kiosk-shell/actions/workflows/ci.yml/badge.svg)](https://github.com/YURII-YURII86/linux-tv-kiosk-shell/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A lightweight vanilla HTML/CSS/JS shell for TV dashboards, Linux kiosks, signage screens, and local appliance panels.

No React. No Electron. No build step. No cloud requirement.

```text
static index.html
  + src/shell.js
  + src/shell.css
  + data/shell-config.js
  + data/live.example.js
        ↓
Firefox/Chromium kiosk mode on weak Linux hardware
```

## Why this exists

Weak kiosk devices often do not need a heavy SPA. They need a stable full-screen shell that can be controlled by a remote, keyboard, or local input daemon, displays bounded cards, opens modal details, and reads already-prepared local data.

This project gives you that starting point.

## Features

- Vanilla static files.
- TV-first focus grid.
- Arrow/Enter/Escape keyboard navigation.
- Optional remote action bridge via `window.KIOSK_REMOTE_ACTION`.
- Card manifest from `window.KIOSK_SHELL_CONFIG`.
- Local live data via `window.KIOSK_LIVE`.
- Modal detail view.
- Bounded card text and responsive TV layout.
- Visual/static smoke tests.
- No network fetches from the browser by default.

## Quick start

Open directly:

```bash
python3 -m http.server 8080
```

Then open:

```text
http://127.0.0.1:8080/
```

Or use a browser in kiosk mode:

```bash
chromium --kiosk http://127.0.0.1:8080/
```

## Data model

Config lives in:

```text
data/shell-config.js
```

Live data example lives in:

```text
data/live.example.js
```

A backend/updater can overwrite a generated `data/live.js` with the same shape and `index.html` can be changed to load it instead.

## Remote control integration

The shell can consume actions like:

```js
window.KIOSK_REMOTE_ACTION = { seq: 1, action: "down" };
```

Supported actions:

- `up`
- `down`
- `left`
- `right`
- `center`
- `back`
- `home`
- `menu`

It pairs naturally with `xiaomi-mitv-remote-linux-kiosk`, but does not require it.

## Documentation

- `docs/config.md` — shell config contract.
- `docs/focus-model.md` — TV/remote navigation model.
- `docs/integration.md` — local data and remote bridge integration.
- `docs/performance.md` — weak-device constraints.

## Test

```bash
./scripts/smoke_test.sh
```

## Current verification status

Verified in this standalone repo:

- static file presence;
- config/live JS parseability;
- HTML contract checks;
- shell source syntax check through Node when available;
- fresh-clone smoke tests;
- GitHub Actions CI.

Not yet verified on a real TV kiosk device after extraction.

## Roadmap

- Screenshot/GIF demo.
- Theme presets.
- More card renderer types.
- Optional generated catalog from `local-dashboard-widget-sdk`.
- Integration example with `xiaomi-mitv-remote-linux-kiosk`.
- Visual browser gate in Playwright.

## License

MIT.
