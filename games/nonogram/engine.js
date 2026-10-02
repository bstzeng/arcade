(function(root){'use strict';
function runs(a){const out=[];let k=0;for(const v of [...a,0]){if(v===1)k++;else if(k){out.push(k);k=0;}}return out;}
const lineCache=new Map();function patterns(n,clue){const key=n+':'+clue.join(',');if(lineCache.has(key))return lineCache.get(key);const out=[];function go(k,start,a){if(k===clue.length){out.push(a);return;}const need=clue.slice(k).reduce((x,y)=>x+y,0)+clue.length-k-1;for(let s=start;s<=n-need;s++){const b=a.slice();for(let j=s;j<s+clue[k];j++)b[j]=1;go(k+1,s+clue[k]+1,b);}}go(0,0,Array(n).fill(2));lineCache.set(key,out);return out;}
function same(a,b){return a.length===b.length&&a.every((x,i)=>x===b[i]);}
function inspect(p,s){const bad=new Set(),rowDone=[],colDone=[];let feasible=true;function line(a,cl,ids,done){const fits=patterns(a.length,cl).some(v=>v.every((x,j)=>!a[j]||a[j]===x));done.push(a.every(Boolean)&&same(runs(a),cl));if(!fits){feasible=false;ids.forEach(i=>bad.add(i));}}
for(let r=0;r<p.height;r++)line(s.slice(r*p.width,(r+1)*p.width),p.rows[r],Array.from({length:p.width},(_,c)=>r*p.width+c),rowDone);
for(let c=0;c<p.width;c++)line(Array.from({length:p.height},(_,r)=>s[r*p.width+c]),p.cols[c],Array.from({length:p.height},(_,r)=>r*p.width+c),colDone);
const won=s.length===p.width*p.height&&s.every(v=>v===1||v===2)&&rowDone.every(Boolean)&&colDone.every(Boolean);return{won,bad,rowDone,colDone,reason:!feasible?'有一列或一欄已無法符合數字，請檢查紅框':won?'圖案完成！每列每欄都符合提示':'填色格要形成提示的連續段；段與段之間至少隔一個空白格'};}
function validateSolution(p,s){return inspect(p,s).won;}
function initial(p){return Array(p.width*p.height).fill(0);}
function hint(p,s){const wrong=s.findIndex((v,i)=>v&&v!==p.solution[i]);if(wrong>=0)return{index:wrong,value:0,reason:'這格與唯一解衝突。先清除，再繼續推理',correction:true};const i=s.findIndex(v=>v===0);return i<0?null:{index:i,value:p.solution[i],reason:p.solution[i]===1?'此格在唯一解中需要填色':'此格在唯一解中必須留白，已標上 ×',correction:false};}
const api={runs,patterns,inspect,validateSolution,initial,hint};if(typeof module!=='undefined')module.exports=api;else root.PuzzleEngine=api;
})(globalThis);
