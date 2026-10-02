#!/usr/bin/env node
'use strict';
// Complete reproducible offline audit; Node.js 18+ and Python 3 only.
// Historical suites run in isolated source copies, retaining their own batch claims.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto'),{spawnSync}=require('node:child_process');
process.chdir(__dirname);
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const registrySource=fs.readFileSync('app.js','utf8'),build=registrySource.match(/const GAME_BUILD = '([^']+)'/)[1];
const report={passed:false,build,registryCount:70,cardDeals:250,puzzleLevels:2000,tabletopGames:12,airTrafficMaps:8,claims:{offlineRulesAndControllerTests:true,browserVisualTestingClaimed:false,historicalEvidenceRegeneratedInIsolation:true,historicalPublishedReportsPreserved:true},sourceFiles:{},suites:[]};
for(const file of ['app.js','index.html','styles.css','verify-all.cjs','verify-lobby.cjs','verify-air-traffic.cjs','air-traffic-preservation.json'])report.sourceFiles[file]=hash(file);
try{
 for(const [file,output] of [['verify-cards.cjs',null],['verify-puzzles.cjs','puzzle-verification-report.json'],['verify-logic.cjs','logic-verification-report.json'],['verify-classics.cjs','classics-verification-report.json'],['verify-collection.cjs','collection-verification-report.json'],['verify-tabletop.cjs','tabletop-verification-report.json'],['verify-chinese-chess.cjs','chinese-chess-verification-report.json'],['verify-air-traffic.cjs','air-traffic-verification-report.json']]){
  const copy=fs.mkdtempSync(path.join(os.tmpdir(),'arcade-audit-')),start=Date.now();
  try{
   fs.cpSync(__dirname,copy,{recursive:true,filter:f=>!/(?:^|\/)(?:\.git|node_modules|__pycache__)(?:\/|$)/.test(f)});
   const result=spawnSync(process.execPath,[path.join(copy,file)],{cwd:copy,stdio:'inherit',env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'}});
   const row={command:'node '+file,passed:result.status===0,seconds:+((Date.now()-start)/1000).toFixed(3),verifierSHA256:hash(file)};report.suites.push(row);
   if(result.error)throw result.error;if(result.status!==0)throw Error(file+' failed (status '+result.status+')');
   if(output){const generated=path.join(copy,output);row.freshReportSHA256=hash(generated);if(file==='verify-air-traffic.cjs'){fs.copyFileSync(generated,path.join(__dirname,output));row.publishedReport=output;}}
  }finally{fs.rmSync(copy,{recursive:true,force:true});}
 }
 report.passed=true;
}finally{fs.writeFileSync('aggregate-verification-report.json',JSON.stringify(report,null,2)+'\n');}
console.log('PASS: 70 games; 250 certified card deals; 2,000 verified puzzle levels; 12 multiplayer/AI tabletop games with 3 AI difficulties; Air Traffic Control with 8 maps. Each report describes its own historical batch and the current lobby.');
