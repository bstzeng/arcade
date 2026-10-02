#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
process.chdir(__dirname);
const source=fs.readFileSync('app.js','utf8'), registry=vm.runInNewContext(source.slice(0,source.indexOf('let activeCategory'))+';({games,categoryNames,artMarkup,GAME_BUILD})');
assert.equal(registry.games.length,47);assert.equal(new Set(registry.games.map(x=>x.id)).size,47);
for(const [category,count] of Object.entries({cards:5,board:10,logic:10,classic:10}))assert.equal(registry.games.filter(x=>x.category===category).length,count);
const index=fs.readFileSync('index.html','utf8');for(const asset of ['app.js','styles.css'])assert(index.includes(asset+'?v='+registry.GAME_BUILD));
assert(index.includes('47 款遊戲'));assert(index.includes('1,500 關益智'));assert(index.includes('data-filter="classic"'));
for(const g of registry.games){assert.equal(g.status,'ready');assert(registry.artMarkup[g.art]);assert(registry.categoryNames[g.category]);assert(/^\.\/games\/[\w\-/]+\.html$/.test(g.url));assert(fs.existsSync(g.url),g.url);const html=fs.readFileSync(g.url,'utf8');for(const m of html.matchAll(/<(?:script|link)\b[^>]*(?:src|href)=["']([^"']+)["'][^>]*>/gi)){if(/^(?:[a-z]+:|\/\/)/i.test(m[1]))continue;const file=path.resolve(path.dirname(g.url),m[1].split('?')[0]);assert(fs.existsSync(file),'Missing asset '+file);if(file.endsWith('.js'))new vm.Script(fs.readFileSync(file,'utf8'),{filename:file});}}
class Element{constructor(tag='div'){this.tagName=tag;this.children=[];this.attributes={};this.events={};this.style={setProperty(){}};this.value='';this.dataset={};}append(...x){this.children.push(...x);}replaceChildren(...x){this.children=x;}setAttribute(k,v){this.attributes[k]=v;}addEventListener(k,f){this.events[k]=f;}querySelector(){return this.span||(this.span=new Element('span'));}focus(){this.focused=true;}}
const nodes=Object.fromEntries(['#game-grid','#search','#empty','#results','#reset'].map(k=>[k,new Element()]));const filters=['all','puzzle','strategy','casual','cards','board','logic','classic'].map(k=>{const n=new Element('button');n.dataset.filter=k;return n;});
vm.runInNewContext(source,{document:{querySelector:s=>nodes[s],querySelectorAll:()=>filters,createElement:t=>new Element(t)}});assert.equal(nodes['#game-grid'].children.length,47);
for(const f of filters){f.events.click();assert.equal(f.attributes['aria-pressed'],'true');assert.equal(nodes['#game-grid'].children.length,f.dataset.filter==='all'?47:registry.games.filter(g=>g.category===f.dataset.filter).length);}
for(const query of ['SUDOKU','數獨','MINESWEEPER','漢諾塔','猜密碼','STAR BATTLE']){nodes['#search'].value=query;nodes['#search'].events.input();assert.equal(nodes['#game-grid'].children.length,1,query);}
nodes['#search'].value='KLONDIKE';nodes['#search'].events.input();assert.equal(nodes['#game-grid'].children.length,0);assert.equal(nodes['#empty'].hidden,false);nodes['#reset'].events.click();assert.equal(nodes['#game-grid'].children.length,47);assert(nodes['#search'].focused);
for(const card of nodes['#game-grid'].children){const link=card.children[1].children[3].children[1];assert.equal(link.tagName,'a');assert(link.href.endsWith('?v='+registry.GAME_BUILD));}
console.log('PASS: 47 unique lobby entries, all local assets, 8 category filters, bilingual search, empty/reset, and 47 versioned links.');
module.exports=registry;
