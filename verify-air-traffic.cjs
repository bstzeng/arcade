#!/usr/bin/env node
'use strict';
// Additive game verification. All test writes are isolated from published assets.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto'),assert=require('node:assert/strict'),vm=require('node:vm'),{spawnSync}=require('node:child_process');
process.chdir(__dirname);
const registry=require('./verify-lobby.cjs');
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const normalize=value=>JSON.parse(JSON.stringify(value));
const preservation=JSON.parse(fs.readFileSync('air-traffic-preservation.json','utf8'));
assert.equal(preservation.originalGames,69);
assert.equal(preservation.gameIds.length,69);
assert.equal(new Set(preservation.gameIds).size,69);
assert.equal(Object.keys(preservation.assets).length,772);
assert.equal(Object.keys(preservation.assets).filter(file=>/^games\/[a-z0-9-]+\.html$/.test(file)).length,69);
function preserve(){
 for(const [file,sha] of Object.entries(preservation.assets))assert.equal(hash(file),sha,'Prior game asset changed: '+file);
 assert.deepEqual(normalize(registry.games.slice(0,69)),preservation.originalRegistry,'Prior game cards changed or reordered');
 for(const [key,art]of Object.entries(preservation.originalArt))assert.equal(registry.artMarkup[key],art,'Prior card artwork changed: '+key);
}
preserve();
assert.equal(registry.games.length,70);
const entry=registry.games.find(game=>game.id==='air-traffic');
assert.equal(entry.title,'空中指揮所');assert.equal(entry.category,'strategy');assert.equal(entry.url,'./games/air-traffic.html');
assert.equal(entry.status,'ready');assert.equal(entry.art,'air-traffic');assert.equal(entry.word,'AIR TRAFFIC CONTROL');
const directory=path.join(__dirname,'games','air-traffic');
for(const file of ['maps.js','engine.js','app.js','style.css','README.md','test.cjs','test-ui.cjs','audit.test.cjs'])assert(fs.existsSync(path.join(directory,file)),'Missing new game asset: '+file);
const files=fs.readdirSync(directory).filter(file=>fs.statSync(path.join(directory,file)).isFile()).sort();
const before=Object.fromEntries(files.map(file=>[file,hash(path.join(directory,file))]));
const mapData=require('./games/air-traffic/maps.js');
assert.equal(mapData.maps.length,8);assert.equal(mapData.width,1000);assert.equal(mapData.height,700);
assert.equal(new Set(mapData.maps.map(map=>map.id)).size,8,'Duplicate map IDs');
assert.equal(new Set(mapData.maps.map(map=>map.biome)).size,8,'Each map should have its own scenery');
assert.equal(new Set(mapData.maps.map(map=>JSON.stringify(map.airports.map(a=>[a.x,a.y,a.heading])))).size,8,'Duplicate airport geometry');
for(const map of mapData.maps){
 assert(map.name&&map.en);assert(map.airports.length>=2&&map.airports.length<=4);
 assert.equal(new Set(map.airports.map(a=>a.id)).size,map.airports.length);
 assert(Number.isInteger(map.targetLandings)&&map.targetLandings>0);assert(map.spawnInterval>0);
 for(const airport of map.airports){assert(Number.isFinite(airport.heading));assert(airport.x>0&&airport.x<mapData.width);assert(airport.y>0&&airport.y<mapData.height);}
}

const report={passed:false,build:registry.GAME_BUILD,registryCount:70,newGames:1,maps:mapData.maps.map(map=>({id:map.id,name:map.name,biome:map.biome,airports:map.airports.length})),preservedOriginalGames:69,preservedOriginalAssets:772,preservedOriginalCardsAndArtwork:true,baseCommit:preservation.baseCommit,unchangedContent:{puzzleLevels:2000,cardDeals:250,tabletopGames:12},claims:{realTimeGame:true,fixedPuzzleLevelCountNotApplicable:true,controllerTestsAreNotBrowserVisualTests:true,browserTestingClaimed:false},entrySHA256:hash('games/air-traffic.html'),files:before,suites:[]};
let temporary;
try{
 temporary=fs.mkdtempSync(path.join(os.tmpdir(),'arcade-air-traffic-'));
 const copy=path.join(temporary,'games','air-traffic');
 fs.mkdirSync(path.dirname(copy),{recursive:true});fs.cpSync(directory,copy,{recursive:true});fs.copyFileSync('games/air-traffic.html',path.join(temporary,'games','air-traffic.html'));
 for(const file of ['test.cjs','test-ui.cjs','audit.test.cjs']){
  console.log('\n> node games/air-traffic/'+file);
  const start=Date.now(),result=spawnSync(process.execPath,[path.join(copy,file)],{cwd:temporary,encoding:'utf8',maxBuffer:30*1024*1024,env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'}});
  if(result.stdout)process.stdout.write(result.stdout);if(result.stderr)process.stderr.write(result.stderr);
  report.suites.push({command:'node games/air-traffic/'+file,passed:result.status===0,seconds:+((Date.now()-start)/1000).toFixed(3),output:(result.stdout||'').trim(),stderr:(result.stderr||'').trim()});
  if(result.error||result.status!==0)throw result.error||Error('Air Traffic Control '+file+' failed');
 }
 for(const [file,sha]of Object.entries(before)){
  assert.equal(hash(path.join(directory,file)),sha,'New game tests mutated source file: '+file);
  if(/\.(?:js|cjs)$/.test(file))new vm.Script(fs.readFileSync(path.join(directory,file),'utf8'),{filename:'air-traffic/'+file});
 }
 preserve();report.passed=true;
}finally{
 if(temporary)fs.rmSync(temporary,{recursive:true,force:true});
 fs.writeFileSync('air-traffic-verification-report.json',JSON.stringify(report,null,2)+'\n');
}
console.log('\nPASS: Air Traffic Control rules and controller suites; 70 lobby entries; all 772 prior game assets and 69 prior cards/artwork unchanged.');
