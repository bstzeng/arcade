'use strict';
const assert = require('node:assert/strict');
const E = require('./engine.js');
const AI = require('./ai.js');
const worker = require('./worker.js');
let passed = 0;
function test(name, fn) {
  fn(); passed++; console.log('PASS', name);
}
function piece(color, rank, up = true) { return { color, rank, up }; }
function fixture(entries, options = {}) {
  const board = Array(32).fill(null);
  for (const [at, p] of entries) board[at] = p;
  const left = [E.RANK_COUNTS.slice(), E.RANK_COUNTS.slice()];
  board.forEach(p => { if (p) left[p.color][p.rank]--; });
  const captured = [];
  for (let color = 0; color < 2; color++) for (let rank = 0; rank < 7; rank++) {
    for (let n = 0; n < left[color][rank]; n++) captured.push(piece(color, rank));
  }
  const state = { board, colors: [0, 1], turn: 0, ply: 0, noProgress: 0, result: null, captured, repetitions: {}, ...options };
  state.repetitions[E.positionKey(state)] = 1;
  return state;
}
function has(state, from, to) { return E.legalMoves(state).some(a => a.type === 'move' && a.from === from && a.to === to); }
function move(state, from, to) { return E.apply(state, { type: 'move', from, to }); }

test('seeded setup has 32 concealed pieces and the correct rank inventory', () => {
  const s = E.create('banqi');
  assert.deepEqual(s, E.create('banqi'));
  assert.notDeepEqual(s.board, E.create('other').board);
  for (let color = 0; color < 2; color++) for (let rank = 0; rank < 7; rank++) {
    assert.equal(s.board.filter(p => p.color === color && p.rank === rank).length, E.RANK_COUNTS[rank]);
  }
  assert.equal(s.board.filter(p => !p.up).length, 32);
  assert.equal(E.legalMoves(s).length, 32);
  assert(E.legalMoves(s).every(a => a.type === 'flip'));
});
test('first flip assigns sides to the actual flipping seat and is immutable', () => {
  for (let seat = 0; seat < 2; seat++) {
    const s = E.create(22); s.turn = seat;
    const before = JSON.stringify(s), color = s.board[11].color;
    const next = E.apply(s, { type: 'flip', to: 11 });
    assert.equal(JSON.stringify(s), before);
    assert.equal(next.colors[seat], color);
    assert.equal(next.colors[1 - seat], 1 - color);
    assert.equal(next.turn, 1 - seat);
    assert.equal(next.ply, 1);
    assert.equal(next.board[11].up, true);
    assert.equal(next.board.filter(p => p.up).length, 1);
    assert.equal(next.noProgress, 0);
  }
});
test('all 49 adjacent rank matchups, including soldier/general exceptions', () => {
  for (let attacker = 0; attacker < 7; attacker++) for (let defender = 0; defender < 7; defender++) {
    const s = fixture([[9, piece(0, attacker)], [10, piece(1, defender)]]);
    const expected = attacker === 1 ? false : attacker === 0 ? defender === 0 || defender === 6 : !(attacker === 6 && defender === 0) && attacker >= defender;
    assert.equal(has(s, 9, 10), expected, `rank ${attacker} vs ${defender}`);
    const friendly = fixture([[9, piece(0, attacker)], [10, piece(0, defender)], [31, piece(1, 0)]]);
    assert.equal(has(friendly, 9, 10), false);
  }
});
test('moves are orthogonal one-step without edge wrapping or jumping', () => {
  const s = fixture([[7, piece(0, 4)], [31, piece(1, 0)]]);
  assert(has(s, 7, 6)); assert(has(s, 7, 15));
  assert(!has(s, 7, 8)); assert(!has(s, 7, 14)); assert(!has(s, 7, 23));
  const cannon = fixture([[9, piece(0, 1)], [31, piece(1, 0)]]);
  for (const at of [1, 8, 10, 17]) assert(has(cannon, 9, at));
  assert(!has(cannon, 9, 11));
});
test('cannons capture every rank over exactly one occupied screen', () => {
  for (let rank = 0; rank < 7; rank++) for (const screenUp of [true, false]) {
    for (const [from, screen, target] of [[0, 2, 7], [7, 5, 0], [0, 8, 24], [24, 16, 0]]) {
      const s = fixture([[from, piece(0, 1)], [screen, piece(0, 0, screenUp)], [target, piece(1, rank)]]);
      assert(has(s, from, target), `rank ${rank}, direction ${from}->${target}, up ${screenUp}`);
      const next = move(s, from, target);
      assert.equal(next.board[from], null);
      assert.equal(next.board[target].rank, 1);
      assert.equal(next.captured.at(-1).rank, rank);
    }
  }
});
test('cannons cannot capture without a screen, with two screens, or a hidden/friendly target', () => {
  assert(!has(fixture([[0, piece(0, 1)], [7, piece(1, 6)]]), 0, 7));
  assert(!has(fixture([[0, piece(0, 1)], [1, piece(0, 0)], [2, piece(0, 2)], [7, piece(1, 6)]]), 0, 7));
  assert(!has(fixture([[0, piece(0, 1)], [2, piece(0, 0)], [7, piece(1, 6, false)]]), 0, 7));
  assert(!has(fixture([[0, piece(0, 1)], [2, piece(0, 0)], [7, piece(0, 6)], [31, piece(1, 0)]]), 0, 7));
  assert(!has(fixture([[0, piece(0, 1)], [1, piece(1, 6)]]), 0, 1));
});
test('either seat may flip any hidden piece but cannot move it or capture it', () => {
  const s = fixture([[0, piece(0, 6)], [1, piece(1, 2, false)], [31, piece(1, 0)]]);
  assert(E.legalMoves(s).some(a => a.type === 'flip' && a.to === 1));
  assert(!has(s, 0, 1));
  assert(!E.legalMoves(s).some(a => a.from === 1));
  assert.deepEqual(E.apply(s, { type: 'flip', to: 1 }).colors, [0, 1]);
  assert.throws(() => move(s, 31, 30), /Illegal/);
  assert.throws(() => E.apply(s, { type: 'flip', to: 0 }), /Illegal/);
  assert.throws(() => E.apply(s, { type: 'flip', to: 99 }), /Illegal/);
});
test('last capture wins and finished games reject actions', () => {
  const next = move(fixture([[0, piece(0, 3)], [1, piece(1, 2)]]), 0, 1);
  assert.deepEqual(next.result, { winner: 0, reason: 'all-pieces-captured' });
  assert.equal(E.legalMoves(next).length, 0);
  assert.throws(() => E.apply(next, { type: 'move', from: 1, to: 2 }), /Illegal/);
});
test('a player with no legal action loses', () => {
  const s = fixture([[0, piece(0, 0)], [1, piece(1, 3)], [8, piece(1, 3)]]);
  assert.equal(E.legalMoves(s).length, 0);
  assert.deepEqual(E.getResult(s), { winner: 1, reason: 'no-legal-actions' });
});
test('threefold repetition draws only on the third position occurrence', () => {
  let s = fixture([[0, piece(0, 3)], [31, piece(1, 3)]]);
  for (let round = 0; round < 2; round++) {
    s = move(s, 0, 1); s = move(s, 31, 30); s = move(s, 1, 0); s = move(s, 30, 31);
    if (round === 0) assert.equal(s.result, null);
  }
  assert.deepEqual(s.result, { winner: null, reason: 'threefold-repetition' });
});
test('80 quiet plies draw; both a flip and a capture reset the clock', () => {
  const quiet = move(fixture([[0, piece(0, 3)], [31, piece(1, 3)]], { noProgress: 79 }), 0, 1);
  assert.deepEqual(quiet.result, { winner: null, reason: 'no-progress' });
  const capture = move(fixture([[0, piece(0, 3)], [1, piece(1, 2)], [31, piece(1, 3)]], { noProgress: 79 }), 0, 1);
  assert.equal(capture.noProgress, 0); assert.equal(capture.result, null);
  const flip = E.apply(fixture([[0, piece(0, 3)], [1, piece(1, 2, false)], [31, piece(1, 3)]], { noProgress: 79 }), { type: 'flip', to: 1 });
  assert.equal(flip.noProgress, 0); assert.equal(flip.result, null);
});
test('public view omits hidden identities and subtracts only revealed/captured identities', () => {
  const s = E.create(123);
  const hidden = s.board[0];
  Object.defineProperty(hidden, 'color', { get() { throw Error('Hidden color accessed'); } });
  Object.defineProperty(hidden, 'rank', { get() { throw Error('Hidden rank accessed'); } });
  const view = E.publicView(s);
  assert.deepEqual(view.board[0], { up: false });
  assert.deepEqual(view.hiddenPool, [E.RANK_COUNTS, E.RANK_COUNTS]);
  const partial = fixture([[0, piece(0, 3)], [1, piece(1, 2, false)], [31, piece(1, 3)]]);
  const p = E.publicView(partial);
  assert.equal(p.hiddenPool.flat().reduce((a, b) => a + b, 0), 1);
  assert.equal(p.hiddenPool[1][2], 1);
  assert(!E.positionKey(s).includes('undefined'));
});
test('AI decisions are identical for different hidden layouts with identical observations', () => {
  let a = E.create(70);
  for (const to of [2, 12, 21, 29]) a = E.apply(a, { type: 'flip', to });
  const b = E.clone(a), hidden = b.board.map((p, i) => p && !p.up ? i : -1).filter(i => i >= 0);
  const identities = hidden.map(i => b.board[i]).reverse();
  hidden.forEach((at, i) => { b.board[at] = identities[i]; });
  assert.notDeepEqual(a.board, b.board);
  assert.deepEqual(E.publicView(a), E.publicView(b));
  const frozenBefore = JSON.stringify(a);
  for (const level of Object.keys(AI.LEVELS)) {
    assert.deepEqual(AI.choose(a, level, 123), AI.choose(b, level, 123));
    assert.deepEqual(AI.choose(E.publicView(a), level, 123), AI.choose(a, level, 123));
  }
  assert.equal(JSON.stringify(a), frozenBefore);
});
test('AI never reads hidden getters and difficulty budgets are genuinely different', () => {
  const s = E.create(100);
  for (const p of s.board) {
    Object.defineProperty(p, 'color', { get() { throw Error('AI peeked color'); } });
    Object.defineProperty(p, 'rank', { get() { throw Error('AI peeked rank'); } });
  }
  const runs = ['easy', 'normal', 'hard'].map(level => AI.chooseDetailed(s, level, 13));
  assert.equal(runs[0].stats.nodes, 0);
  assert(runs[1].stats.nodes > 0);
  assert(runs[2].stats.nodes > runs[1].stats.nodes);
  for (const run of runs) {
    assert(E.legalMoves(s).some(a => E.sameAction(a, run.action)));
    assert(run.stats.nodes <= AI.LEVELS[run.stats.level].maxNodes);
  }
});
test('worker returns matching request ID, legal action, and bounded-search stats', () => {
  const s = E.create(42), observation = E.publicView(s);
  const result = worker({ id: 'request-4', observation, level: 'hard', seed: 90 });
  assert.equal(result.id, 'request-4');
  assert.equal(result.stats.level, 'hard');
  assert(E.legalMoves(s).some(a => E.sameAction(a, result.action)));
});
test('all levels complete legal full self-play with conserved inventory', () => {
  const summary = [];
  for (const level of ['easy', 'normal', 'hard']) for (const seed of [5, 19]) {
    let s = E.create(seed), ply = 0;
    while (!s.result && ply < 1500) {
      const publicState = E.publicView(s);
      assert.equal(publicState.hiddenPool.flat().reduce((a, b) => a + b, 0), s.board.filter(p => p && !p.up).length);
      assert(publicState.hiddenPool.flat().every(n => n >= 0));
      const action = AI.choose(publicState, level, seed * 10000 + ply);
      assert(E.legalMoves(s).some(a => E.sameAction(a, action)), `${level} illegal at ply ${ply}`);
      s = E.apply(s, action); ply++;
      assert.equal(s.board.filter(Boolean).length + s.captured.length, 32);
    }
    assert(s.result, `${level} seed ${seed} failed to terminate`);
    summary.push(`${level}/${seed}: ${ply} plies, ${s.result.reason}`);
  }
  console.log(summary.join('\n'));
});
console.log(`\n${passed} Banqi test groups passed.`);
