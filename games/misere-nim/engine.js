(function(root,f){if(typeof module==='object'&&module.exports)module.exports=f(require('../numeric-common/util.js'));else root.NumericEngine=f(root.NumericUtil);})(typeof globalThis!=='undefined'?globalThis:this,function(U){'use strict';

const winning=h=>{let ones=h.filter(x=>x===1).length,large=h.filter(x=>x>1).length;return large===0?ones%2===0:h.reduce((a,b)=>a^b,0)!==0;};
const all=h=>h.flatMap((n,heap)=>Array.from({length:n},(_,i)=>({heap,take:i+1})));
function best(h){if(!h.some(Boolean))return null;let acts=all(h);return acts.find(a=>{let t=h.slice();t[a.heap]-=a.take;return t.some(Boolean)&&!winning(t);})||acts[0];}
const createState=l=>({heaps:l.heaps.slice(),log:[],outcome:null});
function validateState(l,s){try{if(!s||!Array.isArray(s.heaps)||!Array.isArray(s.log)||s.log.length>100)return false;let h=l.heaps.slice(),outcome=null;for(let i=0;i<s.log.length;i++){let a=s.log[i],side=i%2?'computer':'player';if(outcome||a.side!==side||!U.int(a.heap)||!U.int(a.take)||a.take<1||a.take>h[a.heap])return false;if(side==='computer'&&!U.eq({heap:a.heap,take:a.take},best(h)))return false;h[a.heap]-=a.take;if(!h.some(Boolean))outcome=side==='player'?'lost':'won';}return U.eq(h,s.heaps)&&outcome===s.outcome&&(outcome!==null||s.log.length%2===0);}catch(e){return false;}}
const legalActions=(l,s)=>validateState(l,s)&&!s.outcome?all(s.heaps):[];
function applyAction(l,s,a){if(!legalActions(l,s).some(x=>U.eq(x,a)))throw Error('一次只能從一堆取走至少一顆');let t=U.copy(s);t.heaps[a.heap]-=a.take;t.log.push({side:'player',...a});if(!t.heaps.some(Boolean)){t.outcome='lost';return t;}let b=best(t.heaps);t.heaps[b.heap]-=b.take;t.log.push({side:'computer',...b});if(!t.heaps.some(Boolean))t.outcome='won';return t;}
function inspect(l,s){if(!validateState(l,s))return{status:'invalid',goalMet:false,violations:['石堆無效']};let valid=true,goalMet=valid&&s.outcome==='won'&&!s.heaps.some(Boolean)&&s.log.at(-1)?.side==='computer';return{status:goalMet?'won':valid?s.outcome||'playing':'invalid',goalMet,violations:valid?[]:['石堆無效'],winning:!s.outcome&&winning(s.heaps)};}
function solve(l,s=createState(l)){if(s.outcome)return s.outcome==='won'?[]:null;if(!winning(s.heaps))return null;let actions=[],t=U.copy(s);while(!t.outcome){let a=best(t.heaps);actions.push(a);t=applyAction(l,t,a);}return t.outcome==='won'?actions:null;}
const canonicalKey=l=>JSON.stringify(l.heaps.slice().sort((a,b)=>a-b));
return U.wrap({createState,validateState,legalActions,applyAction,inspect,canonicalKey,winning,best,solve});
});
