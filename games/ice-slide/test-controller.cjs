/* Dependency-free DOM contract harness. It tests UI actions, not browser rendering. */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const levels=require('./levels.json'),engine=require('./engine.js');
const html=fs.readFileSync(path.join(__dirname,'../ice-slide.html'),'utf8');
class Element{
 constructor(id='',data={}){this.id=id;this.dataset=data;this.listeners={};this.attributes={};this.style={setProperty(){}};this.textContent='';this.innerHTML='';this.hidden=false;this.disabled=false;this.children=[];this.open=false;this.width=0;this.height=0;}
 setAttribute(k,v){this.attributes[k]=v;}getAttribute(k){return this.attributes[k];}addEventListener(k,v){this.listeners[k]=v;}replaceChildren(...c){this.children=c;}showModal(){this.open=true;}close(){this.open=false;}focus(){}setPointerCapture(){}getBoundingClientRect(){return {left:0,top:0,right:400,bottom:400,width:400,height:400};}getContext(){return new Proxy({},{get:()=>()=>{},set:()=>true});}
}
const nodes=new Map([...html.matchAll(/id="([^"]+)"/g)].map(m=>[m[1],new Element(m[1])]));
const robots=[0,1,2].map(r=>new Element('',{robot:r})),dirs=[0,1,2,3].map(d=>new Element('',{dir:d})),dialogs=['level-dialog','help-dialog','solution-dialog'].map(id=>nodes.get(id));const closes=[...html.matchAll(/data-close="([^"]+)"/g)].map(m=>new Element('',{close:m[1]}));
const document={hidden:false,listeners:{},getElementById:id=>nodes.get(id),createElement:()=>new Element(),querySelectorAll:q=>q==='[data-robot]'?robots:q==='[data-dir]'?dirs:q==='[data-close]'?closes:q==='dialog'?dialogs:[],querySelector:q=>q==='dialog[open]'?dialogs.find(d=>d.open)||null:null,addEventListener(k,v){this.listeners[k]=v;}};
let lastSession;class Session extends engine.Session{constructor(l){super(l);lastSession=this;}}
const timers=new Map();let timerId=0,workers=[];
class Worker{constructor(){this.stopped=false;workers.push(this);}terminate(){this.stopped=true;}postMessage(payload){this.payload=payload;}reply(){const p=this.payload;this.onmessage({data:{token:p.token,...engine.search(engine.board(p.level),p.state)}});}}
const storage={};const context={window:{ICE_LEVELS:levels,IceCore:{...engine,Session},addEventListener(){},devicePixelRatio:1},document,Worker,ResizeObserver:class{observe(){}},requestAnimationFrame:fn=>fn(),setTimeout:fn=>{timers.set(++timerId,fn);return timerId;},clearTimeout:id=>timers.delete(id),localStorage:{getItem:k=>storage[k],setItem:(k,v)=>storage[k]=v},console};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'app.js'),'utf8'),context);
const click=id=>nodes.get(id).onclick(),drain=()=>{let count=0;while(timers.size){const [k,f]=timers.entries().next().value;timers.delete(k);f();assert(++count<1000,'Timer loop');}},load=i=>{click('levels-open');nodes.get('level-grid').children[i].onclick();};
for(let i=0;i<50;i++){load(i);assert.deepEqual(lastSession.positions,levels[i].start);for(const [r,d]of levels[i].solution){robots[r].onclick();dirs[d].onclick();}assert(lastSession.won);assert.equal(+nodes.get('moves').textContent,levels[i].solution.length);assert.equal(nodes.get('win-banner').hidden,false);assert.equal(JSON.parse(storage['arcade.ice-slide.v1']).records[i+1].best,levels[i].solution.length);click('undo');assert(!lastSession.won);click('restart');assert.equal(lastSession.count,0);assert(!lastSession.assisted);}
// Stale worker response must never affect a restarted board or open a dialog.
load(30);click('solution');const stale=workers.at(-1);click('restart');stale.reply();assert(!nodes.get('solution-dialog').open);assert.equal(lastSession.count,0);assert(!lastSession.assisted);
// A modal opened while a search is pending cancels that search.
click('solution');const abandoned=workers.at(-1);click('help-open');abandoned.reply();assert(nodes.get('help-dialog').open);assert(!nodes.get('solution-dialog').open);nodes.get('help-dialog').close();
// Off-path UI hint applies exactly the newly computed route; then full playback completes.
let alt;for(let r=0;r<3&&!alt;r++)for(let d=0;d<4&&!alt;d++)if((r!==levels[30].solution[0][0]||d!==levels[30].solution[0][1])&&engine.slide(lastSession.b,lastSession.positions,r,d))alt=[r,d];robots[alt[0]].onclick();dirs[alt[1]].onclick();const before=lastSession.positions.slice();click('hint');workers.at(-1).reply();assert.deepEqual(lastSession.positions,before);assert(!nodes.get('apply-hint').hidden);click('apply-hint');assert.equal(lastSession.count,2);click('solution');workers.at(-1).reply();assert(nodes.get('solution-dialog').open);click('play-solution');drain();assert(lastSession.won);assert(lastSession.assisted);
// Manual direction interrupts playback, with no future timer movement.
load(49);click('solution');workers.at(-1).reply();click('play-solution');robots[1].onclick();assert.equal(timers.size,0);assert.equal(lastSession.count,0);
// Keyboard, pointer swipe and no-op UI actions.
const event={key:'2',preventDefault(){}};document.listeners.keydown(event);assert.equal(robots[1].attributes['aria-pressed'],'true');const old=lastSession.positions.slice();document.listeners.keydown({key:'ArrowUp',preventDefault(){}});assert.deepEqual(lastSession.positions,engine.slide(lastSession.b,old,1,0)||old);click('restart');const pos=lastSession.positions[0],n=lastSession.level.size,x=(pos%n+.5)*400/n,y=(Math.floor(pos/n)+.5)*400/n;nodes.get('board').listeners.pointerdown({button:0,pointerId:1,clientX:x,clientY:y});nodes.get('board').listeners.pointerup({pointerId:1,clientX:x+50,clientY:y});assert.deepEqual(lastSession.positions,engine.slide(lastSession.b,lastSession.level.start,0,1)||lastSession.level.start);
console.log('PASS controller DOM contract: 50 UI-played levels, saved independent bests, selection, keyboard, touch swipes, off-path hint, full playback, stop, stale search cancellation, modal interruption, undo/restart. This is not visual/browser QA.');
