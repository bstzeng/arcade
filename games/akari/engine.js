(function(root){'use strict';
function white(p,i){return Number.isInteger(i)&&i>=0&&i<p.size*p.size&&p.board[Math.floor(i/p.size)][i%p.size]==='.'}
function visible(p,i){if(!white(p,i))return[];let a=[i],n=p.size,r=Math.floor(i/n),c=i%n;for(let[dr,dc]of[[1,0],[-1,0],[0,1],[0,-1]]){let y=r+dr,x=c+dc;while(y>=0&&y<n&&x>=0&&x<n&&white(p,y*n+x)){a.push(y*n+x);y+=dr;x+=dc}}return a}
function inspect(p,marks){let lit=new Set,bad=new Set,bulbs=[];marks.forEach((v,i)=>{if(v===1&&white(p,i))bulbs.push(i)});let set=new Set(bulbs);for(let i of bulbs)for(let j of visible(p,i)){lit.add(j);if(j!==i&&set.has(j)){bad.add(i);bad.add(j)}}let numbers=[],n=p.size;for(let i=0;i<n*n;i++){let ch=p.board[Math.floor(i/n)][i%n];if(!/[0-4]/.test(ch))continue;let r=Math.floor(i/n),c=i%n,near=[];for(let[dr,dc]of[[1,0],[-1,0],[0,1],[0,-1]])if(r+dr>=0&&r+dr<n&&c+dc>=0&&c+dc<n)near.push((r+dr)*n+c+dc);let count=near.filter(j=>set.has(j)).length;numbers.push({i,count,target:+ch})}let total=p.board.join('').split('').filter(x=>x==='.').length;return{lit,bad,bulbs,numbers,total,won:lit.size===total&&!bad.size&&numbers.every(a=>a.count===a.target)}}
function validMarks(p,a){return Array.isArray(a)&&a.length===p.size*p.size&&a.every((v,i)=>Number.isInteger(v)&&v>=0&&v<=2&&(white(p,i)||v===0))}
function state(p,s){if(!s||!validMarks(p,s.marks)||!Array.isArray(s.history)||s.history.length>1500||!s.history.every(a=>validMarks(p,a)))return{marks:Array(p.size*p.size).fill(0),history:[]};return{marks:s.marks.slice(),history:s.history.map(a=>a.slice())}}
function cycle(p,s,i,back=false){if(!white(p,i))return false;s.history.push(s.marks.slice());if(s.history.length>1500)s.history.shift();s.marks[i]=(s.marks[i]+(back?2:1))%3;return true}
function undo(p,s){if(!s.history.length)return false;s.marks=s.history.pop();return true}
root.AkariEngine={white,visible,inspect,validMarks,state,cycle,undo};if(typeof module!=='undefined')module.exports=root.AkariEngine;
})(typeof window==='undefined'?globalThis:window);
