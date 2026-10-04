#!/usr/bin/env node
'use strict';
// Pure verification: no source/report rewrites. VM results are not actual browser evidence.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm'),assert=require('node:assert/strict');
const ROOT=__dirname,read=f=>fs.readFileSync(path.join(ROOT,f),'utf8'),json=f=>JSON.parse(read(f)),sha=b=>crypto.createHash('sha256').update(b).digest('hex'),git=b=>crypto.createHash('sha1').update(Buffer.from('blob '+b.length+'\0')).update(b).digest('hex'),norm=x=>JSON.parse(JSON.stringify(x));
const baseline=json('classic-duo-baseline.json'),release=json('classic-duo-release.json'),source=read('app.js'),index=read('index.html'),css=read('styles.css');
function registry(s){const c={};vm.createContext(c);vm.runInContext(s.slice(0,s.indexOf('let activeCategory'))+';globalThis.r={games,categories,categoryNames,artMarkup,GAME_BUILD,categoryByGameId};',c);return norm(c.r);}
function registryGate(reg){
 assert.equal(reg.games.length,395);assert.equal(reg.categories.length,25);assert.equal(new Set(reg.games.map(g=>g.id)).size,395);
 assert.deepEqual(reg.games.slice(0,390),baseline.registry);assert.deepEqual(reg.categories.slice(0,24),baseline.categories);
 for(const[k,v]of Object.entries(baseline.categoryNames))assert.equal(reg.categoryNames[k],v);
 assert.equal(reg.categoryNames.classic30,'經典');assert.deepEqual(reg.games.slice(390).map(g=>g.id),["mosskin-migration","orbit-marble-chain","starport-pinball","puffball-shift","prismatic-cascade"]);
 assert.deepEqual(reg.categories.at(-1).gameIds,["mosskin-migration","orbit-marble-chain","starport-pinball","puffball-shift","prismatic-cascade"]);assert.equal(reg.categories.at(-1).id,'classic30');
 for(const[k,h]of Object.entries(baseline.artHashes))assert.equal(sha(reg.artMarkup[k]),h,'Old art changed '+k);
 const members=reg.categories.flatMap(c=>c.gameIds);assert.equal(members.length,395);assert.equal(new Set(members).size,395);assert.deepEqual([...members].sort(),reg.games.map(g=>g.id).sort());
 for(const g of reg.games){assert.equal(g.status,'ready');assert(/^\.\/games\/[\w-]+\.html$/.test(g.url) || (['puffball-shift','prismatic-cascade'].includes(g.id) && g.url===`./previews/puzzle-premium-v1/games/${g.id}.html`));assert(reg.artMarkup[g.art]);assert(reg.categoryByGameId[g.id]);}
 assert.deepEqual(reg.games.slice(390),release.registryRecords);
 assert.deepEqual(reg.categories.at(-1),release.category);
 for(const entry of release.catalogCorrection.linkedEntries){const g=reg.games.find(x=>x.id===entry.id);assert.equal(g.url,entry.url);assert.equal(g.badge,entry.badge);assert(reg.artMarkup[g.art].includes(`src="${entry.artPath}"`));}
}
const reg=registry(source);registryGate(reg);
assert.equal(reg.GAME_BUILD,release.build);
for(const a of ['app.js','styles.css'])assert(index.includes(a+'?v='+release.build));
assert(index.includes('395 款遊戲 · 25 個分類'));assert(index.includes('搜尋全部 395 款遊戲'));assert(!index.includes('390 款')&&!index.includes('420 款'));
function writtenCountGate(html){
 const about=html.match(/<section\b[^>]*\bid="about"[^>]*>([\s\S]*?)<\/section>/)?.[1]||'';
 const noScript=html.match(/<noscript>([\s\S]*?)<\/noscript>/)?.[1]||'';
 assert(about.includes('三百九十五個小世界，二十五種探索方向。'),'Stale written-out About counts');
 assert(about.includes("經典區收錄星港發射台、苔精大遷徙、星環彩珠、毛球滑滑樂與晶彩連鎖。毛球與晶彩使用保留獨立試玩存檔的新版測試版；各作內容與測試狀態以卡片標示為準。"),'About classic-five version identity is stale');
 assert(about.includes('先前加入的 120 款')&&about.includes('更早的 270 款亦完整保留'),'Historical batch totals must remain historical');
 assert(noScript.includes('遊玩三百九十五款遊戲。'),'Stale noscript total');
}
writtenCountGate(index);
assert.equal((index.match(/data-filter="classic30"/g)||[]).length,1);assert.equal((index.match(/class="category-tile"/g)||[]).length,25);
assert(css.startsWith(release.originalStylesText),'Existing CSS bytes changed');assert.equal(css.slice(release.originalStylesText.length),release.appendedStylesText);
function readmeGate(text){assert(text.includes('395 款、25 類'));assert(!text.includes('420 款'));assert(text.includes('「經典」包含星港發射台、苔精大遷徙、星環彩珠、毛球滑滑樂與晶彩連鎖五款'));assert(!text.includes('新增「經典」包含本次兩作'));}
readmeGate(read('README.md'));
const onlyCatalog=process.argv.includes('--catalog-only');
let preserved=0;
const expectedHrefPaths=['previews/puzzle-premium-v1/games/puffball-shift.html','previews/puzzle-premium-v1/games/prismatic-cascade.html'];
const hrefChanges=release.catalogCorrection.entryHrefChanges;
assert.deepEqual(hrefChanges.map(x=>x.path),expectedHrefPaths);
for(const row of hrefChanges){
 assert.equal(row.from,'href="../../../index.html"');assert.equal(row.to,'href="../../../index.html?category=classic30"');assert.equal(row.occurrences,1);assert.equal(row.reversible,true);
 const after=read(row.path);assert.equal(after.split(row.to).length-1,1);assert.equal(sha(after),row.afterSHA256);
 const before=after.replace(row.to,row.from);assert.equal(sha(before),row.beforeSHA256);assert.equal(git(Buffer.from(before)),baseline.gitBlobs[row.path]);assert.equal(row.beforeGitBlobSHA1,baseline.gitBlobs[row.path]);
 const back=new URL('../../../index.html?category=classic30','https://example.test/arcade/'+row.path);assert.equal(back.pathname,'/arcade/index.html');assert.equal(back.search,'?category=classic30');
}
for(const[file,before]of Object.entries(baseline.gitBlobs)){
 const p=path.join(ROOT,file);assert(fs.existsSync(p),'Missing baseline path '+file);
 const b=fs.readFileSync(p);if(baseline.allowedRootChanges.includes(file)){assert.equal(sha(b),release.rootFiles[file],'Unbound root '+file);}else if(expectedHrefPaths.includes(file)){assert.equal(sha(b),hrefChanges.find(x=>x.path===file).afterSHA256,'Unbound entry href '+file);}else assert.equal(git(b),before,'Existing file changed '+file);preserved++;
}
for(const[file,h]of Object.entries(release.supportFiles))assert.equal(sha(fs.readFileSync(path.join(ROOT,file))),h,'Support file changed '+file);
let runtimeFiles=0,dependencyReferences=0;
function referencedAsset(from,ref,allowed){
 if(/^(?:#|data:|blob:)/.test(ref))return;
 assert(!/^(?:https?:|\/\/)/.test(ref),'Remote dependency '+ref);
 const target=path.posix.normalize(path.posix.join(path.posix.dirname(from),ref.split(/[?#]/)[0]));
 assert(!target.startsWith('../')&&!path.posix.isAbsolute(target),'Dependency escapes repository');
 assert(allowed.has(target),'Undeclared local dependency '+from+' -> '+ref);assert(fs.existsSync(path.join(ROOT,target)),'Missing local dependency '+target);dependencyReferences++;
}
function walkFiles(dir,pre=''){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{if(e.name==='.git')return[];const rel=pre+e.name;return e.isDirectory()?walkFiles(path.join(dir,e.name),rel+'/'):[rel];});}

if(!onlyCatalog){
 assert.equal(release.sourceGatesAccepted,true,'Final game source gates are not accepted');
 const allowed=new Set([...Object.keys(baseline.gitBlobs),...Object.keys(release.supportFiles),'classic-duo-release.json',...release.games.flatMap(g=>Object.keys(g.runtimeFiles))]);
 assert.deepEqual(walkFiles(ROOT).sort(),[...allowed].sort(),'Unexpected or missing published file; use a clean release tree');

 for(const entry of release.catalogCorrection.linkedEntries){
  const htmlPath=entry.url.replace(/^\.\//,'');assert(allowed.has(htmlPath));
  for(const[,ref]of read(htmlPath).matchAll(/(?:src|href)="([^"]+)"/g))referencedAsset(htmlPath,ref,allowed);
  const artPath=entry.artPath.replace(/^\.\//,'');assert(allowed.has(artPath));const svg=read(artPath);assert(!/<(?:script|foreignObject)\b|\bon\w+\s*=|(?:href|src)\s*=\s*["'](?:https?:|\/\/)/i.test(svg),'Unsafe linked cover SVG');
 }
 assert.equal(require('./games/starport-pinball/v2/levels.js').levels.length,20);
 for(const slug of ['puffball-shift','prismatic-cascade']){const ctx={module:{exports:{}}};ctx.globalThis=ctx;vm.runInNewContext(read(`previews/puzzle-premium-v1/games/${slug}/levels.js`),ctx);const levels=ctx.GameLevels;assert.equal(levels.length,50);assert(read(`previews/puzzle-premium-v1/games/${slug}/storage.js`).includes('arcade.preview.puzzle-premium-v1.classic30.'));}
 for(const game of release.games){
  assert.deepEqual(game.levelIDs,Array.from({length:50},(_,i)=>String(i+1).padStart(2,'0')));
  for(const[file,h]of Object.entries(game.runtimeFiles)){assert.equal(sha(fs.readFileSync(path.join(ROOT,file))),h,'Unbound new runtime '+file);runtimeFiles++;}
  for(const file of Object.keys(game.runtimeFiles)){
   const text=read(file);
   if(file.endsWith('.css'))for(const[,raw]of text.matchAll(/url\(\s*([^)]*?)\s*\)/g)){const ref=raw.trim().replace(/^["']|["']$/g,'');referencedAsset(file,ref,allowed);}
   if(file.endsWith('.js')){
    for(const[,q,ref]of text.matchAll(/require\(\s*(["'])([^"']+)\1\s*\)/g)){if(ref.startsWith('.'))referencedAsset(file,ref,allowed);}
    assert(!/\bfetch\s*\(/.test(text),'Network fetch dependencies require explicit review');
   }
  }
  const html=read('games/'+game.slug+'.html');assert(html.includes('../index.html?category=classic30'),'Wrong category return');
  for(const[,ref]of html.matchAll(/(?:src|href)="([^"]+)"/g)){
   assert(!/^(?:https?:|\/\/)/.test(ref),'Remote entry dependency');if(/^(?:#|data:|blob:)/.test(ref))continue;referencedAsset('games/'+game.slug+'.html',ref,allowed);
  }
  const ctx={module:{exports:{}}};ctx.globalThis=ctx;vm.runInNewContext(read('games/'+game.slug+'/levels.js'),ctx);const levels=Array.isArray(ctx.module.exports)?ctx.module.exports:ctx[game.levelExport];assert(Array.isArray(levels));assert.equal(levels.length,50);assert.deepEqual(norm(levels.map(l=>l.id)),game.levelIDs);
  const svg=read('games/'+game.slug+'/art.svg');assert(!/<(?:script|foreignObject)\b|\bon\w+\s*=|(?:href|src)\s*=\s*["'](?:https?:|\/\/)/i.test(svg),'Unsafe cover SVG');
 }
}
const {boot}=require('./verification/classic-duo/lobby-harness.cjs')({source:source+'\nwindow.testGameCard=(game)=>gameCard(game,0);',index}),app=boot(),node=app.node;
const ids=()=>app.cards().map(c=>c.dataset.gameId),tiles=app.document.querySelectorAll('[data-filter]');
const expectedAll=reg.categories.flatMap(c=>reg.games.filter(g=>c.gameIds.includes(g.id)).map(g=>g.id));
function all(){assert.deepEqual(ids(),expectedAll);assert.equal(app.groups().length,25);assert.equal(node('#category-overview').hidden,false);assert.equal(node('#category-select').value,'all');}
function cards(expected){assert.deepEqual(ids().slice().sort(),expected.slice().sort());}
function search(q){node('#search').value=q;node('#search').emit('input');}
const normal=s=>s.normalize('NFKC').toLocaleLowerCase('zh-Hant').replace(/\s+/g,' ').trim();
function matches(q){const words=normal(q).split(' ').filter(Boolean);return reg.games.filter(g=>{const c=reg.categoryByGameId[g.id],hay=normal(`${g.id} ${g.title} ${g.description} ${g.note} ${g.word} ${c.title} ${reg.categoryNames[g.category]}`);return words.every(w=>hay.includes(w));}).map(g=>g.id);}
all();assert.equal(node('#category-select').children.length,26);assert.equal(tiles.length,25);
for(const c of reg.categories){const tile=tiles.find(t=>t.dataset.filter===c.id);assert(tile);assert.equal(tile.querySelector('[data-category-count]').textContent,String(c.gameIds.length));tile.emit('click');cards(c.gameIds);assert.equal(new URL(app.location.href).searchParams.get('category'),c.id);assert.equal(app.document.activeElement,node('#browse-title'));node('#back-to-categories').emit('click');all();node('#category-select').value=c.id;node('#category-select').emit('change');cards(c.gameIds);node('#category-select').value='all';node('#category-select').emit('change');all();}
let searches=0;
for(const g of reg.games)for(const q of [g.id,g.title,g.word]){search(q);cards(matches(q));assert(ids().includes(g.id));searches++;}
for(const q of ['  苔精大遷徙  ','星環彩珠','MOSSKIN MIGRATION','ORBIT MARBLE','經典','<img src=x onerror=alert(1)>','不存在-no-such-game']){search(q);cards(matches(q));searches++;}
tiles.find(t=>t.dataset.filter==='tabletop').emit('click');search('星環彩珠');cards(['orbit-marble-chain']);assert.equal(node('#category-select').value,'all');
search('nothing-available');assert.equal(app.cards().length,0);node('#reset').emit('click');all();search('苔精');node('#search').emit('keydown',{key:'Escape'});all();search('星環');node('#search').emit('keydown',{key:'Enter'});assert.equal(app.document.activeElement,node('#browse-title'));node('#clear-search').emit('click');all();
for(const card of app.cards()){const g=reg.games.find(x=>x.id===card.dataset.gameId);assert.equal(card.querySelector('h4').textContent,g.title);assert.equal(card.querySelector('.play-link').href,g.url+'?v='+release.build);assert.equal(card.querySelector('.game-art').innerHTML,reg.artMarkup[g.art]);assert.equal(card.querySelector('.card-number').textContent,`GAME / ${String(reg.games.indexOf(g)+1).padStart(2,'0')}`);}
const linked=boot('https://example.test/arcade/?category=classic30');assert.deepEqual(linked.cards().map(c=>c.dataset.gameId),["mosskin-migration","orbit-marble-chain","starport-pinball","puffball-shift","prismatic-cascade"]);linked.pop('https://example.test/arcade/?category=cards');assert.equal(linked.cards().length,16);linked.pop('https://example.test/arcade/?q=%E6%98%9F%E7%92%B0%E5%BD%A9%E7%8F%A0');assert.deepEqual(linked.cards().map(c=>c.dataset.gameId),['orbit-marble-chain']);linked.pop('https://example.test/arcade/');assert.equal(linked.cards().length,395);
assert.equal(boot('https://example.test/arcade/?category=invalid').cards().length,395);assert.equal(node('#category-select').getAttribute('aria-label'),'瀏覽分類');assert.equal(node('#results').getAttribute('aria-live'),'polite');
let previewPathChecks=0;
for(const slug of ['puffball-shift','prismatic-cascade']){
 const game=reg.games.find(g=>g.id===slug);assert(app.window.testGameCard(game).querySelector('.play-link'));previewPathChecks++;
 for(const url of ['https://example.test/x','javascript:alert(1)','//example.test/x','./previews/other/games/'+slug+'.html','./previews/puzzle-premium-v1/games/../'+slug+'.html',game.url+'?x=1',game.url+'#x',game.url.replace(slug,slug==='puffball-shift'?'prismatic-cascade':'puffball-shift')]){assert.equal(app.window.testGameCard({...game,url}).querySelector('.play-link'),null);previewPathChecks++;}
 assert.equal(app.window.testGameCard({...game,id:'number-lab'}).querySelector('.play-link'),null);previewPathChecks++;
}
const negative=[];
assert.throws(()=>readmeGate(read('README.md').replace('「經典」包含星港發射台、苔精大遷徙、星環彩珠、毛球滑滑樂與晶彩連鎖五款','新增「經典」包含本次兩作')));negative.push('stale README two-game category');
assert.throws(()=>writtenCountGate(index.replace('三百九十五個小世界，二十五種探索方向。','三百九十個小世界，二十四種探索方向。')),'Old About wording must fail');negative.push('stale written-out About counts');
assert.throws(()=>writtenCountGate(index.replace('遊玩三百九十五款遊戲。','遊玩三百九十款遊戲。')),'Old noscript count must fail');negative.push('stale noscript count');
for(const[name,mutate]of [['legacy metadata',x=>{x.games[0].title+='!';}],['unfinished third title',x=>{x.games.push({...x.games[390],id:'other-unfinished'});}],['old category membership',x=>{x.categories[0].gameIds.pop();}],['old artwork',x=>{x.artMarkup[Object.keys(baseline.artHashes)[0]]+=' ';}],['duplicate new identity',x=>{x.games[391].id=x.games[390].id;}],['missing classic target',x=>{x.categories.at(-1).gameIds.pop();}],['old puzzle target URL',x=>{x.games.find(g=>g.id==='puffball-shift').url='./games/puffball-shift.html';}],['missing preview label',x=>{x.games.find(g=>g.id==='prismatic-cascade').badge='50 關 · 原創';}]]){const copy=norm(reg);mutate(copy);assert.throws(()=>registryGate(copy),name);negative.push(name);}
console.log(JSON.stringify({passed:true,scope:onlyCatalog?'395/25 catalog, legacy-byte preservation with two declared href corrections and actual lobby VM; game runtime gate skipped by explicit option':'395/25 catalog, legacy-byte preservation, declared runtime hashes, static entry/CSS/CommonJS dependencies, exact file allowlist,50-stage data and actual lobby VM',games:395,categories:25,existingFilesChecked:preserved,modifiedExistingRoots:baseline.allowedRootChanges,searchCases:searches,previewPathChecks,classicCards:5,entryHrefCorrections:2,negativeControls:negative,newRuntimeFilesChecked:runtimeFiles,localDependencyReferences:dependencyReferences,claims:{realBrowser:false,allLegacyEnginesRerun:false,commercialQualityCertified:false}},null,2));
