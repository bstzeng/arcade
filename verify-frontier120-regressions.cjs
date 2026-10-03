#!/usr/bin/env node
'use strict';
// Each mutation occurs in a disposable site copy and must fail for its reason.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process'),T=require('./frontier120-tools.cjs');
const root=__dirname,copy=fs.mkdtempSync(path.join(os.tmpdir(),'arcade390-negative-')),report={schemaVersion:1,passed:false,scope:'Negative integration corruption checks on disposable files only',checks:[]},original=new Map(),bindings=Object.fromEntries(['verify-frontier120-regressions.cjs','verify-frontier120.cjs','frontier120-tools.cjs','frontier120-manifest.json','app.js'].map(f=>[f,T.hash(f)]));
function edit(file,fn){const p=path.join(copy,file);if(!original.has(p))original.set(p,fs.readFileSync(p));fs.writeFileSync(p,fn(fs.readFileSync(p,'utf8')));}
function trial(name,mutate,expected){try{mutate();const r=spawnSync(process.execPath,['verify-frontier120.cjs'],{cwd:copy,encoding:'utf8',maxBuffer:5*1024*1024});const text=(r.stdout||'')+(r.stderr||'');assert.notEqual(r.status,0,name+' wrongly passed');assert(expected.test(text),name+' failed for wrong reason: '+text.slice(-2000));report.checks.push({name,passed:true,expected:expected.source});}finally{for(const[p,b]of original)fs.writeFileSync(p,b);original.clear();}}
try{
 fs.cpSync(root,copy,{recursive:true,filter:p=>!/(?:^|\/)(?:node_modules|__pycache__|\.git|screenshots|test-results)(?:\/|$)/.test(p)});
 trial('Historical registry mutation',()=>edit('app.js',s=>s.replace("title: '數字實驗室'","title: '篡改'")),/All 270 historical registry/);
 trial('Wrong new title',()=>edit('app.js',s=>s.replace('"title":"暴風雪避難所"','"title":"錯誤遊戲"')),/暴風雪避難所/);
 trial('Changed engine with stale evidence',()=>edit('games/physics120-common/engine.js',s=>s+'\n// corruption\n'),/stale source/);
 trial('Missing witness corpus record',()=>edit('games/blizzard-shelter/proofs.json',s=>{const a=JSON.parse(s);a.pop();return JSON.stringify(a);}),/stale source/);
 trial('Missing primary assignment',()=>edit('app.js',s=>s.replace('"gameIds":["blizzard-shelter",','"gameIds":[')),/TypeError|primary|Cannot read properties/);
 trial('Lost historical asset',()=>edit('games/number-lab.html',s=>s+'\n<!-- corruption -->'),/Historical file changed/);
 for(const[f,h]of Object.entries(bindings))assert.equal(T.hash(f),h,'Source changed during negative checks '+f);report.passed=true;
}finally{fs.rmSync(copy,{recursive:true,force:true});report.sourceFiles=bindings;fs.writeFileSync(path.join(root,'frontier120-regression-verification-report.json'),JSON.stringify(report,null,2)+'\n');}
console.log('PASS: '+report.checks.length+' intentional release corruptions rejected.');
