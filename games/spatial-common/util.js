(function(root,factory){const u=factory();if(typeof module==='object'&&module.exports)module.exports=u;else root.SpatialUtil=u;})(globalThis,function(){'use strict';
const clone=x=>JSON.parse(JSON.stringify(x)), same=(a,b)=>JSON.stringify(a)===JSON.stringify(b), integer=(n,a,b)=>Number.isInteger(n)&&n>=a&&n<=b, key=p=>p.join(','), sum=a=>a.reduce((s,x)=>s+x,0), neg=v=>v.map(x=>-x), dot=(a,b)=>sum(a.map((x,i)=>x*b[i]));
function demand(x,text){if(!x)throw Error(text||'這個動作目前無法使用。');}
const identity=[1,0,0,0,1,0,0,0,1], turn={x:[1,0,0,0,0,-1,0,1,0],y:[0,0,1,0,1,0,-1,0,0],z:[0,-1,0,1,0,0,0,0,1]};
const mul=(a,b)=>Array.from({length:9},(_,i)=>sum([0,1,2].map(k=>a[Math.floor(i/3)*3+k]*b[k*3+i%3]))), vec=(a,v)=>[0,1,2].map(i=>dot(a.slice(i*3,i*3+3),v));
const rotations=[identity];for(let i=0;i<rotations.length;i++)for(const a of Object.values(turn)){const m=mul(a,rotations[i]);if(!rotations.some(v=>same(v,m)))rotations.push(m);}
const rotateIndex=(r,axis)=>rotations.findIndex(m=>same(m,mul(turn[axis],rotations[r])));
function normalized(cells){const mins=cells[0].map((_,i)=>Math.min(...cells.map(p=>p[i])));return cells.map(p=>p.map((x,i)=>x-mins[i]));}
function transformed(cells,r){return normalized(cells.map(p=>vec(rotations[r],p)));}
function rotated2(cells,r){let q=cells.map(p=>p.slice());for(let i=0;i<r;i++)q=q.map(([x,y])=>[-y,x]);return normalized(q);}
function wrapper(id,spec){const api=Object.assign({},spec);api.validateState=(l,s)=>spec.validateState(l,s)===true;api.id=id;api.rulesRevision='spatial-1.0';api.applyAction=function(l,s,a){demand(api.validateState(l,s),'盤面資料無效。');demand(a&&typeof a==='object','動作資料無效。');demand(!api.inspect(l,s).goalMet,'本關已完成，可撤銷或重開。');const next=spec.act(l,clone(s),a);demand(api.validateState(l,next),'動作產生無效盤面。');return next;};api.canonicalKey=l=>l.canonical;api.hint=function(l,s){if(api.inspect(l,s).goalMet)return{text:'目標已完成。'};let t=api.createState(l);for(const a of l.solution){if(same(t,s))return{text:api.describe?api.describe(l,a):'參考下一步：'+JSON.stringify(a),action:a,kind:'verified-prefix'};t=api.applyAction(l,t,a);}return{text:'目前盤面與參考路線不同。可撤銷接回路線，或用「解答示範」查看一組完整合法做法；示範不會改動你的盤面。',kind:'reference-only'};};return api;}
return{clone,same,integer,key,sum,neg,dot,demand,rotations,rotateIndex,transformed,rotated2,normalized,vec,wrapper};});
