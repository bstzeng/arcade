/* Optional shared controls, not a generic game renderer. */
(function (root) {
  'use strict';
  const api = root.ArcadeChallenge;
  if (!api) throw new Error('Load challenge-common/core.js before ui.js.');
  function mountControls(container, controller, options) {
    options = options || {};
    if (!container || typeof container.append !== 'function') throw new TypeError('A DOM container is required.');
    const doc = container.ownerDocument, cleanups = [], prefix = 'challenge-' + controller.snapshot().gameId;
    const element = (tag, className, text) => { const node = doc.createElement(tag); if (className) node.className = className; if (text !== undefined) node.textContent = text; return node; };
    const on = (node, name, handler) => { node.addEventListener(name, handler); cleanups.push(() => node.removeEventListener(name, handler)); };
    const shell = element('section', 'ac-shell'), title = element('h2', 'ac-title', options.title || '關卡挑戰');
    title.id = prefix + '-title'; shell.setAttribute('aria-labelledby', title.id);
    const selectLabel = element('label', 'ac-select-label', '選擇關卡'), select = element('select', 'ac-select');
    select.id = prefix + '-level'; selectLabel.htmlFor = select.id; select.setAttribute('aria-label', '選擇關卡');
    const initial = controller.snapshot();
    initial.levels.forEach((level, i) => { const option = element('option', '', String(i + 1).padStart(3, '0') + ' · ' + level.title); option.value = level.id; select.append(option); });
    const controls = element('div', 'ac-controls');
    function button(text, action) { const node = element('button', 'ac-button', text); node.type = 'button'; if (action) on(node, 'click', action); return node; }
    const status = element('p', 'ac-status'); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite'); status.setAttribute('aria-atomic', 'true');
    const progress = element('p', 'ac-progress'), hint = element('p', 'ac-hint'), warning = element('p', 'ac-warning');
    warning.setAttribute('role', 'status'); hint.hidden = true;
    const board = options.board || element('div', 'ac-board');
    if (!options.board) { board.tabIndex = -1; board.setAttribute('aria-label', (options.title || '遊戲') + '操作區'); }
    let pendingReset = null, focusReturn = null, destroyed = false;
    const modal = element('dialog', 'ac-dialog'), modalTitle = element('h3', '', '重新開始本關？'), modalText = element('p', '', '本關目前的盤面會重設。已完成的紀錄會保留。');
    modalTitle.id = prefix + '-reset-title'; modal.setAttribute('aria-labelledby', modalTitle.id);
    function cancelReset() {
      pendingReset = null;
      if (modal.open && typeof modal.close === 'function') modal.close();
      modal.hidden = true;
      if (focusReturn && typeof focusReturn.focus === 'function') focusReturn.focus();
      focusReturn = null;
    }
    function report(result) {
      if (result && result.ok === false) {
        status.textContent = result.error || '這個動作目前無法使用。';
        if (typeof options.onError === 'function') options.onError(result.error);
      }
      return result;
    }
    const previous = button('上一關', () => { cancelReset(); const state = controller.snapshot(); if (state.levelIndex > 0) report(controller.select(state.levels[state.levelIndex - 1].id)); });
    const next = button('下一關', () => { cancelReset(); const state = controller.snapshot(); if (state.levelIndex + 1 < state.levels.length) report(controller.select(state.levels[state.levelIndex + 1].id)); });
    const undo = button('撤銷', () => { cancelReset(); report(controller.undo()); });
    const reset = button('重新開始', () => {
      const state = controller.snapshot(); pendingReset = { levelId: state.levelId, sequence: state.sequence }; focusReturn = reset; modal.hidden = false;
      if (typeof modal.showModal === 'function') { if (!modal.open) modal.showModal(); }
      else modal.setAttribute('open', '');
      cancel.focus();
    });
    const showHint = button('提示', () => { cancelReset(); report(controller.hint()); });
    const solution = button('解答示範', () => {
      cancelReset();
      try {
        const state = controller.snapshot();
        if (typeof options.getReplayActions !== 'function') return report({ ok: false, error: '這一關尚未提供可重播的解答。' });
        const actions = options.getReplayActions(state.level);
        if (actions && typeof actions.then === 'function') return report({ ok: false, error: '請先載入解答資料，再開啟示範。' });
        report(controller.startReplay(actions));
      } catch (error) { report({ ok: false, error: error.message || String(error) }); }
    });
    solution.disabled = typeof options.getReplayActions !== 'function';
    const replayStep = button('示範下一步', () => report(controller.stepReplay()));
    const replayExit = button('返回我的盤面', () => { cancelReset(); report(controller.stopReplay()); });
    const confirm = button('重新開始', () => {
      const state = controller.snapshot(), request = pendingReset;
      cancelReset();
      if (request && request.levelId === state.levelId && request.sequence === state.sequence) report(controller.reset());
    });
    const cancel = button('保留盤面', cancelReset);
    modal.append(modalTitle, modalText, cancel, confirm); modal.hidden = true;
    on(modal, 'cancel', event => { event.preventDefault(); cancelReset(); });
    on(modal, 'close', () => { pendingReset = null; });
    on(select, 'change', () => { cancelReset(); report(controller.select(select.value)); });
    controls.append(selectLabel, select, previous, next, undo, reset, showHint, solution, replayStep, replayExit);
    shell.append(title, controls, progress, status, hint, warning);
    if (!options.board) shell.append(board);
    shell.append(modal); container.append(shell);
    const dispatch = (action, flags) => { cancelReset(); return report(controller.dispatch(action, flags)); };
    const unsubscribe = controller.subscribe(state => {
      if (destroyed) return;
      if (pendingReset && (pendingReset.levelId !== state.levelId || pendingReset.sequence !== state.sequence)) cancelReset();
      select.value = state.levelId; previous.disabled = state.levelIndex === 0; next.disabled = state.levelIndex === state.levels.length - 1;
      undo.disabled = !state.canUndo; showHint.disabled = state.mode === 'replay';
      replayStep.hidden = replayExit.hidden = state.mode !== 'replay'; replayStep.disabled = !state.replay || state.replay.finished || !!state.replay.error;
      solution.disabled = typeof options.getReplayActions !== 'function' || state.mode === 'replay';
      progress.textContent = '已完成 ' + state.progress.completed + ' / ' + state.progress.total + ' · 未用提示 ' + state.progress.unassisted;
      if (state.mode === 'replay') status.textContent = state.replay.error ? '示範中止：' + state.replay.error : '解答示範 ' + state.replay.cursor + ' / ' + state.replay.total + (state.replay.finished ? (state.inspection.goalMet ? ' · 示範達成目標，未計入通關。' : ' · 示範結束，未達成目標。') : ' · 不會改動你的盤面。');
      else status.textContent = state.inspection.status === 'won' ? (state.assisted ? '本關完成（使用過提示或解答）。' : '本關完成！') : state.inspection.status === 'lost' ? '本次未達成目標，可以撤銷或重新開始。' : '第 ' + (state.levelIndex + 1) + ' 關 · ' + (state.level.title || '開始挑戰');
      hint.hidden = !state.hint; hint.textContent = state.hint ? state.hint.text : '';
      warning.hidden = !state.storageWarning; warning.textContent = state.storageWarning;
      shell.dataset.mode = state.mode;
      if (typeof options.render === 'function') options.render(state, dispatch, board);
    });
    return { shell, board, controller, destroy() { if (destroyed) return; destroyed = true; cancelReset(); unsubscribe(); cleanups.forEach(fn => fn()); shell.remove(); } };
  }
  api.mountControls = mountControls;
})(typeof globalThis === 'undefined' ? this : globalThis);
