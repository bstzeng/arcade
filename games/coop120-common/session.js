(function(root){'use strict';const C=typeof module!=='undefined'?require('./core.js'):root.CoopCore;
class Session{
constructor(id,levels,proofs,storage){this.id=id;this.levels=levels;this.proofs=proofs;this.storage=storage;this.key=`arcade-coop120-v1-${id}`;this.storageWarning=false;try{this.progress=C.parseSave(storage?.getItem(this.key)||'');}catch{this.progress=C.parseSave('');this.storageWarning=true;}this.mode='solo';this.humanRole=0;this.role=0;this.paused=false;this.covered=false;this.demo=false;this.demoPlaying=false;this.start(0);}
start(index){if(!Number.isInteger(index)||index<0||index>=this.levels.length)return false;this.index=index;this.state=C.create(this.id,this.levels[index]);this.assisted=false;this.demo=false;this.demoPlaying=false;this.demoIndex=0;this.hint='';this.message='';this.role=this.mode==='solo'?this.humanRole:0;this.covered=this.mode==='local';this.paused=false;this.completedRecorded=false;return true;}
setMode(mode,role=0){if(!['solo','local'].includes(mode)||![0,1].includes(role))return false;this.mode=mode;this.humanRole=role;this.start(this.index);return true;}
switchRole(){if(this.demo||this.mode!=='local')return false;this.role=1-this.role;this.covered=true;this.hint='';this.message='';return true;}
reveal(){if(this.paused)return false;this.covered=false;return true;}
pause(){this.paused=true;this.demoPlaying=false;this.hint='';if(this.mode==='local'&&!this.demo)this.covered=true;}
resume(){this.paused=false;}
observation(){return this.covered||this.paused?null:C.observe(this.state,this.role);}
actions(){return this.observation()&&!this.demo?C.controls(this.state,this.role):[];}
commit(role,action,kind='human'){if(this.paused||this.covered||(this.demo&&kind!=='demo')||(!this.demo&&kind==='demo'))return{ok:false,reason:'先揭開畫面並繼續遊戲'};if(kind==='human'&&(role!==this.role||(this.mode==='solo'&&role!==this.humanRole)))return{ok:false,reason:'只能操作目前角色'};if(kind==='ai'&&(this.mode!=='solo'||role===this.humanRole))return{ok:false,reason:'AI 不能操作你的角色'};const result=C.step(this.state,role,action);if(result.ok){if(kind==='ai')this.assisted=true;this.hint='';this.message='';this.finish();}else this.message=result.reason||'這個操作目前無效，請檢查場景與角色。';return result;}
user(action){if(this.demo)return{ok:false,reason:'示範不接受手動操作'};return this.commit(this.role,action,'human');}
teammate(){if(this.paused||this.covered||this.demo||this.mode!=='solo'||this.state.won||this.state.lost)return false;const role=1-this.humanRole,a=C.ai(this.state,role);if(!a||a.type==='tick')return false;return this.commit(role,a,'ai').ok;}
clock(){if(!['director-stunt','beam-relay'].includes(this.id)||this.paused||this.covered||this.demo||this.state.won||!(this.state.rolling||this.state.running))return false;const r=C.step(this.state,0,{type:'tick'});this.finish();return r.ok;}
requestHint(){if(!this.observation()||this.demo||this.state.won||this.state.lost)return null;this.assisted=true;const a=C.ai(this.state,this.role);if(a){const match=C.controls(this.state,this.role).find(q=>Object.keys(a).filter(k=>k!=='label').every(k=>JSON.stringify(q[k])===JSON.stringify(a[k])));this.hint=`建議：${match?.label||a.label}。這次完成會記為「有協助」。`;}else this.hint='目前需要另一位角色先行動。請看兩個角色的玩法，再請隊友配合。這次完成會記為「有協助」。';return a;}
beginDemo(){this.start(this.index);this.demo=true;this.demoPlaying=true;this.covered=false;this.role=0;this.message='解答示範會公開兩位角色資訊；只記入示範完成。';}
demoStep(){if(!this.demo||this.paused||this.covered||this.state.won||this.state.lost)return false;const q=this.proofs[this.index]?.actions[this.demoIndex];if(!q){this.demoPlaying=false;this.message='示範資料已結束。';return false;}this.role=q.role;const r=this.commit(q.role,q.action,'demo');if(r.ok)this.demoIndex++;else this.demoPlaying=false;return r.ok;}
finish(){if(!this.state.won||this.completedRecorded)return;const kind=this.demo?'demo':this.assisted||this.mode==='solo'?'assisted':'manual';this.progress=C.record(this.progress,this.index+1,kind);this.completedRecorded=true;this.demoPlaying=false;try{this.storage?.setItem(this.key,JSON.stringify(this.progress));}catch{this.storageWarning=true;}}
}
root.CoopSession=Session;if(typeof module!=='undefined')module.exports=Session;
})(typeof globalThis!=='undefined'?globalThis:this);
