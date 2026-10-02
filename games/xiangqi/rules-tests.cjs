'use strict';
/* Reproducible, dependency-free Xiangqi rules / AI / save validation.
 * Run: node arcade/games/xiangqi/rules-tests.cjs
 * Import: const { run, report } = require('./rules-tests.cjs');
 * Default AI smoke tests use each shipped profile. Self-play uses fixed node
 * budgets and an infinite clock budget, making move sequences reproducible.
 */
const assert = require('node:assert/strict');
const E = require('./engine.js');
const AI = require('./ai.js');
const S = require('./session.js');
const report = { passed: 0, failed: 0, tests: [], selfPlay: [], durationMs: 0 };
const at = (x, y) => y * 9 + x;
const sorted = values => [...values].sort((a, b) => a - b);
const moveId = move => `${move.from}:${move.to}`;
const move = (fx, fy, tx, ty) => ({ from: at(fx, fy), to: at(tx, ty) });
const has = (moves, m) => moves.some(x => x.from === m.from && x.to === m.to);
function board(...pieces) {
  const b = Array(90).fill(0);
  for (const [piece, x, y] of pieces) b[at(x, y)] = piece;
  return b;
}
function state(pieces, turn = 1, extra = {}) {
  const s = { board: board(...pieces), turn, quiet: 0, ply: 0, keys: [], ...extra };
  s.keys = [E.key(s)];
  return s;
}
function targets(b, x, y, coords) {
  assert.deepEqual(sorted(E.pseudo(b, at(x, y))), sorted(coords.map(([a, c]) => at(a, c))));
}
function mirror(s) {
  const n = { ...s, board: s.board.slice().reverse().map(p => -p), turn: -s.turn, keys: [] };
  n.keys = [E.key(n)];
  return n;
}
function validateChosen(s, level, override) {
  const before = JSON.stringify(s);
  const choice = AI.choose(s, level, override);
  assert.equal(JSON.stringify(s), before, 'AI must not mutate its input');
  assert(choice.move, `${level} should return a move`);
  assert(has(E.legal(s), choice.move), `${level} returned illegal ${JSON.stringify(choice.move)}`);
  assert(Number.isInteger(choice.nodes) && choice.nodes >= 0);
  assert(Number.isInteger(choice.depth) && choice.depth >= 0);
  return choice;
}
function run(options = {}) {
  report.passed = 0;
  report.failed = 0;
  report.tests = [];
  report.selfPlay = [];
  const started = Date.now();
  const test = (name, fn) => {
    const start = Date.now();
    try {
      fn();
      report.passed++;
      report.tests.push({ name, passed: true, durationMs: Date.now() - start });
    } catch (err) {
      report.failed++;
      report.tests.push({ name, passed: false, error: err.stack || String(err), durationMs: Date.now() - start });
    }
  };
  const { K, A, E: B, H, R, C, P } = E;

  test('Initial layout, counters, key and 44 legal moves', () => {
    const s = E.initial();
    assert.equal(s.board.length, 90);
    assert.equal(s.board.filter(p => p > 0).length, 16);
    assert.equal(s.board.filter(p => p < 0).length, 16);
    assert.deepEqual(s.board.slice(0, 9), [-R, -H, -B, -A, -K, -A, -B, -H, -R]);
    assert.deepEqual(s.board.slice(81), [R, H, B, A, K, A, B, H, R]);
    assert.equal(s.turn, 1);
    assert.equal(s.quiet, 0);
    assert.equal(s.ply, 0);
    assert.deepEqual(s.keys, [E.key(s)]);
    assert.equal(E.legal(s).length, 44);
    const counts = {};
    for (const m of E.legal(s)) counts[s.board[m.from]] = (counts[s.board[m.from]] || 0) + 1;
    assert.deepEqual(counts, { 1: 1, 2: 2, 3: 4, 4: 4, 5: 4, 6: 24, 7: 5 });
    assert.equal(E.inCheck(s.board, 1), false);
    assert.equal(E.inCheck(s.board, -1), false);
    assert.equal(E.outcome(s), null);
    assert.deepEqual(E.xy(89), [8, 9]);
  });
  test('Empty squares have no pseudo moves', () => targets(board(), 4, 4, []));
  test('Red king orthogonal palace movement and edge', () => {
    targets(board([K, 4, 8]), 4, 8, [[3, 8], [5, 8], [4, 7], [4, 9]]);
    targets(board([K, 3, 9]), 3, 9, [[4, 9], [3, 8]]);
    targets(board([K, 4, 7], [P, 3, 7], [-P, 5, 7]), 4, 7, [[5, 7], [4, 8]]);
  });
  test('Black king orthogonal palace movement and edge', () => {
    targets(board([-K, 4, 1]), 4, 1, [[3, 1], [5, 1], [4, 0], [4, 2]]);
    targets(board([-K, 5, 0]), 5, 0, [[4, 0], [5, 1]]);
  });
  test('Flying generals capture, check and interposed blocker', () => {
    const b = board([K, 4, 9], [-K, 4, 0]);
    assert(E.pseudo(b, at(4, 9)).includes(at(4, 0)));
    assert(E.pseudo(b, at(4, 0)).includes(at(4, 9)));
    assert(E.inCheck(b, 1));
    assert(E.inCheck(b, -1));
    b[at(4, 5)] = P;
    assert(!E.pseudo(b, at(4, 9)).includes(at(4, 0)));
    assert(!E.inCheck(b, 1));
    assert(!E.inCheck(b, -1));
    const s = state([[K, 4, 9], [-K, 4, 0]]);
    const next = E.play(s, move(4, 9, 4, 0));
    assert.equal(E.outcome(next).winner, 1);
  });
  test('General does not fly to other pieces or across a row', () => {
    assert(!E.pseudo(board([K, 4, 9], [-R, 4, 0]), at(4, 9)).includes(at(4, 0)));
    assert(!E.pseudo(board([K, 3, 9], [-K, 5, 9]), at(3, 9)).includes(at(5, 9)));
  });
  test('Advisors move one diagonal within either palace', () => {
    targets(board([A, 4, 8]), 4, 8, [[3, 7], [5, 7], [3, 9], [5, 9]]);
    targets(board([A, 3, 9]), 3, 9, [[4, 8]]);
    targets(board([-A, 4, 1]), 4, 1, [[3, 0], [5, 0], [3, 2], [5, 2]]);
    targets(board([-A, 5, 2], [-P, 4, 1]), 5, 2, []);
    targets(board([A, 3, 9], [-P, 4, 8]), 3, 9, [[4, 8]]);
  });
  test('Elephants move two diagonals and cannot cross the river', () => {
    targets(board([B, 4, 7]), 4, 7, [[2, 5], [6, 5], [2, 9], [6, 9]]);
    targets(board([B, 4, 5]), 4, 5, [[2, 7], [6, 7]]);
    targets(board([-B, 4, 2]), 4, 2, [[2, 0], [6, 0], [2, 4], [6, 4]]);
    targets(board([-B, 4, 4]), 4, 4, [[2, 2], [6, 2]]);
    targets(board([B, 0, 7]), 0, 7, [[2, 5], [2, 9]]);
  });
  test('All four elephant eyes block, regardless of blocker side', () => {
    const goals = [[2, 5], [6, 5], [2, 9], [6, 9]];
    for (let i = 0; i < goals.length; i++) {
      const [x, y] = goals[i];
      targets(board([B, 4, 7], [i % 2 ? -P : P, (4 + x) / 2, (7 + y) / 2]), 4, 7, goals.filter((_, j) => i !== j));
    }
    targets(board([B, 4, 7], [P, 2, 5], [-P, 6, 5]), 4, 7, [[6, 5], [2, 9], [6, 9]]);
  });
  test('Horse eight L moves, board corners and capture occupancy', () => {
    const goals = [[5, 6], [3, 6], [5, 2], [3, 2], [6, 5], [6, 3], [2, 5], [2, 3]];
    targets(board([H, 4, 4]), 4, 4, goals);
    targets(board([H, 0, 0]), 0, 0, [[1, 2], [2, 1]]);
    targets(board([-H, 8, 9]), 8, 9, [[7, 7], [6, 8]]);
    targets(board([H, 4, 4], [P, 5, 6], [-P, 3, 6]), 4, 4, goals.filter(([x, y]) => x !== 5 || y !== 6));
  });
  test('Each horse leg blocks exactly its two L moves', () => {
    const goals = [[5, 6], [3, 6], [5, 2], [3, 2], [6, 5], [6, 3], [2, 5], [2, 3]];
    for (const [lx, ly, blocked] of [[4, 5, [0, 1]], [4, 3, [2, 3]], [5, 4, [4, 5]], [3, 4, [6, 7]]]) {
      targets(board([H, 4, 4], [P, lx, ly]), 4, 4, goals.filter((_, i) => !blocked.includes(i)));
      targets(board([-H, 4, 4], [P, lx, ly]), 4, 4, goals.filter((_, i) => !blocked.includes(i)));
    }
  });
  test('Rooks slide, stop at friendly pieces, capture first enemy only', () => {
    const open = board([R, 4, 4]);
    assert.equal(E.pseudo(open, at(4, 4)).length, 17);
    const b = board([R, 4, 4], [P, 4, 6], [-P, 4, 2], [-P, 4, 1], [P, 2, 4], [-P, 6, 4], [-P, 7, 4]);
    targets(b, 4, 4, [[4, 5], [4, 3], [4, 2], [3, 4], [5, 4], [6, 4]]);
  });
  test('Cannons slide freely without screens, but cannot capture first piece', () => {
    assert.equal(E.pseudo(board([C, 4, 4]), at(4, 4)).length, 17);
    const b = board([C, 4, 4], [-P, 4, 2]);
    const ts = E.pseudo(b, at(4, 4));
    assert(ts.includes(at(4, 3)));
    assert(!ts.includes(at(4, 2)));
    assert(!ts.includes(at(4, 1)));
    assert(!ts.includes(at(4, 0)));
  });
  test('Cannons capture across exactly one screen and never land on empty beyond it', () => {
    const b = board([C, 4, 4], [P, 4, 6], [-P, 4, 8], [-R, 4, 9], [-P, 4, 2], [P, 4, 0], [P, 2, 4], [-P, 0, 4], [-P, 6, 4], [-P, 8, 4]);
    targets(b, 4, 4, [[4, 5], [4, 8], [4, 3], [3, 4], [0, 4], [5, 4], [8, 4]]);
    assert(!E.pseudo(b, at(4, 4)).includes(at(4, 9)), 'two screens block capture');
    assert(!E.pseudo(b, at(4, 4)).includes(at(4, 0)), 'cannot capture friendly second piece');
  });
  test('Red soldiers cross river before gaining sideways moves and never retreat', () => {
    targets(board([P, 4, 6]), 4, 6, [[4, 5]]);
    targets(board([P, 4, 5]), 4, 5, [[4, 4]]);
    targets(board([P, 4, 4]), 4, 4, [[4, 3], [3, 4], [5, 4]]);
    targets(board([P, 4, 0]), 4, 0, [[3, 0], [5, 0]]);
    targets(board([P, 0, 4]), 0, 4, [[0, 3], [1, 4]]);
    targets(board([P, 4, 4], [R, 4, 3], [-P, 3, 4]), 4, 4, [[3, 4], [5, 4]]);
  });
  test('Black soldiers cross river before gaining sideways moves and never retreat', () => {
    targets(board([-P, 4, 3]), 4, 3, [[4, 4]]);
    targets(board([-P, 4, 4]), 4, 4, [[4, 5]]);
    targets(board([-P, 4, 5]), 4, 5, [[4, 6], [3, 5], [5, 5]]);
    targets(board([-P, 4, 9]), 4, 9, [[3, 9], [5, 9]]);
    targets(board([-P, 8, 5]), 8, 5, [[8, 6], [7, 5]]);
  });
  test('Rook, horse, cannon and soldier check detection respects their blockers', () => {
    const common = [[K, 4, 9], [-K, 3, 0]];
    assert(E.inCheck(board(...common, [-R, 4, 5]), 1));
    assert(!E.inCheck(board(...common, [-R, 4, 5], [P, 4, 7]), 1));
    assert(E.inCheck(board(...common, [-H, 3, 7]), 1));
    assert(!E.inCheck(board(...common, [-H, 3, 7], [P, 3, 8]), 1));
    assert(!E.inCheck(board(...common, [-C, 4, 5]), 1));
    assert(E.inCheck(board(...common, [-C, 4, 5], [P, 4, 7]), 1));
    assert(!E.inCheck(board(...common, [-C, 4, 5], [P, 4, 7], [P, 4, 8]), 1));
    assert(E.inCheck(board(...common, [-P, 4, 8]), 1));
    assert(E.inCheck(board(...common, [-P, 3, 9]), 1));
    assert(!E.inCheck(board(...common, [-P, 4, 7]), 1));
  });
  test('Pinned piece cannot expose its king to a rook or opposing general', () => {
    const s = state([[K, 4, 9], [-K, 3, 0], [-R, 4, 0], [R, 4, 5]]);
    assert(!has(E.legal(s), move(4, 5, 5, 5)));
    assert(has(E.legal(s), move(4, 5, 4, 6)));
    assert(has(E.legal(s), move(4, 5, 4, 0)));
    const face = state([[K, 4, 9], [-K, 4, 0], [R, 4, 5]]);
    assert(!has(E.legal(face), move(4, 5, 5, 5)));
    assert(has(E.legal(face), move(4, 5, 4, 6)));
    assert.throws(() => E.play(face, move(4, 5, 5, 5)), /Illegal/);
  });
  test('Check evasions allow capture, interposition and safe king moves only', () => {
    const s = state([[K, 4, 9], [-K, 3, 0], [-P, 3, 3], [-R, 4, 5], [R, 0, 8], [R, 0, 5], [H, 1, 9]]);
    assert(E.inCheck(s.board, 1));
    const ls = E.legal(s);
    assert(has(ls, move(0, 5, 4, 5)), 'capture checker');
    assert(has(ls, move(0, 8, 4, 8)), 'interpose');
    assert(has(ls, move(4, 9, 5, 9)), 'sidestep');
    assert(!has(ls, move(1, 9, 2, 7)), 'irrelevant move cannot evade check');
    for (const m of ls) assert(!E.inCheck(E.apply(s, m).board, 1));
  });
  test('Checkmate and Xiangqi stalemate both lose; winner works for either color', () => {
    const base = [[K, 4, 9], [-K, 3, 0], [-R, 3, 8], [-R, 5, 8]];
    const mate = state([...base, [-R, 4, 7]]);
    const stalemate = state(base);
    assert(E.inCheck(mate.board, 1));
    assert(!E.inCheck(stalemate.board, 1));
    assert.equal(E.legal(mate).length, 0);
    assert.equal(E.legal(stalemate).length, 0);
    assert.deepEqual(E.outcome(mate), { winner: -1, reason: '將死' });
    assert.deepEqual(E.outcome(stalemate), { winner: -1, reason: '困斃' });
    assert.deepEqual(E.outcome(mirror(mate)), { winner: 1, reason: '將死' });
    assert.deepEqual(E.outcome(mirror(stalemate)), { winner: 1, reason: '困斃' });
    assert.throws(() => E.play(mate, move(4, 9, 3, 9)), /finished/);
    mate.quiet = 120;
    assert.equal(E.outcome(mate).winner, -1, 'mate takes priority over move-count draw');
  });
  test('Missing general is terminal, including general captured by a rook', () => {
    const s = state([[K, 4, 9], [-K, 3, 0], [R, 3, 1]]);
    const n = E.play(s, move(3, 1, 3, 0));
    assert(E.inCheck(n.board, -1));
    assert.deepEqual(E.outcome(n), { winner: 1, reason: '將帥被擒' });
  });
  test('Legal move filtering, uniqueness and invalid move rejection', () => {
    const s = E.initial();
    const all = E.legal(s);
    assert.equal(new Set(all.map(moveId)).size, all.length);
    assert.deepEqual(E.legal(s, at(1, 9)), all.filter(m => m.from === at(1, 9)));
    assert.deepEqual(E.legal(s, at(1, 0)), []);
    for (const m of [null, {}, { from: '54', to: 45 }, { from: 54, to: 45.5 }, { from: -1, to: 2 }, { from: 54, to: 100 }, move(0, 3, 0, 4), move(0, 6, 1, 6), move(0, 6, 0, 6)]) {
      assert.throws(() => E.play(s, m));
    }
  });
  test('Play/apply are immutable; capture, quiet, turn, ply and keys update', () => {
    const s = E.initial();
    const before = JSON.stringify(s);
    const n = E.play(s, move(0, 6, 0, 5));
    assert.equal(JSON.stringify(s), before);
    assert.equal(n.turn, -1);
    assert.equal(n.ply, 1);
    assert.equal(n.quiet, 1);
    assert.equal(n.board[at(0, 6)], 0);
    assert.equal(n.board[at(0, 5)], P);
    assert.notEqual(n.board, s.board);
    assert.notEqual(n.keys, s.keys);
    assert.equal(n.keys.length, 2);
    assert.equal(n.keys[1], E.key(n));
    const capture = state([[K, 4, 9], [-K, 3, 0], [R, 0, 5], [-P, 0, 3]], 1, { quiet: 117, ply: 9 });
    const c = E.play(capture, move(0, 5, 0, 3));
    assert.equal(c.quiet, 0);
    assert.equal(c.ply, 10);
    assert.equal(c.board[at(0, 3)], R);
  });
  test('Threefold repetition requires same board and turn; real legal cycle draws', () => {
    let s = E.initial();
    const opposite = { ...s, turn: -1 };
    assert.notEqual(E.key(opposite), E.key(s));
    const cycle = [move(1, 9, 2, 7), move(1, 0, 2, 2), move(2, 7, 1, 9), move(2, 2, 1, 0)];
    for (let i = 0; i < 8; i++) {
      s = E.play(s, cycle[i % 4]);
      if (i < 7) assert.equal(E.outcome(s), null);
    }
    assert.deepEqual(E.outcome(s), { winner: 0, reason: '同一局面出現三次' });
    assert.throws(() => E.play(s, cycle[0]), /finished/);
  });
  test('120 non-capturing plies draw; captures reset the clock', () => {
    let s = E.initial();
    s.quiet = 118;
    s = E.play(s, move(0, 6, 0, 5));
    assert.equal(s.quiet, 119);
    assert.equal(E.outcome(s), null);
    s = E.play(s, move(0, 3, 0, 4));
    assert.equal(s.quiet, 120);
    assert.deepEqual(E.outcome(s), { winner: 0, reason: '連續 120 手未吃子' });
    assert.throws(() => E.play(s, move(2, 6, 2, 5)), /finished/);
    const capture = state([[K, 4, 9], [-K, 3, 0], [R, 0, 5], [-P, 0, 3]], 1, { quiet: 119 });
    const n = E.play(capture, move(0, 5, 0, 3));
    assert.equal(n.quiet, 0);
    assert.equal(E.outcome(n), null);
  });
  test('Every opening and second-ply legal move keeps own general safe', () => {
    const start = E.initial();
    let count = 0;
    for (const m of E.legal(start)) {
      const s = E.play(start, m);
      assert(!E.inCheck(s.board, 1));
      for (const reply of E.legal(s)) {
        const n = E.play(s, reply);
        assert(!E.inCheck(n.board, -1));
        count++;
      }
    }
    assert.equal(count, 1920, 'known initial position depth-two perft');
  });
  test('Color-rotated opening and representative positions have symmetric legal sets', () => {
    const positions = [E.initial(), state([[K, 4, 9], [-K, 3, 0], [R, 4, 6], [-C, 7, 6], [P, 4, 5], [-H, 2, 2], [H, 5, 7], [-P, 6, 4], [B, 2, 9], [A, 3, 9]])];
    for (const s of positions) {
      const mirroredMoves = E.legal(mirror(s)).map(moveId).sort();
      const transformed = E.legal(s).map(m => moveId({ from: 89 - m.from, to: 89 - m.to })).sort();
      assert.deepEqual(mirroredMoves, transformed);
    }
  });
  test('Session saves only moves/options and faithfully replays valid saves', () => {
    let session = S.fresh({ mode: 'local', level: 'normal', human: 1 });
    const first = session;
    session = S.move(session, move(0, 6, 0, 5));
    session = S.move(session, move(0, 3, 0, 4));
    assert.equal(first.moves.length, 0);
    assert.equal(first.state.ply, 0);
    const raw = S.save(session);
    const data = JSON.parse(raw);
    assert.deepEqual(Object.keys(data).sort(), ['moves', 'options', 'version']);
    assert.deepEqual(S.restore(raw), session);
    data.state = { board: Array(90).fill(K), turn: -1 };
    assert.deepEqual(S.restore(JSON.stringify(data)), session, 'restore must ignore a forged board');
    assert.deepEqual(S.restore(S.save(S.fresh())), S.fresh());
  });
  test('Session restore rejects malformed, oversized, incompatible and illegal replay data', () => {
    const base = JSON.parse(S.save(S.fresh()));
    const bad = [null, {}, '', 'not json', 'null', '[]', '{}', 'x'.repeat(180001), JSON.stringify({ ...base, version: 2 }), JSON.stringify({ ...base, moves: {} }), JSON.stringify({ ...base, moves: Array(3001).fill(move(0, 6, 0, 5)) })];
    for (const raw of bad) assert.throws(() => S.restore(raw));
    for (const opts of [null, {}, { mode: 'online', level: 'easy', human: 1 }, { mode: 'local', level: 'extreme', human: 1 }, { mode: 'local', level: 'easy', human: 0 }, { mode: 'local', level: 'easy', human: '1' }]) {
      assert.throws(() => S.restore(JSON.stringify({ ...base, options: opts })));
    }
    for (const m of [null, {}, { from: '54', to: 45 }, { from: 54, to: 45.5 }, move(0, 6, 1, 6), move(0, 3, 0, 4), { from: -1, to: 2 }]) {
      assert.throws(() => S.restore(JSON.stringify({ ...base, moves: [m] })));
    }
    assert.throws(() => S.restore(JSON.stringify({ ...base, moves: [move(0, 6, 0, 5), move(0, 6, 0, 5)] })), /Illegal/);
  });
  test('Session replay rejects extra moves after a terminal repetition draw', () => {
    const base = JSON.parse(S.save(S.fresh()));
    const cycle = [move(1, 9, 2, 7), move(1, 0, 2, 2), move(2, 7, 1, 9), move(2, 2, 1, 0)];
    const terminal = { ...base, moves: [...cycle, ...cycle] };
    assert.equal(E.outcome(S.restore(JSON.stringify(terminal)).state).winner, 0);
    assert.throws(() => S.restore(JSON.stringify({ ...terminal, moves: [...terminal.moves, cycle[0]] })), /finished/);
  });
  test('Local undo removes one ply, preserves input, and restores history/counters', () => {
    let session = S.fresh({ mode: 'local', level: 'easy', human: 1 });
    assert.equal(S.undo(session), session);
    const history = [session];
    for (const m of [move(0, 6, 0, 5), move(0, 3, 0, 4), move(0, 5, 0, 4)]) {
      session = S.move(session, m);
      history.push(session);
    }
    const before = JSON.stringify(session);
    assert.deepEqual(S.undo(session), history[2]);
    assert.equal(JSON.stringify(session), before);
    assert.deepEqual(S.undo(S.undo(S.undo(session))), history[0]);
  });
  test('AI undo returns to human decision point for human red or black', () => {
    const seq = [move(0, 6, 0, 5), move(0, 3, 0, 4), move(2, 6, 2, 5), move(2, 3, 2, 4)];
    for (const human of [1, -1]) {
      let session = S.fresh({ mode: 'ai', level: 'normal', human });
      const history = [session];
      for (const m of seq) { session = S.move(session, m); history.push(session); }
      const expected = human === 1 ? [0, 0, 2, 2] : [0, 1, 1, 3];
      for (let i = 1; i <= seq.length; i++) assert.deepEqual(S.undo(history[i]), history[expected[i - 1]], `human=${human}, plies=${i}`);
    }
  });
  test('AI shipped easy, normal and hard profiles each return a legal opening move', () => {
    for (const level of ['easy', 'normal', 'hard']) {
      assert(AI.profiles[level]);
      validateChosen(E.initial(), level);
    }
    assert(AI.profiles.easy.depth < AI.profiles.normal.depth);
    assert(AI.profiles.normal.depth < AI.profiles.hard.depth);
  });
  test('AI keeps a legal fallback when node/time budget expires immediately', () => {
    const s = E.initial();
    assert.equal(validateChosen(s, 'hard', { nodes: 0, ms: 0 }).depth, 0);
    validateChosen(s, 'unknown', { nodes: 100, ms: Infinity });
  });
  test('AI returns no move for mate, stalemate or a drawn position', () => {
    const mate = state([[K, 4, 9], [-K, 3, 0], [-R, 3, 8], [-R, 5, 8], [-R, 4, 7]]);
    const stale = state([[K, 4, 9], [-K, 3, 0], [-R, 3, 8], [-R, 5, 8]]);
    const draw = E.initial();
    draw.quiet = 120;
    for (const s of [mate, stale, draw]) for (const level of ['easy', 'normal', 'hard']) assert.equal(AI.choose(s, level).move, null);
  });
  test('AI finds an immediate general capture and a forced check evasion', () => {
    const capture = state([[K, 4, 9], [-K, 3, 0], [R, 3, 1]]);
    for (const level of ['easy', 'normal', 'hard']) {
      const chosen = validateChosen(capture, level, { ms: Infinity, nodes: 1200 });
      assert.equal(E.outcome(E.play(capture, chosen.move)).winner, 1);
    }
    const check = state([[K, 4, 9], [-K, 3, 0], [-P, 3, 3], [-R, 4, 5], [R, 0, 8], [H, 1, 9]]);
    for (const level of ['easy', 'normal', 'hard']) {
      const chosen = validateChosen(check, level, { ms: Infinity, nodes: 1200 });
      assert(!E.inCheck(E.play(check, chosen.move).board, 1));
    }
  });
  const selfPlayPlies = Math.max(24, options.selfPlayPlies || 24);
  for (const level of ['easy', 'normal', 'hard']) test(`${level} AI reproducible self-play, at least ${selfPlayPlies} plies`, () => {
    let s = E.initial();
    const moves = [];
    const depths = [];
    const budget = { easy: 400, normal: 1000, hard: 2000 }[level];
    for (let ply = 0; ply < selfPlayPlies; ply++) {
      assert.equal(E.outcome(s), null, `${level} game terminated before required self-play horizon at ${ply}`);
      const chosen = validateChosen(s, level, { ms: Infinity, nodes: budget });
      const mover = s.turn;
      const before = JSON.stringify(s);
      const n = E.play(s, chosen.move);
      assert.equal(JSON.stringify(s), before);
      assert(!E.inCheck(n.board, mover));
      assert.equal(n.turn, -mover);
      assert.equal(n.ply, ply + 1);
      assert.equal(n.keys.length, ply + 2);
      moves.push(chosen.move);
      depths.push(chosen.depth);
      s = n;
    }
    const session = { options: { mode: 'ai', level, human: 1 }, moves, state: s };
    assert.deepEqual(S.restore(S.save(session)), session);
    assert.equal(S.undo(session).moves.length, selfPlayPlies % 2 === 0 ? selfPlayPlies - 2 : selfPlayPlies - 1);
    report.selfPlay.push({ level, plies: moves.length, nodeBudgetPerMove: budget, completedDepths: depths, moves, finalOutcome: E.outcome(s) });
  });
  report.durationMs = Date.now() - started;
  return report;
}

module.exports = { run, report };
if (require.main === module) {
  const result = run();
  for (const t of result.tests) console.log(`${t.passed ? 'PASS' : 'FAIL'} ${t.name}${t.passed ? '' : '\n' + t.error}`);
  for (const game of result.selfPlay) console.log(`SELFPLAY ${game.level}: ${game.plies} legal plies, fixed ${game.nodeBudgetPerMove}-node budget, final result ${JSON.stringify(game.finalOutcome)}`);
  console.log(`\n${result.passed} passed; ${result.failed} failed; ${result.durationMs} ms`);
  if (process.argv.includes('--json')) console.log(JSON.stringify(result, null, 2));
  process.exitCode = result.failed ? 1 : 0;
}
