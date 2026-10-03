'use strict';
const crypto=require('crypto'),E=require('./engine.js');
const norm=a=>{const m=new Map();return a.map(x=>{if(!m.has(x))m.set(x,m.size);return m.get(x);});};
function operative(id,level){const c=level.config;let config=c,goal=level.goal.map(x=>[x.key,x.value]).sort();switch(id){
case'villain-turn':config={order:c.order,link:c.links[2],rule:c.rule};break;
case'hero-retirement':config={protectedDeadline:c.order[c.rule],helperDeadline:c.order[c.links[c.rule]]};break;
case'memory-pawn':config={prices:c.order,corroboratingMemory:c.links[c.rule],reservedPerson:c.rule};break;
case'enemy-heir':config={skills:norm(c.order.map(e=>c.links[e])),opposesExtendedRule:c.rule===2};break;
case'future-defense':case'borrowed-day':config={links:c.order.map(i=>c.order.indexOf(c.links[i])),rule:c.order.indexOf(c.rule)};break;
case'seven-letters':config={links:c.order.map(i=>c.order.indexOf(c.links[i])),floodRecipient:c.rule};goal=goal.map(([k,v])=>[k,k==='owner'&&v!=='未交付'?c.order.indexOf(['岑青','許澄','安禾'].indexOf(v)):v]);break;
case'false-king':config={decreeTargets:c.links.map(i=>c.order.indexOf(i)),exposedPosition:c.rule};break;
case'three-names':config={claims:c.order.map(i=>c.links[i]),disclosureRequirement:c.order.indexOf(c.rule)};break;
case'final-wishes':case'yesterday-witness':config={links:c.order.map(i=>c.order.indexOf(c.links[i])),rule:c.order.indexOf(c.rule)};break;
}return JSON.stringify({config,goal});}
// Conservative empirical equivalence filter: configurations that differ only outside
// the observed public transitions are never used to inflate the mission count.
// This is supplementary to the explicit operative/symmetry normalization, not a
// claim that a finite sample proves two full story trees equivalent.
function behavior(id,level){const all=[];for(let k=0;k<96;k++){let s=E.create(id,{...level,goal:[]}),x=(k+1)*777+17,line=[];while(!s.done){x^=x<<13;x^=x>>>17;x^=x<<5;const actions=E.legal(s);line.push(actions);s=E.apply(s,actions[(x>>>0)%actions.length]);line.push(E.facts(s));}all.push(line);}return crypto.createHash('sha256').update(JSON.stringify(all)).digest('hex');}
function behavioralGoal(fingerprint,level){return fingerprint+'|'+JSON.stringify(level.goal.map(x=>[x.key,x.value]).sort());}
module.exports={operative,behavior,behavioralGoal};
