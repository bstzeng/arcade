#!/usr/bin/env node
'use strict';
// Current presentation corrections, with the original complete release evidence
// retained unchanged. Engine/corpus reuse is explicit and byte-verified.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
const root=__dirname;process.chdir(root);
const json=f=>JSON.parse(fs.readFileSync(f,'utf8')),sha=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex'),digest=b=>crypto.createHash('sha256').update(b).digest('hex'),blob=b=>crypto.createHash('sha1').update(Buffer.from('blob '+b.length+'\0')).update(b).digest('hex');
const manifestPath='expansion120-presentation-correction.json',baselinePath='expansion120-presentation-baseline.json',reportPath='expansion120-presentation-verification-report.json';
const m=json(manifestPath),b=json(baselinePath);assert.equal(b.baseCommit,m.baseCommit);assert.equal(b.baselineBlobCount,2686);assert.equal(Object.keys(b.gitBlobs).length,2686);assert.equal(m.baselineSHA256,sha(baselinePath));
function safe(f){assert(typeof f==='string'&&f&&!path.isAbsolute(f)&&!f.split(/[\\/]/).includes('..'),'Unsafe relative file '+f);return f;}
function bindings(){
 assert.deepEqual(Object.keys(m.changedFiles).sort(),['README.md','games/social120-common/style.css','games/social120-common/ui.js','verify-all.cjs'].sort(),'Only the reviewed social presentation and verification-support paths may change');
 assert.equal(m.changedFiles['games/social120-common/style.css'].kind,'presentation-css');assert.equal(m.changedFiles['games/social120-common/ui.js'].kind,'accessibility-markup');assert.equal(m.changedFiles['verify-all.cjs'].kind,'verification-dispatch');assert.equal(m.changedFiles['README.md'].kind,'verification-documentation');
 const observed=[];
 for(const[f,before]of Object.entries(b.gitBlobs)){safe(f);assert(fs.existsSync(f),'Published path missing: '+f);const bytes=fs.readFileSync(f),actual=blob(bytes),change=m.changedFiles[f];
  if(change){assert.equal(change.beforeGitBlob,before,'Wrong historical source '+f);assert.equal(actual,change.afterGitBlob,'Unbound correction bytes: '+f);assert.equal(sha(f),change.afterSHA256);observed.push(f);
   if(change.kind==='accessibility-markup'){let reversed=bytes.toString('utf8');for(const edit of change.exactTextReplacements){assert(reversed.includes(edit.after),'Missing reviewed markup '+f);reversed=reversed.replace(edit.after,edit.before);}assert.equal(blob(Buffer.from(reversed)),before,'Controller contains changes beyond reviewed markup: '+f);}
   else assert(['presentation-css','verification-dispatch','verification-documentation'].includes(change.kind),'Disallowed correction kind '+f);
  }else assert.equal(actual,before,'Unexpected modification to published file: '+f);
 }
 assert.deepEqual(observed.sort(),Object.keys(m.changedFiles).sort());
 for(const[f,h]of Object.entries(m.supportFiles)){safe(f);assert(!b.gitBlobs[f],'Support addition overlaps published path '+f);assert.equal(sha(f),h,'Changed correction support: '+f);}
 for(const[f,h]of Object.entries(b.frozenReportFiles))assert.equal(sha(f),h,'Original release evidence changed: '+f);
 return{historicalPaths:2686,unchangedPublishedBlobs:2686-observed.length,reviewedChanges:observed,enginesAndCorporaUnchanged:true,originalReleaseReportsUnchanged:true};
}
const before=bindings();
if(process.argv.includes('--bindings')){console.log(JSON.stringify({passed:true,...before},null,2));process.exit(0);}
if(process.argv.includes('--prepare')){
 const out=process.argv[process.argv.indexOf('--prepare')+1];assert(out,'Supply output directory');const report=json(reportPath);assert(report.passed);for(const[f,h]of Object.entries(report.sourceFiles))assert.equal(sha(f),h,'Correction evidence stale: '+f);assert(m.qaScopeSettled===true,'Wait for all QA findings before freezing');
 const files=[...Object.keys(m.changedFiles),...Object.keys(m.supportFiles),manifestPath,reportPath];assert.equal(new Set(files).size,files.length);const expected={...b.gitBlobs},uploads=[];
 for(const f of files.sort()){const bytes=fs.readFileSync(f);expected[f]=blob(bytes);uploads.push({path:f,localPath:path.join(root,f),gitBlobSHA:expected[f],sha256:sha(f),size:bytes.length,action:b.gitBlobs[f]?'modify':'add'});}
 fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'upload-manifest.json'),JSON.stringify({schemaVersion:1,baseCommit:m.baseCommit,baselineBlobCount:2686,expectedBlobCount:Object.keys(expected).length,uploadFileCount:uploads.length,totalUploadBytes:uploads.reduce((n,f)=>n+f.size,0),deletedFiles:[],files:uploads,claims:{uploaded:false,merged:false,originalEvidencePreserved:true,enginesAndCorporaUnchanged:true,hostedPostFixVerified:false}},null,2)+'\n');fs.writeFileSync(path.join(out,'expected-final-tree.json'),JSON.stringify({schemaVersion:1,baseCommit:m.baseCommit,files:expected},null,2)+'\n');fs.writeFileSync(path.join(out,'release-allowlist.json'),JSON.stringify(files,null,2)+'\n');console.log(JSON.stringify({files:uploads.length,bytes:uploads.reduce((n,f)=>n+f.size,0),expectedBlobs:Object.keys(expected).length,deleted:0},null,2));process.exit(0);
}
const report={schemaVersion:1,passed:false,baseCommit:m.baseCommit,scope:'Presentation correction validation. Original complete release reports are preserved; unchanged engine/corpus proofs are reused by exact published-byte comparison.',before,sourceFiles:Object.fromEntries([manifestPath,baselinePath,...Object.keys(m.changedFiles),...Object.keys(m.supportFiles)].map(f=>[f,sha(f)])),commands:[],freshReports:{},metadataOverlay:[],claims:{originalAggregateRewritten:false,allEngineProofsFreshlyRerun:false,affectedFamilyEngineAndControllerRerun:true,browserGeometryVerifiedByThisCommand:false,hostedPostFixVerified:false},reusedEvidence:['expansion120-aggregate-verification-report.json','expansion120-independent-review.json','expansion120-historical-recovery-report.json']};
const copy=fs.mkdtempSync(path.join(os.tmpdir(),'arcade270-presentation-'));
function run(argv){const start=Date.now(),r=spawnSync(argv[0]==='node'?process.execPath:argv[0],argv.slice(1),{cwd:copy,encoding:'utf8',maxBuffer:64*1024*1024,env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'}});process.stdout.write(r.stdout||'');process.stderr.write(r.stderr||'');report.commands.push({argv,exitCode:r.status,seconds:+((Date.now()-start)/1000).toFixed(3),stdoutSHA256:digest(r.stdout||''),stderrSHA256:digest(r.stderr||''),tail:(r.stdout||'').slice(-1700)});assert.ifError(r.error);assert.equal(r.status,0,'Correction command failed: '+argv.join(' '));}
function overlay(f,mutator){const p=path.join(copy,f),old=fs.readFileSync(p),data=JSON.parse(old);mutator(data);const text=JSON.stringify(data,null,2)+'\n';fs.writeFileSync(p,text);report.metadataOverlay.push({file:f,publishedSHA256:digest(old),isolatedSHA256:digest(text),reason:'Disposable verification-only hash overlay for tested presentation bytes and freshly generated reports; original published manifest remains unchanged.'});}
try{
 for(const f of [...Object.keys(b.gitBlobs),...Object.keys(m.supportFiles),manifestPath]){fs.mkdirSync(path.dirname(path.join(copy,f)),{recursive:true});fs.copyFileSync(f,path.join(copy,f));}
 for(const f of m.affectedFreshReports)fs.rmSync(path.join(copy,f),{force:true});
 for(const argv of m.affectedCommands)run(argv);
 for(const f of m.affectedFreshReports){const p=path.join(copy,f);assert(fs.existsSync(p),'No fresh correction result: '+f);const data=json(p);assert(data.passed===true||data.status==='passed'||data.result==='pass','Affected report failed '+f);report.freshReports[f]={sha256:sha(p),data,kind:'fresh-current-runtime-test'};}
 // Existing verifiers keep all their substantive assertions. Only disposable
 // metadata hashes acknowledge the explicitly reviewed presentation changes.
 overlay('expansion120-preservation.json',d=>{const absent=Object.keys(d.files).filter(f=>!Object.hasOwn(b.gitBlobs,f));assert.deepEqual(absent,['games/action-common/test-results.txt'],'Only the previously excluded local test log may be absent from published baseline');delete d.files[absent[0]];});report.metadataOverlay.at(-1).reason='The original local snapshot references games/action-common/test-results.txt, which was never in the published2686-blob tree. Omit that log only in this disposable legacy snapshot; every actual published game/source remains protected.';
 const spec=json('expansion120-spec.json');
 for(const family of spec.families)overlay(family.releaseManifestPath,d=>{const hashes=d.sourceFiles||d.sourceHashes;for(const f of Object.keys(hashes))hashes[f]=sha(path.join(copy,f));});
 overlay('expansion120-manifest.json',d=>{for(const f of Object.keys(d.sourceFiles))d.sourceFiles[f]=sha(path.join(copy,f));});
 for(const f of ['expansion120-lobby-verification-report.json','expansion120-integration-verification-report.json'])fs.rmSync(path.join(copy,f),{force:true});
 run(['node','verify-expansion120-lobby.cjs']);
 for(const f of ['expansion120-lobby-verification-report.json','expansion120-integration-verification-report.json']){const data=json(path.join(copy,f));assert(data.passed);report.freshReports[f]={sha256:sha(path.join(copy,f)),data,kind:'fresh270-lobby-with-declared-disposable-metadata-overlay'};}
 // Restore disposable evidence/metadata before exercising the real binding
 // gate on intentional corruptions. No production file is ever mutated.
 for(const f of [...report.metadataOverlay.map(r=>r.file),...m.affectedFreshReports,'expansion120-lobby-verification-report.json','expansion120-integration-verification-report.json'])fs.copyFileSync(path.join(root,f),path.join(copy,f));
 report.negativeBindingChecks=[];
 for(const [file,expected]of [['games/social120-common/core.js','Unexpected modification to published file'],['games/social120-common/style.css','Unbound correction bytes']]){const p=path.join(copy,file),original=fs.readFileSync(p);try{fs.writeFileSync(p,Buffer.concat([original,Buffer.from('\n/* intentional verification mutation */\n')]));const r=spawnSync(process.execPath,['verify-expansion120-presentation.cjs','--bindings'],{cwd:copy,encoding:'utf8'});assert.notEqual(r.status,0,'Binding gate wrongly accepted '+file);assert(((r.stdout||'')+(r.stderr||'')).includes(expected),'Wrong rejection reason for '+file);report.negativeBindingChecks.push({file,passed:true,expectedRejection:expected});}finally{fs.writeFileSync(p,original);}}
 report.after=bindings();for(const[f,h]of Object.entries(report.sourceFiles))assert.equal(sha(f),h,'Source changed during correction checks: '+f);report.passed=true;
}catch(e){report.error=String(e.stack||e);process.exitCode=1;console.error(e.stack||e);}
finally{fs.rmSync(copy,{recursive:true,force:true});fs.writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');}
console.log((report.passed?'PASS':'FAIL')+': reviewed presentation correction, affected family tests,270-lobby and exact original-release preservation. Browser geometry is a separate gate.');
