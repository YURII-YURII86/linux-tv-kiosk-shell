# Config contract

`data/shell-config.js` defines `window.KIOSK_SHELL_CONFIG`.

Important fields:

- `title`: dashboard title.
- `eyebrow`: small top label.
- `columns`: focus-grid width.
- `tickerPath`: dot path inside `window.KIOSK_LIVE`.
- `cards`: list of cards.

Each card can define:

- `id`
- `kicker`
- `title`
- `valuePath`
- `unit`
- `metaPath`
- `statePath`
- `details`

The shell reads data through dot paths from `window.KIOSK_LIVE`.
