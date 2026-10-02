/* Optional, dependency-free challenge lifecycle. Game rules live in each game's engine. */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ArcadeChallenge = Object.assign(root.ArcadeChallenge || {}, api);
})(typeof globalThis === 'undefined' ? this : globalThis, function () {
  'use strict';
  const FORMAT = 1, MAX_STORAGE_BYTES = 8 * 1024 * 1024;
  const own = (o, key) => Object.prototype.hasOwnProperty.call(o, key);
  function jsonSafe(value, depth) {
    if ((depth || 0) > 80) return false;
    if (value === null || typeof value === 'string' || typeof value === 'boolean') return true;
    if (typeof value === 'number') return Number.isFinite(value);
    if (!value || typeof value !== 'object') return false;
    if (Array.isArray(value)) return value.every(v => jsonSafe(v, (depth || 0) + 1));
    if (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null) return false;
    return Object.keys(value).every(k => k !== '__proto__' && k !== 'constructor' && k !== 'prototype' && jsonSafe(value[k], (depth || 0) + 1));
  }
  function copy(value) {
    if (!jsonSafe(value)) throw new TypeError('State and actions must contain only finite JSON data.');
    return JSON.parse(JSON.stringify(value));
  }
  function freeze(value) {
    if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
    return value;
  }
  function createController(options) {
    if (!options || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(options.gameId || '')) throw new TypeError('A stable gameId is required.');
    if (typeof options.revision !== 'string' || !options.revision) throw new TypeError('A content/rules revision is required.');
    const engine = options.engine;
    for (const name of ['createState', 'validateState', 'applyAction', 'inspect']) if (!engine || typeof engine[name] !== 'function') throw new TypeError('Missing engine adapter: ' + name);
    if (!Array.isArray(options.levels) || !options.levels.length) throw new TypeError('At least one level is required.');
    const levels = options.levels.map(level => freeze(copy(level))), byId = new Map();
    for (const level of levels) {
      if (typeof level.id !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_.-]{0,79}$/.test(level.id) || byId.has(level.id)) throw new TypeError('Level IDs must be stable and unique.');
      byId.set(level.id, level);
    }
    const historyLimit = Number.isInteger(options.historyLimit) ? Math.max(0, Math.min(500, options.historyLimit)) : 100;
    const storageKey = options.storageKey || 'arcade:challenge:v1:' + options.gameId;
    let storage, storageWarning = '', current = levels[0].id, replay = null, lastHint = null, destroyed = false, sequence = 0;
    const records = new Map(), listeners = new Set();
    try { storage = own(options, 'storage') ? options.storage : typeof localStorage !== 'undefined' ? localStorage : null; }
    catch (_) { storage = null; storageWarning = '本機儲存無法使用；仍可遊玩。'; }
    if (!storage) storageWarning = storageWarning || '本機儲存未啟用；進度只保留在本次頁面。';
    function checkState(level, state) {
      if (!jsonSafe(state)) throw new TypeError('State contains unsupported or non-finite data.');
      if (engine.validateState(level, copy(state)) !== true) throw new Error('Engine rejected the state.');
      return copy(state);
    }
    function inspection(level, state) {
      const result = engine.inspect(level, copy(state));
      if (!result || !['playing', 'won', 'lost'].includes(result.status) || typeof result.goalMet !== 'boolean' || result.goalMet !== (result.status === 'won')) throw new TypeError('inspect must return consistent status and goalMet.');
      return copy(result);
    }
    function blank(level) {
      const state = checkState(level, engine.createState(level));
      inspection(level, state);
      return { state, history: [], attempts: 1, hints: 0, assisted: false, completion: null };
    }
    function getRecord(id) {
      if (!records.has(id)) records.set(id, blank(byId.get(id)));
      return records.get(id);
    }
    function progress() {
      let completed = 0, unassisted = 0;
      for (const record of records.values()) if (record.completion) { completed++; if (!record.completion.assisted) unassisted++; }
      return { total: levels.length, completed, unassisted, assisted: completed - unassisted };
    }
    function snapshot() {
      const level = byId.get(current), record = getRecord(current), visibleState = replay ? replay.state : record.state;
      return { gameId: options.gameId, revision: options.revision, sequence, level: copy(level), levelId: current, levelIndex: levels.findIndex(p => p.id === current),
        levels: levels.map(p => ({ id: p.id, title: typeof p.title === 'string' ? p.title : p.id })), state: copy(visibleState),
        inspection: inspection(level, visibleState), mode: replay ? 'replay' : 'play', canUndo: !replay && record.history.length > 0,
        hint: lastHint ? copy(lastHint) : null, hints: record.hints, assisted: record.assisted, attempts: record.attempts,
        progress: progress(), storageWarning, replay: replay ? { cursor: replay.cursor, total: replay.actions.length, finished: replay.cursor === replay.actions.length, error: replay.error } : null };
    }
    function emit() {
      if (destroyed) return;
      sequence++;
      for (const listener of [...listeners]) {
        try { listener(snapshot()); }
        catch (error) { if (typeof options.onListenerError === 'function') options.onListenerError(error); else if (typeof console !== 'undefined') console.error('Challenge listener failed:', error); }
      }
    }
    function flush() {
      if (destroyed || !storage) return false;
      try {
        const payload = { format: FORMAT, gameId: options.gameId, revision: options.revision, current, records: Object.fromEntries(records) };
        const text = JSON.stringify(payload);
        if (text.length > MAX_STORAGE_BYTES) throw new Error('Save exceeds the supported size.');
        storage.setItem(storageKey, text); storageWarning = ''; return true;
      } catch (_) { storageWarning = '儲存失敗；仍可遊玩，但重新整理後可能失去最新進度。'; return false; }
    }
    function load() {
      if (!storage) return;
      let data;
      try {
        const raw = storage.getItem(storageKey); if (!raw) return;
        if (typeof raw !== 'string' || raw.length > MAX_STORAGE_BYTES) throw new Error('Oversized save.');
        data = JSON.parse(raw);
        if (!jsonSafe(data) || data.format !== FORMAT || data.gameId !== options.gameId) throw new Error('Invalid save format.');
        if (data.revision !== options.revision) { storageWarning = '關卡版本已更新；舊版盤面不會套用到新版關卡。'; return; }
        if (!data.records || Array.isArray(data.records) || typeof data.records !== 'object') throw new Error('Invalid records.');
        if (byId.has(data.current)) current = data.current;
        for (const [id, value] of Object.entries(data.records)) {
          if (!byId.has(id)) continue;
          const level = byId.get(id);
          try {
            if (!value || !Array.isArray(value.history) || value.history.length > historyLimit || !Number.isInteger(value.attempts) || value.attempts < 1 || value.attempts > 1000000 || !Number.isInteger(value.hints) || value.hints < 0 || value.hints > 1000000 || typeof value.assisted !== 'boolean') throw new Error('Invalid record metadata.');
            const record = { state: checkState(level, value.state), history: value.history.map(s => checkState(level, s)), attempts: value.attempts, hints: value.hints, assisted: value.assisted, completion: null };
            inspection(level, record.state);
            if (value.completion) {
              if (typeof value.completion.assisted !== 'boolean') throw new Error('Invalid completion metadata.');
              const evidence = checkState(level, value.completion.state);
              if (!inspection(level, evidence).goalMet) throw new Error('Completion evidence does not meet the goal.');
              record.completion = { state: evidence, assisted: value.completion.assisted };
            }
            records.set(id, record);
          } catch (_) { storageWarning = '部分存檔格式不符，受影響關卡已安全重開。'; }
        }
      } catch (_) { storageWarning = '無法讀取存檔，已安全開啟新進度。'; }
    }
    function requireActive() { if (destroyed) throw new Error('The controller has been destroyed.'); }
    function select(id) {
      requireActive(); if (!byId.has(id)) return { ok: false, error: 'Unknown level.' };
      // Initialize and validate before changing the active selection.
      getRecord(id); current = id; replay = null; lastHint = null; flush(); emit(); return { ok: true };
    }
    function dispatch(action, flags) {
      requireActive(); if (replay) return { ok: false, error: 'Exit the solution preview before playing.' };
      const level = byId.get(current), record = getRecord(current), opts = flags || {};
      try {
        const next = checkState(level, engine.applyAction(level, copy(record.state), copy(action))), result = inspection(level, next);
        if (JSON.stringify(next) === JSON.stringify(record.state)) return { ok: false, error: 'This action does not change the position.' };
        if (opts.checkpoint !== false && historyLimit) { record.history.push(copy(record.state)); if (record.history.length > historyLimit) record.history.shift(); }
        record.state = next; lastHint = null;
        if (result.goalMet && (!record.completion || (record.completion.assisted && !record.assisted))) record.completion = { state: copy(next), assisted: record.assisted };
        if (opts.persist !== false) flush(); emit(); return { ok: true, inspection: result };
      } catch (error) { return { ok: false, error: error && error.message ? error.message : String(error) }; }
    }
    function undo() {
      requireActive(); const record = getRecord(current);
      if (replay || !record.history.length) return { ok: false, error: 'Nothing to undo.' };
      record.state = record.history.pop(); lastHint = null; flush(); emit(); return { ok: true };
    }
    function reset() {
      requireActive(); const level = byId.get(current), record = getRecord(current), fresh = blank(level);
      fresh.attempts = Math.min(1000000, record.attempts + 1); fresh.completion = record.completion;
      records.set(current, fresh); replay = null; lastHint = null; flush(); emit(); return { ok: true };
    }
    function hint() {
      requireActive(); if (replay) return { ok: false, error: 'Exit preview before requesting a hint.' };
      if (typeof engine.hint !== 'function') return { ok: false, error: 'No current-position hint is available.' };
      const level = byId.get(current), record = getRecord(current);
      try {
        const result = engine.hint(level, copy(record.state));
        if (!result) return { ok: false, error: 'No verified hint is available for this position. You can undo or restart.' };
        if (typeof result.text !== 'string' || !result.text.trim()) throw new TypeError('Hints need a human-readable explanation.');
        const prepared = copy(result);
        if (own(prepared, 'action')) checkState(level, engine.applyAction(level, copy(record.state), copy(prepared.action)));
        lastHint = prepared; record.hints = Math.min(1000000, record.hints + 1); record.assisted = true; flush(); emit();
        return { ok: true, hint: copy(prepared) };
      } catch (error) { return { ok: false, error: error.message || String(error) }; }
    }
    function startReplay(actions) {
      requireActive(); if (!Array.isArray(actions) || actions.length > 100000) return { ok: false, error: 'Replay requires a bounded action sequence.' };
      try {
        const level = byId.get(current), prepared = copy(actions), state = checkState(level, engine.createState(level));
        replay = { actions: prepared, cursor: 0, state, error: null }; lastHint = null;
        // Viewing a solution is assistance for the current attempt, but never completion.
        getRecord(current).assisted = true; flush(); emit(); return { ok: true };
      } catch (error) { return { ok: false, error: error.message || String(error) }; }
    }
    function stepReplay(count) {
      requireActive(); if (!replay) return { ok: false, error: 'No replay is active.' };
      if (replay.error) return { ok: false, error: replay.error };
      const steps = count === undefined ? 1 : count;
      if (!Number.isInteger(steps) || steps < 1 || steps > 10000) return { ok: false, error: 'Invalid replay step count.' };
      const level = byId.get(current);
      try {
        for (let n = 0; n < steps && replay.cursor < replay.actions.length; n++) {
          replay.state = checkState(level, engine.applyAction(level, copy(replay.state), copy(replay.actions[replay.cursor])));
          inspection(level, replay.state); replay.cursor++;
        }
        emit(); return { ok: true, finished: replay.cursor === replay.actions.length };
      } catch (error) { replay.error = error.message || String(error); emit(); return { ok: false, error: replay.error }; }
    }
    function stopReplay() { requireActive(); replay = null; lastHint = null; emit(); return { ok: true }; }
    function subscribe(listener) { requireActive(); if (typeof listener !== 'function') throw new TypeError('A listener is required.'); listeners.add(listener); listener(snapshot()); return () => listeners.delete(listener); }
    function destroy() { if (!destroyed) { flush(); listeners.clear(); replay = null; destroyed = true; } }
    load(); getRecord(current);
    return Object.freeze({ select, dispatch, undo, reset, hint, startReplay, stepReplay, stopReplay, snapshot, subscribe, flush, destroy, storageKey });
  }
  return { createController, jsonSafe, copy, formatVersion: FORMAT };
});
