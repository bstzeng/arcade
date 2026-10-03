(function(r,f){const a=f();if(typeof module==='object')module.exports=a;else r.DuelSession=a;})(globalThis,function(){'use strict';
function clean(v){return Array.isArray(v)?[...new Set(v.filter(n=>Number.isInteger(n)&&n>=1&&n<=100))]:[];}
class Session{constructor(id,storage){this.key='frontier120:fighting:v1:'+id;this.storage=storage;this.data={manual:[],assisted:[],helped:[]};try{const d=JSON.parse(storage.getItem(this.key)||'{}');for(const k of Object.keys(this.data))this.data[k]=clean(d[k]);}catch(e){}this.level=1;this.mode='challenge';this.demo=false;this.manualInput=false;}
 save(){try{this.storage.setItem(this.key,JSON.stringify(this.data));return true;}catch(e){return false;}}
 start(level,mode='challenge'){this.level=level;this.mode=mode;this.demo=false;this.manualInput=false;}
 help(){if(this.mode==='challenge'&&!this.data.helped.includes(this.level))this.data.helped.push(this.level);this.save();}
 isAssisted(){return this.demo||this.data.helped.includes(this.level);}
 input(){if(!this.demo)this.manualInput=true;}
 finish(state){if(state.status!=='won'||this.mode!=='challenge')return false;const k=this.isAssisted()?'assisted':'manual';if(k==='manual'&&!this.manualInput)return false;if(!this.data[k].includes(this.level))this.data[k].push(this.level);return this.save();}
 summary(){return{manual:this.data.manual.length,assisted:this.data.assisted.length,helped:this.isAssisted()};}}
return{Session,clean};});
