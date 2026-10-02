/* Storage boundary: restore by legal replay; never trust a serialized board. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PegSession=api;})(globalThis,function(){
'use strict';
function record(v){return v&&Number.isInteger(v.moves)&&v.moves>=0&&Number.isFinite(v.seconds)&&v.seconds>=0&&typeof v.assisted==='boolean';}
function restore(raw,levels,E){if(!raw||raw.version!==1||!Number.isInteger(raw.index)||raw.index<0||raw.index>=levels.length||!Array.isArray(raw.actions)||!Number.isFinite(raw.seconds)||raw.seconds<0||typeof raw.assisted!=='boolean')throw Error('無效存檔');const l=levels[raw.index],states=E.replay(l,raw.actions),progress={};if(raw.progress&&typeof raw.progress==='object'&&!Array.isArray(raw.progress))for(let i=0;i<levels.length;i++){const r=raw.progress[i];if(record(r)&&r.moves===levels[i].pegs.length-1&&Array.isArray(r.witness)&&r.witness.length===r.moves){try{const proof=E.replay(levels[i],r.witness);if(E.won(levels[i],proof.at(-1)))progress[i]={moves:r.moves,seconds:r.seconds,assisted:r.assisted,witness:r.witness.map(a=>({from:a.from,over:a.over,to:a.to}))};}catch(_){}}}return {index:raw.index,actions:raw.actions.map(a=>({from:a.from,over:a.over,to:a.to})),states,seconds:raw.seconds,assisted:raw.assisted,progress};}
return {restore};
});
