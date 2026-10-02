/* Deterministic construction from zero by legal toggles; exact GF(2) solutions. */
const fs=require('node:fs'),path=require('node:path'),E=require('./engine.js');
let seed=0x11C4750;const random=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296;};
const seen=new Set(),levels=[];
for(let i=0;i<50;i++){
 const size=i<10?3:i<22?4:i<36?5:6;
 const target=i<10?1+Math.floor(i/2):i<22?3+Math.floor((i-10)/3):i<36?5+Math.floor((i-22)/2):10+Math.floor((i-36)/2);
 let made=false;for(let attempt=0;attempt<100000&&!made;attempt++){
  const l={id:i+1,size,lights:Array(size*size).fill(0),tier:Math.floor(i/5)+1};const indices=Array.from({length:size*size},(_,j)=>j);for(let j=indices.length-1;j>0;j--){const k=Math.floor(random()*(j+1));[indices[j],indices[k]]=[indices[k],indices[j]];}
  for(const click of indices.slice(0,target))l.lights=E.step(l,l.lights,click);l.solution=E.solve(l,l.lights);if(!l.solution||l.solution.length!==target)continue;const key=E.canonical(l);if(seen.has(key))continue;E.proof(l);l.par=l.solution.length;seen.add(key);levels.push(l);made=true;
 }
 if(!made)throw Error('Generation exhausted at '+(i+1));
}
fs.writeFileSync(path.join(__dirname,'levels.json'),JSON.stringify(levels,null,2)+'\n');fs.writeFileSync(path.join(__dirname,'levels.js'),'/* Generated deterministically; do not hand edit. */\nwindow.LIGHTS_LEVELS='+JSON.stringify(levels)+';\n');console.log(JSON.stringify({levels:levels.length,uniqueUnderD4:seen.size,sizes:[...new Set(levels.map(l=>l.size))],minimumSolutionLengths:[...new Set(levels.map(l=>l.par))]}));
