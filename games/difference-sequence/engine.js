(function(root,f){if(typeof module==='object'&&module.exports)module.exports=f(require('../numeric-common/util.js'));else root.NumericEngine=f(root.NumericUtil);})(typeof globalThis!=='undefined'?globalThis:this,function(U){'use strict';

const createState=l=>({values:l.givens.slice()});
const validateState=(l,s)=>!!s&&Array.isArray(s.values)&&s.values.length===l.givens.length&&s.values.every((v,i)=>(v===null||U.int(v)&&Math.abs(v)<=1000)&&(l.givens[i]===null||v===l.givens[i]));
function legalActions(l,s){return validateState(l,s)?l.givens.flatMap((v,index)=>v===null?Array.from({length:2002},(_,i)=>({index,value:i===2001?null:i-1000})):[]):[];}
function applyAction(l,s,a){if(l.givens[a.index]!==null||a.value!==null&&(!U.int(a.value)||Math.abs(a.value)>1000))throw Error('請輸入整數，固定線索不能修改');let t=U.copy(s);t.values[a.index]=a.value;return t;}
function inspect(l,s){if(!validateState(l,s))return{status:'invalid',goalMet:false,violations:['數列無效']};let triangle=[s.values.slice()];for(let d=0;d<l.order;d++){let prev=triangle.at(-1);triangle.push(prev.slice(1).map((v,i)=>v===null||prev[i]===null?null:v-prev[i]));}let full=!s.values.includes(null),goalMet=full&&triangle.at(-1).every(x=>x===l.constant);return{status:goalMet?'won':'playing',goalMet,violations:full&&!goalMet?['指定階差分必須全部等於 '+l.constant]:[],triangle};}
const canonicalKey=l=>JSON.stringify([l.order,l.constant,l.givens]);
return U.wrap({createState,validateState,legalActions,applyAction,inspect,canonicalKey});
});
