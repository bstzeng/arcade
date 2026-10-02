/* Validated local-save boundary. Winning records carry independently replayable moves. */
(function(root,f){const api=f();if(typeof module==='object'&&module.exports)module.exports=api;else root.FifteenSession=api;})(globalThis,function(){
'use strict';
function fresh(index=0,completed={}){return {version:1,index,actions:[],seconds:0,assisted:false,completed};}
function validTime(x){return Number.isInteger(x)&&x>=0&&x<=8640000;}
function restore(raw,levels,E){const out=fresh();if(raw===null||raw===undefined)return {data:out,invalid:false};let v;try{v=JSON.parse(raw);}catch{return {data:out,invalid:true};}if(!v||v.version!==1||!v.completed||typeof v.completed!=='object'||Array.isArray(v.completed))return {data:out,invalid:true};let invalid=false;
 for(const [k,r] of Object.entries(v.completed)){const i=Number(k);if(!Number.isInteger(i)||i<0||i>=levels.length||!r||!Array.isArray(r.witness)||r.moves!==r.witness.length||!validTime(r.seconds)||typeof r.assisted!=='boolean'){invalid=true;continue;}try{if(!E.won(levels[i],E.replay(levels[i],r.witness).at(-1)))throw Error('not won');out.completed[i]={moves:r.moves,seconds:r.seconds,assisted:r.assisted,witness:r.witness};}catch{invalid=true;}}
 try{if(!Number.isInteger(v.index)||v.index<0||v.index>=levels.length||!validTime(v.seconds)||typeof v.assisted!=='boolean')throw Error('bad fields');E.replay(levels[v.index],v.actions);out.index=v.index;out.actions=v.actions;out.seconds=v.seconds;out.assisted=v.assisted;}catch{invalid=true;}return {data:out,invalid};}
function record(data,l,E){if(!E.won(l,E.replay(l,data.actions).at(-1)))return false;const candidate={moves:data.actions.length,seconds:data.seconds,assisted:data.assisted,witness:JSON.parse(JSON.stringify(data.actions))},old=data.completed[data.index];if(!old||(old.assisted&&!candidate.assisted)||(old.assisted===candidate.assisted&&(candidate.moves<old.moves||(candidate.moves===old.moves&&candidate.seconds<old.seconds))))data.completed[data.index]=candidate;return true;}
return {fresh,restore,record};
});
