/* Starweave Mage — original, resolution-independent Canvas illustration.
 * All geometry and visual assets are original. No external images or fonts.
 * Actors and terrain use unbounded world coordinates; a 960 × 540 camera follows
 * the mage. The host owns canvas/DPR scaling. No screen-fixed arena geometry.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.StarweaveRender = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const W = 960, H = 540, TAU = Math.PI * 2;
  const BIOMES = [
    {name:'薄荷秘林',sub:'MINTWOOD GLADE',ground:'#bdd5bc',light:'#e3e8c8',dark:'#6c947c',path:'#e6d9b9',edge:'#789479',leaf:'#4c8874',leaf2:'#80b39b',leaf3:'#b4d4af',accent:'#d7efb4',portal:'#91ebcf',water:'#8bb9b0',rune:'#52887d'},
    {name:'紫霧蕈窟',sub:'VIOLET SPORE HOLLOW',ground:'#9c9fb9',light:'#d8cbdf',dark:'#626486',path:'#c6b6bd',edge:'#79708f',leaf:'#666081',leaf2:'#9a8baa',leaf3:'#bdb1c6',accent:'#efc5e5',portal:'#d9b9ff',water:'#8885aa',rune:'#8a719d'},
    {name:'霜晶遺跡',sub:'FROSTGLASS RUINS',ground:'#c1d8e0',light:'#eef0de',dark:'#80aab5',path:'#e3e6d8',edge:'#89b0b9',leaf:'#5f91a1',leaf2:'#9fc4c7',leaf3:'#dce8dc',accent:'#f9f4d3',portal:'#b0f3ff',water:'#91becd',rune:'#76a1b2'},
    {name:'琥珀荒原',sub:'AMBERWIND WILDS',ground:'#cbb480',light:'#efdab0',dark:'#9f805b',path:'#ebd2a8',edge:'#ae946d',leaf:'#a26e53',leaf2:'#d59865',leaf3:'#ebc889',accent:'#f8e3a1',portal:'#ffe0a2',water:'#b4a780',rune:'#a98555'},
    {name:'午夜藏書閣',sub:'THE MIDNIGHT ARCHIVE',ground:'#777f9b',light:'#a8aac1',dark:'#424f6c',path:'#a09aa8',edge:'#67718a',leaf:'#4d5879',leaf2:'#7985aa',leaf3:'#ada7c8',accent:'#e6dbb8',portal:'#d7c9ff',water:'#616b92',rune:'#a3a5ca'}
  ];
  const RARITY = {common:'#eee7d5',magic:'#8be4d5',rare:'#9db9ff',epic:'#dba7ef',mythic:'#ffdc87'};
  const terrainCache = new Map();
  const clamp = (v,a,b) => Math.min(b,Math.max(a,v));
  const hash = n => {const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v-Math.floor(v);};
  function ellipse(c,x,y,rx,ry,fill,stroke,lw=1) {c.beginPath();c.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),0,0,TAU);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke();}}
  function poly(c,pts,fill,stroke,lw=1) {c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke();}}
  function line(c,pts,color,width=1) {c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke();}
  function round(c,x,y,w,h,r,fill,stroke,lw=1){c.beginPath();const q=Math.min(r,w/2,h/2);c.moveTo(x+q,y);c.arcTo(x+w,y,x+w,y+h,q);c.arcTo(x+w,y+h,x,y+h,q);c.arcTo(x,y+h,x,y,q);c.arcTo(x,y,x+w,y,q);c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke();}}
  function glow(c,x,y,r,color,alpha=1){c.save();c.globalAlpha*=alpha;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'transparent');ellipse(c,x,y,r,r,g);c.restore();}
  function star(c,x,y,r,color,rot=0,inner=.38){const p=[];for(let i=0;i<8;i++){let a=rot+i*Math.PI/4;let rr=i%2?r*inner:r;p.push([x+Math.cos(a)*rr,y+Math.sin(a)*rr]);}poly(c,p,color);}
  function shadow(c,x,y,rx,ry,alpha=.14){c.save();c.globalAlpha*=alpha;ellipse(c,x,y,rx,ry,'#253f43');c.restore();}
  function pebble(c,x,y,s,p){shadow(c,x,y+2,s*1.2,s*.42,.10);ellipse(c,x,y,s,s*.52,p.light);line(c,[[x-s*.5,y-1],[x+s*.25,y-2]],'#fff5dc',Math.max(1,s*.12));}
  function fern(c,x,y,s,p,seed=0){c.save();c.translate(x,y);c.scale(s,s);line(c,[[0,0],[-1,-17]],p.leaf,1.7);for(let i=0;i<4;i++){let yy=-4-i*4;line(c,[[0,yy],[-9+i*1.5,yy-5]],i%2?p.leaf2:p.leaf,3);line(c,[[0,yy],[8-i,yy-6]],i%2?p.leaf:p.leaf2,3);}c.restore();}
  function bush(c,x,y,s,p){c.save();c.translate(x,y);c.scale(s,s);shadow(c,0,2,26,8,.10);ellipse(c,-14,-9,17,13,p.leaf);ellipse(c,10,-12,21,17,p.leaf2);ellipse(c,-4,-20,15,13,p.leaf2);ellipse(c,13,-19,13,10,p.leaf3);for(let i=0;i<4;i++)ellipse(c,-15+i*10,-11-hash(i+4)*12,2,1.4,p.accent);c.restore();}
  function flower(c,x,y,s,color,p){line(c,[[x,y],[x-1,y-s*8]],p.leaf,s);for(let j=0;j<5;j++){const a=j*TAU/5;ellipse(c,x+Math.cos(a)*s*2.6,y-s*9+Math.sin(a)*s*2.6,s*2,s*2,color);}ellipse(c,x,y-s*9,s*1.6,s*1.6,'#f9e9aa');}
  function tree(c,x,y,s,p,kind=0){c.save();c.translate(x,y);c.scale(s,s);shadow(c,0,8,45,15,.13);poly(c,[[-8,4],[-5,-57],[8,-55],[9,4]],'#877f64');line(c,[[1,-8],[2,-58]],'#b3a887',3);line(c,[[0,-36],[-22,-57]],'#877f64',5);line(c,[[4,-32],[24,-57]],'#877f64',5);if(kind===2){for(let i=0;i<3;i++){poly(c,[[-38+i*8,-30-i*23],[0,-98-i*6],[38-i*8,-30-i*23]],i===2?p.leaf3:i===1?p.leaf2:p.leaf);line(c,[[-23+i*8,-35-i*23],[0,-75-i*10],[23-i*8,-35-i*23]],'#e8efdd',4);} }else{ellipse(c,-24,-56,27,25,p.leaf);ellipse(c,24,-60,31,26,p.leaf);ellipse(c,-5,-76,38,31,p.leaf2);ellipse(c,17,-84,27,22,p.leaf3);ellipse(c,-21,-87,23,20,p.leaf2);ellipse(c,-1,-101,22,15,p.leaf3);for(let i=0;i<9;i++){const a=i*2.4;ellipse(c,Math.cos(a)*27,-69+Math.sin(a)*22,3.1,1.6,i%3?p.leaf3:p.accent);}}c.restore();}
  function mushroom(c,x,y,s,p,shade=0){c.save();c.translate(x,y);c.scale(s,s);shadow(c,0,0,20,7,.12);round(c,-6,-31,12,32,5,'#ded0bf');line(c,[[2,-25],[2,-5]],'#f6e6cb',3);c.beginPath();c.moveTo(-27,-27);c.bezierCurveTo(-24,-58,23,-61,29,-29);c.quadraticCurveTo(0,-16,-27,-27);c.fillStyle=shade?'#9d81b9':'#be91b5';c.fill();ellipse(c,0,-27,27,6,'#e0b5cf');ellipse(c,0,-29,24,3,'#89759e');ellipse(c,-10,-40,6,3,'#f4dacb');ellipse(c,8,-47,4,3,'#f4dacb');ellipse(c,18,-36,3,2,'#f4dacb');c.restore();}
  function crystal(c,x,y,s,color='#a7dce0'){c.save();c.translate(x,y);c.scale(s,s);shadow(c,0,0,20,6,.1);poly(c,[[-14,-2],[-18,-30],[-8,-43],[0,-26],[3,-2]],color);poly(c,[[-4,-1],[-5,-40],[8,-60],[18,-39],[12,2]],color);poly(c,[[8,-60],[8,-4],[18,-39]],'#e1f4ed');poly(c,[[14,2],[13,-23],[24,-33],[29,-13],[24,3]],'#b3d9df');line(c,[[7,-44],[7,-14]],'#f2ffff',1.5);c.restore();}
  function ruin(c,x,y,s,p){c.save();c.translate(x,y);c.scale(s,s);shadow(c,0,2,24,8,.13);poly(c,[[-17,0],[-15,-53],[-3,-62],[17,-57],[20,0]],p.dark);poly(c,[[-14,-1],[-12,-51],[-1,-58],[12,-53],[13,-1]],'#c2d4cd');poly(c,[[12,-53],[17,-57],[20,0],[13,0]],'#8eaaa9');line(c,[[-11,-40],[12,-40]],'#98b8b4',2);line(c,[[-10,-21],[12,-21]],'#98b8b4',2);star(c,1,-32,7,p.portal);ellipse(c,-3,-2,25,5,'#e2ece0');c.restore();}
  function book(c,x,y,s,angle=0,color='#b6a2c8'){c.save();c.translate(x,y);c.rotate(angle);c.scale(s,s);round(c,-12,-8,24,16,2,'#4f526f');round(c,-10,-8,21,13,1,'#eadbbb');round(c,-12,-12,24,14,2,color,'#62627e',1);line(c,[[-7,-11],[-7,1]],'#eee0b9',1);star(c,3,-5,3,'#eee0b9');c.restore();}
  function bookshelf(c,x,y,s,p){c.save();c.translate(x,y);c.scale(s,s);shadow(c,0,4,37,11,.2);round(c,-33,-94,66,99,5,'#4c536d','#c4bbab',2);for(let j=0;j<3;j++){let yy=-85+j*29;round(c,-27,yy,54,24,1,'#394760');for(let i=0;i<7;i++){let hh=14+hash(i+j*8)*6;let colors=['#a994b4','#9bb5b6','#d1b28a','#8590b2'];round(c,-25+i*7,yy+22-hh,5,hh,1,colors[(i+j)%4]);line(c,[[-24+i*7,yy+19],[-21+i*7,yy+19]],'#e7dab8',.8);}round(c,-30,yy+23,60,4,1,'#bdad93');}star(c,0,-101,7,p.accent);c.restore();}
  function candle(c,x,y,s=1){c.save();c.translate(x,y);c.scale(s,s);ellipse(c,0,0,10,3,'#988d7c');round(c,-4,-20,8,20,2,'#f1dcad');ellipse(c,0,-25,3,5,'#ffe7a0');ellipse(c,0,-25,1,3,'#fffbe5');c.restore();}
  // A fixed world route. Forward is northeast; positive across is southeast.
  // All decoration is indexed by world cells, never by the current camera.
  const SQ = Math.SQRT1_2, TILE = 320, MAX_TILES = 48;
  const finite = (v,fallback=0) => Number.isFinite(Number(v)) ? Number(v) : fallback;
  const noise = (x,y,salt=0) => hash(x*41.731+y*173.917+salt*11.173);
  const along = (x,y) => (x-y)*SQ;
  const across = (x,y) => (x+y)*SQ;
  const bend = t => Math.sin(t/640)*27 + Math.sin(t/1430)*13;
  function routePoint(t,offset=0){const q=bend(t)+offset;return{x:(t+q)*SQ,y:(q-t)*SQ};}
  function nearView(x,y,cam,pad=120){return x>cam.x-480-pad&&x<cam.x+480+pad&&y>cam.y-300-pad&&y<cam.y+240+pad;}
  function makeCanvas(){let c;if(typeof OffscreenCanvas!=='undefined')c=new OffscreenCanvas(TILE,TILE);else if(typeof document!=='undefined'){c=document.createElement('canvas');c.width=TILE;c.height=TILE;}return c;}
  function groundTile(c,ix,iy,biome){
    const p=BIOMES[biome],ox=ix*TILE,oy=iy*TILE;c.save();c.translate(-ox,-oy);c.fillStyle=p.ground;c.fillRect(ox,oy,TILE,TILE);
    // Overlapping washes are regenerated from neighboring world cells at tile edges.
    c.save();c.globalAlpha=.13;
    for(let gx=Math.floor((ox-180)/144);gx<=Math.ceil((ox+TILE+180)/144);gx++)for(let gy=Math.floor((oy-100)/144);gy<=Math.ceil((oy+TILE+100)/144);gy++){
      const n=noise(gx,gy,2),x=gx*144+noise(gx,gy,3)*90,y=gy*144+noise(gx,gy,4)*90;
      ellipse(c,x,y,65+noise(gx,gy,5)*75,27+noise(gx,gy,6)*39,n>.48?p.light:p.dark);
    }c.restore();
    if(biome===4){c.save();c.globalAlpha=.14;for(let y=Math.floor(oy/48)*48;y<oy+TILE+48;y+=48){line(c,[[ox,y],[ox+TILE,y]],p.light,1);for(let x=Math.floor(ox/80)*80;x<ox+TILE+80;x+=80)line(c,[[x+(Math.floor(y/48)%2)*40,y],[x+(Math.floor(y/48)%2)*40,y+48]],p.light,1);}c.restore();}
    for(let i=0;i<46;i++){
      const x=ox+noise(ix,iy,i+80)*TILE,y=oy+noise(ix,iy,i+150)*TILE;
      const v=noise(ix,iy,i+220);c.save();c.globalAlpha=.2+v*.13;
      if(i%5===0){line(c,[[x-3,y],[x-1,y-4],[x,y]],p.dark,1);line(c,[[x,y],[x+3,y-5]],p.dark,1);}
      else ellipse(c,x,y,1+v*2,.6+v,p.light);c.restore();
    }
    c.restore();
  }
  function worldGround(c,cam,biome){
    const minX=Math.floor((cam.x-480)/TILE),maxX=Math.floor((cam.x+480)/TILE),minY=Math.floor((cam.y-300)/TILE),maxY=Math.floor((cam.y+240)/TILE);
    for(let ix=minX;ix<=maxX;ix++)for(let iy=minY;iy<=maxY;iy++){
      const key=biome+':'+ix+':'+iy;let tile=terrainCache.get(key);
      if(!tile){tile=makeCanvas();if(tile){const cc=tile.getContext('2d');if(cc){groundTile(cc,ix,iy,biome);terrainCache.set(key,tile);if(terrainCache.size>MAX_TILES)terrainCache.delete(terrainCache.keys().next().value);}else tile=null;}}
      else{terrainCache.delete(key);terrainCache.set(key,tile);}
      if(tile)c.drawImage(tile,ix*TILE,iy*TILE);else{c.save();c.beginPath();c.rect(ix*TILE,iy*TILE,TILE,TILE);c.clip();c.translate(ix*TILE,iy*TILE);groundTile(c,ix,iy,biome);c.restore();}
    }
  }
  function pool(c,x,y,p,biome,seed){
    c.save();c.translate(x,y);c.rotate(-.13);shadow(c,0,5,80,26,.12);ellipse(c,0,0,81,29,p.edge);ellipse(c,0,-2,74,25,p.water);ellipse(c,-12,-5,52,16,biome===2?'#cce5e8':p.water);
    c.globalAlpha=.55;line(c,[[-52,-8],[-17,-8]],p.light,2);line(c,[[5,8],[40,8]],p.light,2);c.globalAlpha=1;
    if(biome===0){ellipse(c,-25,4,10,5,p.leaf2);poly(c,[[-25,4],[-16,2],[-19,7]],p.water);flower(c,29,7,.75,'#f4cdd3',p);}else if(biome===1){mushroom(c,-59,9,.35,p);mushroom(c,60,-5,.28,p,1);}else if(biome===2){crystal(c,-58,10,.35);line(c,[[-35,-13],[-12,6],[6,4],[24,16]],'#e8ffff',1.5);}else if(biome===3){fern(c,64,12,.8,p);pebble(c,-63,14,10,p);}c.restore();
  }
  function path(c,cam,p,biome){
    const center=along(cam.x,cam.y),start=Math.floor((center-1120)/48)*48,end=center+1120;
    c.save();c.beginPath();for(let t=start;t<=end;t+=48){const a=routePoint(t);t===start?c.moveTo(a.x,a.y):c.lineTo(a.x,a.y);}c.lineJoin='round';c.lineCap='round';
    c.strokeStyle=p.edge;c.lineWidth=238;c.globalAlpha=.3;c.stroke();c.globalAlpha=1;c.strokeStyle=p.path;c.lineWidth=220;c.stroke();
    c.globalAlpha=.17;c.strokeStyle=p.light;c.lineWidth=180;c.stroke();c.restore();
    // Small stones and footprints give motion a visible, anchored scale.
    for(let n=Math.floor((center-1060)/47);n<=Math.ceil((center+1060)/47);n++){
      const t=n*47,a=routePoint(t,(hash(n+373)-.5)*166);
      if(nearView(a.x,a.y,cam,30)){c.save();c.globalAlpha=.26;ellipse(c,a.x,a.y,2+hash(n+64)*3,1+hash(n+85),p.dark);c.restore();}
      if(n%3===0){const b=routePoint(t,(n%2?1:-1)*(111+hash(n+17)*6));if(nearView(b.x,b.y,cam,30)){pebble(c,b.x,b.y,3+hash(n+31)*3,p);if(n%6===0)flower(c,b.x+6,b.y+3,.6,biome===1?'#ecc5e6':p.accent,p);}}
      if(n%4===0){const f=routePoint(t,hash(n+106)*12-6);c.save();c.translate(f.x,f.y);c.rotate(-Math.PI/4);c.globalAlpha=.21;ellipse(c,-5,-4,3.5,1.6,p.dark);ellipse(c,4,4,3.5,1.6,p.dark);c.restore();}
    }
    // Cartographer's inset compass stones always point northeast, without UI overlays.
    for(let n=Math.floor((center-1000)/380);n<=Math.ceil((center+1000)/380);n++){
      const a=routePoint(n*380,0);if(!nearView(a.x,a.y,cam,40))continue;c.save();c.translate(a.x,a.y);c.rotate(-Math.PI/4);c.globalAlpha=.28;
      poly(c,[[-7,-11],[8,0],[-7,11],[-3,0]],p.rune);line(c,[[-13,-6],[-7,0],[-13,6]],p.rune,1.4);c.restore();
    }
  }
  function waymarker(c,x,y,p,biome){
    c.save();c.translate(x,y);shadow(c,0,2,21,6,.12);line(c,[[0,0],[0,-45]],'#8a816c',5);line(c,[[1,-2],[1,-43]],'#b8a386',1.5);
    // Cut wooden arrow faces up-right toward the next stretch of trail.
    poly(c,[[-20,-36],[12,-49],[24,-43],[18,-31],[-13,-19]],biome===4?'#c7bad0':'#ead8b3','#a9997e',1.2);
    line(c,[[-8,-29],[12,-38],[8,-39]],p.rune,2);line(c,[[12,-38],[10,-33]],p.rune,2);star(c,-8,-31,2.2,p.accent);
    line(c,[[-4,-14],[-14,-9]],'#c5b695',1);poly(c,[[-14,-13],[-26,-13],[-30,-7],[-22,-2],[-13,-3]],'#d7cdb2');
    c.save();c.globalAlpha=.7;line(c,[[-18,-9],[-24,-6],[-20,-5]],p.rune,1);c.restore();fern(c,10,1,.53,p);c.restore();
  }
  function camp(c,x,y,p,biome){
    c.save();c.translate(x,y);shadow(c,-25,-32,85,29,.13);
    // A real world-positioned rest stop. Its doorway meets the open SW trail.
    c.save();c.translate(-32,-36);
    poly(c,[[-73,6],[-17,-86],[47,-63],[77,15]],'#788e83');poly(c,[[-67,1],[-17,-87],[8,-5]],'#f2dfaf');poly(c,[[-17,-87],[45,-65],[74,9],[8,-5]],'#c7b991');
    poly(c,[[-17,-70],[-48,-1],[4,1]],'#697a76');poly(c,[[-17,-63],[-39,-2],[-7,-5]],'#384f55');poly(c,[[-15,-60],[-7,-5],[2,0]],'#dccb9c');line(c,[[-17,-86],[-18,-101]],'#806d58',3);poly(c,[[-17,-101],[6,-95],[-17,-91]],'#c58b78');
    line(c,[[-67,1],[-89,18]],'#99886b',1.5);line(c,[[74,9],[87,25]],'#99886b',1.5);line(c,[[-89,14],[-89,24]],'#806d58',3);line(c,[[87,20],[87,29]],'#806d58',3);line(c,[[3,-2],[69,12]],'#eee0b7',2);line(c,[[22,-63],[45,-8]],'#dfd2a9',1);
    round(c,-43,2,52,14,3,'#b29c79');for(let i=0;i<5;i++)line(c,[[-40+i*10,3],[-40+i*10,15]],'#887d66',1);round(c,-31,6,32,9,2,'#bc8d94');line(c,[[-29,8],[-2,8]],'#e5c2b3',2);star(c,27,-29,8,'#eee0b1');
    glow(c,62,-22,43,'#fff0ac',.6);line(c,[[65,13],[65,-56]],'#64756f',4);c.beginPath();c.arc(57,-55,8,Math.PI,0);c.strokeStyle='#64756f';c.lineWidth=3;c.stroke();line(c,[[49,-55],[49,-40]],'#64756f',2);round(c,42,-40,14,21,3,'#b89964');round(c,45,-36,8,13,2,'#ffefb5');poly(c,[[39,-40],[49,-46],[59,-40]],'#778077');round(c,42,-20,14,4,2,'#778077');
    // Folded travelling blanket and a little spellbook, never a loot basket.
    round(c,-67,24,29,12,4,'#a0afaa');line(c,[[-63,27],[-44,27]],'#d9debc',2);book(c,38,28,.8,-.08,'#a69bbd');c.restore();
    c.save();c.globalAlpha=.36;ellipse(c,0,7,37,15,p.light);c.setLineDash([3,6]);ellipse(c,0,7,37,15,null,p.rune,1);c.restore();c.restore();
  }
  function amberRock(c,x,y,s,p,seed){c.save();c.translate(x,y);c.scale(s,s);shadow(c,0,0,27,9,.14);poly(c,[[-25,0],[-20,-31],[6,-40],[27,-19],[22,5]],seed>.5?'#b89466':'#c6a475');poly(c,[[-20,-31],[6,-40],[27,-19],[3,-20]],'#d6b784');line(c,[[-17,-23],[3,-20],[15,-25]],'#ebc993',2);fern(c,23,2,.8,p);c.restore();}
  function groundScenery(c,cam,p,biome){
    // Occasional quiet pools / mosaic circles, located off the open adventure route.
    for(let gx=Math.floor((cam.x-620)/510);gx<=Math.ceil((cam.x+620)/510);gx++)for(let gy=Math.floor((cam.y-430)/510);gy<=Math.ceil((cam.y+400)/510);gy++){
      const n=noise(gx,gy,601);if(n>.6)continue;const x=gx*510+noise(gx,gy,602)*220,y=gy*510+noise(gx,gy,603)*220;
      if(Math.abs(across(x,y)-bend(along(x,y)))<230||!nearView(x,y,cam,130))continue;
      if(biome===4){c.save();c.globalAlpha=.16;for(let i=0;i<3;i++)ellipse(c,x,y,27+i*19,14+i*10,null,p.accent,1.5);star(c,x,y,14,p.accent,.2);c.restore();}else pool(c,x,y,p,biome,n);
    }
  }
  function sceneProps(cam,biome,state){
    const out=[],p=BIOMES[biome];
    for(let gx=Math.floor((cam.x-600)/154);gx<=Math.ceil((cam.x+600)/154);gx++)for(let gy=Math.floor((cam.y-390)/154);gy<=Math.ceil((cam.y+395)/154);gy++){
      const n=noise(gx,gy,20),x=gx*154+25+noise(gx,gy,21)*100,y=gy*154+20+noise(gx,gy,22)*110,t=along(x,y),q=Math.abs(across(x,y)-bend(t));
      if(q<157||n>.76||!nearView(x,y,cam,135))continue;
      const s=.58+noise(gx,gy,23)*.41,kind=Math.floor(noise(gx,gy,24)*5),cp=state.world?.camp;
      if(cp&&Math.hypot(x-finite(cp.x),y-finite(cp.y))<135)continue;
      out.push({x,y,canopy:true,span:48*s,height:118*s,draw:c=>{
        if(biome===0){if(kind<3)tree(c,x,y,s,p);else if(kind===3){bush(c,x,y,s*1.1,p);flower(c,x+17,y+4,.72,'#f6d4d0',p);}else{mushroom(c,x,y,s*.6,p);bush(c,x+24,y-9,s*.7,p);}}
        else if(biome===1){mushroom(c,x,y,s*1.65,p,kind%2);if(kind%2===0)mushroom(c,x+24,y+13,s*.71,p,1);fern(c,x-21,y+7,s*.6,p);}
        else if(biome===2){if(kind===0)tree(c,x,y,s,p,2);else if(kind<3)ruin(c,x,y,s*1.08,p);else crystal(c,x,y,s*1.15);}
        else if(biome===3){if(kind<2)tree(c,x,y,s*.82,p);else amberRock(c,x,y,s*1.1,p,n);flower(c,x-24,y+5,.73,'#f4deb0',p);}
        else {if(kind<3)bookshelf(c,x,y,s,p);else if(kind===3){ruin(c,x,y,s,p);candle(c,x,y-60*s,s*.7);}else{book(c,x,y,s,.1);book(c,x+10,y-7,s,-.18,'#8eacb7');candle(c,x-20,y,.7);} }
      }});
    }
    // Smaller flora make the lane edges feel hand-illustrated without hiding threats.
    const center=along(cam.x,cam.y);for(let n=Math.floor((center-1000)/91);n<=Math.ceil((center+1000)/91);n++)for(const side of [-1,1]){
      const a=routePoint(n*91+side*19,side*(129+hash(n*side+802)*25));if(!nearView(a.x,a.y,cam,35))continue;
      out.push({y:a.y,draw:c=>{if(biome===4){if(n%3===0)book(c,a.x,a.y,.42,-.15,p.leaf3);else candle(c,a.x,a.y,.45);}else if(biome===2){if(n%3===0)crystal(c,a.x,a.y,.27);else pebble(c,a.x,a.y,5,p);}else if(biome===1){mushroom(c,a.x,a.y,.26,p,n%2);}else{fern(c,a.x,a.y,.44,p);if(n%2===0)flower(c,a.x+6,a.y+4,.6,p.accent,p);}}});
    }
    for(let n=Math.floor((center-1000)/640);n<=Math.ceil((center+1000)/640);n++){const a=routePoint(n*640+220,140);if(nearView(a.x,a.y,cam,90))out.push({y:a.y,draw:c=>waymarker(c,a.x,a.y,p,biome)});}
    const cp=state.world?.camp;if(cp&&nearView(finite(cp.x),finite(cp.y),cam,170))out.push({y:finite(cp.y)-25,draw:c=>camp(c,finite(cp.x),finite(cp.y),p,biome)});
    return out;
  }
  function hpbar(c,x,y,hp,max,width=39,elite=false){if(!(max>0))return;const f=clamp(hp/max,0,1);round(c,x-width/2,y,width,5,2.5,'#38525b87');if(f>0)round(c,x-width/2+1,y+1,(width-2)*f,3,1.5,elite?'#e8c484':'#dc8797');}
  function enemy(c,e,t,p,reduced){
    const x=finite(e.x),y=finite(e.y);const bob=reduced?0:Math.sin(t*3+(Number(e.id)||x)) * 1.5;const wind=clamp(Number(e.windup)||0,0,1);const type=e.type||'slime';
    shadow(c,x,y+2,e.elite?26:20,7,.18);
    if(wind>0){c.save();c.globalAlpha=.3+.2*Math.sin(t*8);ellipse(c,x,y,28+wind*7,12,'#ee9b87');c.restore();}
    c.save();c.translate(x,y+bob);if(e.elite)c.scale(1.18,1.18);if(e.hit>0){c.globalAlpha=.7+Math.sin(t*40)*.2;}
    if(type==='slime'){
      const g=c.createLinearGradient(0,-36,0,0);g.addColorStop(0,'#b9e1bf');g.addColorStop(1,'#6eae9d');c.beginPath();c.moveTo(-22,-3);c.bezierCurveTo(-30,-18,-15,-40,0,-39);c.bezierCurveTo(17,-38,30,-17,23,-3);c.quadraticCurveTo(0,8,-22,-3);c.fillStyle=g;c.fill();line(c,[[-16,-24],[-11,-29],[-4,-31]],'#e6f3cc',3);ellipse(c,-9,-15,2.1,3.2,'#40586a');ellipse(c,8,-15,2.1,3.2,'#40586a');line(c,[[-2,-10],[1,-8],[4,-10]],'#587780',1.6);ellipse(c,-15,-9,4,2,'#e2b8b2');ellipse(c,14,-9,4,2,'#e2b8b2');poly(c,[[-3,-38],[0,-47],[6,-40]],'#79aa82');ellipse(c,7,-43,7,3,'#9bc69c');
    }else if(type==='mushroom'){
      ellipse(c,0,-11,14,16,'#f1dbbd');ellipse(c,-7,-1,7,4,'#b8a98c');ellipse(c,8,-1,7,4,'#b8a98c');c.beginPath();c.moveTo(-27,-23);c.bezierCurveTo(-24,-53,22,-52,28,-23);c.quadraticCurveTo(2,-11,-27,-23);c.fillStyle='#c98a9d';c.fill();ellipse(c,0,-23,27,6,'#e2b7b9');ellipse(c,-11,-32,6,4,'#f4dbc0');ellipse(c,6,-40,5,3,'#f4dbc0');ellipse(c,16,-29,4,3,'#f4dbc0');ellipse(c,-5,-12,1.8,2.5,'#5d5868');ellipse(c,6,-12,1.8,2.5,'#5d5868');ellipse(c,0,-6,2,1.5,'#a88382');
    }else if(type==='bat'){
      const f=reduced?0:Math.sin(t*8+x)*7;c.beginPath();c.moveTo(-7,-29);c.quadraticCurveTo(-24,-47-f,-36,-24-f);c.quadraticCurveTo(-21,-30,-20,-12);c.quadraticCurveTo(-12,-23,-6,-18);c.fillStyle='#9286b0';c.fill();c.beginPath();c.moveTo(7,-29);c.quadraticCurveTo(24,-47-f,36,-24-f);c.quadraticCurveTo(21,-30,20,-12);c.quadraticCurveTo(12,-23,6,-18);c.fillStyle='#9286b0';c.fill();poly(c,[[-13,-34],[-13,-48],[-3,-36]],'#b0a0c5');poly(c,[[4,-36],[15,-47],[14,-31]],'#b0a0c5');ellipse(c,0,-27,16,19,'#b9a6ce');ellipse(c,0,-20,10,10,'#d4bfdc');ellipse(c,-6,-30,2.5,3,'#424563');ellipse(c,7,-30,2.5,3,'#424563');poly(c,[[-2,-23],[3,-23],[1,-20]],'#8f779b');
    }else if(type==='golem'){
      round(c,-19,-12,14,14,5,'#8b9899');round(c,6,-12,14,14,5,'#8b9899');round(c,-27,-34,12,23,5,'#a2b1a8');round(c,16,-34,12,23,5,'#a2b1a8');round(c,-19,-44,39,36,10,'#adbbb0','#7f9796',1);round(c,-16,-47,33,16,7,'#c8d1b7');line(c,[[-10,-26],[-5,-25]],'#426878',3);line(c,[[6,-25],[11,-26]],'#426878',3);star(c,1,-15,5,p.portal);line(c,[[-12,-39],[-6,-35],[-9,-30]],'#8a9f9a',1.2);fern(c,-5,-43,.58,p);
    }else{
      glow(c,0,-25,32,p.portal,.42);c.beginPath();c.moveTo(-17,-11);c.bezierCurveTo(-26,-29,-11,-40,0,-48);c.bezierCurveTo(-4,-33,26,-27,16,-9);c.quadraticCurveTo(8,-4,5,-9);c.quadraticCurveTo(0,-2,-5,-9);c.quadraticCurveTo(-14,-3,-17,-11);c.fillStyle='#c8e7dc';c.fill();ellipse(c,0,-22,11,13,'#eaf3de');ellipse(c,-5,-25,2.1,3,'#617c8b');ellipse(c,5,-25,2.1,3,'#617c8b');star(c,0,-15,3,'#9cb1bb');
    }
    if(e.slow>0){c.save();c.globalAlpha=.5;ellipse(c,0,-20,27,29,null,'#ddffff',1.5);star(c,-20,-26,5,'#e4ffff');c.restore();}
    if(e.elite){poly(c,[[-12,-55],[-15,-66],[-5,-60],[0,-70],[5,-60],[15,-66],[12,-55]],'#ecd49a','#b59460',1);ellipse(c,0,-59,2,2,'#bd879e');}
    c.restore();if(e.hp<e.maxHp||e.elite||wind>0)hpbar(c,x,y-(e.elite?89:63),e.hp,e.maxHp,e.elite?48:39,e.elite);
  }
  function mage(c,state,t,reduced){
    const v=state.player||{};const x=finite(v.x),y=finite(v.y);let face=(v.face===-1||v.face==='left')?-1:1;const travel=!!v.moving||Math.hypot(finite(v.vx),finite(v.vy))>2||['travel','advance','retreat'].includes(state.mode);const combat=state.mode==='combat';const walk=(!reduced&&travel)?Math.sin(t*10):0;const bob=reduced?0:Math.sin(t*(travel?10:3))*(travel?1.6:.7);const eq=state.equipment||{};const wandColor=RARITY[eq.wand?.rarity]||'#e6d9ff';
    shadow(c,x,y+3,24,8,.2);
    if(v.shield>0){c.save();c.globalAlpha=.32;ellipse(c,x,y-29,31,40,null,'#e2faff',2);ellipse(c,x,y-29,35,43,null,'#b7e7e8',1);c.restore();}
    if(state.mode==='camp'){c.save();c.globalAlpha=.2;ellipse(c,x,y+2,32,12,'#d7f4c7');c.restore();}
    c.save();c.translate(x,y+bob);c.scale(face,1);
    // Tiny leather boots visibly step when travelling.
    round(c,-12+walk*2,-7,11,10,4,'#6d6789');round(c,3-walk*2,-7,11,10,4,'#6d6789');ellipse(c,9-walk*2,1,8,3,'#5e5a7b');
    // Cape, sleeves, stitched robe and star brooch.
    c.beginPath();c.moveTo(-10,-38);c.quadraticCurveTo(-21,-21,-23,-5);c.quadraticCurveTo(-4,-1,14,-7);c.lineTo(10,-36);c.closePath();c.fillStyle='#8884b1';c.fill();
    c.beginPath();c.moveTo(-9,-35);c.quadraticCurveTo(-16,-19,-13,-6);c.quadraticCurveTo(1,0,17,-7);c.lineTo(10,-35);c.closePath();c.fillStyle='#b1a1cc';c.fill();line(c,[[-8,-6],[14,-7]],'#e7d4ca',2);line(c,[[-1,-26],[-2,-8]],'#c9bbdc',1.5);
    ellipse(c,-13,-25,6,11,'#a89ac3');ellipse(c,-12,-16,4,4,'#f0d6b7');
    const armRaise=combat?-5:0;ellipse(c,15,-26+armRaise,7,5,'#beafd4');ellipse(c,21,-25+armRaise,4.5,4.5,'#f5dab9');
    // Wand has a gold collar and soft magic instead of harsh bloom.
    c.save();c.translate(26,-25+armRaise);c.rotate(combat?.23:-.1);line(c,[[0,13],[0,-23]],'#78688b',3.5);line(c,[[0,-14],[0,-23]],'#ebc891',4);star(c,0,-27,9,wandColor,.2,.5);star(c,0,-27,4,'#fff8e4');c.restore();
    ellipse(c,0,-42,16,15,'#e6c5aa');ellipse(c,1,-44,14,14,'#f4dbba');
    // Hair frames the expressive, friendly face.
    c.beginPath();c.moveTo(-15,-49);c.quadraticCurveTo(-14,-61,1,-57);c.quadraticCurveTo(17,-57,17,-42);c.lineTo(9,-48);c.lineTo(3,-43);c.lineTo(-2,-49);c.lineTo(-10,-42);c.lineTo(-11,-34);c.quadraticCurveTo(-18,-33,-15,-49);c.fillStyle='#eee3c8';c.fill();
    ellipse(c,-4,-42,1.9,2.5,'#515a71');ellipse(c,7,-42,1.9,2.5,'#515a71');ellipse(c,-8,-36,3.4,1.8,'#e8b3ac');ellipse(c,11,-36,3.4,1.8,'#e8b3ac');line(c,[[0,-36],[2,-35],[4,-36]],'#b1848b',1.2);
    // Asymmetric floppy star hat with satin inner brim.
    ellipse(c,-1,-55,28,8,'#79789f');ellipse(c,-1,-58,29,7,'#b5a5cf');c.beginPath();c.moveTo(-18,-59);c.quadraticCurveTo(-10,-81,0,-91);c.quadraticCurveTo(9,-93,17,-81);c.quadraticCurveTo(10,-82,9,-75);c.lineTo(19,-59);c.closePath();c.fillStyle='#a79bc7';c.fill();line(c,[[-12,-62],[13,-61]],'#d2bdcc',4);star(c,-1,-72,5,'#f2ddb0',.2);ellipse(c,16,-82,3,3,'#edcf9b');
    star(c,1,-29,5,'#f0d79e',.2);c.restore();
    if(combat&&!reduced){glow(c,x+face*26,y-58,17,wandColor,.24+.12*Math.sin(t*6));for(let i=0;i<3;i++){let a=t*1.2+i*TAU/3;star(c,x+face*27+Math.cos(a)*13,y-58+Math.sin(a)*12,1.7,'#fff8d5');}}
    if(eq.charm){const a=reduced?0:t*1.4;const fx=x-34+Math.sin(a)*3,fy=y-42+Math.cos(a)*4;shadow(c,fx,y+1,8,3,.08);ellipse(c,fx,fy,7,8,'#faf2dc');ellipse(c,fx-3,fy-9,2.5,7,'#faf2dc');ellipse(c,fx+3,fy-9,2.5,7,'#faf2dc');ellipse(c,fx-2,fy,1,1.4,'#79808d');ellipse(c,fx+3,fy,1,1.4,'#79808d');}
  }
  function projectile(c,b,t,reduced){
    const x=finite(b.x),y=finite(b.y),dx=finite(b.tx,x+10)-x,dy=finite(b.ty,y)-y,a=Math.atan2(dy,dx);const colors={spark:'#f8edbb',fire:'#ffba85',ice:'#c9f3ff',lightning:'#e8c5ff',meteor:'#ffce9e'};const col=b.color||colors[b.kind]||colors.spark;
    c.save();c.translate(x,y);c.rotate(a);
    if(b.kind==='lightning'){line(c,[[-36,-2],[-26,4],[-16,-5],[-7,3],[5,0]],col,3);line(c,[[-32,-2],[-23,4],[-15,-4],[-6,2],[5,0]],'#fffbe2',1.3);}
    else if(b.kind==='ice'){poly(c,[[12,0],[-3,-7],[-10,0],[-3,7]],col);poly(c,[[12,0],[-4,0],[-3,7]],'#8fc0dd');line(c,[[-25,0],[-14,0]],'#deffff',2);}
    else if(b.kind==='fire'||b.kind==='meteor'){c.beginPath();c.moveTo(9,0);c.bezierCurveTo(2,-14,-11,-6,-29,0);c.bezierCurveTo(-10,7,3,13,9,0);c.fillStyle=col;c.fill();ellipse(c,1,0,6,4,'#fff5c8');}
    else{line(c,[[-24,0],[-9,0]],col,3);star(c,0,0,8,col,t*2);star(c,0,0,3.5,'#fffdf0');}c.restore();
  }
  function effects(c,arr,t,reduced){
    for(const e of arr||[]){const max=Number(e.maxLife)||1,remain=clamp((Number(e.life)||0)/max,0,1),progress=1-remain,x=Number(e.x)||0,y=Number(e.y)||0,col=e.color||'#ffefbd';if(remain<=0)continue;c.save();c.globalAlpha=clamp(remain*2,0,1);
      if(['ring','burst','level','shield'].includes(e.kind)){const r=12+progress*(e.kind==='level'?56:29);ellipse(c,x,y,r,r*.65,null,col,2*(remain+.4));if(e.kind==='burst'||e.kind==='level')for(let j=0;j<7;j++){let a=j*TAU/7;star(c,x+Math.cos(a)*r,y+Math.sin(a)*r*.7,2+remain*3,col,a);}}
      if(e.kind==='hit'){for(let j=0;j<5;j++){let a=j*TAU/5;line(c,[[x+Math.cos(a)*7,y+Math.sin(a)*7],[x+Math.cos(a)*(9+progress*14),y+Math.sin(a)*(9+progress*14)]],col,2);}}
      if(e.kind==='heal'){line(c,[[x-5,y-progress*17],[x+5,y-progress*17]],col,3);line(c,[[x,y-5-progress*17],[x,y+5-progress*17]],col,3);}
      if(e.kind==='loot')star(c,x,y-progress*17,4+remain*3,col,t);
      if(e.text){const ty=y-(reduced?14:progress*28)-10;c.font=(e.kind==='level'?'bold 17px':'bold 14px')+' system-ui, sans-serif';c.textAlign='center';c.textBaseline='middle';c.lineWidth=3;c.strokeStyle='#3e4e647a';c.strokeText(String(e.text),x,ty);c.fillStyle=col;c.fillText(String(e.text),x,ty);}
      c.restore();
    }
  }
  function pickups(c,arr,t,reduced){for(const a of arr||[]){const x=Number(a.x)||0,y=Number(a.y)||0,b=reduced?0:Math.sin(t*3+x)*2;shadow(c,x,y+3,8,3,.13);if(a.kind==='gold'){ellipse(c,x,y-7+b,6,8,'#e1b767','#927c64',1);ellipse(c,x,y-7+b,3.5,5,'#f4d792');line(c,[[x,y-10+b],[x,y-4+b]],'#b18b58',1);}else{glow(c,x,y-8,24,a.color||'#d9c3f1',.3);round(c,x-9,y-18+b,18,16,3,a.color||'#d8c7e6','#8b799f',1.5);line(c,[[x,y-18+b],[x,y-2+b]],'#fff0c9',2);line(c,[[x-9,y-12+b],[x+9,y-12+b]],'#fff0c9',2);star(c,x,y-22+b,3,'#fff3cd');}}}
  function atmosphere(c,cam,biome,t,reduced){
    const p=BIOMES[biome];c.save();
    // Motes belong to world cells too; drift is small, so the scrolling landscape
    // stays legible rather than feeling like a screen-fixed illustration.
    for(let gx=Math.floor((cam.x-530)/170);gx<=Math.ceil((cam.x+530)/170);gx++)for(let gy=Math.floor((cam.y-340)/170);gy<=Math.ceil((cam.y+290)/170);gy++){
      const seed=noise(gx,gy,411),x=gx*170+noise(gx,gy,412)*140+(reduced?0:Math.sin(t*.4+seed*8)*9),y=gy*170+noise(gx,gy,413)*140+(reduced?0:Math.cos(t*.3+seed*7)*8);
      c.globalAlpha=reduced?.42:.25+.19*Math.sin(t*.8+seed*10);
      if(biome===2)star(c,x,y,2.5,'#f9fff7',.3,.3);else if(biome===3){c.save();c.translate(x,y);c.rotate(seed*TAU+(reduced?0:t*.2));ellipse(c,0,0,3,1,'#fff0c0');c.restore();}else if(biome===4)star(c,x,y,2.3,p.accent,.4);else ellipse(c,x,y,1.6,1.6,biome===1?'#fbe3ef':'#fffbd1');
    }c.restore();
  }
  function draw(ctx,state={},options={}){
    const depth=Math.max(1,Math.floor(finite(state.depth,1))),biome=Number.isInteger(state.biome)?((state.biome%5)+5)%5:(depth-1)%5;
    const reduced=!!options.reducedMotion,t=finite(options.time,finite(state.time)),p=BIOMES[biome];
    const player=state.player||{},cam={x:finite(state.world?.camera?.x,finite(player.x)),y:finite(state.world?.camera?.y,finite(player.y))};
    ctx.save();ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.rect(0,0,W,H);ctx.clip();ctx.fillStyle=p.ground;ctx.fillRect(0,0,W,H);
    // One camera transform governs terrain, camp, actors, shots and loot alike.
    // The mage remains at the visual center while actual world coordinates grow.
    ctx.translate(W/2-cam.x,300-cam.y);worldGround(ctx,cam,biome);groundScenery(ctx,cam,p,biome);path(ctx,cam,p,biome);
    pickups(ctx,(state.pickups||[]).filter(a=>nearView(finite(a.x),finite(a.y),cam,40)),t,reduced);
    const actors=sceneProps(cam,biome,state);
    const movingActors=[player,...(state.enemies||[]).filter(e=>e.hp!==0)];
    for(const e of state.enemies||[])if(nearView(finite(e.x),finite(e.y),cam,100))actors.push({y:finite(e.y),draw:c=>enemy(c,e,t,p,reduced)});
    actors.push({y:finite(player.y),draw:c=>mage(c,state,t,reduced)});actors.sort((a,b)=>a.y-b.y);for(const a of actors){
      // Foliage yields to an approaching creature or the mage, keeping every
      // readable silhouette visible while preserving grounded depth ordering.
      const obscures=a.canopy&&movingActors.some(e=>Math.abs(finite(e.x)-a.x)<a.span+24&&finite(e.y)<=a.y+8&&finite(e.y)>a.y-a.height);
      if(obscures){ctx.save();ctx.globalAlpha=.25;a.draw(ctx);ctx.restore();}else a.draw(ctx);
    }
    for(const shot of state.projectiles||[])if(nearView(finite(shot.x),finite(shot.y),cam,80))projectile(ctx,shot,t,reduced);
    effects(ctx,(state.effects||[]).filter(a=>nearView(finite(a.x),finite(a.y),cam,130)),t,reduced);atmosphere(ctx,cam,biome,t,reduced);ctx.restore();
    // A very light lens vignette is the only screen-space scene treatment.
    ctx.save();const vignette=ctx.createRadialGradient(480,275,200,480,275,580);vignette.addColorStop(0,'transparent');vignette.addColorStop(1,biome===4?'#17233c29':'#284a411d');ctx.fillStyle=vignette;ctx.fillRect(0,0,W,H);ctx.restore();
  }
  function drawIcon(c,slot,x,y,size,color='#d1b5ec'){
    c.save();c.translate(x,y);c.scale(size/48,size/48);c.lineCap='round';c.lineJoin='round';
    if(slot==='wand'||slot==='spark'){line(c,[[-12,16],[9,-10]],'#a591b7',5);line(c,[[-10,15],[9,-8]],'#ebd5a5',2);star(c,11,-13,11,color,.16,.48);star(c,11,-13,4,'#fff4d4');}
    else if(slot==='hat'){ellipse(c,0,10,21,6,'#8f80ab');poly(c,[[-15,8],[-4,-19],[10,-12],[8,-5],[15,8]],color);line(c,[[-12,7],[12,7]],'#ead4aa',3);star(c,-1,-3,4,'#fff0c5');}
    else if(slot==='robe'){poly(c,[[-9,-15],[-20,-5],[-15,5],[-9,1],[-15,19],[15,19],[9,1],[15,5],[20,-5],[9,-15],[3,-9],[-3,-9]],color);line(c,[[0,-8],[0,18]],'#ece0c7',2);line(c,[[-13,16],[13,16]],'#ece0c7',2);star(c,0,-3,4,'#fff3ca');}
    else if(slot==='boots'){round(c,-16,-12,12,25,4,color);round(c,-18,5,20,13,4,color);round(c,5,-16,12,26,4,color);round(c,3,2,21,13,4,color);line(c,[[-14,-6],[-6,-6]],'#f5dfb5',3);line(c,[[7,-10],[15,-10]],'#f5dfb5',3);}
    else if(slot==='ring'){ellipse(c,0,5,13,13,null,'#ecd19b',5);poly(c,[[0,-17],[9,-8],[0,2],[-9,-8]],color,'#fff0c3',1.5);}
    else if(slot==='charm'){c.beginPath();c.arc(0,-4,15,Math.PI,TAU);c.strokeStyle='#d9bd8c';c.lineWidth=2;c.stroke();star(c,0,9,14,color,Math.PI/2,.56);ellipse(c,0,8,3,3,'#fff1bd');}
    else if(slot==='fire'){c.beginPath();c.moveTo(0,-23);c.bezierCurveTo(3,-9,18,-10,17,7);c.bezierCurveTo(16,24,-17,24,-17,8);c.bezierCurveTo(-20,-5,-5,-7,0,-23);c.fillStyle=color;c.fill();ellipse(c,0,9,7,10,'#fff1c9');}
    else if(slot==='ice'){for(let i=0;i<6;i++){c.save();c.rotate(i*TAU/6);line(c,[[0,0],[0,-21]],color,3);line(c,[[-6,-15],[0,-10],[6,-15]],color,2);c.restore();}}
    else if(slot==='lightning'){poly(c,[[3,-23],[-15,3],[-2,3],[-7,24],[16,-6],[3,-6]],color);}
    else if(slot==='meteor'){line(c,[[-16,18],[8,-8]],color,8);line(c,[[-19,7],[2,-14]],color,3);ellipse(c,9,-10,12,12,color);star(c,9,-10,8,'#fff2c5');}
    else if(slot==='shield'){c.beginPath();c.moveTo(0,-20);c.lineTo(17,-13);c.lineTo(14,6);c.quadraticCurveTo(10,16,0,22);c.quadraticCurveTo(-10,16,-14,6);c.lineTo(-17,-13);c.closePath();c.fillStyle=color;c.fill();line(c,[[0,-10],[0,10]],'#fff2d0',2);line(c,[[-8,0],[8,0]],'#fff2d0',2);}
    else if(slot==='heal'){round(c,-6,-19,12,38,3,color);round(c,-19,-6,38,12,3,color);}
    else star(c,0,0,19,color,0,.5);
    c.restore();
  }
  return {draw,drawIcon,biomes:BIOMES.map(x=>({name:x.name,subtitle:x.sub})),clearCache:()=>terrainCache.clear()};
});
