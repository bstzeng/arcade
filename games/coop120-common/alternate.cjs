'use strict';
const C=require('./core.js');
function alternate(id,level,reference){const s=C.create(id,level),out=[];const doIt=(role,action)=>{const q=C.copy(action);delete q.label;const r=C.step(s,role,q);if(!r.ok)throw Error(`${id} alternate rejected ${JSON.stringify(q)} ${r.reason}`);out.push({role,action:q});};const finish=()=>{for(const q of C.solve(s))out.push(q);};const autoRole=role=>{const a=C.ai(s,role);if(a)doIt(role,a);return !!a;};
if(id==='blind-map'||id==='sonar-submarine'){
const r=C.DIRS.find(d=>{const x=d.dx,y=d.dy;return x>=0&&y>=0&&x<level.w&&y<level.h&&!(level.walls||level.reefs).includes(C.key(x,y))&&!(level.traps||[]).includes(C.key(x,y));});const back=C.DIRS.find(d=>d.dx===-r.dx&&d.dy===-r.dy);for(const d of [r,back]){if(id==='sonar-submarine')doIt(1,{type:'ping'});doIt(1,{type:'signal',dir:d.key});if(id==='sonar-submarine'){doIt(0,{type:'steer',dir:d.key});doIt(0,{type:'thrust'});}else doIt(0,{type:'move',dir:d.key});}finish();
}else if(id==='time-partners'){const g=level.gates[0];for(let i=0;i<g.period;i++)doIt(1,{type:'rewind'});finish();
}else if(id==='giant-artisan'){let swapped=false;for(let i=0;i<reference.length;i++){const q=reference[i];if(!swapped&&q.action.type==='bridge'&&reference[i+1]?.action.type==='lift'){doIt(reference[i+1].role,reference[i+1].action);doIt(q.role,q.action);i++;swapped=true;}else doIt(q.role,q.action);}
}else if(id==='dream-editor'){let swapped=false;for(let i=0;i<reference.length;i++){const q=reference[i];if(!swapped&&q.action.type==='select'&&reference[i+1]?.action.type==='select'){doIt(reference[i+1].role,reference[i+1].action);doIt(q.role,q.action);i++;swapped=true;}else doIt(q.role,q.action);}
}else if(id==='translator-envoy'){while(!s.won){const o=C.observe(s,0),v=[o.demand.good,o.demand.max,o.demand.tone];for(const field of [2,1,0])doIt(0,{type:'intent',field,v:v[field]});doIt(0,{type:'share'});const t=C.observe(s,1);for(const slot of [2,1,0]){const field=t.grammar[slot];doIt(1,{type:'word',slot,word:t.lexicon[field*3+v[field]-(field===1?1:0)]});}doIt(1,{type:'ready'});doIt(0,{type:'speak'});}
}else if(id==='medic-nanoboat'){for(let i=level.sites.length-1;i>=0;i--)doIt(1,{type:'scan',i});const sites=C.observe(s,1).sites.filter(q=>q.drug!==null).reverse();for(const q of sites){doIt(1,{type:'mark',i:q.i});let cap=0;while(s.mark&&!s.won&&cap++<200)autoRole(0);}
}else if(id==='reflection-twins'){let detour=false;for(const q of reference){doIt(q.role,q.action);if(q.action.type==='drift'&&!detour){doIt(1,{type:'return'});doIt(1,{type:'drift'});detour=true;}}
}else if(id==='plant-gardener'){let a,guard=0;while((a=C.legal(s,0).filter(a=>a.kind==='root').at(-1))&&guard++<30)doIt(0,a);finish();
}else if(id==='director-stunt'){let cap=0;while(!s.won&&cap++<2000){if(autoRole(1))continue;const o=C.observe(s,0);if(!o.rolling)doIt(0,{type:'roll'});else if(o.t<o.cue-o.window+1)doIt(0,{type:'tick'});else doIt(0,{type:'stunt',move:o.move});}
}else if(id==='hermit-fortress'){let cap=0;while(!s.won&&cap++<3000){const eng=C.observe(s,1),driver=C.observe(s,0),g=eng.sensor.slope===1?1:eng.sensor.slope===-1?3:2;if(s.gear!==g)doIt(1,{type:'gear',gear:g});else if(!s.shield||s.power!==1)doIt(1,{type:'power',power:1,shield:true});else if(s.heat>0)doIt(1,{type:'cool'});else if(s.heading!==driver.road.turn)doIt(0,{type:'steer',heading:driver.road.turn});else doIt(0,{type:'drive',speed:1});}
}else if(id==='storyteller-avatar'){while(!s.won){const o=C.observe(s,0),i=1-o.preferred;doIt(0,{type:'act',i});const a=C.observe(s,1),p=a.scene.paths[i];if(a.laws[p.law]!==p.v)doIt(1,{type:'rewrite',law:p.law,v:p.v});doIt(0,{type:'act',i});}
}else if(id==='beam-relay'){while(!s.won){const o=C.observe(s,0);doIt(0,{type:'source',row:o.h-1});doIt(0,{type:'color',color:o.target.color});doIt(1,{type:'clear'});doIt(1,{type:'mirror',x:o.w-2,y:o.h-1,slash:true});doIt(1,{type:'mirror',x:o.w-2,y:o.target.pos[1],slash:true});if(!s.running)doIt(0,{type:'expose'});for(let t=0;t<80;t++)doIt(0,{type:'tick'});}
}else if(id==='aerial-cargo'){let cap=0;while(!s.won&&cap++<3000){for(const role of [1,0]){const o=C.observe(s,role);let a=C.ai(s,role);if(role===0&&o.hooked&&o.rope===2&&o.x!==o.dest&&o.z<o.clearance+3)a={type:'altitude',dz:1};if(a)doIt(role,a);if(s.won)break;}}
}else if(id==='silent-investigation'){for(let i=level.rooms.length-1;i>=0;i--)doIt(0,{type:'search',i});for(const t of [2,1,0]){doIt(1,{type:'request',clueType:t});const clue=C.observe(s,0).rooms.find(q=>q.verified&&q.type===t);doIt(0,{type:'message',clueType:t,value:clue.value});}autoRole(1);autoRole(0);
}else throw Error('unknown alternate');
if(!s.won)throw Error(`${id} alternate did not win`);return out.map(q=>{const action={...q.action};delete action.label;return{role:q.role,action};});}
const descriptions={
'blind-map':'Safe exploratory detour with navigator signals, then route to camp',
 'time-partners':'One full first-shutter time cycle rewound before replanning all later phases',
 'giant-artisan':'Independent terrain operations performed in the opposite order',
 'dream-editor':'Panel swap selected from the opposite endpoint',
 'translator-envoy':'Different valid offer quantity where possible, reverse grammar-slot construction order',
 'medic-nanoboat':'Scan all samples first and visit infected sites in reverse order',
 'reflection-twins':'Reflection returns along its lit surface before recollecting the seal',
 'sonar-submarine':'Echo-confirmed out-and-back exploration before destination navigation',
 'plant-gardener':'Grow the entire reachable root network before growing the fruit-bearing stem branches',
 'director-stunt':'Stunt performed near the leading edge of the valid timing window',
 'hermit-fortress':'Shielded low-speed driving and immediate cooling on every segment',
 'storyteller-avatar':'Other narrative branch, including different condition edits and resulting gifts',
 'beam-relay':'Lower-source optical path and upward reflection pair instead of upper-source path',
 'aerial-cargo':'Higher flight clearance with different pendulum settling while retaining the exact irregular docking footprint',
 'silent-investigation':'Reverse evidence-category order and reverse scene-search order'};
module.exports={alternate,descriptions};
