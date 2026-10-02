(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./engine.js'));else root.GameSession=factory(root.GameEngine);})(typeof self!=='undefined'?self:globalThis,function(E){'use strict';
const defaults={mode:'ai',human:0,difficulty:'normal'};
function validConfig(c){return c&&['ai','local'].includes(c.mode)&&[0,1].includes(c.human)&&Object.hasOwn(E.LEVELS,c.difficulty);}
class Session{
 constructor(config=defaults){if(!validConfig(config))throw Error('Invalid config');this.config={...config};this.actions=[];this.state=E.initial();this.revision=0;}
 play(move){const next=E.step(this.state,move);if(!next)return false;this.state=next;this.actions.push(typeof move==='number'?move:{...move});this.revision++;return true;}
 undoIndex(){if(!this.actions.length)return -1;let s=E.initial(),start=-1,prev=-1;for(let i=0;i<this.actions.length;i++){const actor=s.turn;if(this.config.mode==='local'){if(actor!==prev)start=i;}else if(actor===this.config.human&&actor!==prev)start=i;prev=actor;s=E.step(s,this.actions[i]);}return start;}
 undo(){const i=this.undoIndex();if(i<0)return false;this.actions=this.actions.slice(0,i);this.state=E.replay(this.actions);this.revision++;return true;}
 reset(config=this.config){if(!validConfig(config))throw Error('Invalid config');this.config={...config};this.actions=[];this.state=E.initial();this.revision++;}
 isAI(){return this.config.mode==='ai'&&this.state.result===null&&this.state.turn!==this.config.human;}
 save(){return {version:1,game:E.id,config:{...this.config},actions:this.actions.map(m=>typeof m==='number'?m:{...m})};}
 static restore(raw){const x=typeof raw==='string'?JSON.parse(raw):raw;if(!x||x.version!==1||x.game!==E.id||!validConfig(x.config))throw Error('Invalid save');const s=new Session(x.config);s.state=E.replay(x.actions);s.actions=x.actions.map(m=>typeof m==='number'?m:{...m});return s;}
}
return {Session,defaults,validConfig};});
