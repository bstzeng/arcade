#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
const E = require('./engine.js'), D = require('./deals.js');
const independent = require('./verify-independent.cjs');
const {shuffle} = require('./generate.cjs');
assert.deepEqual(E.POSITIONS, independent.positions, 'Gameplay layout matches independent geometry');
assert.deepEqual(E.COVERS, independent.blockers, 'Gameplay overlaps match geometric overlaps');
assert.ok(E.adjacent(1,13)); assert.ok(E.adjacent(13,1));
assert.ok(E.adjacent(1,2)); assert.ok(!E.adjacent(7,7)); assert.ok(!E.adjacent(1,3));
let replayed = 0;
for (const d of D.deals) {
  assert.deepEqual(shuffle(d.seed),d.cards,`Deal ${d.id} is an untouched real shuffle`);
  const original = JSON.stringify(d), init = E.initial(d);
  assert.equal(E.count(init.remaining),28); assert.equal(init.stockIndex,0);
  assert.deepEqual(Array.from({length:28},(_,i)=>i).filter(i=>E.exposed(init,i)),Array.from({length:10},(_,i)=>i+18));
  for (let i=0;i<18;i++) assert.throws(()=>E.step(d,init,i));
  for (let i=18;i<28;i++) if(!E.canRemove(d,init,i)) assert.throws(()=>E.step(d,init,i));
  for (const x of [-2,28,52,1.5,NaN,'18',null,undefined]) assert.throws(()=>E.step(d,init,x));
  let state = init;
  const saved = [state];
  for (const action of d.witness) {
    assert.ok(E.legal(d,state).includes(action));
    const old = {...state}; state = E.step(d,state,action);
    assert.deepEqual(saved.at(-1),old,'step never mutates earlier undo state');
    assert.equal(state.moves,old.moves+1);
    saved.push(state); replayed++;
  }
  assert.equal(state.remaining,0); assert.deepEqual(E.legal(d,state),[]);
  assert.throws(()=>E.step(d,state,-1)); assert.throws(()=>E.step(d,state,18));
  assert.deepEqual(state,E.replay(d,d.witness));
  const cp=E.checkpoints(d,d.witness); assert.equal(cp.size,d.witness.length+1);
  for (let i=0;i<saved.length;i++) {
    assert.equal(cp.get(E.key(saved[i])),i);
    assert.deepEqual(E.replay(d,d.witness.slice(0,i)),saved[i],'All undo/persisted prefixes replay identically');
    assert.equal(d.witness.slice(i).reduce((s,a)=>E.step(d,s,a),saved[i]).remaining,0,'Every certified hint has a winning suffix');
  }
  let exhausted=init; for(let i=0;i<23;i++) exhausted=E.step(d,exhausted,-1);
  assert.equal(exhausted.stockIndex,23); assert.throws(()=>E.step(d,exhausted,-1));
  assert.equal(E.replay(d,Array(23).fill(-1)).waste,d.cards[51]);
  assert.throws(()=>E.replay(d,Array(24).fill(-1)));
  assert.throws(()=>E.replay(d,Array(52).fill(-1)));
  assert.equal(JSON.stringify(d),original,'Engine never changes deck/proof');
}
const d=D.deals[0];
assert.throws(()=>E.initial({...d,cards:d.cards.slice(1)}));
assert.throws(()=>E.initial({...d,cards:Array(52).fill(0)}));
assert.throws(()=>E.initial({...d,cards:[-1,...d.cards.slice(1)]}));
assert.equal(E.solve(d,null,{maxNodes:0}).status,'unknown','Search cutoff must not claim unsolvability');
const solved=E.solve(d,null,{maxNodes:500000});
assert.equal(solved.status,'solved'); assert.equal(E.replay(d,solved.witness).remaining,0);
// Negative proof checks must reject cheats as well as accepting the actual proofs.
assert.throws(()=>independent.verify({...d,cards:Array(52).fill(0)}));
assert.throws(()=>independent.verify({...d,witness:[0,...d.witness]}));
assert.throws(()=>independent.verify({...d,witness:[...d.witness,-1]}));
assert.throws(()=>independent.verify({...d,witness:Array(24).fill(-1)}));
assert.throws(()=>independent.verify({...d,witness:d.witness.slice(0,-1)}));
console.log(`PASS shared gameplay engine: ${D.deals.length} winning replays, ${replayed} legal moves, all undo/checkpoint suffixes, deck/rule/stock/adversarial tests.`);
const report=independent.run();
assert.deepEqual(require('./certification.json'),report,'Shipped certification report exactly matches independent verification');
