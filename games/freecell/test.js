'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const F=require('./engine.js'),deals=require('./deals.json');
let count=0;
for(const d of deals){assert.deepEqual(d.columns.map(c=>c.length),[7,7,7,7,6,6,6,6]);assert(F.validState(F.initial(d.columns)));let s=F.initial(d.columns);const history=[s];for(const m of d.proof){const before=F.key(s);s=F.apply(s,m);assert.notEqual(F.key(s),before);assert(F.validState(s));history.push(s);count++}assert(F.won(s));for(let i=history.length-1;i>0;i--){assert.deepEqual(F.apply(history[i-1],d.proof[i-1]),history[i])}}
const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(__dirname+'/deals.js','utf8'),sandbox);assert.equal(JSON.stringify(sandbox.window.FREECELL_DEALS),JSON.stringify(deals));
const testState={columns:[[6,18,4,16],[20],[31],[44],[50],[37],[49],[36]],cells:[0,13,26,39],foundations:[0,0,0,0]};
// 7♠ 6♥ 5♠ 4♥: ordered, but no spare free cell or empty column.
assert.equal(F.capacity(testState,1),1);
assert.match(F.error(testState,[0,0,0,1,4]),/暫存空間/);
let s=F.clone(testState);s.columns[2]=[];
assert.equal(F.capacity(s,1),2);assert.equal(F.capacity(s,2),1);
s.cells=[null,null,null,null];assert.equal(F.capacity(s,1),10);assert.equal(F.capacity(s,2),5);
assert.equal(F.error(s,[0,0,0,1,4]),null);
assert(F.error(s,[0,0,0,0,1]));assert(F.error(s,[0,0,1,0,2]));assert(F.error(s,[0,0,2,1,1]));
assert(F.error(s,[2,0,0,1,1]));assert(F.error(s,[0,0,0,1,0]));assert(F.error(s,[0,0,0,1,1.5]));assert(F.error(s,[0,0,0,1,500]));
assert.equal(F.supports(6,18),true);assert.equal(F.supports(6,5),false);
const bad=F.initial(deals[0].columns);bad.columns[0][0]=bad.columns[0][1];assert.equal(F.validState(bad),false);
assert.equal(F.validState({...bad,cells:[null]}),false);assert.equal(F.validState(null),false);
assert.throws(()=>F.apply(F.initial(deals[0].columns),[0,0,1,0,2]));
console.log(`PASS: 50 gameplay-engine wins; ${count} legal/reversible transitions; canonical data mirror, capacity destination exclusion, illegal moves, state corruption.`);
