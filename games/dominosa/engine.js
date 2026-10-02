(function(root){'use strict';
function adjacent(p,a,b){return Number.isInteger(a)&&Number.isInteger(b)&&a>=0&&b>=0&&a<p.width*p.height&&b<p.width*p.height&&(Math.abs(a-b)===p.width||(Math.floor(a/p.width)===Math.floor(b/p.width)&&Math.abs(a-b)===1))}
function valid(p,a){return Array.isArray(a)&&a.length===p.width*p.height&&a.every((b,i)=>Number.isInteger(b)&&(b===-1||(adjacent(p,i,b)&&a[b]===i)))}
function state(p,s){if(!s||!valid(p,s.links)||!Array.isArray(s.history)||s.history.length>1000||!s.history.every(a=>valid(p,a)))return{links:Array(p.width*p.height).fill(-1),history:[]};return{links:s.links.slice(),history:s.history.map(a=>a.slice())}}
function remember(s){s.history.push(s.links.slice());if(s.history.length>1000)s.history.shift()}
function connect(p,s,a,b){if(!adjacent(p,a,b))return false;if(s.links[a]===b){remember(s);s.links[a]=s.links[b]=-1;return true}if(s.links[a]!==-1||s.links[b]!==-1)return false;remember(s);s.links[a]=b;s.links[b]=a;return true}
function clear(p,s,a){if(!Number.isInteger(a)||a<0||a>=s.links.length||s.links[a]===-1)return false;remember(s);let b=s.links[a];s.links[a]=s.links[b]=-1;return true}
function undo(p,s){if(!s.history.length)return false;s.links=s.history.pop();return true}
function inspect(p,a){let counts={},tiles=[],bad=new Set;if(!valid(p,a))return{won:false,tiles,counts,bad,filled:0};a.forEach((b,i)=>{if(b>i){let key=[p.board[i],p.board[b]].sort((a,b)=>a-b).join('–');tiles.push([i,b,key]);counts[key]=(counts[key]||0)+1}});for(let[i,b,key]of tiles)if(counts[key]>1){bad.add(i);bad.add(b)}return{won:tiles.length*2===a.length&&!bad.size,tiles,counts,bad,filled:tiles.length*2}}
function solution(p){let a=Array(p.width*p.height).fill(-1);for(let[i,j]of p.solution)a[i]=j,a[j]=i;return a}
root.DominosaEngine={adjacent,valid,state,connect,clear,undo,inspect,solution};if(typeof module!=='undefined')module.exports=root.DominosaEngine;
})(typeof window==='undefined'?globalThis:window);
