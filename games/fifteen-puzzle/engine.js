/* Pure, dependency-free sliding-number rules. Actions are TILE VALUES, never directions. */
(function(root,f){const api=f();if(typeof module==='object'&&module.exports)module.exports=api;else root.FifteenEngine=api;})(globalThis,function(){
'use strict';
const key=s=>s.join(','),equal=(a,b)=>Array.isArray(a)&&Array.isArray(b)&&key(a)===key(b);
function validState(n,s){return [3,4].includes(n)&&Array.isArray(s)&&s.length===n*n&&new Set(s).size===s.length&&s.every(x=>Number.isInteger(x)&&x>=0&&x<n*n);}
function solvable(n,s){if(!validState(n,s))return false;let inv=0;for(let i=0;i<s.length;i++)for(let j=i+1;j<s.length;j++)if(s[i]&&s[j]&&s[i]>s[j])inv++;return n%2?inv%2===0:(inv+n-Math.floor(s.indexOf(0)/n))%2===1;}
function validate(l){return !!l&&[3,4].includes(l.size)&&solvable(l.size,l.start)&&Array.isArray(l.solution);}
function initial(l){if(!validate(l))throw Error('關卡資料錯誤');return l.start.slice();}
function goal(n){return Array.from({length:n*n},(_,i)=>(i+1)%(n*n));}
function moves(l,s){if(!validState(l.size,s))return [];const n=l.size,z=s.indexOf(0);return [-n,n,-1,1].map(d=>z+d).filter(i=>i>=0&&i<s.length&&Math.abs(i%n-z%n)+Math.abs(Math.floor(i/n)-Math.floor(z/n))===1).map(i=>s[i]);}
function legal(l,s,a){return Number.isInteger(a)&&a>0&&moves(l,s).includes(a);}
function step(l,s,a){if(!legal(l,s,a))throw Error('只可滑動空格旁的一塊數字');const out=s.slice(),i=out.indexOf(a),z=out.indexOf(0);[out[i],out[z]]=[out[z],out[i]];return out;}
function won(l,s){return equal(s,goal(l.size));}
function replay(l,actions){if(!Array.isArray(actions)||actions.length>20000)throw Error('走法記錄格式錯誤');const states=[initial(l)];for(const a of actions)states.push(step(l,states.at(-1),a));return states;}
function proof(l){const states=replay(l,l.solution);if(!won(l,states.at(-1)))throw Error('解答未到達標準終點');return states;}
function manhattan(l,s){let d=0;for(let i=0;i<s.length;i++)if(s[i]){const t=s[i]-1;d+=Math.abs(i%l.size-t%l.size)+Math.abs(Math.floor(i/l.size)-Math.floor(t/l.size));}return d;}
/* Guaranteed route from ANY legal played position. A loop-erased reverse history
   connects to the certified fixture. No silent reset and no unbounded search. */
function route(l,actions){const history=replay(l,actions),current=history.at(-1),certified=proof(l),at=certified.findIndex(s=>equal(s,current));if(at>=0)return {moves:l.solution.slice(at),kind:l.optimal!==null?'certified':'reference'};
 const candidates=actions.slice().reverse().concat(l.solution),states=[current],path=[],seen=new Map([[key(current),0]]);let state=current;
 for(const action of candidates){state=step(l,state,action);const k=key(state);if(seen.has(k)){const keep=seen.get(k);for(let j=keep+1;j<states.length;j++)seen.delete(key(states[j]));states.length=keep+1;path.length=keep;}else{path.push(action);states.push(state);seen.set(k,path.length);}}
 if(!won(l,state))throw Error('返回路徑驗證失敗');return {moves:path,kind:'return'};}
return {key,equal,validState,solvable,validate,initial,goal,moves,legal,step,won,replay,proof,manhattan,route};
});
