(function(root){'use strict';const E=typeof module!=='undefined'?require('./engine.js'):root.Xiangqi;
function settings(x){if(!x||!['local','ai'].includes(x.mode)||!['easy','normal','hard'].includes(x.level)||![1,-1].includes(x.human))throw Error('Invalid settings');return {mode:x.mode,level:x.level,human:x.human};}
function fresh(options={mode:'ai',level:'normal',human:1}){return {options:settings(options),moves:[],state:E.initial()};}
function move(session,m){const state=E.play(session.state,m);return {...session,state,moves:[...session.moves,{from:m.from,to:m.to}]};}
function restore(raw){if(typeof raw!=='string'||raw.length>180000)throw Error('Invalid save');const d=JSON.parse(raw);if(d.version!==1||!Array.isArray(d.moves)||d.moves.length>3000)throw Error('Invalid save');let s=fresh(d.options);for(const m of d.moves)s=move(s,m);return s;}
function save(s){return JSON.stringify({version:1,options:s.options,moves:s.moves});}
function undo(s){let count=s.moves.length;if(!count)return s;if(s.options.mode==='local')count--;else{do{count--;}while(count>0&&(count%2===0?1:-1)!==s.options.human);}let n=fresh(s.options);for(const m of s.moves.slice(0,count))n=move(n,m);return n;}
const api={fresh,move,restore,save,undo,settings};if(typeof module!=='undefined')module.exports=api;root.XiangqiSession=api;
})(typeof globalThis!=='undefined'?globalThis:this);
