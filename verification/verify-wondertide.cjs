'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),root=path.join(__dirname,'../games/wondertide-aquarium'),E=require(root+'/engine.js'),L=require(root+'/levels.js'),Legacy=require(root+'/legacy-levels.js'),S=require(root+'/storage.js');
const reports=[];
function invariant(s){assert.equal(s.cash+s.spent,s.level.initial.cash+s.earned,'currency conservation');assert.ok(s.cash>=0);assert.ok(s.rescueCharges>=0&&s.rescueCharges<=3);assert.ok(s.fish.length<=s.level.initial.capacity);assert.ok(s.food.length<=18);assert.ok(s.fish.every(f=>Number.isFinite(f.hunger)&&Number.isFinite(f.health)));E.serialize(s);}
function run(level,variant='attentive'){let s=E.createScenario(level,{runID:variant+'-'+level.id}),actions=0,pointActions=0,cycles=0,missed=0,minCash=s.cash,rescues=0;const count=a=>{const ok=E.applyAction(s,a);if(ok){actions++;if(a.type==='point')pointActions++;}return ok;};count({type:'start'});
 const desiredBorn=Math.max(...level.objective.phases.map(p=>p.born||0));
 if(variant==='damaged-economy'){for(let i=0;i<16;i++)count({type:'point',x:500,y:530}); // smart empty taps cannot spend
 count({type:'mode',mode:'live'});for(let i=0;i<18;i++)count({type:'point',x:60,y:520});count({type:'mode',mode:'smart'});
 while(s.cash>=(s.foodLevel===1?45:80)&&s.foodLevel<3)count({type:'upgrade'});}
 const dt=variant==='slow-and-breaks'?.8:.5;
 while(s.status==='running'&&s.time<900){
  let skip=variant==='slow-and-breaks'&&(s.time%55>40&&s.time%55<50);if(skip)missed++;
  if(!skip&&variant!=='inactive'){
   const hungry=s.fish.filter(f=>f.refuge<=0).sort((a,b)=>a.hunger-b.hunger||a.meals-b.meals)[0];
   const injury=s.fish.some(f=>f.health<24||f.hunger<7);
   if(s.rescueCharges>0&&(injury||s.cash<3&&s.food.length<2)){count({type:'rescue'});rescues++;}
   else if(s.invaders.length&&s.bubbleCooldown<=0)count({type:'bubble'});
   else if(desiredBorn>s.metrics.born&&!s.breeding)count({type:'breed'});
   else if(desiredBorn<=s.metrics.born&&s.breeding)count({type:'breed'});
   else if(hungry&&hungry.hunger<(s.invaders.length?43:82)&&!s.food.some(f=>f.type===E.SPECIES[hungry.species].diet&&Math.hypot(f.x-hungry.x,f.y-hungry.y)<80)){
    const mode=E.SPECIES[hungry.species].diet;count({type:'mode',mode});count({type:'point',x:hungry.x+4,y:hungry.y-4,tolerance:22});count({type:'mode',mode:'smart'});
   }
   else if(s.invaders.length){const e=s.invaders.find(e=>e.kind!=='armor'||E.weakPoint(s,e).open);if(e){const p=e.kind==='armor'?E.weakPoint(s,e):e;count({type:'point',x:p.x+((cycles%3)-1)*5,y:p.y+((cycles%2)-.5)*6,tolerance:22});}}
   else if(E.phaseReady(s)&&s.cash>=s.level.objective.phases[s.phase].cost+6)count({type:'build'});
   else if(s.coins.length){const c=s.coins[0];count({type:'point',x:c.x,y:c.y,tolerance:22});}
   else if(s.fish.length<level.objective.minFish&&s.metrics.born>=desiredBorn&&s.cash>45)count({type:'buy',species:level.initial.fish[0].species});
  }
  E.step(s,dt);cycles++;if(cycles%50===0){invariant(s);const snap=E.deserialize(E.serialize(s));assert.deepEqual(snap,s);}
  minCash=Math.min(minCash,s.cash);
 }
 invariant(s);return {id:level.id,variant,status:s.status,seconds:Math.round(s.time),actions,pointActions,pointsPerMinute:+(pointActions/s.time*60).toFixed(1),phase:s.phase,cash:s.cash,minCash,fish:s.fish.length,meals:s.metrics.meals,kills:s.metrics.kills,born:s.metrics.born,deaths:s.metrics.deaths,refuge:s.metrics.rescued||0,rescues,missed};}
