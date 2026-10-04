/* Isolated, local-only terrain sketchbook. The campaign controller owns onTry. */
(function (root) {
  'use strict';
  let active = null, remembered = null;
  const names = { climb: '攀藤', float: '葉傘', block: '守望', bridge: '葉橋', bash: '橫鑿', slope: '斜鑿', dig: '直挖', pulse: '脈衝' };
  function open(options = {}) {
    if (active) { active.focus(); return active; }
    const C = root.MossDraftCore, E = root.MossEngine, R = root.MossRender;
    if (!C || !E || !R) throw Error('請先載入草圖核心、遊戲引擎與繪圖模組。');
    const priorFocus = document.activeElement, abort = new AbortController();
    let storage = options.storage;
    if (storage === undefined) { try { storage = root.localStorage; } catch (_) { storage = null; } }
    const restored = C.load(storage);
    let initialNotice = '', draft;
    if (remembered) draft = C.validate(remembered);
    else if (restored.ok) draft = restored.draft;
    else {
      try { draft = options.baseLevel ? C.fromLevel(options.baseLevel) : C.blank(); }
      catch (error) { draft = C.blank(); initialNotice = error.message; }
      if (!restored.missing && restored.message) initialNotice = restored.message;
    }
    let baseline = restored.ok ? C.exportJSON(restored.draft) : C.exportJSON(draft);
    let dirty = C.exportJSON(draft) !== baseline, history = [], future = [];
    let mode = 'pan', brush = 'dirt', size = 2, cursor = { x: 12, y: Math.min(37, draft.height - 1) };
    let view = { zoom: 1, pan: 0, panY: 0 }, preview, level, frame = 0, closed = false, drag = null, confirmAction = null, confirmFocus = null, fileReadTicket = 0;
    const dialog = document.createElement('dialog');
    dialog.className = 'moss-draft'; dialog.setAttribute('aria-labelledby', 'moss-draft-title');
    dialog.innerHTML = `
      <header class="md-header"><div><p class="md-eyebrow">MOSSKIN FIELD SKETCHBOOK</p><h2 id="moss-draft-title">林間地形草圖</h2></div><button type="button" data-a="close" aria-label="關閉草圖">×</button></header>
      <p class="md-intro">畫一條回家的路。草圖只留在本機；試玩不計勳章，也不更動旅程進度。</p>
      <div class="md-topline"><label class="md-name">草圖名稱<input data-f="title" maxlength="60" autocomplete="off"></label><span data-f="dimensions" class="md-dimensions"></span><span data-f="saved" class="md-save-state"></span></div>
      <div class="md-editor">
        <section class="md-workspace" aria-label="地形畫布">
          <div class="md-toolbar" role="group" aria-label="操作模式"><button type="button" data-mode="pan" aria-pressed="true">✥ 平移</button><button type="button" data-mode="paint" aria-pressed="false">✎ 繪製</button><span class="md-spacer"></span><button type="button" data-a="zoomout" aria-label="縮小草圖">−</button><button type="button" data-a="zoomin" aria-label="放大草圖">＋</button><button type="button" data-a="fit">全景</button></div>
          <div class="md-canvas-wrap"><canvas tabindex="0" role="group" aria-label="地形草圖，使用方向鍵選格，空白鍵或 Enter 放置" aria-describedby="md-key-help md-position"></canvas><span class="md-canvas-badge" data-f="modehint">平移模式 · 拖曳查看地形</span></div>
          <div class="md-position"><span id="md-position" data-f="position" aria-live="polite"></span><button type="button" data-a="place">在選格放置</button></div>
          <p class="md-key-help" id="md-key-help">方向鍵選格，Shift＋方向鍵移動 5 格；繪製模式按空白鍵或 Enter 放置。平移模式拖曳不會改圖。格座標由 0 起算。</p>
          <div class="md-brushes" role="group" aria-label="畫筆"><button type="button" data-brush="dirt" aria-pressed="true">土壤</button><button type="button" data-brush="steel" aria-pressed="false">鋼岩</button><button type="button" data-brush="erase" aria-pressed="false">橡皮擦</button><button type="button" data-brush="hazard" aria-pressed="false">危險區</button></div>
          <div class="md-toolbar"><label>畫筆大小<select data-f="size"><option value="1">1 格</option><option value="2" selected>2×2 格</option><option value="4">4×4 格</option><option value="8">8×8 格</option></select></label><button type="button" data-a="undo">復原</button><button type="button" data-a="redo">重做</button><span class="md-note">橡皮擦會清除土壤與危險區；標記另行移動。</span></div>
        </section>
        <aside class="md-settings" aria-label="草圖規則">
          <fieldset><legend>隊伍與目標</legend><div class="md-fields"><label>隊伍人數<input data-f="total" type="number" min="20" max="80" step="1"></label><label>救援目標<input data-f="need" type="number" min="1" max="80" step="1"></label><label>隊伍數<select data-f="teams"><option value="1">一隊</option><option value="2">兩隊</option></select></label><label>出發間隔<select data-f="release"><option value="30">1 秒</option><option value="60">2 秒</option><option value="90">3 秒</option><option value="120">4 秒</option></select></label></div><p class="md-note">兩隊輪流出發，總人數合計 20–80 位；救援目標不可超過總人數。</p><p class="md-note" data-f="limitnote" hidden></p></fieldset>
          <fieldset><legend>出發與歸巢</legend><p class="md-note">先選標記，再在畫布選格放置。標記座標代表站立的腳下位置。</p><div class="md-markers" data-f="markers"></div></fieldset>
          <fieldset><legend>有限工具庫</legend><div class="md-inventory" data-f="inventory"></div><p class="md-note">每種 0–80 件，試玩依照此數量消耗。沒有無限工具。</p></fieldset>
        </aside>
      </div>
      <div class="md-status" data-f="status" role="status" aria-live="polite"></div>
      <footer class="md-actions"><div><button type="button" data-a="blank">新空白草圖</button><button type="button" data-a="copy">複製目前關卡</button><button type="button" data-a="restore">讀取本機草圖</button></div><div><button type="button" data-a="save">儲存本機</button><button type="button" data-a="json">匯入／匯出</button><button type="button" class="md-primary" data-a="try">試玩這張草圖 →</button></div></footer>
      <section class="md-json" data-f="jsonpanel" hidden aria-label="JSON 藍圖"><h3>帶走這張草圖</h3><p>匯出的是可再編輯的地形藍圖，不含進行中的隊伍或旅程存檔。</p><textarea data-f="jsontext" rows="7" aria-label="JSON 藍圖內容" spellcheck="false"></textarea><div class="md-toolbar"><button type="button" data-a="export">下載 JSON</button><button type="button" data-a="refreshjson">產生目前藍圖</button><button type="button" data-a="import">匯入文字</button><label class="md-file">選擇 JSON 檔<input type="file" data-f="file" accept=".json,application/json"></label><button type="button" data-a="closejson">收起</button></div></section>
      <section class="md-confirm" data-f="confirm" hidden role="alertdialog" aria-modal="true" aria-labelledby="md-confirm-title" aria-describedby="md-confirm-text"><div><h3 id="md-confirm-title">確認取代草圖</h3><p id="md-confirm-text" data-f="confirmtext"></p><div><button type="button" data-a="cancelconfirm">保留目前草圖</button><button type="button" data-a="confirm">確認</button></div></div></section>`;
    document.body.append(dialog);
    const $ = name => dialog.querySelector('[data-f="' + name + '"]');
    const action = name => dialog.querySelector('[data-a="' + name + '"]');
    const canvas = dialog.querySelector('canvas');
    const listen = (node, name, fn) => node.addEventListener(name, fn, { signal: abort.signal });
    function status(message, bad = false) { $('status').textContent = message; $('status').classList.toggle('md-warning', bad); }
    function number(input) { if (input.value.trim() === '') throw Error('請輸入完整整數。'); const n = Number(input.value); if (!Number.isSafeInteger(n)) throw Error('請輸入完整整數。'); return n; }
    function report(error) { status(error.message || String(error), true); }
    function notify(message) { if (typeof options.onMessage === 'function') options.onMessage(message); }
    function refreshState() {
      level = C.toLevel(draft); preview = E.create(level);
      remembered = C.validate(draft); dirty = C.exportJSON(draft) !== baseline;
      $('title').value = draft.title; $('total').value = draft.total; $('need').value = draft.need; $('need').max = draft.total; $('teams').value = draft.sources.length; $('release').value = draft.release;
      $('limitnote').hidden = !draft.limit; $('limitnote').textContent = draft.limit ? '這張藍圖設定的試玩時限：' + (draft.limit / 30).toFixed(1) + ' 秒。' : '';
      $('dimensions').textContent = draft.width + ' × ' + draft.height + ' 格';
      $('saved').textContent = dirty ? '尚未儲存的修改' : '目前藍圖'; $('saved').classList.toggle('md-unsaved', dirty);
      action('undo').disabled = !history.length; action('redo').disabled = !future.length; action('copy').disabled = !options.baseLevel;
      for (const key of C.SKILLS) dialog.querySelector('[data-inventory="' + key + '"]').value = draft.inventory[key];
      buildMarkers(); cursor.x = Math.min(cursor.x, draft.width - 1); cursor.y = Math.min(cursor.y, draft.height - 1); selection(); requestDraw();
    }
    function checkpoint() { history.push(C.validate(draft)); if (history.length > 24) history.shift(); future = []; }
    function commit(next, record = true) { if (C.exportJSON(next) === C.exportJSON(draft)) return; fileReadTicket++; if (record) checkpoint(); draft = next; refreshState(); }
    function replace(next) { fileReadTicket++; draft = C.validate(next); history = []; future = []; view = { zoom: 1, pan: 0, panY: 0 }; brush = 'dirt'; refreshState(); status('已換上新藍圖。按「儲存本機」可保留；試玩前也會嘗試保存。'); }
    function setMode(value) { mode = value; for (const b of dialog.querySelectorAll('[data-mode]')) b.setAttribute('aria-pressed', String(b.dataset.mode === mode)); $('modehint').textContent = mode === 'pan' ? '平移模式 · 拖曳查看地形' : '繪製模式 · 拖曳落筆'; canvas.classList.toggle('md-painting', mode === 'paint'); action('place').disabled = mode !== 'paint'; }
    function selection() {
      const terrain = preview.terrain[cursor.y * draft.width + cursor.x];
      const hazard = draft.hazards.some(r => cursor.x >= r.x && cursor.x < r.x + r.w && cursor.y >= r.y && cursor.y < r.y + r.h);
      $('position').textContent = '選格 X ' + cursor.x + ' · Y ' + cursor.y + ' · ' + (hazard ? '危險區' : ['空氣', '土壤', '鋼岩', '葉橋'][terrain]);
      for (const b of dialog.querySelectorAll('[data-brush]')) b.setAttribute('aria-pressed', String(b.dataset.brush === brush));
    }
    function buildMarkers() {
      const holder = $('markers'); holder.replaceChildren();
      for (const kind of ['source', 'exit']) {
        const list = kind === 'source' ? draft.sources : draft.exits;
        list.forEach((marker, index) => {
          const row = document.createElement('div'); row.className = 'md-marker-row';
          const button = document.createElement('button'); button.type = 'button'; button.dataset.brush = kind + '-' + index; button.textContent = (kind === 'source' ? (index === 0 ? '甲出發' : '乙出發') : (index === 0 ? '第一巢' : '第二巢')) + ' (' + marker.x + ',' + marker.y + ')';
          button.setAttribute('aria-pressed', String(button.dataset.brush === brush)); row.append(button);
          const select = document.createElement('select'); select.dataset.markerKind = kind; select.dataset.markerIndex = String(index); select.setAttribute('aria-label', kind === 'source' ? (index === 0 ? '甲隊出發方向' : '乙隊出發方向') : (index === 0 ? '第一巢接收隊伍' : '第二巢接收隊伍'));
          const entries = kind === 'source' ? [['1', '向右 →'], ['-1', '← 向左']] : [['any', '所有隊伍'], ['0', '只收甲隊'], ...(draft.sources.length > 1 ? [['1', '只收乙隊']] : [])];
          for (const [value, label] of entries) { const option = document.createElement('option'); option.value = value; option.textContent = label; select.append(option); }
          select.value = kind === 'source' ? String(marker.dir) : !marker.acceptSources || marker.acceptSources.length > 1 ? 'any' : String(marker.acceptSources[0]);
          row.append(select); holder.append(row);
        });
      }
    }
    listen($('markers'), 'change', event => {
      const select = event.target, kind = select.dataset.markerKind, index = Number(select.dataset.markerIndex);
      if (!kind) return;
      try {
        const marker = (kind === 'source' ? draft.sources : draft.exits)[index], replacement = { x: marker.x, y: marker.y };
        if (kind === 'source') replacement.dir = Number(select.value);
        else if (select.value !== 'any') replacement.acceptSources = [Number(select.value)];
        commit(C.setMarker(draft, kind, index, replacement));
      } catch (error) { report(error); refreshState(); }
      const replacement = dialog.querySelector('[data-marker-kind="' + kind + '"][data-marker-index="' + index + '"]');
      if (replacement) replacement.focus();
    });
    for (const key of C.SKILLS) {
      const label = document.createElement('label'); label.textContent = names[key];
      const input = document.createElement('input'); input.type = 'number'; input.min = '0'; input.max = '80'; input.step = '1'; input.dataset.inventory = key; label.append(input); $('inventory').append(label);
      listen(input, 'change', () => { try { commit(C.configure(draft, { inventory: { ...draft.inventory, [key]: number(input) } })); } catch (error) { report(error); refreshState(); } });
    }
    function clampView() {
      const rect = canvas.getBoundingClientRect(), scale = Math.min(rect.width / draft.width, rect.height / draft.height) * view.zoom;
      const maxX = Math.max(0, (draft.width * scale - rect.width) / 2), maxY = Math.max(0, (draft.height * scale - rect.height) / 2);
      view.pan = Math.max(-maxX, Math.min(maxX, view.pan)); view.panY = Math.max(-maxY, Math.min(maxY, view.panY));
    }
    function requestDraw() { if (!frame && !closed) frame = requestAnimationFrame(draw); }
    function draw() {
      frame = 0; if (closed) return; clampView();
      const t = R.draw(canvas, preview, level, view, null, { reduced: true });
      if (!t || !Number.isFinite(t.scale) || t.scale <= 0) return;
      const context = canvas.getContext('2d'); context.save(); context.translate(t.x, t.y); context.scale(t.scale, t.scale);
      if (t.scale >= 7) { context.strokeStyle = 'rgba(229,234,194,.12)'; context.lineWidth = 1 / t.scale; context.beginPath(); for (let x = 0; x <= draft.width; x++) { context.moveTo(x, 0); context.lineTo(x, draft.height); } for (let y = 0; y <= draft.height; y++) { context.moveTo(0, y); context.lineTo(draft.width, y); } context.stroke(); }
      const footprint = brush.includes('-') ? 1 : size;
      context.fillStyle = 'rgba(255,223,143,.14)'; context.fillRect(cursor.x, cursor.y, Math.min(footprint, draft.width - cursor.x), Math.min(footprint, draft.height - cursor.y));
      context.strokeStyle = '#fff0af'; context.lineWidth = 2 / t.scale; context.strokeRect(cursor.x, cursor.y, Math.min(footprint, draft.width - cursor.x), Math.min(footprint, draft.height - cursor.y)); context.restore();
    }
    function revealCursor() {
      const t = view.transform; if (!t) return;
      const rect = canvas.getBoundingClientRect(), px = t.x + (cursor.x + .5) * t.scale, py = t.y + (cursor.y + .5) * t.scale;
      if (px < 24) view.pan -= 24 - px; else if (px > rect.width - 24) view.pan += px - rect.width + 24;
      if (py < 24) view.panY -= 24 - py; else if (py > rect.height - 24) view.panY += py - rect.height + 24;
    }
    function position(event) {
      const rect = canvas.getBoundingClientRect(), t = view.transform; if (!t || t.scale <= 0) return null;
      const x = Math.floor((event.clientX - rect.left - t.x) / t.scale), y = Math.floor((event.clientY - rect.top - t.y) / t.scale);
      return x < 0 || y < 0 || x >= draft.width || y >= draft.height ? null : { x, y };
    }
    function place(record = true) {
      if (mode !== 'paint') { status('先選「繪製」模式，才能放置地形或標記。'); return; }
      try {
        if (brush.includes('-')) { const [kind, rawIndex] = brush.split('-'), index = Number(rawIndex), list = kind === 'source' ? draft.sources : draft.exits; if (!list[index]) return; commit(C.setMarker(draft, kind, index, { ...list[index], x: cursor.x, y: cursor.y }), record); }
        else commit(C.paint(draft, cursor.x, cursor.y, size, size, brush), record);
      } catch (error) { report(error); }
    }
    function ask(text, callback) {
      fileReadTicket++; confirmFocus = document.activeElement; confirmAction = callback; $('confirmtext').textContent = text; $('confirm').hidden = false;
      for (const child of dialog.children) if (child !== $('confirm')) child.inert = true;
      action('cancelconfirm').focus();
    }
    function dismissConfirm() { $('confirm').hidden = true; confirmAction = null; for (const child of dialog.children) child.inert = false; if (confirmFocus && confirmFocus.isConnected) confirmFocus.focus(); }
    function close(force = false) {
      if (closed) return;
      if (!force && dirty) { ask('目前修改尚未儲存。關閉後仍會暫留於這次開啟的頁面；重新整理可能遺失。要關閉嗎？', () => close(true)); return; }
      closed = true; fileReadTicket++; remembered = C.validate(draft); abort.abort(); if (frame) cancelAnimationFrame(frame); if (observer) observer.disconnect();
      dialog.close(); dialog.remove(); active = null; if (priorFocus && priorFocus.isConnected) priorFocus.focus();
      if (typeof options.onClose === 'function') options.onClose();
    }
    function save() { const result = C.save(storage, draft); if (result.ok) baseline = result.json; refreshState(); status(result.message, !result.ok); return result; }
    function showJSON() { $('jsonpanel').hidden = false; $('jsontext').value = C.exportJSON(draft); $('jsontext').focus(); }
    function importText(text) {
      try { const next = C.importJSON(text); ask('匯入會取代目前草圖。尚未匯出或儲存的修改將被替換。確定匯入「' + next.title + '」嗎？', () => { replace(next); $('jsonpanel').hidden = true; }); }
      catch (error) { report(error); }
    }
    const actions = {
      close: () => close(), place: () => place(),
      zoomin: () => { view.zoom = Math.min(5, view.zoom + .5); requestDraw(); }, zoomout: () => { view.zoom = Math.max(1, view.zoom - .5); requestDraw(); }, fit: () => { view = { zoom: 1, pan: 0, panY: 0 }; requestDraw(); },
      undo: () => { if (!history.length) return; fileReadTicket++; future.push(C.validate(draft)); draft = history.pop(); refreshState(); }, redo: () => { if (!future.length) return; fileReadTicket++; history.push(C.validate(draft)); draft = future.pop(); refreshState(); },
      blank: () => ask('新空白草圖會取代目前藍圖，建立平坦土壤、20 位苔精與零份工具。確定重新開始嗎？', () => replace(C.blank())),
      copy: () => { try { const next = C.fromLevel(options.baseLevel); ask('複製關卡會取代目前草圖，只複製原始地形與有限工具，不複製進行中的旅程。確定取代嗎？', () => replace(next)); } catch (error) { report(error); } },
      restore: () => { const result = C.load(storage); if (!result.ok) { status(result.missing ? '這個瀏覽器還沒有儲存的草圖。' : result.message, true); return; } ask('讀取本機草圖會取代目前尚未儲存的修改。確定讀取嗎？', () => { baseline = C.exportJSON(result.draft); replace(result.draft); status('已讀取本機草圖。'); }); },
      save, json: showJSON, closejson: () => { fileReadTicket++; $('jsonpanel').hidden = true; action('json').focus(); }, refreshjson: () => { $('jsontext').value = C.exportJSON(draft); status('文字區已更新為目前草圖。'); },
      export: () => { const json = C.exportJSON(draft); $('jsontext').value = json; let url;
        try { url = URL.createObjectURL(new Blob([json], { type: 'application/json' })); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'mosskin-draft.json'; document.body.append(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); status('已準備 JSON 下載；也可從文字區複製保存。'); }
        catch (_) { if (url) URL.revokeObjectURL(url); $('jsontext').focus(); $('jsontext').select(); status('無法啟動下載。請複製文字區內的完整 JSON；草圖仍可編輯。', true); }
      },
      import: () => importText($('jsontext').value),
      try: () => {
        if (typeof options.onTry !== 'function') { status('試玩尚未連接到遊戲。仍可編輯、儲存及匯出草圖。', true); return; }
        try { const customLevel = C.toLevel(draft), result = save(); const accepted = options.onTry(customLevel); if (accepted === false) { status('試玩尚未開始，草圖仍保留在這裡。'); return; } if (!result.ok) notify(result.message); close(true); }
        catch (error) { report(error); }
      },
      cancelconfirm: dismissConfirm, confirm: () => { const callback = confirmAction; dismissConfirm(); if (callback) callback(); }
    };
    listen(dialog, 'click', event => {
      const button = event.target.closest('button'); if (!button || !dialog.contains(button) || button.disabled) return;
      if (button.dataset.mode) { setMode(button.dataset.mode); requestDraw(); }
      else if (button.dataset.brush) { brush = button.dataset.brush; setMode('paint'); selection(); requestDraw(); }
      else if (actions[button.dataset.a]) actions[button.dataset.a]();
    });
    for (const field of ['title', 'total', 'need', 'release']) listen($(field), 'change', () => {
      try { const value = field === 'title' ? $(field).value : number($(field)); commit(C.configure(draft, { [field]: value })); }
      catch (error) { report(error); refreshState(); }
    });
    listen($('teams'), 'change', () => {
      const count = Number($('teams').value);
      if (count < draft.sources.length) { $('teams').value = draft.sources.length; ask('切換為一隊會移除乙隊出發與第二個歸巢標記。確定變更嗎？', () => { brush = 'dirt'; commit(C.setTeams(draft, count)); }); }
      else { try { commit(C.setTeams(draft, count)); } catch (error) { report(error); } }
    });
    listen($('size'), 'change', () => { size = Number($('size').value); requestDraw(); });
    listen($('file'), 'change', async () => { const file = $('file').files[0]; $('file').value = ''; if (!file) return; const ticket = ++fileReadTicket; if (file.size > C.LIMITS.json) { status('檔案超過 1 MB，原草圖未被更改。', true); return; } try { const text = await file.text(); if (!closed && ticket === fileReadTicket) importText(text); } catch (_) { if (!closed && ticket === fileReadTicket) status('無法讀取檔案，請改貼上 JSON 文字。', true); } });
    listen(dialog, 'cancel', event => { event.preventDefault(); if (confirmAction) dismissConfirm(); else close(); });
    listen(dialog, 'keydown', event => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.isComposing || event.defaultPrevented) return;
      if (confirmAction && event.key === 'Tab') { const first = action('cancelconfirm'), last = action('confirm'); if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } }
    });
    listen(canvas, 'keydown', event => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const delta = event.shiftKey ? 5 : 1, directions = { ArrowLeft: [-delta, 0], ArrowRight: [delta, 0], ArrowUp: [0, -delta], ArrowDown: [0, delta] };
      if (directions[event.key]) { event.preventDefault(); const [dx, dy] = directions[event.key]; cursor.x = Math.max(0, Math.min(draft.width - 1, cursor.x + dx)); cursor.y = Math.max(0, Math.min(draft.height - 1, cursor.y + dy)); revealCursor(); selection(); requestDraw(); }
      else if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); place(); }
    });
    listen(canvas, 'pointerdown', event => {
      if (event.button !== 0 || drag) return; event.preventDefault(); canvas.focus(); canvas.setPointerCapture(event.pointerId);
      drag = { id: event.pointerId, mode, x: event.clientX, y: event.clientY, last: null, painted: false };
      const p = position(event); if (p) { cursor = p; selection(); if (mode === 'paint') { checkpoint(); drag.painted = true; place(false); drag.last = p; } }
      requestDraw();
    });
    listen(canvas, 'pointermove', event => {
      if (!drag || drag.id !== event.pointerId) return;
      if (drag.mode === 'pan') { view.pan -= event.clientX - drag.x; view.panY -= event.clientY - drag.y; drag.x = event.clientX; drag.y = event.clientY; requestDraw(); return; }
      const p = position(event); if (!p) { drag.last = null; return; }
      if (!drag.painted) { checkpoint(); drag.painted = true; }
      const last = drag.last || p, steps = Math.max(Math.abs(p.x - last.x), Math.abs(p.y - last.y));
      for (let i = 1; i <= Math.max(1, steps); i++) { cursor = { x: Math.round(last.x + (p.x - last.x) * i / Math.max(1, steps)), y: Math.round(last.y + (p.y - last.y) * i / Math.max(1, steps)) }; place(false); }
      drag.last = p; selection(); requestDraw();
    });
    function endDrag(event) { if (!drag || drag.id !== event.pointerId) return; if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId); drag = null; refreshState(); }
    listen(canvas, 'pointerup', endDrag); listen(canvas, 'pointercancel', endDrag); listen(canvas, 'lostpointercapture', () => { drag = null; });
    listen(root, 'resize', requestDraw);
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(requestDraw) : null;
    if (observer) observer.observe(canvas);
    const api = { close, focus: () => canvas.focus(), getBlueprint: () => C.validate(draft), getLevel: () => C.toLevel(draft), element: dialog };
    active = api; refreshState(); setMode('pan'); dialog.showModal(); action('close').focus(); requestDraw();
    status(initialNotice || '先選畫筆或標記，再在畫布落筆。兩隊輪流出發，各自尋找可接收的歸巢點。', !!initialNotice);
    return api;
  }
  root.MossDraft = Object.freeze({ open, close: () => { if (active) active.close(); } });
})(globalThis);
