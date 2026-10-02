'use strict';
const fs=require('node:fs'),path=require('node:path'),E=require('./engine.js');
const counts=[5,7,8,9,10,11],levels=[];let seed=0x4a110150;const rng=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296;};
for(let n=3;n<=8;n++){const target=2,d=E.distances(n,target),count=counts[n-3],used=new Set(),selected=[],max=2**n-1;
 // Reserve the classic full-tower arrangement as each chapter's final challenge.
 const standard=Array(n).fill(0);used.add(E.canonical(standard));
 const candidates=[];for(let code=0;code<3**n;code++){const state=E.decode(code,n),canon=E.canonical(state);if(d[code]>0&&new Set(state).size>1)candidates.push({state,canon,distance:d[code],jitter:rng()});}
 for(let j=0;j<count-1;j++){const desired=n===3?[2,3,5,6][j]:Math.round(max*(.28+.65*j/(count-2)));const eligible=candidates.filter(c=>!used.has(c.canon));eligible.sort((a,b)=>Math.abs(a.distance-desired)-Math.abs(b.distance-desired)||a.jitter-b.jitter);const best=eligible[0];if(!best)throw Error('No unique layout');used.add(best.canon);selected.push(best);}
 selected.push({state:standard,canon:E.canonical(standard),distance:max});selected.sort((a,b)=>a.distance-b.distance);
 for(const c of selected){const standardStart=new Set(c.state).size===1,l={id:levels.length+1,discs:n,target,start:c.state,solution:[],optimal:c.distance,layout:standardStart?'classic':'challenge',tier:n<5?'起步':n<7?'推演':'深思',name:standardStart?`${n} 盤 · 經典起塔`:`${n} 盤 · 布局挑戰`,proof:'complete-state-space-bfs'};l.solution=E.solve(l,l.start);E.proof(l);if(l.solution.length!==l.optimal)throw Error('distance mismatch');levels.push(l);}}
fs.writeFileSync(path.join(__dirname,'levels.json'),JSON.stringify(levels,null,2)+'\n');fs.writeFileSync(path.join(__dirname,'levels.js'),'window.HanoiLevels='+JSON.stringify(levels)+';\n');console.log(`Generated ${levels.length} non-peg-relabel-equivalent Hanoi levels; exact distances ${Math.min(...levels.map(l=>l.optimal))}–${Math.max(...levels.map(l=>l.optimal))}`);
