(function(root,f){const api=f();if(typeof module==='object'&&module.exports)module.exports=api;else root.UntangleEngine=api})(globalThis,function(){'use strict';
const clone=s=>s.map(p=>p.slice()),equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b),dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
function valid(l,s){return Array.isArray(s)&&s.length===l.start.length&&s.every(p=>Array.isArray(p)&&p.length===2&&p.every(v=>Number.isFinite(v)&&v>=5&&v<=95))}
function initial(l){return clone(l.start)}
function orient(a,b,c){return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])}
function on(a,b,p){return Math.abs(orient(a,b,p))<1e-7&&p[0]>=Math.min(a[0],b[0])-1e-7&&p[0]<=Math.max(a[0],b[0])+1e-7&&p[1]>=Math.min(a[1],b[1])-1e-7&&p[1]<=Math.max(a[1],b[1])+1e-7}
function intersects(a,b,c,d){let x=orient(a,b,c),y=orient(a,b,d),z=orient(c,d,a),w=orient(c,d,b);return x*y<-1e-10&&z*w<-1e-10||on(a,b,c)||on(a,b,d)||on(c,d,a)||on(c,d,b)}
function pointDistance(p,a,b){let dx=b[0]-a[0],dy=b[1]-a[1],len=dx*dx+dy*dy;if(len===0)return dist(p,a);let t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/len));return dist(p,[a[0]+t*dx,a[1]+t*dy])}
function inspect(l,s){const badEdges=new Set,badNodes=new Set;let crossings=0,overlaps=0;if(!valid(l,s))return {won:false,crossings:0,overlaps:1,badEdges,badNodes};for(let i=0;i<s.length;i++)for(let j=i+1;j<s.length;j++)if(dist(s[i],s[j])<5.5){badNodes.add(i);badNodes.add(j);overlaps++}l.edges.forEach(([a,b],i)=>{s.forEach((p,j)=>{if(j!==a&&j!==b&&pointDistance(p,s[a],s[b])<1.2){badNodes.add(j);badEdges.add(i);overlaps++}});for(let j=i+1;j<l.edges.length;j++){let [c,d]=l.edges[j];if([a,b].includes(c)||[a,b].includes(d))continue;if(intersects(s[a],s[b],s[c],s[d])){crossings++;badEdges.add(i);badEdges.add(j);[a,b,c,d].forEach(n=>badNodes.add(n))}}});return {won:!crossings&&!overlaps,crossings,overlaps,badEdges,badNodes}}
function step(l,s,a){if(!valid(l,s)||!a||!Number.isInteger(a.node)||a.node<0||a.node>=s.length||![a.x,a.y].every(v=>Number.isFinite(v)&&v>=5&&v<=95))throw Error('節點移動格式錯誤');const out=clone(s);out[a.node]=[a.x,a.y];return out}
function won(l,s){return inspect(l,s).won}
function replay(l,actions){if(!Array.isArray(actions)||actions.length>10000)throw Error('記錄格式錯誤');const states=[initial(l)];for(const a of actions)states.push(step(l,states.at(-1),a));return states}
function record(l,d){let actions=[],completed=null;try{if(d&&Array.isArray(d.actions)){replay(l,d.actions);actions=d.actions.map(a=>({...a}))}}catch(e){}try{if(d&&Array.isArray(d.completed)&&won(l,replay(l,d.completed).at(-1)))completed=d.completed.map(a=>({...a}))}catch(e){}return {actions,completed}}
function solutionMoves(l){return l.solution.map(([x,y],node)=>({node,x,y}))}
return {clone,equal,dist,valid,initial,orient,on,intersects,pointDistance,inspect,step,won,replay,record,solutionMoves};});
