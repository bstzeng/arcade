(function(root){'use strict';const U=root.CompetitiveUtil||(typeof require==='function'?require('../competitive-common/core.js'):null),W=4,H=4,EH=W*(H+1),E=EH+(W+1)*H;
function edges(box){const x=box%W,y=Math.floor(box/W);return[y*W+x,(y+1)*W+x,EH+y*(W+1)+x,EH+y*(W+1)+x+1];}
function initial(){return{board:Array(E).fill(0),boxes:Array(W*H).fill(0),turn:1,ply:0};}
function legal(s){return s.board.flatMap((x,edge)=>x?[]:[{edge}]);}
function apply(s,m){const b=s.board.slice(),boxes=s.boxes.slice();b[m.edge]=s.turn;let n=0;for(let i=0;i<W*H;i++)if(!boxes[i]&&edges(i).every(j=>b[j])){boxes[i]=s.turn;n++;}return{board:b,boxes,turn:n?s.turn:-s.turn,ply:s.ply+1};}
function outcome(s){if(s.boxes.every(Boolean)){const n=s.boxes.reduce((a,b)=>a+b,0);return{winner:Math.sign(n),reason:'方格：紅 '+s.boxes.filter(x=>x===1).length+'／藍 '+s.boxes.filter(x=>x===-1).length};}return null;}
function evaluate(s,p){let v=s.boxes.reduce((a,b)=>a+b,0)*p*15;for(let i=0;i<W*H;i++)if(!s.boxes[i]){const n=edges(i).filter(j=>s.board[j]).length;if(n===3)v+=s.turn*p*5;if(n===2)v-=s.turn*p;}return v;}
const e=U.attach('dots-and-boxes',{width:W,height:H,initial,legal,apply,outcome,evaluate,edges,EH,labels:{'1':'紅','-1':'藍'},names:{'1':'紅方','-1':'藍方'},describe:m=>m.edge<EH?'橫線 '+(m.edge+1):'直線 '+(m.edge-EH+1),validate:s=>!!s&&Array.isArray(s.board)&&s.board.length===E&&s.board.every(x=>[-1,0,1].includes(x))&&Array.isArray(s.boxes)&&s.boxes.length===W*H&&s.boxes.every((x,i)=>[-1,0,1].includes(x)&&Boolean(x)===edges(i).every(j=>s.board[j]))&&[1,-1].includes(s.turn)&&Number.isInteger(s.ply)});if(typeof module!=='undefined')module.exports=e;
})(typeof globalThis!=='undefined'?globalThis:this);
