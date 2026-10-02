(function(root){'use strict';
function validCells(p,c,E){return Array.isArray(c)&&c.length===E.initial(p).length&&c.every((x,i)=>Number.isInteger(x)&&x>=0&&x<=2&&(!p.clues||!p.clues[i]||x===1));}
function integer(v){return Number.isSafeInteger(v)&&v>=0?v:0;}function fresh(){return{version:1,index:0,records:{},finished:{}};}
function snapshot(r){return{cells:r.cells.slice(),hints:r.hints,moves:r.moves};}
function sanitize(raw,levels,E){const out=fresh();if(!raw||raw.version!==1)return out;if(Number.isInteger(raw.index)&&raw.index>=0&&raw.index<levels.length)out.index=raw.index;for(let i=0;i<levels.length;i++){const p=levels[i],r=raw.records?.[i];if(r&&validCells(p,r.cells,E)){out.records[i]={cells:r.cells.slice(),moves:integer(r.moves),hints:integer(r.hints),undo:[]};if(Array.isArray(r.undo))out.records[i].undo=r.undo.filter(a=>a&&validCells(p,a.cells,E)).slice(-160).map(a=>({cells:a.cells.slice(),hints:integer(a.hints),moves:integer(a.moves)}));}const f=raw.finished?.[i];if(f&&validCells(p,f.cells,E)&&E.validateSolution(p,f.cells))out.finished[i]={cells:f.cells.slice(),assisted:!!f.assisted};}return out;}
function record(state,levels,E){return state.records[state.index]??(state.records[state.index]={cells:E.initial(levels[state.index]),moves:0,hints:0,undo:[]});}
function push(r){r.undo.push(snapshot(r));if(r.undo.length>160)r.undo.shift();}
function apply(s,levels,E,i,v){const p=levels[s.index],r=record(s,levels,E);if(!Number.isInteger(i)||i<0||i>=r.cells.length||p.clues?.[i]||![0,1,2].includes(v)||r.cells[i]===v)return false;push(r);r.cells[i]=v;r.moves++;return true;}
function undo(s,levels,E){const r=record(s,levels,E);if(!r.undo.length)return false;const old=r.undo.pop();r.cells=old.cells;r.moves=old.moves;r.hints=Math.max(r.hints,old.hints);return true;}
function restart(s,levels,E){const r=record(s,levels,E);push(r);r.cells=E.initial(levels[s.index]);r.moves=0;r.hints=0;return true;}
function markWin(s,levels,E){const r=record(s,levels,E),p=levels[s.index];if(!E.validateSolution(p,r.cells))return false;const old=s.finished[s.index];s.finished[s.index]={cells:r.cells.slice(),assisted:old?old.assisted&&r.hints>0:r.hints>0};return true;}
const api={fresh,sanitize,validCells,record,apply,undo,restart,markWin};if(typeof module!=='undefined')module.exports=api;else root.PuzzleState=api;
})(globalThis);
