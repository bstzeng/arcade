(function(root){'use strict';
function inspect(p,v){const n=p.size,bad=new Set();if(!Array.isArray(v)||v.length!==n*n)return{won:false,bad,reason:'棋盤資料格式錯誤'};let filled=0;for(let i=0;i<v.length;i++){if(!Number.isInteger(v[i])||v[i]<0||v[i]>n){bad.add(i);continue;}if(v[i])filled++;if(p.givens[i]&&v[i]!==p.givens[i])bad.add(i);}
for(let k=0;k<n;k++)for(const g of [Array.from({length:n},(_,i)=>k*n+i),Array.from({length:n},(_,i)=>i*n+k)]){const pos=new Map();for(const i of g)if(v[i]){if(pos.has(v[i])){bad.add(i);bad.add(pos.get(v[i]));}else pos.set(v[i],i);}}
for(const [a,b]of p.less)if(v[a]&&v[b]&&v[a]>=v[b]){bad.add(a);bad.add(b);}
return{won:filled===n*n&&!bad.size,bad,filled,total:n*n,reason:bad.size?'紅框處違反同行、同列或不等號規則':'每行、每列填入 1～'+n+'，並符合不等號'};}
function initial(p){return p.givens.slice();}function editable(p,i){return i>=0&&i<p.size*p.size&&!p.givens[i];}
function describe(p,i){return '第 '+(Math.floor(i/p.size)+1)+' 列、第 '+(i%p.size+1)+' 欄';}
function hint(p,v,selected){const wrong=v.findIndex((x,i)=>x&&!p.givens[i]&&x!==p.solution[i]);if(wrong>=0)return{index:wrong,value:0,text:describe(p,wrong)+' 的填法無法完成這關；先清除，再重新推理'};const i=editable(p,selected)&&!v[selected]?selected:v.findIndex((x,k)=>!x&&editable(p,k));if(i<0)return null;return{index:i,value:p.solution[i],text:describe(p,i)+' 填入 '+p.solution[i]+'；這是由完整規則與唯一解驗證的提示'};}
function sanitize(p,v){if(!Array.isArray(v)||v.length!==p.size*p.size||v.some((x,i)=>!Number.isInteger(x)||x<0||x>p.size||(p.givens[i]&&x!==p.givens[i])))return null;return v.slice();}
const api={inspect,validateSolution:(p,v)=>inspect(p,v).won,initial,editable,describe,hint,sanitize};if(typeof module!=='undefined')module.exports=api;else root.FutoshikiEngine=api;
})(globalThis);
