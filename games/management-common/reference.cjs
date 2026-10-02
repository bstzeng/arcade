'use strict';
// Independent transition oracle. Deliberately imports neither engines nor the generator.
const assert=require('node:assert/strict');
const copy=x=>JSON.parse(JSON.stringify(x));
const requireRule=(v,message)=>{if(!v)throw Error(message||'illegal reference action');};
const present=(a,i)=>Number.isInteger(i)&&i>=0&&i<a.length;
function initial(id,l){switch(id){
case 'hotel-manager':return {day:0,cash:l.cash,rooms:l.rooms.map(()=>({guest:-1,dirty:false})),workers:l.workers.map(()=>0),arrived:l.guests.map(()=>false),served:l.guests.map(()=>false),checkedOut:0,nights:0,failed:false};
case 'repair-shop':return {time:0,cash:l.cash,tool:1,parts:copy(l.parts),stock:copy(l.stock),orders:[],jobs:l.jobs.map(()=>({possible:[0,1,2],tests:[],fixed:false,sold:false})),failed:false};
case 'museum-curator':return {cash:l.cash,placed:l.exhibits.map(()=>-1),climate:[],benches:[],route:[l.entrance],phase:'design',tick:0,groups:l.groups.map(()=>({position:-1,score:0,fatigue:0,done:false,happy:false})),damage:0,failed:false};
case 'theater-manager':return {time:0,cash:l.cash,cast:l.shows.map(d=>d.roles.map(()=>-1)),practice:l.shows.map(()=>0),fatigue:l.actors.map(()=>0),events:[],performed:l.shows.map(()=>false),quality:l.shows.map(()=>0),failed:false};
case 'caravan-trade':return {city:0,day:0,cash:l.cash,food:l.food,hp:l.hp,guard:false,cargo:[0,0,0],stock:l.cities.map(c=>copy(c.stock)),foodStock:l.cities.map(c=>c.foodStock),done:l.contracts.map(()=>false),sold:[0,0,0],failed:false};
case 'tower-defense':return {cash:l.cash,lives:l.lives,wave:0,phase:'build',tick:0,towers:[],enemies:[],spawned:0,kills:0,leaks:0,shots:[]};
case 'deep-sea-treasure':return {cell:l.start,air:l.air,maxAir:l.air,cash:l.cash,suit:l.suit,bag:[],taken:[],cans:l.cans.map(c=>c.uses),hp:l.hp,time:0,key:false,failed:false};
case 'time-loop-adventure':return {loop:1,time:0,node:0,knowledge:[],gear:false,ore:false,beacon:false,safe:false,flooded:false,won:false,failed:false};
case 'conservation-park':return {season:0,cash:l.cash,water:l.water,seeds:l.seeds,stock:copy(l.stock),actions:0,patches:l.patches.map(p=>({grass:p.grass,rabbits:p.rabbits,foxes:p.foxes,restored:false,watered:false})),history:[],failed:false};
case 'alchemy-lab':return {cash:l.cash,fuel:l.fuel,time:0,inventory:copy(l.inventory),tools:[true,false,false],wear:[0,0,0],learned:[],waste:0,delivered:l.goals.map(()=>0),failed:false};
default:throw Error('unknown game');}}
function status(id,l,s){let won=false,over=false;if(s.failed)return 'lost';switch(id){
case 'hotel-manager':over=s.day===l.days;won=over&&s.checkedOut===l.guests.length&&s.cash>=l.target;break;
case 'repair-shop':over=s.jobs.every(j=>j.sold);won=over&&s.cash>=l.target;break;
case 'museum-curator':over=s.phase==='closed';won=over&&s.groups.every(g=>g.happy)&&s.damage===0&&s.placed.every(c=>c>=0&&s.route.includes(c))&&s.cash>=l.target;break;
case 'theater-manager':over=s.time>=l.slots;won=over&&s.performed.every(Boolean)&&s.cash>=l.target;break;
case 'caravan-trade':won=s.city===0&&s.done.every(Boolean)&&s.cash>=l.target;break;
case 'tower-defense':if(s.lives<l.minLives)return 'lost';won=s.wave===l.waves.length;break;
case 'deep-sea-treasure':won=s.cell===l.start&&l.required.every(i=>s.bag.includes(i))&&s.bag.reduce((v,i)=>v+l.treasures[i].value,0)>=l.target;break;
case 'time-loop-adventure':won=s.won;break;
case 'conservation-park':over=s.season===l.seasons;won=over&&s.patches.every(p=>p.restored)&&s.patches.reduce((v,p)=>v+p.rabbits,0)>=l.minRabbits&&s.patches.reduce((v,p)=>v+p.rabbits,0)<=l.maxRabbits&&s.patches.reduce((v,p)=>v+p.foxes,0)>=l.minFoxes&&s.patches.reduce((v,p)=>v+p.grass,0)>=l.minGrass;break;
case 'alchemy-lab':won=s.delivered.every((n,i)=>n>=l.goals[i].quantity)&&s.learned.length>=l.research;break;
}return won?'won':over?'lost':'playing';}
const ops={};
ops['hotel-manager']=(l,s,a)=>{switch(a.type){
case 'checkin':{requireRule(present(l.guests,a.guest)&&present(l.rooms,a.room));const g=l.guests[a.guest],r=l.rooms[a.room],p=s.rooms[a.room];requireRule(g.arrive===s.day&&!s.arrived[a.guest]&&p.guest<0&&!p.dirty&&r.beds>=g.beds&&(!g.quiet||r.quiet)&&(!g.view||r.view));p.guest=a.guest;s.arrived[a.guest]=true;break;}
case 'clean':{requireRule(present(l.rooms,a.room)&&present(l.workers,a.worker));requireRule(s.rooms[a.room].guest===-1&&s.rooms[a.room].dirty&&s.workers[a.worker]<l.workers[a.worker].hours);s.rooms[a.room].dirty=false;s.workers[a.worker]++;break;}
case 'serve':{requireRule(present(l.guests,a.guest)&&present(l.workers,a.worker));const g=l.guests[a.guest],w=l.workers[a.worker];requireRule(s.rooms.find(p=>p.guest===a.guest)&&!s.served[a.guest]&&w.skills.includes(g.services[s.day-g.arrive])&&w.hours-s.workers[a.worker]>=g.effort);s.served[a.guest]=true;s.workers[a.worker]+=g.effort;break;}
case 'night':{let total=0;for(let i=0;i<l.guests.length;i++){const g=l.guests[i];if(g.arrive===s.day&&!s.arrived[i])s.failed=true;}for(const p of s.rooms){if(p.guest===-1)continue;const gi=p.guest,g=l.guests[gi];if(s.served[gi]){total+=g.rate;s.nights++;}else s.failed=true;if(g.depart===s.day+1){p.guest=-1;p.dirty=true;s.checkedOut++;}}s.cash+=total;for(const w of l.workers)s.cash-=w.wage;s.day++;s.workers=s.workers.map(()=>0);s.served=s.served.map(()=>false);if(s.cash<0)s.failed=true;break;}
default:throw Error('action');}};
ops['repair-shop']=(l,s,a)=>{let dt=0;const j=s.jobs[a.job],d=l.jobs[a.job];switch(a.type){
case 'test':requireRule(j&&!j.fixed&&!j.sold&&present([0,1,2],a.test)&&!j.tests.find(t=>t.test===a.test)&&s.cash>=1);s.cash--;const yes=a.test===d.fault;j.tests.push({test:a.test,positive:yes});j.possible=j.possible.filter(k=>yes?k===a.test:k!==a.test);dt=1;break;
case 'order':requireRule(present(s.parts,a.part)&&s.stock[a.part]>0&&s.cash>=l.prices[a.part]);s.cash-=l.prices[a.part];s.stock[a.part]--;s.orders.push({part:a.part,eta:s.time+l.delivery,arrived:false});dt=1;break;
case 'tool':requireRule(s.tool<3&&s.cash>=l.toolPrice);s.tool++;s.cash-=l.toolPrice;dt=1;break;
case 'repair':requireRule(j&&!j.fixed&&!j.sold&&j.possible.length===1&&s.parts[j.possible[0]]>0&&s.tool>=d.difficulty);s.parts[j.possible[0]]--;j.fixed=true;dt=d.work;break;
case 'sell':requireRule(j&&j.fixed&&!j.sold);j.sold=true;s.cash+=d.price;dt=1;break;
case 'wait':dt=1;break;default:throw Error('action');}s.time+=dt;for(const o of s.orders)if(!o.arrived&&o.eta<=s.time){o.arrived=true;s.parts[o.part]++;}s.failed=s.time>l.deadline;};
ops['museum-curator']=(l,s,a)=>{if(['place','climate','bench','route','back'].includes(a.type))requireRule(s.phase==='design');switch(a.type){
case 'place':{requireRule(present(l.exhibits,a.exhibit)&&present(l.cells,a.cell));const e=l.exhibits[a.exhibit],c=l.cells[a.cell];requireRule(!c.wall&&a.cell!==l.entrance&&a.cell!==l.exit&&c.capacity>=e.size&&!s.placed.some((v,i)=>v===a.cell&&i!==a.exhibit));if(s.placed[a.exhibit]===-1){requireRule(s.cash>=e.fee);s.cash-=e.fee;}s.placed[a.exhibit]=a.cell;break;}
case 'climate':case 'bench':{const key=a.type==='climate'?'climate':'benches',cost=a.type==='climate'?3:2;requireRule(present(l.cells,a.cell)&&!l.cells[a.cell].wall&&!s[key].includes(a.cell)&&s.cash>=cost);s[key].push(a.cell);s.cash-=cost;break;}
case 'route':{const old=s.route[s.route.length-1],delta=Math.abs(old%l.width-a.cell%l.width)+Math.abs(Math.floor(old/l.width)-Math.floor(a.cell/l.width));requireRule(present(l.cells,a.cell)&&!l.cells[a.cell].wall&&delta===1&&!s.route.includes(a.cell)&&s.route.length<l.maxRoute);s.route.push(a.cell);break;}
case 'back':requireRule(s.route.length>1);s.route.pop();break;
case 'open':requireRule(s.phase==='design'&&s.route.at(-1)===l.exit&&s.placed.every(p=>p>=0));s.phase='open';break;
case 'tick':requireRule(s.phase==='open');for(let i=0;i<s.groups.length;i++){const g=s.groups[i],d=l.groups[i];if(g.done||i>s.tick)continue;const index=g.position+1;g.position=index;if(index===s.route.length){g.done=true;g.happy=g.score>=d.target&&g.fatigue<=d.stamina;if(g.happy)s.cash+=d.ticket;}else{const cell=s.route[index],ei=s.placed.indexOf(cell);g.fatigue=Math.max(0,g.fatigue+1-(s.benches.indexOf(cell)>=0?3:0));if(ei>=0){g.score+=l.exhibits[ei].theme===d.theme?3:1;if(l.exhibits[ei].fragile&&l.cells[cell].light&&s.climate.indexOf(cell)<0)s.damage++;}if(g.fatigue>d.stamina)s.failed=true;}}s.tick++;if(s.groups.every(g=>g.done))s.phase='closed';break;
default:throw Error('action');}};
ops['theater-manager']=(l,s,a)=>{switch(a.type){
case 'cast':{requireRule(s.time===0&&present(l.shows,a.show)&&present(l.actors,a.actor)&&present(l.shows[a.show].roles,a.role));const d=l.shows[a.show];requireRule(!s.events.some(e=>e.show===a.show)&&l.actors[a.actor].skills[d.roles[a.role]]>=d.skill&&!s.cast[a.show].some((p,i)=>i!==a.role&&p===a.actor));s.cast[a.show][a.role]=a.actor;break;}
case 'schedule':{requireRule(s.time===0&&present(l.shows,a.show)&&Number.isInteger(a.slot)&&a.slot>=0&&a.slot<l.slots&&Number.isInteger(a.stage)&&a.stage>=0&&a.stage<l.stages&&['rehearse','perform'].includes(a.kind));const cast=s.cast[a.show];requireRule(cast.every(p=>p>=0)&&!l.blackouts.some(b=>b.slot===a.slot&&b.stage===a.stage)&&cast.every(p=>!l.actors[p].unavailable.includes(a.slot)));for(const e of s.events){if(e.slot===a.slot)requireRule(e.stage!==a.stage&&e.show!==a.show&&s.cast[e.show].every(p=>!cast.includes(p)));if(a.kind==='perform'&&e.kind==='perform')requireRule(e.show!==a.show);}s.events.push({show:a.show,slot:a.slot,stage:a.stage,kind:a.kind});break;}
case 'unschedule':requireRule(s.time===0&&present(s.events,a.event));s.events.splice(a.event,1);break;
case 'tick':{const active=Array(l.actors.length).fill(false);for(const e of s.events){if(e.slot!==s.time)continue;const sh=l.shows[e.show],cast=s.cast[e.show];for(const actor of cast)active[actor]=true;if(e.kind==='rehearse'){s.practice[e.show]++;s.cash-=sh.rehearsalCost;}else{let q=s.practice[e.show]*2;cast.forEach((actor,i)=>{q+=l.actors[actor].skills[sh.roles[i]];q-=Math.max(0,s.fatigue[actor]-2);});s.quality[e.show]=q;if(q<sh.quality||s.practice[e.show]<sh.rehearsals)s.failed=true;else{s.performed[e.show]=true;s.cash+=sh.revenue;}}}for(let i=0;i<s.fatigue.length;i++)s.fatigue[i]=active[i]?s.fatigue[i]+2:Math.max(0,s.fatigue[i]-2);s.cash-=l.rent;s.time++;if(s.cash<0)s.failed=true;break;}
default:throw Error('action');}};
ops['caravan-trade']=(l,s,a)=>{const c=l.cities[s.city],units=s.cargo.reduce((v,n)=>v+n,0);switch(a.type){
case 'buy':requireRule(present(s.cargo,a.good)&&s.stock[s.city][a.good]>0&&s.cash>=c.buy[a.good]&&units+1+Math.ceil(s.food/3)<=l.capacity);s.stock[s.city][a.good]--;s.cargo[a.good]++;s.cash-=c.buy[a.good];break;
case 'sell':requireRule(present(s.cargo,a.good)&&s.cargo[a.good]>0);s.cargo[a.good]--;s.cash+=c.sell[a.good];s.sold[a.good]++;break;
case 'food':requireRule(s.foodStock[s.city]>0&&s.cash>=c.foodPrice&&units+Math.ceil((s.food+3)/3)<=l.capacity);s.food+=3;s.foodStock[s.city]--;s.cash-=c.foodPrice;break;
case 'guard':requireRule(!s.guard&&s.cash>=l.guardPrice);s.guard=true;s.cash-=l.guardPrice;break;
case 'travel':{requireRule(present(l.roads,a.road));const d=l.roads[a.road];requireRule((d.a===s.city||d.b===s.city)&&s.food>=d.days&&units+Math.ceil(s.food/3)<=l.capacity);s.food-=d.days;s.day+=d.days;if(d.risk>0&&!s.guard){s.hp-=d.risk;for(let i=0;i<s.cargo.length;i++)if(s.cargo[i]>0){s.cargo[i]--;break;}}s.guard=false;s.city=d.a===s.city?d.b:d.a;if(s.hp<=0||s.day>l.deadline)s.failed=true;break;}
case 'deliver':{requireRule(present(l.contracts,a.contract));const d=l.contracts[a.contract];requireRule(!s.done[a.contract]&&s.city===d.city&&s.cargo[d.good]>=d.quantity);s.cargo[d.good]-=d.quantity;s.cash+=d.reward;s.done[a.contract]=true;break;}
default:throw Error('action');}};
ops['tower-defense']=(l,s,a)=>{const prices=[7,9,6],damage=[3,6,1],range=[2.5,2.2,2.8],reload=[0,2,1];switch(a.type){
case 'build':requireRule(s.phase==='build'&&present(prices,a.kind)&&present(l.pads,a.pad)&&s.cash>=prices[a.kind]&&!s.towers.some(t=>t.pad===a.pad));s.cash-=prices[a.kind];s.towers.push({pad:a.pad,kind:a.kind,level:1,cool:0});break;
case 'upgrade':requireRule(s.phase==='build'&&present(s.towers,a.tower)&&s.towers[a.tower].level<3&&s.cash>=5);s.cash-=5;s.towers[a.tower].level++;break;
case 'start':requireRule(s.phase==='build');s.phase='battle';s.tick=0;s.spawned=0;s.enemies=[];s.towers.forEach(t=>t.cool=0);break;
case 'tick':{requireRule(s.phase==='battle');const specs=l.waves[s.wave];s.shots=[];for(let i=s.spawned;i<specs.length;i++){const p=specs[i];if(p.at>s.tick)break;s.enemies.push({id:i,pos:0,hp:p.hp,maxHp:p.hp,armor:p.armor,interval:p.interval,next:s.tick+p.interval,slow:0,bounty:p.bounty});s.spawned++;}
for(const t of s.towers){if(t.cool){t.cool--;continue;}let chosen=-1;for(let i=0;i<s.enemies.length;i++){const e=s.enemies[i],p=l.path[e.pos],v=l.pads[t.pad];if(e.hp<=0||Math.hypot(p[0]-v[0],p[1]-v[1])>range[t.kind]+(t.level-1)/4)continue;if(chosen<0||e.pos>s.enemies[chosen].pos||e.pos===s.enemies[chosen].pos&&e.id<s.enemies[chosen].id)chosen=i;}if(chosen<0)continue;const targetPosition=s.enemies[chosen].pos;s.shots.push({from:t.pad,to:targetPosition,kind:t.kind});for(let j=0;j<s.enemies.length;j++){const e=s.enemies[j];if(e.hp>0&&(j===chosen||t.kind===1&&Math.abs(e.pos-targetPosition)<=1)){e.hp-=Math.max(1,damage[t.kind]+2*(t.level-1)-e.armor);if(t.kind===2)e.slow=2;}}t.cool=reload[t.kind];}
const survivors=[];for(const e of s.enemies){if(e.hp<=0){s.cash+=e.bounty;s.kills++;continue;}if(e.next<=s.tick){if(e.slow){e.slow--;e.next=s.tick+1;}else{e.pos++;e.next=s.tick+e.interval;}}if(e.pos===l.path.length){s.lives--;s.leaks++;}else survivors.push(e);}s.enemies=survivors;s.tick++;if(s.spawned===specs.length&&s.enemies.length===0){s.phase='build';s.wave++;s.cash+=l.bonus;}break;}
default:throw Error('action');}};
ops['deep-sea-treasure']=(l,s,a)=>{const weight=s.bag.reduce((v,i)=>v+l.treasures[i].weight,0);switch(a.type){
case 'move':{requireRule(present(l.cells,a.cell)&&!l.cells[a.cell].wall);const from=[s.cell%l.width,Math.floor(s.cell/l.width)],to=[a.cell%l.width,Math.floor(a.cell/l.width)],dx=to[0]-from[0],dy=to[1]-from[1];requireRule(Math.abs(dx)+Math.abs(dy)===1&&to[1]<=s.suit&&(!l.cells[a.cell].locked||s.key));const dir=dx===1?'E':dx===-1?'W':dy===1?'S':'N',current=l.cells[s.cell].current;s.air-=1+Math.floor(to[1]/2)+Math.floor(weight/l.heavy)+(current&&current!==dir?1:0);s.cell=a.cell;s.time++;s.hp-=l.cells[a.cell].hazard;if(l.sharks.some(p=>p[s.time%p.length]===a.cell))s.hp--;if(l.cells[a.cell].key)s.key=true;break;}
case 'take':{requireRule(present(l.treasures,a.treasure));const t=l.treasures[a.treasure];requireRule(t.cell===s.cell&&!s.taken.includes(a.treasure)&&weight+t.weight<=l.capacity);s.bag.push(a.treasure);s.taken.push(a.treasure);s.air-=2;s.time++;break;}
case 'drop':requireRule(s.bag.includes(a.treasure));s.bag.splice(s.bag.indexOf(a.treasure),1);break;
case 'air':requireRule(present(l.cans,a.can)&&l.cans[a.can].cell===s.cell&&s.cans[a.can]>0);s.cans[a.can]--;s.air=Math.min(s.maxAir,s.air+l.cans[a.can].air);s.time++;break;
case 'tank':requireRule(s.cell===l.start&&s.cash>=3&&s.maxAir===l.air);s.cash-=3;s.maxAir+=15;s.air+=15;break;
case 'suit':requireRule(s.cell===l.start&&s.cash>=3&&s.suit<l.height-1);s.cash-=3;s.suit++;break;
default:throw Error('action');}if(s.air<0||s.hp<=0||s.time>l.deadline)s.failed=true;};
ops['time-loop-adventure']=(l,s,a)=>{let time=0;switch(a.type){
case 'move':{requireRule(present(l.edges,a.edge));const e=l.edges[a.edge];requireRule(e.a===s.node||e.b===s.node);const destination=e.a===s.node?e.b:e.a;requireRule(destination!==l.observatory||s.safe&&s.time>=l.flood);s.node=destination;time=e.cost;break;}
case 'wait':time=1;break;
case 'read':requireRule(s.node===l.archive&&s.time>=l.archiveTime&&!s.knowledge.includes('code'));s.knowledge.push('code');time=1;break;
case 'unlock':requireRule(s.node===l.workshop&&s.knowledge.includes('code')&&s.time<=l.workshopClose&&!s.gear);s.gear=true;time=1;break;
case 'repair':requireRule(s.node===l.pump&&s.gear&&!s.safe&&s.time<l.flood);s.gear=false;s.safe=true;time=1;break;
case 'study':requireRule(s.node===l.observatory&&s.time>=l.starTime&&s.safe&&!s.knowledge.includes('formula'));s.knowledge.push('formula');time=1;break;
case 'lens':requireRule(s.node===l.garden&&s.knowledge.includes('formula')&&s.time>=l.lensTime&&!s.knowledge.includes('lens'));s.knowledge.push('lens');time=1;break;
case 'mine':requireRule(s.node===l.mine&&!s.ore&&!s.beacon);s.ore=true;time=1;break;
case 'craft':requireRule(s.node===l.workshop&&s.ore&&!s.beacon&&s.knowledge.includes('code')&&(!l.needFormula||s.knowledge.includes('formula'))&&(!l.needLens||s.knowledge.includes('lens')));s.ore=false;s.beacon=true;time=2;break;
case 'activate':requireRule(s.node===l.tower&&s.beacon&&s.safe&&s.time>=l.flood&&s.time<=l.deadline);s.beacon=false;s.won=true;break;
case 'reset':requireRule(s.loop<l.maxLoops);s.loop++;s.time=0;s.node=0;s.gear=false;s.ore=false;s.beacon=false;s.safe=false;s.flooded=false;return;
default:throw Error('action');}s.time+=time;if(s.time>=l.flood&&!s.safe)s.flooded=true;if(s.time>l.length)s.failed=true;};
ops['conservation-park']=(l,s,a)=>{if(a.type!=='season')requireRule(s.actions<l.actions);const p=s.patches[a.patch];switch(a.type){
case 'restore':requireRule(p&&!p.restored&&s.cash>=4);s.cash-=4;p.restored=true;s.actions++;break;
case 'plant':requireRule(p&&s.seeds>0&&s.cash>=2);s.cash-=2;s.seeds--;p.grass=Math.min(l.patches[a.patch].cap+(p.restored?8:0),p.grass+6);s.actions++;break;
case 'water':requireRule(p&&!p.watered&&s.water>0);s.water--;p.watered=true;s.actions++;break;
case 'release':requireRule(p&&present(s.stock,a.species)&&s.stock[a.species]>0&&s.cash>=2);s.stock[a.species]--;s.cash-=2;p[a.species?'foxes':'rabbits']++;s.actions++;break;
case 'move':{requireRule(p&&present(s.patches,a.to)&&present(s.stock,a.species));const k=a.species?'foxes':'rabbits';requireRule(p[k]>0&&l.links.some(e=>e.includes(a.patch)&&e.includes(a.to)&&a.patch!==a.to));p[k]--;s.patches[a.to][k]++;s.actions++;break;}
case 'season':{const log=[];s.patches.forEach((p,i)=>{const d=l.patches[i],growth=Math.max(0,d.growth+(p.restored?3:0)+l.weather[s.season]+(p.watered?4:0)),grass=Math.min(d.cap+(p.restored?8:0),p.grass+growth),livingRabbits=Math.min(p.rabbits,Math.floor(grass/2)),starved=p.rabbits-livingRabbits,hunted=Math.min(livingRabbits,p.foxes),survivors=livingRabbits-hunted,births=l.winter.includes(s.season)?0:Math.floor(survivors/3);p.grass=grass-livingRabbits*2;p.rabbits=survivors+births;p.foxes=hunted;p.watered=false;log.push({growth,starved,hunted,births});});s.history.push(log);s.season++;s.actions=0;s.cash+=l.grant;if(s.patches.every(p=>p.rabbits===0))s.failed=true;break;}
default:throw Error('action');}};
ops['alchemy-lab']=(l,s,a)=>{switch(a.type){
case 'tool':requireRule([1,2].includes(a.tool)&&!s.tools[a.tool]&&s.cash>=4);s.cash-=4;s.tools[a.tool]=true;s.time++;break;
case 'service':requireRule(present(s.tools,a.tool)&&s.tools[a.tool]&&s.wear[a.tool]>0&&s.cash>=2);s.cash-=2;s.wear[a.tool]=0;s.time++;break;
case 'brew':{requireRule(present(l.materials,a.a)&&present(l.materials,a.b)&&s.inventory[a.a]>0&&s.inventory[a.b]>+(a.a===a.b)&&present(s.tools,a.tool)&&s.tools[a.tool]&&s.wear[a.tool]<4&&[1,2,3].includes(a.heat)&&s.fuel>=a.heat);s.inventory[a.a]--;s.inventory[a.b]--;s.fuel-=a.heat;s.time+=a.heat;s.wear[a.tool]++;let match=-1;for(let i=0;i<l.recipes.length;i++){const q=l.recipes[i];if(q.tool===a.tool&&q.heat===a.heat&&((q.a===a.a&&q.b===a.b)||(q.a===a.b&&q.b===a.a))){match=i;break;}}if(match<0)s.waste+=l.materials[a.a].mass+l.materials[a.b].mass;else{s.inventory[l.recipes[match].out]++;if(!s.learned.includes(match))s.learned.push(match);}break;}
case 'deliver':requireRule(present(l.goals,a.goal)&&s.inventory[l.goals[a.goal].material]>0&&s.delivered[a.goal]<l.goals[a.goal].quantity);s.inventory[l.goals[a.goal].material]--;s.delivered[a.goal]++;break;
default:throw Error('action');}if(s.time>l.deadline||s.waste>l.maxWaste)s.failed=true;};
function step(id,l,previous,action){requireRule(status(id,l,previous)==='playing');requireRule(action&&typeof action==='object'&&typeof action.type==='string');for(const [key,value]of Object.entries(action))if(key!=='type'&&!(key==='kind'&&typeof value==='string'))requireRule(Number.isSafeInteger(value)&&value>=0);const s=copy(previous);ops[id](l,s,action);return s;}
function project(s){const {note,log,...out}=s;return out;}
function invariants(id,l,s){const finite=x=>{if(typeof x==='number')assert(Number.isFinite(x));else if(x&&typeof x==='object')Object.values(x).forEach(finite);};finite(s);if('cash'in s)assert(s.cash>=0||status(id,l,s)==='lost');switch(id){
case 'hotel-manager':assert.equal(new Set(s.rooms.filter(r=>r.guest>=0).map(r=>r.guest)).size,s.rooms.filter(r=>r.guest>=0).length);s.workers.forEach((n,i)=>assert(n>=0&&n<=l.workers[i].hours));break;
case 'repair-shop':for(let p=0;p<3;p++){const received=s.orders.filter(o=>o.part===p&&o.arrived).length,consumed=s.jobs.filter((j,i)=>j.fixed&&l.jobs[i].fault===p).length;assert.equal(s.parts[p],l.parts[p]+received-consumed);assert.equal(s.stock[p],l.stock[p]-s.orders.filter(o=>o.part===p).length);}break;
case 'museum-curator':assert.equal(new Set(s.route).size,s.route.length);assert.equal(new Set(s.placed.filter(p=>p>=0)).size,s.placed.filter(p=>p>=0).length);break;
case 'theater-manager':for(const cast of s.cast)assert.equal(new Set(cast.filter(i=>i>=0)).size,cast.filter(i=>i>=0).length);break;
case 'caravan-trade':assert(s.food>=0);assert(s.cargo.every(n=>n>=0));assert(s.cargo.reduce((v,n)=>v+n,0)+Math.ceil(s.food/3)<=l.capacity);break;
case 'tower-defense':assert.equal(s.lives+s.leaks,l.lives);assert.equal(s.kills+s.leaks+s.enemies.length,l.waves.slice(0,s.wave).reduce((v,w)=>v+w.length,0)+(s.phase==='battle'?s.spawned:0));break;
case 'deep-sea-treasure':assert(s.bag.every(i=>s.taken.includes(i)));assert.equal(new Set(s.taken).size,s.taken.length);assert(s.bag.reduce((v,i)=>v+l.treasures[i].weight,0)<=l.capacity);break;
case 'time-loop-adventure':assert.equal(new Set(s.knowledge).size,s.knowledge.length);assert(s.loop<=l.maxLoops);break;
case 'conservation-park':s.patches.forEach(p=>{for(const k of ['grass','rabbits','foxes'])assert(Number.isInteger(p[k])&&p[k]>=0);});break;
case 'alchemy-lab':{const mass=s.inventory.reduce((v,n,i)=>v+n*l.materials[i].mass,0)+s.delivered.reduce((v,n,i)=>v+n*l.materials[l.goals[i].material].mass,0)+s.waste;assert.equal(mass,l.inventory.reduce((v,n,i)=>v+n*l.materials[i].mass,0));s.inventory.forEach(n=>assert(n>=0));for(const q of l.recipes)assert.equal(l.materials[q.out].mass,l.materials[q.a].mass+l.materials[q.b].mass);break;}
}}
module.exports={initial,step,status,project,invariants};
