/* Pure engine used by both the page and automated gameplay tests. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.IceCore=api;})(typeof self!=='undefined'?self:globalThis,function(){
'use strict';
const DIRS=[{dx:0,dy:-1,key:'U',label:'上',arrow:'↑'},{dx:1,dy:0,key:'R',label:'右',arrow:'→'},{dx:0,dy:1,key:'D',label:'下',arrow:'↓'},{dx:-1,dy:0,key:'L',label:'左',arrow:'←'}];
function board(level){const walls=new Set(level.walls);return {size:level.size,walls,goal:level.goal,target:level.target};}
function validState(b,state){return Array.isArray(state)&&state.length===3&&new Set(state).size===3&&state.every(p=>Number.isInteger(p)&&p>=0&&p<b.size*b.size&&!b.walls.has(p));}
function slide(b,state,robot,dir){
 if(!Number.isInteger(robot)||robot<0||robot>=state.length||!Number.isInteger(dir)||!DIRS[dir])return null;
 const {dx,dy}=DIRS[dir],n=b.size;let p=state[robot],q=p;
 while(true){const x=p%n+dx,y=Math.floor(p/n)+dy;if(x<0||y<0||x>=n||y>=n)break;const next=y*n+x;if(b.walls.has(next)||state.some((v,i)=>i!==robot&&v===next))break;p=next;}
 if(p===q)return null;const next=state.slice();next[robot]=p;return next;
}
const key=state=>state.join(',');
const won=(b,state)=>state[b.target]===b.goal;
function search(b,start,{limit=300000}={}){
 if(!validState(b,start))return {status:'invalid',moves:[],visited:0};
 if(won(b,start))return {status:'solved',moves:[],visited:1};
 const queue=[start.slice()],parents=[-1],moves=[null],seen=new Map([[key(start),0]]);
 for(let head=0;head<queue.length;head++){
  const state=queue[head];
  for(let r=0;r<3;r++)for(let d=0;d<4;d++){
   const next=slide(b,state,r,d);if(!next)continue;const k=key(next);if(seen.has(k))continue;
   const index=queue.length;seen.set(k,index);queue.push(next);parents.push(head);moves.push([r,d]);
   if(won(b,next)){const path=[];for(let v=index;parents[v]>=0;v=parents[v])path.push(moves[v]);return {status:'solved',moves:path.reverse(),visited:queue.length};}
   if(queue.length>=limit)return {status:'limit',moves:[],visited:queue.length};
  }
 }
 return {status:'impossible',moves:[],visited:queue.length};
}
class Session {
 constructor(level){this.load(level);}
 load(level){this.level=level;this.b=board(level);if(!validState(this.b,level.start))throw Error('Invalid level');this.restart();}
 restart(){this.positions=this.level.start.slice();this.history=[];this.assisted=false;this.revision=(this.revision||0)+1;return this.positions;}
 move(robot,dir){if(this.won)return false;const next=slide(this.b,this.positions,robot,dir);if(!next)return false;this.history.push(this.positions.slice());this.positions=next;this.revision++;return true;}
 undo(){if(!this.history.length)return false;this.positions=this.history.pop();this.revision++;return true;}
 get won(){return won(this.b,this.positions);}
 get count(){return this.history.length;}
 hint(options){return search(this.b,this.positions,options);}
}
function parseProgress(raw,count){let x;try{x=JSON.parse(raw||'{}');}catch{return {version:1,last:0,records:{}};}const out={version:1,last:0,records:{}};if(!x||typeof x!=='object'||x.version!==1)return out;if(Number.isInteger(x.last)&&x.last>=0&&x.last<count)out.last=x.last;if(x.records&&typeof x.records==='object')for(const [id,r] of Object.entries(x.records)){if(!/^\d+$/.test(id)||+id<1||+id>count||!r||typeof r!=='object')continue;const o={};if(r.cleared===true)o.cleared=true;if(Number.isInteger(r.best)&&r.best>=1&&r.best<=100000)o.best=r.best;if(Object.keys(o).length)out.records[id]=o;}return out;}
return {DIRS,board,slide,key,won,validState,search,Session,parseProgress};
});
