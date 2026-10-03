#!/usr/bin/env node
'use strict';
// Local, read-only release preparation. Never uploads, deletes or publishes.
// Usage: node prepare-frontier120-release.cjs <remote-tree-tool-result.json> <output-directory>
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const T=require('./frontier120-tools.cjs');process.chdir(__dirname);
const [remoteInput,output]=process.argv.slice(2);assert(remoteInput&&output,'Supply exact remote baseline JSON and output directory');
const raw=JSON.parse(fs.readFileSync(remoteInput,'utf8'));const data=raw.tree?raw:JSON.parse(raw.structuredContent?.content||raw.content?.find(c=>c.type==='text')?.text||'{}');
assert.equal(data.sha,T.preservation.baseCommit,'Remote baseline commit mismatch');assert.equal(data.truncated,false,'Complete non-truncated remote tree required');
const remote=Object.fromEntries(data.tree.filter(x=>x.type==='blob').map(x=>[x.path,x.sha]));assert.equal(Object.keys(remote).length,2691,'Unexpected historical remote blob count');
const integrated=T.read('frontier120-manifest.json'),aggregate=T.read('frontier120-aggregate-verification-report.json');
assert.equal(aggregate.passed,true,'Complete aggregate must pass');assert.equal(aggregate.completeReleaseAudit,true,'Partial reports cannot authorize release preparation');
assert.equal(aggregate.families.length,8);assert(aggregate.historical?.passed,'Historical preservation gate must pass');assert.equal(aggregate.claims.allNewFamilyTestsFresh,true,'Every new family needs fresh execution');for(const row of aggregate.families){assert.equal(T.hash(row.manifestPath),row.manifestSHA256,'Family manifest changed after full aggregate');for(const[file,sha]of Object.entries(row.sourceFiles))assert.equal(T.hash(file),sha,'Family source changed after aggregate: '+file);}assert(aggregate.families.every(f=>f.passed));T.assertPreserved();
for(const [file,sha]of Object.entries(integrated.sourceFiles))assert.equal(T.hash(file),sha,'Source changed after catalog freeze: '+file);
for(const [file,sha]of Object.entries(aggregate.sourceFiles))assert.equal(T.hash(file),sha,'Aggregate source binding stale: '+file);
for(const reportPath of ['frontier120-integration-verification-report.json','frontier120-lobby-verification-report.json','frontier120-regression-verification-report.json']){const report=T.read(reportPath);assert.equal(report.passed,true,reportPath+' failed');for(const [file,sha]of Object.entries(report.sourceFiles||{}))assert.equal(T.hash(file),sha,reportPath+' stale source: '+file);}
const rootFiles=['app.js','index.html','styles.css','README.md','verify-all.cjs','frontier120-spec.json','frontier120-preservation.json','frontier120-baseline-root.json','frontier120-tools.cjs','integrate-frontier120.cjs','verify-frontier120.cjs','verify-frontier120-all.cjs','verify-frontier120-lobby.cjs','verify-frontier120-regressions.cjs','prepare-frontier120-release.cjs','frontier120-manifest.json','frontier120-aggregate-verification-report.json','frontier120-integration-verification-report.json','frontier120-lobby-verification-report.json','frontier120-regression-verification-report.json','frontier120-historical-verification-report.json'];

