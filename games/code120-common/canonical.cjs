'use strict';
// Independently normalize visible task constraints, excluding names, prose, seeds,
// witness programs, starter code and proof hashes. Fixed public constants retain meaning.
const renameSequence=(arrays)=>{const map=new Map();return arrays.map(a=>a.map(v=>{if(!map.has(v))map.set(v,map.size);return map.get(v);}));};
const perms=a=>a.length?a.flatMap((x,i)=>perms(a.filter((_,j)=>j!==i)).map(p=>[x,...p])):[[]];
function canonical(id,l){let d;
if(id==='swarm-command')d=[l.bees,l.deadline,l.flowers.map(f=>[f.amount,f.distance,f.work]).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)))];
else if(id==='robot-dance'){const shapes=[];for(let reflect=0;reflect<2;reflect++)for(let turns=0;turns<4;turns++){const transform=([x,y])=>{if(reflect)x=l.size-1-x;for(let n=0;n<turns;n++)[x,y]=[l.size-1-y,x];return [x,y];};const streams=l.starts.map((start,i)=>[transform(start),...l.target.map(t=>transform(t[i]))]);streams.sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));shapes.push(JSON.stringify([l.size,streams]));}return shapes.sort()[0];}
else if(id==='stack-kitchen')d=renameSequence([l.pantry,l.target]);
else if(id==='recursive-treehouse'){const map=new Map();d=l.target.map(n=>{if(!map.has(n.room))map.set(n.room,map.size);return [n.path,map.get(n.room)];});}
else if(id==='signal-operator')d=l.tests.map(t=>t.output);
else if(id==='debug-courier')d=[l.inputs,l.target,l.maxEdits];
else if(id==='regex-warden'){const alphabet=['A','B','1','2','-'],variants=[];for(const a of [false,true])for(const b of [false,true]){const tr=s=>s.split('').map(x=>a&&x==='A'?'B':a&&x==='B'?'A':b&&x==='1'?'2':b&&x==='2'?'1':x).join('');variants.push(l.words.filter((_,i)=>l.target[i]).map(tr).sort().join(','));}return variants.sort()[0];}
else if(id==='reversible-machine'){const variants=[];for(const p of perms(Array.from({length:l.bits},(_,i)=>i))){const swap=n=>p.reduce((x,to,from)=>x|(((n>>from)&1)<<to),0),out=Array(1<<l.bits);for(let x=0;x<out.length;x++)out[swap(x)]=swap(l.target[x]);variants.push(out.join(','));}return l.bits+':'+variants.sort()[0];}
else if(id==='async-post'){const views=[];for(const order of perms(Array.from({length:l.workers},(_,i)=>i))){const names=new Map();const rows=order.map(old=>(l.orders[old]||[]).map(message=>{const m=message.match(/^(\d)>(\d):([qr])(\d+)$/),from=order.indexOf(Number(m[1])),to=order.indexOf(Number(m[2]));if(!names.has(m[4]))names.set(m[4],names.size);return [from,to,m[3],names.get(m[4])];}));views.push(JSON.stringify([l.workers,l.capacity,rows]));}return views.sort()[0];}
else if(id==='cellular-board'){const r=l.semanticRule,mirror=Array.from({length:8},(_,n)=>n).reduce((v,n)=>v|(((r>>n)&1)<<(((n&1)<<2)|(n&2)|((n>>2)&1))),0);d=Math.min(r,mirror);}
else if(id==='adversarial-tester'){d=Array.from({length:65},(_,i)=>{const x=i-32,b=x<l.spec.lo?l.spec.parts[0]:x<l.spec.hi?l.spec.parts[1]:l.spec.parts[2];return b[0]*x+b[1];});}
else if(id==='totem-rewrite'){d=renameSequence([l.start.split(''),l.target.split('')]);d.push(l.rounds);}
else if(id==='interrupt-rescue'){const [patrol,stations]=renameSequence([l.patrol,l.events.map(e=>e.station)]);d=[patrol,l.events.map((e,i)=>[e.tick,e.type,e.priority,stations[i]])];}
else {const omitted=new Set(['id','title','tier','hint','starter','solution','proof','aiWitness']);d=Object.fromEntries(Object.entries(l).filter(([key])=>!omitted.has(key)));}
return JSON.stringify(d);
}
module.exports={canonical};
