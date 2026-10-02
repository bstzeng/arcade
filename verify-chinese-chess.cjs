#!/usr/bin/env node
'use strict';
// Reproducible, dependency-free rule and controller audit for multiplayer tabletop games.
// Test-generated evidence is regenerated in isolated copies; published assets stay unchanged.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto'),assert=require('node:assert/strict'),vm=require('node:vm'),{spawnSync}=require('node:child_process');
process.chdir(__dirname);
const registry=require('./verify-lobby.cjs');
const games=['xiangqi','banqi'];
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const preservation=JSON.parse(fs.readFileSync('chinese-chess-preservation.json','utf8'));
function preserve(){for(const [file,sha] of Object.entries(preservation.assets))assert.equal(hash(file),sha,'Prior game asset changed: '+file);}
assert.equal(preservation.originalGames,67);
assert.equal(Object.keys(preservation.assets).filter(f=>/^games\/[a-z0-9-]+\.html$/.test(f)).length,67,'Preservation manifest must cover all original game entries');
preserve();
assert(registry.games.length>=69);
assert.equal(registry.games.filter(g=>g.category==='tabletop').length,12);
assert.equal(preservation.gameIds.length,67);
for(const id of preservation.gameIds)assert(registry.games.some(g=>g.id===id),'Original lobby entry missing: '+id);
const report={passed:false,build:registry.GAME_BUILD,registryCount:registry.games.length,newGames:2,totalTabletopGames:12,difficultyLevels:['easy','normal','hard'],modes:['same-device multiplayer','human versus AI'],preservedOriginalGames:67,preservedOriginalAssets:Object.keys(preservation.assets).length,baseCommit:preservation.baseCommit,unchangedContent:{puzzleLevels:2000,cardDeals:250},claims:{boundedAI:true,perfectPlay:false,onlineMultiplayer:false,fixedLevelCountNotApplicable:true,controllerTestsAreNotBrowserVisualTests:true,mobileBrowserTestingClaimed:false},suites:[]};
try{
 for(const id of games){
  const dir=path.join(__dirname,'games',id),entry=registry.games.find(g=>g.id===id);assert.equal(entry.category,'tabletop');assert(entry.badge.includes('AI'));
  const files=fs.readdirSync(dir).filter(f=>!f.startsWith('.')&&f!=='__pycache__').sort();
  for(const required of ['engine.js','app.js','session.js','README.md','rules-tests.cjs','controller-tests.cjs','verification.json'])assert(files.includes(required),id+': missing '+required);
  const before=Object.fromEntries(files.filter(f=>fs.statSync(path.join(dir,f)).isFile()).map(f=>[f,hash(path.join(dir,f))]));
  const row={game:id,checks:[],files:before,entrySHA256:hash(path.join(__dirname,'games',id+'.html'))};report.suites.push(row);
  const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'arcade-chinese-chess-')),copy=path.join(temporary,'games',id);fs.mkdirSync(path.dirname(copy),{recursive:true});fs.cpSync(dir,copy,{recursive:true,filter:f=>!f.includes('__pycache__')});fs.copyFileSync(path.join(__dirname,'games',id+'.html'),path.join(temporary,'games',id+'.html'));
  try{
   fs.rmSync(path.join(copy,'verification.json')); // Require fresh evidence from this test run.
   const commands=files.includes('test.cjs')?['test.cjs']:['rules-tests.cjs','controller-tests.cjs'];
   for(const file of commands){
    console.log('\n> node games/'+id+'/'+file);
    const start=Date.now(),result=spawnSync(process.execPath,[path.join(copy,file)],{cwd:temporary,encoding:'utf8',maxBuffer:30*1024*1024,env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'}});
    if(result.stdout)process.stdout.write(result.stdout);if(result.stderr)process.stderr.write(result.stderr);
    row.checks.push({command:'node games/'+id+'/'+file,passed:result.status===0,seconds:+((Date.now()-start)/1000).toFixed(3),output:(result.stdout||'').trim(),stderr:(result.stderr||'').trim()});
    if(result.error||result.status!==0)throw result.error||Error(id+' '+file+' failed');
   }
   const evidence=JSON.parse(fs.readFileSync(path.join(copy,'verification.json'),'utf8'));assert.equal(evidence.passed,true,id+': test evidence not passing');assert.equal(evidence.controller?.passed===true||evidence.controllerPassed===true,true,id+': controller evidence not passing');
   assert.deepEqual([...evidence.difficultyLevels].sort(),['easy','hard','normal'],id+': incomplete AI difficulty coverage');row.evidence=evidence;
  }finally{fs.rmSync(temporary,{recursive:true,force:true});}
  for(const [file,sha]of Object.entries(before)){assert.equal(hash(path.join(dir,file)),sha,id+': tests mutated published file');if(/\.(?:js|cjs)$/.test(file))new vm.Script(fs.readFileSync(path.join(dir,file),'utf8'),{filename:id+'/'+file});}
 }
 preserve();assert.equal(report.suites.length,2);report.passed=true;
}finally{fs.writeFileSync('chinese-chess-verification-report.json',JSON.stringify(report,null,2)+'\n');}
console.log('\nPASS: 2 Chinese chess games, 3 AI difficulties, rule/tactical/self-play/controller suites; '+registry.games.length+' lobby entries; all '+report.preservedOriginalAssets+' prior game assets unchanged.');
