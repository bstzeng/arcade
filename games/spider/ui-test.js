'use strict';
// DOM-event regression harness. This is NOT a rendered-browser/visual test.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const E=require('./engine.js'),D=require('./deals.js');
class El{
 constructor(tag='div'){this.tagName=tag;this.children=[];this.dataset={};this.style={};this.attrs={};this.events={};this.className='';this.textContent='';this.clientHeight=380;this.open=false;this.value='';this.disabled=false;this.hidden=false;this.scrollLeft=0;this.classList={add:(n)=>{if(!this.className.split(' ').includes(n))this.className+=' '+n;},remove:(n)=>{this.className=this.className.split(' ').filter(x=>x!==n).join(' ');},toggle:(n,b)=>{if(b)this.classList.add(n);else this.classList.remove(n);}};}
 append(x){this.children.push(x);}replaceChildren(...xs){this.children=xs;}setAttribute(k,v){this.attrs[k]=v;}addEventListener(k,f){(this.events[k]??=[]).push(f);}fire(k,e={}){for(const f of this.events[k]||[])f({target:this,preventDefault(){},...e});}click(){if(!this.disabled)this.fire('click');}showModal(){this.open=true;}close(){this.open=false;}scrollIntoView(){}
}
const storage={};
function boot(){
 const ids={};for(const m of fs.readFileSync(__dirname+'/../spider.html','utf8').matchAll(/id="([^"]+)"/g))ids[m[1]]=new El();
 const closers=['rulesDialog','proofDialog'].map(id=>{const b=new El('button');b.dataset.close=id;return b;});
 let now=1000,seq=1;const timeout=new Map(),interval=new Map();
 const doc={hidden:false,getElementById:id=>ids[id],createElement:tag=>new El(tag),querySelectorAll:s=>s==='[data-close]'?closers:[],querySelector:s=>s==='dialog[open]'?Object.values(ids).find(x=>x.open):null,events:{},addEventListener(k,f){(this.events[k]??=[]).push(f);}};
 const context={SpiderEngine:E,SPIDER_DEALS:D,document:doc,window:{addEventListener(){}},localStorage:{getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v},innerWidth:1366,console,Date:{now:()=>now},setTimeout:f=>{const id=seq++;timeout.set(id,f);return id;},clearTimeout:id=>timeout.delete(id),setInterval:f=>{const id=seq++;interval.set(id,f);return id;},clearInterval:id=>interval.delete(id)};
 vm.createContext(context);vm.runInContext(fs.readFileSync(__dirname+'/ui.js','utf8'),context,{filename:'ui.js'});
 return {ids,closers,ctx:context,snap:()=>context.window.spiderQA.snapshot(),runTimeout(){const [id,f]=timeout.entries().next().value||[];if(!f)return false;timeout.delete(id);now+=500;f();return true;},tick(){now+=1000;for(const f of interval.values())f();}};
}
let ui=boot();assert.equal(ui.snap().state.columns.length,10);assert.equal(ui.ids.board.children.length,10);assert.equal(ui.ids.dealSelect.children.length,50);assert.equal(ui.ids.undo.disabled,true);
ui.ids.hint.click();assert.match(ui.ids.message.textContent,/認證/);
let a=D.deals[0].solution[0];assert.equal(a.type,'move');
function clickMove(u,a){const source=u.ids.board.children[a.from].children.find(x=>Number(x.dataset.index)===a.index);assert(source);source.click();u.ids.board.children[a.to].children[1].click();}
clickMove(ui,a);assert.equal(ui.snap().actions.length,1);assert.equal(E.key(ui.snap().state),E.key(E.step(E.start(D.deals[0]),a,D.deals[0].ranks)));
ui.tick();assert(ui.snap().elapsed>0);ui.ids.undo.click();assert.equal(ui.snap().actions.length,0);assert.equal(ui.ids.undo.disabled,true);
clickMove(ui,a);const saved=E.key(ui.snap().state);ui=boot();assert.equal(E.key(ui.snap().state),saved);assert.equal(ui.snap().actions.length,1);ui.ids.undo.click();assert.equal(ui.snap().actions.length,0);
// Produce a legal alternative, then check playback won't use a stale witness.
const alt=E.legal(ui.snap().state,D.deals[0].ranks).find(x=>JSON.stringify(x)!==JSON.stringify(a));assert(alt);clickMove(ui,alt);const before=E.key(ui.snap().state);ui.ids.play.click();assert(ui.ids.confirmDialog.open);ui.ids.confirmCancel.click();assert.equal(E.key(ui.snap().state),before);assert(!ui.snap().playing);
ui.ids.play.click();ui.ids.confirmYes.click();assert(ui.snap().playing);assert.equal(ui.snap().actions.length,0);
let steps=0;while(ui.runTimeout()){if(++steps>200)throw Error('Autoplay did not stop');}assert(E.won(ui.snap().state));assert.equal(ui.snap().actions.length,D.deals[0].solution.length);assert(!ui.snap().playing);assert(!ui.ids.wonBox.hidden);
ui.ids.undo.click();assert(!E.won(ui.snap().state));assert.equal(ui.snap().actions.length,D.deals[0].solution.length-1);
ui.ids.play.click();assert(ui.snap().playing);ui.ids.play.click();assert(!ui.snap().playing);assert(!ui.runTimeout(),'Pause must cancel queued timer');
ui.ids.rules.click();assert(ui.ids.rulesDialog.open);ui.closers[0].click();assert(!ui.ids.rulesDialog.open);ui.ids.proof.click();assert(ui.ids.proofDialog.open);ui.closers[1].click();
ui.ids.dealSelect.value='49';ui.ids.dealSelect.fire('change');assert.equal(ui.snap().current,49);assert.equal(ui.snap().actions.length,0);ui.ids.dealStock.click();assert.equal(ui.snap().state.stock.length,40);ui.ids.undo.click();assert.equal(ui.snap().state.stock.length,50);
ui.ids.restart.click();assert.equal(ui.snap().actions.length,0);ui.ids.dealStock.click();ui.ids.restart.click();assert(ui.ids.confirmDialog.open);ui.ids.confirmYes.click();assert.equal(ui.snap().actions.length,0);assert.equal(ui.snap().state.stock.length,50);
console.log('PASS: DOM-event harness: 50-selector, click move, hints, persisted reload+undo, divergence confirmation/cancel, full UI autoplay, completion undo, pause cancellation, rules/proof dialogs, stock undo and restart. Rendered visual/browser QA remains separate.');
