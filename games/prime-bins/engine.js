(function(root,f){if(typeof module==='object'&&module.exports)module.exports=f(require('../numeric-common/util.js'));else root.NumericEngine=f(root.NumericUtil);})(typeof globalThis!=='undefined'?globalThis:this,function(U){'use strict';

const createState=l=>({bins:Array(l.primes.length).fill(-1)});
const validateState=(l,s)=>!!s&&Array.isArray(s.bins)&&s.bins.length===l.primes.length&&s.bins.every(b=>U.int(b)&&b>=-1&&b<l.targets.length);
function legalActions(l,s){return validateState(l,s)?s.bins.flatMap((_,piece)=>Array.from({length:l.targets.length+1},(_,i)=>({piece,bin:i-1}))):[];}
function applyAction(l,s,a){if(!legalActions(l,s).some(x=>U.eq(x,a)))throw Error('請選質因數與箱子');let t=U.copy(s);t.bins[a.piece]=a.bin;return t;}
function inspect(l,s){if(!validateState(l,s))return{status:"invalid",goalMet:false,violations:["盤面無效"]};let valid=validateState(l,s),products=l.targets.map((_,b)=>l.primes.reduce((p,x,i)=>s.bins[i]===b?p*BigInt(x):p,1n)),goalMet=valid&&products.every((x,i)=>x===BigInt(l.targets[i]));return{status:goalMet?'won':valid?'playing':'invalid',goalMet,violations:products.some((x,i)=>BigInt(l.targets[i])%x!==0n)?['有箱子含有不合適的因數']:[],products:products.map(String)};}
const canonicalKey=l=>JSON.stringify([l.targets.slice().sort((a,b)=>a-b),l.primes.slice().sort((a,b)=>a-b)]);
return U.wrap({createState,validateState,legalActions,applyAction,inspect,canonicalKey});
});
