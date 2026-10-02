'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const E=require('./engine.js'),data=require('./deals.js'),raw=JSON.parse(fs.readFileSync(__dirname+'/deals.json','utf8'));
assert.deepEqual(data,raw,'Browser and independently verified data must be identical');
let count=0,completions=0,deals=0,runMoves=0;
const canonical=new Set();
for(const d of data.deals){
 let s=E.start(d),states=[s],actions=[];
 assert.equal(s.columns.flat().filter(c=>!c.up).length,44);
 const tracks=d.tableau.map((col,c)=>[col.map(id=>d.ranks[id]),Array.from({length:5},(_,r)=>d.ranks[d.stock[r*10+c]])]);
 canonical.add(JSON.stringify(tracks.map(JSON.stringify).sort()));
 for(const a of d.solution){
  const before=JSON.stringify(s),prior=s,removed=s.completed.length;
  if(a.type==='deal')deals++;
  else if(s.columns[a.from].length-a.index>1)runMoves++;
  s=E.step(s,a,d.ranks);count++;completions+=s.completed.length-removed;
  assert.equal(JSON.stringify(prior),before,'A step must not mutate its input, allowing exact unlimited undo');
  const ids=s.columns.flat().map(c=>c.id).concat(s.stock,s.completed.flat());
  assert.equal(ids.length,104);assert.equal(new Set(ids).size,104);
  states.push(s);actions.push(a);
 }
 assert(E.won(s));assert.equal(s.moves,d.solution.length);
 // Undo every action including rows, hidden flips, and each auto-completion.
 while(actions.length){states.pop();actions.pop();assert.deepEqual(E.replay(d,actions).state,states.at(-1));}
 // A saved action log restores state and all undo snapshots exactly.
 const saved=JSON.parse(JSON.stringify(d.solution.slice(0,43)));
 assert.deepEqual(E.replay(d,saved).state,E.replay(d,d.solution.slice(0,43)).state);
}
assert.equal(canonical.size,50);assert.equal(deals,250);assert.equal(completions,400);assert(runMoves>0);
const d=data.deals[0],s=E.start(d);
assert.throws(()=>E.step(s,{type:'move',from:0,index:0,to:1},d.ranks),/Illegal/,'Hidden cards cannot move');
assert.throws(()=>E.step(s,{type:'move',from:0,index:5,to:0},d.ranks),/Illegal/);
assert.throws(()=>E.step(s,{type:'move',from:0,index:999,to:1},d.ranks),/Illegal/);
const empty=E.start(d);empty.columns[4]=[];assert(!E.canDeal(empty));assert.throws(()=>E.step(empty,{type:'deal'},d.ranks),/Cannot deal/);
const absent=E.start(d);absent.stock=[];assert.throws(()=>E.step(absent,{type:'deal'},d.ranks),/Cannot deal/);
const fake=structuredClone(d);fake.stock[0]=fake.tableau[0][0];assert.throws(()=>E.start(fake),/physical/);
const badrank=structuredClone(d);badrank.ranks[0]=0;assert.throws(()=>E.start(badrank),/rank/);
const top=s.columns[0].length-1;empty.columns[1]=[];assert(E.canMove(empty,{type:'move',from:0,index:top,to:1},d.ranks),'Any eligible card may enter an empty column');
// Solve-generated action must be checked against current state, never blindly applied.
let diverged=E.start(d),legal=E.legal(diverged,d.ranks),changed=false;
for(const a of legal)if(JSON.stringify(a)!==JSON.stringify(d.solution[0])){diverged=E.step(diverged,a,d.ranks);changed=true;break;}
assert(changed);assert.notEqual(E.key(diverged),E.key(E.start(d)));
console.log(`PASS: shared gameplay engine replayed ${count} actions across 50 deals, ${completions} completions, ${deals} stock rows, ${runMoves} multi-card moves; all-action undo, save/reload and illegal-action regressions passed.`);
