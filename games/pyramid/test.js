'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');const vm=require('node:vm');
const E=require('./engine.js');const data=require('./deals.json');
let actions=0;
for(const d of data.deals){const states=E.proof(d);assert(E.won(states.at(-1)));actions+=d.witness.length;for(let i=0;i<states.length;i++){const s=states[i];assert.equal(s.moves,i);assert.equal(new Set([...s.pyramid.filter(c=>c!==null),...s.stock,...s.waste,...s.removed]).size,52);}}
const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(__dirname+'/deals.js','utf8'),sandbox);assert.equal(JSON.stringify(sandbox.window.PYRAMID_DEALS),JSON.stringify(data));
const d=data.deals[0],s=E.initial(d),original=JSON.stringify(s);
assert(!E.legal(s,{type:'remove',cards:[s.pyramid[0]]}));
assert(!E.legal(s,{type:'remove',cards:[s.stock[0]]}));
assert(!E.legal(s,{type:'remove',cards:[s.pyramid[21],s.pyramid[21]]}));
assert(!E.legal(s,{type:'recycle'}));
assert(!E.legal(s,{type:'banana'}));
assert.throws(()=>E.step(s,{type:'remove',cards:[s.stock[0]]}));
let n=E.step(s,{type:'draw'});assert.equal(JSON.stringify(s),original);assert.equal(n.waste.at(-1),d.stock[0]);
for(let cycle=0;cycle<3;cycle++){
  while(n.stock.length)n=E.step(n,{type:'draw'});
  assert(!E.legal(n,{type:'draw'}));
  if(cycle<2){n=E.step(n,{type:'recycle'});assert.deepEqual(n.stock,d.stock);assert.equal(n.waste.length,0);}
}
assert.equal(n.redeals,2);assert(!E.legal(n,{type:'recycle'}));
assert(!E.legal(n,{type:'remove',cards:[n.waste[0]]}));
assert.throws(()=>E.initial({...d,stock:Array(24).fill(0)}));
assert.throws(()=>E.replay(d,[{type:'recycle'}]));
assert.throws(()=>E.replay(d,Array(257).fill({type:'draw'})));
assert.throws(()=>E.proof({...d,witness:[]}));
const win=E.proof(d).at(-1);assert(!E.legal(win,{type:'draw'}));assert(!E.legal(win,{type:'recycle'}));
// A covered parent may not be removed simultaneously with the child covering it.
let artificial=E.initial({pyramid:Array.from({length:28},(_,i)=>i),stock:Array.from({length:24},(_,i)=>i+28)});
assert(!E.legal(artificial,{type:'remove',cards:[0,11]}));
// Exposed king alone; wrong-valued pairs; both directions of a valid pair.
artificial.pyramid.fill(null);artificial.pyramid[21]=12;artificial.pyramid[22]=0;artificial.pyramid[23]=11;
assert(E.legal(artificial,{type:'remove',cards:[12]}));assert(!E.legal(artificial,{type:'remove',cards:[0]}));
assert(E.legal(artificial,{type:'remove',cards:[0,11]}));assert(E.legal(artificial,{type:'remove',cards:[11,0]}));
assert(!E.legal(artificial,{type:'remove',cards:[0,12]}));
// Every certificate prefix is a valid persisted history and state key is stable.
for(const d of data.deals){let states=E.proof(d);for(let i=0;i<=d.witness.length;i++)assert.equal(E.key(E.replay(d,d.witness.slice(0,i)).at(-1)),E.key(states[i]));}
console.log(`PASS: ${data.deals.length} gameplay witnesses, ${actions} legal actions; deck conservation, browser-data parity, save replay, immutability, exposure, K/pairs, stock/waste, 2 redeals, post-win boundaries`);
