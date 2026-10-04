'use strict';
// Regression assertions for two public-information deductions in the hard sampler.
// This file reports the present result and does not modify production code.
const assert=require('node:assert/strict'),E=require('./match-engine.js'),AI=require('./match-ai.js');
function makeHands(hand0){const h=[hand0,[],[],[]];let n=0;for(let c=0;c<52;c++)if(!hand0.includes(c))h[1+(n++%3)].push(c);return h;}
let s=E.create(0);s.phase='play';s.turn=0;s.hands=makeHands([0,12,...Array.from({length:11},(_,i)=>26+i)]);
for(const trick of [[[0,0],[1,1],[2,2],[3,3]],[[3,6],[0,12],[1,4],[2,5]]]){for(const [p,card] of trick)s=E.transition(s,{type:'play',p,card});s=E.transition(s,{type:'collect'});}
if(s.broken||s.turn!==0)throw Error('Unexpected fixture');s=E.transition(s,{type:'play',p:0,card:26});E.invariant(s);
let o=E.observe(s,1),v=AI.voids(o),sample=AI.sample(o,E.rng(42),v);
assert.deepEqual([...v[0]].sort(),[0,1,3]);
assert.ok(sample);assert.ok(sample[0].every(c=>E.suit(c)===2));
let heartLeadSamples=0;for(let i=0;i<128;i++){const h=AI.sample(o,E.rng(i),v);if(h){assert.ok(h[0].every(c=>E.suit(c)===2));heartLeadSamples++;}}assert.ok(heartLeadSamples>0);
console.log('PASS: unbroken heart lead restricts sampled leader to hearts only.');
// Seat 1 has exactly twelve hearts plus Q spades. Their first-trick penalty discard
// proves no clubs, diamonds, or non-queen spades can remain in their hand.
s=E.create(0);const h1=[...Array.from({length:12},(_,i)=>26+i),49],h=makeHands(h1);s.hands=[h[1],h1,h[2],h[3]];s.phase='play';s.turn=s.hands.findIndex(h=>h.includes(0));s=E.transition(s,{type:'play',p:s.turn,card:0});if(s.turn!==1)throw Error('Unexpected fixture');s=E.transition(s,{type:'play',p:1,card:26});E.invariant(s);
o=E.observe(s,3);v=AI.voids(o);assert.ok(o.hand.includes(38));assert.ok(v.penaltyOnly.has(1));assert.ok(!v[1].has(3),'Penalty-only must not forbid Q spades');
let penaltyOnlySamples=0;for(let i=0;i<128;i++){const h=AI.sample(o,E.rng(i),v);if(h){assert.ok(h[1].every(c=>E.penalty(c)>0));assert.ok(h[1].includes(49),'With A hearts visible, Q spades must remain in the penalty-only hand');penaltyOnlySamples++;}}assert.ok(penaltyOnlySamples>0);
console.log('PASS: first-trick penalty discard restricts samples to penalties and preserves Q spades.');
module.exports={heartLeadSamples,penaltyOnlySamples};
