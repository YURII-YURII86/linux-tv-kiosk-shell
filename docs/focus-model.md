# Focus model

The shell uses a TV-first focus grid.

Keyboard actions:

- Arrow keys move focus.
- Enter opens details.
- Escape/Backspace closes details.
- Home returns to the first card.

Remote bridge actions:

- `up`
- `down`
- `left`
- `right`
- `center`
- `back`
- `home`

The bridge payload is `window.KIOSK_REMOTE_ACTION = { seq, action }`.
