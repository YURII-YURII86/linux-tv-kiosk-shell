'use strict';

const fs = require('fs');
const vm = require('vm');

const EXPECTED = [
  'stat-card','sparkline','line-chart','bar-chart','table','status-list','alert-banner','progress-ring','gauge','clock','timeline','calendar','rss-news','weather-card','markdown-card','image-card','iframe-card','qr-card','network-status','remote-hints','log-tail','media-tile'
];

class ClassList { constructor(){ this.items = new Set(); } add(v){ this.items.add(v); } remove(v){ this.items.delete(v); } contains(v){ return this.items.has(v); } }
class Element {
  constructor(id='', doc=null){ this.id=id; this.documentRef=doc; this.textContent=''; this.dataset={}; this.classList=new ClassList(); this.listeners={}; this.open=false; this._innerHTML=''; }
  set innerHTML(value){ this._innerHTML=String(value); if(this.id === 'card-grid' && this.documentRef){ this.documentRef.cards=[]; const regex=/<article class="card" tabindex="-1" data-index="(\d+)" data-state="([^"]*)" aria-label="([^"]*)" data-kind="([^"]*)">/g; let match; while((match=regex.exec(this._innerHTML))){ const card=new Element(`card-${match[1]}`, this.documentRef); card.classList.add('card'); card.dataset.index=match[1]; card.dataset.state=match[2]; card.dataset.kind=match[4]; this.documentRef.cards.push(card); } } }
  get innerHTML(){ return this._innerHTML; }
  focus(){ if(this.documentRef) this.documentRef.activeElement=this; }
  addEventListener(name, fn){ this.listeners[name]=fn; }
  showModal(){ this.open=true; }
  close(){ this.open=false; }
  closest(selector){ return selector === '.card' && this.classList.contains('card') ? this : null; }
}
class DocumentFake {
  constructor(){ this.cards=[]; this.listeners={}; this.activeElement=null; this.elements={}; for(const id of ['card-grid','detail-modal','shell-eyebrow','shell-title','shell-status','shell-ticker','modal-kicker','modal-title','modal-body','modal-close']) this.elements[`#${id}`]=new Element(id,this); }
  querySelector(selector){ if(selector === '.card') return this.cards[0] || null; return this.elements[selector] || null; }
  querySelectorAll(selector){ if(selector === '.card') return this.cards; return []; }
  addEventListener(name, fn){ this.listeners[name]=fn; }
}
function assert(condition, message){ if(!condition) throw new Error(message); }

const cards = EXPECTED.map((kind, index) => ({ id: `${kind}-demo`, kind, kicker: kind, title: kind, value: index + 1, valuePath: `demo.${kind}.value`, meta: 'renderer coverage', state: 'ok', items: [{label:'one', state:'ok'}, {label:'two', state:'warn'}], rows: [{name:'row', state:'ok'}], columns: ['name','state'], text: 'Safe text', src: 'about:blank', alt: 'placeholder', payload: 'demo', lines: ['line one','line two'] }));
const documentFake = new DocumentFake();
const timers=[];
const context={ console, document: documentFake, window: {}, setInterval: (fn)=>{ timers.push(fn); return timers.length; } };
context.window=context; context.window.document=documentFake; context.window.setInterval=context.setInterval;
context.window.KIOSK_SHELL_CONFIG={ title: 'Renderer Coverage', eyebrow: 'TEST', columns: 4, cards };
context.window.KIOSK_LIVE={ status: 'test', ticker: 'renderer coverage', demo: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync('src/shell.js','utf8'), context, { filename: 'src/shell.js' });

const renderers = context.window.KIOSK_SHELL.widgetRenderers;
for(const kind of EXPECTED) assert(renderers.includes(kind), `missing renderer ${kind}`);
assert(documentFake.cards.length === EXPECTED.length, `expected ${EXPECTED.length} rendered cards, got ${documentFake.cards.length}`);
const renderedKinds = documentFake.cards.map(card => card.dataset.kind);
for(const kind of EXPECTED) assert(renderedKinds.includes(kind), `missing rendered kind ${kind}`);
assert(documentFake.elements['#card-grid'].innerHTML.includes('data-kind="iframe-card"'), 'iframe-card markup missing');
assert(documentFake.elements['#card-grid'].innerHTML.includes('data-kind="log-tail"'), 'log-tail markup missing');
console.log(`widget renderer coverage ok (${EXPECTED.length} kinds)`);
