/* Bloomward: original deterministic lane-defense simulation. No external dependencies. */
(function (root, factory) { const api = factory(); if (typeof module === 'object' && module.exports) module.exports = api; else root.Bloomward = api; })(typeof globalThis !== 'undefined' ? globalThis : this, function () {
'use strict';
const VERSION = 1, ROWS = 5, COLS = 8;
const PLANTS = Object.freeze({
 glow:{name:'暖燈花',short:'產光',cost:50,hp:180,interval:8,income:25,color:'#ffd06f',role:'每 8 秒產 25 光；後排是好位置。'},
 pod:{name:'芽葉弩',short:'單體',cost:90,hp:240,interval:1.15,damage:20,color:'#96d985',role:'穩定向前射擊；每條路都需要火力。'},
 frost:{name:'霜鈴蘭',short:'緩速',cost:125,hp:220,interval:1.6,damage:12,color:'#9ee5ee',role:'命中使敵人減速 45%，持續 4 秒。'},
 bark:{name:'藤編牆',short:'阻擋',cost:75,hp:900,interval:0,reflect:8,color:'#dcac72',role:'厚實護盾；每秒反擊啃咬它的敵人。'},
 mortar:{name:'莓果炮',short:'範圍',cost:150,hp:230,interval:3,damage:45,color:'#ee98ac',role:'拋射無視護甲，炸開相鄰敵人。'},
 ember:{name:'赤葉扇',short:'穿甲',cost:160,hp:240,interval:1.4,damage:18,color:'#ffa571',role:'葉刃穿透整條路，無視硬殼護甲。'},
 clover:{name:'露滴草',short:'修復',cost:100,hp:260,interval:2,heal:18,color:'#b0dba3',role:'修復周圍一格的所有植物，包含自己。'},
 burst:{name:'星火蕾',short:'急救',cost:95,hp:1,interval:18,damage:170,color:'#ffd992',role:'立刻引爆周圍 1.6 格，無視護甲；冷卻 18 秒。'}
});
const ENEMIES = Object.freeze({
 drifter:{name:'苔影',hp:140,speed:.18,bite:25,armor:0,color:'#897cb1',counter:'芽葉弩'},
 runner:{name:'疾腳影',hp:120,speed:.34,bite:21,armor:0,color:'#d59a91',counter:'霜鈴蘭／藤編牆'},
 shell:{name:'石帽影',hp:450,speed:.14,bite:27,armor:8,color:'#8698ab',counter:'莓果炮／赤葉扇'},
 swarm:{name:'小團影',hp:60,speed:.24,bite:12,armor:0,color:'#d6b684',counter:'莓果炮'},
 brute:{name:'巨根影',hp:1200,speed:.11,bite:42,armor:4,color:'#ab8caa',counter:'緩速＋雙層火力'},
 hopper:{name:'跳葉影',hp:180,speed:.22,bite:26,armor:0,color:'#a0ac92',counter:'雙層防線／霜鈴蘭'},
 lantern:{name:'提燈影',hp:200,speed:.16,bite:18,armor:0,color:'#d2b185',counter:'莓果炮／星火蕾'}
});
const clone = x => JSON.parse(JSON.stringify(x));
const finite = x => typeof x==='number' && Number.isFinite(x);
function create(level) {
 return {version:VERSION,levelId:level.id,t:0,status:'ready',sun:level.startSun,lives:level.lives||5,waveIndex:-1,waveAt:0,spawnIndex:0,nextAt:null,incomeAt:7,rainReadyAt:0,rainCharges:3,sweeps:Array(ROWS).fill(true),plants:[],enemies:[],shots:[],fx:[],cooldowns:{},nextId:1,kills:0,spent:0,earned:0,planted:0,lostPlants:0,usedSweeps:0,usedRain:0,leaks:0,events:[],completeAt:null};
}
function event(s,type,data) { s.events.push(Object.assign({type,t:s.t},data||{})); if(s.events.length>32)s.events.shift(); }
function effect(s,type,x,row,extra){ s.fx.push(Object.assign({type,x,row,age:0,life:.65},extra||{})); }
function activeCell(l,r,c) {return Number.isInteger(r)&&Number.isInteger(c)&&r>=0&&r<ROWS&&c>=0&&c<COLS&&l.lanes.includes(r)&&!(l.blocked||[]).some(p=>p[0]===r&&p[1]===c);}
function fertile(l,r,c) {return (l.fertile||[]).some(p=>p[0]===r&&p[1]===c)?1.2:1;}
function canPlant(s,l,type,row,col) {
 if(!PLANTS[type]||!l.available.includes(type))return '這株植物尚未開放';
 if(s.status==='won'||s.status==='lost')return '這場守園已經結束';
 if(!activeCell(l,row,col))return '這格無法種植';
 if(s.plants.some(p=>p.row===row&&p.col===col))return '已經有植物；使用移植鏟可退回 80%';
 if((s.cooldowns[type]||0)>s.t)return '星火蕾正在休息';
 if(s.sun<PLANTS[type].cost)return '光能不足，暖燈花會持續補充';
 return null;
}
function damage(s,e,amount,pierce) {e.hp-=Math.max(pierce?0:1,amount-(pierce?0:ENEMIES[e.type].armor)); e.flash=.13;}
function plant(s,l,type,row,col) {
 const err=canPlant(s,l,type,row,col); if(err)return {ok:false,reason:err};
 const def=PLANTS[type];s.sun-=def.cost;s.spent+=def.cost;s.planted++;effect(s,'plant',col+.5,row);
 if(type==='burst') {s.cooldowns.burst=s.t+18;for(const e of s.enemies)if(Math.hypot(e.x-col-.5,(e.row-row)*1.05)<=1.6)damage(s,e,170*fertile(l,row,col),true);effect(s,'burst',col+.5,row,{life:.8});rewardKills(s);event(s,'burst');}
 else s.plants.push({id:s.nextId++,type,row,col,hp:def.hp,maxHp:def.hp,next:s.t+(type==='glow'?5:.35),born:s.t,flash:0});
 event(s,'plant',{plant:type,row,col});return {ok:true};
}
function shovel(s,l,row,col) {
 if(s.status==='won'||s.status==='lost')return false;
 const i=s.plants.findIndex(p=>p.row===row&&p.col===col);if(i<0)return false;
 const p=s.plants[i],refund=Math.floor(PLANTS[p.type].cost*.8);s.sun+=refund;s.plants.splice(i,1);effect(s,'refund',col+.5,row,{text:'+'+refund});event(s,'shovel',{refund});return true;
}
function sendWave(s,l) {
 if(s.status==='won'||s.status==='lost'||s.waveIndex>=l.waves.length-1)return false;
 if(s.waveIndex>=0&&s.t-s.waveAt<8)return false;
 // Do not discard a previous wave's pending spawns when calling the next one early.
 if(s.waveIndex>=0&&s.spawnIndex<l.waves[s.waveIndex].spawns.length)return false;
 s.waveIndex++;s.waveAt=s.t;s.spawnIndex=0;s.nextAt=null;s.status='running';
 const bonus=l.waves[s.waveIndex].bonus||55;s.sun+=bonus;s.earned+=bonus;event(s,'wave',{wave:s.waveIndex+1});return true;
}
function rain(s) {
 if(s.status!=='running'||s.rainCharges<=0||s.t<s.rainReadyAt)return false;
 s.rainCharges--;s.rainReadyAt=s.t+32;s.usedRain++;
 for(const e of s.enemies){damage(s,e,65,true);e.slowUntil=Math.max(e.slowUntil,s.t+8);e.stunUntil=s.t+1.4;}
 for(const p of s.plants)p.hp=Math.min(p.maxHp,p.hp+110);
 effect(s,'rain',4,2,{life:1.6});rewardKills(s);event(s,'rain');return true;
}
function target(s,p) { return s.enemies.filter(e=>e.row===p.row&&e.x>=p.col+.15&&e.hp>0).sort((a,b)=>a.x-b.x)[0];}
function rewardKills(s) {
 const dead=s.enemies.filter(e=>e.hp<=0);for(const e of dead){s.kills++;s.sun+=e.type==='brute'?18:7;s.earned+=e.type==='brute'?18:7;effect(s,'pop',e.x,e.row,{color:ENEMIES[e.type].color});}
 s.enemies=s.enemies.filter(e=>e.hp>0);
}
function tick(s,l,dt) {
 if(s.status!=='running')return;
 s.t+=dt;
 for(const f of s.fx)f.age+=dt;s.fx=s.fx.filter(f=>f.age<f.life);
 if(s.t>=s.incomeAt){s.sun+=25;s.earned+=25;s.incomeAt+=7;event(s,'income',{amount:25});effect(s,'sun',.15,-.55,{text:'+25'});}
 const wave=l.waves[s.waveIndex];
 while(s.spawnIndex<wave.spawns.length&&wave.spawns[s.spawnIndex].at<=s.t-s.waveAt) {
  const d=wave.spawns[s.spawnIndex++],def=ENEMIES[d.type];
  s.enemies.push({id:s.nextId++,type:d.type,row:d.lane,x:8.5,hp:def.hp,maxHp:def.hp,slowUntil:0,stunUntil:0,healAt:s.t+3,hasJumped:false,flash:0,born:s.t});
 }
 for(const p of s.plants) {
  p.flash=Math.max(0,p.flash-dt); if(p.next>s.t)continue;
  const d=PLANTS[p.type],boost=fertile(l,p.row,p.col);
  if(p.type==='glow'){const n=Math.round(d.income*boost);s.sun+=n;s.earned+=n;p.next=s.t+d.interval;effect(s,'sun',p.col+.5,p.row,{text:'+'+n});}
  else if(p.type==='clover'){for(const a of s.plants)if(Math.abs(a.row-p.row)<=1&&Math.abs(a.col-p.col)<=1)a.hp=Math.min(a.maxHp,a.hp+d.heal*boost);p.next=s.t+d.interval;effect(s,'heal',p.col+.5,p.row,{life:.8});}
  else if(d.damage){const e=target(s,p);if(!e)continue;p.next=s.t+d.interval;p.flash=.15;
   s.shots.push({id:s.nextId++,type:p.type,row:p.row,x:p.col+.75,y:0,startX:p.col+.75,targetId:e.id,targetX:e.x,age:0,damage:d.damage*boost,speed:p.type==='mortar'?0:5.5,hit:[]});}
 }
 for(const shot of s.shots) {
  shot.age+=dt;
  if(shot.type==='mortar') {
   if(shot.age>=.6){const victim=s.enemies.find(e=>e.id===shot.targetId);const x=victim?victim.x:shot.targetX;for(const e of s.enemies)if(Math.hypot(e.x-x,(e.row-shot.row)*1.05)<=1.15)damage(s,e,shot.damage,true);effect(s,'splash',x,shot.row,{life:.5});shot.done=true;}
  } else {
   const oldX=shot.x;shot.x+=shot.speed*dt;
   for(const e of s.enemies.filter(e=>e.row===shot.row&&e.hp>0&&e.x>=oldX-.2&&e.x<=shot.x+.2).sort((a,b)=>a.x-b.x)) {
    if(shot.hit.includes(e.id))continue;damage(s,e,shot.damage,shot.type==='ember');shot.hit.push(e.id);
    if(shot.type==='frost')e.slowUntil=Math.max(e.slowUntil,s.t+4);
    if(shot.type!=='ember'){shot.done=true;break;}
   }
   if(shot.x>9)shot.done=true;
  }
 }
 s.shots=s.shots.filter(x=>!x.done);rewardKills(s);
 for(const e of s.enemies) {
  if(e.hp<=0)continue;const d=ENEMIES[e.type];e.flash=Math.max(0,e.flash-dt);
  if(e.type==='lantern'&&s.t>=e.healAt){for(const a of s.enemies)if(a.id!==e.id&&Math.abs(a.row-e.row)<=1&&Math.abs(a.x-e.x)<1.5)a.hp=Math.min(a.maxHp,a.hp+12);e.healAt=s.t+3;effect(s,'enemyheal',e.x,e.row,{life:.6});}
  if(e.stunUntil>s.t)continue;
  const blocker=s.plants.filter(p=>p.row===e.row&&p.hp>0&&e.x>=p.col+.30&&e.x<=p.col+1.02).sort((a,b)=>b.col-a.col)[0];
  if(blocker&&e.type==='hopper'&&!e.hasJumped&&blocker.type==='bark'){e.hasJumped=true;e.x=Math.max(-.1,blocker.col-.35);e.stunUntil=s.t+.45;effect(s,'jump',e.x,e.row);continue;}
  if(blocker){blocker.hp-=d.bite*dt;blocker.flash=.12;if(blocker.type==='bark')damage(s,e,8*dt*fertile(l,blocker.row,blocker.col),true);}
  else e.x-=d.speed*(e.slowUntil>s.t?.55:1)*dt;
  if(e.x<-.4){if(s.sweeps[e.row]){s.sweeps[e.row]=false;s.usedSweeps++;for(const a of s.enemies)if(a.row===e.row)a.hp=0;effect(s,'sweep',0,e.row,{life:1.1});event(s,'sweep',{row:e.row});}else{e.leaked=true;s.lives--;s.leaks++;effect(s,'leak',-.5,e.row);event(s,'leak');}}
 }
 const destroyed=s.plants.filter(p=>p.hp<=0);s.lostPlants+=destroyed.length;for(const p of destroyed)effect(s,'wilt',p.col+.5,p.row);s.plants=s.plants.filter(p=>p.hp>0);
 s.enemies=s.enemies.filter(e=>!e.leaked);rewardKills(s);
 if(s.lives<=0){s.lives=0;s.status='lost';s.completeAt=s.t;event(s,'lost');return;}
 if(s.spawnIndex>=wave.spawns.length&&s.enemies.length===0){
  if(s.waveIndex===l.waves.length-1){s.status='won';s.completeAt=s.t;event(s,'won');}
  else if(s.nextAt===null)s.nextAt=s.t+8;
 }
 if(s.nextAt!==null&&s.t>=s.nextAt)sendWave(s,l);
}
function step(s,l,dt) { if(!finite(dt)||dt<0||dt>60)throw Error('Invalid simulation delta');let left=dt;while(left>1e-8){const d=Math.min(.05,left);tick(s,l,d);left-=d;} return s; }
function serialize(s) {return JSON.stringify(s);}
function restore(raw,levels) {
 try {const s=typeof raw==='string'?JSON.parse(raw):clone(raw),l=levels.find(x=>x.id===s.levelId);
 if(!l||s.version!==VERSION||!['ready','running','won','lost'].includes(s.status)||!finite(s.t)||s.t<0||s.t>86400||!finite(s.sun)||s.sun<0||s.sun>1000000||!Number.isInteger(s.waveIndex)||s.waveIndex< -1||s.waveIndex>=l.waves.length||!Number.isInteger(s.lives)||s.lives<0||s.lives>5)return null;
 if(!Array.isArray(s.plants)||s.plants.length>40||!Array.isArray(s.enemies)||s.enemies.length>300||!Array.isArray(s.shots)||s.shots.length>300||!Array.isArray(s.fx)||!Array.isArray(s.sweeps)||s.sweeps.length!==5||!s.cooldowns||!Array.isArray(s.events))return null;
 if(!Number.isInteger(s.spawnIndex)||s.spawnIndex<0||(s.waveIndex>=0&&s.spawnIndex>l.waves[s.waveIndex].spawns.length)||!finite(s.waveAt)||!finite(s.incomeAt)||!finite(s.rainReadyAt)||!Number.isInteger(s.rainCharges)||s.rainCharges<0||s.rainCharges>3||!Number.isInteger(s.nextId))return null;
 if(s.status==='running'&&s.waveIndex<0)return null;
 if(!s.sweeps.every(x=>typeof x==='boolean')||!(s.nextAt===null||finite(s.nextAt))||Object.values(s.cooldowns).some(x=>!finite(x)||x<0))return null;
 const cells=new Set();for(const p of s.plants){if(!PLANTS[p.type]||p.type==='burst'||!activeCell(l,p.row,p.col)||!finite(p.hp)||p.hp<=0||p.hp>PLANTS[p.type].hp||!finite(p.next)||p.next<0||p.maxHp!==PLANTS[p.type].hp||!finite(p.born)||!finite(p.flash)||!Number.isInteger(p.id))return null;const k=p.row+','+p.col;if(cells.has(k))return null;cells.add(k);}
 for(const e of s.enemies)if(!ENEMIES[e.type]||!l.lanes.includes(e.row)||!finite(e.x)||e.x< -2||e.x>10||!finite(e.hp)||e.hp<=0||e.hp>ENEMIES[e.type].hp||!finite(e.slowUntil)||!finite(e.stunUntil)||e.maxHp!==ENEMIES[e.type].hp||!finite(e.healAt)||!finite(e.born)||!finite(e.flash)||!Number.isInteger(e.id)||typeof e.hasJumped!=='boolean')return null;
 for(const shot of s.shots)if(!['pod','frost','mortar','ember'].includes(shot.type)||!finite(shot.x)||!finite(shot.damage)||!finite(shot.age)||!finite(shot.startX)||!finite(shot.targetX)||!finite(shot.speed)||!l.lanes.includes(shot.row)||!Number.isInteger(shot.id)||!Number.isInteger(shot.targetId)||!Array.isArray(shot.hit)||!shot.hit.every(Number.isInteger))return null;
 for(const k of ['kills','spent','earned','planted','lostPlants','usedSweeps','usedRain','leaks'])if(!finite(s[k])||s[k]<0)return null;
 s.fx=[];return s;
 }catch{return null;}
}
function stars(s){return s.status!=='won'?0:s.lives===5&&s.usedSweeps===0?3:s.lives>=3?2:1;}
return {VERSION,ROWS,COLS,PLANTS,ENEMIES,create,activeCell,fertile,canPlant,plant,shovel,sendWave,rain,step,serialize,restore,stars};
});
