(function(root,f){if(typeof module==='object'&&module.exports)module.exports=f(require('../numeric-common/util.js'));else root.NumericEngine=f(root.NumericUtil);})(typeof globalThis!=='undefined'?globalThis:this,function(U){'use strict';

const masks=[119,36,93,109,46,107,123,37,127,111]; // segments: top, upper-left, upper-right, middle, lower-left, lower-right, bottom
const createState=l=>({masks:l.digits.map(d=>masks[d]),hand:null,moves:0});
const bits=x=>{let n=0;for(let i=0;i<7;i++)n+=(x>>i)&1;return n;};
const validateState=(l,s)=>!!s&&Array.isArray(s.masks)&&s.masks.length===l.digits.length&&s.masks.every(x=>U.int(x)&&x>=0&&x<128)&&U.int(s.moves)&&s.moves>=0&&s.moves<=l.budget&&(s.hand===null||U.int(s.hand)&&s.hand>=0&&s.hand<l.digits.length*7)&&s.masks.reduce((a,x)=>a+bits(x),0)+(s.hand!==null?1:0)===l.digits.reduce((a,x)=>a+bits(masks[x]),0);
function legalActions(l,s){if(!validateState(l,s)||s.moves>=l.budget)return[];return s.masks.flatMap((x,d)=>Array.from({length:7},(_,seg)=>({digit:d,seg})).filter(a=>s.hand===null?!!(x&(1<<a.seg)):!(x&(1<<a.seg))&&a.digit*7+a.seg!==s.hand));}
function applyAction(l,s,a){if(!legalActions(l,s).some(x=>U.eq(x,a)))throw Error('先拾起亮火柴，再放到空位');let t=U.copy(s),b=1<<a.seg;if(t.hand===null){t.hand=a.digit*7+a.seg;t.masks[a.digit]&=~b;}else{t.masks[a.digit]|=b;t.hand=null;t.moves++;}return t;}
function inspect(l,s){if(!validateState(l,s))return{status:'invalid',goalMet:false,violations:['火柴總量或步數無效']};let ds=s.masks.map(x=>masks.indexOf(x)),off=s.masks.reduce((n,x,i)=>n+bits(masks[l.digits[i]]&~x),0),parts=[],k=0;for(const n of l.lengths){parts.push(ds.slice(k,k+n));k+=n;}let proper=ds.every(d=>d>=0)&&parts.every(p=>p.length===1||p[0]!==0),values=parts.map(p=>Number(p.join(''))),equal=proper&&(l.op==='+'?values[0]+values[1]:values[0]-values[1])===values[2],goalMet=s.hand===null&&s.moves===l.budget&&off===l.budget&&equal;return{status:goalMet?'won':s.moves===l.budget&&s.hand===null?'stuck':'playing',goalMet,violations:[],digits:ds,values,equal,netMoved:off};}
const canonicalKey=l=>JSON.stringify([l.digits,l.lengths,l.op,l.budget]);
return U.wrap({createState,validateState,legalActions,applyAction,inspect,canonicalKey,masks,bits});
});
