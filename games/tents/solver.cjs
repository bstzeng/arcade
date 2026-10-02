'use strict';
// Enumerates tent placements once each. Different tree matchings are NOT different solutions.
function solve(p,limit=2){const n=p.size,tree=new Set(p.trees),adj=Array.from({length:n*n},()=>[]);for(let i=0;i<n*n;i++)if(!tree.has(i))for(const t of p.trees)if(Math.abs(Math.floor(i/n)-Math.floor(t/n))+Math.abs(i%n-t%n)===1)adj[i].push(t);
const options=[];for(let r=0;r<n;r++){const row=[];for(let m=0;m<(1<<n);m++){if(m&(m<<1))continue;let count=0,ok=true;for(let c=0;c<n;c++)if(m&(1<<c)){count++;if(!adj[r*n+c].length)ok=false;}if(ok&&count===p.rows[r])row.push(m);}options.push(row);}
const maxFuture=Array.from({length:n+1},()=>Array(n).fill(0));for(let r=n-1;r>=0;r--)for(let c=0;c<n;c++)maxFuture[r][c]=maxFuture[r+1][c]+Number(options[r].some(m=>m&(1<<c)));
function matchable(ts){const owner=new Map();function add(t,seen){for(const tr of adj[t])if(!seen.has(tr)){seen.add(tr);if(!owner.has(tr)||add(owner.get(tr),seen)){owner.set(tr,t);return true;}}return false;}return ts.every(t=>add(t,new Set()));}
let nodes=0;const solutions=[],cols=Array(n).fill(0),ts=[];function visit(r,prev){nodes++;if(r===n){if(cols.every((v,c)=>v===p.cols[c])&&ts.length===p.trees.length&&matchable(ts))solutions.push(ts.slice());return;}for(const m of options[r]){if(m&(prev|(prev<<1)|(prev>>1)))continue;const added=[];let ok=true;for(let c=0;c<n;c++){if(m&(1<<c)){cols[c]++;added.push(r*n+c);}if(cols[c]>p.cols[c]||cols[c]+maxFuture[r+1][c]<p.cols[c])ok=false;}ts.push(...added);if(ok&&matchable(ts))visit(r+1,m);ts.length-=added.length;for(const i of added)cols[i%n]--;if(solutions.length>=limit)return;}}
visit(0,0);return{count:solutions.length,solutions,nodes,rowOptions:options.reduce((s,r)=>s+r.length,0)};}
module.exports={solve};
