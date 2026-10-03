'use strict';const assert=require('node:assert/strict');const total=a=>a.reduce((x,y)=>x+y,0);
function checkReady(s){const v=s.v,f=s.level.stages[s.stage];let ok=false;switch(s.id){
case'blizzard-shelter':ok=s.collected&&v.fuel>0&&total(v.flow)<=8&&f.demand.every((n,i)=>v.flow[i]-f.loss[i]+v.insulation[i]>=n);break;
case'driftwood-raft':ok=total(v.boards)>=f.load&&v.wood>=1&&v.boards[2]-v.boards[0]+v.paddle+f.current===f.target;break;
case'underground-survival':ok=v.fuel>0&&v.shafts[f.farm]===1&&v.heat===f.farm&&v.air===f.air&&v.cracks.every(x=>x===0);break;
case'tidal-city':ok=s.collected&&v.crates.every(x=>x>=f.tide+1&&x<=f.windCeiling);break;
case'colossus-home':ok=s.collected&&v.built.every(Boolean)&&f.force.every((x,i)=>v.lash[i]>=x)&&(v.care&f.care)===f.care;break;
case'mycelium-farm':ok=f.toxin.every((x,i)=>!x||v.strain[i]===1)&&f.input+v.compost-total(v.strain)>=f.need;break;
case'desert-walker':{const load=v.cargo.reduce((n,x,i)=>n+x*(i+2),0);ok=v.cargo[f.module]===1&&v.legs*2-load>=f.wind&&v.water>=f.distance*(load+v.legs);break;}
case'glass-greenhouse':{const day=f.sun-v.shade*2,night=8-f.cold+v.insulation;ok=day>=3&&day<=5&&night>=3&&night<=5&&v.gutter*f.rain>=f.need;break;}
case'floating-anchors':ok=v.tension.every(x=>x>0)&&total(v.ballast)<=6&&f.lift[0]-v.ballast[0]-v.tension[0]===0&&f.lift[1]-v.ballast[1]+v.tension[0]-v.tension[1]===0&&f.lift[2]-v.ballast[2]+v.tension[1]===0;break;
case'shipwreck-oxygen':ok=v.diver===f.target&&v.sealed&&v.lines.slice(0,f.target).every(Boolean)&&6-f.target+(v.bags[f.target]?2:0)>=3&&v.air>0;break;
case'growing-treehouse':ok=v.length.every((x,i)=>x-v.baseline[i]===f.growth[i])&&v.floors.every((x,i)=>x===f.growth[i])&&v.roof===f.roof;break;
case'gravity-shelter':{const loads=[0,0],stocks=[0,0];for(let i=0;i<3;i++){loads[v.sides[i]]+=i+1;stocks[v.sides[i]]+=v.stocks[i];}ok=v.locks.every(x=>x===1)&&v.water.every((x,i)=>x===f.water[i]&&stocks[i]>=x)&&v.valve===f.down&&loads[f.down]<=f.floorLimit&&loads[1-f.down]<=f.ceilingLimit;break;}
case'nomad-rebuild':ok=v.arrived&&f.required.every(i=>v.built[i]===1);break;
case'silent-hunt-camp':ok=v.made.every((x,i)=>x>=f.quota[i]);break;
case'hibernation-base':ok=v.seasonDay>=f.days&&v.health.every(x=>x>0)&&v.plants.every(x=>x>0)&&v.tank>=0;break;
}assert(ok,`Independent public-condition rejection: ${s.id} stage ${s.stage}`);return true;}
function finite(s){function walk(x){if(typeof x==='number')assert(Number.isFinite(x));else if(x&&typeof x==='object')for(const v of Object.values(x))walk(v);}walk(s);if(s.id==='gravity-shelter')s.v.stocks.forEach((x,i)=>assert(x>=0&&x<=i+1));for(const k of ['wood','fuel','metal','fiber','food','spores','parts','material','tank'])if(k in s.v)assert(s.v[k]>=0,`Negative resource ${k}`);}
module.exports={checkReady,finite};
