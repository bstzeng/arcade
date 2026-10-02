/* Information-set Banqi AI. This module receives only public observations. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./engine.js'));
  else root.BanqiAI = factory(root.BanqiEngine);
})(typeof self !== 'undefined' ? self : globalThis, function (E) {
  'use strict';
  var VALUES = [100, 360, 210, 280, 360, 450, 560];
  var LEVELS = {
    easy: { depth: 0, samples: 0, candidates: 0, beam: 0, maxNodes: 0 },
    normal: { depth: 2, samples: 3, candidates: 10, beam: 6, maxNodes: 3000 },
    hard: { depth: 3, samples: 5, candidates: 14, beam: 7, maxNodes: 12000 }
  };
  function sample(publicState, rng) {
    var state = E.clone(publicState), pool = [], counts = publicState.hiddenPool;
    for (var color = 0; color < 2; color++) for (var rank = 0; rank < 7; rank++) {
      for (var n = 0; n < counts[color][rank]; n++) pool.push({ color: color, rank: rank, up: false });
    }
    for (var i = pool.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1)), temp = pool[i]; pool[i] = pool[j]; pool[j] = temp;
    }
    var cursor = 0;
    state.board = state.board.map(function (p) {
      if (!p || p.up) return p;
      if (!pool[cursor]) throw new Error('Public hidden-piece pool is inconsistent');
      return pool[cursor++];
    });
    if (cursor !== pool.length) throw new Error('Public hidden-piece count is inconsistent');
    return state;
  }
  function attackMap(state) {
    var maps = [Array(32).fill(0), Array(32).fill(0)];
    state.board.forEach(function (p, from) {
      if (!p || !p.up) return;
      E.neighbors(from).forEach(function (to) {
        var target = state.board[to];
        if (target && E.canCapture(p, target)) maps[p.color][to]++;
      });
      if (p.rank === 1) E.cannonTargets(state.board, from).forEach(function (to) { maps[p.color][to]++; });
    });
    return maps;
  }
  function evaluate(state, rootSeat) {
    if (state.result) return state.result.winner == null ? 0 : state.result.winner === rootSeat ? 100000 - state.ply : -100000 + state.ply;
    if (state.colors[rootSeat] == null) return 0;
    var color = state.colors[rootSeat], score = 0, attacks = attackMap(state);
    state.board.forEach(function (p, at) {
      if (!p) return;
      var sign = p.color === color ? 1 : -1;
      // Hidden identities only occur in freshly sampled hypothetical positions.
      // Their location gets no positional score or move-ordering information.
      score += sign * VALUES[p.rank];
      if (!p.up) return;
      var row = Math.floor(at / 8), col = at % 8;
      score += sign * (6 - Math.abs(row - 1.5) - Math.abs(col - 3.5)) * 2;
      if (attacks[1 - p.color][at]) score -= sign * VALUES[p.rank] * 0.18;
      E.neighbors(at).forEach(function (to) { if (!state.board[to]) score += sign * 3; });
    });
    return score;
  }
  function movePriority(state, action, attacks) {
    var own = state.colors[state.turn];
    if (action.type === 'flip') {
      var score = 16;
      E.neighbors(action.to).forEach(function (at) {
        var p = state.board[at];
        if (!p || !p.up || own == null) return;
        score += p.color === own ? 4 + p.rank * 1.5 : -5 - p.rank;
      });
      return score;
    }
    var piece = state.board[action.from], target = state.board[action.to];
    var score = target ? 100 + VALUES[target.rank] - VALUES[piece.rank] * 0.06 : 0;
    if (attacks[1 - piece.color][action.from]) score += VALUES[piece.rank] * 0.22;
    // A small pursuit bonus avoids aimless walks when there are no flips left.
    var distanceBefore = 20, distanceAfter = 20;
    state.board.forEach(function (p, at) {
      if (!p || !p.up || p.color === piece.color) return;
      var distance = function (a, b) { return Math.abs(Math.floor(a / 8) - Math.floor(b / 8)) + Math.abs(a % 8 - b % 8); };
      distanceBefore = Math.min(distanceBefore, distance(action.from, at));
      distanceAfter = Math.min(distanceAfter, distance(action.to, at));
    });
    return score + (distanceBefore - distanceAfter) * 2;
  }
  function ordered(state, moves, limit, rng) {
    var attacks = attackMap(state);
    return moves.map(function (action, index) {
      return { action: action, score: movePriority(state, action, attacks), tie: rng ? rng() : -index };
    }).sort(function (a, b) { return b.score - a.score || b.tie - a.tie; })
      .slice(0, limit).map(function (entry) { return entry.action; });
  }
  function search(state, depth, alpha, beta, context) {
    context.stats.nodes++;
    if (!depth || state.result || context.stats.nodes >= context.config.maxNodes) return evaluate(state, context.rootSeat);
    var moves = E.legalMoves(state);
    if (!moves.length) return state.turn === context.rootSeat ? -100000 + state.ply : 100000 - state.ply;
    moves = ordered(state, moves, context.config.beam);
    var maximizing = state.turn === context.rootSeat, best = maximizing ? -Infinity : Infinity;
    for (var i = 0; i < moves.length; i++) {
      var value = search(E.apply(state, moves[i]), depth - 1, alpha, beta, context);
      best = maximizing ? Math.max(best, value) : Math.min(best, value);
      if (maximizing) alpha = Math.max(alpha, best); else beta = Math.min(beta, best);
      if (beta <= alpha) { context.stats.cutoffs++; break; }
    }
    return best;
  }
  function chooseDetailed(input, level, seed) {
    // Sanitize even if a caller accidentally supplies a full engine state. No
    // access to hidden color/rank occurs before constructing independent samples.
    var observation = E.publicView(input);
    level = Object.prototype.hasOwnProperty.call(LEVELS, level) ? level : 'normal';
    var config = LEVELS[level], rng = E.random(seed == null ? 1 : seed);
    var moves = E.legalMoves(observation);
    var stats = { level: level, depth: config.depth, samples: config.samples, nodes: 0, cutoffs: 0, candidates: 0, score: null };
    if (!moves.length) return { action: null, stats: stats };
    if (level === 'easy') {
      // Beginner mode is intentionally fallible: random legal actions, with a
      // small preference for captures. It neither samples nor searches.
      var weights = moves.map(function (m) { return m.type === 'move' && observation.board[m.to] ? 2 : 1; });
      var total = weights.reduce(function (a, b) { return a + b; }, 0), roll = rng() * total;
      var chosen = moves[moves.length - 1];
      for (var e = 0; e < moves.length; e++) { roll -= weights[e]; if (roll < 0) { chosen = moves[e]; break; } }
      stats.candidates = moves.length;
      return { action: chosen, stats: stats };
    }
    var candidates = ordered(observation, moves, config.candidates, rng), samples = [];
    stats.candidates = candidates.length;
    for (var s = 0; s < config.samples; s++) samples.push(sample(observation, rng));
    var context = { config: config, stats: stats, rootSeat: observation.turn };
    var bestAction = candidates[0], bestScore = -Infinity;
    for (var c = 0; c < candidates.length; c++) {
      var sum = 0;
      for (var d = 0; d < samples.length; d++) {
        sum += search(E.apply(samples[d], candidates[c]), config.depth - 1, -Infinity, Infinity, context);
      }
      var score = sum / samples.length;
      if (score > bestScore) { bestScore = score; bestAction = candidates[c]; }
    }
    stats.score = Math.round(bestScore * 10) / 10;
    return { action: bestAction, stats: stats };
  }
  function choose(observation, level, seed) { return chooseDetailed(observation, level, seed).action; }
  return { choose: choose, chooseDetailed: chooseDetailed, LEVELS: LEVELS, VALUES: VALUES, sample: sample };
});
