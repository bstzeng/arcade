#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');const T=require('./frontier120-tools.cjs');process.chdir(__dirname);
const m=T.read('frontier120-manifest.json'),r=T.registry();
assert.equal(m.sourceBaselineCommit,T.preservation.baseCommit);assert.equal(m.newGames,120);assert.equal(m.releaseGames,390);assert.equal(m.games.length,120);assert.equal(m.families.length,8);
assert.equal(r.games.length,390,'Complete 390-game catalog required');assert.equal(new Set(r.games.map(g=>g.id)).size,390,'No duplicated registry IDs');assert.equal(new Set(r.games.map(g=>g.title)).size,390,'No duplicated registry titles');
assert.deepEqual(r.games.slice(0,270),T.preservation.registry,'All 270 historical registry records unchanged');assert.deepEqual(r.categories.slice(0,16),T.preservation.categories,'Historical browse groups unchanged');for(const[k,v]of Object.entries(T.preservation.artwork))assert.equal(r.artMarkup[k],v,'Historical artwork changed: '+k);
for(const[k,v]of Object.entries(T.preservation.categoryNames))assert.equal(r.categoryNames[k],v,'Historical category name changed '+k);
assert.deepEqual(r.games.slice(270).map(g=>g.id),T.spec.games.map(g=>g.id),'Exact proposed game order');
let gameCount=0,levelCount=0,sandboxCount=0;
for(const f of T.spec.families){const family=T.loadFamily(f.id);for(const g of family.games){const record=r.games.find(x=>x.id===g.id);assert.equal(record.title,g.title);assert.equal(record.url,'./'+g.entry);assert.equal(record.status,'ready');assert.equal(r.categoryByGameId[g.id].id,f.id);assert(r.artMarkup[record.art],g.id+' artwork missing');if(g.levelBased){assert(record.badge.includes('100'));levelCount+=g.levelCount;}else{assert(!record.badge.includes('100'),g.id+' sandbox misrepresented as 100 levels');sandboxCount++;}gameCount++;}}
assert.equal(gameCount,120);assert.equal(levelCount,m.newChallengeCount);assert.equal(sandboxCount,m.newSandboxGames);assert.equal(m.newLevelGames+sandboxCount,120);
assert.equal(new Set(r.games.slice(270).map(g=>r.artMarkup[g.art])).size,120,'Distinct new artwork required');
for(const[f,sha]of Object.entries(m.sourceFiles))assert.equal(T.hash(f),sha,'Stale integrated source binding: '+f);
const preserved=T.assertPreserved();const report={schemaVersion:1,passed:true,scope:'Exact source, corpus coverage, catalog and historical preservation; engine tests and browser QA are separate',registryCount:390,newGames:120,newLevels:levelCount,newSandboxes:sandboxCount,preservedFiles:preserved,sourceFiles:Object.fromEntries(['frontier120-manifest.json','frontier120-spec.json','frontier120-preservation.json','frontier120-tools.cjs','verify-frontier120.cjs','app.js','index.html'].map(f=>[f,T.hash(f)])),claims:{actualEngineReplay:false,browserQA:false}};
fs.writeFileSync('frontier120-integration-verification-report.json',JSON.stringify(report,null,2)+'\n');console.log('PASS: 390 catalog entries, exact120 proposal coverage, source-bound corpus declarations and '+preserved+' unchanged historical files.');
module.exports=r;
