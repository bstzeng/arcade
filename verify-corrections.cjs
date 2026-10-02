#!/usr/bin/env node
'use strict';
// A focused presentation correction audit, not a rerun of the 18-suite release.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
const root=__dirname,read=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex');
const digest=text=>crypto.createHash('sha256').update(text).digest('hex');
const generated=new Set(['expansion-correction-verification-report.json','expansion-current-aggregate-verification-report.json']);
const incidental=/(?:^|\/)(?:\.git|\.venv|node_modules|__pycache__|screenshots|test-results|playwright-report)(?:\/|$)|\.(?:pyc|log|tmp)$|(?:^|\/)test-results\.txt$/;
function verifyBindings(){
 const manifest=read('expansion-correction-manifest.json'),expansion=read('expansion-manifest.json'),reviews=read('expansion-independent-review.json');
 assert.equal(manifest.fullHistoricalSuitesRerun,false);
 const permitted=new Set([...Object.keys(manifest.changedGameFiles),...manifest.rootIntegrationChanges]);
 const seen=[];function walk(dir){for(const entry of fs.readdirSync(path.join(root,dir),{withFileTypes:true})){const file=path.posix.join(dir,entry.name);if(!Object.hasOwn(manifest.baselineFiles,file)&&incidental.test(file))continue;if(entry.isDirectory())walk(file);else if(entry.isFile())seen.push(file);else assert.fail('Unsupported release file '+file);}}
 walk('');
 for(const [file,sha]of Object.entries(manifest.baselineFiles)){
  assert(seen.includes(file),'Published file deleted: '+file);
  if(!permitted.has(file))assert.equal(hash(file),sha,'Unrelated published file changed: '+file);
 }
 for(const file of seen)if(!Object.hasOwn(manifest.baselineFiles,file))assert(permitted.has(file)||generated.has(file),'Unlisted new release file: '+file);
 for(const [file,change]of Object.entries(manifest.changedGameFiles)){
  assert.equal(change.beforeSHA256,manifest.baselineFiles[file]||null,'Incorrect baseline binding: '+file);
  assert.equal(hash(file),change.afterSHA256,'Frozen corrective source changed: '+file);
 }
 for(const [file,sha]of Object.entries(expansion.sourceFiles))assert.equal(hash(file),sha,'Expansion manifest stale: '+file);
 for(const [file,sha]of Object.entries(manifest.preservedEvidence))assert.equal(hash(file),sha,'Historical evidence changed: '+file);
 const bound=[];
 for(const [name,review]of Object.entries(reviews.reviews)){
  assert.equal(review.status,'passed');let unchanged=0;const corrected=[],historicalLocalEvidence=[];
  for(const [file,sha]of Object.entries(review.sourceFiles)){
   if(!Object.hasOwn(manifest.baselineFiles,file)){
    assert.equal(manifest.excludedHistoricalLocalEvidence[file],sha,'Unpublished audit source must be explicitly classified: '+file);
    assert(/\.log$/.test(file),'Only unpublished local audit logs may be omitted: '+file);
    if(fs.existsSync(path.join(root,file)))assert.equal(hash(file),sha,'Historical local log changed: '+file);
    historicalLocalEvidence.push({path:file,sha256:sha,shippedInBaseline:false});continue;
   }
   assert.equal(manifest.baselineFiles[file],sha,'Independent audit did not bind the published baseline: '+file);
   if(hash(file)===sha){unchanged++;continue;}
   const change=manifest.changedGameFiles[file];assert(change,'Unreviewed independent-audit source drift: '+file);
   assert.equal(change.beforeSHA256,sha);assert.equal(change.afterSHA256,hash(file));
   assert(['presentation-runtime','source-binding-metadata','documentation'].includes(change.kind),'Rules or corpus cannot reuse historical evidence: '+file);
   corrected.push({path:file,previousSHA256:sha,currentSHA256:change.afterSHA256,kind:change.kind,correction:change.correction});
  }
  bound.push({review:name,unchangedSourceBindings:unchanged,correctedPresentationBindings:corrected,historicalLocalEvidence,originalReviewPreserved:true});
 }
 // Every shipped engine, corpus and certificate remains the exact published byte sequence.
 const protectedFiles=Object.keys(manifest.baselineFiles).filter(file=>/^games\//.test(file)&&/(?:^|\/)(?:engine\.(?:js|cjs)|levels\.(?:js|json)|proofs\.json|proof-claims\.json|witnesses\.json|certificates\.json)$/.test(file));
 for(const file of protectedFiles)assert.equal(hash(file),manifest.baselineFiles[file],'Rules/corpus/proof changed in a presentation correction: '+file);
 return {manifest,independentAuditBindings:bound,protectedRuleCorpusProofFiles:protectedFiles.length,baselineFilesChecked:Object.keys(manifest.baselineFiles).length};
}
function run(){
 const start=Date.now(),binding=verifyBindings(),m=binding.manifest;
 const report={schemaVersion:1,passed:false,scope:'Focused presentation regressions and exact source-preservation checks after the 150-game release',baseCommit:m.baseCommit,fullHistoricalSuitesRerun:false,priorFullAggregate:{path:'expansion-aggregate-verification-report.json',sha256:hash('expansion-aggregate-verification-report.json'),passed:read('expansion-aggregate-verification-report.json').passed},priorIndependentReview:{path:'expansion-independent-review.json',sha256:hash('expansion-independent-review.json')},baselineFilesChecked:binding.baselineFilesChecked,protectedRuleCorpusProofFiles:binding.protectedRuleCorpusProofFiles,independentAuditBindings:binding.independentAuditBindings,corrections:m.corrections,browserQA:{status:'corrective-retest-pending',claim:'The release owner must check the deployed corrected presentation in an actual browser; these static/DOM tests do not establish browser geometry.'},sourceFiles:{},suites:[],failures:[]};
 const inputs=['README.md','verify-all.cjs','verify-corrections.cjs','verify-expansion.cjs','verify-integration-regressions.cjs','expansion-manifest.json','expansion-correction-manifest.json',...Object.keys(m.changedGameFiles)];
 for(const file of inputs)report.sourceFiles[file]=hash(file);
 try{
  for(const suite of m.suites){
   const copy=fs.mkdtempSync(path.join(os.tmpdir(),'arcade-presentation-')),row={id:suite.id,passed:false,commands:[],freshReports:{}};report.suites.push(row);
   try{
    fs.cpSync(root,copy,{recursive:true,filter:file=>Object.hasOwn(m.baselineFiles,path.relative(root,file).replaceAll('\\','/'))||!incidental.test(file)});
    for(const argv of suite.commands){
     assert.equal(argv[0],'node');const result=spawnSync(process.execPath,argv.slice(1),{cwd:copy,encoding:'utf8',maxBuffer:40*1024*1024,env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'}}),stdout=result.stdout||'',stderr=result.stderr||'';
     row.commands.push({argv,exitCode:result.status,stdoutSHA256:digest(stdout),stderrSHA256:digest(stderr),stdoutTail:stdout.slice(-1800),stderrTail:stderr.slice(-1200)});
     if(stdout)process.stdout.write(stdout);if(stderr)process.stderr.write(stderr);if(result.error)throw result.error;assert.equal(result.status,0,suite.id+': '+argv.join(' '));
    }
    for(const file of suite.reports||[]){const bytes=fs.readFileSync(path.join(copy,file));row.freshReports[file]={sha256:digest(bytes),result:JSON.parse(bytes)};}
    row.passed=true;
   }catch(error){row.error=String(error);report.failures.push({suite:suite.id,error:String(error)});}
   finally{fs.rmSync(copy,{recursive:true,force:true});}
  }
  const negativeCopy=fs.mkdtempSync(path.join(os.tmpdir(),'arcade-correction-scope-'));
  try{
   fs.cpSync(root,negativeCopy,{recursive:true,filter:file=>Object.hasOwn(m.baselineFiles,path.relative(root,file).replaceAll('\\','/'))||!incidental.test(file)});
   const cases=[
    {id:'unrelated-rule-edit',file:'games/pin-and-ball/engine.js',message:'Unrelated published file changed'},
    {id:'post-freeze-css-edit',file:'games/numeric-common/style.css',message:'Frozen corrective source changed'},
    {id:'historical-aggregate-edit',file:'expansion-aggregate-verification-report.json',message:'Unrelated published file changed'},
    {id:'unlisted-new-file',file:'unexpected-correction-file.txt',message:'Unlisted new release file'}
   ];
   const row={id:'correction-scope-negative-regressions',passed:false,cases:[]};report.suites.push(row);
   for(const test of cases){
    const target=path.join(negativeCopy,test.file),original=fs.existsSync(target)?fs.readFileSync(target):null;
    try{
     fs.writeFileSync(target,Buffer.concat([original||Buffer.alloc(0),Buffer.from('\nUNAUTHORIZED TEST MUTATION\n')]));
     const result=spawnSync(process.execPath,['-e',"require('./verify-corrections.cjs').verifyBindings()"],{cwd:negativeCopy,encoding:'utf8'});
     assert.notEqual(result.status,0,test.id+' unexpectedly passed');assert((result.stderr||'').includes(test.message),test.id+' failed for an unrelated reason');row.cases.push({id:test.id,rejected:true});
    }finally{if(original)fs.writeFileSync(target,original);else fs.rmSync(target,{force:true});}
   }
   row.passed=true;
  }finally{fs.rmSync(negativeCopy,{recursive:true,force:true});}
  verifyBindings();for(const [file,sha]of Object.entries(report.sourceFiles))assert.equal(hash(file),sha,'Source changed while correction tests ran: '+file);
  assert.equal(report.failures.length,0,'Focused correction regression failed');report.passed=true;
 }catch(error){report.failures.push({suite:'correction-scope-and-preservation',error:String(error)});throw error;}
 finally{report.seconds=+((Date.now()-start)/1000).toFixed(3);fs.writeFileSync(path.join(root,'expansion-correction-verification-report.json'),JSON.stringify(report,null,2)+'\n');}
 console.log('PASS scoped presentation correction: historical aggregate preserved; engines/corpora/proofs unchanged; affected UI and integration checks passed. This is not a new 18-suite run.');
 return report;
}
module.exports={verifyBindings,run};if(require.main===module)run();
