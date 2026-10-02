/* Pure, shared rules engine. No UI, randomness, search, or witness exceptions. */
(function(root){
'use strict';
const copy=x=>JSON.parse(JSON.stringify(x));
function checkDeal(d){
 if(!d||d.ranks?.length!==104||d.tableau?.length!==10||d.stock?.length!==50)throw Error('Invalid deck shape');
 const ids=d.tableau.flat().concat(d.stock),seen=new Set(ids);
 if(ids.length!==104||seen.size!==104||ids.some(i=>!Number.isInteger(i)||i<0||i>103))throw Error('Invalid physical cards');
 for(let r=1;r<=13;r++)if(d.ranks.filter(v=>v===r).length!==8)throw Error('Invalid rank distribution');
 d.tableau.forEach((c,i)=>{if(c.length!==(i<4?6:5))throw Error('Invalid tableau size');});
}
function start(d){checkDeal(d);return {columns:d.tableau.map(c=>c.map((id,i)=>({id,up:i===c.length-1}))),stock:d.stock.slice(),completed:[],moves:0};}
function movable(s,c,i,ranks){
 if(!Number.isInteger(c)||c<0||c>9||!Number.isInteger(i))return false;
 const col=s.columns[c];if(i<0||i>=col.length)return false;
 for(let j=i;j<col.length;j++)if(!col[j].up||(j>i&&ranks[col[j-1].id]!==ranks[col[j].id]+1))return false;
 return true;
}
function canMove(s,a,ranks){
 if(!a||a.type!=='move'||!Number.isInteger(a.to)||a.to<0||a.to>9||a.from===a.to||!movable(s,a.from,a.index,ranks))return false;
 const dest=s.columns[a.to],card=s.columns[a.from][a.index];
 return !dest.length||(dest.at(-1).up&&ranks[dest.at(-1).id]===ranks[card.id]+1);
}
function canDeal(s){return s.stock.length>=10&&s.columns.every(c=>c.length>0);}
function settle(s,ranks){
 let changed=true;
 while(changed){changed=false;
  for(const c of s.columns){
   if(c.length&&!c.at(-1).up){c.at(-1).up=true;changed=true;}
   if(c.length>=13){const run=c.slice(-13);if(run.every((v,i)=>v.up&&ranks[v.id]===13-i)){s.completed.push(c.splice(-13).map(v=>v.id));changed=true;}}
  }
 }
}
function step(s,a,ranks){
 if(!a||!['move','deal'].includes(a.type))throw Error('Unknown action');
 if(a.type==='move'&&!canMove(s,a,ranks))throw Error('Illegal move');
 if(a.type==='deal'&&!canDeal(s))throw Error('Cannot deal while a column is empty or stock is exhausted');
 const n=copy(s);
 if(a.type==='move')n.columns[a.to].push(...n.columns[a.from].splice(a.index));
 else for(let c=0;c<10;c++)n.columns[c].push({id:n.stock.shift(),up:true});
 settle(n,ranks);n.moves++;return n;
}
function legal(s,ranks){const out=[];for(let c=0;c<10;c++)for(let i=0;i<s.columns[c].length;i++)if(movable(s,c,i,ranks))for(let t=0;t<10;t++){const a={type:'move',from:c,index:i,to:t};if(canMove(s,a,ranks)&&!(i===0&&!s.columns[t].length))out.push(a);}return out;}
function key(s){return JSON.stringify([s.columns,s.stock,s.completed]);}
function won(s){return s.completed.length===8&&s.stock.length===0&&s.columns.every(c=>!c.length);}
function replay(d,actions){let s=start(d);const history=[];for(const a of actions){history.push(s);s=step(s,a,d.ranks);}return {state:s,history};}
const api={start,step,movable,canMove,canDeal,legal,key,won,replay,checkDeal};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.SpiderEngine=api;
})(typeof globalThis!=='undefined'?globalThis:this);
