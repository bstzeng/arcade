(function(root,f){if(typeof module==='object'&&module.exports)module.exports=f();else root.HorrorSemantic=f();})(globalThis,function(){'use strict';
const norm=a=>{const m=new Map();return a.map(x=>{if(!m.has(x))m.set(x,m.size);return m.get(x);});},sort=a=>a.map(x=>JSON.stringify(x)).sort(),primitive=a=>{for(let k=1;k<=a.length;k++)if(a.length%k===0&&a.every((x,i)=>x===a[i%k]))return a.slice(0,k);return a;};
function fingerprint(spec){const c=spec.config;let v;switch(spec.game){
case'endless-corridor':v=[0,1,2].map(offset=>c.rooms.map(r=>[(r.symbol+offset)%3,r.turn?1:0])).map(JSON.stringify).sort()[0];break;
case'night-shift':v=[0,1,2].map(k=>c.incidents.filter(x=>x.kind===k).length);break;
case'last-lamp':v=[c.walls.slice().sort((a,b)=>a-b),c.keys.slice().sort((a,b)=>a-b),c.shadow];break;
case'extra-window':v=[c.real,c.real.map(i=>c.capacity[i]),c.braces];break;
case'broken-weather':v=norm(c.fronts.map(i=>c.truth[i]));break;
case'forbidden-replay':v=[c.frames.length,c.frames.map((r,i)=>i&&r.some((x,k)=>Math.abs(x-c.frames[i-1][k])>1)?i:-1).filter(x=>x>=0)];break;
case'three-am-elevator':v=[sort(c.passengers.filter(p=>p.real).map(p=>[p.floor,p.before])),c.passengers.filter(p=>!p.real).length,c.power];break;
case'breathing-room':v=sort(c.nights.map(n=>[primitive(n.rhythms[n.mimic]),sort(n.rhythms.filter((_,i)=>i!==n.mimic).map(primitive))]));break;
case'empty-photo':v=[c.holes.slice().sort((a,b)=>a-b),c.companion];break;
case'spare-key':v=c.visitors.map(p=>p.real?'real':p.forge);break;
case'tomorrow-lost-property':v=[c.initial,c.target,c.objects.map(o=>[o.effects,o.link])];break;
case'ninth-passenger':{const bad=c.tickets.find((p,i)=>!c.ledger.some(x=>x.seat===i&&x.stamp===p.stamp));v=[[1,2,3,4].map(i=>c.ledger.filter(p=>p.dest===i).length),bad.dest];break;}
case'dream-senses':{const signs=c.layers.map(l=>Math.sign(l[0]+l[1]-l[2]));v=[signs,signs.map(x=>-x)].map(JSON.stringify).sort()[0];break;}
case'shadow-feeding':v=norm(c.exits);break;
case'mimic-alarm':v=[c.history,c.allowed.map(a=>a.slice().sort((x,y)=>x-y))];break;
default:throw Error('Unknown game');}return JSON.stringify([spec.game,v]);}
return {fingerprint,norm};
});
