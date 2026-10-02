#!/usr/bin/env node
'use strict';
// Usage: node games/tripeaks/generate.cjs [--check]
// Seeded Fisher–Yates shuffles are searched. Only complete winning witnesses
// qualify. No tableau is edited to fit a path and unknown runs are discarded.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const E = require('./engine.js');
function random(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0;
  let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61);
  return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function shuffle(seed) { const rnd = random(seed), cards = Array.from({ length: 52 }, (_, i) => i);
  for (let i = 51; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [cards[i], cards[j]] = [cards[j], cards[i]]; }
  return cards; }
function build() {
  const deals = [], rankLayouts = new Set(), rejected = [];
  for (let seed = 7319001; deals.length < 50; seed++) {
    const deal = { id: deals.length + 1, seed, cards: shuffle(seed) };
    const signature = deal.cards.map(E.rank).join(',');
    if (rankLayouts.has(signature)) { rejected.push({ seed, reason: 'duplicate rank layout' }); continue; }
    const result = E.solve(deal, null, { maxNodes: 500000 });
    if (result.status !== 'solved') { rejected.push({ seed, reason: result.status, nodes: result.nodes }); continue; }
    deal.witness = result.witness;
    if (E.replay(deal, deal.witness).remaining) throw new Error('Solver returned incomplete proof');
    deal.searchNodes = result.nodes;
    deal.rankHash = crypto.createHash('sha256').update(signature).digest('hex');
    rankLayouts.add(signature); deals.push(deal);
    console.error(`Certified ${String(deal.id).padStart(2,'0')} seed=${seed} moves=${deal.witness.length} nodes=${result.nodes}`);
  }
  return { schema: 1, rules: E.VERSION, generator: 'mulberry32 + Fisher-Yates + complete DFS witness',
    startSeed: 7319001, maxSearchNodes: 500000, rejected, deals };
}
if (require.main === module) {
  const dataset = build();
  const js = '/* Generated with generate.cjs; all 50 legal witnesses are embedded. */\n' +
    '(function(root,data){if(typeof module==="object"&&module.exports)module.exports=data;else root.TRIPEAKS_DATA=data;})(typeof globalThis!=="undefined"?globalThis:this,\n' +
    JSON.stringify(dataset) + '\n);\n';
  const target = path.join(__dirname, 'deals.js');
  if (process.argv.includes('--check')) {
    if (fs.readFileSync(target, 'utf8') !== js) throw new Error('Dataset is not reproducible');
    console.log('PASS: exact byte-for-byte reproduction of all 50 certified deals');
  } else { fs.writeFileSync(target, js); console.log(`Saved ${target}`); }
}
module.exports = { shuffle, build };
