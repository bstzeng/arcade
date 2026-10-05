(function(root){'use strict';
  const KEY='arcade.tide-feast.v1',BACKUP=KEY+'.backup';
  function create(storage,engine){
    let expected=null,blocked=false,volatile=false,lastError='',token=0;
    function parse(raw){if(!raw)return null;const data=JSON.parse(raw);if(data.version!==1||typeof data.token!=='string'||typeof data.state!=='string')throw Error('存檔封套錯誤');return {data,state:engine.deserialize(data.state)};}
    function read(){try{const raw=storage.getItem(KEY);expected=raw;try{const p=parse(raw);return p?{state:p.state,recovered:false,error:''}:{state:null,recovered:false,error:''};}catch(e){try{const b=parse(storage.getItem(BACKUP));if(b)return{state:b.state,recovered:true,error:'主存檔損壞，已讀取上一份安全備份。'};}catch(ignore){}lastError='無法讀取本機存檔。開始新旅程不會清除其他遊戲。';return{state:null,recovered:false,error:lastError};}}catch(e){volatile=true;lastError='瀏覽器不允許儲存，這次只能暫時遊玩。';return{state:null,recovered:false,error:lastError};}}
    function save(state){if(volatile)return{ok:false,reason:'volatile'};if(blocked)return{ok:false,reason:'conflict'};try{const raw=storage.getItem(KEY);if(raw!==expected){blocked=true;lastError='另一分頁已更新進度。已暫停，避免互相覆蓋。';return{ok:false,reason:'conflict'};}const next=JSON.stringify({version:1,token:Date.now().toString(36)+'-'+(++token)+'-'+Math.random().toString(36).slice(2),state:engine.serialize(state)});if(raw){try{parse(raw);storage.setItem(BACKUP,raw);}catch(e){/* Preserve an existing good backup if the primary was damaged. */}}storage.setItem(KEY,next);expected=next;return{ok:true};}catch(e){volatile=true;lastError='本機儲存空間不可用，這次的進度尚未存下。';return{ok:false,reason:'unavailable'};}}
    function changed(newValue){if(volatile)return false;if(newValue!==expected){blocked=true;lastError='另一分頁已更新進度。已暫停，避免互相覆蓋。';return true;}return false;}
    function useLatest(){blocked=false;volatile=false;return read();}
    function temporary(){volatile=true;blocked=false;lastError='本頁為暫玩模式，進度不會儲存。';}
    function status(){return{blocked,volatile,error:lastError};}
    return{read,save,changed,useLatest,temporary,status};
  }
  const api={KEY,BACKUP,create};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.TideStorage=api;
})(typeof globalThis!=='undefined'?globalThis:this);
