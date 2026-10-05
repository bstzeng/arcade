(function(g){'use strict';
const KEY='arcade.classic30.wondertide-aquarium.v1';
const legacy=typeof module!=='undefined'?require('./legacy-levels.js'):g.AquariumLegacyLevels;
function createStore(storage,engine,levels,owner){let revision=0,volatile=false,conflict=false;
 const fresh=()=>({schema:2,revision:0,owner,profile:{schema:2,completed:{},legacyCompleted:{},runs:[]},options:{schema:1,reducedMotion:false,sound:true},run:null});
 function parse(raw){const b=JSON.parse(raw);if(!b||![1,2].includes(b.schema)||!Number.isInteger(b.revision)||b.revision<0||typeof b.owner!=='string'||!b.profile||![1,2].includes(b.profile.schema)||!b.profile.completed||Array.isArray(b.profile.completed)||typeof b.profile.completed!=='object'||!Array.isArray(b.profile.runs)||!b.options||b.options.schema!==1||typeof b.options.reducedMotion!=='boolean')throw Error('備份不完整或版本不支援');
 if(b.profile.schema===1){b.profile.legacyCompleted={...b.profile.completed};b.profile.completed={};b.profile.schema=2;}
 b.schema=2;b.profile.legacyCompleted=b.profile.legacyCompleted||{};b.options.sound=b.options.sound!==false;
 for(const [k,v] of Object.entries(b.profile.completed))if(!levels.some(l=>l.id===k)||!Number.isFinite(v)||v<0)throw Error('完成紀錄無效');
 for(const [k,v] of Object.entries(b.profile.legacyCompleted))if(!legacy.some(l=>l.id===k)||!Number.isFinite(v)||v<0)throw Error('先行版紀錄無效');
 if(!b.profile.runs.every(x=>typeof x==='string')||b.profile.runs.length>1000)throw Error('回合紀錄無效');
 if(b.run){b.run=engine.deserialize(JSON.stringify(b.run));const old=!b.run.level.campaign;const l=(old?legacy:levels).find(l=>l.id===b.run.id);if(!l||JSON.stringify(l)!==JSON.stringify(b.run.level))throw Error('關卡資料不符');b.run.legacy=old;b.run.paused=b.run.status==='running';}
 return b;}
 function load(){try{const raw=storage.getItem(KEY);if(!raw){revision=0;return{data:fresh(),kind:'empty'};}const data=parse(raw);revision=data.revision;conflict=false;return{data,kind:'loaded'};}catch(e){return{data:fresh(),kind:'invalid',message:e.message};}}
 function save(data){if(volatile)return{kind:'volatile'};if(conflict)return{kind:'conflict'};try{const raw=storage.getItem(KEY);if(raw){const saved=JSON.parse(raw);if(saved.revision!==revision){conflict=true;return{kind:'conflict'};}}const next={...data,schema:2,revision:revision+1,owner};parse(JSON.stringify(next));storage.setItem(KEY,JSON.stringify(next));revision++;return{kind:'saved',revision};}catch(e){volatile=true;return{kind:'volatile',message:e.message};}}
 return{KEY,load,save,parse,fresh,continueVolatile(){volatile=true;conflict=false;},isVolatile(){return volatile;},hasConflict(){return conflict;},import(raw){const data=parse(raw);let previousRevision=0;try{const previous=JSON.parse(storage.getItem(KEY));if(previous&&Number.isSafeInteger(previous.revision)&&previous.revision>=0)previousRevision=previous.revision;}catch(e){}const next={...data,schema:2,revision:previousRevision+1,owner};parse(JSON.stringify(next));try{storage.setItem(KEY,JSON.stringify(next));revision=next.revision;volatile=false;conflict=false;return{data:next,result:{kind:'saved',revision}};}catch(e){volatile=true;conflict=false;return{data:next,result:{kind:'volatile',message:e.message}};}},reset(){try{storage.removeItem(KEY);revision=0;volatile=false;conflict=false;return true;}catch(e){volatile=true;return false;}},external(raw){try{const b=parse(raw);if(b.owner!==owner&&b.revision>revision){conflict=true;return true;}}catch(e){}return false;}};
}
const api={KEY,createStore};if(typeof module!=='undefined')module.exports=api;else g.AquariumStorage=api;
})(typeof globalThis!=='undefined'?globalThis:this);
