(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f(require('../management-common/model.js'));else(r.ManagementGames||={})['tower-defense']={...(r.ManagementGames||{})['tower-defense'],engine:f(r.ManagementModel)};})(globalThis,function(M){'use strict';const {need,make}=M;
const kinds=[{name:'箭塔',cost:7,damage:3,range:2.5,cool:1},{name:'砲塔',cost:9,damage:6,range:2.2,cool:3},{name:'冰塔',cost:6,damage:1,range:2.8,cool:2}];
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
const engine=make({start:l=>({cash:l.cash,lives:l.lives,wave:0,phase:'build',tick:0,towers:[],enemies:[],spawned:0,kills:0,leaks:0,shots:[],note:'先建塔，再開波。建造階段可自由思考；戰鬥以固定時間格模擬。'}),
 status:(l,s)=>s.lives<l.minLives?'lost':s.wave>=l.waves.length?'won':'playing',
 step(l,s,a){
 if(a.type==='build'){const d=kinds[a.kind];need(s.phase==='build'&&d&&l.pads[a.pad]&&!s.towers.some(t=>t.pad===a.pad)&&s.cash>=d.cost,'此時不能建塔，或位置／資金不合適。');s.cash-=d.cost;s.towers.push({pad:a.pad,kind:a.kind,level:1,cool:0});s.note=d.name+'已建造。';}
 else if(a.type==='upgrade'){const t=s.towers[a.tower];need(s.phase==='build'&&t&&t.level<3&&s.cash>=5,'只能在波次之間升級，最高 3 級。');s.cash-=5;t.level++;s.note='防禦塔升到 '+t.level+' 級。';}
 else if(a.type==='start'){need(s.phase==='build','波次已開始。');s.phase='battle';s.tick=0;s.spawned=0;s.enemies=[];s.towers.forEach(t=>t.cool=0);s.note='第 '+(s.wave+1)+' 波來襲。';}
 else if(a.type==='tick'){need(s.phase==='battle','請先啟動波次。');const wave=l.waves[s.wave];s.shots=[];while(s.spawned<wave.length&&wave[s.spawned].at<=s.tick){const d=wave[s.spawned];s.enemies.push({id:s.spawned,pos:0,hp:d.hp,maxHp:d.hp,armor:d.armor,interval:d.interval,next:s.tick+d.interval,slow:0,bounty:d.bounty});s.spawned++;}
 for(let ti=0;ti<s.towers.length;ti++){const t=s.towers[ti],d=kinds[t.kind];if(t.cool>0){t.cool--;continue;}const targets=s.enemies.filter(e=>e.hp>0&&distance(l.pads[t.pad],l.path[e.pos])<=d.range+(t.level-1)*.25).sort((a,b)=>b.pos-a.pos||a.id-b.id);if(!targets.length)continue;const target=targets[0];s.shots.push({from:t.pad,to:target.pos,kind:t.kind});for(const e of s.enemies){if(e.hp<=0)continue;if(e===target||(t.kind===1&&Math.abs(e.pos-target.pos)<=1)){e.hp-=Math.max(1,d.damage+(t.level-1)*2-e.armor);if(t.kind===2)e.slow=2;}}t.cool=d.cool-1;}
 for(const e of s.enemies)if(e.hp<=0){s.cash+=e.bounty;s.kills++;}s.enemies=s.enemies.filter(e=>e.hp>0);for(const e of s.enemies){if(s.tick>=e.next){if(e.slow>0){e.slow--;e.next=s.tick+1;}else{e.pos++;e.next=s.tick+e.interval;}}}const leaks=s.enemies.filter(e=>e.pos>=l.path.length).length;s.lives-=leaks;s.leaks+=leaks;s.enemies=s.enemies.filter(e=>e.pos<l.path.length);s.tick++;if(s.spawned===wave.length&&!s.enemies.length){s.wave++;s.phase='build';s.cash+=l.bonus;s.note='波次完成，獲得整備金 '+l.bonus+'。';}else s.note='固定時間格 '+s.tick+'：塔優先攻擊最接近城門的敵人。';}
 else throw Error('未知塔防動作。');
 },actions(l,s){return s.phase==='battle'?[{type:'tick'}]:[{type:'start'},...l.pads.flatMap((p,pad)=>kinds.map((k,kind)=>({type:'build',pad,kind}))),...s.towers.map((t,tower)=>({type:'upgrade',tower}))];},
 describe:(l,a)=>a.type==='build'?'在塔基 '+(a.pad+1)+' 建'+kinds[a.kind].name:a.type==='upgrade'?'升級防禦塔 '+(a.tower+1):a.type==='start'?'開始下一波':'模擬一個時間格',
 tip:()=> '箭塔射速快，砲塔會波及路徑前後一格，冰塔延後敵人移動。優先選擇能涵蓋多段道路的位置；波次結束後再用賞金升級。'
});engine.kinds=kinds;return engine;});
