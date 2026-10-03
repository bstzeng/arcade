(function(root,factory){const E=typeof module==='object'&&module.exports?require('./engine.js'):root.Story120;const api=factory(E);if(typeof module==='object'&&module.exports)module.exports=api;else root.StorySession=api;})(typeof globalThis!=='undefined'?globalThis:this,function(E){
'use strict';
function create(id,levels,proofs,storage){
 if(!Array.isArray(levels)||levels.length!==100||!Array.isArray(proofs)||proofs.length!==100)throw Error('情境套件不完整');
 const key='story120-v1:'+id,records={},api={state:E.create(id,levels[0]),notice:'',hintText:'',showHelp:false};
 function snapshot(){return {version:1,current:E.pack(api.state),records:Object.values(records)};}
 function save(){try{if(storage)storage.setItem(key,JSON.stringify(snapshot()));}catch(e){api.notice='瀏覽器未允許儲存；這次故事仍可繼續。';}}
 function credit(){if(api.state.mode==='challenge'&&E.won(api.state)&&!api.state.assisted){records[api.state.levelId]=E.pack(api.state);api.notice='已記下本情境的獨立完成。其他結局也有自己的故事。';}save();}
 function reset(levelId=api.state.levelId,mode=api.state.mode,difficulty=api.state.difficulty){const l=levels.find(x=>x.id===levelId);if(!l)throw Error('情境不存在');api.state=E.create(id,l,{mode,difficulty});api.notice='新的故事已開始。';api.hintText='';save();return api.state;}
 Object.assign(api,{levels,proofs,records,snapshot,reset,level(){return levels.find(x=>x.id===api.state.levelId);},dispatch(type,value){
 if(type==='choice'){api.state=E.apply(api.state,value);api.hintText='';credit();}
 else if(type==='level')reset(value);
 else if(type==='mode'){if(!['challenge','free'].includes(value))throw Error('模式不存在');reset(api.state.levelId,value,value==='challenge'?'normal':api.state.difficulty);}
 else if(type==='difficulty'){if(api.state.mode!=='free'||!E.DIFFICULTIES.includes(value))throw Error('難度只可在自由故事改變');reset(api.state.levelId,'free',value);}
 else if(type==='reset')reset();
 else if(type==='hint'){api.state=E.assist(api.state);const p=proofs.find(p=>p.id===api.state.levelId),prefix=api.state.mode==='challenge'&&api.state.difficulty==='normal'&&api.state.trace.every((a,i)=>p.witness[i]===a);const plan=prefix?{actions:p.witness.slice(api.state.trace.length)}:E.continuation(api.state);const first=plan.actions&&plan.actions[0],choice=first&&E.choices(api.state).find(c=>c.id===first);api.hintText=E.hint(api.state)+(choice?' 依目前目標，一條可行的下一步是「'+choice.label+'」。'+choice.detail:api.state.done?' 這條故事已走到尾聲；可比較目標與實際後果，再重新開始。':plan.exhausted?' 目前分支較多，尚未確認通往目標的完整路線。可重新開始觀看示範。':' 先前選擇已使本局目標無法同時達成；仍可完成另一種結局，或重新開始。');api.notice='本次已標記為使用提示；不會取得獨立完成紀錄。';save();}
 else if(type==='demo'){const proof=proofs.find(p=>p.id===api.state.levelId);reset(api.state.levelId,'challenge','normal');api.state=E.assist(api.state);for(const action of proof.witness)api.state=E.apply(api.state,action);api.notice='示範依正常規則走完一條可行路線；不會計為獨立完成。';save();}
 else if(type==='help'){api.showHelp=!api.showHelp;}
 else throw Error('未知控制');
 return api.state;
 }});
 if(storage){try{const raw=storage.getItem(key);if(raw){if(raw.length>250000)throw Error('存檔太大');const obj=JSON.parse(raw);if(!obj||obj.version!==1||!Array.isArray(obj.records)||obj.records.length>100)throw Error('格式錯誤');const current=E.restore(id,levels,obj.current);for(const r of obj.records){const s=E.restore(id,levels,r);if(s.mode!=='challenge'||s.assisted||!E.won(s))throw Error('完成紀錄無效');records[s.levelId]=E.pack(s);}api.state=current;api.notice='已從合法選擇紀錄復原故事。';}}catch(e){Object.keys(records).forEach(k=>delete records[k]);api.state=E.create(id,levels[0]);api.notice='舊存檔不完整或格式不符，已安全開啟第一個情境。';}}
 return api;
}
return {create};
});
