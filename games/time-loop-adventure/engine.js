(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f(require('../management-common/model.js'));else(r.ManagementGames||={})['time-loop-adventure']={...(r.ManagementGames||{})['time-loop-adventure'],engine:f(r.ManagementModel)};})(globalThis,function(M){'use strict';const {need,make}=M;
function advance(l,s,n){s.time+=n;if(s.time>=l.flood&&!s.safe)s.flooded=true;if(s.time>l.length)s.failed=true;}
return make({start:l=>({loop:1,time:0,node:0,knowledge:[],gear:false,ore:false,beacon:false,safe:false,flooded:false,won:false,failed:false,note:'記憶會保留，物品與事件每天重置。先找出晚間出現的線索。'}),
 status:(l,s)=>s.failed?'lost':s.won?'won':'playing',
 step(l,s,a){
 if(a.type==='move'){const e=l.edges[a.edge];need(e&&(e.a===s.node||e.b===s.node),'道路不相連。');const to=e.a===s.node?e.b:e.a;need(to!==l.observatory||(s.safe&&s.time>=l.flood),'橋梁只會在修好水閘並度過洪水後通行。');s.node=to;advance(l,s,e.cost);s.note='抵達'+l.nodes[to]+'。';}
 else if(a.type==='wait'){advance(l,s,1);s.note='時間前進一格。';}
 else if(a.type==='read'){need(s.node===l.archive&&s.time>=l.archiveTime&&!s.knowledge.includes('code'),'晚間檔案尚未顯現，或已記住。');s.knowledge.push('code');advance(l,s,1);s.note='記住了工坊的門鎖規律；即使重置仍保留。';}
 else if(a.type==='unlock'){need(s.node===l.workshop&&s.knowledge.includes('code')&&s.time<=l.workshopClose&&!s.gear,'需要門鎖記憶，且必須在工坊關閉前取得齒輪。');s.gear=true;advance(l,s,1);s.note='取得今天的水閘齒輪。';}
 else if(a.type==='repair'){need(s.node===l.pump&&s.gear&&!s.safe&&s.time<l.flood,'需要齒輪，並在洪水發生前修好水閘。');s.gear=false;s.safe=true;advance(l,s,1);s.note='水閘修復；本日洪水不再沖毀橋梁。';}
 else if(a.type==='study'){need(s.node===l.observatory&&s.time>=l.starTime&&s.safe&&!s.knowledge.includes('formula'),'需要安全通橋，等星象出現才能研究。');s.knowledge.push('formula');advance(l,s,1);s.note='記住星光信標配方。';}
 else if(a.type==='lens'){need(s.node===l.garden&&s.knowledge.includes('formula')&&s.time>=l.lensTime&&!s.knowledge.includes('lens'),'先理解配方，晚間才能辨識鏡片排列。');s.knowledge.push('lens');advance(l,s,1);s.note='記住鏡片排列，下一輪可製作高階信標。';}
 else if(a.type==='mine'){need(s.node===l.mine&&!s.ore&&!s.beacon,'此處才能採集一次信標礦石。');s.ore=true;advance(l,s,1);s.note='取得一份礦石。';}
 else if(a.type==='craft'){need(s.node===l.workshop&&s.ore&&!s.beacon&&s.knowledge.includes('code')&&(!l.needFormula||s.knowledge.includes('formula'))&&(!l.needLens||s.knowledge.includes('lens')),'需要礦石與本關要求的完整記憶。');s.ore=false;s.beacon=true;advance(l,s,2);s.note='製成今日信標。';}
 else if(a.type==='activate'){need(s.node===l.tower&&s.beacon&&s.safe&&s.time>=l.flood&&s.time<=l.deadline,'需要信標、安全的村莊，且在洪水後、最後期限前啟動。');s.beacon=false;s.won=true;s.note='信標啟動，時間循環解除！';}
 else if(a.type==='reset'){need(s.loop<l.maxLoops,'記憶承受不住更多循環。');s.loop++;s.time=0;s.node=0;s.gear=false;s.ore=false;s.beacon=false;s.safe=false;s.flooded=false;s.note='新的一日開始，只留下已發現的記憶。';}
 else throw Error('未知循環動作。');
 },actions(l,s){return [...l.edges.map((e,edge)=>({type:'move',edge})),...['wait','read','unlock','repair','study','lens','mine','craft','activate','reset'].map(type=>({type}))];},
 describe:(l,a)=>a.type==='move'?'前往 '+l.nodes[l.edges[a.edge].a]+' ↔ '+l.nodes[l.edges[a.edge].b]:({wait:'等待一格',read:'讀取晚間檔案',unlock:'用記憶開鎖／取齒輪',repair:'搶修水閘',study:'研究星象',lens:'辨識鏡片',mine:'採集礦石',craft:'製作信標',activate:'啟動信標',reset:'重置今天'})[a.type],
 tip:(l,s)=>!s.knowledge.includes('code')?'工坊提早關門，檔案卻在晚間出現。先取得記憶，再主動重置一天。':!s.safe?'本輪先到工坊取齒輪，在洪水前修好水閘；記憶不等於每天都已完成修理。':l.needFormula&&!s.knowledge.includes('formula')?'洪水過後才能進入天文台。星象配方也是可跨日保留的記憶。':'確認所有必要記憶後，安排最後一輪的水閘、礦石、工坊與信標塔行程。'
});});
