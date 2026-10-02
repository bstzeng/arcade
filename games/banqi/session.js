/* Replay-backed controller. The worker boundary receives PUBLIC observations only. */
(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./engine.js'):root.BanqiEngine);if(typeof module==='object'&&module.exports)module.exports=api;else root.BanqiSession=api;})(typeof globalThis!=='undefined'?globalThis:this,function(E){
'use strict';
const VERSION=1, KEY='arcade.banqi.v1';
function settings(raw){return {mode:raw&&raw.mode==='local'?'local':'ai',level:raw&&['easy','normal','hard'].includes(raw.level)?raw.level:'normal',human:raw&&raw.human===1?1:0};}
function validSettings(raw){return raw&&['local','ai'].includes(raw.mode)&&['easy','normal','hard'].includes(raw.level)&&(raw.human===0||raw.human===1);}
function validAction(a){if(!a||typeof a!=='object'||!Number.isInteger(a.to)||a.to<0||a.to>31)return false;return a.type==='flip'?Object.keys(a).every(k=>['type','to'].includes(k)):a.type==='move'&&Number.isInteger(a.from)&&a.from>=0&&a.from<32&&Object.keys(a).every(k=>['type','to','from'].includes(k));}
function same(a,b){return a.type===b.type&&a.to===b.to&&(a.type==='flip'||a.from===b.from);}
function replay(seed,actions){if(!Number.isInteger(seed)||seed<0||seed>4294967295||!Array.isArray(actions)||actions.length>8192)throw Error('無效的棋局紀錄');let state=E.create(seed);for(const a of actions){if(!validAction(a)||state.result||!E.legalMoves(state).some(m=>same(m,a)))throw Error('不合法的棋步');state=E.apply(state,a);}return state;}
function decode(text){if(typeof text!=='string'||text.length>300000)throw Error('存檔過大');const data=JSON.parse(text);if(!data||data.version!==VERSION||!validSettings(data.settings))throw Error('不支援的存檔');return {seed:data.seed,actions:data.actions.map?data.actions.map(a=>({...a})):data.actions,settings:settings(data.settings),state:replay(data.seed,data.actions)};}
function create(options={}){
 const schedule=options.setTimeout||setTimeout,unschedule=options.clearTimeout||clearTimeout;
 let seed=(options.seed===undefined?Date.now():options.seed)>>>0,config=settings(options.settings),state=E.create(seed),actions=[],worker=null,timer=null,delay=null,ticket=0,busy=false,notice='',stats=null;
 const onChange=options.onChange||(()=>{});
 function snapshot(){return {state,actions:actions.map(a=>({...a})),settings:{...config},busy,notice,stats,canUndo:undoIndex()>=0};}
 function emit(){onChange(snapshot());}
 function save(){try{if(options.storage)options.storage.setItem(KEY,JSON.stringify({version:VERSION,seed,settings:config,actions}));}catch(e){notice='瀏覽器無法保存棋局；仍可繼續遊玩。';}}
 function cancel(){ticket++;if(worker){worker.terminate();worker=null;}if(timer!==null)unschedule(timer);if(delay!==null)unschedule(delay);timer=delay=null;busy=false;}
 function undoIndex(){if(!actions.length)return -1;if(config.mode==='local')return actions.length-1;for(let i=actions.length-1;i>=0;i--)if(i%2===config.human)return i;return -1;}
 function execute(action){if(state.result||!validAction(action)||!E.legalMoves(state).some(m=>same(m,action)))return false;state=E.apply(state,action);actions.push({...action});save();return true;}
 function pump(){if(busy){emit();return;}if(state.result||config.mode!=='ai'||state.turn===config.human){emit();return;}busy=true;stats=null;emit();const id=++ticket,observation=E.publicView(state),aiSeed=(0x6b614e51^state.ply)>>>0;
  function finish(action,detail,fallback){if(id!==ticket)return;const legal=E.legalMoves(state);if(!legal.some(a=>same(a,action||{}))){fail();return;}cancel();stats=detail||null;if(fallback)notice='電腦運算暫時中斷，已用公開局面完成備援走法。';execute(action);emit();}
  function fail(){if(id!==ticket)return;if(worker){worker.terminate();worker=null;}if(timer!==null)unschedule(timer);timer=null;let action;try{const chosen=options.fallback&&options.fallback(observation,'easy',aiSeed);action=chosen&&chosen.action?chosen.action:chosen;}catch(e){}if(!action||!E.legalMoves(state).some(a=>same(a,action)))action=E.legalMoves(state)[0];if(action)finish(action,{fallback:true},true);else{cancel();notice='目前沒有可用走法，請重新開始。';emit();}}
  try{worker=options.workerFactory?options.workerFactory():null;if(!worker){delay=schedule(fail,160);return;}worker.onmessage=e=>{if(id!==ticket)return;if(!e.data||e.data.id!==id)return;if(e.data.error){fail();return;}finish(e.data.action,e.data.stats,false);};worker.onerror=fail;worker.onmessageerror=fail;timer=schedule(fail,6000);worker.postMessage({id,observation,level:config.level,seed:aiSeed});}catch(e){fail();}
 }
 return {
  get:snapshot,
  start(){pump();},
  act(action){if(busy||state.result||(config.mode==='ai'&&state.turn!==config.human))return false;notice='';if(!execute(action))return false;pump();return true;},
  undo(){const index=undoIndex();if(index<0)return false;cancel();actions=actions.slice(0,index);state=replay(seed,actions);notice='已撤銷，保留原本的棋子排列。';stats=null;save();pump();return true;},
  reset(nextSettings,nextSeed){cancel();config=settings(nextSettings||config);seed=(nextSeed===undefined?Date.now():nextSeed)>>>0;actions=[];state=E.create(seed);notice='';stats=null;save();pump();},
  load(){if(!options.storage)return false;let raw;try{raw=options.storage.getItem(KEY);if(!raw)return false;const loaded=decode(raw);cancel();seed=loaded.seed;config=loaded.settings;actions=loaded.actions;state=loaded.state;notice='已接續上次棋局。';stats=null;return true;}catch(e){notice='舊棋局資料無效，已安全開啟新局。';try{options.storage.removeItem(KEY);}catch(_){}return false;}},
  destroy(){cancel();},
  export(){return JSON.stringify({version:VERSION,seed,settings:config,actions});}
 };
}
return {create,decode,replay,settings,KEY,VERSION};
});
