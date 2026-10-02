(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ActionSession=api})(globalThis,function(){
'use strict';
const clone=v=>JSON.parse(JSON.stringify(v));
class Session{
 constructor(game,levels,certificates,storage){this.game=game;this.levels=levels;this.certificates=certificates;this.storage=storage;this.key='arcade:action:v1:'+game.id;this.completed=new Set();this.levelIndex=0;this.state=game.createState(levels[0]);this.assisted=false;this.demo=false;this.paused=true;this.accumulator=0;this.lastTime=null;this.warning='';this.suspended=null;this.run=0;this.speed=1;this.restore()}
 get level(){return this.levels[this.levelIndex]}
 restore(){if(!this.storage){this.warning='本機儲存未啟用，仍可遊玩。';return}try{let raw=this.storage.getItem(this.key);if(!raw)return;if(raw.length>3000000)throw Error();let p=JSON.parse(raw);if(p.version!==1||p.revision!==this.game.contentRevision)throw Error();if(!Number.isInteger(p.levelIndex)||!this.levels[p.levelIndex])throw Error();if(!Array.isArray(p.completed)||p.completed.some(k=>!Number.isInteger(k)||!this.levels[k]))throw Error();if(!this.game.validateState(this.levels[p.levelIndex],p.state))throw Error();this.levelIndex=p.levelIndex;this.state=p.state;this.assisted=!!p.assisted;this.completed=new Set(p.completed)}catch(_){this.warning='儲存資料無效，已安全重開第1關。';this.levelIndex=0;this.state=this.game.createState(this.levels[0]);this.assisted=false;this.completed=new Set()}}
 save(){if(!this.storage)return;let manual=this.demo?this.suspended:{state:this.state,assisted:this.assisted};try{this.storage.setItem(this.key,JSON.stringify({version:1,revision:this.game.contentRevision,levelIndex:this.levelIndex,state:manual.state,assisted:manual.assisted,completed:[...this.completed]}))}catch(_){this.warning='無法儲存；遊戲仍可繼續。'}}
 choose(index){if(!Number.isInteger(index)||!this.levels[index])return false;this.levelIndex=index;this.state=this.game.createState(this.level);this.assisted=false;this.demo=false;this.suspended=null;this.pause();this.run++;this.save();return true}
 reset(){return this.choose(this.levelIndex)}
 start(){if(this.state.status!=='playing')return false;this.paused=false;this.lastTime=null;this.accumulator=0;return true}
 pause(){this.paused=true;this.lastTime=null;this.accumulator=0;this.save()}
 hint(){if(!this.demo){this.assisted=true;this.save()}return this.game.hint}
 beginDemo(){if(this.demo)this.endDemo();this.suspended={state:clone(this.state),assisted:true};this.assisted=true;this.state=this.game.createState(this.level);this.demo=true;this.traceIndex=0;this.traceInput={};this.paused=false;this.lastTime=null;this.accumulator=0;this.run++;this.save()}
 endDemo(){if(!this.demo)return;this.state=this.suspended.state;this.assisted=this.suspended.assisted;this.demo=false;this.suspended=null;this.pause();this.run++}
 inputAtTick(){let c=this.certificates[this.levelIndex],next=this.state.tick+1;while(this.traceIndex<c.inputs.length&&c.inputs[this.traceIndex][0]<=next){this.traceInput=c.inputs[this.traceIndex++][1]}return this.traceInput}
 tick(input){if(this.paused||this.state.status!=='playing')return false;let action=this.demo?this.inputAtTick():input;if(!action||!this.game.validateState(this.level,this.state))return false;/* Both demo and manual controls use the identical bounded simulator. */this.game.step(this.level,this.state,action);if(this.state.tick>=this.level.maxTicks&&this.state.status==='playing')this.state.status='lost';if(this.state.status!=='playing'){this.paused=true;if(this.state.status==='won'&&!this.demo&&!this.assisted)this.completed.add(this.levelIndex);this.save()}else if(this.state.tick%60===0)this.save();return true}
 advance(now,getInput){if(this.paused){this.lastTime=null;return 0}if(this.lastTime===null){this.lastTime=now;return 0}let delta=Math.max(0,Math.min(100,now-this.lastTime));this.lastTime=now;this.accumulator+=delta*(this.demo?this.speed:1);let count=0;while(this.accumulator+1e-7>=1000/60&&!this.paused&&count<24){this.accumulator-=1000/60;this.tick(getInput());count++}return count}
}
return {Session};
});
