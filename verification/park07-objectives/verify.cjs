'use strict';
// Usage: node verification/park07-objectives/verify.cjs CURRENT_ROOT BASELINE_ROOT
// BASELINE_ROOT is the exact pre-revision game source, supplied by the caller.
// Both roots contain games/skyrail-park/engine.js. No browser, native modules,
// private saves, generated reports or timing/duration acceptance are used.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
if(process.argv.length!==4){console.error('Usage: node verify.cjs CURRENT_ROOT BASELINE_ROOT');process.exit(2);}
const root=path.resolve(process.argv[2]),baseline=path.resolve(process.argv[3]);
assert.notEqual(root,baseline,'Use distinct current and pre-revision source roots');
const E=require(path.join(root,'games/skyrail-park/engine.js')),B=require(path.join(baseline,'games/skyrail-park/engine.js'));
const tapes=JSON.parse(fs.readFileSync(path.join(__dirname,'action-tapes.json'),'utf8')),clone=v=>JSON.parse(JSON.stringify(v));
let checks=0,comparisons=0,legacyActions=0,legacyTicks=0,old07Won,old07Active;
function check(name,fn){fn();checks++;console.log('PASS '+name);}
function must(engine,s,a){const result=engine.applyAction(s,a);assert(result.ok,JSON.stringify({tick:s.tick,action:a,result}));return result;}
function same(a,b){assert.equal(E.serialize(b),B.serialize(a));comparisons++;}
check('Exactly ten IDs; only fresh 07 receives revision 2; other scenario definitions/maps/deadlines and catalog stay unchanged',()=>{
 const ids=Array.from({length:10},(_,i)=>String(i+1).padStart(2,'0'));
 assert.deepEqual(E.Levels.map(l=>l.id),ids);assert.deepEqual(Object.keys(tapes.legacy).sort(),ids);for(const id of ids)assert(Array.isArray(tapes.legacy[id]));
 assert.deepEqual(E.Levels,JSON.parse(fs.readFileSync(path.join(root,'games/skyrail-park/levels.json'),'utf8')));
 assert.deepEqual(E.Levels.legacy07,B.Levels.find(l=>l.id==='07'));
 for(const old of B.Levels){const current=E.Levels.find(l=>l.id===old.id);assert.deepEqual(current.initial,old.initial);assert.deepEqual(current.objective,old.objective);if(old.id!=='07')assert.deepEqual(current,old);const fresh=E.createScenario(old.id);E.validate(fresh);assert.equal(fresh.missionRevision,old.id==='07'?2:undefined);}
 assert.deepEqual(E.RIDES,B.RIDES);assert.deepEqual(E.BUILD,B.BUILD);assert.equal(E.KEY,B.KEY);
 for(const f of ['storage.js','spatial.js','catalog.json'])assert(fs.readFileSync(path.join(root,'games/skyrail-park',f)).equals(fs.readFileSync(path.join(baseline,'games/skyrail-park',f))));
});
check('Unknown/malformed explicit revisions are rejected without silently switching old goals',()=>{
 for(const revision of [null,0,1,3,'2',false,{}]){const s=E.createScenario('07');s.missionRevision=revision;assert.throws(()=>E.deserialize(JSON.stringify(s)),/情境內容版本/);}
 const wrong=E.createScenario('01');wrong.missionRevision=2;assert.throws(()=>E.validate(wrong),/情境內容版本/);
 const old=B.createScenario('07'),raw=B.serialize(old);assert.equal(E.serialize(E.deserialize(raw)),raw);assert(!Object.hasOwn(E.deserialize(raw),'missionRevision'));
});
for(const level of B.Levels)check('Legacy '+level.id+' legal tape, old-save load, and freeplay continuation remain exact',()=>{
 const a=B.createScenario(level.id),b=E.deserialize(B.serialize(a)),actions=tapes.legacy[level.id];let i=0;
 while(!a.result){assert(a.tick<=a.objective.deadline,'Legacy replay exceeded deadline');
  while(i<actions.length&&actions[i].tick===a.tick){const {tick,...action}=actions[i++];const first=must(B,a,action),second=must(E,b,action);assert.deepEqual(second,first);B.checkOutcome(a);E.checkOutcome(b);}
  if(!a.result){B.step(a);E.step(b);}if(a.tick%100===0||a.result)same(a,b);
  if(level.id==='07'&&!old07Active&&a.commission.index===1)old07Active=clone(a);
 }
 assert.equal(a.result.outcome,'won');assert.equal(b.result.outcome,'won');assert.equal(i,actions.length);same(a,b);legacyActions+=i;legacyTicks+=a.tick;
 if(level.id==='07')old07Won=clone(a);
 must(B,a,{type:'continuePark'});must(E,b,{type:'continuePark'});must(B,a,{type:'resume'});must(E,b,{type:'resume'});
 B.step(a,120);E.step(b,120);same(a,b);assert(b.sandbox);assert.equal(b.result.outcome,'won');
});
check('Old 07 active/won roundtrip keeps legacy requirements, while an explicit fresh start uses revised requirements',()=>{
 for(const s of [old07Active,old07Won]){assert(s);const raw=B.serialize(s),loaded=E.deserialize(raw);assert.equal(E.serialize(loaded),raw);assert.deepEqual(E.currentLevel(loaded),B.Levels.find(l=>l.id==='07'));assert.deepEqual(E.commissionGoals(loaded),B.commissionGoals(s));}
 const old=clone(old07Won);old.missionRevision=2;assert.equal(E.metrics(old).servicedSites,2);assert(!E.commissionGoals(old).every(g=>g.passed));old.commission.index=1;assert.equal(E.metrics(old).servicedSites,0,'Original carousel must not fulfill northern-wheel service');assert.equal(E.createScenario('07').missionRevision,2);
});
let won;
check('Fresh revised 07 wins via accepted paid public actions without state or resource injection',()=>{
 const s=E.createScenario('07'),actions=tapes.revised07;let i=0;
 while(!s.result){assert(s.tick<=s.objective.deadline,'Revised replay exceeded deadline');while(i<actions.length&&actions[i].tick===s.tick){const {tick,...action}=actions[i++];must(E,s,action);E.checkOutcome(s);}if(!s.result)E.step(s);}
 assert.equal(s.result.outcome,'won');assert.equal(i,actions.length);assert.equal(s.missionRevision,2);assert.equal(E.metrics(s).servicedSites,3);assert.equal(E.metrics(s).commissionedCoasters,1);E.validate(s);assert.equal(E.serialize(E.deserialize(E.serialize(s))),E.serialize(s));won=s;
});
check('Three service-site rectangles are disjoint and each own required service is causal',()=>{
 const specs=E.currentCommission(won).siteSpecs;assert.equal(specs.length,3);
 for(let i=0;i<specs.length;i++)for(let j=i+1;j<specs.length;j++){const a=specs[i].rect,b=specs[j].rect;assert(a[0]+a[2]<=b[0]||b[0]+b[2]<=a[0]||a[1]+a[3]<=b[1]||b[1]+b[3]<=a[1]);}
 const inside=(o,r)=>o.x>=r[0]&&o.x<r[0]+r[2]&&o.y>=r[1]&&o.y<r[1]+r[3];
 // Mutations below are isolated negative-predicate fixtures, never winning replays.
 for(const spec of specs)for(const type of ['food','drink','toilet'])for(const fault of ['missing','empty','unused','disconnected']){
  const s=clone(won),o=s.shops.find(o=>o.type===type&&inside(o,spec.rect));assert(o);
  if(fault==='missing')s.shops=s.shops.filter(v=>v.id!==o.id);if(fault==='empty')o.stock=0;if(fault==='unused')o.sold=0;if(fault==='disconnected'){E.cell(s,o.x,o.y+1).path=null;s.topology++;}
  assert.equal(E.metrics(s).servicedSites,2,spec.rideTypes+':'+type+':'+fault);
 }
});
check('Northern phase requires a real ready used wheel and its own local food/drink/toilet',()=>{
 const s=clone(won);s.commission.index=1;assert.equal(E.metrics(s).servicedSites,1);const spec=E.currentCommission(s).siteSpecs[0];assert.deepEqual(spec.rideTypes,['wheel']);
 for(const fault of ['wrongType','closed','broken','unused','disconnected']){const q=clone(s),r=q.rides.find(r=>r.type==='wheel');assert(r);if(fault==='wrongType')r.type='carousel';if(fault==='closed')r.open=false;if(fault==='broken')r.broken=true;if(fault==='unused')r.served=0;if(fault==='disconnected'){E.cell(q,...r.entrance).path=null;q.topology++;}assert.equal(E.metrics(q).servicedSites,0,fault);}
 const absent=clone(s);absent.shops=absent.shops.filter(o=>o.y!==8);assert.equal(E.metrics(absent).servicedSites,0,'South market shops cannot substitute for north supplies');
});
check('Canopy needs two unique actual used/stocked/public-connected food/drink stalls at legal current clearance',()=>{
 const spec=E.currentCommission(won).coasterSpec,r=won.rides.find(r=>r.type==='coaster');assert.equal(spec.stallOverpass.minStalls,2);assert.equal(spec.stallOverpass.minClearance,2);assert.equal(E.coveredServiceStalls(won,r,spec.stallOverpass),2);assert(E.commissionedCoaster(won,r,spec));
 for(const fault of ['missing','empty','unused','disconnected','lowTrack','raisedGround','outside','toilet','repeat']){
  const s=clone(won),coaster=s.rides.find(r=>r.type==='coaster'),o=s.shops.find(o=>o.x===14&&o.y===19);assert(o);
  if(fault==='missing'||fault==='repeat')s.shops=s.shops.filter(v=>v.id!==o.id);if(fault==='empty')o.stock=0;if(fault==='unused')o.sold=0;if(fault==='disconnected'){E.cell(s,o.x,o.y+1).path=null;s.topology++;}
  if(fault==='lowTrack')coaster.track.filter(t=>t.to.x===o.x&&t.to.y===o.y).forEach(t=>t.to.z=1);if(fault==='raisedGround')E.cell(s,o.x,o.y).height++;
  if(fault==='outside')o.x=12;if(fault==='toilet')o.type='toilet';if(fault==='repeat')coaster.track.push(clone(coaster.track.find(t=>t.to.x===16&&t.to.y===19)));
  assert.equal(E.coveredServiceStalls(s,coaster,spec.stallOverpass),1,fault);assert(!E.commissionedCoaster(s,coaster,spec),fault);
 }
 const noNewRiders=clone(r);noNewRiders.testedRidersAt=noNewRiders.served;assert(!E.commissionedCoaster(won,noNewRiders,spec));
});
check('Public construction rejects a one-layer shop crossing without charging, and accepts two layers',()=>{
 const s=E.createScenario('07');must(E,s,{type:'build',kind:'coaster',x:5,y:12});const id=s.rides[0].id;must(E,s,{type:'build',kind:'food',x:7,y:12});must(E,s,{type:'track',id,piece:'lift'});
 const before=E.serialize(s),result=E.applyAction(s,{type:'track',id,piece:'straight'});assert(!result.ok);assert(result.message.includes('兩層淨空'));assert.equal(E.serialize(s),before);must(E,s,{type:'track',id,piece:'lift'});assert.equal(s.rides[0].track.at(-1).to.z,2);E.validate(s);
});
check('Profile awards and storage keys remain compatible and idempotent',()=>{
 const S=require(path.join(root,'games/skyrail-park/storage.js')),data=new Map(),storage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)},store=S.createStore(storage,'regression');
 assert(store.markComplete('07'));assert(store.markComplete('07'));assert.deepEqual(store.readProfile().completed,['07']);assert(Object.values(S.KEYS).every(k=>k.startsWith(E.KEY+'.')));assert(store.save(old07Won).ok);const loaded=S.createStore(storage,'reload').load();assert(loaded.ok);assert.equal(E.serialize(loaded.state),B.serialize(old07Won));
});
console.log(JSON.stringify({status:'passed',checks,legacyActions,legacyTicks,byteIdenticalComparisons:comparisons,legacyContinuationTicksPerMission:120,revised07:{actions:tapes.revised07.length,tick:won.tick},browser:'not run',humanDuration:'not measured'}));
