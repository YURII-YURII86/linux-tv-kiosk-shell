'use strict';

const fs = require('fs');
const vm = require('vm');

class ClassList {
  constructor() { this.items = new Set(); }
  add(value) { this.items.add(value); }
  remove(value) { this.items.delete(value); }
  contains(value) { return this.items.has(value); }
}

class Element {
  constructor(id = '', documentRef = null) {
    this.id = id;
    this.documentRef = documentRef;
    this.textContent = '';
    this.dataset = {};
    this.classList = new ClassList();
    this.listeners = {};
    this.open = false;
    this._innerHTML = '';
  }
  set innerHTML(value) {
    this._innerHTML = String(value);
    if (this.id === 'card-grid' && this.documentRef) {
      this.documentRef.cards = [];
      const regex = /<article class="card" tabindex="-1" data-index="(\d+)" data-state="([^"]*)" aria-label="([^"]*)"(?: data-kind="([^"]*)")?>/g;
      let match;
      while ((match = regex.exec(this._innerHTML))) {
        const card = new Element(`card-${match[1]}`, this.documentRef);
        card.classList.add('card');
        card.dataset.index = match[1];
        card.dataset.state = match[2];
        card.ariaLabel = match[3];
        card.dataset.kind = match[4] || '';
        this.documentRef.cards.push(card);
      }
    }
  }
  get innerHTML() { return this._innerHTML; }
  focus() { if (this.documentRef) this.documentRef.activeElement = this; }
  addEventListener(name, fn) { this.listeners[name] = fn; }
  showModal() { this.open = true; }
  close() { this.open = false; }
  closest(selector) { return selector === '.card' && this.classList.contains('card') ? this : null; }
}

class DocumentFake {
  constructor() {
    this.cards = [];
    this.listeners = {};
    this.activeElement = null;
    this.elements = {};
    for (const id of ['card-grid', 'detail-modal', 'shell-eyebrow', 'shell-title', 'shell-status', 'shell-ticker', 'modal-kicker', 'modal-title', 'modal-body', 'modal-close']) {
      this.elements[`#${id}`] = new Element(id, this);
    }
  }
  querySelector(selector) {
    if (selector === '.card') return this.cards[0] || null;
    return this.elements[selector] || null;
  }
  querySelectorAll(selector) {
    if (selector === '.card') return this.cards;
    return [];
  }
  addEventListener(name, fn) { this.listeners[name] = fn; }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const documentFake = new DocumentFake();
const timers = [];
const context = {
  console,
  document: documentFake,
  window: {},
  setInterval: (fn) => { timers.push(fn); return timers.length; },
};
context.window = context;
context.window.document = documentFake;
context.window.setInterval = context.setInterval;
vm.createContext(context);

for (const file of ['data/shell-config.js', 'data/live.example.js', 'src/shell.js']) {
  vm.runInContext(fs.readFileSync(file, 'utf8'), context, { filename: file });
}

const cfg = context.window.KIOSK_SHELL_CONFIG;
assert(cfg && Array.isArray(cfg.cards), 'config cards missing');
assert(documentFake.cards.length === cfg.cards.length, `expected ${cfg.cards.length} cards, got ${documentFake.cards.length}`);
assert(documentFake.elements['#shell-title'].textContent === cfg.title, 'title not rendered');
assert(documentFake.elements['#shell-status'].textContent === context.window.KIOSK_LIVE.status, 'live status not rendered');
assert(documentFake.cards[0].classList.contains('is-focused'), 'first card should be focused');

context.window.KIOSK_SHELL.handleAction('right');
assert(documentFake.cards[1].classList.contains('is-focused'), 'right action should focus second card');
context.window.KIOSK_SHELL.handleAction('down');
assert(documentFake.cards[5].classList.contains('is-focused'), 'down action should move by columns');
context.window.KIOSK_SHELL.handleAction('center');
assert(documentFake.elements['#detail-modal'].open === true, 'center action should open modal');
assert(documentFake.elements['#modal-title'].textContent === cfg.cards[5].title, 'modal should show focused card title');
context.window.KIOSK_SHELL.handleAction('back');
assert(documentFake.elements['#detail-modal'].open === false, 'back action should close modal');

context.window.KIOSK_REMOTE_ACTION = { seq: 1, action: 'home' };
assert(timers.length >= 1, 'remote bridge poll timer not registered');
timers[0]();
assert(documentFake.cards[0].classList.contains('is-focused'), 'remote home should focus first card');

context.window.KIOSK_REMOTE_ACTION = { seq: 2, action: 'right' };
timers[0]();
assert(documentFake.cards[1].classList.contains('is-focused'), 'remote right should focus second card');

console.log('dom smoke ok');
