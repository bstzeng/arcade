(function(root){'use strict';
function initial(l){return l.tiles.map(()=>false)}
const geometry=new WeakMap();
function blockers(l){if(geometry.has(l))return geometry.get(l);const g=l.tiles.map(t=>({above:[],left:[],right:[]}));for(let i=0;i<l.tiles.length;i++){const t=l.tiles[i];for(let j=0;j<l.tiles.length;j++){const q=l.tiles[j];if(i===j)continue;if(q.z>t.z&&Math.abs(q.x-t.x)<2&&Math.abs(q.y-t.y)<2)g[i].above.push(j);if(q.z===t.z&&Math.abs(q.y-t.y)<2){if(q.x===t.x-2)g[i].left.push(j);if(q.x===t.x+2)g[i].right.push(j)}}}geometry.set(l,g);return g}
function free(l,s,i){if(!Number.isInteger(i)||!l.tiles[i]||s[i])return false;const b=blockers(l)[i];return !b.above.some(j=>!s[j])&&(!b.left.some(j=>!s[j])||!b.right.some(j=>!s[j]))}
function pairs(l,s){const a=[],open=[];for(let i=0;i<s.length;i++)if(free(l,s,i))open.push(i);for(let x=0;x<open.length;x++)for(let y=x+1;y<open.length;y++)if(l.tiles[open[x]].face===l.tiles[open[y]].face)a.push([open[x],open[y]]);return a}
function legal(l,s,a){return Array.isArray(a)&&a.length===2&&a[0]!==a[1]&&a.every(i=>free(l,s,i))&&l.tiles[a[0]].face===l.tiles[a[1]].face}
function step(l,s,a){if(!legal(l,s,a))throw Error('illegal pair');const q=s.slice();a.forEach(i=>q[i]=true);return q}
function valid(l,s){return Array.isArray(s)&&s.length===l.tiles.length&&s.every(x=>typeof x==='boolean')&&l.tiles.every(t=>s.filter((v,i)=>v&&l.tiles[i].face===t.face).length%2===0)}
function won(l,s){return valid(l,s)&&s.every(Boolean)}
function replay(l,actions){let s=initial(l);if(!Array.isArray(actions)||actions.length>l.tiles.length/2)throw Error('invalid history');for(const a of actions)s=step(l,s,a);return s}
function solve(l,s,limit=80000){let nodes=0,limited=false;const dead=new Set();function dfs(q){if(q.every(Boolean))return [];if(++nodes>limit){limited=true;return null;}const key=q.map(x=>x?'1':'0').join('');if(dead.has(key))return null;const options=pairs(l,q);options.sort((a,b)=>Number(!l.solution.some(p=>p.includes(a[0])&&p.includes(a[1])))-Number(!l.solution.some(p=>p.includes(b[0])&&p.includes(b[1]))));for(const a of options){const r=dfs(step(l,q,a));if(r)return[a,...r];if(limited)return null;}dead.add(key);return null;}const route=dfs(s);return{route,nodes,limited}}
const api={kind:'mahjong',initial,free,pairs,legal,step,valid,won,replay,solve};root.GameEngine=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
