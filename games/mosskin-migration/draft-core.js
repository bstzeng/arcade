/* Local blueprint authoring only. No campaign profile or simulation state is stored here. */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.MossDraftCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const FORMAT = 'mosskin-migration-draft', VERSION = 1;
  const KEY = 'arcade.classic30.mosskin-migration.v1.draft';
  const SKILLS = Object.freeze(['climb', 'float', 'block', 'bridge', 'bash', 'slope', 'dig', 'pulse']);
  const LIMITS = Object.freeze({ minWidth: 20, width: 180, minHeight: 16, height: 60, population: 80, inventory: 80, json: 1000000 });
  const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  function fail(message) { throw new Error(message); }
  function integer(value, min, max, label) {
    if (!Number.isSafeInteger(value) || value < min || value > max) fail(label + '必須是 ' + min + '–' + max + ' 的整數。');
    return value;
  }
  function object(value, keys, label) {
    if (!value || typeof value !== 'object' || Array.isArray(value) || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) fail(label + '格式不正確。');
    for (const k of Object.keys(value)) {
      if (!keys.includes(k)) fail(label + '含有不支援的欄位：' + k);
      const desc = Object.getOwnPropertyDescriptor(value, k);
      if (!desc || !own(desc, 'value')) fail(label + '不得包含動態屬性。');
    }
  }
  function array(value, min, max, label) {
    if (!Array.isArray(value) || value.length < min || value.length > max) fail(label + '數量不正確。');
    for (let i = 0; i < value.length; i++) if (!own(value, i)) fail(label + '不得包含空缺。');
  }
  function rect(r, d, material, label) {
    object(r, material ? ['x', 'y', 'w', 'h', 'material'] : ['x', 'y', 'w', 'h'], label);
    const v = { x: integer(r.x, 0, d.width - 1, label + ' X'), y: integer(r.y, 0, d.height - 1, label + ' Y') };
    v.w = integer(r.w, 1, d.width - v.x, label + '寬度');
    v.h = integer(r.h, 1, d.height - v.y, label + '高度');
    if (material) v.material = integer(r.material, 1, 3, '地形材質');
    return v;
  }
  function point(p, d, label) {
    return { x: integer(p.x, 0, d.width - 1, label + ' X'), y: integer(p.y, 0, d.height - 1, label + ' Y') };
  }
  function validate(input) {
    object(input, ['format', 'version', 'title', 'width', 'height', 'total', 'need', 'release', 'limit', 'terrain', 'sources', 'exits', 'hazards', 'inventory'], '藍圖');
    if (input.format !== FORMAT || input.version !== VERSION) fail('這不是支援的苔精遷徙藍圖版本。');
    if (typeof input.title !== 'string' || !input.title.trim() || input.title.length > 60 || /[\u0000-\u001f\u007f]/.test(input.title)) fail('藍圖名稱需為 1–60 字，且不可包含控制字元。');
    const d = { format: FORMAT, version: VERSION, title: input.title.trim(), width: integer(input.width, LIMITS.minWidth, LIMITS.width, '地圖寬度'), height: integer(input.height, LIMITS.minHeight, LIMITS.height, '地圖高度'), total: integer(input.total, 20, LIMITS.population, '隊伍人數') };
    d.need = integer(input.need, 1, d.total, '救援目標');
    if (![30, 60, 90, 120].includes(input.release)) fail('出發間隔必須是 30、60、90 或 120。');
    d.release = input.release;
    d.limit = integer(input.limit, 0, 54000, '時間上限');
    array(input.terrain, 0, d.width * d.height, '地形');
    d.terrain = input.terrain.map(r => rect(r, d, true, '地形'));
    array(input.sources, 1, 2, '出發點');
    d.sources = input.sources.map(p => {
      object(p, ['x', 'y', 'dir'], '出發點');
      const v = point(p, d, '出發點');
      if (p.dir !== 1 && p.dir !== -1) fail('出發方向必須是 1 或 -1。');
      v.dir = p.dir;
      return v;
    });
    array(input.exits, 1, 2, '歸巢點');
    d.exits = input.exits.map(p => {
      object(p, ['x', 'y', 'acceptSources'], '歸巢點');
      const v = point(p, d, '歸巢點');
      if (own(p, 'acceptSources')) {
        array(p.acceptSources, 1, d.sources.length, '歸巢隊伍');
        v.acceptSources = p.acceptSources.map(n => integer(n, 0, d.sources.length - 1, '歸巢隊伍'));
        if (new Set(v.acceptSources).size !== v.acceptSources.length) fail('歸巢隊伍不可重複。');
      }
      return v;
    });
    for (let i = 0; i < d.sources.length; i++) if (!d.exits.some(e => !e.acceptSources || e.acceptSources.includes(i))) fail('每支隊伍都需要可用的歸巢點。');
    array(input.hazards, 0, d.width * d.height, '危險區');
    d.hazards = input.hazards.map(r => rect(r, d, false, '危險區'));
    object(input.inventory, SKILLS, '工具庫');
    d.inventory = {};
    for (const k of SKILLS) d.inventory[k] = integer(input.inventory[k], 0, LIMITS.inventory, '工具 ' + k);
    return d;
  }
  function grids(d) {
    const terrain = new Array(d.width * d.height).fill(0), hazards = new Array(d.width * d.height).fill(0);
    for (const r of d.terrain) for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) terrain[y * d.width + x] = r.material;
    for (const r of d.hazards) for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) hazards[y * d.width + x] = 1;
    return { terrain, hazards };
  }
  function rectangles(cells, w, h, material) {
    const result = []; let previous = new Map();
    for (let y = 0; y < h; y++) {
      const current = new Map();
      for (let x = 0; x < w;) {
        const value = cells[y * w + x], start = x++;
        while (x < w && cells[y * w + x] === value) x++;
        if (!value) continue;
        const key = start + ':' + (x - start) + ':' + value;
        let r = previous.get(key);
        if (r) r.h++;
        else { r = { x: start, y, w: x - start, h: 1 }; if (material) r.material = value; result.push(r); }
        current.set(key, r);
      }
      previous = current;
    }
    return result;
  }
  function canonical(input) {
    const d = validate(input), g = grids(d);
    d.terrain = rectangles(g.terrain, d.width, d.height, true);
    d.hazards = rectangles(g.hazards, d.width, d.height, false);
    return d;
  }
  function blank() {
    return validate({ format: FORMAT, version: VERSION, title: '我的林間草圖', width: 100, height: 48, total: 20, need: 20, release: 60, limit: 0,
      terrain: [{ x: 0, y: 37, w: 100, h: 11, material: 1 }], sources: [{ x: 12, y: 37, dir: 1 }], exits: [{ x: 87, y: 37 }], hazards: [], inventory: Object.fromEntries(SKILLS.map(k => [k, 0])) });
  }
  function fromLevel(level) {
    if (!level || typeof level !== 'object') fail('找不到可複製的關卡。');
    if (level.width > LIMITS.width || level.height > LIMITS.height) fail('這張關卡超過草圖的 180×60 格上限；請選較小的關卡或建立空白草圖。');
    const d = { format: FORMAT, version: VERSION, title: (String(level.title || '林間草圖') + '・草圖').slice(0, 60), width: level.width, height: level.height, total: level.total, need: level.need, release: level.release || 60, limit: level.limit || 0,
      terrain: (level.terrain || []).map(r => ({ x: r.x, y: r.y, w: r.w, h: r.h, material: r.material === undefined ? 1 : r.material })),
      sources: (level.sources || []).map(p => ({ x: p.x, y: p.y, dir: p.dir === undefined ? 1 : p.dir })),
      exits: (level.exits || []).map(p => { const e = { x: p.x, y: p.y }; if (p.acceptSources !== undefined) e.acceptSources = p.acceptSources.slice(); return e; }),
      hazards: (level.hazards || []).map(r => ({ x: r.x, y: r.y, w: r.w, h: r.h })), inventory: Object.fromEntries(SKILLS.map(k => [k, level.inventory && own(level.inventory, k) ? level.inventory[k] : 0])) };
    return canonical(d);
  }
  function paint(input, x, y, w, h, tool) {
    const d = validate(input);
    if (!['dirt', 'steel', 'erase', 'hazard'].includes(tool)) fail('不認得這種畫筆。');
    integer(x, 0, d.width - 1, '畫筆 X'); integer(y, 0, d.height - 1, '畫筆 Y');
    integer(w, 1, d.width, '畫筆寬度'); integer(h, 1, d.height, '畫筆高度');
    const g = grids(d);
    for (let yy = y; yy < Math.min(d.height, y + h); yy++) for (let xx = x; xx < Math.min(d.width, x + w); xx++) {
      const i = yy * d.width + xx;
      g.terrain[i] = tool === 'dirt' ? 1 : tool === 'steel' ? 2 : 0;
      g.hazards[i] = tool === 'hazard' ? 1 : 0;
    }
    d.terrain = rectangles(g.terrain, d.width, d.height, true);
    d.hazards = rectangles(g.hazards, d.width, d.height, false);
    return d;
  }
  function setMarker(input, kind, index, marker) {
    const d = validate(input);
    if (kind !== 'source' && kind !== 'exit') fail('不認得這種標記。');
    const list = kind === 'source' ? d.sources : d.exits;
    integer(index, 0, list.length - 1, '標記編號');
    object(marker, kind === 'source' ? ['x', 'y', 'dir'] : ['x', 'y', 'acceptSources'], '標記');
    list[index] = marker;
    return validate(d);
  }
  function setTeams(input, count) {
    const d = validate(input);
    integer(count, 1, 2, '隊伍數');
    if (count === d.sources.length) return d;
    if (count === 2) {
      const q = d.sources[0];
      d.sources.push({ x: Math.min(d.width - 1, q.x + 8), y: q.y, dir: -q.dir });
      if (d.exits.length === 1) { const e = d.exits[0]; d.exits.push({ x: Math.max(0, e.x - 8), y: e.y, acceptSources: [1] }); }
      d.exits[0].acceptSources = [0];
      d.exits[1].acceptSources = [1];
    } else {
      d.sources.length = 1; d.exits.length = 1; delete d.exits[0].acceptSources;
    }
    return validate(d);
  }
  function configure(input, changes) {
    const d = validate(input);
    object(changes, ['title', 'total', 'need', 'release', 'limit', 'inventory'], '草圖設定');
    for (const key of Object.keys(changes)) d[key] = changes[key];
    return validate(d);
  }
  function toLevel(input) {
    const d = canonical(input);
    const level = { id: 'draft-local', mode: 'draft', isDraft: true, chapter: 0, title: d.title, subtitle: '本機地形草圖・不列入旅程紀錄', width: d.width, height: d.height, total: d.total, need: d.need, release: d.release, limit: d.limit, terrain: d.terrain, sources: d.sources, exits: d.exits, hazards: d.hazards, inventory: d.inventory,
      focus: SKILLS.filter(k => d.inventory[k] > 0), hint: '草圖試玩：只使用設定的有限工具。修改地形請返回草圖；此處不計勳章，也不保存旅程進度。', markers: [], decision: '用有限工具帶領隊伍歸巢。', rationale: '本機自訂藍圖', estimatedMinutes: [1, 10], objective: { save: d.need, total: d.total } };
    level.initial = JSON.parse(JSON.stringify({ terrain: level.terrain, sources: level.sources, exits: level.exits, hazards: level.hazards, inventory: level.inventory }));
    level.mechanicFocus = level.focus.slice(); level.intendedDecision = level.decision; level.distinctnessRationale = level.rationale;
    level.estimatedTiming = { minutes: [1, 10], status: 'unmeasured-design-estimate' };
    return level;
  }
  function byteLength(text) {
    let length = 0;
    for (const character of text) { const code = character.codePointAt(0); length += code <= 0x7f ? 1 : code <= 0x7ff ? 2 : code <= 0xffff ? 3 : 4; }
    return length;
  }
  function exportJSON(input) {
    const d = canonical(input), pretty = JSON.stringify(d, null, 2);
    // Very fragmented maps remain re-importable within the same bounded file limit.
    return byteLength(pretty) <= LIMITS.json ? pretty : JSON.stringify(d);
  }
  function importJSON(text) {
    if (typeof text !== 'string' || !text.length || text.length > LIMITS.json || byteLength(text) > LIMITS.json) fail('請選擇小於 1 MB 的 JSON 藍圖。');
    let input;
    try { input = JSON.parse(text); } catch (_) { fail('JSON 格式不正確；原草圖未被更改。'); }
    return canonical(input);
  }
  function save(storage, input) {
    const json = exportJSON(input);
    try { if (!storage || typeof storage.setItem !== 'function') throw Error(); storage.setItem(KEY, json); return { ok: true, json, message: '草圖已儲存在這個瀏覽器。' }; }
    catch (_) { return { ok: false, json, message: '瀏覽器無法儲存。草圖仍可編輯與試玩，請匯出 JSON 保留。' }; }
  }
  function load(storage) {
    try { if (!storage || typeof storage.getItem !== 'function') throw Error(); const json = storage.getItem(KEY); if (json === null) return { ok: false, missing: true }; return { ok: true, draft: importJSON(json) }; }
    catch (_) { return { ok: false, missing: false, message: '無法讀取本機草圖；已保留原儲存資料，請匯入備份或使用新草圖。' }; }
  }
  return Object.freeze({ FORMAT, VERSION, KEY, SKILLS, LIMITS, validate, canonical, blank, fromLevel, paint, setMarker, setTeams, configure, toLevel, exportJSON, importJSON, save, load });
});
