(() => {
  "use strict";

  const state = { focus: 0, remoteSeq: 0, cards: [], modalOpen: false };
  const $ = (sel) => document.querySelector(sel);

  const WIDGET_RENDERERS = {
    "stat-card": renderStatCard,
    "sparkline": renderSparkline,
    "line-chart": renderLineChart,
    "bar-chart": renderBarChart,
    "table": renderTable,
    "status-list": renderStatusList,
    "alert-banner": renderAlertBanner,
    "progress-ring": renderProgressRing,
    "gauge": renderGauge,
    "clock": renderClock,
    "timeline": renderTimeline,
    "calendar": renderCalendar,
    "rss-news": renderListWidget,
    "weather-card": renderWeatherCard,
    "markdown-card": renderMarkdownCard,
    "image-card": renderImageCard,
    "iframe-card": renderIframeCard,
    "qr-card": renderQrCard,
    "network-status": renderStatusList,
    "remote-hints": renderRemoteHints,
    "log-tail": renderLogTail,
    "media-tile": renderMediaTile,
  };

  const grid = $("#card-grid");
  const modal = $("#detail-modal");

  function config() {
    return window.KIOSK_SHELL_CONFIG || { title: "Linux TV Kiosk Shell", cards: [] };
  }

  function live() {
    return window.KIOSK_LIVE || {};
  }

  function valueAt(root, path, fallback = "—") {
    if (!path) return fallback;
    let cur = root;
    for (const part of String(path).split(".")) {
      if (cur == null || typeof cur !== "object" || !(part in cur)) return fallback;
      cur = cur[part];
    }
    return cur == null || cur === "" ? fallback : cur;
  }

  function text(value) {
    return String(value ?? "—").replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]));
  }

  function render() {
    const cfg = config();
    $("#shell-title").textContent = cfg.title || "Linux TV Kiosk Shell";
    $("#shell-eyebrow").textContent = cfg.eyebrow || "LOCAL KIOSK";
    $("#shell-status").textContent = live().status || "static demo";
    $("#shell-ticker").textContent = valueAt(live(), cfg.tickerPath || "ticker", cfg.ticker || "Ready");

    state.cards = Array.isArray(cfg.cards) ? cfg.cards : [];
    grid.innerHTML = state.cards.map((card, index) => renderCard(card, index)).join("");
    focusCard(Math.min(state.focus, Math.max(0, state.cards.length - 1)));
  }

  function renderCard(card, index) {
    const root = live();
    const stateValue = valueAt(root, card.statePath, card.state || "");
    const kind = String(card.kind || card.renderer || "stat-card");
    const renderer = WIDGET_RENDERERS[kind] || renderStatCard;
    return `<article class="card" tabindex="-1" data-index="${index}" data-state="${text(stateValue)}" aria-label="${text(card.title)}" data-kind="${text(kind)}">
      ${renderCardHeader(card, kind)}
      ${renderer(card, root)}
    </article>`;
  }

  function renderCardHeader(card, kind) {
    return `<div><p class="eyebrow">${text(card.kicker || kind || card.id || "CARD")}</p><h2>${text(card.title)}</h2></div>`;
  }

  function renderStatCard(card, root) {
    const value = valueAt(root, card.valuePath, card.value ?? "—");
    const meta = valueAt(root, card.metaPath, card.meta ?? "");
    return `<div><div class="value">${text(value)}${card.unit ? `<small>${text(card.unit)}</small>` : ""}</div><p class="meta">${text(meta)}</p></div>`;
  }

  function renderSparkline(card, root) {
    const value = valueAt(root, card.valuePath, card.value ?? "—");
    return `<div><div class="sparkline" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div><p class="meta">${text(value)} ${text(card.unit || "")}</p></div>`;
  }

  function renderLineChart(card, root) { return renderSparkline(card, root); }

  function renderBarChart(card, root) {
    const items = asArray(valueAt(root, card.itemsPath, card.items || []));
    const bars = (items.length ? items : [20, 60, 45, 80]).slice(0, 6).map((item, i) => {
      const value = typeof item === "number" ? item : Number(item?.[card.valueKey || "value"] || 20 + i * 10);
      return `<i style="height:${Math.max(8, Math.min(100, value))}%"></i>`;
    }).join("");
    return `<div><div class="bar-chart" aria-hidden="true">${bars}</div><p class="meta">${text(card.meta || "Bar comparison")}</p></div>`;
  }

  function renderTable(card, root) {
    const rows = asArray(valueAt(root, card.rowsPath, card.rows || []));
    const columns = asArray(card.columns || ["name", "state"]);
    const html = rows.slice(0, 3).map((row) => `<li>${columns.map((key) => `<span>${text(row?.[key] ?? "—")}</span>`).join("")}</li>`).join("");
    return `<div><ul class="mini-table">${html || "<li><span>—</span><span>—</span></li>"}</ul></div>`;
  }

  function renderStatusList(card, root) {
    const items = asArray(valueAt(root, card.itemsPath, card.items || []));
    const html = items.slice(0,4).map((item) => `<li data-state="${text(item?.state || item?.[card.stateKey || "state"] || "ok")}">${text(item?.label || item?.name || item)}</li>`).join("") || '<li data-state="ok">OK</li>';
    return `<div><ul class="status-list">${html}</ul></div>`;
  }

  function renderAlertBanner(card, root) {
    const message = valueAt(root, card.messagePath, card.message || "No alerts");
    return `<div><div class="alert-banner">${text(message)}</div><p class="meta">${text(valueAt(root, card.severityPath, card.severity || "ok"))}</p></div>`;
  }

  function renderProgressRing(card, root) {
    const value = Number(valueAt(root, card.valuePath, card.value ?? 0));
    return `<div><div class="ring" style="--pct:${Math.max(0, Math.min(100, value))}"><span>${text(value)}${text(card.unit || "%")}</span></div></div>`;
  }

  function renderGauge(card, root) { return renderProgressRing(card, root); }

  function renderClock(card, root) {
    const value = valueAt(root, card.valuePath, card.value || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    return `<div><div class="value">${text(value)}</div><p class="meta">${text(card.timezone || "local")}</p></div>`;
  }

  function renderTimeline(card, root) { return renderListWidget({ ...card, itemsPath: card.itemsPath || card.eventsPath }, root); }
  function renderCalendar(card, root) { return renderTimeline(card, root); }

  function renderListWidget(card, root) {
    const items = asArray(valueAt(root, card.itemsPath, card.items || []));
    return `<div><ul class="compact-list">${items.slice(0, Number(card.limit || 4)).map((item) => `<li>${text(item?.title || item?.label || item)}</li>`).join("") || "<li>—</li>"}</ul></div>`;
  }

  function renderWeatherCard(card, root) {
    const condition = valueAt(root, card.conditionPath, card.condition || "Clear");
    const temp = valueAt(root, card.tempPath, card.temp || "—");
    return `<div><div class="value">${text(temp)}</div><p class="meta">${text(condition)} · ${text(card.location || "Local")}</p></div>`;
  }

  function renderMarkdownCard(card) { return `<div><p class="meta markdown-text">${text(card.text || "")}</p></div>`; }

  function renderImageCard(card) { return `<div><div class="image-placeholder">IMG</div><p class="meta">${text(card.alt || card.src || "image")}</p></div>`; }

  function renderIframeCard(card) { return `<div><div class="iframe-placeholder">IFRAME</div><p class="meta">${text(card.src || "about:blank")}</p></div>`; }

  function renderQrCard(card) { return `<div><div class="qr-placeholder">▦</div><p class="meta">${text(card.caption || card.payload || "QR")}</p></div>`; }

  function renderRemoteHints(card) { return `<div><p class="remote-hints">↑ ↓ ← → · OK · Back</p><p class="meta">${text(card.layout || "compact")}</p></div>`; }

  function renderLogTail(card, root) {
    const lines = asArray(valueAt(root, card.linesPath, card.lines || []));
    return `<div><pre class="log-tail">${text(lines.slice(-Number(card.limit || 5)).join("\n") || "no logs")}</pre></div>`;
  }

  function renderMediaTile(card, root) {
    const title = valueAt(root, card.titlePath, card.mediaTitle || card.title);
    const status = valueAt(root, card.statusPath, card.status || "ready");
    return `<div><div class="media-tile">▶</div><p class="meta">${text(title)} · ${text(status)}</p></div>`;
  }

  function asArray(value) { return Array.isArray(value) ? value : []; }

  function focusCard(index) {
    const cards = [...document.querySelectorAll(".card")];
    if (!cards.length) return;
    state.focus = Math.max(0, Math.min(index, cards.length - 1));
    cards.forEach((el) => el.classList.remove("is-focused"));
    const el = cards[state.focus];
    el.classList.add("is-focused");
    el.focus({ preventScroll: true });
  }

  function move(dx, dy) {
    const cols = Number(config().columns || 4);
    const next = state.focus + dx + dy * cols;
    focusCard(next);
  }

  function openFocused() {
    const card = state.cards[state.focus];
    if (!card || !modal) return;
    state.modalOpen = true;
    $("#modal-kicker").textContent = card.kicker || card.id || "DETAIL";
    $("#modal-title").textContent = card.title || "Card";
    const root = live();
    const details = Array.isArray(card.details) ? card.details : [
      { label: "Value", path: card.valuePath },
      { label: "Meta", path: card.metaPath },
      { label: "State", path: card.statePath },
    ];
    $("#modal-body").innerHTML = `<ul class="detail-list">${details.map((d) => `<li><strong>${text(d.label)}</strong><span>${text(valueAt(root, d.path, d.value ?? "—"))}</span></li>`).join("")}</ul>`;
    modal.showModal();
  }

  function closeModal() {
    if (modal?.open) modal.close();
    state.modalOpen = false;
    focusCard(state.focus);
  }

  function handleAction(action) {
    if (state.modalOpen && ["back", "left", "escape"].includes(action)) return closeModal();
    if (action === "up") move(0, -1);
    else if (action === "down") move(0, 1);
    else if (action === "left") move(-1, 0);
    else if (action === "right") move(1, 0);
    else if (action === "center" || action === "enter") openFocused();
    else if (action === "home") focusCard(0);
    else if (action === "back" || action === "escape") closeModal();
  }

  function pollRemoteBridge() {
    const payload = window.KIOSK_REMOTE_ACTION;
    if (payload && Number(payload.seq) > state.remoteSeq) {
      state.remoteSeq = Number(payload.seq);
      handleAction(String(payload.action || ""));
    }
  }

  document.addEventListener("keydown", (event) => {
    const map = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right", Enter: "enter", Escape: "escape", Backspace: "back", Home: "home" };
    if (map[event.key]) { event.preventDefault(); handleAction(map[event.key]); }
  });
  document.addEventListener("click", (event) => {
    const card = event.target.closest?.(".card");
    if (card) { focusCard(Number(card.dataset.index || 0)); openFocused(); }
  });
  $("#modal-close")?.addEventListener("click", closeModal);
  modal?.addEventListener("cancel", (event) => { event.preventDefault(); closeModal(); });

  render();
  window.setInterval(pollRemoteBridge, 120);
  window.KIOSK_SHELL = { render, focusCard, handleAction, widgetRenderers: Object.keys(WIDGET_RENDERERS) };
})();