assert.equal(L.length,30);assert.equal(new Set(L.map(l=>l.id)).size,30);assert.deepEqual([...new Set(L.map(l=>l.chapter))],[1,2,3,4,5]);assert.equal(new Set(L.map(l=>l.title)).size,30);assert.equal(new Set(L.map(l=>JSON.stringify([l.initial.fish,l.initial.currents,l.initial.waves,l.objective]))).size,30);
for(const variant of ['attentive','slow-and-breaks','damaged-economy','inactive'])for(const l of L){const r=run(l,variant);reports.push(r);console.log(JSON.stringify(r));}
function memory(){const m=new Map();return{getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k),m};}
let mem=memory(),a=S.createStore(mem,E,L,'a'),bundle=a.fresh();bundle.run=E.createScenario(L[0]);E.applyAction(bundle.run,{type:'start'});E.applyAction(bundle.run,{type:'point',x:220,y:185});E.step(bundle.run,1);assert.equal(a.save(bundle).kind,'saved');let b=S.createStore(mem,E,L,'b'),restored=b.load().data;assert.equal(restored.run.paused,true);assert.equal(restored.run.cash,bundle.run.cash);assert.equal(restored.run.time,bundle.run.time);E.applyAction(restored.run,{type:'resume'});assert.equal(b.save(restored).kind,'saved');assert.equal(a.save(bundle).kind,'conflict');a.continueVolatile();assert.equal(a.save(bundle).kind,'volatile');
for(const l of Legacy){const old=require('./wondertide-legacy-fixtures.json').find(x=>x.id===l.id);const legacy={schema:1,revision:2,owner:'prior',profile:{schema:1,completed:{'01':1,'25':2,'50':3},runs:['old']},options:{schema:1,reducedMotion:false},run:old};mem=memory();mem.setItem(S.KEY,JSON.stringify(legacy));const store=S.createStore(mem,E,L,'new'),r=store.load();assert.equal(r.kind,'loaded');assert.deepEqual(r.data.profile.completed,{});assert.deepEqual(r.data.profile.legacyCompleted,legacy.profile.completed);assert.equal(r.data.run.time,old.time);assert.equal(r.data.run.cash,old.cash);assert.equal(r.data.run.legacy,true);assert.equal(r.data.run.paused,true);assert.equal(store.save(r.data).kind,'saved');}
const denied={getItem(){return null;},setItem(){throw Error('QuotaExceededError');},removeItem(){throw Error('denied');}};let store=S.createStore(denied,E,L,'q'),fresh=store.fresh();fresh.run=E.createScenario(L[0]);assert.equal(store.save(fresh).kind,'volatile');assert.equal(store.save(fresh).kind,'volatile');assert.equal(store.reset(),false);
assert.throws(()=>store.parse('{no'));assert.throws(()=>store.parse(JSON.stringify({...fresh,run:{}})));
let smart=E.createScenario(L[0]);E.applyAction(smart,{type:'start'});let before=smart.cash;assert.equal(E.applyAction(smart,{type:'point',x:970,y:75}),false);assert.equal(smart.cash,before);for(let i=0;i<4;i++)E.applyAction(smart,{type:'rescue'});assert.equal(smart.cash,before+60);assert.equal(smart.rescueCharges,0);const still=smart.cash;assert.equal(E.applyAction(smart,{type:'rescue'}),false);assert.equal(smart.cash,still);
// An explicitly confirmed valid import can repair corrupt saved bytes atomically.
const corrupt=memory();corrupt.setItem(S.KEY,'{corrupt bytes');const repair=S.createStore(corrupt,E,L,'repair');assert.equal(repair.load().kind,'invalid');const safe=repair.fresh();safe.run=E.createScenario(L[0]);assert.throws(()=>repair.import('{bad backup'));assert.equal(corrupt.getItem(S.KEY),'{corrupt bytes');assert.equal(repair.import(JSON.stringify(safe)).result.kind,'saved');assert.equal(repair.load().kind,'loaded');
// Regression: naturally expiring refuge must stay serializable at every tick.
let idle=E.createScenario(L[2]);E.applyAction(idle,{type:'start'});while(idle.status==='running'&&idle.time<220){E.step(idle,E.STEP);E.serialize(idle);assert.ok(idle.fish.every(f=>f.refuge>=0));}
// Purchasing cannot occupy slots still needed by the real birth objective.
for(const l of L.filter(l=>l.objective.phases.some(p=>p.born))){let n=E.createScenario(l);E.applyAction(n,{type:'start'});while(E.applyAction(n,{type:'buy',species:'ember'})){}assert.ok(n.fish.length<=l.initial.capacity-E.nurserySlots(n));}
// Corrupt imports must be rejected before a store write, including fractional counters.
const valid=JSON.parse(JSON.stringify(bundle));for(const [key,value] of [['phase',.5],['foodLevel',1.5],['wave',.5],['cash',-.5],['rescueCharges',.5]]){const broken=JSON.parse(JSON.stringify(valid));broken.run[key]=value;assert.throws(()=>a.parse(JSON.stringify(broken)),key);}
for(const field of ['food','coins']){const broken=JSON.parse(JSON.stringify(valid));const id=broken.run.nextID++;broken.run[field]=[field==='food'?{id,x:100,y:100,type:'pellet',age:0,value:-1,cost:2}:{id,x:100,y:100,age:0,value:-2}];assert.throws(()=>a.parse(JSON.stringify(broken)),field);}
const failed=reports.filter(r=>r.variant!=='inactive'&&r.status!=='won'),idleFailed=reports.filter(r=>r.variant==='inactive'&&r.status!=='lost');const result={testType:'Released-engine legal-action simulation; not human playtesting or browser evidence',summary:{levels:30,runs:120,completed:reports.filter(r=>r.status==='won').length,failed:failed.length,inactiveStillAlive:idleFailed.length,saveLoad:true,legacyMigration:true,multiTabConflict:true,quotaFailure:true,smartEmptyNoSpend:true,rescueCashBounded:true,refugeExpiryEveryTick:true,malformedImportRejected:true,nurseryPurchaseReservation:true,validImportRepairsCorruptStorage:true},runs:reports};fs.writeFileSync(path.join(__dirname,'wondertide-report.json'),JSON.stringify(result,null,2)+'\n');if(failed.length||idleFailed.length){console.error('FAILED',failed,idleFailed);process.exitCode=1;}
