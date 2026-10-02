(function(root){'use strict';
function geometry(l){const edges=[],cells=[],vertices=Array.from({length:(l.h+1)*(l.w+1)},()=>[]);for(let r=0;r<=l.h;r++)for(let c=0;c<l.w;c++)edges.push([r*(l.w+1)+c,r*(l.w+1)+c+1]);for(let r=0;r<l.h;r++)for(let c=0;c<=l.w;c++)edges.push([r*(l.w+1)+c,(r+1)*(l.w+1)+c]);let off=(l.h+1)*l.w;for(let r=0;r<l.h;r++)for(let c=0;c<l.w;c++)cells.push([r*l.w+c,(r+1)*l.w+c,off+r*(l.w+1)+c,off+r*(l.w+1)+c+1]);edges.forEach(([a,b],i)=>{vertices[a].push(i);vertices[b].push(i)});return{edges,cells,vertices}}
function initial(l){return Array(geometry(l).edges.length).fill(0)}
function valid(l,s){return Array.isArray(s)&&s.length===initial(l).length&&s.every(x=>[-1,0,1].includes(x))}
function won(l,s){if(!valid(l,s))return false;const g=geometry(l);if(g.cells.some((ids,i)=>l.clues[i]!==null&&ids.filter(j=>s[j]===1).length!==l.clues[i]))return false;if(g.vertices.some(ids=>![0,2].includes(ids.filter(j=>s[j]===1).length)))return false;const active=g.edges.flatMap(([a,b],i)=>s[i]===1?[a,b]:[]);if(!active.length)return false;const seen=new Set([active[0]]),todo=[active[0]];for(const a of todo)for(const i of g.vertices[a])if(s[i]===1){for(const b of g.edges[i])if(!seen.has(b)){seen.add(b);todo.push(b)}}return new Set(active).size===seen.size}
function act(l,s,i){if(!valid(l,s)||!Number.isInteger(i)||i<0||i>=s.length)throw Error('invalid edge');const a=s.slice();a[i]=s[i]===0?1:s[i]===1?-1:0;return a}
const api={geometry,initial,valid,won,act};if(typeof module!=='undefined')module.exports=api;root.PuzzleEngine=api;
})(typeof window!=='undefined'?window:globalThis);
