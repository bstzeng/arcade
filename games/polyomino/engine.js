(function(root){'use strict';
function normalize(a){const r=Math.min(...a.map(p=>p[0])),c=Math.min(...a.map(p=>p[1]));return a.map(([x,y])=>[x-r,y-c]).sort((a,b)=>a[0]-b[0]||a[1]-b[1])}
function rotate(a){return normalize(a.map(([r,c])=>[c,-r]))}function flip(a){return normalize(a.map(([r,c])=>[r,-c]))}
function forms(a){const out=[];for(const f of [a,flip(a)]){let q=f;for(let i=0;i<4;i++){const s=normalize(q);if(!out.some(x=>JSON.stringify(x)===JSON.stringify(s)))out.push(s);q=rotate(q)}}return out}
function initial(l){return l.pieces.map(()=>null)}
function board(l,s){const out=Array(l.h*l.w).fill(-1);for(const i of l.blocked)out[i]=-2;for(let i=0;i<s.length;i++)if(s[i])for(const[r,c]of s[i].cells){let rr=s[i].row+r,cc=s[i].col+c;if(rr<0||cc<0||rr>=l.h||cc>=l.w||out[rr*l.w+cc]!==-1)throw Error('overlap/outside');out[rr*l.w+cc]=i}return out}
function valid(l,s){try{if(!Array.isArray(s)||s.length!==l.pieces.length)return false;for(let i=0;i<s.length;i++){let p=s[i];if(p&&(!Number.isInteger(p.row)||!Number.isInteger(p.col)||!Array.isArray(p.cells)||!p.cells.every(a=>Array.isArray(a)&&a.length===2&&a.every(Number.isInteger))||!forms(l.pieces[i].cells).some(f=>JSON.stringify(f)===JSON.stringify(p.cells))))return false}board(l,s);return true}catch(e){return false}}
function won(l,s){return valid(l,s)&&s.every(Boolean)&&!board(l,s).includes(-1)}
function place(l,s,i,cells,row,col){if(!valid(l,s)||!Number.isInteger(i)||i<0||i>=s.length)throw Error('invalid piece');const a=JSON.parse(JSON.stringify(s));a[i]={cells:normalize(cells),row,col};if(!valid(l,a))throw Error('此處重疊、超出棋盤或被障礙擋住');return a}
const api={normalize,rotate,flip,forms,initial,valid,won,board,place};if(typeof module!=='undefined')module.exports=api;root.PuzzleEngine=api;
})(typeof window!=='undefined'?window:globalThis);
