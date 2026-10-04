'use strict';
// Independent contract/oracle tests for the full-match engine; no browser required.
const assert=require('node:assert/strict'),{performance}=require('node:perf_hooks'),fs=require('node:fs'),crypto=require('node:crypto');
const E=require('./match-engine.js'),AI=require('./match-ai.js');
const cardSuit=c=>Math.floor(c/13),cardRank=c=>c%13,points=c=>cardSuit(c)===2?1:c===49?13:0;
const clone=x=>JSON.parse(JSON.stringify(x));
const results={fixtures:0,randomMatches:0,aiMatches:0,rounds:0,moves:0,sampledDeals:0,sampleFailures:0,hiddenStateComparisons:0,savesReplayed:0,invalidInputsRejected:0,moonRounds:0,tiedMatches:0,timing:{}};
const sourceHashes=()=>Object.fromEntries(['match-engine.js','match-ai.js'].map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(__dirname+'/'+file)).digest('hex')]));
results.sourceHashes=sourceHashes();
const times={easy:[],normal:[],hard:[],load:[]};
function fixture(fn){fn();results.fixtures++;}
function oracleLegal(hand,trick,broken,first){
 if(!trick.length){if(first)return hand.filter(c=>c===0);if(!broken&&hand.some(c=>cardSuit(c)!==2))return hand.filter(c=>cardSuit(c)!==2);return hand.slice();}
 const lead=cardSuit(trick[0].card);if(hand.some(c=>cardSuit(c)===lead))return hand.filter(c=>cardSuit(c)===lead);
 if(first&&hand.some(c=>points(c)===0))return hand.filter(c=>points(c)===0);return hand.slice();
}
function oracleWinner(trick){const lead=cardSuit(trick[0].card);return trick.filter(x=>cardSuit(x.card)===lead).sort((a,b)=>cardRank(b.card)-cardRank(a.card))[0].p;}
function verify(s){
 const all=s.hands.flat().concat(s.trick.map(x=>x.card),s.history.flatMap(t=>t.cards.map(x=>x.card)));
 assert.equal(all.length,52);assert.deepEqual(all.slice().sort((a,b)=>a-b),Array.from({length:52},(_,i)=>i));
 const sum=[0,0,0,0];let broken=false,prevWinner;
 for(const t of s.history){assert.equal(t.cards.length,4);assert.equal(t.winner,oracleWinner(t.cards));assert.equal(t.points,t.cards.reduce((n,x)=>n+points(x.card),0));sum[t.winner]+=t.points;for(let i=0;i<4;i++){if(i)assert.equal(t.cards[i].p,(t.cards[0].p+i)%4);if(cardSuit(t.cards[i].card)===2)broken=true;}if(prevWinner!==undefined)assert.equal(t.cards[0].p,prevWinner);prevWinner=t.winner;}
 assert.deepEqual(s.points,sum);if(s.history.length)assert.equal(s.history[0].cards[0].card,0);
 if(s.trick.length){if(prevWinner!==undefined)assert.equal(s.trick[0].p,prevWinner);else assert.equal(s.trick[0].card,0);for(let i=0;i<s.trick.length;i++){assert.equal(s.trick[i].p,(s.trick[0].p+i)%4);if(cardSuit(s.trick[i].card)===2)broken=true;}}
 assert.equal(s.broken,broken);assert.deepEqual(s.totals,s.rounds.reduce((t,r)=>t.map((v,p)=>v+r.scores[p]),[0,0,0,0]));
 if(s.phase==='play')assert.deepEqual(E.legalCards(s),oracleLegal(s.hands[s.turn],s.trick,s.broken,!s.history.length));
 if(s.phase==='roundEnd'||s.phase==='matchEnd'){assert.equal(s.history.length,13);assert.equal(sum.reduce((a,b)=>a+b),26);const moon=sum.indexOf(26);assert.deepEqual(s.roundScores,moon<0?sum:sum.map((_,p)=>p===moon?0:26));assert.equal(s.phase==='matchEnd',s.totals.some(v=>v>=100));}
 if(s.phase==='matchEnd')assert.deepEqual(s.winners,[0,1,2,3].filter(p=>s.totals[p]===Math.min(...s.totals)));
}
function apply(s,a){const prior=JSON.stringify(s),n=E.transition(s,a);assert.equal(JSON.stringify(s),prior);verify(n);results.moves++;return n;}
function rejected(fn){assert.throws(fn);results.invalidInputsRejected++;}
function replay(s){const raw=E.save(s),start=performance.now(),r=E.load(raw);times.load.push(performance.now()-start);assert.deepEqual(r,s);results.savesReplayed++;}
function randomGen(seed){let x=seed>>>0;return()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296;};}
function randomAction(s,r){if(s.phase==='pass'){const p=s.turn,h=s.hands[p].slice();for(let i=h.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[h[i],h[j]]=[h[j],h[i]];}return{type:'pass',p,cards:h.slice(0,3)};}if(s.phase==='play'){const h=oracleLegal(s.hands[s.turn],s.trick,s.broken,!s.history.length);return{type:'play',p:s.turn,card:h[Math.floor(r()*h.length)]};}return{type:s.phase==='trickEnd'?'collect':'next'};}
function hiddenCheck(s,p){const o=E.observe(s,p),alt=clone(s);const others=[0,1,2,3].filter(x=>x!==p),pool=others.flatMap(x=>alt.hands[x]).reverse();let i=0;for(const seat of others)alt.hands[seat]=pool.slice(i,i+=alt.hands[seat].length);alt.seed=(s.seed+719)>>>0;alt.events=[];alt.received=alt.received.map((x,seat)=>seat===p?x:[]);alt.passes=alt.passes.map((x,seat)=>seat===p?x:null);assert.deepEqual(E.observe(alt,p),o);
 for(const l of ['easy','normal','hard'])assert.deepEqual(AI.choose(E.observe(alt,p),l),AI.choose(o,l));
 assert.ok(!('hands' in o)&&!('seed' in o)&&!('received' in o)&&!('passes' in o)&&!('events' in o));
 const before=JSON.stringify(s);o.hand.length=0;o.trick.length=0;o.history.length=0;o.points[0]=999;assert.equal(JSON.stringify(s),before);results.hiddenStateComparisons++;
}
function sampleCheck(s){const o=E.observe(s,s.turn),voids=AI.voids(o);for(let k=0;k<3;k++){const h=AI.sample(o,randomGen(17+k+results.sampledDeals),voids);if(!h){results.sampleFailures++;continue;}assert.deepEqual(h[o.viewer],o.hand);assert.deepEqual(h.map(x=>x.length),o.handCounts);const cards=h.flat().concat(o.trick.map(x=>x.card),o.history.flatMap(t=>t.cards.map(x=>x.card)));assert.deepEqual(cards.sort((a,b)=>a-b),Array.from({length:52},(_,i)=>i));for(let p=0;p<4;p++)if(p!==o.viewer)for(const c of h[p]){assert.ok(!voids[p].has(cardSuit(c)));if(voids.penaltyOnly?.has(p))assert.ok(points(c)>0);}results.sampledDeals++;}}
fixture(()=>{for(const seed of [0,1,2,4294967295]){const s=E.create(seed);verify(s);assert.deepEqual(s,E.create(seed));assert.deepEqual(s.hands.map(x=>x.length),[13,13,13,13]);assert.equal(s.passDirection,1);}assert.notDeepEqual(E.create(0).hands,E.create(1).hands);});
fixture(()=>{assert.deepEqual(E.legalFrom([0,8,30],[],false,true),[0]);assert.deepEqual(E.legalFrom([4,26,49],[{p:1,card:0}],false,true),[4]);assert.deepEqual(E.legalFrom([13,26,49],[{p:1,card:0}],false,true),[13]);assert.deepEqual(E.legalFrom([26,49],[{p:1,card:0}],false,true),[26,49]);assert.deepEqual(E.legalFrom([26,49],[],false,false),[49]);assert.deepEqual(E.legalFrom([26,38],[],false,false),[26,38]);assert.deepEqual(E.legalFrom([26,49],[],true,false),[26,49]);});
fixture(()=>{const r=randomGen(78);for(let i=0;i<20000;i++){const hand=Array.from({length:52},(_,c)=>c).filter(()=>r()<.25);const trick=Array.from({length:Math.floor(r()*4)},(_,p)=>({p,card:Math.floor(r()*52)}));for(const broken of [false,true])for(const first of [false,true])assert.deepEqual(E.legalFrom(hand,trick,broken,first),oracleLegal(hand,trick,broken,first));}});
fixture(()=>{for(let seed=0;seed<1000;seed++){const r=randomGen(seed),t=Array.from({length:4},(_,p)=>({p,card:Math.floor(r()*52)}));assert.equal(E.winner(t),oracleWinner(t));}});
fixture(()=>{const base=E.create(13);base.phase='play';base.turn=0;base.history=[{cards:[{p:0,card:0},{p:1,card:1},{p:2,card:2},{p:3,card:3}],winner:3,points:0}];base.trick=[{p:2,card:13},{p:3,card:14}];base.hands[0]=[49,26];let s=E.transition(base,{type:'play',p:0,card:49});assert.equal(s.broken,false);s=E.transition({...base,hands:[[49,26],[],[],[]]},{type:'play',p:0,card:26});assert.equal(s.broken,true);});
fixture(()=>{for(const direction of [1,3,2]){let s=E.create(direction),hands=clone(s.hands);s.passDirection=direction;const choices=hands.map(h=>h.slice(0,3));for(const p of [3,1,0,2]){s=E.transition(s,{type:'pass',p,cards:choices[p]});if(p!==2)assert.deepEqual(s.hands,hands);}for(let p=0;p<4;p++){const from=(p-direction+4)%4;assert.deepEqual(s.hands[p],hands[p].slice(3).concat(choices[from]).sort((a,b)=>a-b));assert.deepEqual(s.received[p],choices[from]);}assert.equal(s.turn,s.hands.findIndex(h=>h.includes(0)));}});
fixture(()=>{for(const p of [0,1,2,3]){let s=E.create(1);s.phase='trickEnd';s.trick=[{p,card:38},{p:(p+1)%4,card:1},{p:(p+2)%4,card:2},{p:(p+3)%4,card:3}];s.history=Array.from({length:12},()=>({cards:[],winner:0,points:0}));s.points=[0,0,0,0];s.points[p]=25;s.totals=[0,0,0,0];s=E.transition(s,{type:'collect'});assert.equal(s.moon,p);assert.deepEqual(s.roundScores,[0,1,2,3].map(seat=>seat===p?0:26));}});
fixture(()=>{let s=E.create(1);s.phase='trickEnd';s.trick=[{p:3,card:38},{p:0,card:1},{p:1,card:2},{p:2,card:3}];s.history=Array.from({length:12},()=>({cards:[],winner:0,points:0}));s.points=[0,0,0,25];s.totals=[74,0,0,26];s=E.transition(s,{type:'collect'});assert.equal(s.phase,'matchEnd');assert.deepEqual(s.totals,[100,26,26,26]);assert.deepEqual(s.winners,[1,2,3]);rejected(()=>E.transition(s,{type:'next'}));});
fixture(()=>{for(const value of [-1,2**32,0.5,NaN,Infinity,'1',null,undefined])rejected(()=>E.create(value));for(const value of ['HARD','',null,{},7]){if(value!==''&&value!==null)rejected(()=>E.create(1,{difficulty:value}));}let s=E.create(1);for(const a of [null,[],{}, {type:'play',p:0,card:0},{type:'next'},{type:'collect'},{type:'pass',p:4,cards:[0,1,2]},{type:'pass',p:0,cards:[s.hands[0][0],s.hands[0][0],s.hands[0][1]]},{type:'pass',p:0,cards:[-1,55,56]}])rejected(()=>E.transition(s,a));const a={type:'pass',p:0,cards:s.hands[0].slice(0,3)};s=E.transition(s,a);rejected(()=>E.transition(s,a));for(const p of [-1,4,0.5,'0',null])rejected(()=>E.observe(s,p));});
fixture(()=>{const base=JSON.parse(E.save(E.create(1)));for(const raw of ['', 'null','[]','{}','{',JSON.stringify({...base,version:2}),JSON.stringify({...base,seed:-1}),JSON.stringify({...base,events:[{type:'next'}]}),JSON.stringify({...base,events:[{type:'collect',extra:1}]}),JSON.stringify({...base,events:new Array(6501).fill({type:'collect'})}),'x'.repeat(1000001)])rejected(()=>E.load(raw));});
fixture(()=>{results.inferenceRegression=require('./independent-inference-repro.cjs');});
const started=performance.now();
function playMatch(seed,level){let s=E.create(seed,{difficulty:level||'normal'}),r=randomGen(seed+7413),steps=0;verify(s);replay(s);while(s.phase!=='matchEnd'){
 if(s.phase==='pass'&&s.passes.every(x=>x===null))assert.equal(s.passDirection,[1,3,2,0][(s.round-1)%4]);
 if((s.phase==='play'||s.phase==='pass')&&steps%113===0)hiddenCheck(s,s.turn);
 if(s.phase==='play'&&steps%47===0)sampleCheck(s);
 let a;if(level&&(s.phase==='play'||s.phase==='pass')){const o=E.observe(s,s.turn),before=JSON.stringify(o),at=performance.now();a=AI.choose(o,level);times[level].push(performance.now()-at);assert.equal(JSON.stringify(o),before);}else a=randomAction(s,r);
 s=apply(s,a);if(s.phase==='roundEnd'||s.phase==='matchEnd'){results.rounds++;if(s.moon!==null)results.moonRounds++;if(s.round===1)replay(s);}if(steps%149===0)replay(s);assert.ok(++steps<1200,'Match must terminate within 16 rounds');
 }
 replay(s);if(s.winners.length>1)results.tiedMatches++;if(level)results.aiMatches++;else results.randomMatches++;
}
for(let i=0;i<150;i++)playMatch((Math.imul(i,2654435761)+12)>>>0,null);
for(const level of ['easy','normal','hard'])for(let i=0;i<8;i++)playMatch(517+i*7919,level);
for(const [level,values] of Object.entries(times)){const ordered=values.sort((a,b)=>a-b);results.timing[level]={calls:ordered.length,p50ms:+ordered[Math.floor(ordered.length*.5)].toFixed(3),p95ms:+ordered[Math.floor(ordered.length*.95)].toFixed(3),p99ms:+ordered[Math.floor(ordered.length*.99)].toFixed(3),maxms:+ordered.at(-1).toFixed(3)};}
results.elapsedSeconds=+(performance.now()-started).toFixed(0)/1000;
assert.deepEqual(sourceHashes(),results.sourceHashes,'Engine/AI sources changed during review');
results.reviewedAt=new Date().toISOString();
fs.writeFileSync(__dirname+'/independent-review-report.json',JSON.stringify(results,null,2)+'\n');console.log(JSON.stringify(results,null,2));
