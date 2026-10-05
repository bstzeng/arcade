'use strict';
// Replays emitted input witnesses without importing the policy that created them.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const E=require('./engine.js'),levels=require('./levels.js'),certs=require('./solutions.json');
let inputs=0,saves=0;const results=[];
for(const row of certs.levels)for(const mode of ['strong','recovery']){
 const level=levels.find(l=>l.id===row.id);let state=E.create(level),index=0,lastTime=-1;const actions=row[mode];
 for(const a of actions){assert.ok(a.t>=lastTime,'Input chronology');lastTime=a.t;}
 for(let i=0;i<18001;i++){
  while(index<actions.length&&actions[index].t<=state.t+1e-7){const a=actions[index++];assert.ok(Math.abs(a.t-state.t)<.051,'Input timing matches witness');let ok=false;
   if(a.action==='plant'){const def=E.PLANTS[a.type];assert.ok(def&&state.sun>=def.cost,'Plant cost available');assert.ok(E.activeCell(level,a.row,a.col),'Cell belongs to level');assert.ok(!state.plants.some(p=>p.row===a.row&&p.col===a.col),'No overlapping plants');const before=state.sun;ok=E.plant(state,level,a.type,a.row,a.col).ok;assert.ok(state.sun>=before-def.cost,'No excess charge');}
   else if(a.action==='shovel')ok=E.shovel(state,level,a.row,a.col);
   else if(a.action==='rain')ok=E.rain(state);
   else if(a.action==='wave')ok=E.sendWave(state,level);
   assert.ok(ok,`Illegal ${a.action} in ${row.id} ${mode} at ${a.t}`);inputs++;
  }
  if(state.status==='won'||state.status==='lost')break;
  E.step(state,level,.1);
  if(i%170===0){const restored=E.restore(E.serialize(state),levels);assert.ok(restored,'Every sampled session is restorable');state=restored;saves++;}
 }
 assert.equal(state.status,'won',`Level ${row.id} ${mode} wins`);assert.equal(index,actions.length,'All inputs consumed');results.push({id:row.id,mode,lives:state.lives,time:+state.t.toFixed(1),inputs:actions.length});
}
const report={scope:'Independent witness-input replay; uses the same published deterministic engine, no policy function, no direct state mutation, periodic save/restore during all 60 runs.',passed:true,inputs,saves,runs:results};fs.writeFileSync(path.join(__dirname,'replay-report.json'),JSON.stringify(report,null,2)+'\n');console.log(`PASS: ${results.length} witness runs, ${inputs} legal inputs, ${saves} save/restore checkpoints`);
