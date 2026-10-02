(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./engine.js'):root.BoardEngine);if(typeof module==='object'&&module.exports)module.exports=api;else root.BoardSession=api;})(typeof globalThis!=='undefined'?globalThis:this,function(E){
'use strict';const validSettings=s=>s&&['local','ai'].includes(s.mode)&&['easy','normal','hard'].includes(s.difficulty)&&[1,-1].includes(s.human);
class Session{
constructor({runner,storage,key,onChange}={}){this.runner=runner||((s,d,signal)=>E.chooseMoveAsync(s,d,{signal}));this.storage=storage;this.key=key||'tabletop-save';this.onChange=onChange||(()=>{});this.settings={mode:'ai',difficulty:'normal',human:1};this.moves=[];this.states=[E.initial()];this.version=0;this.busy=false;this.paused=false;this.controller=null;this.info=null;this.notice='';this.restore();}
get state(){return this.states[this.states.length-1];}
get humanTurn(){return this.settings.mode==='local'||this.state.turn===this.settings.human;}
emit(){this.onChange(this);}
snapshot(){return{version:1,settings:{...this.settings},moves:[...this.moves]};}
save(){if(!this.storage)return;try{this.storage.setItem(this.key,JSON.stringify(this.snapshot()));}catch(e){this.notice='無法使用本機儲存；本頁仍可繼續遊玩';}}
restore(){if(!this.storage)return false;try{const raw=this.storage.getItem(this.key);if(!raw)return false;if(raw.length>20000)throw Error('size');const data=JSON.parse(raw);if(data.version!==1||!validSettings(data.settings)||!Array.isArray(data.moves)||data.moves.length>E.N*E.N)throw Error('shape');const states=[E.initial()];for(const m of data.moves){const next=E.play(states[states.length-1],m);if(!next)throw Error('illegal replay');states.push(next);}this.settings={...data.settings};this.moves=[...data.moves];this.states=states;this.notice=data.moves.length?'已接續本機保存的棋局':'';return true;}catch(e){this.notice='舊存檔無效，已安全開新局';return false;}}
cancel(){this.version++;if(this.controller)this.controller.abort();this.controller=null;this.busy=false;}
start(){this.emit();this.schedule();}
pause(){this.paused=true;this.cancel();this.emit();}
resume(){this.paused=false;this.emit();this.schedule();}
reset(settings=this.settings){if(!validSettings(settings))return false;this.cancel();this.settings={...settings};this.moves=[];this.states=[E.initial()];this.info=null;this.notice='新棋局，黑棋先行';this.save();this.emit();this.schedule();return true;}
commit(move){const next=E.play(this.state,move);if(!next)return false;this.moves.push(move);this.states.push(next);this.save();return true;}
play(move){if(this.paused||this.busy||this.state.over||!this.humanTurn)return false;this.notice='';if(!this.commit(move))return false;this.emit();this.schedule();return true;}
undoIndex(){for(let i=this.states.length-2;i>=0;i--){if(this.settings.mode==='local'||this.states[i].turn===this.settings.human)return i;}return-1;}
undo(){const target=this.undoIndex();if(target<0)return false;this.cancel();this.states=this.states.slice(0,target+1);this.moves=this.moves.slice(0,target);this.info=null;this.notice=this.settings.mode==='ai'?'已撤銷到你上一手之前':'已撤銷上一手';this.save();this.emit();this.schedule();return true;}
schedule(){if(this.paused||this.busy||this.state.over||this.humanTurn)return;this.busy=true;const token=++this.version;const controller=new AbortController();this.controller=controller;const state=JSON.parse(JSON.stringify(this.state));this.emit();Promise.resolve().then(()=>{if(controller.signal.aborted)return null;return this.runner(state,this.settings.difficulty,controller.signal);}).then(result=>{if(token!==this.version||controller.signal.aborted||this.paused)return;this.busy=false;this.controller=null;const move=result&&typeof result==='object'?result.move:result;const legal=E.legalMoves(this.state);if(legal.includes(move)){this.info=result;this.notice='';this.commit(move);}else if(legal.length){this.commit(legal[0]);this.notice='電腦已使用合法的備援走法';}this.emit();this.schedule();}).catch(error=>{if(token!==this.version||controller.signal.aborted)return;this.busy=false;this.controller=null;const legal=E.legalMoves(this.state);if(legal.length)this.commit(legal[0]);this.notice='計算暫時中斷，電腦已使用合法的備援走法';this.emit();this.schedule();});}
dispose(){this.paused=true;this.cancel();}
}
return{Session,validSettings};
});
