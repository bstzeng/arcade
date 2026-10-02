(function(root){'use strict';
function valid(p,a){return Array.isArray(a)&&a.length===p.size*p.size&&a.every((v,i)=>Number.isInteger(v)&&v>=0&&v<=2&&(!p.clues[i]||v===p.clues[i]))}
function state(p,s){if(!s||!valid(p,s.marks)||!Array.isArray(s.history)||s.history.length>1000||!s.history.every(a=>valid(p,a)))return{marks:p.clues.slice(),history:[]};return{marks:s.marks.slice(),history:s.history.map(a=>a.slice())}}
function set(p,s,i,value){if(!Number.isInteger(i)||i<0||i>=p.size*p.size||p.clues[i]||![0,1,2].includes(value)||s.marks[i]===value)return false;s.history.push(s.marks.slice());if(s.history.length>1000)s.history.shift();s.marks[i]=value;return true}
function cycle(p,s,i,back=false){return set(p,s,i,(s.marks[i]+(back?2:1))%3)}
function undo(p,s){if(!s.history.length)return false;s.marks=s.history.pop();return true}
function inspect(p,a){let n=p.size,bad=new Set,lines=[],filled=a.filter(Boolean).length;for(let axis=0;axis<2;axis++)for(let r=0;r<n;r++){let cells=Array.from({length:n},(_,c)=>axis?c*n+r:r*n+c),black=cells.filter(i=>a[i]===1).length,white=cells.filter(i=>a[i]===2).length;lines.push({axis,index:r,black,white,complete:black===n/2&&white===n/2});for(let value of[1,2])if(cells.filter(i=>a[i]===value).length>n/2)cells.filter(i=>a[i]===value).forEach(i=>bad.add(i));for(let c=0;c<n-2;c++){let trip=cells.slice(c,c+3);if(a[trip[0]]&&trip.every(i=>a[i]===a[trip[0]]))trip.forEach(i=>bad.add(i))}}return{bad,lines,filled,won:valid(p,a)&&filled===n*n&&!bad.size&&lines.every(x=>x.complete)}}
root.UnrulyEngine={valid,state,set,cycle,undo,inspect};if(typeof module!=='undefined')module.exports=root.UnrulyEngine;
})(typeof window==='undefined'?globalThis:window);
