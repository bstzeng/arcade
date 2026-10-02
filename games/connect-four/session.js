(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TabletopSession=api})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const defaults={mode:'ai',side:1,difficulty:'normal'};
function settings(x){return{mode:x&&x.mode==='local'?'local':'ai',side:x&&x.side===-1?-1:1,difficulty:x&&['easy','normal','hard'].includes(x.difficulty)?x.difficulty:'normal'}}
class Session{
constructor(engine,opts={}){this.engine=engine;this.id=opts.id||'tabletop';this.settings=settings(opts.settings||defaults);this.runner=opts.runner;this.changed=opts.changed||(()=>{});this.states=[engine.create()];this.moves=[];this.pending=false;this.generation=0;this.job=null;this.aiInfo=null;this.error=''}
get state(){return this.states[this.states.length-1]}
get result(){return this.engine.outcome(this.state)}
get humanTurn(){return this.settings.mode==='local'||this.state.turn===this.settings.side}
notify(){this.changed(this)}
cancel(){this.generation++;if(this.job&&this.job.cancel)this.job.cancel();this.job=null;this.pending=false}
start(){this.notify();this.startAI()}
play(move){if(this.pending||!this.humanTurn||this.result)return false;let next;try{next=this.engine.apply(this.state,move)}catch(e){return false}this.moves.push(JSON.parse(JSON.stringify(move)));this.states.push(next);this.aiInfo=null;this.error='';this.notify();this.startAI();return true}
startAI(){if(this.pending||this.settings.mode!=='ai'||this.humanTurn||this.result||!this.runner)return;const version=++this.generation,state=this.state;this.pending=true;this.notify();let job;try{job=this.runner(state,this.settings.difficulty)}catch(e){job={promise:Promise.reject(e),cancel(){}}}this.job=job;Promise.resolve(job.promise).then(info=>this.finishAI(version,state,info),()=>this.finishAI(version,state,null))}
finishAI(version,state,info){if(version!==this.generation||state!==this.state||!this.pending)return;this.pending=false;this.job=null;let move=info&&info.move,next;try{next=this.engine.apply(state,move)}catch(e){move=this.engine.legal(state)[0];if(move===undefined){this.notify();return}next=this.engine.apply(state,move);this.error='電腦搜尋已安全恢復，使用合法備用走法'}this.aiInfo=info;this.moves.push(JSON.parse(JSON.stringify(move)));this.states.push(next);this.notify()}
undoIndex(){if(!this.moves.length)return-1;if(this.settings.mode==='local')return this.moves.length-1;for(let i=this.moves.length-1;i>=0;i--)if(this.states[i].turn===this.settings.side)return i;return-1}
undo(){let index=this.undoIndex();if(index<0)return false;this.cancel();this.moves=this.moves.slice(0,index);this.states=this.states.slice(0,index+1);this.aiInfo=null;this.error='';this.notify();return true}
reset(nextSettings){this.cancel();if(nextSettings)this.settings=settings(nextSettings);this.moves=[];this.states=[this.engine.create()];this.aiInfo=null;this.error='';this.notify();this.startAI()}
serialize(){return JSON.stringify({version:1,game:this.id,settings:this.settings,moves:this.moves})}
restore(raw){try{let data=typeof raw==='string'?JSON.parse(raw):raw;if(!data||data.version!==1||data.game!==this.id||!Array.isArray(data.moves)||data.moves.length>4000)throw Error('Invalid save');let ss=settings(data.settings);if(!data.settings||ss.mode!==data.settings.mode||ss.side!==data.settings.side||ss.difficulty!==data.settings.difficulty)throw Error('Invalid settings');let states=[this.engine.create()],moves=[];for(const move of data.moves){states.push(this.engine.apply(states[states.length-1],move));moves.push(JSON.parse(JSON.stringify(move)))}this.cancel();this.settings=ss;this.states=states;this.moves=moves;this.aiInfo=null;this.error='';return true}catch(e){return false}}
destroy(){this.cancel()}
}
return{Session,settings};
});
