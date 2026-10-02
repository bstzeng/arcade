(function(root,factory){const E=factory();if(typeof module==='object'&&module.exports)module.exports=E;else root.GameEngine=E;})(typeof self!=='undefined'?self:globalThis,function(){'use strict';
const LEVELS={easy:{depth:1,nodes:600,time:150},normal:{depth:5,nodes:14000,time:550},hard:{depth:10,nodes:110000,time:1500}};
const own=(i,p)=>p===0?i>=0&&i<6:i>=7&&i<13, store=p=>p===0?6:13;
function initial(){return {board:[4,4,4,4,4,4,0,4,4,4,4,4,4,0],turn:0,ply:0,result:null,last:null};}
function legal(s){if(s.result!==null)return [];return s.board.map((n,i)=>own(i,s.turn)&&n>0?i:-1).filter(i=>i>=0);}
function step(s,m){if(!Number.isInteger(m)||!legal(s).includes(m))return null;const b=s.board.slice(),p=s.turn;let n=b[m],i=m,captured=0;b[m]=0;while(n){i=(i+1)%14;if(i===store(1-p))continue;b[i]++;n--;}
 if(own(i,p)&&b[i]===1&&b[12-i]>0){captured=b[12-i]+1;b[store(p)]+=captured;b[i]=b[12-i]=0;}
 const bonus=i===store(p),end=[0,1].some(t=>b.every((x,j)=>!own(j,t)||x===0));let result=null;
 if(end){for(let j=0;j<14;j++)if(j!==6&&j!==13){b[store(j<6?0:1)]+=b[j];b[j]=0;}result=b[6]===b[13]?'draw':b[6]>b[13]?0:1;}
 return {board:b,turn:bonus&&!end?p:1-p,ply:s.ply+1,result,last:{from:m,to:i,captured,bonus:bonus&&!end,player:p}};
}
function evaluate(s,p){const d=s.board[store(p)]-s.board[store(1-p)];if(s.result!==null)return s.result==='draw'?0:(s.result===p?100000:-100000)+d;let field=0,mobility=0;for(let i=0;i<14;i++)if(i!==6&&i!==13){field+=(own(i,p)?1:-1)*s.board[i];if(s.board[i]>0)mobility+=own(i,p)?1:-1;}return 18*d+field+mobility*1.2;}
function choose(s,level='normal',overrides={}){const cfg={...(LEVELS[level]||LEVELS.normal),...overrides},p=s.turn,moves=legal(s),start=Date.now();if(!moves.length)return {move:null,nodes:0,depth:0};let nodes=0,best=moves[0],completed=0;const STOP={};
 function search(a,d,alpha,beta){if(++nodes>cfg.nodes||Date.now()-start>cfg.time)throw STOP;if(a.result!==null||d<=0)return evaluate(a,p);const max=a.turn===p;let value=max?-Infinity:Infinity;const children=legal(a).map(m=>[m,step(a,m)]).sort((x,y)=>(evaluate(y[1],p)-evaluate(x[1],p))*(max?1:-1));for(const [,b]of children){const v=search(b,d-1,alpha,beta);value=max?Math.max(value,v):Math.min(value,v);if(max)alpha=Math.max(alpha,value);else beta=Math.min(beta,value);if(alpha>=beta)break;}return value;}
 for(let d=1;d<=cfg.depth;d++){let candidate=best,val=-Infinity;try{const ordered=[best,...moves.filter(m=>m!==best)];for(const m of ordered){const v=search(step(s,m),d-1,-Infinity,Infinity);if(v>val){val=v;candidate=m;}}best=candidate;completed=d;}catch(e){if(e!==STOP)throw e;break;}}
 return {move:best,nodes,depth:completed};}
function replay(actions){if(!Array.isArray(actions)||actions.length>2000)throw Error('Invalid transcript');let s=initial();for(const m of actions){const n=step(s,m);if(!n)throw Error('Illegal move');s=n;}return s;}
return {id:'kalah',initial,legal,step,evaluate,choose,replay,LEVELS,own,store};});
