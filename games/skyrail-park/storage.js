(function(root){'use strict';const E=typeof module!=='undefined'?require('./engine.js'):root.ParkEngine;
const KEYS={run:E.KEY+'.run',backup:E.KEY+'.backup',pending:E.KEY+'.pending',profile:E.KEY+'.profile'};
function digest(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(16);}
function parseEnvelope(raw){if(!raw)return null;const e=JSON.parse(raw);if(!e||e.schema!==1||!Number.isInteger(e.revision)||e.revision<1||typeof e.writer!=='string'||typeof e.data!=='string'||e.digest!==digest(e.data))throw Error('存檔交易驗證失敗');const state=E.deserialize(e.data);return {envelope:e,state,token:e.revision+':'+e.digest};}
function createStore(storage,writer='tab-'+Math.random().toString(36).slice(2)){let token=null,volatile=false,reason='';
 function load(){let primary=null,backup=null,error=null;try{primary=storage.getItem(KEYS.run);if(primary){const p=parseEnvelope(primary);token=p.token;volatile=false;reason='';return {ok:true,state:p.state,recovered:false};}}catch(e){error=e;}
 try{backup=storage.getItem(KEYS.backup);if(backup){const p=parseEnvelope(backup);token=null;volatile=!!primary;reason=primary?'主存檔損壞；已讀取備份，請匯出再繼續暫存遊玩。':'';return {ok:true,state:p.state,recovered:true,volatile};}}catch(e){error=e;}
 if(error){volatile=true;reason='無法讀取有效存檔：'+error.message;return {ok:false,error:reason};}token=null;return {ok:false,empty:true};}
 function save(state){if(volatile)return {ok:false,volatile:true,error:reason||'暫存遊玩中，請匯出備份。'};let data;try{data=E.serialize(state);}catch(e){return {ok:false,error:e.message};}
 try{const old=storage.getItem(KEYS.run),current=old?parseEnvelope(old):null;if((current?.token||null)!==token)return {ok:false,conflict:true,error:'其他分頁已更新存檔；目前進度尚未覆蓋。'};
 const next={schema:1,revision:(current?.envelope.revision||0)+1,writer,data,digest:digest(data)},raw=JSON.stringify(next);storage.setItem(KEYS.pending,raw);parseEnvelope(storage.getItem(KEYS.pending));if(old)storage.setItem(KEYS.backup,old);
 // Compare again immediately before commit. Local storage is synchronous within one task.
 const now=storage.getItem(KEYS.run),again=now?parseEnvelope(now):null;if((again?.token||null)!==token){storage.removeItem(KEYS.pending);return {ok:false,conflict:true,error:'保存時偵測到新版；已取消覆蓋。'};}
 storage.setItem(KEYS.run,raw);const committed=parseEnvelope(storage.getItem(KEYS.run));if(committed.token!==next.revision+':'+next.digest)throw Error('寫入後校驗失敗');token=committed.token;try{storage.removeItem(KEYS.pending);}catch{}return {ok:true,revision:next.revision};
 }catch(e){volatile=true;reason='儲存空間或讀寫失敗。仍可遊玩，請匯出備份；本分頁不再自動保存。';return {ok:false,volatile:true,error:reason,detail:e.message};}}
 function readProfile(){try{const raw=storage.getItem(KEYS.profile);if(!raw)return {schema:1,completed:[],options:{speed:1}};const p=JSON.parse(raw);if(p?.schema!==1||!Array.isArray(p.completed)||p.completed.some(id=>!E.Levels.some(l=>l.id===id))||!p.options||![1,3].includes(p.options.speed))throw Error('個人進度格式');return p;}catch{return {schema:1,completed:[],options:{speed:1},repaired:true};}}
 function setOptions(options){if(volatile)return false;try{const p=readProfile();if(options.speed!==undefined){if(![1,3].includes(options.speed))return false;p.options.speed=options.speed;}storage.setItem(KEYS.profile,JSON.stringify(p));return true;}catch{return false;}}
 function markComplete(id){if(volatile)return false;try{const p=readProfile();if(!p.completed.includes(id)){p.completed.push(id);storage.setItem(KEYS.profile,JSON.stringify(p));}return true;}catch{return false;}}
 return {load,save,readProfile,markComplete,setOptions,status:()=>({token,volatile,reason}),enterVolatile(){volatile=true;reason='暫存遊玩中；本分頁不覆蓋其他分頁進度，請匯出備份。';}};
}
const API={KEYS,digest,parseEnvelope,createStore};if(typeof module!=='undefined')module.exports=API;else root.ParkStorage=API;
})(typeof globalThis!=='undefined'?globalThis:this);
