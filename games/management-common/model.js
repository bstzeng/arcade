(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f();else r.ManagementModel=f();})(globalThis,function(){
'use strict';
const clone=x=>JSON.parse(JSON.stringify(x));
const need=(v,m)=>{if(!v)throw Error(m||'目前不能執行這個動作。');};
const int=(v,min=0,max=1e6)=>Number.isInteger(v)&&v>=min&&v<=max;
function make(spec){
 function initial(l){return {...spec.start(l),log:[]};}
 function inspect(l,s){const status=spec.status(l,s);return {status,goalMet:status==='won'};}
 function apply(l,state,a){need(inspect(l,state).status==='playing','本次挑戰已結束，請撤銷或重新開始。');need(a&&typeof a==='object'&&!Array.isArray(a)&&typeof a.type==='string','動作格式錯誤。');need(Object.entries(a).every(([k,v])=>k==='type'||(k==='kind'&&typeof v==='string')||(Number.isSafeInteger(v)&&v>=0)),'索引與數量必須是非負整數。');const s=clone(state);spec.step(l,s,clone(a));s.log.push(clone(a));need(s.log.length<=1500,'操作次數超出本關上限。');return s;}
 function validate(l,s){try{if(!s||!Array.isArray(s.log)||s.log.length>1500)return false;let x=initial(l);for(const a of s.log)x=apply(l,x,a);return JSON.stringify(x)===JSON.stringify(s);}catch(_){return false;}}
 const api={createState:initial,applyAction:apply,validateState:validate,inspect,legalActions(l,s){if(inspect(l,s).status!=='playing')return [];return spec.actions(l,s).filter(a=>{try{apply(l,s,a);return true;}catch(_){return false;}});},describeAction:spec.describe,canonicalKey(l){const {id,title,chapter,tip,...rest}=l;return JSON.stringify(rest);},hint(l,s){return {text:spec.tip(l,s),kind:'legal-move-only'};}};
 return api;
}
return {clone,need,int,make};
});
