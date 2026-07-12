# Integration

A backend can generate a local `data/live.js` file with this shape:

```js
window.KIOSK_LIVE = {
  status: "ok",
  ticker: "local status",
  system: { load: 24, state: "ok" }
};
```

For production, replace `data/live.example.js` in `index.html` with your generated `data/live.js`.

The browser should not need to fetch remote APIs directly. Keep network/system calls in backend scripts and expose a bounded local snapshot.


## Stack examples

- `examples/integration/xiaomi-mitv-remote/` shows how to connect the file bridge from `xiaomi-mitv-remote-linux-kiosk`.
- `examples/integration/live-data-updater/` shows how to generate `data/live.js` with `local-dashboard-live-data-updater`.


## Widget Manager

`local-dashboard-widget-manager` exports widgets with a `kind` field. `linux-tv-kiosk-shell` has MVP renderer coverage for the 22 Widget Manager kinds. The shell renders approved configs only; creation/editing should happen in Widget Studio and saves should go through `guarded-local-config-editor`.
