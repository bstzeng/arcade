(function (root) {
  'use strict';
  const VERSION = 1, STEP = 1 / 60, MAX_FISH = 92, MAX_PLANKTON = 180;
  const SPECIES = [
    {id:'glass', name:'玻璃尾', min:2.8, max:14, speed:.74, turn:2.9, behavior:'school', color:'#83e6d1', fin:'#399fba', shape:'slender', note:'輕巧成群，受驚會短暫加速'},
    {id:'moss', name:'葉鰭魚', min:3.8, max:42, speed:.48, turn:1.8, behavior:'graze', color:'#b8d983', fin:'#5f9c6b', shape:'round', note:'慢慢覓食，轉身也較緩慢'},
    {id:'ribbon', name:'藍緞魚', min:7, max:95, speed:.96, turn:2.1, behavior:'weave', color:'#77bced', fin:'#466fbe', shape:'ribbon', note:'像緞帶擺動，游速較快'},
    {id:'sun', name:'夕照蝶魚', min:14, max:230, speed:.60, turn:1.9, behavior:'graze', color:'#f5ba7d', fin:'#ce706e', shape:'disc', note:'寬大的圓鰭，喜歡繞圈巡游'},
    {id:'dart', name:'赤箭魚', min:25, max:580, speed:1.14, turn:1.5, behavior:'dart', color:'#ec8997', fin:'#ac4c77', shape:'dart', note:'平時巡游，看見獵物會蓄勢衝刺'},
    {id:'shield', name:'青甲魚', min:50, max:1400, speed:.56, turn:1.35, behavior:'cruise', color:'#94c5ad', fin:'#477f92', shape:'shield', note:'巨大而緩慢，容易從身旁繞過'},
    {id:'lantern', name:'幽光魚', min:120, max:5000, speed:.67, turn:1.7, behavior:'ambush', color:'#b29ddd', fin:'#765dba', shape:'lantern', note:'會停下等待，靠近後才突然追逐'},
    {id:'sail', name:'星帆魚', min:260, max:18000, speed:.98, turn:1.1, behavior:'hunter', color:'#7dc7de', fin:'#356f99', shape:'sail', note:'有高高的背帆，追逐快但轉向慢'},
    {id:'ancient', name:'遠洋巨鰭', min:850, max:Infinity, speed:.65, turn:.85, behavior:'cruise', color:'#879ed5', fin:'#53639a', shape:'giant', note:'遠海的大型魚，幼魚與成魚體型差很大'}
  ];
  const byId = Object.fromEntries(SPECIES.map(s => [s.id, s]));
  const clamp = (n,a,b) => Math.max(a, Math.min(b,n));
  const distance = (a,b) => Math.hypot(a.x-b.x,a.y-b.y);
  const wrapAngle = a => Math.atan2(Math.sin(a),Math.cos(a));
  function random(s) { s.rng=(Math.imul(1664525,s.rng)+1013904223)>>>0; return s.rng/4294967296; }
  function level(size) { return Math.max(1,1+Math.floor(Math.log(Math.max(2,size)/2)/Math.log(1.28)+1e-10)); }
  function levelSize(lv) { return 2*Math.pow(1.28,lv-1); }
  function scale(size) { return Math.pow(Math.max(2,size)/2,.76); }
  function speed(size) { return 12*scale(size)*(1+.32*Math.log(level(size))); }
  function view(s) { const h=48*scale(s.player.size); return {h,w:h*s.aspect}; }
  function relation(size, otherSize) { return otherSize<=size*.92 ? 'prey' : otherSize>=size*1.12 ? 'danger' : 'peer'; }
  function growth(size, foodSize, plankton=false) {
    if (plankton) return .034/(1+Math.pow(size/3,1.3));
    if (relation(size,foodSize)!=='prey') return 0;
    return Math.cbrt(size*size*size+foodSize*foodSize*foodSize*.22/(1+.36*Math.log2(Math.max(2,size)/2)))-size;
  }
  function formatSize(cm) { if(cm<10)return cm.toFixed(2)+' cm'; if(cm<100)return cm.toFixed(1)+' cm'; if(cm<10000)return (cm/100).toFixed(cm<1000?2:1)+' m'; return (cm/100000).toFixed(2)+' km'; }
  function make(seed=123456789, aspect=1.65) {
    const s={schema:VERSION,rng:seed>>>0,nextID:1,time:0,ticks:0,status:'ready',paused:true,aspect:clamp(aspect,.45,2.5),player:{x:0,y:0,size:2,angle:0,vx:0,vy:0,health:3,energy:100,invulnerable:8,heal:0,boosting:false,dashLocked:false},fish:[],plankton:[],effects:[],best:2,eaten:0,fishEaten:0,planktonEaten:0,deaths:0,distance:0,discovered:[],lastBite:null,lastLevel:1,spawnClock:0,rebaseX:0,rebaseY:0};
    populate(s,true); return s;
  }
  function spot(s, initial=false, food=false) {
    const p=s.player,v=view(s), a=random(s)*Math.PI*2;
    if(initial&&food) return {x:p.x+(random(s)-.5)*v.w*.88,y:p.y+(random(s)-.5)*v.h*.80};
    // An annulus outside the current view avoids dangerous creatures appearing on top of the player.
    const r=1.08/Math.max(Math.abs(Math.cos(a)),Math.abs(Math.sin(a)))+random(s)*.35;
    return {x:p.x+Math.cos(a)*v.w*.5*r,y:p.y+Math.sin(a)*v.h*.5*r};
  }
  function newFish(s, initial=false) {
    const p=s.player, baby=p.size<3.1, r=random(s);
    let size=baby?2.8+random(s)*3.6:p.size*(r<.64?.36+random(s)*.48:r<.78?.96+random(s)*.1:1.32+random(s)*1.8);
    size=Math.max(2.8,size);
    const choices=SPECIES.filter(x=>size>=x.min&&size<=x.max), sp=choices[Math.floor(random(s)*choices.length)]||SPECIES.at(-1);
    let pos=spot(s,initial,false); const v=view(s);
    if(initial&&!baby&&relation(p.size,size)==='prey')pos={x:p.x+(random(s)-.5)*v.w,y:p.y+(random(s)-.5)*v.h};
    if(initial&&baby){pos.x=p.x+(pos.x-p.x)*1.12;pos.y=p.y+(pos.y-p.y)*1.12;}
    const angle=Math.atan2(p.y-pos.y,p.x-pos.x)+(random(s)-.5)*1.7;
    return {id:s.nextID++,species:sp.id,x:pos.x,y:pos.y,size,angle,phase:random(s)*Math.PI*2,wander:random(s)*Math.PI*2,clock:random(s)*4,state:'roam',alert:0,rest:2+random(s)*4,burst:0,speedFactor:.9+random(s)*.2};
  }
  function addCluster(s, initial=false, center=null, count=12) {
    if(s.plankton.length>=MAX_PLANKTON)return;
    const p=s.player, pos=center||spot(s,initial,true), sc=scale(p.size);
    for(let i=0;i<count&&s.plankton.length<MAX_PLANKTON;i++){
      const a=random(s)*Math.PI*2,r=Math.sqrt(random(s))*2.9*sc;
      s.plankton.push({id:s.nextID++,x:pos.x+Math.cos(a)*r,y:pos.y+Math.sin(a)*r,phase:random(s)*Math.PI*2,nutrition:.8+random(s)*.4});
    }
  }
  function populate(s,initial=false) {
    const count=s.player.size<3.1?18:MAX_FISH;
    while(s.fish.length<count)s.fish.push(newFish(s,initial));
    if(initial){
      for(const [x,y] of [[5,0],[10,4],[10,-5],[-8,-3],[-12,5],[1,-9]])addCluster(s,true,{x:s.player.x+x*scale(s.player.size),y:s.player.y+y*scale(s.player.size)},14);
    }
    while(s.plankton.length<150)addCluster(s,initial);
  }
  function effect(s,type,x,y,text='',size=1) { s.effects.push({type,x,y,text,size,life:type==='level'?2.4:1}); if(s.effects.length>40)s.effects.shift(); }
  function eat(s,f,plankton=false) {
    const p=s.player, oldLevel=level(p.size), delta=growth(p.size,f.size||.45,plankton)*(plankton?f.nutrition:1);
    if(delta<=0)return false;
    p.size+=delta;s.best=Math.max(s.best,p.size);s.eaten++;s[plankton?'planktonEaten':'fishEaten']++;
    effect(s,plankton?'mote':'eat',f.x,f.y,'',Math.min(f.size||.2,p.size));
    if(!plankton&&!s.discovered.includes(f.species))s.discovered.push(f.species);
    const lv=level(p.size);if(lv>oldLevel){s.lastLevel=lv;effect(s,'level',p.x,p.y,'成長 Lv.'+lv,p.size);}
    return true;
  }
  function currents(x,y,t) { return {x:Math.sin(y*.022+t*.07)*.32,y:Math.cos(x*.018+t*.09)*.23}; }
  class SpatialGrid {
    constructor(cell){this.cell=cell;this.buckets=new Map();}
    key(x,y){return Math.floor(x/this.cell)+','+Math.floor(y/this.cell);}
    add(o){const k=this.key(o.x,o.y),v=this.buckets.get(k);if(v)v.push(o);else this.buckets.set(k,[o]);}
    near(x,y,r){const out=[],n=this.cell;if(Math.pow(Math.ceil(r*2/n)+2,2)>this.buckets.size*4){for(const bucket of this.buckets.values())for(const o of bucket)if(Math.abs(o.x-x)<=r+n&&Math.abs(o.y-y)<=r+n)out.push(o);return out;}for(let i=Math.floor((x-r)/n);i<=Math.floor((x+r)/n);i++)for(let j=Math.floor((y-r)/n);j<=Math.floor((y+r)/n);j++){const v=this.buckets.get(i+','+j);if(v)out.push(...v);}return out;}
  }
  function bite(s,f) {
    const p=s.player;if(p.invulnerable>0||s.status!=='running')return false;
    p.health--;p.invulnerable=3.2;p.heal=0;p.energy=Math.max(45,p.energy);s.lastBite={species:f.species,size:f.size};
    const a=Math.atan2(p.y-f.y,p.x-f.x);p.x+=Math.cos(a)*p.size*1.8;p.y+=Math.sin(a)*p.size*1.8;
    f.rest=5;f.state='roam';f.angle=wrapAngle(a+Math.PI);effect(s,'hurt',p.x,p.y,'小心大魚',p.size);
    if(p.health<=0){s.status='lost';s.paused=true;s.deaths++;p.boosting=false;}
    return true;
  }
  function moveFish(s,f,dt) {
    const p=s.player,sp=byId[f.species],d=distance(f,p),rel=relation(p.size,f.size);
    f.clock+=dt;f.rest=Math.max(0,f.rest-dt);f.burst=Math.max(0,f.burst-dt);
    let desired=f.wander+Math.sin(f.clock*.4+f.phase)*.5, multiplier=1;
    const detection=Math.max(p.size*3.4,f.size*2.8);
    if(rel==='prey'&&d<p.size*2.8+f.size*2.5){desired=Math.atan2(f.y-p.y,f.x-p.x)+Math.sin(f.clock*2+f.phase)*.25;multiplier=1.28;f.state='flee';}
    else if(rel==='danger'&&p.invulnerable<=0&&d<detection&&f.rest<=0){
      if(f.state!=='warn'&&f.state!=='hunt'){f.state='warn';f.alert=.8;}
      if(f.state==='warn'){f.alert-=dt;desired=Math.atan2(p.y-f.y,p.x-f.x);multiplier=.3;if(f.alert<=0){f.state='hunt';f.burst=sp.behavior==='dart'?1.3:2.5;}}
      else{desired=Math.atan2(p.y-f.y,p.x-f.x);multiplier=sp.behavior==='dart'?1.8:1.22;if(f.burst<=0){f.rest=3.5;f.state='roam';f.wander=f.angle+1.5;}}
    } else {if(f.state==='hunt'||f.state==='warn'){f.rest=2;f.wander=f.angle+1.4;}f.state='roam';
      if(sp.behavior==='weave')desired+=Math.sin(f.clock*1.8+f.phase)*.65;
      if(sp.behavior==='graze')desired+=f.clock*.14;
      if(sp.behavior==='ambush')multiplier=Math.sin(f.clock*.42+f.phase)>.2?.15:.85;
      if(sp.behavior==='dart')multiplier=Math.sin(f.clock*1.1+f.phase)>.82?1.5:.72;
      if(sp.behavior==='school')desired+=Math.sin((s.time+f.phase)*.65)*.22;
    }
    f.angle=wrapAngle(f.angle+clamp(wrapAngle(desired-f.angle),-sp.turn*dt,sp.turn*dt));
    const speed=10*Math.pow(Math.max(2,f.size)/2,.70)*sp.speed*f.speedFactor*multiplier, c=currents(f.x,f.y,s.time),sc=scale(p.size);
    f.x+=(Math.cos(f.angle)*speed+c.x*sc)*dt;f.y+=(Math.sin(f.angle)*speed+c.y*sc)*dt;
  }
  function tick(s,input,dt) {
    const p=s.player;s.time+=dt;s.ticks++;s.spawnClock+=dt;
    p.invulnerable=Math.max(0,p.invulnerable-dt);p.heal+=dt;
    if(p.health<3&&p.heal>=18){p.health++;p.heal=0;effect(s,'heal',p.x,p.y,'恢復一顆心',p.size);}
    let ix=Number.isFinite(input.x)?input.x:0,iy=Number.isFinite(input.y)?input.y:0,n=Math.hypot(ix,iy);if(n>1){ix/=n;iy/=n;n=1;}
    if(p.energy<=1)p.dashLocked=true;
    if(!input.boost&&p.energy>=24)p.dashLocked=false;
    p.boosting=!!input.boost&&n>.05&&p.energy>1&&!p.dashLocked;
    p.energy=clamp(p.energy+(p.boosting?-43:23)*dt,0,100);
    const targetSpeed=speed(p.size)*(p.boosting?1.85:1),response=1-Math.exp(-dt*10),cx=ix*targetSpeed,cy=iy*targetSpeed;
    p.vx+=(cx-p.vx)*response;p.vy+=(cy-p.vy)*response;
    if(n>.05){const desired=Math.atan2(iy,ix);p.angle=wrapAngle(p.angle+wrapAngle(desired-p.angle)*(1-Math.exp(-dt*12)));}
    const oldX=p.x,oldY=p.y,c=currents(p.x,p.y,s.time),sc=scale(p.size);
    p.x+=(p.vx+(n>.05?c.x*sc:0))*dt;p.y+=(p.vy+(n>.05?c.y*sc:0))*dt;s.distance+=Math.hypot(p.x-oldX,p.y-oldY);
    for(const f of s.fish)moveFish(s,f,dt);
    // Only the bounded local grid is queried for contact; distant fish cannot hurt or feed the player.
    const grid=new SpatialGrid(p.size*2.5);let largest=p.size;
    for(const f of s.fish){grid.add(f);largest=Math.max(largest,f.size);}
    const eaten=new Set();
    for(const f of grid.near(p.x,p.y,(largest+p.size)*.5)){
      const rel=relation(p.size,f.size), d=distance(p,f),reach=(p.size+f.size)*.32;
      if(d<reach&&rel==='prey'){if(eat(s,f))eaten.add(f.id);}
      else if(d<reach&&rel==='danger')bite(s,f);
      if(s.status==='lost')break;
    }
    s.fish=s.fish.filter(f=>!eaten.has(f.id));
    if(s.status==='running'){
      const foodGrid=new SpatialGrid(Math.max(1,p.size));for(const f of s.plankton)foodGrid.add(f);
      const food=new Set();for(const f of foodGrid.near(p.x,p.y,p.size*.58+.2))if(distance(p,f)<p.size*.48+.18){eat(s,f,true);food.add(f.id);}
      s.plankton=s.plankton.filter(f=>!food.has(f.id));
    }
    for(const e of s.effects)e.life-=dt;s.effects=s.effects.filter(e=>e.life>0);
    if(s.spawnClock>=.5){s.spawnClock-=.5;const v=view(s),dx=v.w*1.06,dy=v.h*1.06;
      s.fish=s.fish.filter(f=>Math.abs(f.x-p.x)<dx+f.size&&Math.abs(f.y-p.y)<dy+f.size);
      s.plankton=s.plankton.filter(f=>Math.abs(f.x-p.x)<dx&&Math.abs(f.y-p.y)<dy);
      const target=p.size<3.1?18:MAX_FISH;for(let i=0;i<8&&s.fish.length<target;i++)s.fish.push(newFish(s));
      if(s.plankton.length<150)addCluster(s);
    }
    // Rebase at astronomical distances, keeping local simulation precise without an ocean wall.
    if(Math.abs(p.x)>1e9||Math.abs(p.y)>1e9){const x=p.x,y=p.y;s.rebaseX+=x;s.rebaseY+=y;for(const a of [s.fish,s.plankton,s.effects])for(const o of a){o.x-=x;o.y-=y;}p.x=0;p.y=0;}
  }
  function step(s,input={},dt=STEP) { if(!Number.isFinite(dt)||dt<0||dt>.1)throw Error('時間步長錯誤');if(dt===0||s.paused||s.status!=='running')return s;const count=Math.max(1,Math.ceil(dt/STEP));for(let i=0;i<count&&s.status==='running';i++)tick(s,input,dt/count);return s; }
  function start(s){if(s.status==='lost')return false;s.status='running';s.paused=false;return true;}
  function pause(s){s.paused=true;s.player.boosting=false;s.player.vx=0;s.player.vy=0;}
  function revive(s){if(s.status!=='lost')return false;const p=s.player;p.size=Math.max(2,p.size*.9);p.health=3;p.energy=100;p.invulnerable=8;p.heal=0;p.vx=0;p.vy=0;p.boosting=false;p.dashLocked=false;s.fish=[];s.plankton=[];s.effects=[];s.status='running';s.paused=false;populate(s,true);return true;}
  function resize(s,aspect){if(Number.isFinite(aspect))s.aspect=clamp(aspect,.45,2.5);}
  function validate(s){
    if(!s||s.schema!==VERSION||!['ready','running','lost'].includes(s.status)||typeof s.paused!=='boolean')throw Error('不支援的存檔格式');
    for(const k of ['rng','nextID','time','ticks','aspect','best','eaten','fishEaten','planktonEaten','deaths','distance','lastLevel','spawnClock','rebaseX','rebaseY'])if(!Number.isFinite(s[k]))throw Error('存檔數值不完整');
    if(!Number.isSafeInteger(s.rng)||s.rng<0||s.rng>4294967295||!Number.isSafeInteger(s.nextID)||s.nextID<1||s.nextID>Number.MAX_SAFE_INTEGER-1000)throw Error('存檔序號錯誤');
    for(const k of ['ticks','eaten','fishEaten','planktonEaten','deaths','lastLevel'])if(!Number.isSafeInteger(s[k])||s[k]<0)throw Error('存檔計數錯誤');
    if(s.time<0||s.time>1e10||s.distance<0||s.best<2||s.best>1e12||s.aspect<.45||s.aspect>2.5||s.spawnClock<0||s.spawnClock>.6)throw Error('存檔超出範圍');
    const p=s.player;if(!p)throw Error('找不到玩家');for(const k of ['x','y','size','angle','vx','vy','health','energy','invulnerable','heal'])if(!Number.isFinite(p[k]))throw Error('魚隻數值錯誤');
    if(p.size<2||p.size>1e12||s.best<p.size||Math.abs(p.x)>1e10||Math.abs(p.y)>1e10||!Number.isInteger(p.health)||p.health<0||p.health>3||p.energy<0||p.energy>100||p.invulnerable<0||p.invulnerable>8.01||p.heal<0||typeof p.boosting!=='boolean'||typeof p.dashLocked!=='boolean'||(s.status==='lost')!==(p.health===0))throw Error('玩家狀態錯誤');
    if(!Array.isArray(s.fish)||s.fish.length>MAX_FISH||!Array.isArray(s.plankton)||s.plankton.length>MAX_PLANKTON||!Array.isArray(s.effects)||s.effects.length>40)throw Error('海域物件過多');
    const ids=new Set();for(const f of [...s.fish,...s.plankton]){if(!Number.isSafeInteger(f.id)||f.id<1||f.id>=s.nextID||ids.has(f.id)||!Number.isFinite(f.x)||!Number.isFinite(f.y)||Math.abs(f.x)>1e11||Math.abs(f.y)>1e11||!Number.isFinite(f.phase))throw Error('海域資料錯誤');ids.add(f.id);}
    for(const f of s.fish){if(!byId[f.species]||!['size','angle','wander','clock','alert','rest','burst','speedFactor'].every(k=>Number.isFinite(f[k]))||f.size<2.8||f.size>Math.max(8,p.size*6.4)||f.speedFactor<.8||f.speedFactor>1.3||!['roam','flee','warn','hunt'].includes(f.state))throw Error('魚群資料錯誤');}
    for(const f of s.plankton)if(!Number.isFinite(f.nutrition)||f.nutrition<.5||f.nutrition>1.5)throw Error('浮游生物資料錯誤');
    if(!Array.isArray(s.discovered)||s.discovered.length>SPECIES.length||new Set(s.discovered).size!==s.discovered.length||s.discovered.some(x=>!byId[x]))throw Error('圖鑑資料錯誤');
    if(s.lastBite!==null&&(!s.lastBite||!byId[s.lastBite.species]||!Number.isFinite(s.lastBite.size)||s.lastBite.size<2.8))throw Error('捕食紀錄錯誤');
    // Effects are cosmetic and never trusted to change progress.
    for(const e of s.effects)if(!e||!['mote','eat','level','hurt','heal'].includes(e.type)||!['x','y','size','life'].every(k=>Number.isFinite(e[k]))||typeof e.text!=='string'||e.text.length>80)throw Error('動畫資料錯誤');
    return true;
  }
  function serialize(s){validate(s);return JSON.stringify(s);}
  function deserialize(raw){if(typeof raw!=='string'||raw.length>250000)throw Error('存檔過大');const s=JSON.parse(raw);validate(s);s.paused=true;s.player.boosting=false;s.player.vx=0;s.player.vy=0;return s;}
  const api={VERSION,STEP,MAX_FISH,MAX_PLANKTON,SPECIES,byId,clamp,relation,growth,level,levelSize,scale,speed,view,formatSize,make,step,start,pause,revive,resize,validate,serialize,deserialize,SpatialGrid,currents};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.TideFeast=api;
})(typeof globalThis!=='undefined'?globalThis:this);
