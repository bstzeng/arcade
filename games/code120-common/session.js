(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./engine.js'):root.Code120);if(typeof module==='object'&&module.exports)module.exports=api;else root.Code120Session=api;})(typeof globalThis!=='undefined'?globalThis:this,function(E){'use strict';
class Session{constructor(id,levels,storage){this.id=id;this.levels=levels;this.storage=storage;this.key='code120:v1:'+id;this.index=0;this.entries={};this.result=null;this.cursor=-1;this.replay=false;this.storageError=false;try{const saved=JSON.parse(storage.getItem(this.key)||'{}');if(saved.version===1){this.index=Number.isInteger(saved.index)&&saved.index>=0&&saved.index<levels.length?saved.index:0;for(const [key,value]of Object.entries(saved.entries||{})){if(!/^\d+$/.test(key)||Number(key)<1||Number(key)>levels.length||!value||typeof value.program!=='string'||value.program.length>6000)continue;this.entries[key]={program:value.program,assisted:Boolean(value.assisted),manualComplete:Boolean(value.manualComplete),assistedComplete:Boolean(value.assistedComplete)};}}}catch(e){this.storageError=true;}this.ensure();}
get level(){return this.levels[this.index];}get entry(){return this.entries[this.level.id];}ensure(){if(!this.entries[this.level.id])this.entries[this.level.id]={program:this.level.starter,assisted:false,manualComplete:false,assistedComplete:false};}
save(){try{this.storage.setItem(this.key,JSON.stringify({version:1,index:this.index,entries:this.entries}));this.storageError=false;}catch(e){this.storageError=true;}}
select(index){if(!Number.isInteger(index)||index<0||index>=this.levels.length)return false;this.index=index;this.ensure();this.result=null;this.cursor=-1;this.replay=false;this.save();return true;}
edit(program){if(typeof program!=='string'||program.length>6000)return false;this.entry.program=program;this.result=null;this.cursor=-1;this.replay=false;this.save();return true;}
restart(){this.edit(this.level.starter);}
hint(){this.entry.assisted=true;this.save();return this.level.hint;}
prepare(replay=false){this.replay=replay;if(replay){this.entry.assisted=true;this.save();}this.result=E.evaluate(this.id,this.level,replay?this.level.solution:this.entry.program);this.cursor=-1;return this.result;}
credit(){if(this.replay||!this.result||!this.result.ok)return;this.entry[this.entry.assisted?'assistedComplete':'manualComplete']=true;this.save();}
step(){if(!this.result)this.prepare(false);if(this.cursor<this.result.trace.length-1)this.cursor++;if(this.cursor===this.result.trace.length-1)this.credit();return this.frame;}
run(){if(!this.result||this.replay)this.prepare(false);this.cursor=this.result.trace.length-1;this.credit();return this.result;}
demo(){this.prepare(true);this.cursor=this.result.trace.length?0:-1;return this.result;}
finishDemo(){if(!this.replay)return false;this.cursor=this.result.trace.length-1;return true;}
copyDemo(){this.entry.assisted=true;this.edit(this.level.solution);return this.entry.program;}
get frame(){return this.result?.trace[this.cursor]||null;}
snapshot(){return {id:this.id,index:this.index,levelId:this.level.id,entry:E.clone(this.entry),cursor:this.cursor,replay:this.replay,result:this.result?{ok:this.result.ok,error:this.result.error,steps:this.result.steps}:null};}
}
return {Session};});
