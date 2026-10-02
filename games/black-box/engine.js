/* Original implementation. Rules and edge-case notes: README.md. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.BlackBox=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
function port(n,p){if(p<n)return[p,-1,0,1];if(p<2*n)return[n,p-n,-1,0];if(p<3*n)return[p-2*n,n,0,-1];return[-1,p-3*n,1,0];}
function exitPort(n,x,y){if(y<0)return x;if(x>=n)return n+y;if(y>=n)return 2*n+x;if(x<0)return 3*n+y;throw Error('Not an exit');}
function ray(n,atoms,p,detail=false){
 const occupied=new Set(atoms);const has=(x,y)=>x>=0&&y>=0&&x<n&&y<n&&occupied.has(y*n+x);
 let[x,y,dx,dy]=port(n,p),entered=false,turns=0;const path=[[x,y]],seen=new Set();
 for(let steps=0;steps<8*n*n+16;steps++){
  const key=[x,y,dx,dy].join(',');if(seen.has(key))throw Error('Unreachable closed ray orbit');seen.add(key);
  const nx=x+dx,ny=y+dy;
  if(has(nx,ny))return detail?{result:'H',path:path.concat([[nx,ny]]),turns,kind:'hit'}:'H';
  const left=has(nx+dy,ny-dx),right=has(nx-dy,ny+dx);
  if(!entered&&(left||right))return detail?{result:'R',path,turns:1,kind:'entry-reflection'}:'R';
  if(left||right){turns++;if(left&&right){dx=-dx;dy=-dy;}else if(left){[dx,dy]=[-dy,dx];}else{[dx,dy]=[dy,-dx];}continue;}
  x=nx;y=ny;path.push([x,y]);
  if(x<0||x>=n||y<0||y>=n){const out=exitPort(n,x,y),result=out===p?'R':out;return detail?{result,path,turns,kind:result==='R'?'return-reflection':'exit'}:result;}
  entered=true;
 }
 throw Error('Ray step bound exceeded');
}
function signature(n,atoms){return Array.from({length:4*n},(_,p)=>ray(n,atoms,p));}
function validAtoms(level,atoms){return Array.isArray(atoms)&&atoms.length===level.atoms.length&&new Set(atoms).size===atoms.length&&atoms.every(i=>Number.isInteger(i)&&i>=0&&i<level.n*level.n);}
function solved(level,marks){return validAtoms(level,marks)&&marks.every(i=>level.atoms.includes(i));}
function label(n,p){return['上','右','下','左'][Math.floor(p/n)]+(p%n+1);}
function canonical(n,atoms){let all=[];for(let flip=0;flip<2;flip++)for(let rot=0;rot<4;rot++){all.push(atoms.map(i=>{let x=i%n,y=Math.floor(i/n);if(flip)x=n-1-x;for(let k=0;k<rot;k++)[x,y]=[n-1-y,x];return y*n+x;}).sort((a,b)=>a-b).join(','));}return all.sort()[0];}
function initial(){return{marks:[],excluded:[],probes:[],moves:0,assisted:false,won:false};}
function replay(level,actions){let s=initial(),history=[];if(!Array.isArray(actions)||actions.length>5000)throw Error('Bad actions');for(const a of actions){if(!a||typeof a!=='object')throw Error('Bad action');if(a.type==='assist'){s.assisted=true;continue;}if(a.type==='undo'){if(history.length){let assisted=s.assisted;s=history.pop();s.assisted=assisted;}continue;}if(s.won)throw Error('Action after win');if(a.type==='mark'||a.type==='exclude'){if(!Number.isInteger(a.i)||a.i<0||a.i>=level.n**2)throw Error('Bad cell');history.push(JSON.parse(JSON.stringify(s)));const k=a.type==='mark'?'marks':'excluded',other=k==='marks'?'excluded':'marks';s[other]=s[other].filter(x=>x!==a.i);s[k]=s[k].includes(a.i)?s[k].filter(x=>x!==a.i):s[k].concat(a.i).sort((x,y)=>x-y);s.moves++;}else if(a.type==='probe'){if(!Number.isInteger(a.p)||a.p<0||a.p>=4*level.n||s.probes.includes(a.p))throw Error('Bad probe');history.push(JSON.parse(JSON.stringify(s)));s.probes.push(a.p);s.moves++;}else if(a.type==='check'){s.won=solved(level,s.marks);}else throw Error('Unknown action');}s.undoCount=history.length;return s;}
return{port,ray,signature,validAtoms,solved,label,canonical,initial,replay};
});
