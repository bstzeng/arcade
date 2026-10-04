#!/usr/bin/env node
'use strict';
// Pure verification: no source/report rewrites. VM results are not actual browser evidence.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm'),assert=require('node:assert/strict');
const ROOT=__dirname,read=f=>fs.readFileSync(path.join(ROOT,f),'utf8'),json=f=>JSON.parse(read(f)),sha=b=>crypto.createHash('sha256').update(b).digest('hex'),git=b=>crypto.createHash('sha1').update(Buffer.from('blob '+b.length+'\0')).update(b).digest('hex'),norm=x=>JSON.parse(JSON.stringify(x));
const baseline=json('classic-duo-baseline.json'),release=json('classic-duo-release.json'),source=read('app.js'),index=read('index.html'),css=read('styles.css');
const hearts=release.heartsUpgrade;
function registry(s){const c={};vm.createContext(c);vm.runInContext(s.slice(0,s.indexOf('let activeCategory'))+';globalThis.r={games,categories,categoryNames,artMarkup,GAME_BUILD,categoryByGameId};',c);return norm(c.r);}
function registryGate(reg){
 assert.equal(reg.games.length,397);assert.equal(reg.categories.length,25);assert.equal(new Set(reg.games.map(g=>g.id)).size,397);
 const expectedLegacy=baseline.registry.map(g=>g.id==='hearts'?hearts.registryRecord:g);assert.deepEqual(reg.games.slice(0,390),expectedLegacy);
 assert.deepEqual(hearts.previousRegistryRecord,baseline.registry.find(g=>g.id==='hearts'));assert.equal(hearts.recordIndex,84);assert.equal(reg.games[84].id,'hearts');assert.equal(reg.games.filter(g=>g.id==='hearts').length,1);
 assert.deepEqual(hearts.allowedRecordChanges,['title','description','note','badge']);for(const k of Object.keys(hearts.previousRegistryRecord))if(!hearts.allowedRecordChanges.includes(k))assert.deepEqual(reg.games[84][k],hearts.previousRegistryRecord[k]);
 assert.equal(reg.games[84].title,'傷心小棧（紅心大戰）');assert.equal(reg.games[84].badge,'隨機對局 · 3 級 AI');assert.equal(reg.games[84].url,'./games/hearts.html');assert.equal(reg.categoryByGameId.hearts.id,'cards');assert.equal(reg.categories.find(c=>c.id==='cards').gameIds.indexOf('hearts'),10);assert(!reg.categories.find(c=>c.id==='classic30').gameIds.includes('hearts')); assert.deepEqual(reg.categories.slice(0,24),baseline.categories);
 for(const[k,v]of Object.entries(baseline.categoryNames))assert.equal(reg.categoryNames[k],v);
 assert.equal(reg.categoryNames.classic30,'經典');assert.deepEqual(reg.games.slice(390).map(g=>g.id),["mosskin-migration","orbit-marble-chain","starport-pinball","puffball-shift","prismatic-cascade","stormfront-command","skyrail-park"]);
 assert.deepEqual(reg.categories.at(-1).gameIds,["mosskin-migration","orbit-marble-chain","starport-pinball","puffball-shift","prismatic-cascade","stormfront-command","skyrail-park"]);assert.equal(reg.categories.at(-1).id,'classic30');
 for(const[k,h]of Object.entries(baseline.artHashes))assert.equal(sha(reg.artMarkup[k]),h,'Old art changed '+k);
 const members=reg.categories.flatMap(c=>c.gameIds);assert.equal(members.length,397);assert.equal(new Set(members).size,397);assert.deepEqual([...members].sort(),reg.games.map(g=>g.id).sort());
 for(const g of reg.games){assert.equal(g.status,'ready');assert(/^\.\/games\/[\w-]+\.html$/.test(g.url) || (['puffball-shift','prismatic-cascade'].includes(g.id) && g.url===`./previews/puzzle-premium-v1/games/${g.id}.html`));assert(reg.artMarkup[g.art]);assert(reg.categoryByGameId[g.id]);}
 assert.deepEqual(reg.games.slice(390),release.registryRecords);
 assert.deepEqual(reg.categories.at(-1),release.category);
 assert.deepEqual(release.campaignIntegration.appendedIDs,['stormfront-command','skyrail-park']);
 for(const id of release.campaignIntegration.appendedIDs){const g=reg.games.find(x=>x.id===id);assert.equal(g.url,`./games/${id}.html`);assert.equal(g.badge,'10 關 · 開發版');assert(g.note.includes('10 關')&&g.note.includes('開發版'));assert(!/20\s*分鐘|20\s*min|商業認證/.test(g.description+g.note+g.badge));}
 for(const entry of release.catalogCorrection.linkedEntries){const g=reg.games.find(x=>x.id===entry.id);assert.equal(g.url,entry.url);assert.equal(g.badge,entry.badge);assert(reg.artMarkup[g.art].includes(`src="${entry.artPath}"`));}
}
const reg=registry(source);registryGate(reg);
assert.equal(reg.GAME_BUILD,release.build);
for(const a of ['app.js','styles.css'])assert(index.includes(a+'?v='+release.build));
assert(index.includes('397 款遊戲 · 25 個分類'));assert(index.includes('搜尋全部 397 款遊戲'));assert(!index.includes('390 款')&&!index.includes('420 款'));
function writtenCountGate(html){
 const about=html.match(/<section\b[^>]*\bid="about"[^>]*>([\s\S]*?)<\/section>/)?.[1]||'';
 const noScript=html.match(/<noscript>([\s\S]*?)<\/noscript>/)?.[1]||'';
 assert(about.includes('三百九十七個小世界，二十五種探索方向。'),'Stale written-out About counts');
 assert(about.includes("經典區收錄七款遊戲，新增磁暴前線與雲霄歡樂園，兩款各有 10 關並標示為開發版。每關一般操作的 20 分鐘體驗仍待驗證。毛球與晶彩維持保留獨立試玩存檔的新版測試版；各作內容與測試狀態以卡片標示為準。"),'About classic-five version identity is stale');
 assert(about.includes('先前加入的 120 款')&&about.includes('更早的 270 款亦完整保留'),'Historical batch totals must remain historical');
 assert(noScript.includes('遊玩三百九十七款遊戲。'),'Stale noscript total');
}
writtenCountGate(index);
assert.equal((index.match(/data-filter="classic30"/g)||[]).length,1);assert.equal((index.match(/class="category-tile"/g)||[]).length,25);
assert(css.startsWith(release.originalStylesText),'Existing CSS bytes changed');assert.equal(css.slice(release.originalStylesText.length),release.appendedStylesText);
function readmeGate(text){assert(text.includes('397 款、25 類'));assert(!text.includes('420 款'));assert(text.includes('「經典」包含星港發射台、苔精大遷徙、星環彩珠、毛球滑滑樂、晶彩連鎖、磁暴前線與雲霄歡樂園七款'));assert(!text.includes('新增「經典」包含本次兩作'));}
readmeGate(read('README.md'));
const onlyCatalog=process.argv.includes('--catalog-only');
assert.deepEqual(Object.keys(hearts.existingModifiedFiles).sort(),['games/cards80-common/browser-tests.cjs','games/cards80-common/dom-harness.cjs','games/hearts.html','games/hearts/README.md']);
assert.deepEqual(hearts.newStorageKeys,['arcade.hearts.full-match.v3','arcade.hearts.preferences.v3','arcade.hearts.results.v3']);assert.deepEqual(hearts.legacyStorageKeys,['arcade:cards80:v1:hearts','arcade:cards80:v1:hearts:progress']);assert.equal(hearts.activeTableLock,'arcade.hearts.active-table.v3');
let legacyOriginal=read(hearts.legacyEntry);for(const row of hearts.legacyEntrySubstitutions.slice().reverse()){assert.equal(legacyOriginal.split(row.to).length-1,1);legacyOriginal=legacyOriginal.replace(row.to,row.from);}assert.equal(sha(legacyOriginal),hearts.legacyOriginalEntrySHA256);assert.equal(git(Buffer.from(legacyOriginal)),baseline.gitBlobs['games/hearts.html']);
for(const row of hearts.sharedTestRouteSubstitutions){let modified=read(row.path);assert.equal(modified.split(row.to).length-1,1);assert.equal(git(Buffer.from(modified.replace(row.to,row.from))),baseline.gitBlobs[row.path]);}
assert(read(hearts.legacyEntry).includes('Q♠ 也會破心'));assert(read('README.md').includes('傷心小棧（紅心大戰）入口升級'));

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
 const b=fs.readFileSync(p);if(baseline.allowedRootChanges.includes(file)){assert.equal(sha(b),release.rootFiles[file],'Unbound root '+file);}else if(Object.hasOwn(hearts.existingModifiedFiles,file)){assert.equal(sha(b),hearts.existingModifiedFiles[file],'Unbound Hearts-only replacement '+file);}else if(expectedHrefPaths.includes(file)){assert.equal(sha(b),hrefChanges.find(x=>x.path===file).afterSHA256,'Unbound entry href '+file);}else assert.equal(git(b),before,'Existing file changed '+file);preserved++;
}
for(const[file,h]of Object.entries(release.supportFiles))assert.equal(sha(fs.readFileSync(path.join(ROOT,file))),h,'Support file changed '+file);
let runtimeFiles=0,dependencyReferences=0;const heartsTestRuns=[];
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
 assert.equal(release.campaignIntegration.sourceGatesAccepted,true,'Final ten-campaign source gates are not accepted');
 const allowed=new Set([...Object.keys(baseline.gitBlobs),...Object.keys(release.supportFiles),'classic-duo-release.json',...release.games.flatMap(g=>Object.keys(g.runtimeFiles)),...release.campaignGames.flatMap(g=>Object.keys(g.publishFiles)),...Object.keys(hearts.publishFiles)]);
 assert.deepEqual(walkFiles(ROOT).sort(),[...allowed].sort(),'Unexpected or missing published file; use a clean release tree');
 assert.equal(hearts.sourceGatesAccepted,true);assert.deepEqual(hearts.sourceTransforms,[]);
 for(const[file,h]of Object.entries(hearts.publishFiles))assert.equal(sha(fs.readFileSync(path.join(ROOT,file))),h,'Unbound Hearts source '+file);
 for(const[file,h]of Object.entries(hearts.runtimeFiles)){
  assert.equal(sha(fs.readFileSync(path.join(ROOT,file))),h);runtimeFiles++;const text=read(file);
  if(file.endsWith('.html'))for(const[,ref]of text.matchAll(/(?:src|href)="([^"]+)"/g))referencedAsset(file,ref,allowed);
  if(file.endsWith('.css'))for(const[,raw]of text.matchAll(/url\(\s*([^)]*?)\s*\)/g))referencedAsset(file,raw.trim().replace(/^["']|["']$/g,''),allowed);
  if(file.endsWith('.js')){for(const[,q,ref]of text.matchAll(/require\(\s*(["'])([^"']+)\1\s*\)/g))if(ref.startsWith('.'))referencedAsset(file,ref,allowed);assert(!/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(text));}
 }
 assert.equal(sha(JSON.stringify(Object.fromEntries(Object.entries(hearts.publishFiles).sort(([a],[b])=>a<b?-1:a>b?1:0)))),hearts.sourceFingerprint);
 const newApp=read('games/hearts/match-app.js');for(const key of hearts.newStorageKeys)assert(newApp.includes(key));assert(newApp.includes(hearts.activeTableLock));for(const key of hearts.legacyStorageKeys)assert(!newApp.includes(key));
 assert(read('games/hearts.html').includes('hearts-practice.html'));assert.equal(JSON.parse(read('games/hearts/levels.json')).length,100);
 // Behavior tests run in a disposable source copy so reports never mutate the published tree.
 const cp=require('node:child_process'),os=require('node:os'),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'hearts-upgrade-verify-'));
 try{
  for(const file of Object.keys(hearts.publishFiles)){const dest=path.join(tmp,file);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(path.join(ROOT,file),dest);}
  for(const name of ['match-tests.cjs','match-controller-tests.cjs','independent-inference-repro.cjs','controller-review.cjs','moon-ui-review.cjs','concurrent-write-repro.cjs']){
   const out=cp.execFileSync(process.execPath,[path.join(tmp,'games/hearts',name)],{cwd:tmp,encoding:'utf8',timeout:120000,maxBuffer:4*1024*1024,env:{...process.env,HEARTS_REVIEW_ROOT:path.join(tmp,'games')}});heartsTestRuns.push({file:'games/hearts/'+name,passed:true,outputSHA256:sha(out)});
  }
 }finally{fs.rmSync(tmp,{recursive:true,force:true});}


 for(const entry of release.catalogCorrection.linkedEntries){
  const htmlPath=entry.url.replace(/^\.\//,'');assert(allowed.has(htmlPath));
  for(const[,ref]of read(htmlPath).matchAll(/(?:src|href)="([^"]+)"/g))referencedAsset(htmlPath,ref,allowed);
  const artPath=entry.artPath.replace(/^\.\//,'');assert(allowed.has(artPath));const svg=read(artPath);assert(!/<(?:script|foreignObject)\b|\bon\w+\s*=|(?:href|src)\s*=\s*["'](?:https?:|\/\/)/i.test(svg),'Unsafe linked cover SVG');
 }
 assert.equal(require('./games/starport-pinball/v2/levels.js').levels.length,20);
 for(const slug of ['puffball-shift','prismatic-cascade']){const ctx={module:{exports:{}}};ctx.globalThis=ctx;vm.runInNewContext(read(`previews/puzzle-premium-v1/games/${slug}/levels.js`),ctx);const levels=ctx.GameLevels;assert.equal(levels.length,50);assert(read(`previews/puzzle-premium-v1/games/${slug}/storage.js`).includes('arcade.preview.puzzle-premium-v1.classic30.'));}
 assert.deepEqual(release.campaignGames.map(g=>g.slug),['stormfront-command','skyrail-park']);
 for(const game of release.campaignGames){
  assert.deepEqual(game.sourceTransformations,[]);assert.deepEqual(game.levelIDs,Array.from({length:10},(_,i)=>String(i+1).padStart(2,'0')));
  for(const[file,h]of Object.entries(game.publishFiles)){
   assert.equal(sha(fs.readFileSync(path.join(ROOT,file))),h,'Unbound campaign file '+file);runtimeFiles++;
   const text=read(file);
   if(file.endsWith('.css'))for(const[,raw]of text.matchAll(/url\(\s*([^)]*?)\s*\)/g))referencedAsset(file,raw.trim().replace(/^["']|["']$/g,''),allowed);
   if(file.endsWith('.js')){for(const[,q,ref]of text.matchAll(/require\(\s*(["'])([^"']+)\1\s*\)/g))if(ref.startsWith('.'))referencedAsset(file,ref,allowed);assert(!/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(text),'Unreviewed campaign network dependency');}
  }
  const entry=`games/${game.slug}.html`,html=read(entry);assert(html.includes('../index.html?category=classic30'),'Wrong campaign lobby return');for(const[,ref]of html.matchAll(/(?:src|href)="([^"]+)"/g))referencedAsset(entry,ref,allowed);
  const ctx={module:{exports:{}}};ctx.globalThis=ctx;vm.runInNewContext(read(`games/${game.slug}/levels.js`),ctx);const levels=Array.isArray(ctx.module.exports)?ctx.module.exports:ctx[game.levelExport];assert(Array.isArray(levels));assert.deepEqual(norm(levels.map(l=>l.id)),game.levelIDs);
  const storage=require(`./games/${game.slug}/storage.js`);
  if(game.slug==='skyrail-park')assert.deepEqual(Object.values(storage.KEYS).sort(),['run','backup','pending','profile'].map(k=>game.storageNamespace+'.'+k).sort());else assert.equal(storage.PREFIX,game.storageNamespace);
  const svg=read(`games/${game.slug}/art.svg`);assert(!/<(?:script|foreignObject)\b|\bon\w+\s*=|(?:href|src)\s*=\s*["'](?:https?:|\/\/)/i.test(svg),'Unsafe campaign cover SVG');
 }
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
for(const q of ['  苔精大遷徙  ','星環彩珠','MOSSKIN MIGRATION','ORBIT MARBLE','經典','<img src=x onerror=alert(1)>','不存在-no-such-game','傷心小棧','紅心大戰','HEARTS','隨機洗牌']){search(q);cards(matches(q));searches++;}
tiles.find(t=>t.dataset.filter==='tabletop').emit('click');search('星環彩珠');cards(['orbit-marble-chain']);assert.equal(node('#category-select').value,'all');
search('nothing-available');assert.equal(app.cards().length,0);node('#reset').emit('click');all();search('苔精');node('#search').emit('keydown',{key:'Escape'});all();search('星環');node('#search').emit('keydown',{key:'Enter'});assert.equal(app.document.activeElement,node('#browse-title'));node('#clear-search').emit('click');all();
for(const card of app.cards()){const g=reg.games.find(x=>x.id===card.dataset.gameId);assert.equal(card.querySelector('h4').textContent,g.title);assert.equal(card.querySelector('.play-link').href,g.url+'?v='+release.build);assert.equal(card.querySelector('.game-art').innerHTML,reg.artMarkup[g.art]);assert.equal(card.querySelector('.card-number').textContent,`GAME / ${String(reg.games.indexOf(g)+1).padStart(2,'0')}`);}
const linked=boot('https://example.test/arcade/?category=classic30');assert.deepEqual(linked.cards().map(c=>c.dataset.gameId),["mosskin-migration","orbit-marble-chain","starport-pinball","puffball-shift","prismatic-cascade","stormfront-command","skyrail-park"]);linked.pop('https://example.test/arcade/?category=cards');assert.equal(linked.cards().length,16);linked.pop('https://example.test/arcade/?q=%E6%98%9F%E7%92%B0%E5%BD%A9%E7%8F%A0');assert.deepEqual(linked.cards().map(c=>c.dataset.gameId),['orbit-marble-chain']);linked.pop('https://example.test/arcade/');assert.equal(linked.cards().length,397);
assert.equal(boot('https://example.test/arcade/?category=invalid').cards().length,397);assert.equal(node('#category-select').getAttribute('aria-label'),'瀏覽分類');assert.equal(node('#results').getAttribute('aria-live'),'polite');
let previewPathChecks=0;
for(const slug of ['puffball-shift','prismatic-cascade']){
 const game=reg.games.find(g=>g.id===slug);assert(app.window.testGameCard(game).querySelector('.play-link'));previewPathChecks++;
 for(const url of ['https://example.test/x','javascript:alert(1)','//example.test/x','./previews/other/games/'+slug+'.html','./previews/puzzle-premium-v1/games/../'+slug+'.html',game.url+'?x=1',game.url+'#x',game.url.replace(slug,slug==='puffball-shift'?'prismatic-cascade':'puffball-shift')]){assert.equal(app.window.testGameCard({...game,url}).querySelector('.play-link'),null);previewPathChecks++;}
 assert.equal(app.window.testGameCard({...game,id:'number-lab'}).querySelector('.play-link'),null);previewPathChecks++;
}
const negative=[];
for(const[name,change]of [['Hearts catalog duplicate',x=>x.games.push({...x.games[84]})],['Hearts moved category',x=>{x.categories.find(c=>c.id==='cards').gameIds=x.categories.find(c=>c.id==='cards').gameIds.filter(id=>id!=='hearts');x.categories.at(-1).gameIds.push('hearts');}],['Hearts changed URL',x=>x.games[84].url='./games/hearts-practice.html'],['Hearts changed identity',x=>x.games[84].id='hearts2'],['Hearts old badge',x=>x.games[84].badge='100 關 · 牌桌挑戰']]){const copy=norm(reg);change(copy);assert.throws(()=>registryGate(copy),name);negative.push(name);}

assert.throws(()=>readmeGate(read('README.md').replace('「經典」包含星港發射台、苔精大遷徙、星環彩珠、毛球滑滑樂、晶彩連鎖、磁暴前線與雲霄歡樂園七款','新增「經典」包含本次兩作')));negative.push('stale README two-game category');
assert.throws(()=>writtenCountGate(index.replace('三百九十七個小世界，二十五種探索方向。','三百九十個小世界，二十四種探索方向。')),'Old About wording must fail');negative.push('stale written-out About counts');
assert.throws(()=>writtenCountGate(index.replace('遊玩三百九十七款遊戲。','遊玩三百九十款遊戲。')),'Old noscript count must fail');negative.push('stale noscript count');
for(const[name,mutate]of [['legacy metadata',x=>{x.games[0].title+='!';}],['unlisted additional title',x=>{x.games.push({...x.games[390],id:'other-unfinished'});}],['old category membership',x=>{x.categories[0].gameIds.pop();}],['old artwork',x=>{x.artMarkup[Object.keys(baseline.artHashes)[0]]+=' ';}],['duplicate new identity',x=>{x.games[391].id=x.games[390].id;}],['missing classic target',x=>{x.categories.at(-1).gameIds.pop();}],['old puzzle target URL',x=>{x.games.find(g=>g.id==='puffball-shift').url='./games/puffball-shift.html';}],['missing preview label',x=>{x.games.find(g=>g.id==='prismatic-cascade').badge='50 關 · 原創';}],['missing campaign development label',x=>{x.games.find(g=>g.id==='skyrail-park').badge='10 關 · 原創';}],['wrong campaign URL',x=>{x.games.find(g=>g.id==='stormfront-command').url='./games/pinball.html';}]]){const copy=norm(reg);mutate(copy);assert.throws(()=>registryGate(copy),name);negative.push(name);}
console.log(JSON.stringify({passed:true,scope:onlyCatalog?'397/25 catalog, legacy-byte preservation with two declared href corrections and actual lobby VM; game runtime gate skipped by explicit option':'397/25 catalog, legacy-byte preservation, declared runtime hashes, static entry/CSS/CommonJS dependencies, exact file allowlist,50-stage and10-mission data and actual lobby VM',games:397,categories:25,existingFilesChecked:preserved,modifiedExistingRoots:baseline.allowedRootChanges,searchCases:searches,previewPathChecks,classicCards:7,priorEntryHrefCorrections:2,negativeControls:negative,heartsRecordIndex:84,heartsTestRuns,newRuntimeFilesChecked:runtimeFiles,localDependencyReferences:dependencyReferences,claims:{realBrowser:false,allLegacyEnginesRerun:false,commercialQualityCertified:false}},null,2));
