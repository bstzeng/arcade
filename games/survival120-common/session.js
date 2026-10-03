(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./engine.js'));else root.SurvivalSession=factory(root.SurvivalEngine);})(this,function(E){'use strict';
const modes=['manual','hint','demo'];
function emptyProgress(){return {manual:[],hint:[],demo:[]};}
function cleanProgress(p){const r=emptyProgress();for(const k of modes)if(p&&Array.isArray(p[k]))r[k]=[...new Set(p[k].filter(x=>Number.isInteger(x)&&x>=1&&x<=100))].slice(0,100);return r;}
function create(id,number=1,difficulty='normal',progress){return {state:E.create(E.makeLevel(id,number),difficulty),mode:'manual',paused:false,progress:cleanProgress(progress),demoIndex:0};}
function apply(session,action){if(session.paused)return {accepted:false,session,reason:'已暫停'};const r=E.step(session.state,action);if(!r.accepted)return {accepted:false,session,reason:r.reason};const s={...session,state:r.state};if(s.state.status==='won'){s.progress=cleanProgress(s.progress);const n=s.state.level.number;if(!s.progress[s.mode].includes(n))s.progress[s.mode].push(n);}return {accepted:true,session:s};}
function assist(s,kind){if(!['hint','demo'].includes(kind))throw Error('Invalid assistance');return {...s,mode:kind==='demo'?'demo':s.mode==='demo'?'demo':'hint'};}
function encode(s){return JSON.stringify({schema:1,id:s.state.id,number:s.state.level.number,difficulty:s.state.difficulty,actions:s.state.log,mode:s.mode,paused:s.paused,progress:cleanProgress(s.progress)});}
function decode(text,id){try{if(typeof text!=='string'||text.length>25000)return null;const p=JSON.parse(text);if(p.schema!==1||p.id!==id||!modes.includes(p.mode)||typeof p.paused!=='boolean')return null;const state=E.replay(E.makeLevel(id,p.number),p.actions,p.difficulty);return {state,mode:p.mode,paused:p.paused,progress:cleanProgress(p.progress),demoIndex:0};}catch(e){return null;}}
function reset(s,number=s.state.level.number,difficulty=s.state.difficulty){return create(s.state.id,number,difficulty,s.progress);}
return {create,apply,assist,encode,decode,reset,emptyProgress,cleanProgress};});
