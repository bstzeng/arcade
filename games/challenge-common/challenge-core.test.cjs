'use strict';
const assert = require('node:assert/strict');
const { createController, jsonSafe } = require('./core.js');
let assertions = 0;
const ok = (value, label) => { assert(value, label); assertions++; };
const eq = (a, b, label) => { assert.deepEqual(a, b, label); assertions++; };
const memory = () => ({ data: {}, getItem(k) { return this.data[k] || null; }, setItem(k, v) { this.data[k] = v; } });
const engine = {
  createState() { return { value: 0 }; },
  validateState(l, s) { return !!s && Number.isInteger(s.value) && s.value >= 0 && s.value <= l.target; },
  applyAction(l, s, a) { if (a.type === 'bad') return { value: NaN }; if (a.type === 'throw') { s.value = 99; throw Error('Invalid action.'); } if (a.type === 'noop') return s; if (a.type !== 'add' || a.value !== 1) throw Error('Only increment by one.'); return { value: s.value + 1 }; },
  inspect(l, s) { return { status: s.value === l.target ? 'won' : 'playing', goalMet: s.value === l.target }; },
  hint(l, s) { return s.value < l.target ? { text: 'Increase the counter by one.', action: { type: 'add', value: 1 }, kind: 'verified-current-state' } : null; }
};
const levels = Array.from({ length: 100 }, (_, i) => ({ id: 'level-' + (i + 1), title: 'Challenge ' + (i + 1), target: i % 4 + 2 }));
const add = { type: 'add', value: 1 };
const boot = (storage, more) => createController({ gameId: 'counter-test', revision: 'rules-1', levels, engine, storage, ...more });
const storage = memory(), c = boot(storage);
eq(c.snapshot().progress, { total: 100, completed: 0, unassisted: 0, assisted: 0 });
ok(c.dispatch(add).ok); const before = c.snapshot().state;
ok(!c.dispatch({ type: 'throw' }).ok); eq(c.snapshot().state, before, 'mutation before rejection cannot leak');
ok(!c.dispatch({ type: 'bad' }).ok); eq(c.snapshot().state, before, 'non-finite state rejected');
ok(!c.dispatch({ type: 'noop' }).ok); eq(c.snapshot().state, before);
ok(c.hint().ok); eq(c.snapshot().state, before, 'hint does not apply move'); ok(c.snapshot().assisted);
ok(c.undo().ok); eq(c.snapshot().state, { value: 0 }); ok(c.snapshot().assisted, 'undo cannot erase assistance');
ok(c.dispatch(add).ok); ok(c.dispatch(add).ok); eq(c.snapshot().progress.assisted, 1);
ok(c.undo().ok); eq(c.snapshot().inspection.goalMet, false); eq(c.snapshot().progress.completed, 1, 'historical completion retained after undo');
c.reset(); eq(c.snapshot().state, { value: 0 }); ok(!c.snapshot().assisted); c.dispatch(add); c.dispatch(add); eq(c.snapshot().progress.unassisted, 1, 'later unassisted completion upgrades result');
c.select('level-2'); c.dispatch(add); const personal = c.snapshot().state;
ok(c.startReplay([add, add, add]).ok); eq(c.snapshot().state, { value: 0 }); ok(!c.dispatch(add).ok, 'cannot play into a replay');
ok(c.stepReplay(3).ok); ok(c.snapshot().inspection.goalMet); eq(c.snapshot().progress.completed, 1, 'replay does not complete the level');
c.stopReplay(); eq(c.snapshot().state, personal, 'replay preserves player position'); ok(c.snapshot().assisted);
c.startReplay([add]); c.select('level-3'); eq(c.snapshot().mode, 'play'); ok(!c.stepReplay().ok, 'navigation cancels replay');
c.startReplay([{ type: 'throw' }]); ok(!c.stepReplay().ok); ok(c.snapshot().replay.error); c.stopReplay(); eq(c.snapshot().state, { value: 0 });
ok(!c.startReplay(null).ok); ok(!c.stepReplay(0).ok); ok(!c.select('missing').ok);
const mutated = c.snapshot(); mutated.state.value = 999; mutated.level.target = 999; eq(c.snapshot().state.value, 0); eq(c.snapshot().level.target, 4);
let notifications = 0; const off = c.subscribe(() => notifications++); c.dispatch(add); ok(notifications === 2); off(); c.dispatch(add); ok(notifications === 2);
c.flush(); const restored = boot(storage); eq(restored.snapshot().state, c.snapshot().state); eq(restored.snapshot().progress, c.snapshot().progress);
const wrongRevision = boot(storage, { revision: 'rules-2' }); eq(wrongRevision.snapshot().progress.completed, 0); ok(wrongRevision.snapshot().storageWarning.includes('版本'));
const corruption = memory(); corruption.setItem(c.storageKey, '{broken'); const bad = boot(corruption); eq(bad.snapshot().state, { value: 0 }); ok(bad.snapshot().storageWarning);
const falseCompletion = memory(); const payload = JSON.parse(storage.getItem(c.storageKey)); payload.records['level-3'].completion = { state: { value: 0 }, assisted: false }; falseCompletion.setItem(c.storageKey, JSON.stringify(payload)); const rejected = boot(falseCompletion); eq(rejected.snapshot().state, { value: 0 }); ok(rejected.snapshot().storageWarning);
const invalidHistory = memory(); const d = JSON.parse(storage.getItem(c.storageKey)); d.records['level-3'].history = [{ value: 3000 }]; invalidHistory.setItem(c.storageKey, JSON.stringify(d)); eq(boot(invalidHistory).snapshot().state, { value: 0 });
const blocked = boot({ getItem() { throw Error('Denied'); }, setItem() { throw Error('Quota'); } }); ok(blocked.snapshot().storageWarning); ok(blocked.dispatch(add).ok); ok(blocked.snapshot().storageWarning);
const deniedRead = {}; Object.defineProperty(deniedRead, 'getItem', { get() { throw Error('Denied'); } }); ok(boot(deniedRead).snapshot().storageWarning);
const transient = boot(null); ok(transient.dispatch(add).ok); ok(transient.snapshot().storageWarning);
const limited = boot(memory(), { historyLimit: 1 }); limited.dispatch(add); limited.dispatch(add); limited.undo(); ok(!limited.undo().ok);
const many = boot(memory());
for (const level of levels) { many.select(level.id); for (let i = 0; i < level.target; i++) ok(many.dispatch(add).ok); ok(many.snapshot().inspection.goalMet); }
eq(many.snapshot().progress, { total: 100, completed: 100, unassisted: 100, assisted: 0 });
const replaySaved = memory(), demo = boot(replaySaved); demo.dispatch(add); demo.startReplay([add, add]); demo.stepReplay(2); const reopened = boot(replaySaved); eq(reopened.snapshot().mode, 'play'); eq(reopened.snapshot().state, { value: 1 }); eq(reopened.snapshot().progress.completed, 0);
const noHint = boot(null, { engine: { ...engine, hint: undefined } }); ok(!noHint.hint().ok);
const brokenHint = boot(null, { engine: { ...engine, hint() { return { text: 'Bad hint', action: { type: 'bad' } }; } } }); ok(!brokenHint.hint().ok); ok(!brokenHint.snapshot().assisted);
const invalidInspector = { ...engine, inspect() { return { status: 'won', goalMet: false }; } }; assert.throws(() => boot(null, { engine: invalidInspector })); assertions++;
assert.throws(() => boot(null, { levels: [levels[0], levels[0]] })); assertions++;
ok(!jsonSafe({ bad: Infinity })); ok(!jsonSafe({ date: new Date() })); ok(!jsonSafe(JSON.parse('{"__proto__":{}}')));
const destroyed = boot(memory()); destroyed.destroy(); assert.throws(() => destroyed.dispatch(add)); assertions++;
console.log(JSON.stringify({ passed: true, assertions, levelsExercised: 100, coverage: ['legal transitions', 'rejected actions are atomic', 'JSON boundaries', 'undo/reset', 'hint assistance', 'separate replay', 'stale navigation', 'completion evidence', 'corrupt and denied storage', 'revision mismatch', 'subscriptions', 'all 100 level flows'], browserVisualQA: false }, null, 2));
