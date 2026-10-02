(function(root){'use strict';
function validState(p,a){return Array.isArray(a)&&a.length===p.size*p.size&&a.every(v=>Number.isInteger(v)&&v>=0&&v<=p.size);}
function empty(p){return Array(p.size*p.size).fill(0);}
function cageValid(c,values){if(values.some(v=>!v))return false;switch(c.op){case'=':return values[0]===c.target;case'+':return values.reduce((a,b)=>a+b,0)===c.target;case'*':return values.reduce((a,b)=>a*b,1)===c.target;case'-':return Math.abs(values[0]-values[1])===c.target;case'/':return Math.max(...values)===c.target*Math.min(...values);default:return false;}}
function inspect(p,a){let bad=new Set(),n=p.size,full=validState(p,a)&&a.every(Boolean);if(!validState(p,a))return{bad,won:false,reason:'棋盤資料不正確'};for(let r=0;r<n;r++){for(let c=0;c<n;c++){let i=r*n+c;if(!a[i])continue;for(let j=0;j<n;j++){if(j!==c&&a[r*n+j]===a[i]){bad.add(i);bad.add(r*n+j);}if(j!==r&&a[j*n+c]===a[i]){bad.add(i);bad.add(j*n+c);}}}}
for(const cage of p.cages){let v=cage.cells.map(i=>a[i]);if(v.every(Boolean)&&!cageValid(cage,v))cage.cells.forEach(i=>bad.add(i));}let won=full&&!bad.size;return{bad,won,reason:won?'每列、每欄與每個算式都剛剛好！':bad.size?'標紅的格子有重複數字，或籠內算式不符':'填入 1–'+n+'；每列、每欄的數字各出現一次'};}
function validateSolution(p,a){return inspect(p,a).won;}
function edit(p,a,i,value){if(!validState(p,a)||!Number.isInteger(i)||i<0||i>=a.length||!Number.isInteger(value)||value<0||value>p.size||a[i]===value)return null;const b=a.slice();b[i]=value;return b;}
function hint(p,a){let i=a.findIndex((v,k)=>v&&v!==p.solution[k]);if(i>=0)return{cells:edit(p,a,i,0),reason:'這一格與唯一解衝突，先清除它再想想看',index:i};i=a.findIndex(v=>!v);if(i<0)return null;return{cells:edit(p,a,i,p.solution[i]),reason:'提示：這格應填 '+p.solution[i]+'，再看看同列、同欄與籠內算式',index:i};}
const api={validState,empty,cageValid,inspect,validateSolution,edit,hint};if(typeof module!=='undefined')module.exports=api;else root.PuzzleEngine=api;
})(globalThis);
