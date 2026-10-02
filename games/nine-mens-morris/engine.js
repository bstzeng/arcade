(function(root,factory){const E=factory();if(typeof module==='object'&&module.exports)module.exports=E;else root.GameEngine=E;})(typeof self!=='undefined'?self:globalThis,function(){'use strict';
const POINTS=[[0,0],[3,0],[6,0],[1,1],[3,1],[5,1],[2,2],[3,2],[4,2],[0,3],[1,3],[2,3],[4,3],[5,3],[6,3],[2,4],[3,4],[4,4],[1,5],[3,5],[5,5],[0,6],[3,6],[6,6]];
const MILLS=[[0,1,2],[3,4,5],[6,7,8],[9,10,11],[12,13,14],[15,16,17],[18,19,20],[21,22,23],[0,9,21],[3,10,18],[6,11,15],[1,4,7],[16,19,22],[8,12,17],[5,13,20],[2,14,23]];
const ADJ=POINTS.map((_,i)=>[...new Set(MILLS.flatMap(m=>m.includes(i)?m.flatMap((j,k)=>Math.abs(k-m.indexOf(i))===1?[j]:[]):[]))]);
const LEVELS={easy:{depth:1,nodes:1500,time:160},normal:{depth:3,nodes:13000,time:650},hard:{depth:5,nodes:75000,time:1700}};
const count=(s,p)=>s.board.filter(x=>x===p).length, key=s=>s.board.map(v=>v+1).join('')+':'+s.turn+':'+s.hand.join(','),inMill=(b,i,p)=>MILLS.some(m=>m.includes(i)&&m.every(j=>b[j]===p));
function initial(){return {board:Array(24).fill(-1),hand:[9,9],turn:0,capture:false,quiet:0,ply:0,result:null,last:null,seen:{}};}
function removals(s){const enemy=s.board.flatMap((x,i)=>x===1-s.turn?[i]:[]),loose=enemy.filter(i=>!inMill(s.board,i,1-s.turn));return loose.length?loose:enemy;}
function rawMoves(s,p=s.turn){if(s.hand[p]>0)return s.board.flatMap((x,to)=>x===-1?[{to}]:[]);const flying=count(s,p)===3;return s.board.flatMap((x,from)=>x===p?(flying?s.board.flatMap((y,i)=>y===-1?[i]:[]):ADJ[from].filter(i=>s.board[i]===-1)).map(to=>({from,to})):[]);}
function legal(s){if(s.result!==null)return [];return s.capture?removals(s).map(remove=>({remove})):rawMoves(s);}
function equalMove(a,b){return a&&b&&typeof a==='object'&&typeof b==='object'&&a.from===b.from&&a.to===b.to&&a.remove===b.remove&&Object.keys(a).concat(Object.keys(b)).every(k=>['from','to','remove'].includes(k));}
function finish(s){s.turn=1-s.turn;s.capture=false;if(s.hand[0]===0&&s.hand[1]===0){if(count(s,s.turn)<3||rawMoves(s).length===0)s.result=1-s.turn;else{const k=key(s);s.seen[k]=(s.seen[k]||0)+1;if(s.seen[k]>=3)s.result='repetition';else if(s.quiet>=100)s.result='quiet';}}return s;}
function step(s,m){if(!legal(s).some(x=>equalMove(x,m)))return null;const n={...s,board:s.board.slice(),hand:s.hand.slice(),seen:{...s.seen},ply:s.ply+1,last:{...m,player:s.turn}};const p=s.turn;
 if(s.capture){n.board[m.remove]=-1;n.quiet=0;return finish(n);}
 const placing=s.hand[p]>0;if(placing){n.hand[p]--;n.quiet=0;}else{n.board[m.from]=-1;n.quiet++;}n.board[m.to]=p;
 if(inMill(n.board,m.to,p)&&count(n,1-p)>0){n.capture=true;return n;}return finish(n);
}
function evaluate(s,p){if(s.result!==null)return typeof s.result==='number'?(s.result===p?100000:-100000):0;const q=1-p;let value=95*(count(s,p)+s.hand[p]-count(s,q)-s.hand[q]);for(const m of MILLS){let a=0,b=0;for(const i of m){if(s.board[i]===p)a++;if(s.board[i]===q)b++;}if(b===0)value+=[0,2,19,34][a];if(a===0)value-=[0,2,19,34][b];}for(let i=0;i<24;i++)if(s.board[i]>=0)value+=(s.board[i]===p?1:-1)*ADJ[i].length*1.3;value+=2*(rawMoves(s,p).length-rawMoves(s,q).length);if(s.capture)value+=s.turn===p?85:-85;return value;}
function choose(s,level='normal',overrides={}){const cfg={...(LEVELS[level]||LEVELS.normal),...overrides},p=s.turn,moves=legal(s),start=Date.now();if(!moves.length)return {move:null,nodes:0,depth:0};let nodes=0,best=moves[0],completed=0;const STOP={};
 function search(a,d,alpha,beta){if(++nodes>cfg.nodes||Date.now()-start>cfg.time)throw STOP;if(a.result!==null||(d<=0&&!a.capture))return evaluate(a,p);const max=a.turn===p;let value=max?-Infinity:Infinity;const children=legal(a).map(m=>[m,step(a,m)]).sort((x,y)=>(evaluate(y[1],p)-evaluate(x[1],p))*(max?1:-1));for(const [,b]of children){const v=search(b,d-(b.turn!==a.turn?1:0),alpha,beta);value=max?Math.max(value,v):Math.min(value,v);if(max)alpha=Math.max(alpha,value);else beta=Math.min(beta,value);if(alpha>=beta)break;}return value;}
 for(let d=1;d<=cfg.depth;d++){let candidate=best,val=-Infinity;try{const ordered=[best,...moves.filter(m=>!equalMove(m,best))];for(const m of ordered){const b=step(s,m),v=search(b,d-(b.turn!==s.turn?1:0),-Infinity,Infinity);if(v>val){val=v;candidate=m;}}best=candidate;completed=d;}catch(e){if(e!==STOP)throw e;break;}}
 return {move:best,nodes,depth:completed};}
function replay(actions){if(!Array.isArray(actions)||actions.length>3000)throw Error('Invalid transcript');let s=initial();for(const m of actions){const n=step(s,m);if(!n)throw Error('Illegal move');s=n;}return s;}
return {id:'nine-mens-morris',POINTS,MILLS,ADJ,LEVELS,initial,legal,rawMoves,step,evaluate,choose,replay,equalMove,count,inMill,key,removals};});
