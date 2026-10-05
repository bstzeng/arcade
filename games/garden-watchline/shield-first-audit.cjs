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
  if(o.mistake&&!mistake&&s.t>25){for(const r of rows)for(const c of [5,6,7])if(place('glow',r,c)){E.shovel(s,level,r,c);log.push({t:s.t,type:'shovel',row:r,col:c});mistake=true;done();return;}}
  if(o.emergency){for(const r of rows){let x=Math.min(20,...s.enemies.filter(e=>e.row===r).map(e=>e.x));if(x<2.3)for(let c=Math.min(7,Math.max(0,Math.floor(x)));c>=0;c--)if(place('burst',r,c)){done();return;}}if(s.enemies.some(e=>e.x<1)&&E.rain(s)){log.push({t:s.t,type:'rain'});done();return;}}
  for(const r of rows)if(!s.plants.some(p=>p.row===r&&p.type==='pod'))for(const c of [2,1,0,3,4,5,6,7])if(place('pod',r,c)){done();return;}
  if(o.solar!==false){const target=o.solarTarget|| (level.id<3?level.lanes.length+1:level.lanes.length*2);if(s.plants.filter(p=>p.type==='glow').length<target)for(const c of [0,1])for(const r of rows)if(place('glow',r,c)){done();return;}}
  if(o.defenseFirst){
   const order=level.available.includes('ember')?['bark','frost','ember','mortar','clover','pod']:level.available.includes('mortar')?['bark','mortar','frost','clover','pod']:['bark','frost','pod'];
   for(const type of order)for(const r of rows){if(!level.available.includes(type))continue;
    let cols=type==='bark'?[6,5,4]:type==='clover'?[5,4,3]:type==='frost'?[1,3,4,5]:type==='ember'?[3,4,1,5]:type==='mortar'?[4,3,1,5]:[3,4,1,5];
    if(!s.plants.some(p=>p.row===r&&p.type===type&&(type!=='pod'||p.col!==2)))for(const c of cols)if(place(type,r,c)){done();return;}
   }
   for(const r of rows)for(const c of [1,3,4,5])if(place(level.available.includes('mortar')?'mortar':'pod',r,c)){done();return;}
   return;
  }
  if(o.podsOnly){for(const c of [3,4,5,6,7,1,0])for(const r of rows)if(place('pod',r,c)){done();return;}return;}
  const order=level.available.includes('ember')?['ember','frost','mortar','pod']:level.available.includes('mortar')?['mortar','frost','pod']:['pod','frost'];
  for(const type of order)for(const r of rows)if(!s.plants.some(p=>p.row===r&&p.type===type&&(type!=='pod'||p.col!==2)))for(const c of [3,4,5,1,6,7])if(place(type,r,c)){done();return;}
  for(const type of ['bark','clover'])if(level.available.includes(type))for(const r of rows)if(!s.plants.some(p=>p.row===r&&p.type===type))for(const c of type==='bark'?[6,7,5]:[4,5,6,1])if(place(type,r,c)){done();return;}
  for(const r of rows)for(const c of [4,5,6,7,1,0])if(place(level.available.includes('mortar')?'mortar':'pod',r,c)){done();return;}
 }
 if(o.prep)for(let i=0;i<35;i++){const n=log.length;last=-1e5;action();if(n===log.length)break;}
 E.sendWave(s,level);log.push({t:0,type:'wave'});
 for(let i=0;i<18000&&s.status==='running';i++){action();E.step(s,level,.1);metrics.maxEnemies=Math.max(metrics.maxEnemies,s.enemies.length);}
 return {id:level.id,status:s.status,lives:s.lives,sweeps:s.usedSweeps,rain:s.usedRain,lostPlants:s.lostPlants,leaks:s.leaks,time:+s.t.toFixed(1),actions:log.length,spent:s.spent,endSun:s.sun,plants:s.plants.length,witness:log,...metrics};
}
const modes={shieldFirst:{defenseFirst:true,solarTarget:5,prep:true,emergency:true},shieldFirstRecovery:{defenseFirst:true,solarTarget:5,delay:8,cadence:1.5,emergency:true,mistake:true},shieldFirstSlow:{defenseFirst:true,solarTarget:5,delay:20,cadence:6,emergency:true,mistake:true}};
const results={};for(const [name,o]of Object.entries(modes)){const r=levels.map(l=>run(l,o));results[name]={wins:r.filter(x=>x.status==='won').length,perfect:r.filter(x=>x.status==='won'&&x.lives===5&&x.sweeps===0).length,losses:r.filter(x=>x.status==='lost').map(x=>x.id),late:r.filter(x=>x.id>=21),levels:r};console.log(name,JSON.stringify({wins:results[name].wins,perfect:results[name].perfect,losses:results[name].losses,late:results[name].late.map(l=>({id:l.id,time:l.time,actions:l.actions,lostPlants:l.lostPlants,sweeps:l.sweeps,lives:l.lives}))}));}fs.writeFileSync(__dirname+'/shield-first-audit.json',JSON.stringify(results,null,2));

const assert=require('assert');let replayed=0;
for(const [mode,result]of Object.entries(results))for(const row of result.levels){
 const level=levels.find(l=>l.id===row.id),s=E.create(level);
 for(const a of row.witness){while(s.t+1e-7<a.t)E.step(s,level,.1);let ok;
  if(a.type==='wave')ok=E.sendWave(s,level);else if(a.type==='shovel')ok=E.shovel(s,level,a.row,a.col);else if(a.type==='rain')ok=E.rain(s);else ok=E.plant(s,level,a.type,a.row,a.col).ok;
  assert(ok,mode+' L'+row.id+' illegal witness action at '+a.t);
 }
 for(let i=0;i<18000&&s.status==='running';i++)E.step(s,level,.1);
 assert.equal(s.status,row.status);assert.equal(s.lives,row.lives);assert.equal(s.usedSweeps,row.sweeps);assert.equal(s.spent,row.spent);assert.equal(+s.t.toFixed(1),row.time);replayed++;
}
const crypto=require('crypto');const hashes=Object.fromEntries(['engine.js','levels.js','shield-first-audit.cjs'].map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(__dirname+'/'+f)).digest('hex')]));
fs.writeFileSync(__dirname+'/shield-first-witness-verification.json',JSON.stringify({replayed,sourceHashes:hashes,summary:Object.fromEntries(Object.entries(results).map(([k,r])=>[k,{wins:r.wins,perfect:r.perfect,losses:r.losses}]))},null,2));console.log('All',replayed,'legal witnesses replayed exactly');

assert.equal(results.shieldFirst.wins,30);assert.equal(results.shieldFirstRecovery.wins,30);
