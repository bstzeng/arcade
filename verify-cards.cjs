#!/usr/bin/env node
'use strict';
// Reproducible offline verification: no packages, browser, credentials or network.
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const assert = require('node:assert/strict'), {spawnSync} = require('node:child_process');
process.chdir(__dirname);
const currentRegistryCount=require('./verify-lobby.cjs').games.length;
function run(command,args){ console.log(`\n> ${command} ${args.join(' ')}`); const r=spawnSync(command,args,{stdio:'inherit'}); if(r.error)throw r.error;assert.equal(r.status,0,`Failed: ${command} ${args.join(' ')}`); }
run(process.execPath,['--check','app.js']);
const source=fs.readFileSync('app.js','utf8');
const context=vm.createContext({});
const data=vm.runInContext(source.slice(0,source.indexOf("let activeCategory"))+';({games,categoryNames,artMarkup,GAME_BUILD})',context);
assert.equal(data.games.length,currentRegistryCount);
assert.equal(new Set(data.games.map(g=>g.id)).size,currentRegistryCount);
assert.equal(data.games.filter(g=>g.category==='cards').length,5);
assert(data.categoryNames.cards);
const home=fs.readFileSync('index.html','utf8');
assert(home.includes('data-filter="cards"'));
for(const asset of ['app.js','styles.css'])assert(home.includes(`${asset}?v=${data.GAME_BUILD}`),`Stale ${asset} cache key`);
for(const game of data.games){
  assert.equal(game.status,'ready');
  assert(/^\.\/games\/[\w\-/]+(?:\.html)?$/.test(game.url),'Unsafe game URL');
  assert(fs.existsSync(game.url),`Missing entry ${game.url}`);
  assert(data.artMarkup[game.art],`Missing art ${game.art}`);
  const html=fs.readFileSync(game.url,'utf8');
  for(const m of html.matchAll(/<link\b[^>]*href=["']([^"']+)["'][^>]*>/gi)){
    if(/^(?:[a-z]+:|\/\/)/i.test(m[1]))continue;
    const target=path.resolve(path.dirname(game.url),m[1].split('?')[0]);
    assert(fs.existsSync(target),`Missing linked asset ${target}`);
  }
  for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){
    const external=/\bsrc=["']([^"']+)["']/.exec(m[1]);
    if(external){
      assert(!/^(https?:)?\/\//.test(external[1]),'Unexpected external script');
      const target=path.resolve(path.dirname(game.url),external[1].split('?')[0]);
      assert(fs.existsSync(target),`Missing script ${target}`);
      new vm.Script(fs.readFileSync(target,'utf8'),{filename:target});
    }else if(!/type=["']application\//.test(m[1]))new vm.Script(m[2],{filename:game.url});
  }
}
// The current lobby's grouped rendering, discovery categories, cross-category search,
// empty/reset flows and versioned links are exhaustively exercised by verify-lobby
// above. Keep card-specific registry, assets and all 250-deal rule/proof tests here.
console.log('PASS: Current unique ready games, 5 card tables, safe existing links, matching asset cache keys, scripts parse.');
run(process.execPath,['games/klondike/test.cjs']);
run('python3',['games/freecell/verify.py']);
run(process.execPath,['games/freecell/test.js']);
run(process.execPath,['games/freecell/test-ui.js']);
run('python3',['games/spider/verify.py']);
run('python3',['games/pyramid/verify.py']);
run(process.execPath,['games/tripeaks/verify-independent.cjs']);
run(process.execPath,['games/pyramid/test.js']);
run(process.execPath,['games/pyramid/test-ui.js']);
run(process.execPath,['games/spider/test.js']);
run(process.execPath,['games/spider/ui-test.js']);
run(process.execPath,['games/tripeaks/test.cjs']);
run(process.execPath,['games/tripeaks/test-client.cjs']);
console.log('\nPASS: all five sets (250 deals) have complete independently verified winning certificates.');
