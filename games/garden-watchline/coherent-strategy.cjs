'use strict';
const fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict'),E=require('./engine.js'),L=require('./levels.js');
function run(l,mode='mortar'){
 const s=E.create(l),log=[];let last=-100;const delayed=mode.includes('slow'),delay=delayed?8:0,cadence=delayed?3:1.5;
 const occupied=(r,c)=>s.plants.some(p=>p.row===r&&p.col===c);
 const place=(t,r,c)=>{if(!l.available.includes(t)||occupied(r,c))return false;const q=E.plant(s,l,t,r,c);if(q.ok)log.push({t:+s.t.toFixed(2),action:t,row:r,col:c});return q.ok;};
 function policy(){
  if(s.t<delay||s.t-last<cadence)return;const rows=[...l.lanes].sort((a,b)=>Math.min(20,...s.enemies.filter(e=>e.row===a).map(e=>e.x))-Math.min(20,...s.enemies.filter(e=>e.row===b).map(e=>e.x)));let did=false;
  if(s.enemies.some(e=>e.x<2.5)&&E.rain(s)){log.push({t:s.t,action:'rain'});did=true;}
  if(!did)for(const r of rows){const nearest=Math.min(20,...s.enemies.filter(e=>e.row===r).map(e=>e.x));if(nearest<3.5&&place('burst',r,Math.max(0,Math.floor(nearest)))){did=true;break;}}
  if(!did)for(const r of rows)if(!s.plants.some(p=>p.row===r&&p.type==='pod')&&place('pod',r,1)){did=true;break;}
  if(!did)for(const r of rows)if(!s.plants.some(p=>p.row===r&&p.type==='glow')&&place('glow',r,0)){did=true;break;}
  if(!did){barriers:for(const r of rows)if(!s.plants.some(p=>p.row===r&&p.type==='bark'))for(const c of [6,5,7])if(place('bark',r,c)){did=true;break barriers;}}
  if(!did)for(const r of rows){const type=mode.includes('ember')&&l.available.includes('ember')?'ember':l.available.includes('mortar')?'mortar':'pod';if(place(type,r,2)){did=true;break;}}
  if(!did){healers:for(const r of rows)if(!s.plants.some(p=>p.row===r&&p.type==='clover'))for(const c of [5,4,7])if(place('clover',r,c)){did=true;break healers;}}
  if(!did)for(const r of rows)if(place(l.available.includes('frost')?'frost':'pod',r,3)){did=true;break;}
  if(!did)for(const r of rows)if(place(l.available.includes('ember')?'ember':'pod',r,4)){did=true;break;}
  if(!did){extras:for(const r of rows)for(const c of [5,6,7])if(place(l.available.includes('mortar')?'mortar':'pod',r,c)){did=true;break extras;}}
  if(did)last=s.t;
 }
 if(!delayed)for(let i=0;i<30;i++){last=-100;const n=log.length;policy();if(n===log.length)break;}
 E.sendWave(s,l);for(let i=0;i<18000&&s.status==='running';i++){policy();E.step(s,l,.1);}return {id:l.id,status:s.status,lives:s.lives,sweeps:s.usedSweeps,rain:s.usedRain,lostPlants:s.lostPlants,time:+s.t.toFixed(1),actions:log.length};
}
const results={};for(const mode of ['mortar','ember','mortar-slow']){results[mode]=L.map(l=>run(l,mode));console.log(mode,JSON.stringify(results[mode]));}for(const mode of Object.keys(results))assert.equal(results[mode].filter(x=>x.status==='won').length,30,mode+' clears all 30');fs.writeFileSync(__dirname+'/coherent-report.json',JSON.stringify({sourceHashes:Object.fromEntries(['engine.js','levels.js','coherent-strategy.cjs'].map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(__dirname+'/'+f)).digest('hex')])),scope:'Independent legal shield-and-healer-first policies. Mortar/ember main damage variants, plus eight-second delayed three-second action-cadence mortar variant. No state edits.',results},null,2));
