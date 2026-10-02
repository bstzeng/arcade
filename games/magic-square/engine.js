(function(root,f){if(typeof module==='object'&&module.exports)module.exports=f(require('../numeric-common/util.js'));else root.NumericEngine=f(root.NumericUtil);})(typeof globalThis!=='undefined'?globalThis:this,function(U){'use strict';

const createState=l=>({cells:l.givens.slice()});
const validateState=(l,s)=>!!s&&Array.isArray(s.cells)&&s.cells.length===l.size*l.size&&s.cells.every((x,i)=>(x===0||U.int(x)&&x>=1&&x<=l.size*l.size)&&(!l.givens[i]||l.givens[i]===x));
function legalActions(l,s){if(!validateState(l,s))return[];return s.cells.flatMap((_,i)=>l.givens[i]?[]:Array.from({length:l.size*l.size+1},(_,value)=>({index:i,value})));}
function applyAction(l,s,a){if(!legalActions(l,s).some(x=>U.eq(x,a)))throw Error('固定線索不能修改');let t=U.copy(s);t.cells[a.index]=a.value;return t;}
function inspect(l,s){if(!validateState(l,s))return{status:'invalid',goalMet:false,violations:['盤面無效']};let n=l.size,c=s.cells,rows=Array.from({length:n},(_,r)=>c.slice(r*n,r*n+n).reduce((a,b)=>a+b,0)),cols=Array.from({length:n},(_,k)=>c.reduce((a,b,i)=>a+(i%n===k?b:0),0)),diags=[c.filter((_,i)=>Math.floor(i/n)===i%n).reduce((a,b)=>a+b,0),c.filter((_,i)=>Math.floor(i/n)+i%n===n-1).reduce((a,b)=>a+b,0)],used=c.filter(Boolean),v=[];if(new Set(used).size!==used.length)v.push('每個數字只能出現一次');let goalMet=!c.includes(0)&&!v.length&&[...rows,...cols,...diags].every(x=>x===l.target);return{status:goalMet?'won':'playing',goalMet,violations:v,rows,cols,diags};}
function canonicalKey(l){let n=l.size,a=l.givens,variants=[];const add=board=>{variants.push(board.join(','));variants.push(board.map(v=>v===0?0:n*n+1-v).join(','));};for(let k=0;k<4;k++){add(a);add(Array.from({length:n*n},(_,i)=>a[Math.floor(i/n)*n+n-1-i%n]));a=Array.from({length:n*n},(_,i)=>a[(n-1-i%n)*n+Math.floor(i/n)]);}return n+':'+variants.sort()[0];}
return U.wrap({createState,validateState,legalActions,applyAction,inspect,canonicalKey});
});
