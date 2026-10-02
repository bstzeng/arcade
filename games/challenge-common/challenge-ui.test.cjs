'use strict';
// Controller/DOM flow testing only. This is deliberately not called visual/browser QA.
const assert = require('node:assert/strict');
globalThis.ArcadeChallenge = require('./core.js');
require('./ui.js');
let assertions = 0;
const ok = (x, text) => { assert(x, text); assertions++; };
const eq = (a, b, text) => { assert.deepEqual(a, b, text); assertions++; };
class Element {
 constructor(tag, doc) { this.tagName = tag; this.ownerDocument = doc; this.children = []; this.attributes = {}; this.events = {}; this.textContent = ''; this.hidden = false; this.disabled = false; this.dataset = {}; }
 append(...items) { for (const item of items) { item.parentNode = this; this.children.push(item); } }
 setAttribute(k, v) { this.attributes[k] = String(v); if (k === 'open') this.open = true; }
 getAttribute(k) { return this.attributes[k] || null; }
 addEventListener(k, fn) { (this.events[k] ||= new Set()).add(fn); }
 removeEventListener(k, fn) { this.events[k]?.delete(fn); }
 emit(k, extra) { const event = { target: this, preventDefault() { this.defaultPrevented = true; }, ...extra }; for (const fn of [...this.events[k] || []]) fn(event); return event; }
 focus() { this.ownerDocument.activeElement = this; }
 showModal() { this.open = true; }
 close() { this.open = false; this.emit('close'); }
 remove() { if (this.parentNode) this.parentNode.children = this.parentNode.children.filter(child => child !== this); }
 all() { return [this, ...this.children.flatMap(c => c.all())]; }
}
const doc = { createElement(tag) { return new Element(tag, doc); } }, container = doc.createElement('main');
const levels = [{ id: 'a', title: '第一關', target: 2 }, { id: 'b', title: '第二關', target: 3 }];
const engine = { createState() { return { n: 0 }; }, validateState(l, s) { return Number.isInteger(s.n) && s.n >= 0 && s.n <= l.target; }, applyAction(l, s, a) { if (a !== 1) throw Error('Illegal action.'); return { n: s.n + 1 }; }, inspect(l, s) { return { status: s.n === l.target ? 'won' : 'playing', goalMet: s.n === l.target }; }, hint() { return { text: '前進一格', action: 1 }; } };
const c = ArcadeChallenge.createController({ gameId: 'shell-test', revision: '1', levels, engine, storage: null });
let renderCount = 0, dispatch;
const mounted = ArcadeChallenge.mountControls(container, c, { title: '測試', render(snapshot, fn, board) { renderCount++; dispatch = fn; board.textContent = String(snapshot.state.n); }, getReplayActions: level => Array(level.target).fill(1) });
const find = (tag, text) => container.all().find(n => n.tagName === tag && (text === undefined || n.textContent === text));
const buttons = text => container.all().filter(n => n.tagName === 'button' && n.textContent === text);
const reset = buttons('重新開始')[0], confirm = buttons('重新開始')[1], cancel = find('button', '保留盤面'), dialog = find('dialog'), select = find('select');
eq(select.children.length, 2); eq(select.getAttribute('aria-label'), '選擇關卡'); ok(find('button', '上一關').disabled); ok(!find('button', '下一關').disabled);
ok(renderCount > 0); dispatch(1); eq(c.snapshot().state.n, 1);
reset.emit('click'); ok(dialog.open); eq(doc.activeElement, cancel); cancel.emit('click'); ok(!dialog.open); eq(c.snapshot().state.n, 1); eq(doc.activeElement, reset);
reset.emit('click'); dialog.emit('cancel'); confirm.emit('click'); eq(c.snapshot().state.n, 1, 'Escape cancels stale reset callback');
reset.emit('click'); c.select('b'); confirm.emit('click'); eq(c.snapshot().levelId, 'b'); eq(c.snapshot().attempts, 1, 'external navigation invalidates reset');
c.select('a'); reset.emit('click'); dispatch(1); confirm.emit('click'); eq(c.snapshot().state.n, 2, 'playing invalidates stale reset');
reset.emit('click'); confirm.emit('click'); eq(c.snapshot().state.n, 0); const attempts = c.snapshot().attempts; confirm.emit('click'); eq(c.snapshot().attempts, attempts, 'double confirmation has no effect');
find('button', '提示').emit('click'); eq(c.snapshot().state.n, 0); ok(c.snapshot().assisted); ok(container.all().some(n => n.textContent === '前進一格'));
find('button', '解答示範').emit('click'); eq(c.snapshot().mode, 'replay'); ok(!find('button', '示範下一步').hidden);
find('button', '示範下一步').emit('click'); find('button', '示範下一步').emit('click'); ok(c.snapshot().inspection.goalMet); eq(c.snapshot().progress.completed, 1, 'preview did not add to earlier genuine progress'); ok(find('button', '示範下一步').disabled);
find('button', '返回我的盤面').emit('click'); eq(c.snapshot().state.n, 0); eq(c.snapshot().mode, 'play');
select.value = 'b'; select.emit('change'); eq(c.snapshot().levelId, 'b'); ok(find('button', '下一關').disabled);
find('button', '上一關').emit('click'); eq(c.snapshot().levelId, 'a'); find('button', '下一關').emit('click'); eq(c.snapshot().levelId, 'b');
const prior = c.snapshot().state; dispatch(999); eq(c.snapshot().state, prior); ok(container.all().some(n => n.textContent === 'Illegal action.'));
reset.emit('click'); mounted.destroy(); ok(!dialog.open); eq(container.children.length, 0); const rendersBefore = renderCount; c.reset(); eq(renderCount, rendersBefore);
console.log(JSON.stringify({ passed: true, assertions, scope: 'Simulated DOM lifecycle', coverage: ['selection boundaries', 'accessible control labels', 'reset confirm/cancel/Escape/double click', 'stale navigation and play', 'focus return', 'hint and replay separation', 'illegal action reporting', 'listener cleanup'], browserVisualQA: false }, null, 2));
