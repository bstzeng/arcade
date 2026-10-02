#!/usr/bin/env node
'use strict';
// Negative tests mutate disposable copies only, then demand the specific gate fail.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const baseline=JSON.parse(fs.readFileSync(path.join(__dirname,'expansion-preservation.json'),'utf8')).baselineFiles;
const root=__dirname,copy=fs.mkdtempSync(path.join(os.tmpdir(),'arcade150-negative-')),report={schemaVersion:1,passed:false,scope:'Intentional corruption of disposable copies; no runtime/browser test claim',checks:[]};
const original=new Map(),mutate=(file,fn)=>{if(!original.has(file))original.set(file,fs.readFileSync(path.join(copy,file)));const p=path.join(copy,file);fs.writeFileSync(p,fn(fs.readFileSync(p,'utf8')));};
const mutateJSON=(file,fn)=>mutate(file,text=>{const data=JSON.parse(text);fn(data);return JSON.stringify(data,null,2)+'\n';});
function trial(name,change,command,expected){
 try{change();const result=spawnSync(process.execPath,[command],{cwd:copy,encoding:'utf8',maxBuffer:3*1024*1024});const text=(result.stdout||'')+(result.stderr||'');assert.notEqual(result.status,0,name+' was wrongly accepted');assert(expected.test(text),name+' failed for the wrong reason: '+text.slice(-1000));report.checks.push({name,passed:true,expectedFailure:expected.source});}
 finally{for(const [file,bytes]of original)fs.writeFileSync(path.join(copy,file),bytes);original.clear();}
}
try{
 fs.cpSync(root,copy,{recursive:true,filter:file=>Object.hasOwn(baseline,path.relative(root,file).replaceAll('\\','/'))||!/(?:^|\/)(?:\.git|\.venv|node_modules|__pycache__|screenshots|test-results|playwright-report)(?:\/|$)|\.(?:pyc|log|tmp)$|(?:^|\/)test-results\.txt$/.test(file)});
 trial('Changed original registry record',()=>mutate('app.js',s=>s.replace("title: '數字實驗室'","title: 'changed original title'")),'verify-lobby.cjs',/All 70 original records/);
 trial('Changed original artwork',()=>mutate('app.js',s=>s.replace('// Browse by how a game plays',"artMarkup.tiles = 'changed old artwork';\n// Browse by how a game plays")),'verify-lobby.cjs',/Original artwork unchanged: tiles/);
 trial('Changed original game asset',()=>mutate('games/number-lab.html',s=>s+'\n<!-- changed -->\n'),'verify-lobby.cjs',/Game asset changed: games\/number-lab\.html/);
 trial('Lost new primary-category assignment',()=>mutate('app.js',s=>s.replace(", 'chess'",'')),'verify-lobby.cjs',/149 !== 150/);
 trial('Repeated new artwork',()=>mutate('app.js',s=>s.replace('// Browse by how a game plays',"artMarkup['expansion-go9'] = artMarkup['expansion-chess'];\n// Browse by how a game plays")),'verify-lobby.cjs',/Eighty distinct new game illustrations/);
 trial('Missing game asset reference',()=>mutate('games/chess.html',s=>s+'\n<script src="./missing-expansion-test.js"></script>\n'),'verify-lobby.cjs',/Missing local reference.*missing-expansion-test/);
 trial('False forced-win label for card scenario',()=>mutateJSON('expansion-manifest.json',m=>{m.games.find(g=>g.id==='big-two').proof.kind='forced-strategy';}),'verify-expansion.cjs',/Card scenarios cannot be promoted/);
 trial('Missing proof with otherwise refreshed source hash',()=>{mutateJSON('games/twenty-four/proofs.json',proofs=>{proofs.pop();});mutateJSON('expansion-manifest.json',m=>{m.sourceFiles['games/twenty-four/proofs.json']=hash(path.join(copy,'games/twenty-four/proofs.json'));});},'verify-expansion.cjs',/twenty-four proof coverage/);
 report.passed=true;
}finally{fs.rmSync(copy,{recursive:true,force:true});report.sourceFiles=Object.fromEntries(['verify-integration-regressions.cjs','verify-lobby.cjs','verify-expansion.cjs','app.js','expansion-manifest.json','expansion-preservation.json'].map(f=>[f,hash(path.join(root,f))]));fs.writeFileSync(path.join(root,'expansion-integration-regression-report.json'),JSON.stringify(report,null,2)+'\n');}
console.log('PASS: '+report.checks.length+' intentional integration corruptions rejected for the expected reason; original source untouched.');
