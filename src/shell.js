(() => {
  "use strict";

  const state = { focus: 0, remoteSeq: 0, cards: [], modalOpen: false };
  const $ = (sel) => document.querySelector(sel);
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
    const value = valueAt(root, card.valuePath, card.value ?? "—");
    const meta = valueAt(root, card.metaPath, card.meta ?? "");
    const stateValue = valueAt(root, card.statePath, card.state || "");
    return `<article class="card" tabindex="-1" data-index="${index}" data-state="${text(stateValue)}" aria-label="${text(card.title)}">
      <div><p class="eyebrow">${text(card.kicker || card.id || "CARD")}</p><h2>${text(card.title)}</h2></div>
      <div><div class="value">${text(value)}${card.unit ? `<small>${text(card.unit)}</small>` : ""}</div><p class="meta">${text(meta)}</p></div>
    </article>`;
  }

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
  window.KIOSK_SHELL = { render, focusCard, handleAction };
})();
