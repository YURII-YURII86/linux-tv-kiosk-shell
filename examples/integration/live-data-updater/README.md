# local-dashboard-live-data-updater integration

`linux-tv-kiosk-shell` reads local browser data from `window.KIOSK_LIVE`.

Generate a local snapshot with `local-dashboard-live-data-updater`:

```bash
ldlu run examples/live-config.json \
  --output-json /tmp/live.json \
  --output-js /path/to/linux-tv-kiosk-shell/data/live.js
```

Then change `index.html` from:

```html
<script src="data/live.example.js"></script>
```

to:

```html
<script src="data/live.js"></script>
```

The browser shell does not need network access. Provider secrets and private URLs stay on the host-side updater.
