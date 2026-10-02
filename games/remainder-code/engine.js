(function(root,f){if(typeof module==='object'&&module.exports)module.exports=f(require('../numeric-common/util.js'));else root.NumericEngine=f(root.NumericUtil);})(typeof globalThis!=='undefined'?globalThis:this,function(U){'use strict';

const createState=l=>({value:null});
const validateState=(l,s)=>!!s&&(s.value===null||U.int(s.value)&&s.value>=l.min&&s.value<=l.max);
function legalActions(l,s){return validateState(l,s)?Array.from({length:l.max-l.min+1},(_,i)=>({value:l.min+i})):[];}
function applyAction(l,s,a){if(!U.int(a.value)||a.value<l.min||a.value>l.max)throw Error('密碼不在指定範圍');return{value:a.value};}
function inspect(l,s){if(!validateState(l,s))return{status:"invalid",goalMet:false,violations:["盤面無效"]};let valid=validateState(l,s),checks=l.clues.map(c=>s.value!==null&&s.value%c.mod===c.rem),goalMet=valid&&checks.every(Boolean);return{status:goalMet?'won':valid?'playing':'invalid',goalMet,violations:valid?[]:['密碼超出範圍'],checks};}
const canonicalKey=l=>JSON.stringify([l.min,l.max,l.clues.slice().sort((a,b)=>a.mod-b.mod)]);
return U.wrap({createState,validateState,legalActions,applyAction,inspect,canonicalKey});
});
