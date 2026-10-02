/* Original implementation. UMD module: usable in the page, worker, and Node tests. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.Quoridor=api;})(typeof self!=='undefined'?self:this,function(){
'use strict';
const N=9,DIRS=[[-1,0],[1,0],[0,-1],[0,1]],inside=(r,c)=>r>=0&&r<9&&c>=0&&c<9;
function initial(){return {pawns:[76,4],walls:[],remaining:[10,10],turn:0,winner:null,ply:0};}
const rc=i=>[Math.floor(i/9),i%9];
function blocked(s,a,b){const [r,c]=rc(a),[y,x]=rc(b);if(Math.abs(r-y)+Math.abs(c-x)!==1)return true;if(r!==y){const k=Math.min(r,y);return s.walls.some(w=>w.o==='h'&&w.r===k&&(w.c===c||w.c+1===c));}const k=Math.min(c,x);return s.walls.some(w=>w.o==='v'&&w.c===k&&(w.r===r||w.r+1===r));}
function neighbours(s,i){const [r,c]=rc(i),out=[];for(const [dr,dc] of DIRS){let y=r+dr,x=c+dc,j=y*9+x;if(inside(y,x)&&!blocked(s,i,j))out.push(j);}return out;}
function path(s,p,from=s.pawns[p]){const goal=p===0?0:8,q=[from],prev=new Int16Array(81).fill(-2);prev[from]=-1;for(let k=0;k<q.length;k++){const i=q[k];if(Math.floor(i/9)===goal){const out=[];for(let x=i;x!==-1;x=prev[x])out.push(x);return out.reverse();}for(const j of neighbours(s,i))if(prev[j]===-2){prev[j]=i;q.push(j);}}return [];}
function moves(s,p=s.turn){if(s.winner!==null)return [];const a=s.pawns[p],b=s.pawns[1-p],[r,c]=rc(a),out=new Set();for(const [dr,dc]of DIRS){const y=r+dr,x=c+dc,j=y*9+x;if(!inside(y,x)||blocked(s,a,j))continue;if(j!==b){out.add(j);continue;}const yy=y+dr,xx=x+dc,k=yy*9+xx;if(inside(yy,xx)&&!blocked(s,j,k))out.add(k);else for(const [er,ec]of [[dc,dr],[-dc,-dr]]){const ty=y+er,tx=x+ec,t=ty*9+tx;if(inside(ty,tx)&&!blocked(s,j,t))out.add(t);}}return [...out];}
function wallOK(s,w,p=s.turn){if(s.winner!==null||!s.remaining[p]||!w||!['h','v'].includes(w.o)||!Number.isInteger(w.r)||!Number.isInteger(w.c)||w.r<0||w.r>7||w.c<0||w.c>7)return false;for(const a of s.walls){if(a.r===w.r&&a.c===w.c)return false;if(a.o===w.o&&((w.o==='h'&&a.r===w.r&&Math.abs(a.c-w.c)<2)||(w.o==='v'&&a.c===w.c&&Math.abs(a.r-w.r)<2)))return false;}const t={...s,walls:[...s.walls,{o:w.o,r:w.r,c:w.c}]};return path(t,0).length>0&&path(t,1).length>0;}
function legal(s,a){return !!a&&(a.type==='move'?Number.isInteger(a.to)&&moves(s).includes(a.to):a.type==='wall'&&wallOK(s,a));}
function apply(s,a){if(!legal(s,a))throw Error('不合法的動作');const t={...s,pawns:[...s.pawns],walls:s.walls.map(w=>({...w})),remaining:[...s.remaining],turn:1-s.turn,ply:s.ply+1};if(a.type==='move'){t.pawns[s.turn]=a.to;if(Math.floor(a.to/9)===(s.turn===0?0:8))t.winner=s.turn;}else{t.walls.push({o:a.o,r:a.r,c:a.c});t.remaining[s.turn]--;}return t;}
function allWalls(s){const out=[];if(!s.remaining[s.turn]||s.winner!==null)return out;for(let r=0;r<8;r++)for(let c=0;c<8;c++)for(const o of ['h','v']){const a={type:'wall',o,r,c};if(wallOK(s,a))out.push(a);}return out;}
function distance(s,p){const a=path(s,p);return a.length?a.length-1:999;}
function race(s,p){let best=distance(s,p);for(const to of moves(s,p))best=Math.min(best,1+distance(s,p,to));return best;}
function score(s,p){if(s.winner!==null)return s.winner===p?10000:-10000;const mine=distance(s,p),other=distance(s,1-p);return (other-mine)*16+(s.remaining[p]-s.remaining[1-p])*1.7+(s.turn===p?3:-3);}
function rng(seed){let n=(seed>>>0)||1;return()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};}
function ai(s,level='normal',seed=1){if(s.winner!==null)return null;const random=rng(seed),me=s.turn,walk=moves(s).map(to=>({type:'move',to}));for(const a of walk)if(apply(s,a).winner===me)return a;
// Every difficulty prevents an opponent's immediate finish when a legal wall can do so.
const threat=moves(s,1-me).some(i=>Math.floor(i/9)===(me===0?8:0));let actions=walk,ranked=[];if(s.remaining[me]){const walls=allWalls(s);for(const a of walls){const t=apply(s,a),op=distance(t,1-me)-distance(s,1-me),own=distance(t,me)-distance(s,me);if(threat||op>0)ranked.push({a,v:op*18-own*19-2,t});}ranked.sort((a,b)=>b.v-a.v);actions=walk.concat(ranked.slice(0,threat?ranked.length:level==='hard'?14:level==='normal'?8:4).map(x=>x.a));}
if(threat){const safe=actions.filter(a=>{const t=apply(s,a);return !moves(t).some(i=>Math.floor(i/9)===(t.turn===0?0:8));});if(safe.length)actions=safe;}
if(level==='easy'){const good=actions.map(a=>({a,v:score(apply(s,a),me)})).sort((a,b)=>b.v-a.v);return good[Math.floor(random()*Math.min(3,good.length))].a;}
const deadline=Date.now()+(level==='hard'?900:300),limit=level==='hard'?16000:3000;let nodes=0;
function candidates(t){const ws=moves(t).map(to=>({type:'move',to}));if(t.remaining[t.turn]){const before=distance(t,1-t.turn),own=distance(t,t.turn),opts=[];for(const a of allWalls(t)){const u=apply(t,a),gain=distance(u,1-t.turn)-before,cost=distance(u,t.turn)-own;if(gain>0)opts.push({a,v:gain*18-cost*19-2});}opts.sort((a,b)=>b.v-a.v);ws.push(...opts.slice(0,4).map(x=>x.a));}return ws;}
function search(t,d,lo,hi){if(t.winner!==null||!d||++nodes>limit||Date.now()>deadline)return score(t,me);const max=t.turn===me;let best=max?-Infinity:Infinity;for(const a of candidates(t)){const v=search(apply(t,a),d-1,lo,hi);best=max?Math.max(best,v):Math.min(best,v);if(max)lo=Math.max(lo,best);else hi=Math.min(hi,best);if(lo>=hi||Date.now()>deadline)break;}return best;}
let result=actions[0],best=-Infinity;actions.sort((a,b)=>score(apply(s,b),me)-score(apply(s,a),me));for(const a of actions){const t=apply(s,a);let v=level==='normal'?search(t,1,-Infinity,Infinity):search(t,2,-Infinity,Infinity);v+=random()*.05;if(v>best){best=v;result=a;}}return result;}
return {initial,blocked,neighbours,path,moves,wallOK,legal,apply,allWalls,distance,ai,score};
});
