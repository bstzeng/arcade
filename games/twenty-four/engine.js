(function(root,f){if(typeof module==='object'&&module.exports)module.exports=f(require('../numeric-common/util.js'));else root.NumericEngine=f(root.NumericUtil);})(typeof globalThis!=='undefined'?globalThis:this,function(U){'use strict';

const createState=l=>({cards:l.numbers.map((n,i)=>({id:i,value:[n,1],expr:String(n),tree:i})),next:4,moves:0});
function readTree(l,t,used){if(Number.isInteger(t)){if(t<0||t>=4||used.has(t))throw Error('重複卡');used.add(t);return[l.numbers[t],1];}if(!t||!['+','-','*','/'].includes(t.op))throw Error('算式無效');return U.calc(readTree(l,t.a,used),readTree(l,t.b,used),t.op);}
function validateState(l,s){try{if(!s||!Array.isArray(s.cards)||s.cards.length<1||s.cards.length>4||s.moves!==4-s.cards.length||s.next!==4+s.moves||new Set(s.cards.map(c=>c.id)).size!==s.cards.length)return false;let used=new Set();for(let c of s.cards){if(!U.int(c.id)||!U.eq(readTree(l,c.tree,used),c.value))return false;}return used.size===4;}catch(e){return false;}}
function legalActions(l,s){if(!validateState(l,s)||s.cards.length<2)return[];let a=[];for(const x of s.cards)for(const y of s.cards)if(x!==y)for(const op of ['+','-','*','/'])if(op!=='/'||y.value[0]!==0)a.push({a:x.id,b:y.id,op});return a;}
function applyAction(l,s,a){if(!legalActions(l,s).some(x=>U.eq(x,a)))throw Error('請選兩張不同的數字卡與合法運算');let t=U.copy(s),x=t.cards.find(c=>c.id===a.a),y=t.cards.find(c=>c.id===a.b);t.cards=t.cards.filter(c=>c!==x&&c!==y);t.cards.push({id:t.next++,value:U.calc(x.value,y.value,a.op),expr:'('+x.expr+a.op+y.expr+')',tree:{a:x.tree,b:y.tree,op:a.op}});t.moves++;return t;}
function inspect(l,s){const valid=validateState(l,s),goalMet=valid&&s.cards.length===1&&s.cards[0].value[0]===24*s.cards[0].value[1];return{status:goalMet?'won':valid?'playing':'invalid',goalMet,violations:valid?[]:['盤面無效']};}
function solve(l,s=createState(l)){if(s.cards.length===1)return inspect(l,s).goalMet?[]:null;for(const a of legalActions(l,s)){let p=solve(l,applyAction(l,s,a));if(p)return[a,...p];}return null;}
const canonicalKey=l=>JSON.stringify(l.numbers.slice().sort((a,b)=>a-b));
return U.wrap({createState,validateState,legalActions,applyAction,inspect,canonicalKey,solve});
});
