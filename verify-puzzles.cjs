#!/usr/bin/env node
'use strict';
// One-command audit of all 500 published board-puzzle levels. No dependencies.
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const assert = require('node:assert/strict'), crypto = require('node:crypto');
const {spawnSync} = require('node:child_process');
process.chdir(__dirname);
const suites = [
 ['traffic-jam', ['python3','verify.py'], ['node','test.cjs'], ['node','test-ui.cjs']],
 ['sliding-blocks', ['python3','verify.py'], ['node','test.js'], ['node','ui-test.js']],
 ['sokoban', ['python3','verify.py'], ['node','test.cjs'], ['node','test-ui.cjs']],
 ['peg-solitaire', ['python3','verify-independent.py'], ['node','test.cjs'], ['node','test-ui.cjs']],
 ['lights-out', ['python3','verify-independent.py'], ['node','test.cjs'], ['node','test-ui.cjs']],
 ['ice-slide', ['node','verify-independent.cjs'], ['node','test.cjs'], ['node','test-controller.cjs']],
 ['bridges', ['node','verify.cjs'], ['node','ui-test.cjs','bridges']],
 ['tents', ['node','verify.cjs'], ['node','ui-test.cjs','tents']],
 ['slitherlink', ['python3','verify.py'], ['node','test.cjs'], ['node','test-ui.cjs']],
 ['polyomino', ['python3','verify.py'], ['node','test.cjs'], ['node','test-ui.cjs']]
];
const source = fs.readFileSync('app.js','utf8');
const registry = vm.runInNewContext(source.slice(0,source.indexOf('let activeCategory'))+';({games,categoryNames,artMarkup,GAME_BUILD})');
assert.equal(registry.games.length,57);
assert.equal(new Set(registry.games.map(g=>g.id)).size,57);
assert.equal(registry.games.filter(g=>g.category==='board').length,10);
assert.equal(registry.games.filter(g=>g.category==='cards').length,5);
const index = fs.readFileSync('index.html','utf8');
assert(index.includes('data-filter="board"'));
for (const asset of ['app.js','styles.css']) assert(index.includes(asset+'?v='+registry.GAME_BUILD));
for (const g of registry.games) {
 assert.equal(g.status,'ready');assert(registry.artMarkup[g.art]);
 assert(/^\.\/games\/[\w\-/]+\.html$/.test(g.url));assert(fs.existsSync(g.url));
 const html=fs.readFileSync(g.url,'utf8');
 for (const m of html.matchAll(/<(?:script|link)\b[^>]*(?:src|href)=["']([^"']+)["'][^>]*>/gi)) {
  if (/^(?:[a-z]+:|\/\/)/i.test(m[1])) continue;
  const file=path.resolve(path.dirname(g.url),m[1].split('?')[0]);assert(fs.existsSync(file),'Missing asset '+file);
  if(file.endsWith('.js'))new vm.Script(fs.readFileSync(file,'utf8'),{filename:file});
 }
}
const report={passed:false,games:10,levelsPerGame:50,totalVerifiedLevels:500,registryCount:57,build:registry.GAME_BUILD,claims:{uniqueSolutionGames:['bridges','tents','slitherlink'],otherGamesMayHaveMultipleSolutions:true,initialPositionsOnly:true,controllerTestsAreNotBrowserVisualTests:true},suites:[]};
for (const [id,...commands] of suites) {
 const dir=path.join('games',id), entry=registry.games.find(g=>g.id===id);assert(entry?.category==='board');
 let data=fs.existsSync(path.join(dir,'levels.json'))?JSON.parse(fs.readFileSync(path.join(dir,'levels.json'),'utf8')):require('./'+dir+'/levels.js');
 const levels=Array.isArray(data)?data:data.levels;assert.equal(levels.length,50,id);
 const row={game:id,levels:levels.length,files:{},checks:[]};
 for(const file of fs.readdirSync(dir).filter(n=>/\.(?:js|cjs|json|py|cpp|css|md)$/.test(n)).sort())row.files[file]=crypto.createHash('sha256').update(fs.readFileSync(path.join(dir,file))).digest('hex');
 for(const [bin,file,...extra] of commands){
  const args=[path.join(dir,file),...extra], command=(bin==='node'?process.execPath:bin);console.log('\n> '+bin+' '+args.join(' '));
  const started=Date.now(),r=spawnSync(command,args,{encoding:'utf8',maxBuffer:20*1024*1024,env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'}});
  if(r.stdout)process.stdout.write(r.stdout);if(r.stderr)process.stderr.write(r.stderr);
  row.checks.push({command:bin+' '+args.join(' '),passed:r.status===0,seconds:Number(((Date.now()-started)/1000).toFixed(3)),output:(r.stdout||'').trim(),stderr:(r.stderr||'').trim()});
  if(r.error||r.status!==0){report.suites.push(row);fs.writeFileSync('puzzle-verification-report.json',JSON.stringify(report,null,2)+'\n');throw(r.error||new Error('Failed: '+bin+' '+args.join(' ')));}
 }
 // Record hashes after test-produced proof reports have been refreshed.
 for(const file of Object.keys(row.files))row.files[file]=crypto.createHash('sha256').update(fs.readFileSync(path.join(dir,file))).digest('hex');
 report.suites.push(row);
}
report.passed=true;
fs.writeFileSync('puzzle-verification-report.json',JSON.stringify(report,null,2)+'\n');
console.log('\nPASS: 10 games × 50 distinct solvable levels = 500; all 57 registry links/assets present; unique-solution claims verified for Hashi, Tents, and Slitherlink.');
