/* Banqi rules. No DOM dependencies; usable in browsers, workers, and Node. */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BanqiEngine = api;
})(typeof self !== 'undefined' ? self : globalThis, function () {
  'use strict';
  var ROWS = 4, COLS = 8, SIZE = 32;
  var RANK_COUNTS = [5, 2, 2, 2, 2, 2, 1];
  var RANK_NAMES = ['Soldier', 'Cannon', 'Horse', 'Rook', 'Elephant', 'Advisor', 'General'];
  var GLYPHS = [['兵', '炮', '馬', '車', '相', '仕', '帥'], ['卒', '砲', '馬', '車', '象', '士', '將']];

  function seedNumber(seed) {
    if (typeof seed === 'number' && Number.isFinite(seed)) return seed >>> 0;
    var s = String(seed == null ? 1 : seed), h = 2166136261;
    for (var i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
    return h >>> 0;
  }
  function random(seed) {
    var a = seedNumber(seed);
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function neighbors(index) {
    var r = Math.floor(index / COLS), c = index % COLS, out = [];
    if (r > 0) out.push(index - COLS);
    if (c > 0) out.push(index - 1);
    if (c < COLS - 1) out.push(index + 1);
    if (r < ROWS - 1) out.push(index + COLS);
    return out;
  }
  var NEIGHBORS = Array.from({ length: SIZE }, function (_, i) { return neighbors(i); });
  function canCapture(a, b) {
    if (!a || !b || !a.up || !b.up || a.color === b.color || a.rank === 1) return false;
    if (a.rank === 0) return b.rank === 0 || b.rank === 6;
    if (a.rank === 6 && b.rank === 0) return false;
    return a.rank >= b.rank;
  }
  function cannonTargets(board, from) {
    var r = Math.floor(from / COLS), c = from % COLS, targets = [];
    [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(function (d) {
      var row = r + d[0], col = c + d[1], screen = false;
      while (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
        var to = row * COLS + col, p = board[to];
        if (p) {
          if (!screen) screen = true;
          else { if (p.up && p.color !== board[from].color) targets.push(to); break; }
        }
        row += d[0]; col += d[1];
      }
    });
    return targets;
  }
  function legalMoves(state) {
    if (state.result) return [];
    var out = [], own = state.colors[state.turn];
    for (var from = 0; from < SIZE; from++) {
      var p = state.board[from];
      if (!p) continue;
      if (!p.up) { out.push({ type: 'flip', to: from }); continue; }
      if (own == null || p.color !== own) continue;
      NEIGHBORS[from].forEach(function (to) {
        var target = state.board[to];
        if (!target || canCapture(p, target)) out.push({ type: 'move', from: from, to: to });
      });
      if (p.rank === 1) cannonTargets(state.board, from).forEach(function (to) {
        out.push({ type: 'move', from: from, to: to });
      });
    }
    return out;
  }
  function actionKey(action) { return action.type === 'flip' ? 'f' + action.to : 'm' + action.from + ':' + action.to; }
  function sameAction(a, b) { return !!a && !!b && a.type === b.type && a.to === b.to && (a.type === 'flip' || a.from === b.from); }
  // Unrevealed identities never enter a repetition key or any public metadata.
  function positionKey(state) {
    return state.turn + '|' + state.colors.map(function (c) { return c == null ? '-' : c; }).join('') + '|' +
      state.board.map(function (p) { return !p ? '.' : !p.up ? '?' : String(p.color * 7 + p.rank + 1); }).join(',');
  }
  function clone(state) {
    return {
      board: state.board.map(function (p) { return p ? Object.assign({}, p) : null; }),
      turn: state.turn, colors: state.colors.slice(), ply: state.ply || 0,
      noProgress: state.noProgress || 0,
      result: state.result ? Object.assign({}, state.result) : null,
      repetitions: Object.assign({}, state.repetitions || {}),
      captured: (state.captured || []).map(function (p) { return Object.assign({}, p); })
    };
  }
  function create(seed) {
    var board = [], rng = random(seed == null ? Date.now() : seed);
    for (var color = 0; color < 2; color++) {
      RANK_COUNTS.forEach(function (count, rank) {
        for (var n = 0; n < count; n++) board.push({ color: color, rank: rank, up: false });
      });
    }
    for (var i = board.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1)), p = board[i]; board[i] = board[j]; board[j] = p;
    }
    var state = { board: board, turn: 0, colors: [null, null], ply: 0, noProgress: 0, result: null, repetitions: {}, captured: [] };
    state.repetitions[positionKey(state)] = 1;
    return state;
  }
  function getResult(state) {
    if (state.result) return state.result;
    if (state.colors[0] != null) {
      var alive = [0, 0];
      state.board.forEach(function (p) { if (p && (p.color === 0 || p.color === 1)) alive[p.color]++; });
      if (!alive[state.colors[state.turn]]) return { winner: 1 - state.turn, reason: 'all-pieces-captured' };
      if (!alive[state.colors[1 - state.turn]]) return { winner: state.turn, reason: 'all-pieces-captured' };
    }
    if (legalMoves(state).length === 0) return { winner: 1 - state.turn, reason: 'no-legal-actions' };
    if ((state.repetitions || {})[positionKey(state)] >= 3) return { winner: null, reason: 'threefold-repetition' };
    if (state.noProgress >= 80) return { winner: null, reason: 'no-progress' };
    return null;
  }
  function apply(state, action) {
    if (!action || !legalMoves(state).some(function (candidate) { return sameAction(candidate, action); })) {
      throw new Error('Illegal Banqi action');
    }
    var next = clone(state), capture = false;
    if (action.type === 'flip') {
      var revealed = next.board[action.to];
      if (revealed.color == null || revealed.rank == null) throw new Error('Cannot flip a public observation; sample hidden pieces first');
      revealed.up = true;
      if (next.colors[0] == null) {
        next.colors[next.turn] = revealed.color;
        next.colors[1 - next.turn] = 1 - revealed.color;
      }
    } else {
      var target = next.board[action.to];
      if (target) { next.captured.push(Object.assign({}, target)); capture = true; }
      next.board[action.to] = next.board[action.from]; next.board[action.from] = null;
    }
    next.ply++;
    next.noProgress = capture || action.type === 'flip' ? 0 : next.noProgress + 1;
    next.turn = 1 - next.turn;
    var key = positionKey(next);
    next.repetitions[key] = (next.repetitions[key] || 0) + 1;
    next.result = getResult(next);
    return next;
  }
  function publicView(state) {
    var pool = [RANK_COUNTS.slice(), RANK_COUNTS.slice()];
    // Only touch color/rank after establishing that the piece is face up.
    var board = state.board.map(function (p) {
      if (!p) return null;
      if (!p.up) return { up: false };
      pool[p.color][p.rank]--;
      return { color: p.color, rank: p.rank, up: true };
    });
    var captured = (state.captured || []).map(function (p) {
      pool[p.color][p.rank]--;
      return { color: p.color, rank: p.rank, up: true };
    });
    return {
      board: board, turn: state.turn, colors: state.colors.slice(), ply: state.ply || 0,
      noProgress: state.noProgress || 0, result: state.result ? Object.assign({}, state.result) : null,
      captured: captured, hiddenPool: pool,
      repetitions: Object.assign({}, state.repetitions || {})
    };
  }
  return {
    ROWS: ROWS, COLS: COLS, SIZE: SIZE, RANK_COUNTS: RANK_COUNTS, RANK_NAMES: RANK_NAMES, GLYPHS: GLYPHS,
    create: create, clone: clone, legalMoves: legalMoves, apply: apply, publicView: publicView,
    canCapture: canCapture, cannonTargets: cannonTargets, getResult: getResult,
    positionKey: positionKey, actionKey: actionKey, sameAction: sameAction, neighbors: neighbors,
    seedNumber: seedNumber, random: random
  };
});
