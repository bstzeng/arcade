'use strict';
const E=require('./engine.js');
function direction(a,b){if(a.x===b.x)return b.y<a.y?0:2;if(a.y===b.y)return b.x<a.x?3:1;return null;}
function remainingHp(s){return s.enemies.filter(e=>e.world===s.p.world).reduce((a,e)=>a+e.hp,0);}
function distance(s,target){const p=E.route(s,s.p,target,s.p.world,true);return p?p.length:99;}
function solve(game,n,profile=0,difficulty='normal',limit=1100){let s=E.start(game,n,difficulty),actions=[],visits=new Map(),rewound=new Set();
function doAction(a){let r=E.apply(s,a);if(!r.legal)throw Error('Planner illegal '+JSON.stringify(a));s=r.state;actions.push(a);return s;}
for(let i=0;i<limit&&s.status==='playing';i++){
if(!s.chosen&&E.dist(s.p,{x:2,y:1})<=1){let c=(s.level.loadout+s.floor+profile)%3;if(s.kind==='curse')c=profile%2?2:1;if(s.kind==='weapon'&&s.floor>0)c=profile%2?s.build.inherited:s.build.previousWeapon;doAction({type:'build',choice:c});continue;}
if(s.kind==='echo'&&!rewound.has(s.floor)&&s.floorHistory.length>=18){doAction({type:'skill',dir:s.p.face});rewound.add(s.floor);continue;}
let targets=s.enemies.filter(e=>e.world===s.p.world);let target;
if(!s.chosen)target={x:2,y:1};else if(targets.length)target=targets.map(e=>({e,d:distance(s,e)})).sort((a,b)=>a.d-b.d)[0].e;else if(s.kind==='dual'&&!s.build.marks[s.p.world])target={x:7,y:1};else if(s.kind==='dual'&&(s.enemies.length||!s.build.marks.every(Boolean))){doAction({type:'skill',dir:s.p.face});continue;}else target={x:7,y:7};
if(!targets.length&&s.kind==='dual'&&!s.build.marks[s.p.world]&&s.p.x===7&&s.p.y===1){doAction({type:'interact'});continue;}
if(s.kind==='boss'&&!s.enemies.length&&E.dist(s.p,{x:7,y:7})<=1&&s.build.borrowFloor!==s.floor){doAction({type:'borrow',choice:(s.floor+profile)%3});continue;}
if(!s.enemies.length&&s.chosen&&(s.kind!=='dual'||s.build.marks.every(Boolean))&&s.p.x===7&&s.p.y===7){doAction({type:'descend'});visits.clear();continue;}
if(s.p.hp<=15&&E.walkable(s,1,7)&&s.maps[s.p.world][E.idx(1,7)]==='h'&&!targets.some(e=>E.dist(e,s.p)<3)){target={x:1,y:7};if(s.p.x===1&&s.p.y===7){doAction({type:'interact'});continue;}}
let candidates=[];for(let d=0;d<4;d++){candidates.push({type:'move',dir:d},{type:'attack',dir:d});if(!['echo','dual','heart'].includes(s.kind))candidates.push({type:'skill',dir:d});if(s.kind==='terrain')candidates.push({type:'eat',dir:d});}candidates.push({type:'guard'});
if(s.kind==='potion'&&s.p.hp<s.p.maxhp-4)candidates.push({type:'skill',mode:'drink',dir:0});
if(s.kind==='memory')for(let slot=0;slot<s.build.memory.length;slot++)for(let d=0;d<4;d++)candidates.push({type:'skill',slot,dir:d});
if(s.kind==='wound'&&s.p.hp<13)candidates.push({type:'repair'});
let before=remainingHp(s),oldD=distance(s,target),best=null;
for(let a of candidates){let r=E.apply(s,a);if(!r.legal)continue;let t=r.state,damaged=before-remainingHp(t),hp=t.p.hp-s.p.hp,dd=target.id!==undefined?(t.enemies.some(e=>e.world===t.p.world)?Math.min(99,...t.enemies.filter(e=>e.world===t.p.world).map(e=>distance(t,e))):0):distance(t,target),key=[t.floor,t.p.world,t.p.x,t.p.y,t.enemies.length,t.enemies.map(e=>e.hp).join(',')].join(':');let score=damaged*10+hp*(hp>0?2:5)+Math.max(-2,Math.min(2,oldD-dd))*7+(t.p.shield-s.p.shield)*.15+(t.p.energy-s.p.energy)*.08-(visits.get(key)||0)*.35;
if(a.type==='attack'&&damaged<=0)score-=7;if(a.type==='guard')score-=2;if(a.type==='move')score+=.12;if(a.type==='eat')score+=s.build.stomach.length===0?4:-1;if(a.type==='skill')score-=.3;if(t.status==='lost')score-=10000;
if(s.kind==='curse'&&t.build.broken>s.build.broken)score-=35;
// Avoid stepping onto a visible wind-up target when a nonfatal alternative exists.
for(const e of t.enemies)if(e.windup&&e.tx===t.p.x&&e.ty===t.p.y)score-=2;
if(!best||score>best.score+.00001)best={a,t,score,key};}
if(!best)break;s=best.t;actions.push(best.a);visits.set(best.key,(visits.get(best.key)||0)+1);
}
return {win:s.status==='won',state:s,actions,profile};}
module.exports={solve};
if(require.main===module){const S=E.Specs.specs;for(const sp of S){let r=solve(sp.id,1);console.log(sp.id,r.win,r.actions.length,r.state.p.hp,r.state.floor,r.state.enemies.length);if(!r.win)console.log(r.actions.slice(-12),r.state.p,r.state.enemies);}}
