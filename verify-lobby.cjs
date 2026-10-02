#!/usr/bin/env node
'use strict';
// Reproducible offline lobby audit. Simulated DOM checks are not browser visual tests.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
process.chdir(__dirname);
require('./verify-static.cjs');
const source=fs.readFileSync('app.js','utf8'),index=fs.readFileSync('index.html','utf8'),css=fs.readFileSync('styles.css','utf8');
const registry=vm.runInNewContext(source.slice(0,source.indexOf('let activeCategory'))+';({games,categoryNames,artMarkup,GAME_BUILD,categories,categoryByGameId})');
const normalize=value=>JSON.parse(JSON.stringify(value));
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const preservation=JSON.parse(fs.readFileSync('lobby-categories-preservation.json','utf8'));
const expansion=JSON.parse(fs.readFileSync('expansion-manifest.json','utf8'));
const expansionPreservation=JSON.parse(fs.readFileSync('expansion-preservation.json','utf8'));
assert.equal(expansion.sourceBaselineCommit,'4867af6a1b114d79b57c19c727f571e2fc84741e');
assert.equal(expansion.newGames,80);assert.equal(expansion.newChallengeCount,8000);assert.equal(expansion.releaseGames,150);
assert.equal(expansion.games.length,80);assert.equal(new Set(expansion.games.map(g=>g.id)).size,80);
assert.equal(expansionPreservation.baseCommit,expansion.sourceBaselineCommit);
assert.equal(preservation.baseCommit,'0c2a154416474e5d6257796b96f00016800a1dc7');
assert.equal(preservation.originalGameCount,70);assert.equal(preservation.originalAssetCount,782);
assert.equal(registry.games.length,150);assert.equal(new Set(registry.games.map(g=>g.id)).size,150);
assert.equal(new Set(registry.games.map(g=>g.title.normalize('NFKC').replace(/\s+/g,''))).size,150,'Every title is distinct');
assert.deepEqual(normalize(registry.games.slice(0,70)),preservation.originalRegistry,'All 70 original records and their relative order must stay unchanged');
assert.deepEqual(normalize(registry.games.slice(0,70)),expansionPreservation.originalRegistry,'Exact immediate release baseline retained');
assert.deepEqual(normalize(registry.games.slice(70).map(g=>g.id)),expansion.games.map(g=>g.id),'Exactly the authorized 80 expansion entries follow the preserved records');
for(const [key,value] of Object.entries(preservation.originalArt))assert.equal(registry.artMarkup[key],value,'Original artwork unchanged: '+key);
for(const [key,value] of Object.entries(expansionPreservation.originalArt))assert.equal(registry.artMarkup[key],value,'Immediate baseline artwork unchanged: '+key);
assert.equal(new Set(registry.games.slice(70).map(g=>registry.artMarkup[g.art])).size,80,'Eighty distinct new game illustrations');
for(const [file,sha]of Object.entries(expansionPreservation.historicalReports))assert.equal(hash(file),sha,'Published report changed: '+file);
assert.equal(Object.keys(preservation.assets).length,782);
for(const [file,sha]of Object.entries(preservation.assets))assert.equal(hash(file),sha,'Game asset changed: '+file);
for(const [file,sha]of Object.entries(preservation.historicalReports))assert.equal(hash(file),sha,'Historical report changed: '+file);
const expectedCounts={tabletop:22,cards:16,numbers:19,deduction:24,spatial:20,paths:18,simulation:17,quick:14};
assert.deepEqual(expansion.categoryReleaseCounts,expectedCounts);
assert.equal(registry.categories.length,8);
assert.deepEqual(normalize(registry.categories.map(c=>c.id).sort()),Object.keys(expectedCounts).sort());
const assigned=registry.categories.flatMap(c=>c.gameIds);
assert.equal(assigned.length,150);assert.equal(new Set(assigned).size,150,'Each game must have exactly one primary browse category');
assert.deepEqual([...assigned].sort(),normalize(registry.games.map(g=>g.id).sort()));
for(const category of registry.categories){
 assert.equal(category.gameIds.length,expectedCounts[category.id],category.id+' count');
 assert(category.title&&category.description&&category.examples&&category.icon&&category.color,'Category discovery tile requires useful labels');
 for(const id of category.gameIds)assert.equal(registry.categoryByGameId[id].id,category.id,id+' lookup');
}
for(const game of expansion.games){assert.equal(registry.categoryByGameId[game.id].id,game.primaryCategory,game.id+' primary category');assert.equal(game.challenges,100,game.id+' challenges');}
for(const [category,count]of Object.entries({puzzle:4,strategy:6,casual:3,cards:5,board:10,logic:10,classic:10,collection:10,tabletop:12}))assert.equal(registry.games.filter(g=>g.category===category).length,count,'Original release category metadata retained');
for(const asset of ['app.js','styles.css'])assert(index.includes(asset+'?v='+registry.GAME_BUILD),'Stale cache key: '+asset);
assert(index.includes('150 款遊戲'));assert(index.includes('8,000 關'));assert(index.includes('2,000 關益智'));assert(index.includes('data-filter="cards"'));
assert.equal(new Set(registry.games.filter(g=>g.category==='tabletop').map(g=>registry.artMarkup[g.art])).size,12);
for(const g of registry.games){
 assert.equal(g.status,'ready');assert(registry.artMarkup[g.art]);assert(registry.categoryNames[g.category]);
 assert(/^\.\/games\/[\w\-/]+\.html$/.test(g.url));assert(fs.existsSync(g.url),g.url);
 const html=fs.readFileSync(g.url,'utf8');
 for(const m of html.matchAll(/<(?:script|link)\b[^>]*(?:src|href)=["']([^"']+)["'][^>]*>/gi)){
  if(/^(?:[a-z]+:|\/\/)/i.test(m[1]))continue;
  const file=path.resolve(path.dirname(g.url),m[1].split('?')[0]);assert(fs.existsSync(file),'Missing asset '+file);
  if(file.endsWith('.js'))new vm.Script(fs.readFileSync(file,'utf8'),{filename:file});
 }
}
const decode=s=>s.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>');
class Element{
 constructor(tag='div',document){this.tagName=tag.toLowerCase();this.ownerDocument=document;this.children=[];this.attributes={};this.events={};this._text='';this.value='';this.hidden=false;this.style={setProperty:(key,value)=>this.style[key]=value};this.dataset=new Proxy({}, {set:(target,key,value)=>{target[key]=String(value);this.attributes['data-'+key.replace(/[A-Z]/g,m=>'-'+m.toLowerCase())]=String(value);return true;}});this.classList={contains:c=>this.className.split(/\s+/).includes(c),add:(...cs)=>this.className=[...new Set([...this.className.split(/\s+/).filter(Boolean),...cs])].join(' '),remove:(...cs)=>this.className=this.className.split(/\s+/).filter(c=>!cs.includes(c)).join(' '),toggle:(c,force)=>{const add=force===undefined?!this.classList.contains(c):force;this.classList[add?'add':'remove'](c);return add;}};}
 get className(){return this.attributes.class||'';}set className(v){this.attributes.class=String(v);}
 get id(){return this.attributes.id||'';}set id(v){this.attributes.id=String(v);}
 get textContent(){return this._text+this.children.map(c=>c.textContent).join('');}set textContent(v){this._text=String(v);this.children=[];}
 set innerHTML(v){this._html=String(v);this.children=[];}get innerHTML(){return this._html||'';}
 append(...nodes){for(const n of nodes){if(typeof n==='string')this._text+=n;else{n.parentElement=this;this.children.push(n);}}}
 replaceChildren(...nodes){this.children=[];this._text='';this.append(...nodes);}
 setAttribute(key,value){this.attributes[key]=String(value);if(key==='hidden')this.hidden=true;if(key==='value')this.value=String(value);if(key.startsWith('data-'))this.dataset[key.slice(5).replace(/-([a-z])/g,(_,l)=>l.toUpperCase())]=value;}
 getAttribute(key){return this.attributes[key]??null;}removeAttribute(key){delete this.attributes[key];if(key==='hidden')this.hidden=false;}
 addEventListener(event,fn){(this.events[event]??=[]).push(fn);}
 emit(event,props={}){const e={target:this,currentTarget:this,preventDefault(){this.defaultPrevented=true;},...props};for(const fn of this.events[event]||[])fn(e);return e;}
 focus(){this.ownerDocument.activeElement=this;this.focused=true;}scrollIntoView(options){this.scrollOptions=options;}
 matches(selector){return selector.split(',').some(part=>{part=part.trim();const attrMatches=[...part.matchAll(/\[([^\]=]+)(?:=["']?([^\]"']*)["']?)?\]/g)];for(const [,k,v]of attrMatches)if(this.getAttribute(k)===null||(v!==undefined&&this.getAttribute(k)!==v))return false;part=part.replace(/\[[^\]]+\]/g,'');const id=part.match(/#([\w-]+)/);if(id&&this.id!==id[1])return false;for(const [,c]of part.matchAll(/\.([\w-]+)/g))if(!this.classList.contains(c))return false;const tag=part.match(/^[\w-]+/);return !tag||this.tagName===tag[0].toLowerCase();});}
 querySelectorAll(selector){return this.children.flatMap(child=>[...(child.matches(selector)?[child]:[]),...child.querySelectorAll(selector)]);}querySelector(selector){return this.querySelectorAll(selector)[0]||null;}
}
function boot(url='https://example.test/arcade/'){
 const document={activeElement:null,events:{},addEventListener(event,fn){(this.events[event]??=[]).push(fn);},createElement:tag=>new Element(tag,document)};
 const root=new Element('document',document);document.querySelector=s=>root.querySelector(s);document.querySelectorAll=s=>root.querySelectorAll(s);document.getElementById=id=>document.querySelector('#'+id);
 const stack=[root],voidTags=new Set(['meta','link','input','br','hr','img','source','wbr']);
 for(const token of index.matchAll(/<!--[\s\S]*?-->|<[^>]+>|[^<]+/g)){
  const text=token[0];if(text.startsWith('<!--')||text.startsWith('<!'))continue;
  if(text.startsWith('</')){const tag=text.match(/^<\/([\w-]+)/)?.[1];if(stack.at(-1).tagName===tag)stack.pop();continue;}
  if(text.startsWith('<')){const tag=text.match(/^<([\w-]+)/)?.[1];if(!tag)continue;const n=new Element(tag,document);for(const m of text.slice(tag.length+1,-1).matchAll(/([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g))n.setAttribute(m[1],decode(m[2]??m[3]??m[4]??''));stack.at(-1).append(n);if(!voidTags.has(tag)&&!text.endsWith('/>'))stack.push(n);}else stack.at(-1)._text+=decode(text);
 }
 document.body=document.querySelector('body');document.documentElement=document.querySelector('html');
 const location={href:url,search:new URL(url).search,pathname:new URL(url).pathname,hash:new URL(url).hash};
 const setURL=value=>{const next=new URL(value,location.href);Object.assign(location,{href:next.href,search:next.search,pathname:next.pathname,hash:next.hash});};
 const history={calls:[],pushState(state,title,next){this.calls.push({type:'push',next});setURL(next);},replaceState(state,title,next){this.calls.push({type:'replace',next});setURL(next);}};
 const window={document,location,history,events:{},addEventListener(event,fn){(this.events[event]??=[]).push(fn);},scrollTo(){},matchMedia:()=>({matches:false})};
 const context={document,window,location,history,URL,URLSearchParams,console,setTimeout:fn=>{fn();return 1;},clearTimeout(){},requestAnimationFrame:fn=>fn()};
 vm.runInNewContext(source,context);
 return{document,root,window,location,history,pop(next){setURL(next);for(const fn of window.events.popstate||[])fn({});},node:s=>document.querySelector(s),cards:()=>document.querySelector('#game-grid').querySelectorAll('.card'),groups:()=>document.querySelector('#game-grid').querySelectorAll('.game-group')};
}
const app=boot(),{node}=app;
const ids=()=>app.cards().map(card=>card.dataset.gameId);
const expectedAll=registry.categories.flatMap(category=>registry.games.filter(game=>category.gameIds.includes(game.id)).map(game=>game.id));
function expectCards(expected,reason){assert.deepEqual(ids().sort(),normalize(expected).sort(),reason);}
function expectAll(){expectCards(registry.games.map(g=>g.id),'All 150 games must be discoverable');assert.equal(app.groups().length,8);assert.equal(node('#category-overview').hidden,false);assert.equal(node('#category-select').value,'all');}
function search(query){node('#search').value=query;node('#search').emit('input');}
function normalizeQuery(value){return value.normalize('NFKC').toLocaleLowerCase('zh-Hant').replace(/\s+/g,' ').trim();}
function searchMatches(query){const words=normalizeQuery(query).split(' ').filter(Boolean);return registry.games.filter(game=>{const category=registry.categoryByGameId[game.id];const haystack=normalizeQuery(`${game.id} ${game.title} ${game.description} ${game.note} ${game.word} ${category.title} ${registry.categoryNames[game.category]}`);return words.every(word=>haystack.includes(word));}).map(g=>g.id);}
expectAll();assert.deepEqual(ids(),normalize(expectedAll),'Default groups follow stable category then original game order');
assert.equal(node('#category-select').children.length,9);
for(const option of node('#category-select').children){const category=registry.categories.find(c=>c.id===option.value);assert.equal(option.tagName,'option');assert.equal(option.textContent,`${category?category.title:'全部遊戲'}（${category?expectedCounts[category.id]:150}）`);}
const tiles=app.document.querySelectorAll('[data-filter]').filter(button=>button.dataset.filter!=='all');assert.equal(tiles.length,8,'Eight prominent category buttons, not only tiny legacy filters');
for(const category of registry.categories){
 const tile=tiles.find(t=>t.dataset.filter===category.id);assert(tile);assert.equal(tile.tagName,'button');assert.equal(tile.getAttribute('type'),'button');
 assert.equal(tile.querySelector('[data-category-count]').textContent,String(expectedCounts[category.id]));
 assert(tile.textContent.includes(category.title));assert(tile.textContent.includes(category.examples));
 tile.emit('click');expectCards(category.gameIds,'Tile selects '+category.id);assert.equal(app.groups().length,1);assert.equal(app.groups()[0].dataset.category,category.id);
 assert.equal(tile.getAttribute('aria-pressed'),'true');assert.equal(node('#category-overview').hidden,true);assert.equal(node('#category-select').value,category.id);assert.equal(node('#search').value,'');assert.equal(app.document.activeElement,node('#browse-title'));
 assert.equal(new URL(app.location.href).searchParams.get('category'),category.id);
 node('#back-to-categories').emit('click');expectAll();assert.equal(app.document.activeElement,node('#category-title'));
 node('#category-select').value=category.id;node('#category-select').emit('change');expectCards(category.gameIds,'Native mobile selector '+category.id);
 node('#category-select').value='all';node('#category-select').emit('change');expectAll();
}
let searchCases=0;
for(const game of registry.games){
 for(const query of [game.id,game.title,game.word]){search(query);expectCards(searchMatches(query),'Search '+query);assert(ids().includes(game.id),'Own title/ID/English name must find '+game.id);assert.equal(node('#category-select').value,'all');searchCases++;}
}
for(const query of ['  kLoNdIkE  ','ＡＩＲ　ＴＲＡＦＦＩＣ　ＣＯＮＴＲＯＬ','  數獨  ','空中指揮所','象棋','BANQI','華容道','數字推理','牌桌接龍','遊戲不存在-no-such-game','<img src=x onerror=alert(1)>']){search(query);expectCards(searchMatches(query),'Normalized/global search '+query);searchCases++;}
for(const query of ['AIR TRAFFIC CONTROL','空中指揮所','XIANGQI','BANQI','華容道','SUDOKU','KLONDIKE']){search(query);assert.equal(app.cards().length,1,'Specific game search must not match every example in its category: '+query);}
// Searching from an unrelated category must find the game anywhere in the collection.
tiles.find(t=>t.dataset.filter==='tabletop').emit('click');search('鐵道');expectCards(['railway-town'],'Cross-category search has no hidden filter trap');assert.equal(node('#category-select').value,'all');assert.equal(new URL(app.location.href).searchParams.has('category'),false);
search('game-does-not-exist');assert.equal(app.cards().length,0);assert.equal(app.groups().length,0);assert.equal(node('#empty').hidden,false);assert.equal(node('#clear-search').hidden,false);
node('#reset').emit('click');expectAll();assert.equal(node('#search').value,'');assert.equal(node('#empty').hidden,true);assert.equal(app.document.activeElement,node('#category-title'));
search('AIR TRAFFIC CONTROL');node('#clear-search').emit('click');expectAll();assert.equal(node('#search').value,'');assert.equal(app.document.activeElement,node('#search'));
search('數獨');const escaped=node('#search').emit('keydown',{key:'Escape'});assert(escaped.defaultPrevented);expectAll();assert.equal(app.document.activeElement,node('#search'));
search('KLONDIKE');const entered=node('#search').emit('keydown',{key:'Enter'});assert(entered.defaultPrevented);assert.equal(app.document.activeElement,node('#browse-title'));assert.equal(app.cards().length,1);
// Newer interactions and repeated actions supersede older state.
for(let i=0;i<4;i++){tiles[i].emit('click');search('KLONDIKE');search('AIR TRAFFIC CONTROL');node('#clear-search').emit('click');expectAll();}
search('   ');expectAll();tiles.find(t=>t.dataset.filter==='cards').emit('click');assert.equal(node('#search').value,'');expectCards(registry.categories.find(c=>c.id==='cards').gameIds);
node('#category-select').value='invalid-category';node('#category-select').emit('change');expectAll();
node('#back-to-categories').emit('click');expectAll();
// All 150 cards retain stable identity, accessible game titles, artwork and versioned links.
for(const card of app.cards()){
 const game=registry.games.find(g=>g.id===card.dataset.gameId);assert(game);
 assert.equal(card.tagName,'article');assert.equal(card.querySelector('h4').textContent,game.title);
 assert.equal(card.querySelector('.category').textContent,registry.categoryByGameId[game.id].title);
 assert.equal(card.querySelector('.card-number').textContent,`GAME / ${String(registry.games.indexOf(game)+1).padStart(2,'0')}`);
 const link=card.querySelector('.play-link');assert.equal(link.tagName,'a');assert.equal(link.href,game.url+'?v='+encodeURIComponent(registry.GAME_BUILD));assert.equal(link.getAttribute('aria-label'),'開始遊戲：'+game.title);
 assert.equal(card.querySelector('.game-art').innerHTML,registry.artMarkup[game.art]);
}
for(const group of app.groups()){assert.equal(group.tagName,'section');assert.equal(group.getAttribute('aria-labelledby'),group.querySelector('h3').id);assert.equal(group.querySelector('.group-count').textContent,group.querySelectorAll('.card').length+' 款');}
// Refreshable category/search URLs, invalid inputs, and browser Back/Forward state restoration.
for(const category of registry.categories){const linked=boot('https://example.test/arcade/?category='+category.id);assert.deepEqual(linked.cards().map(c=>c.dataset.gameId).sort(),normalize(category.gameIds).sort());assert.equal(linked.node('#category-select').value,category.id);}
const linked=boot('https://example.test/arcade/?category=cards&q=AIR+TRAFFIC+CONTROL&source=test#games');assert.deepEqual(linked.cards().map(c=>c.dataset.gameId),['air-traffic']);assert.equal(linked.node('#category-select').value,'all');
linked.node('#clear-search').emit('click');assert.equal(new URL(linked.location.href).searchParams.get('source'),'test');assert.equal(new URL(linked.location.href).hash,'#games');assert.equal(linked.cards().length,150);
linked.pop('https://example.test/arcade/?category=spatial');assert.equal(linked.cards().length,20);assert.equal(linked.node('#category-select').value,'spatial');
linked.pop('https://example.test/arcade/?q=KLONDIKE');assert.deepEqual(linked.cards().map(c=>c.dataset.gameId),['klondike']);assert.equal(linked.node('#search').value,'KLONDIKE');
linked.pop('https://example.test/arcade/');assert.equal(linked.cards().length,150);assert.equal(linked.node('#search').value,'');assert.equal(linked.node('#category-overview').hidden,false);
assert.equal(boot('https://example.test/arcade/?category=not-a-category').cards().length,150);
assert.equal(boot('https://example.test/arcade/?q=%3Cscript%3Ebad%3C%2Fscript%3E').cards().length,0);
// Explicit accessible name remains present when the visible label is hidden by mobile CSS.
assert.equal(app.node('#category-select').getAttribute('aria-label'),'瀏覽分類');
assert.equal(app.node('#search').getAttribute('type'),'search');assert(app.node('#search').getAttribute('aria-label')||app.document.querySelector('label[for="search"]'));
assert.equal(app.node('#browse-title').getAttribute('tabindex'),'-1');assert.equal(app.node('#category-title').getAttribute('tabindex'),'-1');assert.equal(app.node('#results').getAttribute('aria-live'),'polite');
assert(css.includes(':focus-visible'),'Visible keyboard focus styles required');assert(/prefers-reduced-motion/.test(css),'Respect reduced motion');assert(/@media/.test(css),'Responsive breakpoint rules required');assert(css.includes('.category-overview')||css.includes('.category-grid'),'Responsive prominent category grid required');
const report={passed:true,build:registry.GAME_BUILD,baseCommit:expansion.sourceBaselineCommit,registryCount:150,newGames:80,newChallenges:8000,primaryCategoryCounts:expectedCounts,eachGameAssignedExactlyOnce:true,originalRegistryAndArtworkUnchanged:true,preservedGameAssets:782,preservedHistoricalReports:Object.keys(preservation.historicalReports).length,searchCases,checks:['Eight prominent labeled category tiles and native selector','All 150 games in semantic groups with stable IDs and versioned links','Every title, English name and game ID searchable','NFKC/case/whitespace normalization and all-game search from other categories','Empty/reset, clear-search, Escape, Enter and repeated-interaction flows','Category/query deep links, refresh, Back/Forward and unrelated URL preservation','Semantic buttons/select, explicit responsive-safe selector name, focus return, polite status and responsive/reduced-motion source checks'],claims:{offlineRulesAndSimulatedDOM:true,browserVisualTestingClaimed:false,mobileBrowserTestingClaimed:false},sourceFiles:Object.fromEntries(['app.js','index.html','styles.css','verify-lobby.cjs','lobby-categories-preservation.json','expansion-manifest.json','expansion-preservation.json'].map(file=>[file,hash(file)]))};
fs.writeFileSync('expansion-lobby-verification-report.json',JSON.stringify(report,null,2)+'\n');
console.log('PASS: 150 games including all 70 unchanged records, 80 distinct new illustrations, 782 preserved game assets, 8 primary categories, '+searchCases+' search cases, grouped/keyboard/reset/history contracts and versioned links. Browser visual testing is separate.');
module.exports=registry;
