/* Headless DOM-state smoke tests; not a visual/browser test. No dependencies. */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const F=require('./engine.js'),deals=require('./deals.json');
class Element{
 constructor(tag='div'){this.tagName=tag.toUpperCase();this.children=[];this.dataset={};this.attributes={};this.className='';this.style={setProperty:(k,v)=>this.style[k]=v};this.clientHeight=380;this.hidden=false;this.value='';this.textContent='';this.disabled=false;this.classList={toggle:(cls,on)=>{let a=this.className.split(/\s+/).filter(Boolean),has=a.includes(cls);if(on===undefined)on=!has;if(on&&!has)a.push(cls);if(!on)a=a.filter(c=>c!==cls);this.className=a.join(' ');return on},add:cls=>this.classList.toggle(cls,true),contains:cls=>this.className.split(/\s+/).includes(cls)}}
 append(...children){this.children.push(...children)} replaceChildren(...children){this.children=children} setAttribute(k,v){this.attributes[k]=String(v)} addEventListener(){} click(){if(this.onclick)this.onclick({target:this,stopPropagation(){},preventDefault(){}})} showModal(){this.open=true}close(){this.open=false}getBoundingClientRect(){return{x:0,y:0,left:0,right:500,top:0,bottom:500}}querySelectorAll(sel){const out=[];function walk(e){for(const c of e.children){if(sel==='.card'&&c.classList.contains('card'))out.push(c);walk(c)}}walk(this);return out}
}
const html=fs.readFileSync(__dirname+'/../freecell.html','utf8'),ids={};for(const m of html.matchAll(/id="([^"]+)"/g))ids[m[1]]=new Element(m[1]==='deal'?'select':'div');
const storage=new Map(),intervals=new Map();let iid=0;
const document={getElementById:id=>ids[id],createElement:tag=>new Element(tag),addEventListener(){},hidden:false,querySelector:s=>s==='dialog[open]'?[ids.helpDialog,ids.proofDialog].find(d=>d.open)||null:null,querySelectorAll:s=>s==='dialog'?[ids.helpDialog,ids.proofDialog]:s==='.card'?[...ids.topPiles.querySelectorAll(s),...ids.tableau.querySelectorAll(s)]:[]};
const window={FreeCell:F,FREECELL_DEALS:deals,addEventListener(){}};
const context={window,document,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},console,Date,Math,Map,Set,JSON,Number,String,Array,Error,Blob,URL,confirm:()=>true,setTimeout:f=>{f();return 1},setInterval:f=>{intervals.set(++iid,f);return iid},clearInterval:i=>intervals.delete(i),requestAnimationFrame:f=>f(),getComputedStyle:()=>({getPropertyValue:()=>120})};
vm.runInNewContext(html.match(/<script>([\s\S]*?)<\/script>/)[1],context);
const game=window.FreeCellGame;
assert.equal(game.getDeal(),1);assert.equal(ids.deal.children.length,50);assert.equal(F.validState(game.getState()),true);
// Select a real card: element identity must survive for native double-click detection.
const first=deals[0].proof[0],source=ids.tableau.children[first[1]].children.at(-1);source.click();assert.equal(ids.tableau.children[first[1]].children.at(-1),source);ids.tableau.children[first[3]].click();assert.equal(game.getMoves().length,1);assert.equal(game.getProofIndex(),1);
// Double-click an exposed ace after the first move (second proof operation).
const ace=ids.tableau.children[7].children.at(-1);ace.click();assert.equal(ids.tableau.children[7].children.at(-1),ace);ace.click();ace.ondblclick({stopPropagation(){},preventDefault(){}});assert.equal(game.getMoves().length,2);assert.equal(game.getState().foundations[1],1);
ids.save.click();ids.undo.click();assert.equal(game.getMoves().length,1);ids.load.click();assert.equal(game.getMoves().length,2);
let payload=JSON.parse(storage.get('arcade-freecell-slot-v1'));assert.equal(game.validateSave(payload).history.length,3);
for(const patch of [{deal:51},{moves:[[0,0,1,0,2]]},{elapsed:-1},{assisted:'yes'},{version:2}])assert.throws(()=>game.validateSave({...payload,...patch}));
const before=F.key(game.getState());storage.set('arcade-freecell-slot-v1',JSON.stringify({...payload,moves:[[0,0,1,0,2]]}));ids.load.click();assert.equal(F.key(game.getState()),before);assert.match(ids.status.textContent,/未通過驗證/);
// Explicitly deviate: hints must not label an arbitrary move as a proven continuation.
ids.restart.click();let s=game.getState();let off=F.moves(s).find(m=>{const ns=F.apply(s,m);let p=F.initial(deals[0].columns);for(const x of deals[0].proof){if(F.key(p)===F.key(ns))return false;p=F.apply(p,x)}return F.key(p)!==F.key(ns)});const sourceCard=ids.tableau.children[off[1]].children[stateIndex(s,off)];sourceCard.click();(off[2]===0?ids.tableau.children[off[3]]:ids.topPiles.children[off[2]===1?off[3]:off[3]+4]).click();assert.equal(game.getProofIndex(),undefined);ids.hint.click();assert.match(ids.status.textContent,/不保證/);ids.solution.click();assert.equal(ids.playCurrent.disabled,true);ids.proofDialog.close();
function stateIndex(s,m){return s.columns[m[1]].length-m[4]}
// Every published proof can run through the UI's actual step action to a win, then undo.
for(let id=1;id<=50;id++){ids.deal.value=id;ids.deal.onchange({target:ids.deal});assert.equal(game.getDeal(),id);for(const m of deals[id-1].proof)ids.proofStep.click();assert(F.won(game.getState()));assert.equal(ids.win.hidden,false);assert.equal(ids.winTitle.textContent,'解法示範完成');ids.undo.click();assert.equal(F.won(game.getState()),false);assert.equal(ids.win.hidden,true)}
// Playback cancellation, browser-storage failure, and explicit user cancel paths.
ids.restart.click();ids.solution.click();ids.playCurrent.click();assert.equal(game.getMoves().length,1);assert.equal(ids.pause.hidden,false);assert.equal(intervals.size,2);ids.pause.click();assert.equal(intervals.size,1);assert.equal(ids.pause.hidden,true);
ids.solution.click();ids.playCurrent.click();assert.equal(game.getMoves().length,2);ids.restart.click();assert.equal(game.getMoves().length,0);assert.equal(intervals.size,1);
ids.proofStep.click();context.confirm=()=>false;ids.restart.click();assert.equal(game.getMoves().length,1);const current=game.getDeal();ids.deal.value=current===1?2:1;ids.deal.onchange({target:ids.deal});assert.equal(game.getDeal(),current);ids.solution.click();ids.playStart.click();assert.equal(game.getMoves().length,1);assert.equal(intervals.size,1);context.confirm=()=>true;ids.proofDialog.close();
const write=context.localStorage.setItem;context.localStorage.setItem=()=>{throw Error('storage denied')};ids.save.click();assert.match(ids.status.textContent,/無法儲存/);ids.proofStep.click();assert.equal(game.getMoves().length,2);ids.undo.click();assert.equal(game.getMoves().length,1);context.localStorage.setItem=write;ids.save.click();
// A fresh script instance uses only the persisted history to restore the same state.
const savedState=F.key(game.getState()),savedMoves=game.getMoves().length;storage.set('arcade-freecell-auto-v1',storage.get('arcade-freecell-slot-v1'));const reloadedWindow={FreeCell:F,FREECELL_DEALS:deals,addEventListener(){}};vm.runInNewContext(html.match(/<script>([\s\S]*?)<\/script>/)[1],{...context,window:reloadedWindow});assert.equal(F.key(reloadedWindow.FreeCellGame.getState()),savedState);assert.equal(reloadedWindow.FreeCellGame.getMoves().length,savedMoves);
console.log('PASS: UI state smoke tests: 50 selectors/proof wins, selection DOM preserved, double-click path, save/load/reload, corrupt-save rejection, safe off-route hints, undo after win, demo pause/restart/cancel, storage unavailable. Visual rendering not tested.');
