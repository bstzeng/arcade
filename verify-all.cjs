#!/usr/bin/env node
'use strict';
// Complete reproducible offline audit; Node.js 18+ and Python 3 only.
// Historical suites run in isolated source copies, retaining their own batch claims.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),{spawnSync}=require('node:child_process');
process.chdir(__dirname);
for(const [file,report] of [['verify-cards.cjs',null],['verify-puzzles.cjs','puzzle-verification-report.json'],['verify-logic.cjs','logic-verification-report.json'],['verify-classics.cjs','classics-verification-report.json'],['verify-collection.cjs','collection-verification-report.json']]){
 const copy=fs.mkdtempSync(path.join(os.tmpdir(),'arcade-audit-'));
 try{
  fs.cpSync(__dirname,copy,{recursive:true,filter:f=>!/(?:^|\/)(?:\.git|node_modules|__pycache__)(?:\/|$)/.test(f)});
  const result=spawnSync(process.execPath,[path.join(copy,file)],{cwd:copy,stdio:'inherit',env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'}});
  if(result.error)throw result.error;if(result.status!==0)throw Error(file+' failed (status '+result.status+')');
  if(report)fs.copyFileSync(path.join(copy,report),path.join(__dirname,report));
 }finally{fs.rmSync(copy,{recursive:true,force:true});}
}
console.log('PASS: 57 games; 250 certified card deals; 2,000 verified puzzle levels. Each report describes its own historical 500-level batch and the current lobby.');
