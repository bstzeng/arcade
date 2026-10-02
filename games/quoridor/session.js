(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.BoardSession=api;})(typeof self!=='undefined'?self:this,function(){
'use strict';
const clone=x=>JSON.parse(JSON.stringify(x));
function options(o){if(!o||!['ai','local'].includes(o.mode)||!['easy','normal','hard'].includes(o.level)||![0,1].includes(o.human))throw Error('對局設定不正確');return {mode:o.mode,level:o.level,human:o.human};}
function replay(engine,log){if(!Array.isArray(log)||log.length>5000)throw Error('棋譜太長或格式錯誤');let s=engine.initial();for(const a of log){if(!engine.legal(s,a))throw Error('棋譜含不合法動作');s=engine.apply(s,a);}return s;}
function read(engine,game,raw){let data;try{data=JSON.parse(raw);}catch(e){throw Error('存檔不是有效 JSON');}if(!data||data.version!==1||data.game!==game)throw Error('存檔版本或遊戲不符');const opts=options(data.options),state=replay(engine,data.actions);return {options:opts,actions:clone(data.actions),state};}
class Session{
constructor(engine,game,opts={mode:'ai',level:'normal',human:0}){this.engine=engine;this.game=game;this.options=options(opts);this.actions=[];this.state=engine.initial();this.generation=0;this.worker=null;this.busy=false;}
isHuman(){return this.options.mode==='local'||this.state.turn===this.options.human;}
isOver(){return this.state.winner!==null||!!this.state.draw;}
cancel(){this.generation++;if(this.worker)this.worker.terminate();this.worker=null;this.busy=false;}
play(a){if(!this.engine.legal(this.state,a))return false;this.cancel();this.state=this.engine.apply(this.state,a);this.actions.push(clone(a));return true;}
reset(opts=this.options){const valid=options(opts);this.cancel();this.options=valid;this.actions=[];this.state=this.engine.initial();}
serialize(){return JSON.stringify({version:1,game:this.game,options:this.options,actions:this.actions});}
load(raw){const data=read(this.engine,this.game,raw);this.cancel();this.options=data.options;this.actions=data.actions;this.state=data.state;}
undoIndex(){if(!this.actions.length)return -1;let s=this.engine.initial(),prior=null,last=-1;for(let i=0;i<this.actions.length;i++){if(this.options.mode==='local'){if(s.turn!==prior)last=i;}else if(s.turn===this.options.human&&s.turn!==prior)last=i;prior=s.turn;s=this.engine.apply(s,this.actions[i]);}return last;}
undo(){const i=this.undoIndex();if(i<0)return false;this.cancel();this.actions=this.actions.slice(0,i);this.state=replay(this.engine,this.actions);return true;}
request(WorkerClass,url,callback){if(this.busy||this.isHuman()||this.isOver())return false;const ticket=++this.generation,signature=JSON.stringify(this.state);this.busy=true;let worker;try{worker=new WorkerClass(url);this.worker=worker;}catch(e){this.busy=false;callback({error:'無法啟動 AI，請重新整理或切換同機雙人'});return false;}
worker.onmessage=event=>{if(ticket!==this.generation||signature!==JSON.stringify(this.state))return;this.worker=null;worker.terminate();this.busy=false;const a=event.data&&event.data.action;if(!a||!this.engine.legal(this.state,a)){callback({error:'AI 回覆無效，請重試'});return;}this.play(a);callback({action:a,nodes:event.data.nodes});};
worker.onerror=()=>{if(ticket!==this.generation)return;this.cancel();callback({error:'AI 載入失敗，請重試或切換同機雙人'});};
try{worker.postMessage({state:clone(this.state),level:this.options.level,seed:Math.floor(Math.random()*4294967295)});}catch(e){this.cancel();callback({error:'無法傳送 AI 請求，請重試'});return false;}return true;}
}
return {Session,replay,read,options};
});
