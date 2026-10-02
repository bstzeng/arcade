/* FreeCell rules shared by gameplay and certificate replay. No automatic moves. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.FreeCell=api})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const rank=c=>c%13+1,suit=c=>Math.floor(c/13),color=c=>suit(c)%2;
const clone=s=>({columns:s.columns.map(c=>c.slice()),cells:s.cells.slice(),foundations:s.foundations.slice()});
const initial=columns=>({columns:columns.map(c=>c.slice()),cells:[null,null,null,null],foundations:[0,0,0,0]});
const supports=(under,over)=>rank(under)===rank(over)+1&&color(under)!==color(over);
function validState(s){if(!s||!Array.isArray(s.columns)||s.columns.length!==8||!Array.isArray(s.cells)||s.cells.length!==4||!Array.isArray(s.foundations)||s.foundations.length!==4)return false;let cards=[];for(const col of s.columns){if(!Array.isArray(col)||col.length>52)return false;cards.push(...col)}for(const c of s.cells)if(c!==null)cards.push(c);for(let i=0;i<4;i++){const n=s.foundations[i];if(!Number.isInteger(n)||n<0||n>13)return false;for(let r=0;r<n;r++)cards.push(i*13+r)}return cards.length===52&&cards.every(c=>Number.isInteger(c)&&c>=0&&c<52)&&new Set(cards).size===52}
function capacity(s,dest){return(s.cells.filter(c=>c===null).length+1)*2**s.columns.filter((c,i)=>!c.length&&i!==dest).length}
function error(s,m){if(!Array.isArray(m)||m.length!==5||!m.every(Number.isInteger))return'移動格式不正確';const[f,i,t,j,n]=m;if(![0,1].includes(f)||![0,1,2].includes(t)||i<0||i>=(f===0?8:4)||j<0||j>=(t===0?8:4)||n<1)return'移動位置不正確';if(f===t&&i===j)return'請選擇另一個位置';let cards;if(f===0){if(n>s.columns[i].length)return'選取牌數不正確';cards=s.columns[i].slice(-n);for(let k=1;k<cards.length;k++)if(!supports(cards[k-1],cards[k]))return'只能移動黑紅交錯、由大到小的連續牌組'}else{if(n!==1||s.cells[i]===null)return'暫存格只能移動一張牌';cards=[s.cells[i]]}const c=cards[0];if(t===1){if(n!==1||s.cells[j]!==null)return'暫存格只能放一張牌'}if(t===2){if(n!==1||suit(c)!==j||rank(c)!==s.foundations[j]+1)return'收牌區須按同花色 A → K 排列'}if(t===0){const col=s.columns[j];if(col.length&&!supports(col[col.length-1],c))return'牌列須黑紅交錯、由大到小';if(n>capacity(s,j))return`暫存空間不足：這次最多可搬 ${capacity(s,j)} 張`}return null}
function apply(s,m){const e=error(s,m);if(e)throw Error(e);const out=clone(s),[f,i,t,j,n]=m;const cards=f===0?out.columns[i].splice(-n):[out.cells[i]];if(f===1)out.cells[i]=null;if(t===0)out.columns[j].push(...cards);else if(t===1)out.cells[j]=cards[0];else out.foundations[j]++;return out}
function moves(s){const out=[];for(let f=0;f<2;f++)for(let i=0;i<(f===0?8:4);i++){const max=f===0?s.columns[i].length:(s.cells[i]===null?0:1);for(let n=1;n<=max;n++)for(let t=0;t<3;t++)for(let j=0;j<(t===0?8:4);j++){const m=[f,i,t,j,n];if(!error(s,m))out.push(m)}}return out}
const won=s=>s.foundations.every(n=>n===13);
const key=s=>JSON.stringify([s.columns,s.cells,s.foundations]);
function replay(columns,proof){let state=initial(columns);if(!validState(state))throw Error('Invalid starting deck');for(const m of proof){state=apply(state,m);if(!validState(state))throw Error('Lost or duplicated card')}return state}
return{rank,suit,color,clone,initial,supports,validState,capacity,error,apply,moves,won,key,replay};
});
