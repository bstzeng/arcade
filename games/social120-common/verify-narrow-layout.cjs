'use strict';
// Source and minimal-DOM regression contracts only; not browser layout measurement.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict'),crypto=require('crypto');
const base=__dirname,css=fs.readFileSync(path.join(base,'style.css'),'utf8');
function verifyContainment(source){
  assert(source.includes('.layout>div,.layout>aside{min-width:0}'),'Direct grid children must be allowed to shrink below table min-content width');
  assert(source.includes('@media(max-width:800px){.layout{grid-template-columns:minmax(0,1fr)}'),'Narrow grid track must have a zero minimum');
  assert(source.includes('.comparison{min-width:0;max-width:100%;overflow-x:auto}'),'Table overflow must stay inside its own constrained scroll region');
  assert(source.includes('.comparison table{border-collapse:collapse;font-size:12px;min-width:320px;width:100%}'),'Preserve readable table width instead of hiding or shrinking its evidence');
  assert(source.includes('.comparison:focus-visible{outline:'),'Internal scroll region must retain visible keyboard focus');
}
verifyContainment(css);
assert.throws(()=>verifyContainment(css.replace('.layout>div,.layout>aside{min-width:0}','')));
assert.throws(()=>verifyContainment(css.replace('grid-template-columns:minmax(0,1fr)','grid-template-columns:1fr')));
assert.throws(()=>verifyContainment(css.replace('.comparison{min-width:0;max-width:100%;overflow-x:auto}','.comparison{overflow-x:visible}')));
let nodes={},buttons=[],storage=new Map();
function element(id){return{id,value:'',disabled:false,dataset:{},textContent:'',addEventListener(){},onclick:null};}
const app=element('app');
Object.defineProperty(app,'innerHTML',{get(){return this.html;},set(html){this.html=html;nodes={app:this};buttons=[];for(const match of html.matchAll(/<[^>]+\bid="([^"]+)"[^>]*>/g))nodes[match[1]]=element(match[1]);for(const match of html.matchAll(/<button[^>]+data-action="(\d+)"[^>]*>/g)){let e=element('action');e.dataset.action=match[1];buttons.push(e);}}});
app.querySelectorAll=()=>buttons;nodes.app=app;
const context=vm.createContext({document:{body:{dataset:{game:'alibi-interrogation'}},hidden:false,getElementById:id=>nodes[id]||null,addEventListener(){}},localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)},setTimeout:()=>1,clearTimeout(){},addEventListener(){},Date,Math});
for(const relative of ['core.js','../alibi-interrogation/engine.js','../alibi-interrogation/levels.js','ui.js'])vm.runInContext(fs.readFileSync(path.join(base,relative),'utf8'),context,{filename:relative});
context.Social120UI.start('challenge',100);
assert.equal(Number(nodes.level.value),100);
assert(app.innerHTML.includes('<div class="layout"><div>'),'The board must use the constrained direct grid wrapper');
assert(app.innerHTML.includes('<div class="comparison" tabindex="0" role="region" aria-label="證詞比較表，可左右捲動"><table>'),'Level 100 needs a focusable, labeled internal table scroll region');
assert.equal(context.Social120UI.getState().game,'alibi-interrogation');
const hashes={};for(const file of ['style.css','ui.js','verify-narrow-layout.cjs'])hashes['games/social120-common/'+file]=crypto.createHash('sha256').update(fs.readFileSync(path.join(base,file))).digest('hex');
console.log(JSON.stringify({passed:true,scope:'Source and minimal-DOM contracts; no real-browser geometry claimed',reproducedScenario:'alibi-interrogation level 100',sourceContracts:5,negativeMutationFixtures:3,accessibleInternalScroll:true,preserves320pxTable:true,realBrowserLayoutVerified:false,hashes},null,2));
