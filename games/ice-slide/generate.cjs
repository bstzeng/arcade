// Deterministic level factory. Node 18+; no packages. BFS witnesses are generated here.
'use strict';
const fs=require('node:fs'),path=require('node:path');
let seed=0x1ce2026;function rnd(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296;}function pick(a){return a[Math.floor(rnd()*a.length)];}
const D=[[0,-1],[1,0],[0,1],[-1,0]];
function symmetries(n){return Array.from({length:8},(_,t)=>p=>{let x=p%n,y=p/n|0;if(t>=4)x=n-1-x;for(let i=0;i<t%4;i++)[x,y]=[n-1-y,x];return y*n+x;});}
function topoKey(n,walls){return Math.min(n,n)+':'+symmetries(n).map(f=>walls.map(f).sort((a,b)=>a-b).join(',')).sort()[0];}
function puzzleKey(l){return symmetries(l.size).map(f=>[l.size,l.walls.map(f).sort((a,b)=>a-b).join(','),f(l.goal),f(l.start[l.target]),l.start.filter((_,i)=>i!==l.target).map(f).sort((a,b)=>a-b).join(',')].join('|')).sort()[0];}
function connected(n,walls){const floors=Array.from({length:n*n},(_,i)=>i).filter(p=>!walls.has(p));const seen=new Set([floors[0]]),q=[floors[0]];for(const p of q)for(const [dx,dy]of D){const x=p%n+dx,y=(p/n|0)+dy,v=y*n+x;if(x>=0&&x<n&&y>=0&&y<n&&!walls.has(v)&&!seen.has(v)){seen.add(v);q.push(v);}}return seen.size===floors.length;}
function generateBoard(n,variant){let walls=new Set();const count=4+Math.floor(rnd()*(n+1));for(let i=0;i<count;i++){let x=Math.floor(rnd()*n),y=Math.floor(rnd()*n);walls.add(y*n+x);if(variant===1&&x+1<n&&rnd()<.45)walls.add(y*n+x+1);if(variant===2&&y+1<n&&rnd()<.45)walls.add((y+1)*n+x);}
if(!connected(n,walls))return null;let floors=Array.from({length:n*n},(_,i)=>i).filter(p=>!walls.has(p));if(floors.length<20)return null;return {walls:[...walls].sort((a,b)=>a-b),floors};}
function bfs(n,wallList,start,target){
const walls=new Set(wallList),base=n*n,pack=s=>(s[0]*base+s[1])*base+s[2];
const queue=[start],parents=[-1],actions=[null],depth=[0],seen=new Map([[pack(start),0]]),first=new Map();
for(let head=0;head<queue.length;head++){
 const s=queue[head],g=s[target];if(!first.has(g))first.set(g,head);
 for(let r=0;r<3;r++)for(let d=0;d<4;d++){
  let p=s[r];const [dx,dy]=D[d];while(true){let x=p%n+dx,y=(p/n|0)+dy,v=y*n+x;if(x<0||x>=n||y<0||y>=n||walls.has(v)||s.some((a,j)=>j!==r&&a===v))break;p=v;}if(p===s[r])continue;let t=s.slice();t[r]=p;const k=pack(t);if(seen.has(k))continue;seen.set(k,queue.length);queue.push(t);parents.push(head);actions.push([r,d]);depth.push(depth[head]+1);
 }
}
function witness(v){const out=[];while(parents[v]>=0){out.push(actions[v]);v=parents[v];}return out.reverse();}
return {first,queue,depth,witness,visited:queue.length};
}
function goalOnly(n,wallList,start,target,goal){const walls=new Set(wallList),q=[start[target]],seen=new Set(q);for(const p0 of q){if(p0===goal)return true;for(const [dx,dy]of D){let p=p0;while(true){let x=p%n+dx,y=(p/n|0)+dy,v=y*n+x;if(x<0||x>=n||y<0||y>=n||walls.has(v)||start.some((a,j)=>j!==target&&a===v))break;p=v;}if(!seen.has(p)){seen.add(p);q.push(p);}}}return false;}
const names=['霜光入口','薄冰轉角','晨曦冰河','晶石迴廊','浮冰渡口','藍雪山谷','星霜迷宮','極地交會','鏡湖之心','冰冠高塔'];
const buckets=Array.from({length:10},()=>[]),usedTopos=new Set();let attempts=0;
// Five puzzles per exact distance band; harder groups have both larger boards and deeper routes.
while(buckets.some(x=>x.length<5)){
 attempts++;const band=buckets.findIndex(x=>x.length<5),n=band<3?6:band<7?7:8;
 const b=generateBoard(n,attempts%3);if(!b)continue;const tk=topoKey(n,b.walls);if(usedTopos.has(tk))continue;
 let pool=b.floors.slice(),start=[];for(let i=0;i<3;i++){const p=pick(pool);start.push(p);pool=pool.filter(x=>x!==p);}const target=attempts%3;
 const result=bfs(n,b.walls,start,target),min=band+4,max=min+1;
 const candidates=[...result.first].filter(([g,i])=>result.depth[i]>=min&&result.depth[i]<=max&&g%n>0&&g%n<n-1&&(g/n|0)>0&&(g/n|0)<n-1&&D.every(([dx,dy])=>!b.walls.includes(g+dy*n+dx))&&!goalOnly(n,b.walls,start,target,g));
 if(!candidates.length){if(attempts%30===0)process.stdout.write(`attempt ${attempts}, band ${band}, reachable ${result.visited}\n`);continue;}
 const [goal,v]=pick(candidates);const solution=result.witness(v);if(new Set(solution.map(a=>a[0])).size<2)continue;
 const level={id:0,name:names[band],size:n,walls:b.walls,start,target,goal,solution,difficulty:band+1,proof:{method:'breadth-first-search',distance:solution.length,reachableStates:result.visited,goalOnlySolvable:false}};
 level.canonical=puzzleKey(level);usedTopos.add(tk);buckets[band].push(level);process.stdout.write(`accepted ${buckets.reduce((a,b)=>a+b.length,0)}: size${n} d${solution.length}, states${result.visited}, attempt${attempts}\n`);
 if(attempts>4000)throw Error('Factory sampling bound exceeded');
}
const levels=buckets.flatMap(group=>group.sort((a,b)=>a.solution.length-b.solution.length));levels.forEach((l,i)=>{l.id=i+1;l.name+=' '+((i%5)+1);});
fs.writeFileSync(path.join(__dirname,'levels.json'),JSON.stringify(levels,null,2)+'\n');
fs.writeFileSync(path.join(__dirname,'levels.js'),'/* Reproduce with node generate.cjs. */\nwindow.ICE_LEVELS='+JSON.stringify(levels)+';\n');
console.log(`Saved ${levels.length} levels, ${attempts} attempts. Seed 0x1ce2026.`);
