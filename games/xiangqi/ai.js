(function(root){'use strict';const E=typeof module!=='undefined'?require('./engine.js'):root.Xiangqi;
const profiles={easy:{depth:1,ms:100,nodes:3000},normal:{depth:2,ms:550,nodes:20000},hard:{depth:4,ms:1800,nodes:80000}};
const val=[0,20000,120,120,290,600,330,70];
function evaluate(s){let n=0;for(let i=0;i<90;i++){const p=s.board[i];if(!p)continue;const x=i%9,y=Math.floor(i/9),advance=p>0?9-y:y;let v=val[Math.abs(p)];if(Math.abs(p)===7)v+=advance*9+(advance>=5?35:0);if(Math.abs(p)===4||Math.abs(p)===6)v+=12-Math.abs(4-x)*3;n+=Math.sign(p)*v;}return n*s.turn;}
function choose(s,level='normal',override){const cfg={...(profiles[level]||profiles.normal),...override},deadline=Date.now()+cfg.ms;let nodes=0,completed=0,best=null;const stop={};
const order=(st,ls)=>ls.sort((a,b)=>(val[Math.abs(st.board[b.to])]*10-val[Math.abs(st.board[b.from])])-(val[Math.abs(st.board[a.to])]*10-val[Math.abs(st.board[a.from])]));
function neg(st,depth,alpha,beta,ply){nodes++;if(nodes>cfg.nodes||Date.now()>deadline)throw stop;const ms=E.legal(st),end=E.outcome(st,ms);if(end)return end.winner===0?0:-100000+ply;if(!depth)return evaluate(st);let score=-Infinity;for(const m of order(st,ms)){const v=-neg(E.apply(st,m),depth-1,-beta,-alpha,ply+1);score=Math.max(score,v);alpha=Math.max(alpha,v);if(alpha>=beta)break;}return score;}
const legal=order(s,E.legal(s));if(!legal.length||E.outcome(s,legal))return{move:null,nodes,depth:0};best=legal[0];for(let d=1;d<=cfg.depth;d++){let current=best,score=-Infinity;try{for(const m of [best,...legal.filter(m=>m!==best)]){const n=-neg(E.apply(s,m),d-1,-Infinity,-score,1);if(n>score){score=n;current=m;}}best=current;completed=d;}catch(e){if(e!==stop)throw e;break;}}return{move:best,nodes,depth:completed};}
const api={choose,profiles};if(typeof module!=='undefined')module.exports=api;root.XiangqiAI=api;
})(typeof globalThis!=='undefined'?globalThis:this);
