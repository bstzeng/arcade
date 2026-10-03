'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto'),meta=require('./metadata.json'),base=path.join(__dirname,'../..');
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(path.join(base,f))).digest('hex');
const files={};
function addTree(relative){for(const entry of fs.readdirSync(path.join(base,relative),{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){const f=relative+'/'+entry.name;if(entry.isDirectory())addTree(f);else if(!['games/social120-common/release-manifest.json','games/social120-common/source-hashes.json'].includes(f))files[f]=hash(f);}}
addTree('games/social120-common');
for(const[id]of meta){addTree('games/'+id);files['games/'+id+'.html']=hash('games/'+id+'.html');}
fs.writeFileSync(path.join(__dirname,'source-hashes.json'),JSON.stringify(files,null,2));
const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,'release-manifest.json'),'utf8'));
manifest.sourceFiles={...files,'games/social120-common/source-hashes.json':hash('games/social120-common/source-hashes.json')};
manifest.packageFiles=[...Object.keys(manifest.sourceFiles),'games/social120-common/release-manifest.json'];
manifest.verification=JSON.parse(fs.readFileSync(path.join(__dirname,'verification-report.json'),'utf8')).totals;
manifest.uiControllerChecks={games:15,kind:'VM DOM simulation only',passed:JSON.parse(fs.readFileSync(path.join(__dirname,'ui-verification-report.json'),'utf8')).passed};
manifest.coverArt={count:15,format:'SVG',purpose:'Mechanic-specific lobby art; no external assets'};
fs.writeFileSync(path.join(__dirname,'release-manifest.json'),JSON.stringify(manifest,null,2));
console.log('Frozen',Object.keys(manifest.sourceFiles).length,'package files plus manifest; browser QA remains not run.');
