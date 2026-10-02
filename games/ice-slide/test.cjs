'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const C=require('./engine.js'),levels=require('./levels.json');let transitions=0,hints=0;
for(const l of levels){
 const game=new C.Session(l);assert.equal(game.count,0);assert(!game.won);
 assert.equal(game.move(-1,0),false);assert.equal(game.move(0,4),false);assert.equal(game.move(0,'U'),false);assert.equal(game.count,0);
 for(const [r,d]of l.solution){const before=game.positions.slice(),count=game.count;assert(game.move(r,d));assert(game.undo());assert.deepEqual(game.positions,before);assert.equal(game.count,count);assert(game.move(r,d));transitions++;}
 assert(game.won);assert.equal(game.count,l.solution.length);assert(!game.move(0,0),'Cannot mutate completed game');assert(game.undo());assert(!game.won);game.restart();assert.deepEqual(game.positions,l.start);assert.equal(game.count,0);assert(!game.assisted);
 // Choose a legal first slide that differs from the stored solution, then ask from THIS board.
 let alt;for(let r=0;r<3&&!alt;r++)for(let d=0;d<4&&!alt;d++)if((r!==l.solution[0][0]||d!==l.solution[0][1])&&C.slide(game.b,game.positions,r,d))alt=[r,d];assert(alt);game.move(...alt);const divergence=game.positions.slice(),result=game.hint();assert.deepEqual(game.positions,divergence,'Hint must not mutate board');assert.equal(result.status,'solved');for(const m of result.moves)assert(game.move(...m));assert(game.won);hints++;game.restart();assert.deepEqual(game.positions,l.start);
 // Every impossible/no-op direction leaves both the state and move counter unchanged.
 let blocked=0;for(let r=0;r<3;r++)for(let d=0;d<4;d++)if(!C.slide(game.b,game.positions,r,d)){const old=game.positions.slice(),c=game.count;assert.equal(game.move(r,d),false);assert.deepEqual(game.positions,old);assert.equal(game.count,c);blocked++;}assert(blocked>0||l.size>=6);
}
assert.deepEqual(C.parseProgress('{broken',50),{version:1,last:0,records:{}});assert.deepEqual(C.parseProgress('null',50),{version:1,last:0,records:{}});assert.deepEqual(C.parseProgress('{"version":999}',50),{version:1,last:0,records:{}});const p=C.parseProgress('{"version":1,"last":1000,"records":{"1":{"cleared":true,"best":5},"2":{"best":-1},"51":{"best":3},"__proto__":{"best":1}}}',50);assert.equal(p.last,0);assert.equal(p.records[1].best,5);assert.equal(p.records[2],undefined);assert.equal(p.records[51],undefined);assert.equal(Object.getPrototypeOf(p.records),Object.prototype);
const impossible={size:3,walls:[1,4,7],start:[0,3,6],target:0,goal:2};assert.equal(new C.Session(impossible).hint().status,'impossible');assert.equal(C.search(C.board(levels[49]),levels[49].start,{limit:2}).status,'limit');assert.equal(C.search(C.board(levels[0]),[0,0,0]).status,'invalid');
const src=fs.readFileSync(path.join(__dirname,'levels.js'),'utf8'),context={window:{}};vm.runInNewContext(src,context);assert.equal(JSON.stringify(context.window.ICE_LEVELS),JSON.stringify(levels),'Browser data matches certified JSON');
console.log(`PASS actual gameplay engine: ${levels.length} solutions, ${transitions} slides + undo/replay, ${hints} off-path hints, restart, invalid/no-op moves, solved lock, storage recovery, impossible and bounded searches.`);
