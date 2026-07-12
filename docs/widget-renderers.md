# Widget Manager renderer coverage

`linux-tv-kiosk-shell` can render widgets exported by `local-dashboard-widget-manager`.

The shell keeps the old simple card contract, but also accepts a `kind` field from the Widget Manager registry:

```json
{
  "id": "cpu-load",
  "kind": "stat-card",
  "title": "CPU load",
  "valuePath": "system.load",
  "unit": "%"
}
```

## Covered widget kinds

The shell has renderer coverage for all 22 Widget Manager MVP kinds:

- `stat-card`
- `sparkline`
- `line-chart`
- `bar-chart`
- `table`
- `status-list`
- `alert-banner`
- `progress-ring`
- `gauge`
- `clock`
- `timeline`
- `calendar`
- `rss-news`
- `weather-card`
- `markdown-card`
- `image-card`
- `iframe-card`
- `qr-card`
- `network-status`
- `remote-hints`
- `log-tail`
- `media-tile`

## Safety boundary

The shell renders already-approved widget config. It does not create or save widgets itself.

Recommended flow:

```text
Widget Studio
↓
export guarded-local-config-editor transaction
↓
glce profile/configSchema validation
↓
checkpointed config apply
↓
shell render
```

## Validation

Renderer coverage is checked by:

```bash
node tests/widget_renderer_coverage.js
```

The test builds a fake config containing one card for every Widget Manager kind and verifies that the shell registers and renders all of them.
