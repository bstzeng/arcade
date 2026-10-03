'use strict';
const fs=require('fs'),path=require('path'),E=require('./engine.js');const root=path.resolve(__dirname,'../..');
let seed=12015;function rand(n){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return (seed>>>8)%n;}const arr=(n,f)=>Array.from({length:n},(_,i)=>f(i));const pick=a=>a[rand(a.length)];
const spec=JSON.parse(fs.readFileSync(path.join(__dirname,'proposal.json'),'utf8'));
function candidate(game,index){let turns=6+Math.floor(index/25);let c={game,id:`${game}-${String(index+1).padStart(3,'0')}`,turns};
 switch(game){
 case'droplet-world':Object.assign(c,{energy:8+rand(4),patches:arr(3,()=>5+rand(4)),regen:arr(3,()=>1+rand(2)),weather:arr(turns,(_,)=>[rand(3),rand(3)]),target:2+Math.floor(index/45)});break;
 case'evolving-island':Object.assign(c,{population:[5+rand(3),4+rand(3),3+rand(3)],habitat:arr(3,()=>rand(5)),niches:arr(3,()=>arr(3,()=>rand(5))),capacity:22+rand(8),endangered:rand(3),target:7+rand(4)});break;
 case'before-wings':Object.assign(c,{traits:[1,0,1],energy:7+rand(5),gaps:arr(turns,i=>3+i*2+rand(4)),fruit:arr(turns,()=>rand(3)),target:turns-1});break;
 case'symbiotic-partners':Object.assign(c,{health:arr(3,()=>7+rand(5)),fungi:[[0,2,2],[0,1,3]],insects:[[3,1],[1,3]],seasons:arr(turns,()=>[1+rand(2),rand(2),1+rand(2),rand(3)]),target:12+rand(9)});break;
 case'intertidal-shift':Object.assign(c,{population:[6+rand(4),7+rand(4),8+rand(4)],height:arr(3,()=>rand(4)),grip:[3,2,1],dry:[2,1,0],tides:arr(turns,()=>[rand(4),1+rand(5),1+rand(3)]),target:20+rand(9)});break;
 case'mycelium-exchange':Object.assign(c,{health:arr(3,()=>7+rand(4)),carbon:arr(3,()=>3+rand(5)),water:arr(3,()=>2+rand(4)),fungus:4+rand(4),soil:8+rand(14),weather:arr(turns,()=>({sun:arr(3,()=>rand(4)),rain:arr(3,()=>rand(3)),demand:arr(3,()=>1+rand(3))})),balance:6});break;
 case'century-pedigree':Object.assign(c,{adults:arr(6,()=>[rand(3),rand(3)]),climate:arr(turns,()=>[1+rand(2),1+rand(2),rand(2)]),diversity:5+Math.floor(index/60),target:turns+2+rand(3)});break;
 case'migration-memory':Object.assign(c,{energy:3+rand(5),population:6,wetlands:arr(5,()=>4+rand(5)),eat:2+rand(2),cost:[5+rand(3),4+rand(4),6+rand(3)],seasons:arr(turns,()=>({wind:arr(3,()=>rand(4)),rain:1+rand(2)})),target:6+2*(turns-1),reserve:6+rand(7)});break;
 case'bloom-timing':Object.assign(c,{reserve:6+rand(4),day:rand(4),shape:rand(2),tongues:arr(3,()=>rand(2)),seasons:arr(turns,()=>({sun:3+rand(3),rivalReward:4+rand(6),rivalDay:rand(4),rivalShape:rand(2),flight:arr(3,()=>rand(4)),frost:rand(4)})),target:20+rand(13)});break;
 case'lost-predators':Object.assign(c,{plants:15+rand(10),herb:[5+rand(5),5+rand(5)],pred:rand(3),rain:arr(turns,()=>2+rand(5)),target:18+rand(8)});break;
 case'vent-colony':{turns=8+Math.floor(index/34);c.turns=turns;let pulses=arr(turns,()=>rand(4));pulses[0]=2+rand(2);pulses[turns-1]=1+rand(3);Object.assign(c,{reserve:7+rand(4),cap:9+rand(5),population:5,pulses,target:6});break;}
 case'borrowed-appearance':Object.assign(c,{population:8,energy:4+rand(5),habitat:arr(turns,()=>({background:rand(3),food:1+rand(3)})),target:9+rand(3)});break;
 case'dormant-seedbank':{let years=arr(turns,()=>({yield:pick([0,0.5,1,2,3]),decay:pick([0.05,0.1,0.2])}));years[rand(turns-1)].yield=0;Object.assign(c,{bank:20+rand(15),years,capacity:200,target:30+rand(40),goodYears:turns-2});break;}
 case'social-cost':Object.assign(c,{adults:8+rand(3),young:1+rand(3),food:6+rand(5),trust:2+rand(3),days:arr(turns,()=>({raid:rand(3),fruit:rand(4)})),target:9+rand(3)});break;
 case'last-habitat':{let edges=[[0,1],[1,2],[2,3],[3,4],[0,4],[1,3],[0,2],[2,4]].filter((_,i)=>i<4||rand(3)>0).map(e=>e.concat(1+rand(3)));Object.assign(c,{population:[7+rand(4),2+rand(3),0,2+rand(3),0],capacity:arr(5,()=>4+rand(4)),edges,budget:10+rand(4),seasons:arr(turns,()=>arr(5,()=>rand(3)-1)),target:18+rand(4)});break;}
 }return c;
}
function make(game){seed=Array.from(game).reduce((n,x)=>(Math.imul(n,31)+x.charCodeAt(0))>>>0,12015);const levels=[],proofs=[],seen=new Set;for(let i=0;i<100;i++){let c,trace,attempt=0;do{if(++attempt>1200)throw Error(`No viable ${game} ${i}`);c=candidate(game,i);if(seen.has(E.fingerprint(c)))continue;trace=E.solve(c,55);}while(!trace||seen.has(E.fingerprint(c)));seen.add(E.fingerprint(c));const end=E.replay(c,trace);levels.push(c);proofs.push({id:c.id,difficulty:'normal',actions:trace,terminal:{turn:end.turn,won:end.won,metrics:E.metrics(end)}});if(i%25===24)console.log(game,i+1);}return{levels,proofs};}
let only=process.argv.find(x=>x.startsWith('--game='));for(let game of E.names.filter(x=>!only||x===only.slice(7))){let result=make(game),dir=path.join(root,'games',game);fs.mkdirSync(dir,{recursive:true});for(let key of ['levels','proofs']){let data=JSON.stringify(result[key],null,2)+'\n',p=path.join(dir,key+'.json');if(process.argv.includes('--check')){if(fs.readFileSync(p,'utf8')!==data)throw Error('Nondeterministic '+p);}else fs.writeFileSync(p,data);}}
