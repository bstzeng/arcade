'use strict';
// Independent objective audit: no calls to runtime grade(), finish() or status flags.
module.exports=function check(s){const l=s.level,g=l.goal,m=s.metrics,b=s.bodies,p=s.parts;if(['jelly-skyscraper','resonance-glass','rope-net-catch','magnetic-sculpture'].includes(s.id)&&s.t<l.duration)return false;let cost=0;switch(s.id){
case'jelly-skyscraper':cost=p.reduce((a,q)=>a+q.k*.025+q.d*.1+q.width*.3,0);return b.every(z=>!z.broken)&&m.peak<=g.maxDeflection&&p.length===b.length&&cost<=l.budget&&p.every((q,i)=>q.k<=l.materialCaps[i]);
case'chain-demolition':return b.every(z=>z.angle>1.18)&&m.protected&&p.reduce((a,q)=>a+q.power,0)<=l.budget;
case'junk-mech-battle':cost=p.reduce((a,q)=>a+q.torque*.3+q.grip*2+q.hinge*.12,0);return b[1].x>94&&b[0].x>6&&Math.abs(b[0].lean)<1.05&&cost<=l.budget&&p.every(q=>Math.abs(q.x)<=l.axleLimit);
case'steam-pressure-lab':return b.every(z=>z.done&&z.x>=l.strokes[b.indexOf(z)]-.00001)&&l.order.every((n,i)=>!i||b[l.order[i-1]].doneAt<b[n].doneAt)&&s.temperature<l.maxTemp&&m.volume<l.volume;
case'gravity-room-workshop':return b.every(z=>z.docked)&&s.pathCrossings.every(p=>p.length===3&&p.every((y,i)=>Math.abs(y-l.gates[i])<=l.aperture));
case'wind-tunnel-cargo':return m.landed&&Math.abs(b[0].x-g.x)<=g.radius&&m.impact<=g.maxImpact&&s.crossings.length===2&&s.crossings.every((y,i)=>Math.abs(y-l.gates[i])<=l.aperture);
case'resonance-glass':return b.slice(0,-1).every(z=>z.broken)&&!b.at(-1).broken&&p.reduce((a,q)=>a+q.amplitude*q.duration,0)<=l.budget;
case'melting-ice-bridge':return s.car.x>=l.length&&m.minIce>0&&s.reason.indexOf('墜落')<0;
case'sand-collapse-lab':return m.bins.every((v,i)=>v>=g.bins[i])&&m.bins.reduce((a,v)=>a+v,0)>=g.total;
case'rope-net-catch':return s.caught&&m.minY>=g.minY&&m.peakForce<=l.strength&&Math.hypot(b[0].vx,b[0].vy)<g.maxSpeed&&b[0].y<56&&Math.abs(b[0].x-l.targetX)<3;
case'magnetic-sculpture':return m.withdrawn&&b.every(z=>Math.abs(z.x-g.x)<=g.width&&z.y<=g.height&&Math.hypot(z.vx,z.vy)<g.maxSpeed)&&s.bonds.length>=g.bonds;
case'friction-playground':return Math.abs(b[0].x-g.x)<=g.radius&&Math.abs(b[0].v)<.15&&m.crest;
case'cloth-parachute':return m.landed&&Math.abs(b[5].x-g.x)<=g.radius&&m.impact<=g.maxImpact;
case'hydraulic-hand':return b[0].x>=l.height&&b[1].x>=g.minClamp&&b[1].x<=g.maxClamp&&m.peakClamp<=l.crush&&m.volume<=l.volume;
case'soap-bubble-lab':return m.landed&&m.gateY>=l.obstacle&&Math.abs(b[0].x-g.x)<=g.radius&&m.impact<=g.maxImpact;
default:throw Error('Unrecognized game');}};
