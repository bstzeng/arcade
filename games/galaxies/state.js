(function(root){'use strict';
const integer=v=>Number.isSafeInteger(v)&&v>=0?v:0;
function fresh(){return{version:1,index:0,records:{},finished:{}};}
function snapshot(r){return{cells:r.cells.slice(),moves:r.moves,hints:r.hints};}
function sanitize(raw,L,E){const s=fresh();if(!raw||raw.version!==1)return s;if(Number.isInteger(raw.index)&&raw.index>=0&&raw.index<L.length)s.index=raw.index;for(let i=0;i<L.length;i++){const p=L[i],r=raw.records?.[i];if(r&&E.validState(p,r.cells)){s.records[i]={cells:r.cells.slice(),moves:integer(r.moves),hints:integer(r.hints),undo:[]};if(Array.isArray(r.undo))s.records[i].undo=r.undo.filter(x=>x&&E.validState(p,x.cells)).slice(-160).map(x=>({cells:x.cells.slice(),moves:integer(x.moves),hints:integer(x.hints)}));}const f=raw.finished?.[i];if(f&&E.validState(p,f.cells)&&E.validateSolution(p,f.cells))s.finished[i]={cells:f.cells.slice(),assisted:!!f.assisted};}return s;}
function record(s,L,E){return s.records[s.index]??(s.records[s.index]={cells:E.empty(L[s.index]),moves:0,hints:0,undo:[]});}
function push(r){r.undo.push(snapshot(r));if(r.undo.length>160)r.undo.shift();}
function apply(s,L,E,cells,hint=false){const p=L[s.index],r=record(s,L,E);if(!E.validState(p,cells)||r.cells.every((v,i)=>v===cells[i]))return false;push(r);r.cells=cells.slice();r.moves++;if(hint)r.hints++;return true;}
function undo(s,L,E){const r=record(s,L,E),a=r.undo.pop();if(!a)return false;r.cells=a.cells;r.moves=a.moves;r.hints=Math.max(r.hints,a.hints);return true;}
function restart(s,L,E){const r=record(s,L,E);push(r);r.cells=E.empty(L[s.index]);r.moves=0;r.hints=0;return true;}
function markWin(s,L,E){const r=record(s,L,E);if(!E.validateSolution(L[s.index],r.cells))return false;const old=s.finished[s.index];s.finished[s.index]={cells:r.cells.slice(),assisted:old?old.assisted&&r.hints>0:r.hints>0};return true;}
const api={fresh,sanitize,record,apply,undo,restart,markWin};if(typeof module!=='undefined')module.exports=api;else root.PuzzleState=api;
})(globalThis);
