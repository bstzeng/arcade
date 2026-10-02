/* TriPeaks rules engine. This exact module is used by play, replay and certification. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.TriPeaks = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const VERSION = 'tripeaks-wrap-v1';
  const FULL = (1 << 28) - 1;
  const COVERS = [[3,4],[5,6],[7,8],[9,10],[10,11],[12,13],[13,14],[15,16],[16,17],
    [18,19],[19,20],[20,21],[21,22],[22,23],[23,24],[24,25],[25,26],[26,27],
    [],[],[],[],[],[],[],[],[],[]].map(a => Object.freeze(a));
  const COVER_MASKS = COVERS.map(a => a.reduce((mask, i) => mask | (1 << i), 0));
  const POSITIONS = [
    [1.5,0],[4.5,0],[7.5,0],
    [1,1],[2,1],[4,1],[5,1],[7,1],[8,1],
    [.5,2],[1.5,2],[2.5,2],[3.5,2],[4.5,2],[5.5,2],[6.5,2],[7.5,2],[8.5,2],
    [0,3],[1,3],[2,3],[3,3],[4,3],[5,3],[6,3],[7,3],[8,3],[9,3]
  ].map(a => Object.freeze(a));
  const rank = card => card % 13 + 1;
  const suit = card => Math.floor(card / 13);
  const adjacent = (a, b) => { const d = Math.abs(a - b); return d === 1 || d === 12; };
  function validDeal(deal) {
    return !!deal && Array.isArray(deal.cards) && deal.cards.length === 52 &&
      deal.cards.every(c => Number.isInteger(c) && c >= 0 && c < 52) && new Set(deal.cards).size === 52;
  }
  function initial(deal) {
    if (!validDeal(deal)) throw new Error('Invalid 52-card deal');
    return { remaining: FULL, stockIndex: 0, waste: deal.cards[28], moves: 0 };
  }
  function exposed(state, index) {
    return Number.isInteger(index) && index >= 0 && index < 28 &&
      !!(state.remaining & (1 << index)) && !(state.remaining & COVER_MASKS[index]);
  }
  function canRemove(deal, state, index) {
    return exposed(state, index) && adjacent(rank(deal.cards[index]), rank(state.waste));
  }
  function legal(deal, state) {
    if (!state.remaining) return [];
    const actions = [];
    for (let i = 0; i < 28; i++) if (canRemove(deal, state, i)) actions.push(i);
    if (state.stockIndex < 23) actions.push(-1);
    return actions;
  }
  function step(deal, state, action) {
    if (!state.remaining) throw new Error('Game already won');
    if (action === -1) {
      if (state.stockIndex >= 23) throw new Error('No stock cards remain');
      return { remaining: state.remaining, stockIndex: state.stockIndex + 1,
        waste: deal.cards[29 + state.stockIndex], moves: state.moves + 1 };
    }
    if (!canRemove(deal, state, action)) throw new Error('Illegal tableau move');
    return { remaining: state.remaining & ~(1 << action), stockIndex: state.stockIndex,
      waste: deal.cards[action], moves: state.moves + 1 };
  }
  function replay(deal, actions) {
    if (!Array.isArray(actions) || actions.length > 51) throw new Error('Invalid action history');
    return actions.reduce((state, action) => step(deal, state, action), initial(deal));
  }
  // Rank is sufficient: suits never affect a legal move. An exact continuation
  // witness remains legal when the current waste has a different suit of that rank.
  function key(state) { return state.remaining * 512 + state.stockIndex * 16 + rank(state.waste); }
  function count(mask) { let n = 0; for (; mask; mask &= mask - 1) n++; return n; }
  function checkpoints(deal, witness) {
    const result = new Map();
    let state = initial(deal); result.set(key(state), 0);
    witness.forEach((action, i) => { state = step(deal, state, action); result.set(key(state), i + 1); });
    if (state.remaining) throw new Error('Incomplete winning witness');
    return result;
  }
  // Complete depth-first search if not cut off; capped runs explicitly report
  // "unknown", never "unsolvable". Every successful result is a full legal path.
  function solve(deal, start, options) {
    const opt = options || {}, limit = opt.maxNodes === undefined ? 1000000 : opt.maxNodes;
    const ranks = deal.cards.map(rank), dead = new Set(), path = [];
    let nodes = 0, cutOff = false;
    function visit(mask, next, top) {
      if (!mask) return true;
      if (++nodes > limit) { cutOff = true; return false; }
      const k = mask * 512 + next * 16 + top;
      if (dead.has(k)) return false;
      for (let i = 0; i < 28; i++) {
        if ((mask & (1 << i)) && !(mask & COVER_MASKS[i]) && adjacent(ranks[i], top)) {
          path.push(i);
          if (visit(mask & ~(1 << i), next, ranks[i])) return true;
          path.pop();
          if (cutOff) return false;
        }
      }
      if (next < 23) {
        path.push(-1);
        if (visit(mask, next + 1, ranks[29 + next])) return true;
        path.pop();
        if (cutOff) return false;
      }
      dead.add(k);
      return false;
    }
    const s = start || initial(deal), found = visit(s.remaining, s.stockIndex, rank(s.waste));
    return { status: found ? 'solved' : cutOff ? 'unknown' : 'unsolvable',
      witness: found ? path.slice() : null, nodes, memoized: dead.size };
  }
  return Object.freeze({ VERSION, FULL, COVERS: Object.freeze(COVERS), POSITIONS: Object.freeze(POSITIONS),
    rank, suit, adjacent, validDeal, initial, exposed, canRemove, legal, step, replay, key, count, checkpoints, solve });
});
