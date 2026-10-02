(function(root){'use strict';
function neighbors(n,i){const r=Math.floor(i/n),c=i%n;return[[r-1,c],[r+1,c],[r,c-1],[r,c+1]].filter(([a,b])=>a>=0&&b>=0&&a<n&&b<n).map(([a,b])=>a*n+b);}
function groups(n,s,value){const todo=new Set(s.map((v,i)=>v===value?i:-1).filter(i=>i>=0)),out=[];while(todo.size){const first=todo.values().next().value,part=[first];todo.delete(first);for(let k=0;k<part.length;k++)for(const j of neighbors(n,part[k]))if(todo.has(j)){todo.delete(j);part.push(j);}out.push(part);}return out;}
function inspect(p,s){const n=p.size,bad=new Set(),white=groups(n,s,1),sea=groups(n,s,2);let reason='每座白島恰好一個數字；藍色海域要連通，不能出現 2×2 海域';
for(const part of white){const clues=part.filter(i=>p.clues[i]);if(clues.length>1){part.forEach(i=>bad.add(i));reason='兩座有數字的島相連了，請分開';}else if(clues.length===1&&part.length>p.clues[clues[0]]){part.forEach(i=>bad.add(i));reason='白島的格數超過了島上的數字';}else if(!clues.length&&part.every(i=>neighbors(n,i).every(j=>s[j]!==0))){part.forEach(i=>bad.add(i));reason='這座白島沒有數字，且已被封住';}}
for(let r=0;r<n-1;r++)for(let c=0;c<n-1;c++){const q=[r*n+c,r*n+c+1,(r+1)*n+c,(r+1)*n+c+1];if(q.every(i=>s[i]===2)){q.forEach(i=>bad.add(i));reason='海域不能形成 2×2 方塊';}}
for(const k of Object.keys(p.clues))if(s[k]!==1){bad.add(+k);reason='有數字的格子必須是白島';}
const complete=s.length===n*n&&s.every(v=>v===1||v===2);const islandsOK=white.every(a=>{const q=a.filter(i=>p.clues[i]);return q.length===1&&a.length===p.clues[q[0]];});const won=complete&&!bad.size&&islandsOK&&sea.length===1;if(complete&&!won&&!bad.size)reason=sea.length!==1?'海域被分開了，所有海格必須上下左右連通':'每座島的格數都要恰好等於數字';return{won,bad,reason:won?'群島完成！白島與海域全部符合規則':reason};}
function validateSolution(p,s){return inspect(p,s).won;}
function initial(p){return Array.from({length:p.size*p.size},(_,i)=>p.clues[i]?1:0);}
function hint(p,s){const wrong=s.findIndex((v,i)=>!p.clues[i]&&v&&v!==p.solution[i]);if(wrong>=0)return{index:wrong,value:0,reason:'這格與唯一解衝突。先清除，再繼續推理',correction:true};const i=s.findIndex(v=>v===0);return i<0?null:{index:i,value:p.solution[i],reason:p.solution[i]===1?'此格在唯一解中屬於白島':'此格在唯一解中屬於連通的海域',correction:false};}
const api={neighbors,groups,inspect,validateSolution,initial,hint};if(typeof module!=='undefined')module.exports=api;else root.PuzzleEngine=api;
})(globalThis);