if(aggregate.recovery){assert.equal(aggregate.recovery.engineReceipt,'frontier120-engine-audit-receipt.json');assert.equal(T.hash(aggregate.recovery.engineReceipt),aggregate.recovery.engineReceiptSHA256);rootFiles.push('recover-frontier120-integration.cjs',aggregate.recovery.engineReceipt);}
const allow=new Set([...rootFiles,...Object.keys(integrated.sourceFiles)]);
for(const f of integrated.families){const manifest=T.read(f.manifest);for(const[file,h]of Object.entries({...manifest.evidenceFiles,...manifest.reportHashes}))assert.equal(T.hash(file),h,'Family evidence changed after freeze: '+file);for(const p of [f.catalog,f.manifest,...(f.freshReports||[]),...Object.keys(manifest.evidenceFiles||{}),...Object.keys(manifest.reportHashes||{})])allow.add(p);}
// Independently reviewed evidence may be added only after the release owner has
// written a source-bound report; this script refuses absent or stale bindings.
assert(fs.existsSync('frontier120-independent-review.json'),'Source-bound independent review is required before release preparation');
for(const report of ['frontier120-independent-review.json','frontier120-browser-verification-report.json'])if(fs.existsSync(report)){const d=T.read(report);assert(d.passed===true||d.status==='passed',report+' does not pass');assert(d.sourceFiles&&Object.keys(d.sourceFiles).length,report+' requires exact tested-source bindings');for(const[p,sha]of Object.entries(d.sourceFiles))assert.equal(T.hash(p),sha,report+' source changed: '+p);allow.add(report);for(const[f,h]of Object.entries(d.reportFiles||{})){assert.equal(T.hash(f),h,'Independent supporting evidence stale '+f);allow.add(f);}for(const f of Object.keys(d.sourceFiles||{}))allow.add(f);}
const sha1=bytes=>crypto.createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex');
const expected={...remote},uploads=[],unchanged=[];
for(const file of [...allow].sort()){
 T.safePath(file);assert(!/(?:^|\/)(?:\.git|node_modules|__pycache__|screenshots|playwright-report)(?:\/|$)|\.(?:pyc|tmp)$/.test(file),'Non-release file '+file);
 assert(!/\.(?:log|tmp)$|(?:^|\/)test-results\.txt$|art-preview\.png$/.test(file),'Local-only log/preview excluded: '+file);
 assert.notEqual(file,'games/action-common/test-results.txt','Do not publish excluded historical local-only artifact');
 const bytes=fs.readFileSync(file),sha=sha1(bytes),sha256=T.hash(file);
 if(remote[file]&&remote[file]!==sha)assert(T.allowedRootChanges.has(file),'Unauthorized historical change: '+file);
 expected[file]=sha;if(remote[file]===sha)unchanged.push(file);else uploads.push({path:file,localPath:path.join(__dirname,file),gitBlobSHA:sha,sha256,size:bytes.length,action:remote[file]?'modify':'add'});
}
for(const [file,sha]of Object.entries(remote))if(!allow.has(file)){
 // Remote-only historical logs are deliberately preserved by the expected tree.
 if(fs.existsSync(file)){const actual=sha1(fs.readFileSync(file));assert.equal(actual,sha,'Non-allowlisted historical blob changed locally: '+file);}
}
assert.equal(Object.keys(expected).length,Object.keys(remote).length+uploads.filter(f=>f.action==='add').length);assert(uploads.length>500,'Suspiciously small expansion package');
fs.mkdirSync(output,{recursive:true});
const upload={schemaVersion:1,baseCommit:data.sha,baselineBlobCount:2691,expectedBlobCount:Object.keys(expected).length,newGames:120,registryCount:390,uploadFileCount:uploads.length,totalUploadBytes:uploads.reduce((n,f)=>n+f.size,0),deletedFiles:[],files:uploads,unchangedAllowlistedFiles:unchanged,claims:{uploaded:false,merged:false,hostedVerified:false,independentAuditReportIncluded:allow.has('frontier120-independent-review.json'),browserReportIncluded:allow.has('frontier120-browser-verification-report.json')}};
fs.writeFileSync(path.join(output,'upload-manifest.json'),JSON.stringify(upload,null,2)+'\n');fs.writeFileSync(path.join(output,'expected-final-tree.json'),JSON.stringify({schemaVersion:1,baseCommit:data.sha,files:expected},null,2)+'\n');fs.writeFileSync(path.join(output,'release-allowlist.json'),JSON.stringify([...allow].sort(),null,2)+'\n');
console.log(JSON.stringify({uploads:uploads.length,bytes:upload.totalUploadBytes,expectedBlobs:upload.expectedBlobCount,historicalPathsRetained:2691,historicalUnchangedBlobs:2691-uploads.filter(f=>f.action==='modify').length,allowedRootModifications:uploads.filter(f=>f.action==='modify').length,deleted:0,publicationPerformed:false},null,2));
