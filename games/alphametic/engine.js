(function(root,f){if(typeof module==='object'&&module.exports)module.exports=f(require('../numeric-common/util.js'));else root.NumericEngine=f(root.NumericUtil);})(typeof globalThis!=='undefined'?globalThis:this,function(U){'use strict';

const letters=l=>[...new Set(l.words.join(''))],leading=l=>new Set(l.words.filter(w=>w.length>1).map(w=>w[0]));
const createState=l=>({digits:Object.fromEntries(letters(l).map(c=>[c,null]))});
const validateState=(l,s)=>!!s&&s.digits&&U.eq(Object.keys(s.digits).sort(),letters(l).sort())&&Object.values(s.digits).every(n=>n===null||U.int(n)&&n>=0&&n<=9);
function legalActions(l,s){if(!validateState(l,s))return[];return letters(l).flatMap(letter=>Array.from({length:11},(_,i)=>({letter,digit:i===10?null:i})));}
function applyAction(l,s,a){if(!legalActions(l,s).some(x=>U.eq(x,a)))throw Error('請選字母及 0–9');let t=U.copy(s);t.digits[a.letter]=a.digit;return t;}
function inspect(l,s){if(!validateState(l,s))return{status:'invalid',goalMet:false,violations:['盤面無效']};let ds=Object.values(s.digits).filter(x=>x!==null),v=[];if(new Set(ds).size!==ds.length)v.push('不同字母不能共用數字');if([...leading(l)].some(c=>s.digits[c]===0))v.push('最高位不能為零');const full=ds.length===letters(l).length,values=l.words.map(w=>Number([...w].map(c=>s.digits[c]).join('')));if(full&&values[0]+values[1]!==values[2])v.push('直式加法尚未成立');let goalMet=full&&!v.length;return{status:goalMet?'won':'playing',goalMet,violations:v,values:full?values:null};}
const canonicalKey=l=>{let norm=words=>{let m={},n=0;return words.map(w=>[...w].map(c=>m[c]??(m[c]=n++)).join('.')).join('+');};return[norm(l.words),norm([l.words[1],l.words[0],l.words[2]])].sort()[0];};
return U.wrap({createState,validateState,legalActions,applyAction,inspect,canonicalKey,letters,leading});
});
