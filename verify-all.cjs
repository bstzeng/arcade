#!/usr/bin/env node
'use strict';
// Complete offline release audit. No browser, publication, or perfect-play claim.
// Every suite runs in a fresh copy so all published/frozen evidence remains intact.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
process.chdir(__dirname);
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const hashText=text=>crypto.createHash('sha256').update(text).digest('hex');
const preservation=JSON.parse(fs.readFileSync('expansion-preservation.json','utf8'));
const expansion=JSON.parse(fs.readFileSync('expansion-manifest.json','utf8'));
const independent=JSON.parse(fs.readFileSync('expansion-independent-review.json','utf8'));
for(const [name,review]of Object.entries(independent.reviews)){assert.equal(review.status,'passed',name+' review incomplete');for(const [file,sha]of Object.entries(review.sourceFiles))assert.equal(hash(file),sha,name+' independent review source became stale: '+file);}
assert.equal(expansion.games.length,80,'All 80 games must be integrated before the release audit');
assert.equal(expansion.families.length,8);assert.equal(expansion.newChallengeCount,8000);
const build=fs.readFileSync('app.js','utf8').match(/const GAME_BUILD = '([^']+)'/)[1];
const report={schemaVersion:1,passed:false,scope:'Complete offline release audit; browser and hosted verification are separate',build,baseCommit:preservation.baseCommit,registryCount:150,newGames:80,newChallenges:8000,historicalContent:{games:70,gameAssets:782,cardDeals:250,puzzleLevels:2000,tabletopGames:12,airTrafficMaps:8},claims:{offlineRulesAndControllerTests:true,browserVisualTestingClaimed:false,mobileBrowserTestingClaimed:false,allNewChallengesUniquelySolved:false,allOpponentWinsForced:false,historicalEvidenceRegeneratedInIsolation:true,historicalPublishedReportsPreserved:false,frozenBuilderArtifactsPreserved:false},publicationReady:false,browserQA:{status:'not-run',required:'Actual desktop/narrow browser and hosted route verification by release owner'},sourceFiles:{},suites:[],failures:[]};
const started=Date.now();
for(const file of ['app.js','index.html','styles.css','README.md','expansion-manifest.json','expansion-preservation.json','expansion-independent-review.json',...fs.readdirSync('.').filter(file=>/^verify-.*\.cjs$/.test(file)).sort()])report.sourceFiles[file]=hash(file);
const exclude=/(?:^|\/)(?:\.git|\.venv|node_modules|__pycache__|screenshots|test-results|playwright-report)(?:\/|$)|\.(?:pyc|log|tmp)$|(?:^|\/)test-results\.txt$/;
function executeSuite(id,commands,outputs=[],regeneration=null){
 const copy=fs.mkdtempSync(path.join(os.tmpdir(),'arcade150-audit-')),start=Date.now(),row={id,passed:false,commands:[],freshReports:{}};report.suites.push(row);
 try{
  fs.cpSync(__dirname,copy,{recursive:true,filter:f=>Object.hasOwn(preservation.baselineFiles,path.relative(__dirname,f).replaceAll('\\','/'))||!exclude.test(f)});
  const allCommands=[...(regeneration?.commands||[]),...commands];
  for(const [commandIndex,command] of allCommands.entries()){
   const [bin,...args]=command;assert(['node','python3'].includes(bin),'Unexpected audit runtime '+bin);
   const commandStart=Date.now(),result=spawnSync(bin==='node'?process.execPath:bin,args,{cwd:copy,encoding:'utf8',maxBuffer:60*1024*1024,env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'}});
   const stdout=result.stdout||'',stderr=result.stderr||'';
   if(stdout)process.stdout.write(stdout);if(stderr)process.stderr.write(stderr);
   row.commands.push({argv:command,exitCode:result.status,passed:result.status===0,seconds:+((Date.now()-commandStart)/1000).toFixed(3),stdoutSHA256:hashText(stdout),stderrSHA256:hashText(stderr),stdoutTail:stdout.slice(-1600),stderrTail:stderr.slice(-1000)});
   if(result.error)throw result.error;
   assert.equal(result.status,0,id+': '+command.join(' ')+' failed');
   if(regeneration&&commandIndex===regeneration.commands.length-1){for(const file of regeneration.files)assert.equal(hash(path.join(copy,file)),hash(file),id+' nondeterministic corpus: '+file);row.regeneration={passed:true,byteIdenticalFiles:regeneration.files.length};}
  }
  for(const output of outputs){const file=path.join(copy,output);assert(fs.existsSync(file),'Missing fresh report '+output);row.freshReports[output]=hash(file);}
  row.passed=true;
 }catch(error){row.error=error.stack||String(error);report.failures.push({suite:id,error:String(error)});}
 finally{row.seconds=+((Date.now()-start)/1000).toFixed(3);fs.rmSync(copy,{recursive:true,force:true});}
}
try{
 // Preserve every old suite and all its rule-specific assertions. Lobby assertions
 // now prove the exact old prefix/art/assets plus all 80 authorized additions.
 for(const [file,output] of [['verify-cards.cjs',null],['verify-puzzles.cjs','puzzle-verification-report.json'],['verify-logic.cjs','logic-verification-report.json'],['verify-classics.cjs','classics-verification-report.json'],['verify-collection.cjs','collection-verification-report.json'],['verify-tabletop.cjs','tabletop-verification-report.json'],['verify-chinese-chess.cjs','chinese-chess-verification-report.json'],['verify-air-traffic.cjs','air-traffic-verification-report.json']])executeSuite('historical:'+file,[['node',file]],output?[output]:[]);
 executeSuite('shared-challenge-lifecycle',[['node','games/challenge-common/challenge-core.test.cjs'],['node','games/challenge-common/challenge-ui.test.cjs']]);
 for(const family of expansion.families)executeSuite('expansion:'+family.id,family.commands,family.freshReports||[],family.regeneration||null);
 executeSuite('final-150-game-integration',[['node','verify-lobby.cjs'],['node','verify-expansion.cjs'],['node','verify-integration-regressions.cjs']],['expansion-lobby-verification-report.json','expansion-verification-report.json','expansion-integration-regression-report.json']);
 for(const [file,sha]of Object.entries(preservation.historicalReports))assert.equal(hash(file),sha,'Historical report changed: '+file);
 for(const [file,sha]of Object.entries(preservation.assets))assert.equal(hash(file),sha,'Original game asset changed: '+file);
 for(const [file,sha]of Object.entries(expansion.sourceFiles))assert.equal(hash(file),sha,'Frozen new source changed during audit: '+file);
 for(const [file,sha]of Object.entries(report.sourceFiles))assert.equal(hash(file),sha,'Root source changed during audit: '+file);
 report.independentReview=Object.fromEntries(Object.entries(independent.reviews).map(([name,review])=>[name,{status:review.status,games:review.games,sourceFilesVerified:Object.keys(review.sourceFiles).length}]));
 report.claims.historicalPublishedReportsPreserved=true;report.claims.frozenBuilderArtifactsPreserved=true;
 assert.equal(report.suites.length,18,'Eight legacy, eight expansion, common lifecycle and integration suites required');
 assert.equal(report.failures.length,0,'One or more suites failed; inspect expansion-aggregate-verification-report.json');
 report.passed=true;
} catch(error){report.failures.push({suite:'release-preservation-or-completeness',error:String(error)});throw error;}
finally{report.seconds=+((Date.now()-started)/1000).toFixed(3);fs.writeFileSync('expansion-aggregate-verification-report.json',JSON.stringify(report,null,2)+'\n');}
console.log('PASS offline: 150 games; all 70 original records and 782 game assets preserved; 80 new games × 100 challenges; all eight historical and eight expansion suites rerun. Browser/hosted QA remains a separate gate.');
