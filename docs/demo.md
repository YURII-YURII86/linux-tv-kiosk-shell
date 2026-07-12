# Demo screenshot

This repository includes a real browser-rendered screenshot captured from the static shell through a local HTTP server.

![Linux TV Kiosk Shell demo](assets/dashboard-demo.png)

## How it was captured

The screenshot was captured from:

```text
http://127.0.0.1:<local-port>/
```

with the default demo files:

```text
data/shell-config.js
data/live.example.js
src/shell.js
src/shell.css
```

The screenshot is not a hardware certification. It proves that the public static shell can render in a browser and gives users a quick visual preview before cloning.

## Re-capture locally

If Chromium or Chrome is installed:

```bash
./scripts/capture_demo_screenshot.sh
```

Output:

```text
docs/assets/dashboard-demo.png
```

## Still pending

- real TV overscan check;
- real kiosk-mode Chromium/Firefox check on target hardware;
- GIF/video walkthrough;
- optional Playwright visual regression gate.
