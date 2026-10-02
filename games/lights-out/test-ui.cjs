'use strict';
// Deliberately small event-driven DOM harness. This is not browser/render QA.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const isPeg=path.basename(__dirname)==='peg-solitaire',slug=isPeg?'peg-solitaire':'lights-out',key='arcade.'+slug+'.v1',L=require('./levels.json'),E=require('./engine.js');
function setup(saved=null,blocked=false){
 const elements=new Map(),timers=new Map(),storage=new Map();let id=0;
 const doc={hidden:false,activeElement:null,handlers:{},getElementById:i=>elements.get(i),createElement:t=>new Element(t),addEventListener(k,fn){(this.handlers[k]??=[]).push(fn);},fire(k){for(const f of this.handlers[k]??[])f();}};
 class Element{constructor(tag='div'){this.tagName=tag.toUpperCase();this.children=[];this.dataset={};this.attrs={};this.handlers={};this.disabled=false;this.hidden=false;this.className='';this.textContent='';this.value='';this.style={};this.open=false;this.tabIndex=-1;}append(...xs){this.children.push(...xs);}replaceChildren(...xs){this.children=[...xs];}setAttribute(k,v){this.attrs[k]=String(v);}addEventListener(k,f){(this.handlers[k]??=[]).push(f);}fire(k,extra={}){if(k==='click'&&this.disabled)return;for(const f of this.handlers[k]??[])f({target:this,...extra});}focus(){doc.activeElement=this;this.fire('focus');}showModal(){this.open=true;}close(){this.open=false;this.fire('close');}querySelectorAll(sel){const out=[];function walk(n){for(const c of n.children){if(sel==='button'&&c.tagName==='BUTTON')out.push(c);walk(c);}}walk(this);return out;}querySelector(sel){const m=/data-cell="(\d+)"/.exec(sel);return m?this.querySelectorAll('button').find(b=>Number(b.dataset.cell)===Number(m[1])):null;}}
 const html=fs.readFileSync(__dirname+'/../'+slug+'.html','utf8');for(const m of html.matchAll(/<([a-z]+)[^>]*\bid="([^"]+)"[^>]*>/g)){const el=new Element(m[1]);el.id=m[2];elements.set(el.id,el);}
 if(saved!==null)storage.set(key,saved);
 const set=(fn,ms,repeat=false)=>{timers.set(++id,{fn,ms,repeat});return id;};
 const context={console,document:doc,setInterval:(fn,ms)=>set(fn,ms,true),setTimeout:(fn,ms)=>set(fn,ms),clearTimeout:i=>timers.delete(i),localStorage:{getItem:k=>{if(blocked)throw Error('blocked');return storage.get(k)||null;},setItem:(k,v)=>{if(blocked)throw Error('blocked');storage.set(k,v);}}};context.window=context;context.addEventListener=()=>{};context.Worker=class{postMessage(d){this.timer=set(()=>{if(!this.dead)this.onmessage({data:E.solve(d.level,d.state,60000)});},1);}terminate(){this.dead=true;timers.delete(this.timer);}};vm.createContext(context);for(const f of ['engine.js','levels.js','session.js','app.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+f,'utf8'),context,{filename:f});
 return {get:i=>elements.get(i),click:i=>elements.get(i).fire('click'),cell:i=>elements.get('board').querySelector(`[data-cell="${i}"]`),doc,saved:()=>JSON.parse(storage.get(key)),raw:()=>storage.get(key),tick:async ms=>{for(const [i,t] of [...timers])if(t.ms===ms){if(!t.repeat)timers.delete(i);t.fn();}await Promise.resolve();await Promise.resolve();},flush:async()=>{await Promise.resolve();await Promise.resolve();}};
}
function move(ui,a){if(isPeg){ui.cell(a.from).fire('click');ui.cell(a.to).fire('click');}else ui.cell(a).fire('click');}
(async()=>{
 let ui=setup();assert.equal(ui.get('level').children.length,50);assert.equal(ui.saved().actions.length,0);
 move(ui,L[0].solution[0]);assert.equal(ui.saved().actions.length,1);ui.click('undo');assert.equal(ui.saved().actions.length,0);
 ui.click('hint');await ui.flush();assert.equal(ui.saved().assisted,true);assert.match(ui.get('status').textContent,/提示/);assert.equal(ui.saved().actions.length,0);
 ui.click('solution');await ui.flush();for(let i=0;i<35;i++){await ui.tick(isPeg?550:500);await ui.tick(isPeg?650:600);}assert.equal(ui.saved().actions.length,L[0].solution.length);assert(!ui.get('win').hidden);assert(ui.saved().progress[0]);
 ui.click('undo');assert(ui.get('win').hidden);assert.equal(ui.saved().actions.length,L[0].solution.length-1);
 const reload=setup(ui.raw());assert.equal(reload.saved().actions.length,L[0].solution.length-1);assert.equal(Object.keys(reload.saved().progress).length,1);assert.match(reload.get('status').textContent,/還原/);
 ui.click('restart');if(ui.get('confirmDialog').open)ui.click('cancelConfirm');assert.equal(ui.saved().actions.length,L[0].solution.length-1);ui.click('restart');if(ui.get('confirmDialog').open)ui.click('acceptConfirm');assert.equal(ui.saved().actions.length,0);
 // Completion records need their own legal winning transcripts.
 const forged=ui.saved();forged.progress={0:{moves:L[0].solution.length,seconds:1,assisted:false,witness:[]}};assert.equal(Object.keys(setup(JSON.stringify(forged)).saved().progress).length,0);
 // Switching levels while a confirmation is pending preserves old selection/state.
 move(ui,L[0].solution[0]);if(isPeg||!ui.get('win').hidden){ui.click('undo');move(ui,L[0].solution[0]);}
 ui.get('level').value='49';ui.get('level').fire('change');if(ui.get('confirmDialog').open){assert.equal(ui.saved().index,0);ui.click('cancelConfirm');assert.equal(ui.saved().index,0);ui.get('level').value='49';ui.get('level').fire('change');ui.click('acceptConfirm');}assert.equal(ui.saved().index,49);
 ui.click('solution');await ui.flush();await ui.tick(isPeg?550:500);ui.click('stop');const stopped=ui.saved().actions.length;await ui.tick(isPeg?650:600);assert.equal(ui.saved().actions.length,stopped);assert(ui.get('board').querySelectorAll('button').every(b=>!b.disabled));
 // Resume from current position, not original-board replay.
 ui.click('solution');await ui.flush();for(let i=0;i<40;i++){await ui.tick(isPeg?550:500);await ui.tick(isPeg?650:600);}assert(!ui.get('win').hidden);assert.equal(ui.saved().actions.length,L[49].solution.length);
 ui.click('undo');ui.click('restart');ui.click('cancelConfirm');assert(ui.get('board').querySelectorAll('button').every(b=>!b.disabled));
 // Corruption and blocked storage both leave a usable game.
 for(const raw of ['{bad',JSON.stringify({version:1,index:0,actions:[isPeg?{from:-1,over:0,to:1}:-1],seconds:0,assisted:false,progress:{}})]){const bad=setup(raw);assert.equal(bad.saved().actions.length,0);assert.match(bad.get('status').textContent,/無法讀取/);}
 const blocked=setup(null,true);assert.match(blocked.get('save').textContent,/無法儲存/);move(blocked,L[0].solution[0]);assert.equal(blocked.get('moves').textContent,1);
 // Timer pauses in background; visibility also stops playback.
 ui=setup();await ui.tick(1000);assert.equal(ui.get('timer').textContent,'0:01');ui.doc.hidden=true;ui.doc.fire('visibilitychange');await ui.tick(1000);assert.equal(ui.get('timer').textContent,'0:01');
 // Keyboard navigation keeps one roving keyboard entry point.
 ui=setup();const buttons=ui.get('board').querySelectorAll('button');buttons[0].focus();ui.get('board').fire('keydown',{target:buttons[0],key:'ArrowRight',preventDefault(){}});assert.equal(buttons.filter(b=>b.tabIndex===0).length,1);
 if(isPeg){
  // Pick a legal alternative that is not on the certified path, but is solvable.
  let alternate=null;
  for(let j=0;j<L.length&&!alternate;j++){const proof=E.proof(L[j]);for(const a of E.moves(L[j],L[j].pegs)){const after=E.step(L[j],L[j].pegs,a);if(!proof.some(s=>E.equal(s,after))&&E.solve(L[j],after,50000).solution){alternate={j,a};break;}}}
  assert(alternate);ui=setup(JSON.stringify({version:1,index:alternate.j,actions:[alternate.a],seconds:0,assisted:false,progress:{}}));const original=JSON.stringify(ui.saved().actions);ui.click('hint');await ui.tick(1);await ui.flush();assert.equal(JSON.stringify(ui.saved().actions),original);assert.match(ui.get('status').textContent,/提示/);
  ui.click('solution');await ui.tick(1);await ui.flush();for(let i=0;i<35;i++){await ui.tick(550);await ui.tick(650);}assert(!ui.get('win').hidden);
  // Cancelling a background solve cannot apply a stale route or change the board.
  ui=setup(JSON.stringify({version:1,index:alternate.j,actions:[alternate.a],seconds:0,assisted:false,progress:{}}));ui.click('hint');ui.click('stop');await ui.tick(1);await ui.flush();assert.equal(JSON.stringify(ui.saved().actions),original);assert.match(ui.get('status').textContent,/停止/);assert(ui.get('board').querySelectorAll('button').every(b=>!b.disabled));
 }
 if(!isPeg){ui=setup();ui.get('level').value='49';ui.get('level').fire('change');ui.cell(0).fire('click');const before=ui.saved().actions.length;ui.click('hint');assert.equal(ui.saved().actions.length,before);ui.click('solution');for(let i=0;i<40;i++){await ui.tick(500);await ui.tick(600);}assert(!ui.get('win').hidden);}
 console.log('PASS: '+slug+' real client handlers: selection, hints without mutation, playback #1/#50, stop/resume, unlimited undo, confirmed navigation/restart, best proof validation, corrupted save, blocked storage, keyboard and background pause');
})().catch(e=>{console.error(e);process.exitCode=1;});
