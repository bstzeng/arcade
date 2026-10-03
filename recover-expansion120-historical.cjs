#!/usr/bin/env node
'use strict';
// Explicit incremental recovery. It consumes an actual failed complete-run
// transcript, retains its failures, and freshly reruns the one failed suite.
// It never represents reused transcript evidence as retained per-suite reports.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{spawnSync}=require('node:child_process'),T=require('./expansion120-tools.cjs');
process.chdir(__dirname);const [transcriptPath,failedReportPath]=process.argv.slice(2);assert(transcriptPath&&failedReportPath,'Supply actual complete transcript and failed outer report');
const bytes=fs.readFileSync(transcriptPath),text=bytes.toString('utf8'),lines=text.split('\n'),prior=JSON.parse(fs.readFileSync(failedReportPath));const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
assert.equal(prior.passed,false);assert.equal(prior.scope,'Historical 150-game isolated regression');assert.equal(prior.baseCommit,T.preservation.baseCommit);
for(const f of ['expansion120-spec.json','expansion120-preservation.json','expansion120-baseline-root.json'])assert.equal(T.hash(f),prior.sourceFiles[f],'Historical input changed '+f);
assert(text.includes("ModuleNotFoundError: No module named 'chess'"));assert(text.includes('One or more suites failed'));assert(text.includes('1 !== 0'));assert(!/ENOENT|SyntaxError|No module named '(?!chess')/.test(text),'Unexpected additional failure');
const markers={
 'historical:verify-cards.cjs':['PASS: all five sets (250 deals) have complete independently verified winning certificates.'],
 'historical:verify-puzzles.cjs':['PASS: 10 games × 50 distinct solvable levels = 500;'],
 'historical:verify-logic.cjs':['PASS: 500 new distinct unique-solution levels;'],
 'historical:verify-classics.cjs':['PASS: 500 new puzzles; 350 uniquely solved clue challenges'],
 'historical:verify-collection.cjs':['PASS: 500 new levels; 300 independent unique solutions'],
 'historical:verify-tabletop.cjs':['PASS: 10 tabletop games, 3 AI difficulties'],
 'historical:verify-chinese-chess.cjs':['PASS: 2 Chinese chess games, 3 AI difficulties'],
 'historical:verify-air-traffic.cjs':['PASS: Air Traffic Control rules and controller suites'],
 'shared-challenge-lifecycle':['"assertions": 522','"assertions": 36','"scope": "Simulated DOM lifecycle"'],
 'expansion:cards':['PASS all ten card games / 1,000 witnesses;','PASS assistance provenance texas-holdem 8'],
 'expansion:numbers':['PASS numeric batch: 10 games, 1000 challenges, reproducible generation'],
 'expansion:deduction':['escape-inventory 100 independent checks passed','PASS 2210 UI assertions','PASS 192 static checks'],
 'expansion:spatial':['PASS: 10 spatial games / 1,000 challenges.','DOM PASS pin-and-ball all 100 rendered','STATIC PASS pin-and-ball'],
 'expansion:paths':['{"game":"euler-bridges","passed":true','{"game":"knight-tour","passed":true','{"game":"dual-shadow-maze","passed":true','{"game":"tidal-maze","passed":true','{"game":"energy-network","passed":true','{"game":"single-teleport","passed":true','{"game":"color-gates","passed":true','{"game":"tether-maze","passed":true','{"game":"reversible-stairs","passed":true','{"game":"tour-route","passed":true'],
 'expansion:simulation':['alchemy-lab: 22 manual UI actions passed','{"passed":true,"games":10,"assertions":2947','"checks": 574'],
 'expansion:quick':['breakout: 100/100 independent legal winning replays','snake: 100/100 independent legal winning replays','pinball: 100/100 independent legal winning replays','bubble-shooter: 100/100 independent legal winning replays','rhythm-drums: 100/100 independent legal winning replays','parkour-run: 100/100 independent legal winning replays','space-dodge: 100/100 independent legal winning replays','whack-a-mole: 100/100 independent legal winning replays','fruit-slice: 100/100 independent legal winning replays','fishing-challenge: 100/100 independent legal winning replays'],
 'final-150-game-integration':['PASS: 150 games including all 70 unchanged records','PASS: 80 new games × 100 selectable challenges','PASS: 8 intentional integration corruptions rejected']
};
const reused=Object.entries(markers).map(([id,needles])=>({id,passed:true,evidenceKind:'reused-complete-run-transcript',freshRerun:false,markers:needles.map(needle=>{const line=lines.findIndex(l=>l.includes(needle));assert(line>=0,id+' missing explicit pass marker '+needle);return{line:line+1,text:lines[line]};})}));assert.equal(reused.length,17);
T.assertPreserved();const fixture=T.read('expansion120-baseline-root.json');assert(fixture.files['verify-all.cjs'].includes("assert.equal(report.suites.length,18"),'Original 18-suite harness required');
const report={schemaVersion:1,passed:false,baseCommit:T.preservation.baseCommit,method:'transparent-transcript-backed-incremental-recovery',historicalSuiteCount:18,reusedSuites:reused,freshSuites:[],sourceFiles:{'expansion120-preservation.json':T.hash('expansion120-preservation.json'),'expansion120-baseline-root.json':T.hash('expansion120-baseline-root.json'),'expansion-manifest.json':T.hash('expansion-manifest.json'),'recover-expansion120-historical.cjs':T.hash('recover-expansion120-historical.cjs')},priorAttempt:{passed:false,seconds:prior.seconds,transcriptSHA256:hash(bytes),transcriptBytes:bytes.length,failedOuterReportSHA256:hash(fs.readFileSync(failedReportPath)),failure:"Python chess oracle dependency missing: ModuleNotFoundError: chess",retention:'Complete transcript and failed outer report retained externally by release owner; original disposable per-suite JSON was not retained.',onlyOneFailedSuiteObserved:true},claims:{all18SuitesFreshInThisInvocation:false,retainedOriginalPerSuiteJSON:false,allNewFamilyAnd270LobbyTestsIncluded:false,browserQA:false}};
const copy=fs.mkdtempSync(path.join(os.tmpdir(),'arcade150-recovery-'));
try{
 const pre=spawnSync('python3',['-c',"import importlib.metadata as m; import chess, shogi; import json; print(json.dumps({p:m.version(p) for p in ['python-chess','chess','python-shogi']}))"],{encoding:'utf8',env:process.env});assert.equal(pre.status,0,pre.stderr);report.dependencies=JSON.parse(pre.stdout);assert.deepEqual(report.dependencies,{'python-chess':'1.999',chess:'1.11.2','python-shogi':'1.1.1'});
 for(const file of Object.keys(T.preservation.files)){fs.mkdirSync(path.dirname(path.join(copy,file)),{recursive:true});fs.copyFileSync(file,path.join(copy,file));}
 for(const [file,content]of Object.entries(fixture.files))fs.writeFileSync(path.join(copy,file),content);
 const family=T.read('expansion-manifest.json').families.find(f=>f.id==='tabletop'),commands=[...family.regeneration.commands,...family.commands],row={id:'expansion:tabletop',passed:false,evidenceKind:'fresh-isolated-command-run',commands:[],freshReports:{}};report.freshSuites.push(row);
 for(const [i,argv]of commands.entries()){
  const start=Date.now(),r=spawnSync(argv[0]==='node'?process.execPath:argv[0],argv.slice(1),{cwd:copy,encoding:'utf8',maxBuffer:64*1024*1024,env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'}});process.stdout.write(r.stdout||'');process.stderr.write(r.stderr||'');row.commands.push({argv,exitCode:r.status,seconds:+((Date.now()-start)/1000).toFixed(3),stdoutSHA256:hash(r.stdout||''),stderrSHA256:hash(r.stderr||''),tail:(r.stdout||'').slice(-1500)});assert.equal(r.status,0,argv.join(' ')+' failed');
  if(i===family.regeneration.commands.length-1){for(const f of family.regeneration.files)assert.equal(hash(fs.readFileSync(path.join(copy,f))),T.hash(f),'Nondeterministic historical corpus '+f);row.byteIdenticalRegeneratedCorpora=family.regeneration.files.length;}
 }
 for(const f of family.freshReports){const b=fs.readFileSync(path.join(copy,f)),data=JSON.parse(b);row.freshReports[f]={sha256:hash(b),data};}
 for(const id of ['chess','shogi']){const d=row.freshReports['games/'+id+'/independent-verification.json'].data;assert.equal(d.puzzles,100);assert.equal(d.allLegalMoveSetsAgree,true);assert.equal(d.engineSha256,T.hash('games/'+id+'/engine.js'));assert.equal(d.levelsSha256,T.hash('games/'+id+'/levels.json'));}
 row.passed=true;T.assertPreserved();for(const[f,sha]of Object.entries(report.sourceFiles))assert.equal(T.hash(f),sha,'Recovery source changed '+f);report.passed=true;
}catch(e){report.error=String(e.stack||e);process.exitCode=1;console.error(e.stack||e);}
finally{fs.rmSync(copy,{recursive:true,force:true});fs.writeFileSync('expansion120-historical-recovery-report.json',JSON.stringify(report,null,2)+'\n');}
console.log((report.passed?'PASS':'FAIL')+': 17 explicitly evidenced historical suites reused; tabletop expansion suite freshly rerun after pinned dependency restoration.');
