/* Deterministic reverse-jump construction. Run: node generate.cjs */
const fs=require('node:fs'),path=require('node:path'),E=require('./engine.js');
let seed=0x50D1A202;const random=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296;};
const pick=a=>a[Math.floor(random()*a.length)];
const shapes=[
 {name:'小方庭',w:4,h:4,cell:()=>true},
 {name:'菱形庭',w:5,h:5,cell:(x,y)=>Math.abs(x-2)+Math.abs(y-2)<=2},
 {name:'十字庭',w:5,h:5,cell:(x,y)=>x>=1&&x<=3||y>=1&&y<=3},
 {name:'長方庭',w:5,h:4,cell:()=>true},
 {name:'方形庭',w:5,h:5,cell:()=>true},
 {name:'英式十字',w:7,h:7,cell:(x,y)=>x>=2&&x<=4||y>=2&&y<=4},
 {name:'大菱形',w:7,h:7,cell:(x,y)=>Math.abs(x-3)+Math.abs(y-3)<=3},
 {name:'六角方庭',w:6,h:6,cell:(x,y)=>!(x===0&&y===0||x===5&&y===5||x===5&&y===0||x===0&&y===5)},
 {name:'長廊庭',w:7,h:5,cell:(x,y)=>y!==0&&y!==4||x>=2&&x<=4},
 {name:'六方庭',w:6,h:6,cell:()=>true}
];
const seen=new Set(),levels=[];let attempts=0;
for(let i=0;i<50;i++){
 const target=3+Math.floor(i/2),tier=Math.floor(i/5),pool=tier<2?[0,1,2,3]:tier<4?[2,3,4,6]:tier<6?[4,5,6,8]:[5,7,8,9];let made=false;
 while(!made){attempts++;if(attempts>200000)throw Error('Generation exhausted');const shape=shapes[pool[(i+Math.floor(random()*pool.length))%pool.length]],cells=[];for(let y=0;y<shape.h;y++)for(let x=0;x<shape.w;x++)if(shape.cell(x,y))cells.push(y*shape.w+x);
 const goal=pick(cells),l={id:i+1,name:shape.name,width:shape.w,height:shape.h,cells,pegs:[goal],goal:i%3===2?goal:null,solution:[]},triples=E.geometry(l);let occupied=new Set([goal]),rev=[];
 for(let k=1;k<target;k++){const options=triples.filter(m=>!occupied.has(m.from)&&!occupied.has(m.over)&&occupied.has(m.to));if(!options.length)break;const m=pick(options);occupied.delete(m.to);occupied.add(m.from);occupied.add(m.over);rev.push(m);}
 if(occupied.size!==target)continue;l.pegs=[...occupied].sort((a,b)=>a-b);l.solution=rev.reverse();const key=E.canonical(l);if(seen.has(key))continue;E.proof(l);l.tier=tier+1;l.openingChoices=E.moves(l,l.pegs).length;seen.add(key);levels.push(l);made=true;
 }
}
fs.writeFileSync(path.join(__dirname,'levels.json'),JSON.stringify(levels,null,2)+'\n');fs.writeFileSync(path.join(__dirname,'levels.js'),'/* Generated deterministically; do not hand edit. */\nwindow.PEG_LEVELS='+JSON.stringify(levels)+';\n');
console.log(JSON.stringify({levels:levels.length,uniqueUnderD4:seen.size,attempts,pegs:[Math.min(...levels.map(l=>l.pegs.length)),Math.max(...levels.map(l=>l.pegs.length))],shapes:[...new Set(levels.map(l=>l.name))]}));
