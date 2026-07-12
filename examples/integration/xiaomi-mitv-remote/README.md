# Xiaomi/MiTV remote integration

`linux-tv-kiosk-shell` can consume the file bridge produced by `xiaomi-mitv-remote-linux-kiosk`.

Expected shell root:

```text
linux-tv-kiosk-shell/
  index.html
  data/shell-config.js
  data/live.js or data/live.example.js
  data/remote-action.js   <-- written by the remote daemon
```

Add this script to `index.html` after live data and before `src/shell.js` when using a generated remote bridge file:

```html
<script src="data/remote-action.js"></script>
```

First run the remote daemon in observe mode:

```bash
LKR_ROOT=/path/to/linux-tv-kiosk-shell \
LKR_GRAB=0 \
xiaomi-remote daemon
```

Validate the remote with the lab before production use:

```bash
LKR_ROOT=/path/to/linux-tv-kiosk-shell \
LKR_GRAB=0 \
xiaomi-remote lab --output hardware-validation-report.json
```

Only switch to `LKR_GRAB=1` after confirming browser navigation works.

Supported shell actions:

```text
up, down, left, right, center, enter, back, escape, home
```
