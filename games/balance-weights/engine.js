(function(root,f){if(typeof module==='object'&&module.exports)module.exports=f(require('../numeric-common/util.js'));else root.NumericEngine=f(root.NumericUtil);})(typeof globalThis!=='undefined'?globalThis:this,function(U){'use strict';

const createState=l=>({weights:Array(l.count).fill(null)});
const validateState=(l,s)=>!!s&&Array.isArray(s.weights)&&s.weights.length===l.count&&s.weights.every(n=>n===null||U.int(n)&&n>=1&&n<=l.max);
function legalActions(l,s){return validateState(l,s)?s.weights.flatMap((_,i)=>Array.from({length:l.max+1},(_,n)=>({index:i,value:n===0?null:n}))):[];}
function applyAction(l,s,a){if(!legalActions(l,s).some(x=>U.eq(x,a)))throw Error('重量超出範圍');let t=U.copy(s);t.weights[a.index]=a.value;return t;}
function inspect(l,s){if(!validateState(l,s))return{status:"invalid",goalMet:false,violations:["盤面無效"]};let valid=validateState(l,s),totals=l.equations.map(e=>e.coeff.reduce((a,c,i)=>a+c*(s.weights[i]||0),0)),checks=totals.map((n,i)=>n===l.equations[i].total),goalMet=valid&&!s.weights.includes(null)&&checks.every(Boolean);return{status:goalMet?'won':valid?'playing':'invalid',goalMet,violations:valid?[]:['重量無效'],totals,checks};}
const permutations=a=>a.length?a.flatMap((x,i)=>permutations(a.filter((_,j)=>j!==i)).map(p=>[x,...p])):[[]];
const canonicalKey=l=>permutations(Array.from({length:l.count},(_,i)=>i)).map(p=>JSON.stringify([l.max,l.equations.map(e=>[...p.map(i=>e.coeff[i]),e.total]).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)))])).sort()[0];
return U.wrap({createState,validateState,legalActions,applyAction,inspect,canonicalKey});
});
