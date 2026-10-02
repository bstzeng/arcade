'use strict';
// A scoped correction check. Historical audit reports in the source tree are never rewritten.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'../..'),correction=require('./mobile-selector-correction-manifest.json'),release=require('./release-manifest.json');
const sha=text=>crypto.createHash('sha256').update(text).digest('hex'),fileSha=p=>sha(fs.readFileSync(p));let assertions=0;
const ok=(v,m)=>{assert(v,m);assertions++;},eq=(a,b,m)=>{assert.deepEqual(a,b,m);assertions++;};
const stylePath=path.join(root,correction.runtimeFiles[0].path),style=fs.readFileSync(stylePath,'utf8');
eq(sha(style),correction.runtimeFiles[0].afterSha256,'exact corrected CSS');
eq(style.split(correction.newRule).length-1,1,'exactly one correction');
eq(sha(style.replace(correction.newRule,correction.oldRule)),correction.runtimeFiles[0].beforeSha256,'reversing the mobile selector rule reconstructs the exact old stylesheet');
const start=style.indexOf('@media(max-width:480px)'),patch=style.indexOf(correction.newRule);let open=style.indexOf('{',start),depth=1,end=open+1;while(depth>0&&end<style.length){if(style[end]==='{')depth++;else if(style[end]==='}')depth--;end++;}
ok(start>=0&&patch>open&&patch<end,'all corrected declarations are within the mobile media block');
ok(correction.newRule.includes('flex:1 0 100%')&&correction.newRule.includes('width:100%'),'selector has full-row flex basis with shrinking disabled');
ok(correction.newRule.includes('.ac-select-label{flex:0 0 100%;width:100%}'),'label has a separate full row');
for(const item of correction.protectedFiles)eq(fileSha(path.join(root,item.path)),item.sha256,'protected prior artifact '+item.path);
eq(correction.protectedFiles.length,125);eq(release.games.length,10);
let missions=0,proofs=0;for(const game of release.games){const levels=JSON.parse(fs.readFileSync(path.join(root,game.levels))),witnesses=JSON.parse(fs.readFileSync(path.join(root,game.witnesses)));eq(levels.length,100,game.id+' corpus count');eq(Object.keys(witnesses).length,100,game.id+' witness count');missions+=levels.length;proofs+=Object.keys(witnesses).length;}
eq(missions,1000);eq(proofs,1000);
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'management-selector-regression-')),copyRoot=path.join(temp,'arcade'),copyGames=path.join(copyRoot,'games');fs.mkdirSync(copyGames,{recursive:true});
let controller,audit,staticReport;const commands=[];
try{
 for(const dir of ['challenge-common','management-common',...release.games.map(g=>g.id)])fs.cpSync(path.join(root,'games',dir),path.join(copyGames,dir),{recursive:true});
 for(const game of release.games)fs.copyFileSync(path.join(root,game.entry),path.join(copyRoot,game.entry));
 // Entry navigation and favicon are ordinary local references checked by the static suite.
 fs.copyFileSync(path.join(root,'index.html'),path.join(copyRoot,'index.html'));fs.copyFileSync(path.join(root,'favicon.svg'),path.join(copyRoot,'favicon.svg'));
 for(const script of ['controller-test.cjs','audit.cjs','static-test.cjs']){const result=spawnSync(process.execPath,[path.join(copyGames,'management-common',script)],{cwd:copyRoot,encoding:'utf8',maxBuffer:16*1024*1024});commands.push({argv:['node','games/management-common/'+script],exitCode:result.status,execution:'isolated temporary copy; source-tree historical reports untouched'});ok(result.status===0,script+' failed: '+result.stderr+'\n'+result.stdout);}
 controller=JSON.parse(fs.readFileSync(path.join(copyGames,'management-common/controller-report.json')));audit=JSON.parse(fs.readFileSync(path.join(copyGames,'management-common/aggregate-audit.json')));staticReport=JSON.parse(fs.readFileSync(path.join(copyGames,'management-common/static-report.json')));
 ok(controller.passed&&controller.games===10);ok(audit.passed&&audit.challenges===1000&&audit.legalWitnesses===1000);ok(staticReport.passed);
}finally{fs.rmSync(temp,{recursive:true,force:true});}
// Verify the isolated rerun really left every old report, rule and corpus byte intact.
for(const item of correction.protectedFiles)eq(fileSha(path.join(root,item.path)),item.sha256,'source artifact preserved after isolated rerun '+item.path);
const report={schemaVersion:1,id:correction.id,passed:true,scope:correction.scope,assertions,exactCssSha256:sha(style),desktopCssUnchanged:true,onlyMobileMediaRuleChanged:true,mobileLayoutDeclarationChecks:{widths:[333,400],selectorFullRow:true,selectorFlexShrink:0,labelSeparateRow:true,actualBrowserLayoutMeasurement:false},protectedPriorFiles:125,historicalReportsUnchanged:true,corpusUnchanged:{games:10,missions,proofs},isolatedController:{passed:true,assertions:controller.assertions,manualClicks:controller.clicks,manualWinLevels:['001','050','100'],games:controller.games},isolatedRules:{passed:true,assertions:audit.assertions,legalWitnesses:audit.legalWitnesses,witnessActions:audit.witnessActions,canonicalDistinct:audit.canonicalDistinct},isolatedStatic:{passed:true,checks:staticReport.checks},commands,browserQA:{status:'pending',note:'333/400 declaration checks and simulated DOM do not measure rendered widths. Live QA evidence must be recorded separately.'}};
fs.writeFileSync(path.join(__dirname,'mobile-selector-correction-report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
