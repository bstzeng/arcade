/* Isolated local save and single-writer tab lease; never touches other games. */
(function(root,factory){const a=factory();if(typeof module==='object'&&module.exports)module.exports=a;else root.StarweaveStorage=a;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const KEY='arcade.starweave-idle.save.v1',LEASE=KEY+'.lease',LOCK=KEY+'.writer';
function make(storage,options={}){const now=options.now||Date.now,token=options.token||'tab-'+Math.random().toString(36).slice(2)+'-'+now();let owner=false,protectedSave=false,temporary=false,releaseLock=null,lastError='',lastSaved=0;
function read(){try{const raw=storage.getItem(KEY);if(!raw)return{raw:null,status:'new'};return{raw,status:'saved'};}catch(e){temporary=true;lastError='無法使用本機儲存，目前進度只在這一頁。';return{raw:null,status:'unavailable'};}}
function lease(){try{return JSON.parse(storage.getItem(LEASE)||'null');}catch{return null;}}
function valid(){if(temporary)return owner;const l=lease();return owner&&l&&l.token===token&&l.until>now();}
function claim(){if(owner&&valid())return true;try{const l=lease();if(l&&l.token!==token&&l.until>now()){owner=false;return false;}storage.setItem(LEASE,JSON.stringify({token,until:now()+9000}));owner=lease()?.token===token;return owner;}catch{temporary=true;owner=true;lastError='本機儲存被封鎖，目前進度不會保存。';return true;}}
async function acquire(lockApi){if(owner&&valid())return true;if(lockApi&&typeof lockApi.request==='function'){return new Promise(resolve=>{try{lockApi.request(LOCK,{mode:'exclusive',ifAvailable:true},async lock=>{if(!lock){resolve(false);return;}if(!claim()){resolve(false);return;}resolve(true);await new Promise(r=>{releaseLock=r;});}).catch(()=>resolve(claim()));}catch{resolve(claim());}});}return claim();}
function heartbeat(){if(!owner)return false;if(temporary)return true;if(!valid()){owner=false;lastError='另一個分頁正在照顧小絨，本頁暫停等待。';if(releaseLock){releaseLock();releaseLock=null;}return false;}try{storage.setItem(LEASE,JSON.stringify({token,until:now()+9000}));return true;}catch{temporary=true;lastError='儲存空間不足，目前進度尚未保存。';return true;}}
function save(raw,force=false){if(protectedSave&&!force){return false;}if(!valid()){lastError='未取得這份存檔的寫入權限。';return false;}if(temporary){lastError='本機儲存不可用，目前進度不會保存。';return false;}try{storage.setItem(KEY,raw);lastSaved=now();lastError='';protectedSave=false;return true;}catch{lastError='存檔失敗：瀏覽器儲存空間不足或被封鎖。請下載備份。';return false;}}
function release(){if(owner&&!temporary){try{if(lease()?.token===token)storage.removeItem(LEASE);}catch{}}owner=false;if(releaseLock){releaseLock();releaseLock=null;}}
function protect(message){protectedSave=true;lastError=message||'原始存檔無法讀取，已保留且不會被覆蓋。可先下載備份。';}
return{read,acquire,claim,heartbeat,valid,save,release,protect,get status(){return{owner:valid(),protected:protectedSave,temporary,lastError,lastSaved};},token};}
return{KEY,LEASE,LOCK,make};});
