(function(root){'use strict';
function score(secret,guess){let black=0,countsA={},countsB={};secret.forEach((x,i)=>{if(x===guess[i])black++;else{countsA[x]=(countsA[x]||0)+1;countsB[guess[i]]=(countsB[guess[i]]||0)+1}});return[black,Object.keys(countsA).reduce((n,k)=>n+Math.min(countsA[k],countsB[k]||0),0)]}
function validCode(code,p,partial=false){return Array.isArray(code)&&code.length===p.length&&code.every(x=>(partial&&x===null)||Number.isInteger(x)&&x>=0&&x<p.colors)&&(partial||p.repeat||new Set(code).size===p.length)}
function state(p,s){if(!s||typeof s!=='object'||!Array.isArray(s.guesses)||s.guesses.length>p.limit||!s.guesses.every(g=>validCode(g,p))||!validCode(s.draft,p,true))return{guesses:[],draft:Array(p.length).fill(null)};let win=s.guesses.findIndex(g=>score(p.solution,g)[0]===p.length);return{guesses:s.guesses.slice(0,win>=0?win+1:undefined).map(g=>g.slice()),draft:s.draft.slice()}}
function won(p,s){return s.guesses.some(g=>score(p.solution,g)[0]===p.length)}
function submit(p,s){if(won(p,s)||s.guesses.length>=p.limit||!validCode(s.draft,p))return false;s.guesses.push(s.draft.slice());s.draft=Array(p.length).fill(null);return true}
function undo(p,s){if(!s.guesses.length)return false;s.draft=s.guesses.pop().slice();return true}
root.MastermindEngine={score,validCode,state,won,submit,undo};if(typeof module!=='undefined')module.exports=root.MastermindEngine;
})(typeof window==='undefined'?globalThis:window);
