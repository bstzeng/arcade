(function(root){'use strict';
function seeds(p,k){const [r,c]=p.centers[k];return [...new Set([Math.floor(r/2),Math.ceil(r/2)].flatMap(y=>[Math.floor(c/2),Math.ceil(c/2)].map(x=>y*p.size+x)))];}
function mirror(p,i,k){const [y,x]=p.centers[k],n=p.size,r=y-(i/n|0),c=x-i%n;return r>=0&&r<n&&c>=0&&c<n?r*n+c:-1;}
function fixed(p){const a=Array(p.size*p.size).fill(-1);p.centers.forEach((_,k)=>seeds(p,k).forEach(i=>a[i]=k));return a;}
function empty(p){return fixed(p);}
function validState(p,a){const f=fixed(p);return Array.isArray(a)&&a.length===p.size*p.size&&a.every((v,i)=>Number.isInteger(v)&&v>=-1&&v<p.centers.length&&(f[i]<0||v===f[i]));}
function neighbors(i,n){const out=[];if(i>=n)out.push(i-n);if(i<n*(n-1))out.push(i+n);if(i%n)out.push(i-1);if(i%n<n-1)out.push(i+1);return out;}
function inspect(p,a){let bad=new Set();if(!validState(p,a))return{bad,won:false,reason:'棋盤資料不正確'};let full=a.every(v=>v>=0);for(let k=0;k<p.centers.length;k++){const cells=[];a.forEach((v,i)=>{if(v===k)cells.push(i);});for(const i of cells)if(a[mirror(p,i,k)]!==k)bad.add(i);const reached=new Set([seeds(p,k)[0]]),stack=[seeds(p,k)[0]];while(stack.length){for(const j of neighbors(stack.pop(),p.size))if(a[j]===k&&!reached.has(j)){reached.add(j);stack.push(j);}}for(const i of cells)if(!reached.has(i))bad.add(i);}const won=full&&!bad.size;return{bad,won,reason:won?'所有星系相連，旋轉半圈也完全相同！':bad.size?'標紅部分尚未連到自己的星心，或不符合旋轉對稱':'選一顆星心，再點空格；會一起塗上旋轉對稱的另一格'};}
function validateSolution(p,a){return inspect(p,a).won;}
function edit(p,a,i,k){if(!validState(p,a)||!Number.isInteger(i)||i<0||i>=a.length||!Number.isInteger(k)||k<-1||k>=p.centers.length)return null;const f=fixed(p);if(f[i]>=0)return null;const j=k<0?i:mirror(p,i,k);if(j<0||f[j]>=0)return null;const b=a.slice(),targets=k<0?[i]:[i,j];for(const t of targets){const old=a[t];if(old>=0){const m=mirror(p,t,old);if(f[t]<0)b[t]=-1;if(m>=0&&f[m]<0)b[m]=-1;}}for(const t of targets)b[t]=k;if(a.every((v,q)=>b[q]===v))return null;return b;}
function hint(p,a){let i=a.findIndex((v,k)=>v>=0&&v!==p.solution[k]);if(i>=0)return{cells:edit(p,a,i,-1),reason:'這一對格子與唯一解衝突，已先清除；重新選擇它的星心',index:i};i=a.findIndex(v=>v<0);if(i<0)return null;return{cells:edit(p,a,i,p.solution[i]),reason:'提示：這一對格子屬於星心 '+(p.solution[i]+1)+'，半圈旋轉後剛好重合',index:i};}
const api={seeds,mirror,fixed,empty,validState,neighbors,inspect,validateSolution,edit,hint};if(typeof module!=='undefined')module.exports=api;else root.PuzzleEngine=api;
})(globalThis);
