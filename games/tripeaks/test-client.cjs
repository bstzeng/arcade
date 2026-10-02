#!/usr/bin/env node
'use strict';
// Minimal DOM contract harness, NOT a browser or layout test. Runs the actual
// client event handlers and the exact gameplay/session modules without packages.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const E=require('./engine.js'),D=require('./deals.js'),S=require('./session.js');
const html=fs.readFileSync(require('node:path').join(__dirname,'../tripeaks.html'),'utf8');
const client=fs.readFileSync(require('node:path').join(__dirname,'client.js'),'utf8');
function boot(options={}){
  const elements=[],byId=new Map(),events={},intervals=[];let now=0;
  const document={hidden:false,activeElement:null,listeners:events,
    createElement:tag=>new Element(tag),getElementById:id=>byId.get(id),
    querySelector:s=>document.querySelectorAll(s)[0]||null,
    querySelectorAll:s=>elements.filter(el=>matches(el,s)),
    addEventListener:(name,fn)=>(events[name]||=[]).push(fn)};
  function matches(el,s){
    if(s==='dialog')return el.tagName==='DIALOG';
    if(s==='dialog[open]')return el.tagName==='DIALOG'&&el.open;
    if(s==='[data-close]')return !!el.dataset.close;
    const dm=s.match(/^\[data-card="(\d+)"\]$/);if(dm)return el.dataset.card===dm[1];
    if(s==='.card:not(:disabled)')return el.classList.contains('card')&&!el.disabled;
    if(s==='.playable:not(:disabled)')return el.classList.contains('playable')&&!el.disabled;
    return false;
  }
  class Element{
    constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.dataset={};this.attrs={};this.style={};this.listeners={};this.className='';this.textContent='';this.disabled=false;this.hidden=false;this.open=false;elements.push(this);
      this.classList={contains:name=>this.className.split(/\s+/).includes(name),add:name=>{if(!this.classList.contains(name))this.className+=(this.className?' ':'')+name;},
        remove:name=>{this.className=this.className.split(/\s+/).filter(n=>n!==name).join(' ');},
        toggle:(name,force)=>{const on=force===undefined?!this.classList.contains(name):force;if(on)this.classList.add(name);else this.classList.remove(name);return on;}};
    }
    setAttribute(k,v){this.attrs[k]=String(v);if(k==='id'){this.id=v;byId.set(v,this);}if(k.startsWith('data-'))this.dataset[k.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=String(v);}
    getAttribute(k){return this.attrs[k];}
    append(...els){els.forEach(e=>{e.parentElement=this;this.children.push(e);});}
    replaceChildren(...els){this.children=[];this.append(...els);}
    addEventListener(n,f){(this.listeners[n]||=[]).push(f);}
    dispatch(n,other={}){for(const fn of this.listeners[n]||[])fn({target:this,preventDefault(){},...other});}
    click(){if(!this.disabled)this.dispatch('click');}
    showModal(){this.open=true;}
    close(){this.open=false;this.dispatch('close');}
    focus(){document.activeElement=this;}
    querySelector(s){return this.querySelectorAll(s)[0]||null;}
    querySelectorAll(s){return this.children.flatMap(c=>[...(matches(c,s)?[c]:[]),...c.querySelectorAll(s)]);}
  }
  document.body=new Element('body');
  for(const m of html.matchAll(/<([a-z][a-z0-9]*)\b([^>]*)>/g)){
    const attrs=m[2],id=attrs.match(/\bid="([^"]+)"/),close=attrs.match(/\bdata-close="([^"]+)"/);
    if(!id&&!close)continue;const el=new Element(m[1]);if(id)el.setAttribute('id',id[1]);if(close)el.setAttribute('data-close',close[1]);
  }
  const store=options.store||new Map();
  const sandbox={console,document,URLSearchParams,location:{search:options.search||''},performance:{now:()=>now},
    localStorage:{getItem:k=>{if(options.storageThrows)throw Error('denied');return store.get(k)||null;},setItem:(k,v)=>{if(options.storageThrows)throw Error('denied');store.set(k,v);}},
    setInterval:fn=>{intervals.push(fn);return intervals.length;},clearInterval:()=>{},TriPeaks:E,TRIPEAKS_DATA:D,TriPeaksSession:S,
    addEventListener:(n,f)=>(events['window:'+n]||=[]).push(f)};
  sandbox.window=sandbox;vm.createContext(sandbox);vm.runInContext(client,sandbox,{filename:'client.js'});
  return {app:sandbox.TriPeaksApp,$:id=>byId.get(id),document,store,
    advance:ms=>{now+=ms;intervals[0]();},snapshot:()=>JSON.parse(JSON.stringify(sandbox.TriPeaksApp.snapshot()))};
}
const page=boot(),{$,app}=page;
assert.equal(app.snapshot().deal,1);assert.equal($('tableau').children.length,28);
assert.equal($('tableau').querySelectorAll('.card:not(:disabled)').length,10);
assert.equal($('stockCount').textContent,'23');assert.equal($('cleared').textContent,'0');
$('chooseDeal').click();assert.equal($('dealGrid').children.length,50);$('dealDialog').close();
const first=D.deals[0];
assert.ok(app.play(first.witness[0]));page.advance(1000);assert.equal(app.snapshot().elapsed,1000);
$('helpOpen').click();page.advance(5000);assert.equal(app.snapshot().elapsed,1000);$('helpDialog').close();
page.advance(1000);assert.equal(app.snapshot().elapsed,2000);
assert.ok(app.undo());assert.deepEqual(page.snapshot().trace,[]);
// Diverged hints cannot falsely promise the next local move or silently reset.
app.choose(1);const cp=E.checkpoints(first,first.witness);
while(cp.has(E.key(app.snapshot().state)))assert.ok(app.play(-1));
const before=page.snapshot();app.hint();assert.ok($('confirmDialog').open);assert.deepEqual(page.snapshot(),before);
$('confirmCancel').click();assert.deepEqual(page.snapshot(),before);
app.hint();$('confirmOK').click();assert.ok(cp.has(E.key(app.snapshot().state)));assert.ok(app.snapshot().assisted);
const afterHint=page.snapshot();app.hint();assert.deepEqual(page.snapshot(),afterHint,'Repeated hints do not consume cards or actions');
// Restart requires explicit confirmation and preserves the deal, not a new shuffle.
$('restart').click();assert.ok($('confirmDialog').open);const beforeRestart=page.snapshot();$('confirmCancel').click();assert.deepEqual(page.snapshot(),beforeRestart);
$('restart').click();$('confirmOK').click();assert.equal(app.snapshot().deal,1);assert.equal(app.snapshot().trace.length,0);assert.equal(app.snapshot().elapsed,0);
// Preview uses real engine steps, never writes preview state to player's progress.
first.witness.slice(0,4).forEach(a=>app.play(a));app.solution();assert.equal($('solutionList').children.length,first.witness.length);
const original=page.snapshot();$('startPreview').click();assert.ok(app.snapshot().preview);assert.ok($('stock').disabled);
for(let i=0;i<first.witness.length;i++)assert.ok(app.previewStep());
assert.equal(app.snapshot().preview.state.remaining,0);assert.equal(app.snapshot().state.remaining,original.state.remaining);
assert.deepEqual(page.snapshot().trace,original.trace);assert.equal($('completedCount').textContent,'0 / 50');
$('previewExit').click();assert.equal(app.snapshot().preview,null);assert.deepEqual(page.snapshot().state,original.state);assert.deepEqual(page.snapshot().trace,original.trace);
// Every actual winning proof is executed through the browser's public play handler.
let actions=0;
for(const d of D.deals){
  app.choose(d.id);$('restart').click();$('confirmOK').click();
  for(const a of d.witness){assert.ok(app.play(a),`UI deal ${d.id} action ${a}`);actions++;}
  assert.equal(app.snapshot().state.remaining,0);assert.equal($('cleared').textContent,'28');assert.equal($('winBanner').hidden,false);
  assert.ok($('stock').disabled);assert.ok(!app.play(-1));
  assert.ok(app.undo());assert.ok(app.snapshot().state.remaining>0);assert.ok(app.play(d.witness.at(-1)));
}
assert.equal($('completedCount').textContent,'50 / 50');
const restored=boot({store:page.store});assert.equal(restored.app.snapshot().deal,50);assert.equal(restored.app.snapshot().state.remaining,0);assert.equal(restored.$('completedCount').textContent,'50 / 50');
restored.app.choose(1);assert.equal(restored.app.snapshot().state.remaining,0);assert.ok(restored.app.undo());
const noStorage=boot({storageThrows:true});assert.equal(noStorage.app.snapshot().storageOK,false);assert.ok(noStorage.app.play(first.witness[0]));assert.ok(noStorage.$('saveStatus').textContent.includes('儲存不可用'));
const broken=boot({store:new Map([['arcade-tripeaks-certified-v1','{broken']])});assert.equal(broken.app.snapshot().trace.length,0);assert.ok(broken.$('status').textContent.includes('損壞'));
const invalidHistory={version:1,active:1,records:{1:{seed:first.seed,actions:[0],elapsed:50}},completed:{1:{seed:first.seed,actions:[],elapsed:0}}};
const decoded=S.decode(JSON.stringify(invalidHistory));assert.ok(decoded.recovered);assert.equal(Object.keys(decoded.book.records).length,0);assert.equal(Object.keys(decoded.book.completed).length,0);
assert.equal(boot({search:'?deal=27'}).app.snapshot().deal,27);
assert.equal(boot({search:'?deal=9999'}).app.snapshot().deal,1);
console.log(`PASS actual client + DOM-contract harness: ${D.deals.length} wins / ${actions} actions, 50 selector controls, undo, divergence confirmation/cancel, hints, restart, 43-step non-destructive playback, save/reload, timer pause, corrupt/disabled storage.`);
console.log('Not a visual/browser test: responsive layout, native focus and live-host rendering require browser QA.');
