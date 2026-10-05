'use strict';
const fs=require('fs'), E=require('./engine'), levels=require('./levels');
function run(level,o){
 const s=E.create(level),log=[],metrics={maxEnemies:0}; let last=-1e5,mistake=false;
 const occupied=(r,c)=>s.plants.some(p=>p.row===r&&p.col===c);
 const place=(t,r,c)=>level.available.includes(t)&&E.activeCell(level,r,c)&&!occupied(r,c)&&(()=>{let out=E.plant(s,level,t,r,c);if(out.ok)log.push({t:s.t,type:t,row:r,col:c});return out.ok;})();
 if(o.fixedPods){for(let k=0;k<o.fixedPods;k++)for(const r of level.lanes)for(const c of [2,3,4,5,1,6,7,0])if(place('pod',r,c))break;}
 function action(){
  if(o.fixedPods||s.t<(o.delay||0)||s.t-last<(o.cadence||.45))return;
  const rows=[...level.lanes].sort((a,b)=>Math.min(20,...s.enemies.filter(e=>e.row===a).map(e=>e.x))-Math.min(20,...s.enemies.filter(e=>e.row===b).map(e=>e.x)));
  const done=()=>{last=s.t;};
  if(o.mistake&&!mistake&&s.t>25){for(const r of rows)for(const c of [5,6,7])if(place('glow',r,c)){E.shovel(s,level,r,c);mistake=true;done();return;}}
  if(o.emergency){for(const r of rows){let x=Math.min(20,...s.enemies.filter(e=>e.row===r).map(e=>e.x));if(x<2.3)for(let c=Math.min(7,Math.max(0,Math.floor(x)));c>=0;c--)if(place('burst',r,c)){done();return;}}if(s.enemies.some(e=>e.x<1)&&E.rain(s)){log.push({t:s.t,type:'rain'});done();return;}}
  for(const r of rows)if(!s.plants.some(p=>p.row===r&&p.type==='pod'))for(const c of [2,1,0,3,4,5,6,7])if(place('pod',r,c)){done();return;}
  if(o.solar!==false){const target=level.id<3?level.lanes.length+1:level.lanes.length*2;if(s.plants.filter(p=>p.type==='glow').length<target)for(const c of [0,1])for(const r of rows)if(place('glow',r,c)){done();return;}}
  if(o.podsOnly){for(const c of [3,4,5,6,7,1,0])for(const r of rows)if(place('pod',r,c)){done();return;}return;}
  const order=level.available.includes('ember')?['ember','frost','mortar','pod']:level.available.includes('mortar')?['mortar','frost','pod']:['pod','frost'];
  for(const type of order)for(const r of rows)if(!s.plants.some(p=>p.row===r&&p.type===type&&(type!=='pod'||p.col!==2)))for(const c of [3,4,5,1,6,7])if(place(type,r,c)){done();return;}
  for(const type of ['bark','clover'])if(level.available.includes(type))for(const r of rows)if(!s.plants.some(p=>p.row===r&&p.type===type))for(const c of type==='bark'?[6,7,5]:[4,5,6,1])if(place(type,r,c)){done();return;}
  for(const r of rows)for(const c of [4,5,6,7,1,0])if(place(level.available.includes('mortar')?'mortar':'pod',r,c)){done();return;}
 }
 if(o.prep)for(let i=0;i<35;i++){const n=log.length;last=-1e5;action();if(n===log.length)break;}
 E.sendWave(s,level);
 for(let i=0;i<18000&&s.status==='running';i++){action();E.step(s,level,.1);metrics.maxEnemies=Math.max(metrics.maxEnemies,s.enemies.length);}
 return {id:level.id,status:s.status,lives:s.lives,sweeps:s.usedSweeps,rain:s.usedRain,lostPlants:s.lostPlants,leaks:s.leaks,time:+s.t.toFixed(1),actions:log.length,spent:s.spent,endSun:s.sun,plants:s.plants.length,...metrics};
}
const modes={singlePod:{fixedPods:1},doublePod:{fixedPods:2},noSolar:{solar:false,prep:true,emergency:true},novice20s6s:{delay:20,cadence:6,emergency:true,mistake:true},novice20s6sNoRescue:{delay:20,cadence:6,emergency:false,mistake:true},podSpam:{podsOnly:true,prep:true,emergency:false},podSpamNoSolar:{podsOnly:true,solar:false,prep:true,emergency:false}};
const results={};
for(const [name,options] of Object.entries(modes)){const r=levels.map(l=>run(l,options));results[name]={options,summary:{wins:r.filter(x=>x.status==='won').length,perfect:r.filter(x=>x.status==='won'&&x.lives===5&&x.sweeps===0).length,losses:r.filter(x=>x.status==='lost').map(x=>x.id),sweeps:r.reduce((n,x)=>n+x.sweeps,0),leaks:r.reduce((n,x)=>n+x.leaks,0),lostPlants:r.reduce((n,x)=>n+x.lostPlants,0),lastChapter:r.filter(x=>x.id>=26)},levels:r};console.log(name,JSON.stringify(results[name].summary));}
fs.writeFileSync(__dirname+'/balance-audit.json',JSON.stringify(results,null,2));

const assert=require('node:assert/strict');assert.equal(results.singlePod.summary.wins,6,'Single-pod AFK fails 24 stages');for(const id of [5,10,15,20,25,30])assert.ok(results.singlePod.summary.losses.includes(id),'Every chapter finale needs more than one pod per lane');console.log('PASS: challenge floor retained in every chapter finale');
