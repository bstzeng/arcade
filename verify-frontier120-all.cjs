#!/usr/bin/env node
'use strict';
// Every new family is rerun in a source-only temporary copy. Historical evidence
// is retained; the corrected270 gate explicitly reuses its original engine proofs.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{spawnSync}=require('node:child_process'),T=require('./frontier120-tools.cjs');
process.chdir(__dirname);
const partial=process.argv.includes('--families'),historicalOnly=process.argv.includes('--historical'),reuseHistorical=process.argv.includes('--reuse-historical');
const ids=partial?process.argv.slice(process.argv.indexOf('--families')+1).filter(x=>!x.startsWith('--')):historicalOnly?[]:T.spec.families.map(f=>f.id);
assert(!partial||ids.length,'Supply family IDs');
const report={schemaVersion:1,passed:false,scope:partial?'Explicit partial new-family offline run':historicalOnly?'Corrected270 baseline isolated preservation/correction regression':'Complete390-game offline integration audit',completeReleaseAudit:!partial&&!historicalOnly,baseCommit:T.preservation.baseCommit,families:[],historical:null,sourceFiles:{},failures:[],claims:{allNewFamilyTestsFresh:true,allHistoricalEngineProofsFresh:false,actualBrowserTesting:false,hostedVerification:false,publicationReady:false}};
const auditFiles=['frontier120-tools.cjs','verify-frontier120-all.cjs','frontier120-spec.json','frontier120-preservation.json','frontier120-baseline-root.json'];
if(!partial&&!historicalOnly)auditFiles.push('app.js','index.html','styles.css','README.md','verify-all.cjs','integrate-frontier120.cjs','verify-frontier120.cjs','verify-frontier120-lobby.cjs','verify-frontier120-regressions.cjs','frontier120-manifest.json');
report.sourceFiles=Object.fromEntries(auditFiles.map(f=>[f,T.hash(f)]));
const started=Date.now(),digest=x=>crypto.createHash('sha256').update(x).digest('hex');
function run(copy,commands){return commands.map(argv=>{const start=Date.now(),r=spawnSync(argv[0]==='node'?process.execPath:argv[0],argv.slice(1),{cwd:copy,encoding:'utf8',maxBuffer:96*1024*1024,env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'}});const output=(r.stdout||'')+(r.stderr||'');process.stdout.write(output);assert.ifError(r.error);assert.equal(r.status,0,'Failed '+argv.join(' ')+'\n'+output.slice(-4000));return{argv,exitCode:r.status,seconds:+((Date.now()-start)/1000).toFixed(3),stdoutSHA256:digest(r.stdout||''),stderrSHA256:digest(r.stderr||''),tail:output.slice(-1800)};});}
function copyFile(copy,file){T.safePath(file);fs.mkdirSync(path.dirname(path.join(copy,file)),{recursive:true});fs.copyFileSync(path.join(__dirname,file),path.join(copy,file));}
function bindReportSources(data,copy,id){let count=0;for(const key of ['sourceFiles','sourceHashes','sourceHashesBefore','sourceHashesAfter'])for(const[src,sha]of Object.entries(data[key]||{})){if(typeof sha!=='string')continue;const resolved=fs.existsSync(path.join(copy,src))?src:T.spec.families.find(f=>f.id===id).directory+'/'+src;T.safePath(resolved);assert.equal(digest(fs.readFileSync(path.join(copy,resolved))),sha,id+' fresh report has stale source '+resolved);assert.equal(T.hash(resolved),sha,id+' live source changed during isolated run '+resolved);count++;}return count;}
try{
 report.preservedHistoricalFiles=T.assertPreserved();
 if(!partial&&reuseHistorical){
  const old=T.read('frontier120-historical-verification-report.json');assert(old.passed&&old.historical?.passed,'No successful corrected270 baseline result to reuse');assert.equal(old.baseCommit,T.preservation.baseCommit);assert.equal(old.historical.baselineFingerprint,digest(JSON.stringify(T.preservation.files)));for(const[f,h]of Object.entries(old.sourceFiles))assert.equal(T.hash(f),h,'Historical audit source changed '+f);report.historical={...old.historical,reusedGateResult:true,evidenceSHA256:T.hash('frontier120-historical-verification-report.json')};report.sourceFiles['frontier120-historical-verification-report.json']=T.hash('frontier120-historical-verification-report.json');
 }else if(!partial){
  const copy=fs.mkdtempSync(path.join(os.tmpdir(),'arcade270-preserved-'));
  try{
   for(const f of Object.keys(T.preservation.gitBlobs))copyFile(copy,f);
   for(const[f,text]of Object.entries(T.read('frontier120-baseline-root.json').files))fs.writeFileSync(path.join(copy,f),text);
   for(const[f,h]of Object.entries(T.preservation.files))assert.equal(digest(fs.readFileSync(path.join(copy,f))),h,'Unfaithful baseline copy '+f);
   report.historical={passed:false,method:'Fresh invocation of the exact published PR24 corrected270 verify-all dispatcher in a byte-identical disposable baseline. Its affected social/lobby tests rerun; original complete engine evidence and documented incremental recovery are reused through published byte bindings.',baselineFiles:2691,baselineFingerprint:digest(JSON.stringify(T.preservation.files)),allEngineProofsFresh:false,originalEvidenceRewritten:false,commands:run(copy,[['node','verify-all.cjs']])};
   const data=JSON.parse(fs.readFileSync(path.join(copy,'expansion120-presentation-verification-report.json'),'utf8'));assert(data.passed,'Corrected270 gate failed');report.historical.freshCorrectionReport={sha256:digest(JSON.stringify(data)),result:data};report.historical.passed=true;
  }finally{fs.rmSync(copy,{recursive:true,force:true});}
 }
 for(const id of ids){
  const family=T.loadFamily(id),manifestHash=T.hash(family.releaseManifestPath),row={id,passed:false,games:family.games.length,levels:family.games.reduce((n,g)=>n+g.levelCount,0),manifestPath:family.releaseManifestPath,manifestSHA256:manifestHash,sourceFiles:family.sourceFiles};report.families.push(row);
  const copy=fs.mkdtempSync(path.join(os.tmpdir(),'arcade-frontier-'+id+'-'));
  try{
   for(const file of ['index.html','app.js','styles.css','favicon.svg','frontier120-spec.json'])copyFile(copy,file);
   for(const file of new Set([...Object.keys(family.sourceFiles),family.releaseManifestPath,...Object.keys(family.manifest.evidenceFiles||{})]))if(fs.existsSync(path.join(__dirname,file)))copyFile(copy,file);
   for(const file of family.freshReports)fs.rmSync(path.join(copy,file),{force:true});
   row.commands=run(copy,family.commands);row.freshReports={};
   for(const file of family.freshReports){const p=path.join(copy,file);assert(fs.existsSync(p),'Missing fresh report '+file);const bytes=fs.readFileSync(p),data=JSON.parse(bytes);assert(data.passed===true||['passed','pass'].includes(data.status)||data.result==='pass',id+' failed fresh report '+file);const bindings=bindReportSources(data,copy,id);row.freshReports[file]={sha256:digest(bytes),sourceBindingsChecked:bindings,result:data};}
   for(const[file,h]of Object.entries(family.sourceFiles)){assert.equal(digest(fs.readFileSync(path.join(copy,file))),h,id+' source altered during isolated tests '+file);assert.equal(T.hash(file),h,id+' live source changed during tests '+file);}
   assert.equal(T.hash(family.releaseManifestPath),manifestHash,id+' manifest changed during tests');row.passed=true;
  }finally{fs.rmSync(copy,{recursive:true,force:true});}
 }
 if(!partial&&!historicalOnly){assert.equal(report.families.length,8);assert.equal(report.families.reduce((n,f)=>n+f.games,0),120);report.integration=run(__dirname,[['node','verify-frontier120.cjs'],['node','verify-frontier120-lobby.cjs'],['node','verify-frontier120-regressions.cjs']]);}
 T.assertPreserved();for(const row of report.families){assert.equal(T.hash(row.manifestPath),row.manifestSHA256,row.id+' manifest changed after run');for(const[f,h]of Object.entries(row.sourceFiles))assert.equal(T.hash(f),h,'Source changed after test '+f);}for(const[f,h]of Object.entries(report.sourceFiles))assert.equal(T.hash(f),h,'Audit source changed during run '+f);report.passed=true;
}catch(e){report.failures.push({error:String(e.stack||e)});console.error(e.stack||e);process.exitCode=1;}
finally{report.seconds=+((Date.now()-started)/1000).toFixed(3);const out=partial?'frontier120-partial-verification-report.json':historicalOnly?'frontier120-historical-verification-report.json':'frontier120-aggregate-verification-report.json';fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');console.log((report.passed?'PASS':'FAIL')+': '+report.scope+'; '+report.families.length+' fresh new families. Browser/hosted QA are separate.');}
