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
