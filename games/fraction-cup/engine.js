(function(root,f){if(typeof module==='object'&&module.exports)module.exports=f(require('../numeric-common/util.js'));else root.NumericEngine=f(root.NumericUtil);})(typeof globalThis!=='undefined'?globalThis:this,function(U){'use strict';

const createState=l=>({bins:Array(l.pieces.length).fill(-1)});
const validateState=(l,s)=>!!s&&Array.isArray(s.bins)&&s.bins.length===l.pieces.length&&s.bins.every(b=>U.int(b)&&b>=-1&&b<l.cups);
function legalActions(l,s){return validateState(l,s)?s.bins.flatMap((_,piece)=>Array.from({length:l.cups+1},(_,i)=>({piece,bin:i-1}))):[];}
function applyAction(l,s,a){if(!legalActions(l,s).some(x=>U.eq(x,a)))throw Error('請選分數片與杯子');let t=U.copy(s);t.bins[a.piece]=a.bin;return t;}
function inspect(l,s){if(!validateState(l,s))return{status:"invalid",goalMet:false,violations:["盤面無效"]};let valid=validateState(l,s),totals=Array.from({length:l.cups},(_,b)=>U.sum(l.pieces.filter((_,i)=>s.bins[i]===b))),goalMet=valid&&totals.every(x=>x[0]===x[1]);return{status:goalMet?'won':valid?'playing':'invalid',goalMet,violations:totals.some(x=>x[0]>x[1])?['有杯子超過一杯']:[],totals};}
const canonicalKey=l=>JSON.stringify([l.cups,l.pieces.map(x=>U.fmt(U.rat(...x))).sort()]);
return U.wrap({createState,validateState,legalActions,applyAction,inspect,canonicalKey});
});
