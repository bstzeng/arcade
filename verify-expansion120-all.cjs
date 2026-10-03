#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{spawnSync}=require('node:child_process');
const T=require('./expansion120-tools.cjs');process.chdir(__dirname);
const partial=process.argv.includes('--families'),historicalOnly=process.argv.includes('--historical');
const ids=partial?process.argv.slice(process.argv.indexOf('--families')+1).filter(x=>!x.startsWith('--')):historicalOnly?[]:T.spec.families.map(f=>f.id);
assert(!partial||ids.length,'Supply family IDs after --families');
const report={schemaVersion:1,passed:false,scope:partial?'Explicit partial-family offline run':historicalOnly?'Historical 150-game isolated regression':'Complete 270-game offline release audit',completeReleaseAudit:!partial&&!historicalOnly,baseCommit:T.preservation.baseCommit,families:[],historical:null,sourceFiles:{},failures:[],claims:{actualBrowserTesting:false,hostedVerification:false,publicationReady:false}};
const auditFiles=['expansion120-tools.cjs','verify-expansion120-all.cjs','expansion120-spec.json','expansion120-preservation.json','expansion120-baseline-root.json'];
if(!partial&&!historicalOnly)auditFiles.push('app.js','index.html','styles.css','README.md','verify-all.cjs','integrate-expansion120.cjs','verify-expansion120.cjs','verify-expansion120-lobby.cjs','verify-expansion120-regressions.cjs','expansion120-manifest.json');
report.sourceFiles=Object.fromEntries(auditFiles.map(f=>[f,T.hash(f)]));
const started=Date.now(),digest=x=>crypto.createHash('sha256').update(x).digest('hex');
function run(copy,commands){return commands.map(argv=>{const t=Date.now(),r=spawnSync(argv[0]==='node'?process.execPath:argv[0],argv.slice(1),{cwd:copy,encoding:'utf8',maxBuffer:64*1024*1024,env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'}});const text=(r.stdout||'')+(r.stderr||'');process.stdout.write(text);assert.ifError(r.error);assert.equal(r.status,0,'Failed '+argv.join(' ')+'\n'+text.slice(-4000));return {argv,exitCode:r.status,seconds:+((Date.now()-t)/1000).toFixed(3),stdoutSHA256:digest(r.stdout||''),stderrSHA256:digest(r.stderr||''),tail:text.slice(-1600)};});}
function copyFile(copy,file){T.safePath(file);fs.mkdirSync(path.dirname(path.join(copy,file)),{recursive:true});fs.copyFileSync(path.join(__dirname,file),path.join(copy,file));}
try{
 report.preservedHistoricalFiles=T.assertPreserved();
 if(!partial&&process.argv.includes('--reuse-historical')){
  const recovery=T.read('expansion120-historical-recovery-report.json');assert.equal(recovery.passed,true);assert.equal(recovery.baseCommit,T.preservation.baseCommit);assert.equal(recovery.reusedSuites.length,17);assert(recovery.reusedSuites.every(s=>s.passed&&s.freshRerun===false&&s.markers.length));assert.equal(recovery.freshSuites.length,1);assert(recovery.freshSuites.every(s=>s.passed&&s.commands.every(c=>c.exitCode===0)));for(const[f,sha]of Object.entries(recovery.sourceFiles))assert.equal(T.hash(f),sha,'Historical recovery binding stale: '+f);T.assertPreserved();report.historical={passed:true,method:recovery.method,reusedTranscriptSuites:17,freshRecoverySuites:1,allSuitesFreshInThisInvocation:false,recoveryReportSHA256:T.hash('expansion120-historical-recovery-report.json'),evidence:recovery};report.sourceFiles['expansion120-historical-recovery-report.json']=T.hash('expansion120-historical-recovery-report.json');
 }else if(!partial){
  run(__dirname,[['python3','-c','import chess, shogi']]);
  const copy=fs.mkdtempSync(path.join(os.tmpdir(),'arcade150-preserved-'));
  try{
   for(const file of Object.keys(T.preservation.files))copyFile(copy,file);
   // Earlier preservation contracts include published build logs. Copy these
   // directly from the unchanged current tree; do not invent missing content.
   for(const manifest of ['expansion-preservation.json','lobby-categories-preservation.json','chinese-chess-preservation.json','tabletop-preservation.json']){const m=T.read(manifest);for(const key of ['baselineFiles','assets','historicalReports'])for(const file of Object.keys(m[key]||{}))if(fs.existsSync(path.join(__dirname,file)))copyFile(copy,file);}
   for(const [file,text] of Object.entries(T.read('expansion120-baseline-root.json').files))fs.writeFileSync(path.join(copy,file),text);
   report.historical={commands:[],passed:false};try{report.historical.commands=run(copy,[['node','verify-all.cjs']]);report.historical.passed=true;}finally{const file='expansion-current-aggregate-verification-report.json';if(fs.existsSync(path.join(copy,file)))report.historical.freshReport=JSON.parse(fs.readFileSync(path.join(copy,file),'utf8'));}
  }finally{fs.rmSync(copy,{recursive:true,force:true});}
 }
 for(const id of ids){
  const family=T.loadFamily(id),row={id,passed:false,games:family.games.length,levels:family.games.reduce((n,g)=>n+g.levelCount,0),sourceFiles:family.sourceFiles};report.families.push(row);
  const copy=fs.mkdtempSync(path.join(os.tmpdir(),'arcade120-'+id+'-'));
  try{
   // Minimal complete site context prevents unrelated in-progress families from
   // contaminating a family run. Runtime parent links still resolve.
   for(const file of ['index.html','app.js','styles.css','favicon.svg','expansion120-spec.json'])copyFile(copy,file);
   for(const file of [...Object.keys(family.sourceFiles),family.releaseManifestPath,...family.freshReports,...Object.keys(family.manifest.evidenceFiles||{})])if(fs.existsSync(path.join(__dirname,file)))copyFile(copy,file);
   for(const reportPath of family.freshReports)fs.rmSync(path.join(copy,reportPath),{force:true});
   row.commands=run(copy,family.commands);
   row.freshReports={};for(const file of family.freshReports){const p=path.join(copy,file);assert(fs.existsSync(p),'Missing fresh report '+file);const data=JSON.parse(fs.readFileSync(p,'utf8'));assert(data.passed===true||data.status==='passed'||data.status==='pass'||data.result==='pass',id+' fresh report does not pass: '+file);for(const [src,sha]of Object.entries(data.sourceFiles||data.sourceHashes||{})){const resolved=fs.existsSync(path.join(copy,src))?src:family.directory+'/'+src;assert.equal(digest(fs.readFileSync(path.join(copy,resolved))),sha,id+' stale fresh report binding '+src);assert.equal(T.hash(resolved),sha,id+' actual source changed after family run '+src);}row.freshReports[file]={sha256:digest(fs.readFileSync(p)),result:data};}
   for(const [file,sha]of Object.entries(family.sourceFiles))assert.equal(T.hash(file),sha,id+' source changed during run '+file);
   row.passed=true;
  }catch(e){row.error=String(e.stack||e);report.failures.push({family:id,error:row.error});throw e;}
  finally{fs.rmSync(copy,{recursive:true,force:true});}
 }
 if(!partial&&!historicalOnly){
  assert.equal(report.families.length,8);assert.equal(report.families.reduce((n,f)=>n+f.games,0),120);
  report.integration=run(__dirname,[['node','verify-expansion120.cjs'],['node','verify-expansion120-lobby.cjs'],['node','verify-expansion120-regressions.cjs']]);
 }
 for(const family of report.families)for(const[f,sha]of Object.entries(family.sourceFiles))assert.equal(T.hash(f),sha,'Family source changed after its test run: '+f);
 for(const [f,sha]of Object.entries(report.sourceFiles))assert.equal(T.hash(f),sha,'Audit source changed while executing: '+f);
 report.passed=true;
}catch(e){report.failures.push({error:String(e.stack||e)});process.exitCode=1;console.error(e.stack||e);}
finally{
 report.seconds=+((Date.now()-started)/1000).toFixed(3);
 const output=partial?'expansion120-partial-verification-report.json':historicalOnly?'expansion120-historical-verification-report.json':'expansion120-aggregate-verification-report.json';fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
 console.log((report.passed?'PASS':'FAIL')+': '+report.scope+'; '+report.families.length+' new families; browser and hosted QA remain separate.');
}
