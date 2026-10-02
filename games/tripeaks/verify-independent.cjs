#!/usr/bin/env node
'use strict';
// Deliberately independent: imports only the shipped data, not engine.js.
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const D = require('./deals.js');
function layout() {
  const p = [];
  for (let peak = 0; peak < 3; peak++) p.push([1.5 + 3 * peak, 0]);
  for (let peak = 0; peak < 3; peak++) for (let j = 0; j < 2; j++) p.push([1 + 3 * peak + j, 1]);
  for (let j = 0; j < 9; j++) p.push([j + .5, 2]);
  for (let j = 0; j < 10; j++) p.push([j, 3]);
  return p;
}
const positions = layout();
const blockers = positions.map(([x,y]) => positions.flatMap(([xx,yy],j) => yy === y+1 && Math.abs(x-xx) === .5 ? [j] : []));
const mirror = positions.map(([x,y]) => positions.findIndex(([xx,yy]) => xx === 9-x && yy === y));
function canonicalRanks(cards) {
  const normal = cards.map(c => c % 13), reflected = normal.map((r,i) => i < 28 ? normal[mirror[i]] : r), candidates = [];
  for (const ranks of [normal, reflected]) for (let direction of [1, -1]) for (let shift = 0; shift < 13; shift++)
    candidates.push(ranks.map(r => ((r * direction + shift + 13) % 13).toString(16)).join(''));
  return candidates.sort()[0];
}
function verify(deal) {
  assert.equal(deal.cards.length, 52, 'Exactly 52 cards');
  assert.deepEqual([...deal.cards].sort((a,b) => a-b), Array.from({length:52},(_,i)=>i), 'A full unique standard deck');
  assert.equal(positions.length, 28);
  assert.deepEqual([0,1,2,3].map(row => positions.filter(p => p[1]===row).length),[3,6,9,10]);
  assert.equal(blockers.filter(b => !b.length).length, 10, 'Exactly ten initially exposed cards');
  assert.equal(blockers.filter(b => b.length === 2).length, 18, 'Each upper card has exactly two blockers');
  assert.equal(deal.cards.slice(29).length, 23, '23 stock cards after opening waste');
  const present = new Set(Array.from({length:28},(_,i)=>i));
  let top = deal.cards[28], next = 29, removals = 0, draws = 0, wrapMoves = 0;
  assert.ok(Array.isArray(deal.witness) && deal.witness.length <= 51, 'Bounded witness');
  deal.witness.forEach((a, step) => {
    assert.ok(present.size > 0, `No action after win, step ${step}`);
    if (a === -1) {
      assert.ok(next < 52, 'No second pass or stock overflow'); top = deal.cards[next++]; draws++; return;
    }
    assert.ok(Number.isInteger(a) && a >= 0 && a < 28, 'Valid tableau index');
    assert.ok(present.has(a), 'Card can be removed only once');
    assert.ok(blockers[a].every(j => !present.has(j)), 'Every overlapping blocker was removed');
    const difference = Math.abs(top % 13 - deal.cards[a] % 13);
    assert.ok(difference === 1 || difference === 12, 'Exactly ±1 rank with A↔K wrap');
    if (difference === 12) wrapMoves++;
    present.delete(a); top = deal.cards[a]; removals++;
  });
  assert.equal(present.size, 0, 'All tableau cards cleared');
  assert.equal(removals, 28, 'Each of the 28 cards removed');
  assert.ok(draws <= 23);
  assert.equal(removals + draws, deal.witness.length);
  return { id:deal.id, seed:deal.seed, cards:52, removals, draws, actions:deal.witness.length,
    wrapMoves, canonicalRankHash:crypto.createHash('sha256').update(canonicalRanks(deal.cards)).digest('hex') };
}
function run() {
  assert.equal(D.rules,'tripeaks-wrap-v1');
  assert.ok(D.deals.length >= 50);
  const results = D.deals.map(verify);
  assert.equal(new Set(D.deals.map(d => d.id)).size,D.deals.length);
  assert.equal(new Set(D.deals.map(d => d.seed)).size,D.deals.length);
  assert.equal(new Set(results.map(r => r.canonicalRankHash)).size,D.deals.length,
    'All rank layouts differ even after ignoring suits, rank-cycle rotation/reversal and horizontal board reflection');
  const report = { result:'PASS', verifier:'Independent geometric-overlap and rank checker, no gameplay engine import',
    rules:'52 unique cards; 3/6/9/10 rows; 28 tableau; initial waste + 23 one-pass stock; ±1 rank; A↔K wrap; remove all 28',
    deals:results.length, uniqueCanonicalRankLayouts:results.length, totalVerifiedActions:results.reduce((n,r)=>n+r.actions,0),
    minActions:Math.min(...results.map(r=>r.actions)), maxActions:Math.max(...results.map(r=>r.actions)), results };
  if (process.argv.includes('--json')) console.log(JSON.stringify(report,null,2));
  else console.log(`PASS independent checker: ${report.deals} / ${report.deals} wins; ${report.uniqueCanonicalRankLayouts} canonical rank layouts; ${report.totalVerifiedActions} legal actions (${report.minActions}–${report.maxActions} per deal).`);
  return report;
}
if (require.main === module) run();
module.exports = { positions, blockers, canonicalRanks, verify, run };
