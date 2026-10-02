/* Xiangqi rules, pure and dependency-free. Red positive; black negative. */
(function(root){'use strict';
const K=1,A=2,E=3,H=4,R=5,C=6,P=7, W=9, N=90;
const side=p=>Math.sign(p), xy=i=>[i%9,Math.floor(i/9)], inside=(x,y)=>x>=0&&x<9&&y>=0&&y<10;
const palace=(x,y,s)=>x>=3&&x<=5&&(s===1?y>=7&&y<=9:y>=0&&y<=2);
function key(s){return s.turn+':'+s.board.join(',');}
function initial(){const b=Array(N).fill(0),back=[R,H,E,A,K,A,E,H,R];for(let x=0;x<9;x++){b[x]=-back[x];b[81+x]=back[x];}for(const x of [1,7]){b[18+x]=-C;b[63+x]=C;}for(const x of [0,2,4,6,8]){b[27+x]=-P;b[54+x]=P;}const s={board:b,turn:1,quiet:0,ply:0,keys:[]};s.keys=[key(s)];return s;}
function pseudo(b,i){const p=b[i],s=side(p),t=Math.abs(p),[x,y]=xy(i),out=[];if(!p)return out;
const add=(a,c)=>{if(inside(a,c)&&side(b[c*9+a])!==s)out.push(c*9+a);};
if(t===K){for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]])if(palace(x+dx,y+dy,s))add(x+dx,y+dy);for(const dy of [-1,1])for(let yy=y+dy;inside(x,yy);yy+=dy){const q=b[yy*9+x];if(q){if(q===-s*K)out.push(yy*9+x);break;}}}
if(t===A)for(const dx of [-1,1])for(const dy of [-1,1])if(palace(x+dx,y+dy,s))add(x+dx,y+dy);
if(t===E)for(const dx of [-2,2])for(const dy of [-2,2]){const yy=y+dy;if(inside(x+dx,yy)&&(s===1?yy>=5:yy<=4)&&!b[(y+dy/2)*9+x+dx/2])add(x+dx,yy);}
if(t===H)for(const [dx,dy] of [[1,2],[-1,2],[1,-2],[-1,-2],[2,1],[2,-1],[-2,1],[-2,-1]]){const lx=x+(Math.abs(dx)===2?dx/2:0),ly=y+(Math.abs(dy)===2?dy/2:0);if(!b[ly*9+lx])add(x+dx,y+dy);}
if(t===R||t===C)for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){let screen=false;for(let xx=x+dx,yy=y+dy;inside(xx,yy);xx+=dx,yy+=dy){const j=yy*9+xx,q=b[j];if(t===R){if(side(q)!==s)out.push(j);if(q)break;}else if(!screen){if(q)screen=true;else out.push(j);}else if(q){if(side(q)!==s)out.push(j);break;}}}
if(t===P){add(x,y-s);if(s===1?y<=4:y>=5){add(x-1,y);add(x+1,y);}}
return out;}
function inCheck(b,s){const k=b.indexOf(s*K);if(k<0)return true;for(let i=0;i<N;i++)if(side(b[i])===-s&&pseudo(b,i).includes(k))return true;return false;}
function legal(s,from){const out=[];for(let i=0;i<N;i++){if(from!==undefined&&i!==from)continue;if(side(s.board[i])!==s.turn)continue;for(const to of pseudo(s.board,i)){const b=s.board.slice();b[to]=b[i];b[i]=0;if(!inCheck(b,s.turn))out.push({from:i,to});}}return out;}
function apply(s,m){const b=s.board.slice(),capture=b[m.to];b[m.to]=b[m.from];b[m.from]=0;const n={board:b,turn:-s.turn,quiet:capture?0:s.quiet+1,ply:s.ply+1,keys:s.keys.slice()};n.keys.push(key(n));return n;}
function outcome(s,moves){if(s.board.indexOf(s.turn*K)<0)return{winner:-s.turn,reason:'將帥被擒'};const l=moves||legal(s);if(!l.length)return{winner:-s.turn,reason:inCheck(s.board,s.turn)?'將死':'困斃'};if(s.keys.filter(k=>k===key(s)).length>=3)return{winner:0,reason:'同一局面出現三次'};if(s.quiet>=120)return{winner:0,reason:'連續 120 手未吃子'};return null;}
function play(s,m){if(outcome(s))throw Error('Game finished');if(!m||!Number.isInteger(m.from)||!Number.isInteger(m.to)||!legal(s,m.from).some(x=>x.to===m.to))throw Error('Illegal move');return apply(s,m);}
const api={K,A,E,H,R,C,P,initial,pseudo,inCheck,legal,apply,play,outcome,key,xy};if(typeof module!=='undefined')module.exports=api;root.Xiangqi=api;
})(typeof globalThis!=='undefined'?globalThis:this);
