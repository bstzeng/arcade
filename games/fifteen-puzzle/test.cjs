'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),E=require('./engine.js'),S=require('./session.js'),L=require('./levels.json');
const hanoi=path.basename(__dirname)==='hanoi';
let witnessed=0,offpath=0;
for(const l of L){assert(E.validate(l));const original=JSON.stringify(l),start=E.initial(l),states=E.proof(l);assert(E.won(l,states.at(-1)));assert.equal(states.length,l.solution.length+1);assert.equal(JSON.stringify(l),original);witnessed++;
 for(let j=0;j<l.solution.length;j++){const s=states[j],a=l.solution[j];assert(E.legal(l,s,a));const next=E.step(l,s,a);assert.deepEqual(next,states[j+1]);assert.deepEqual(s,states[j]);if(hanoi){assert.equal(s.filter((p,i)=>p!==next[i]).length,1);assert.deepEqual(E.step(l,next,{disc:a.disc,from:a.to,to:a.from}),s);}else{assert.equal(s.filter((p,i)=>p!==next[i]).length,2);assert.deepEqual(E.step(l,next,a),s);}}
 for(const bad of hanoi?[null,{disc:0,from:0,to:1},{disc:1,from:0,to:0},{disc:99,from:0,to:1},{disc:1,from:-1,to:0}]:[null,0,-1,99,'1',{}])assert(!E.legal(l,start,bad));
 // Explore 31 deterministic legal actions, deliberately straying from witness.
 let current=start,actions=[];for(let j=0;j<31;j++){const options=E.moves(l,current),a=options[(j*7+l.id)%options.length];actions.push(a);current=E.step(l,current,a);}const before=JSON.stringify(actions),route=E.route(l,actions);assert.equal(JSON.stringify(actions),before);let cursor=current;for(const a of route.moves)cursor=E.step(l,cursor,a);assert(E.won(l,cursor));if(route.kind==='return')offpath++;
 let saved=S.fresh(l.id-1);saved.actions=l.solution.slice();saved.seconds=99;assert(S.record(saved,l,E));const restored=S.restore(JSON.stringify(saved),L,E);assert(!restored.invalid);assert.equal(restored.data.completed[l.id-1].moves,l.solution.length);assert.equal(restored.data.actions.length,l.solution.length);
 saved.completed[l.id-1].witness=[];const forged=S.restore(JSON.stringify(saved),L,E);assert(forged.invalid);assert(!forged.data.completed[l.id-1]);
 // Old completion survives a later undo, but its transcript remains independently valid.
 const normal=S.fresh(l.id-1);normal.actions=l.solution.slice();S.record(normal,l,E);normal.actions.pop();assert(S.restore(JSON.stringify(normal),L,E).data.completed[l.id-1]);
}
assert.equal(witnessed,50);if(!hanoi)assert(offpath>30);
for(const bad of ['{oops','null','[]',JSON.stringify({version:1,index:999,completed:{},actions:[],seconds:0,assisted:false}),JSON.stringify({version:1,index:0,completed:{},actions:[-1],seconds:0,assisted:false})]){const r=S.restore(bad,L,E);assert(r.invalid);assert.equal(r.data.actions.length,0);}
// Pure validated reference function never changes any fixture.
assert.equal(new Set(L.map(l=>hanoi?E.canonical(l.start):l.size+':'+E.key(l.start))).size,50);
if(hanoi){for(let n=3;n<=8;n++)for(let target=0;target<3;target++){const d=E.distances(n,target);assert.equal(d.length,3**n);assert.equal(d.filter(x=>x<0).length,0);assert.equal(Math.max(...d),2**n-1);}const l={...L[0],start:[0,0,0]};assert(!E.legal(l,l.start,{disc:2,from:0,to:1}));assert(!E.legal(l,[0,1,1],{disc:2,from:1,to:0}));}
else{assert(!E.solvable(3,[2,1,3,4,5,6,7,8,0]));assert(!E.solvable(4,[2,1,3,4,5,6,7,8,9,10,11,12,13,14,15,0]));assert(!E.solvable(4,Array(16).fill(0)));}
console.log('PASS: '+path.basename(__dirname)+' 50 complete fixtures, every witness action + inverse, legal/illegal moves, off-path routes, validated current saves and winning transcripts, malformed input, exact state graph/parity invariants');
