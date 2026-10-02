#!/usr/bin/env node
'use strict';
// Offline release audit: every claimed unique solution is independently counted.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {spawnSync}=require('node:child_process');process.chdir(__dirname);
const currentRegistryCount=require('./verify-lobby.cjs').games.length;
const suites=[
 ['nonogram','verification.json','results',[['node','verify.cjs'],['node','ui-test.cjs']]],
 ['nurikabe','verification.json','results',[['node','verify.cjs'],['node','ui-test.cjs']]],
 ['magnets','independent-proof.json','levels',[['node','test.cjs'],['python3','verify.py']]],
 ['battleships','independent-proof.json','levels',[['node','test.cjs'],['python3','verify.py']]],
 ['futoshiki','certification.json','levelsReport',[['node','certify.cjs'],['node','engine-test.cjs'],['node','ui-test.cjs','futoshiki']]],
 ['kakuro','certification.json','levelsReport',[['node','certify.cjs'],['node','engine-test.cjs'],['node','ui-test.cjs','kakuro']]],
 ['masyu','verification-report.json','results',[['node','test.cjs'],['node','test-ui.cjs'],['python3','verify.py']]],
 ['net','verification-report.json','results',[['node','test.cjs'],['node','test-ui.cjs'],['python3','verify.py']]],
 ['black-box','verification-report.json','results',[['node','verify-independent.cjs'],['node','test.cjs'],['node','test-ui.cjs']]],
 ['skyscrapers','verification-report.json','results',[['node','verify-independent.cjs'],['node','test.cjs'],['node','test-ui.cjs']]]
];
const source=fs.readFileSync('app.js','utf8');const registry=vm.runInNewContext(source.slice(0,source.indexOf('let activeCategory'))+';({games,categoryNames,artMarkup,GAME_BUILD})');
assert.equal(registry.games.length,currentRegistryCount);assert.equal(new Set(registry.games.map(g=>g.id)).size,currentRegistryCount);assert.equal(registry.games.filter(g=>g.category==='logic').length,10);assert.equal(registry.games.filter(g=>g.category==='board').length,10);assert.equal(registry.games.filter(g=>g.category==='cards').length,5);
const home=fs.readFileSync('index.html','utf8'),browse=require('./verify-lobby.cjs');
for(const game of registry.games.filter(g=>g.category==='logic'))assert(home.includes('data-filter="'+browse.categoryByGameId[game.id].id+'"'));
for(const asset of ['app.js','styles.css'])assert(home.includes(asset+'?v='+registry.GAME_BUILD));
for(const g of registry.games){assert.equal(g.status,'ready');assert(registry.artMarkup[g.art]);assert(/^\.\/games\/[\w\-/]+\.html$/.test(g.url));assert(fs.existsSync(g.url));const html=fs.readFileSync(g.url,'utf8');for(const m of html.matchAll(/<(?:script|link)\b[^>]*(?:src|href)=["']([^"']+)["'][^>]*>/gi)){if(/^(?:[a-z]+:|\/\/)/i.test(m[1]))continue;const file=path.resolve(path.dirname(g.url),m[1].split('?')[0]);assert(fs.existsSync(file),'Missing asset '+file);if(file.endsWith('.js'))new vm.Script(fs.readFileSync(file,'utf8'),{filename:file});}}
// Shared verify-lobby above exercises grouped rendering, every game's bilingual
// search, all primary categories, empty/reset/history and versioned links.
// Preserve the original 500-level proof, uniqueness and controller tests below.
const report={passed:false,build:registry.GAME_BUILD,registryCount:currentRegistryCount,newGames:10,levelsPerGame:50,totalUniqueLevels:0,claims:{allNewLevelsHaveExactlyOneSolution:true,blackBox:'Entire observable boundary signature at the published atom count; partial probes can be ambiguous',net:'Physical connector masks; symmetric rotations do not create extra solutions',controllerTestsAreNotBrowserVisualTests:true},suites:[]};
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
for(const [id,proofFile,rowsKey,commands] of suites){const dir=path.join('games',id),entry=registry.games.find(g=>g.id===id);assert.equal(entry.category,'logic');const data=JSON.parse(fs.readFileSync(path.join(dir,'levels.json'),'utf8'));const levels=Array.isArray(data)?data:data.levels;assert.equal(levels.length,50,id);assert.equal(new Set(levels.map(l=>l.id)).size,50,id+' duplicate IDs');const row={game:id,levels:50,checks:[],files:{}};report.suites.push(row);for(const [bin,file,...extra]of commands){const args=[path.join(dir,file),...extra];console.log('\n> '+bin+' '+args.join(' '));const start=Date.now();const r=spawnSync(bin==='node'?process.execPath:bin,args,{encoding:'utf8',maxBuffer:30*1024*1024,env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'}});if(r.stdout)process.stdout.write(r.stdout);if(r.stderr)process.stderr.write(r.stderr);row.checks.push({command:bin+' '+args.join(' '),passed:r.status===0,seconds:+((Date.now()-start)/1000).toFixed(3),output:(r.stdout||'').trim(),stderr:(r.stderr||'').trim()});if(r.error||r.status!==0){fs.writeFileSync('logic-verification-report.json',JSON.stringify(report,null,2)+'\n');throw(r.error||new Error('Failed '+id+' '+file));}}
 const proof=JSON.parse(fs.readFileSync(path.join(dir,proofFile),'utf8'));assert.equal(proof[rowsKey].length,50,id+' missing per-level counts');assert(proof[rowsKey].every(r=>(r.solutions??r.solutionCount)===1),id+' uniqueness not proved');row.uniqueSolutionCounts=proof[rowsKey].map(r=>({level:r.id??r.level,solutions:r.solutions??r.solutionCount}));row.independentProof=proofFile;report.totalUniqueLevels+=50;
 for(const f of fs.readdirSync(dir).filter(n=>/\.(?:js|cjs|json|py|css|md)$/.test(n)).sort())row.files[f]=hash(path.join(dir,f));row.entrySHA256=hash('games/'+id+'.html');
}
assert.equal(report.totalUniqueLevels,500);report.passed=true;fs.writeFileSync('logic-verification-report.json',JSON.stringify(report,null,2)+'\n');console.log('\nPASS: 500 new distinct unique-solution levels; independent counters, rules and controller flows; current lobby links and assets.');
