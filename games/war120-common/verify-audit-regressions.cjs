'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),E=require('./engine.js'),independent=require('./independent.cjs'),D=require('./design.json');
const base=path.resolve(__dirname,'..'),load=id=>JSON.parse(fs.readFileSync(path.join(base,id,'levels.json')))[0];
function action(s,type,predicate=()=>true,side=0){const a=E.actions(E.view(s,side),side).find(a=>a.type===type&&predicate(a));assert(a,`Required legal action ${type}`);return a;}
function quietStep(s,a){s=E.clone(s);s.sealed=action(s,'wait',()=>true,1);return E.step(s,a||action(s,'wait'));}
const cases=[];let s=E.create(load('war-capitalless'));
// Exact reported counterexample: node 0 belongs to red, but node 1 has a live council.
s.nodes[0].owner=1;s.nodes[1].council=true;let next=quietStep(s);assert(!next.done&&!next.won);assert.equal(next.nodes[1].owner,0);assert.equal(next.nodes[1].unrest,0);assert(E.connected(next).has(1));cases.push({id:'origin-loss-preserves-alternate-council',passed:true});
// Relocating the command through the actual action API remains useful after the origin falls.
s=E.create(load('war-capitalless'));s=quietStep(s,action(s,'relocate',a=>a.from===0&&a.to===1));assert(!s.nodes[0].council&&s.nodes[1].council);s.nodes[0].owner=1;s.nodes[2].owner=0;s.nodes[2].units=7;s.nodes[2].council=false;next=quietStep(s);assert(!next.done);assert.equal(next.nodes[2].unrest,0);assert(E.connected(next).has(2));cases.push({id:'relocated-command-supports-connected-army',passed:true});
// No magical immunity: without any council, the existing three-round secession rule applies.
s=E.create(load('war-capitalless'));s.nodes[0].owner=1;s.nodes[1].council=false;for(let i=1;i<=3;i++){s=quietStep(s);if(i<3){assert(!s.done);assert.equal(s.nodes[1].unrest,i);}else{assert(s.done&&!s.won);assert.equal(s.nodes[1].owner,-1);}}cases.push({id:'council-loss-uses-three-round-secession',passed:true});
// A surviving town can establish a new command before secession, even after the origin is lost.
s=E.create(load('war-capitalless'));s.nodes[0].owner=1;s.nodes[1].council=false;s=quietStep(s);s=quietStep(s,action(s,'council',a=>a.at===1));assert(!s.done);assert.equal(s.nodes[1].unrest,0);assert(s.nodes[1].council);cases.push({id:'command-can-be-reestablished-without-origin',passed:true});
// Winning is also possible without the origin: an explicit connected multi-council public fixture.
s=E.create(load('war-capitalless'));for(const n of s.nodes){if(n.id!==0&&n.id<s.mission.enemy){n.owner=0;n.units=8;}n.council=false;}s.nodes[0].owner=1;for(const id of s.mission.targets){s.nodes[id].owner=0;s.nodes[id].council=true;s.nodes[id].units=8;}s.nodes[1].council=true;next=quietStep(s);assert(next.done&&next.won&&independent(next));assert.equal(next.nodes[0].owner,1);cases.push({id:'independent-victory-with-origin-in-enemy-hands',passed:true});
// Ordinary capital-based challenges retain their stated defeat condition.
s=E.create(load('war-robot-front'));s.nodes[0].owner=1;next=quietStep(s);assert(next.done&&!next.won);cases.push({id:'other-challenge-origin-loss-unchanged',passed:true});
// Rule text is tied to effects actually present in these models.
const rail=D.find(d=>d.mechanic==='rail'),layers=D.find(d=>d.mechanic==='layers');assert(!rail.rule.includes('前線收入'));assert(rail.rule.includes('地方稅'));assert(!layers.description.includes('切斷補給'));assert(layers.description.includes('援軍'));cases.push({id:'accurate-rail-and-layer-descriptions',passed:true});
// Rail disconnection affects recruitment/reinforcement, while ordinary province tax persists.
s=E.create(load('war-rail-crown'),'normal','skirmish');for(let i=0;i<=2;i++){s.nodes[i].owner=0;s.nodes[i].rail=true;}s.nodes[2].hub=1;const on=quietStep(s);s.nodes[1].rail=false;const off=quietStep(s);assert.equal(on.credits[0],off.credits[0]);assert(on.nodes[2].units>off.nodes[2].units);assert(E.actions(E.view(on)).some(a=>a.type==='recruit'&&a.at===2));assert(!E.actions(E.view(off)).some(a=>a.type==='recruit'&&a.at===2));cases.push({id:'rail-wording-matches-tax-and-military-effects',passed:true});
// A surface base supplies its paired air province; losing it withdraws that reinforcement.
s=E.create(load('war-three-fronts'),'normal','skirmish');s.nodes[2].owner=0;s.nodes[2].units=8;s.nodes[0].owner=0;const supported=quietStep(s);s.nodes[0].owner=1;const unsupported=quietStep(s);assert.equal(supported.nodes[2].units,unsupported.nodes[2].units+1);cases.push({id:'layer-description-matches-surface-air-support',passed:true});
// Transport follows the same ceasefire filter as ordinary movement, including controlled fixtures.
s=E.create(load('war-tidal-continent'));s.fleets[0]=3;s.nodes[2].owner=1;assert(E.actions(E.view(s)).some(a=>a.type==='ferry'&&a.to===2));s.truce=1;assert(!E.actions(E.view(s)).some(a=>['march','ferry'].includes(a.type)&&a.to===2));cases.push({id:'ceasefire-blocks-hostile-ferry-orders',passed:true});
const report={schemaVersion:1,passed:true,scope:'Controlled public-state regressions and legal engine transitions for independent war audit findings; these fixtures are not substituted for campaign proof witnesses.',cases};fs.writeFileSync(path.join(__dirname,'audit-regression-report.json'),JSON.stringify(report,null,2));console.log(`War audit regressions: ${cases.length} PASS`);
