(function(root){'use strict';const U=root.CompetitiveUtil||(typeof require==='function'?require('../competitive-common/core.js'):null),W=10,N=100;
function initial(){const b=Array(N).fill(0);for(const i of[3,6,30,39])b[i]=-1;for(const i of[60,69,93,96])b[i]=1;return{board:b,turn:1,ply:0};}
function mobility(s,p){let n=0;for(let i=0;i<N;i++)if(s.board[i]===p)n+=U.rays(s.board,i,W).length;return n;}
function legal(s){const out=[],b=s.board.slice();for(let from=0;from<N;from++)if(b[from]===s.turn)for(const to of U.rays(b,from,W)){b[from]=0;b[to]=s.turn;for(const arrow of U.rays(b,to,W))out.push({from,to,arrow});b[to]=0;b[from]=s.turn;}return out;}
function apply(s,m){const b=s.board.slice();b[m.from]=0;b[m.to]=s.turn;b[m.arrow]=2;return{board:b,turn:-s.turn,ply:s.ply+1};}
function outcome(s){if(!mobility(s,s.turn))return{winner:-s.turn,reason:'無皇后可移動射箭'};return null;}
function territory(s,p){const dist=side=>{const d=Array(N).fill(100),q=[];for(let i=0;i<N;i++)if(s.board[i]===side){d[i]=0;q.push(i);}for(let k=0;k<q.length;k++)for(const j of U.neighbors(q[k],W,W,U.dirs8))if(!s.board[j]&&d[j]>d[q[k]]+1){d[j]=d[q[k]]+1;q.push(j);}return d;};const a=dist(p),b=dist(-p);return a.reduce((n,v,i)=>n+(s.board[i]?0:Math.sign(b[i]-v)),0);}
const e=U.attach('amazons',{width:W,height:W,initial,legal,apply,outcome,mobility,territory,evaluate:(s,p)=>territory(s,p)*4+(mobility(s,p)-mobility(s,-p))/4,labels:{'1':'♕','-1':'♛','2':'✦'},names:{'1':'白方','-1':'黑方'}});if(typeof module!=='undefined')module.exports=e;
})(typeof globalThis!=='undefined'?globalThis:this);
