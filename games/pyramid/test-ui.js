'use strict';
// No browser/dependencies: exercises the shipped UI's event handlers with a small DOM.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const data=require('./deals.json'),E=require('./engine.js');
function setup(saved=null,blockedStorage=false){
  const elements=new Map(),timers=new Map();let tid=0,now=0;
  class Element{
    constructor(tag='div'){this.tagName=tag.toUpperCase();this.children=[];this.dataset={};this.attrs={};this.handlers={};this.disabled=false;this.hidden=false;this.className='';this.textContent='';this.value='';this.isConnected=true;this.style={setProperty(){}};this.classList={toggle:(name,on)=>{const s=new Set(this.className.split(' ').filter(Boolean));on?s.add(name):s.delete(name);this.className=[...s].join(' ');}};}
    append(...xs){this.children.push(...xs);}
    replaceChildren(...xs){this.children=[...xs];}
    setAttribute(k,v){this.attrs[k]=String(v);}
    addEventListener(k,f){(this.handlers[k]||=[]).push(f);}
    fire(k,extra={}){if(k==='click'&&this.disabled)return;(this.handlers[k]||[]).forEach(f=>f({target:this,...extra}));}
    focus(){doc.activeElement=this;}
    showModal(){this.open=true;}
    close(){this.open=false;this.fire('close');}
  }
  const html=fs.readFileSync(__dirname+'/../pyramid.html','utf8');
  for(const m of html.matchAll(/<([a-z]+)[^>]*\bid="([^"]+)"[^>]*>/g)){
    const el=new Element(m[1]);el.id=m[2];elements.set(el.id,el);
  }
  const walk=()=>{const xs=[];const recurse=n=>{xs.push(n);n.children.forEach(recurse);};elements.forEach(recurse);return xs;};
  const doc={activeElement:null,hidden:false,handlers:{},getElementById:id=>elements.get(id),createElement:tag=>new Element(tag),
    querySelector:sel=>{const m=/data-card="(\d+)"/.exec(sel);return m?walk().find(n=>n.dataset.card===m[1]):null;},
    querySelectorAll:sel=>walk().filter(n=>['BUTTON','SELECT'].includes(n.tagName)),addEventListener(k,f){(this.handlers[k]||=[]).push(f);}};
  const storage=new Map();if(saved!==null)storage.set('arcade-pyramid-v1',saved);
  const context={console,document:doc,performance:{now:()=>now},setInterval:(fn,ms)=>{timers.set(++tid,{fn,ms});return tid;},clearInterval:id=>timers.delete(id),localStorage:{getItem:k=>{if(blockedStorage)throw Error('blocked');return storage.get(k)||null;},setItem:(k,v)=>{if(blockedStorage)throw Error('blocked');storage.set(k,v);}}};
  context.window=context;context.addEventListener=()=>{};vm.createContext(context);
  for(const file of ['engine.js','deals.js','app.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+file,'utf8'),context,{filename:file});
  return {get:id=>elements.get(id),click:id=>elements.get(id).fire('click'),doc,storage,timers,saved:()=>JSON.parse(storage.get('arcade-pyramid-v1')),tick:ms=>{now+=ms;for(const x of [...timers.values()])if(x.ms===ms)x.fn();},card:id=>walk().find(n=>n.dataset.card===String(id))};
}
let ui=setup();assert.equal(ui.get('deal').children.length,50);assert.equal(ui.saved().actions.length,0);assert.equal(ui.get('pyramid').children.length,28);
ui.click('stock');assert.equal(ui.saved().actions.length,1);assert.equal(ui.get('stockCount').textContent,23);ui.click('undo');assert.equal(ui.saved().actions.length,0);
ui.click('hint');assert.equal(ui.saved().assisted,true);assert.match(ui.get('status').textContent,/提示/);
// Select and cancel selection, invalid pairs leave the move history unchanged.
const d=data.deals[0],free=E.playable(E.initial(d)).filter(c=>E.rank(c)!==13),a=free[0],b=free.find(c=>c!==a&&E.rank(a)+E.rank(c)!==13);
ui.card(a).fire('click');assert.equal(ui.card(a).attrs['aria-pressed'],'true');ui.card(a).fire('click');assert.equal(ui.card(a).attrs['aria-pressed'],'false');
ui.card(a).fire('click');ui.card(b).fire('click');assert.equal(ui.saved().actions.length,0);
// Full playback follows every real engine action, win at pyramid clear, undo reopens it.
ui.click('solution');assert(ui.get('confirmDialog').open);ui.click('acceptConfirm');
for(let i=0;i<120;i++)ui.tick(650);
assert.equal(ui.saved().actions.length,d.witness.length);assert(!ui.get('win').hidden);assert.match(ui.get('winTitle').textContent,/示範完成/);assert.equal(ui.saved().assisted,true);
ui.click('undo');assert(ui.get('win').hidden);assert.equal(ui.saved().actions.length,d.witness.length-1);
const savedGood=ui.storage.get('arcade-pyramid-v1');let reload=setup(savedGood);assert.equal(reload.saved().actions.length,d.witness.length-1);assert.match(reload.get('status').textContent,/恢復/);
// Restart confirmation cancel preserves history; accept clears it.
ui.click('restart');ui.click('cancelConfirm');assert.equal(ui.saved().actions.length,d.witness.length-1);ui.click('restart');ui.click('acceptConfirm');assert.equal(ui.saved().actions.length,0);
// Stopping playback by asking to restart, then cancelling, must not leave cards disabled.
ui.click('solution');ui.click('acceptConfirm');ui.tick(650);ui.click('restart');ui.click('cancelConfirm');
const ps=E.replay(d,ui.saved().actions).at(-1);for(const c of E.playable(ps))assert.equal(ui.card(c).disabled,false);
// Depart the certified route by drawing the whole stock. Hint requires explicit rollback.
ui=setup();for(let i=0;i<24;i++)ui.click('stock');const before=ui.saved().actions.length;
ui.click('hint');assert(ui.get('confirmDialog').open);assert.match(ui.get('confirmText').textContent,/撤銷/);ui.click('cancelConfirm');assert.equal(ui.saved().actions.length,before);
ui.click('hint');ui.click('acceptConfirm');assert(ui.saved().actions.length<before);assert.match(ui.get('status').textContent,/提示/);
// Selector resets while its confirmation is pending, and changes only after accept.
ui.get('deal').value='50';ui.get('deal').fire('change');if(ui.get('confirmDialog').open)ui.click('acceptConfirm');assert.equal(ui.saved().deal,50);
ui.click('solution');ui.click('acceptConfirm');for(let i=0;i<120;i++)ui.tick(650);assert(!ui.get('win').hidden);assert.equal(ui.saved().actions.length,data.deals[49].witness.length);
// Corrupt stored move and corrupted JSON fail safely; no forged board can load.
for(const raw of ['{oops',JSON.stringify({version:1,deal:1,actions:[{type:'remove',cards:[d.pyramid[0]]}],elapsed:0,assisted:false})]){
  const bad=setup(raw);assert.equal(bad.saved().actions.length,0);assert.match(bad.get('status').textContent,/無法通過驗證/);
}
const blocked=setup(null,true);assert.match(blocked.get('status').textContent,/無法儲存/);blocked.click('stock');assert.equal(blocked.get('stockCount').textContent,23);
console.log('PASS: UI load/select, card clicks, bad pair, undo, confirmed restart, full playback #01/#50, stop/cancel recovery, safe hint rollback/cancel, verified reload, corrupt save, unavailable storage');
