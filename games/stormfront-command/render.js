/* 磁暴前線 · ISOMETRIC FIELD OBSERVER
 * Original procedural Canvas2D artwork. Rendering never mutates simulation data.
 * Tile centres use 25 × 13 half axes; all public points are local CSS pixels.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.StormfrontRender = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const HW = 25, HH = 13, TAU = Math.PI * 2;
  const TEAM = [
    { light: '#b3f7ed', accent: '#61e7db', dark: '#163c4e', mid: '#32637a', roof: '#507d90', side: '#274654', deep: '#142630', stripe: '#66dbcb' },
    { light: '#ffdda8', accent: '#f29a5e', dark: '#543931', mid: '#8b5844', roof: '#ae7758', side: '#634335', deep: '#352920', stripe: '#e79b66' },
    { light: '#ddd0a0', accent: '#cfb575', dark: '#434847', mid: '#69716a', roof: '#85897a', side: '#4a514c', deep: '#2b3332', stripe: '#c4b77e' }
  ];
  const FOREST_TEAM=[
    {...TEAM[0],roof:'#809889',mid:'#4c7866',side:'#35584a',dark:'#254338',deep:'#172f29',forest:true},
    {...TEAM[1],roof:'#b39368',mid:'#876c47',side:'#654e37',dark:'#473f2c',deep:'#302f23',forest:true}
  ];
  const BIOMES={
    delta:{ground:['#435c50','#4b6352','#506753','#465f50','#536955'],water:['#214653','#21444e'],rock:['#596666','#6f7972','#8a9180']},
    ridge:{ground:['#666657','#6c6b59','#746e59','#646655','#77735f'],water:['#36535b','#365158'],rock:['#686b62','#828175','#a49c84']},
    canyon:{ground:['#886b4d','#917353','#96774e','#85674a','#9a7e58'],water:['#365d63','#395a5a'],rock:['#80674f','#a08362','#bba27b']},
    forest:{ground:['#304e3d','#385743','#3b5a44','#34513c','#416148'],water:['#24473f','#264b43'],rock:['#465b4e','#5e7160','#829174']},
    snow:{ground:['#8b9ea2','#96a8ab','#a1b0b0','#869da1','#adbbba'],water:['#3b6579','#446c7f'],rock:['#647b83','#81939a','#b4c2c4']},
    industrial:{ground:['#565c58','#5e635d','#62665f','#525b56','#6a6c61'],water:['#314950','#344f53'],rock:['#575f5b','#737b70','#929989']}
  };
  function biome(v){const key=String(v.biome||'delta');return BIOMES[key]||(/snow|ice|polar/.test(key)?BIOMES.snow:/forest|grove/.test(key)?BIOMES.forest:/sand|desert|canyon/.test(key)?BIOMES.canyon:/ridge|cliff|highland/.test(key)?BIOMES.ridge:/port|industrial|factory/.test(key)?BIOMES.industrial:BIOMES.delta);}
  function palette(owner,faction){return owner<0?TEAM[2]:faction===1?FOREST_TEAM[owner===0?0:1]:TEAM[owner===0?0:1];}
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const noise = (x, y, seed = 0) => { let n = Math.imul(x + 73 + seed, 374761393) ^ Math.imul(y + 379, 668265263); n = Math.imul(n ^ n >>> 13, 1274126177); return ((n ^ n >>> 16) >>> 0) / 4294967295; };
  const poly = (c, points, fill, stroke, width = 1) => {
    c.beginPath(); c.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) c.lineTo(points[i][0], points[i][1]);
    c.closePath(); if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = width; c.stroke(); }
  };
  const line = (c, points, color, width = 1) => { c.beginPath(); c.moveTo(points[0][0], points[0][1]); for (let i = 1; i < points.length; i++) c.lineTo(points[i][0], points[i][1]); c.strokeStyle = color; c.lineWidth = width; c.stroke(); };
  const ellipse = (c, x, y, rx, ry, fill, stroke, width = 1) => { c.beginPath(); c.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), 0, 0, TAU); if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = width; c.stroke(); } };
  function iso(u, v, z = 0) { return [(u - v) * HW, (u + v) * HH - z]; }
  function prism(c, u, v, w, d, h, colors, base = 0, project = iso) {
    const a = project(u - w / 2, v - d / 2, base), b = project(u + w / 2, v - d / 2, base), q = project(u + w / 2, v + d / 2, base), r = project(u - w / 2, v + d / 2, base);
    const at = project(u - w / 2, v - d / 2, base + h), bt = project(u + w / 2, v - d / 2, base + h), qt = project(u + w / 2, v + d / 2, base + h), rt = project(u - w / 2, v + d / 2, base + h);
    const sides = [ [a, b, bt, at], [b, q, qt, bt], [q, r, rt, qt], [r, a, at, rt] ];
    sides.map((p, i) => ({ p, i, depth: (p[0][1] + p[1][1]) / 2 })).sort((a, b) => a.depth - b.depth).forEach(({ p, i }) => poly(c, p, i % 2 ? colors[1] : colors[2], '#08171990', .65));
    poly(c, [at, bt, qt, rt], colors[0], colors[3] || '#a8c2b333', .7);
    return { a: at, b: bt, q: qt, r: rt };
  }
  function cylinder(c, u, v, radius, height, p, base = 0) {
    const a = iso(u, v, base), rx = radius * 35, ry = radius * 17;
    c.fillStyle = p.side; c.fillRect(a[0] - rx, a[1] - height, rx * 2, height);
    ellipse(c, a[0], a[1], rx, ry, p.side, '#152327', .7);
    c.fillStyle = p.mid; c.fillRect(a[0] - rx, a[1] - height, rx, height);
    ellipse(c, a[0], a[1] - height, rx, ry, p.roof, '#b1c7b655', 1);
    ellipse(c, a[0], a[1] - height, rx * .72, ry * .72, p.deep, p.mid, 2);
    line(c, [[a[0] - rx * .7, a[1] - height + ry], [a[0] - rx * .7, a[1]]], '#ccd9c329', 1);
  }
  function hazard(c, u, v, w, d, z = 0, project = iso) {
    poly(c, [project(u - w / 2, v - d / 2, z), project(u + w / 2, v - d / 2, z), project(u + w / 2, v + d / 2, z), project(u - w / 2, v + d / 2, z)], '#bba36b');
    for (let n = -w / 2; n < w / 2; n += .16) line(c, [project(u + n, v - d / 2, z + .1), project(u + Math.min(w / 2, n + .09), v + d / 2, z + .1)], '#262d2b', 2.4);
  }
  function plate(c, u, v, w, d, z, color, stroke) { poly(c, [iso(u - w / 2, v - d / 2, z), iso(u + w / 2, v - d / 2, z), iso(u + w / 2, v + d / 2, z), iso(u - w / 2, v + d / 2, z)], color, stroke); }
  function light(c, x, y, color, size = 1.6, glow = false) { if (glow) ellipse(c, x, y, size * 3, size * 1.5, color + '18'); c.fillStyle = color; c.fillRect(x - size / 2, y - size / 2, size, size); }
  function shadow(c, rx, ry, y = 2) { ellipse(c, 3, y, rx, ry, '#03131677'); }
  function groundRing(c, size, color, dashed = false) {
    const a = size * .53; c.save(); if (dashed) c.setLineDash([4, 3]);
    poly(c, [iso(-a, -a), iso(a, -a), iso(a, a), iso(-a, a)], color + '13', color, 1.6);
    c.setLineDash([]);
    [[-a, -a], [a, -a], [a, a], [-a, a]].forEach(([u, v]) => { const p = iso(u, v); ellipse(c, p[0], p[1], 2, 1, color); }); c.restore();
  }
  function ringCore(c, p, time, reduced) {
    prism(c, 0, 0, 2.65, 2.65, 6, ['#66746d', '#344640', '#44534b']);
    prism(c, -.13, -.12, 1.8, 1.85, 24, [p.roof, p.side, p.dark], 6);
    prism(c, .66, -.75, .42, .6, 38, [p.mid, p.side, p.dark], 6);
    prism(c, -.73, .66, .42, .6, 38, [p.mid, p.side, p.dark], 6);
    prism(c, .53, .82, 1.08, .36, 12, [p.mid, p.dark, p.side], 6);
    line(c, [iso(-.63, .78, 31), iso(-.63, -.64, 31), iso(.6, -.64, 31)], p.light, 2);
    const q = iso(-.12, -.12, 48);
    ellipse(c, q[0], q[1] + 3, 36, 17, '#071a24', p.deep, 8);
    ellipse(c, q[0], q[1], 36, 17, null, p.mid, 8);
    ellipse(c, q[0], q[1] - 1, 35, 16, null, p.accent, 2);
    ellipse(c, q[0], q[1] + 2, 26, 11, '#113c4390', p.light, 1.2);
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; line(c, [[q[0] + Math.cos(a) * 28, q[1] + Math.sin(a) * 13], [q[0] + Math.cos(a) * 39, q[1] + Math.sin(a) * 18]], '#dce6ce', 3); }
    prism(c, -.1, -.1, .33, .33, 11, [p.light, p.accent, p.mid], 30);
    if (!reduced) { const pulse = .45 + Math.sin(time * 2.3) * .15; c.globalAlpha *= pulse; ellipse(c, q[0], q[1] + 5, 18, 7, p.accent); c.globalAlpha /= pulse; }
    for (let i = 0; i < 4; i++) { const a = iso(.58 + i * .12, .97, 13); light(c, a[0], a[1], p.light, 1.7); }
    hazard(c, 1.01, .23, .22, 1.1, 6.5);
  }
  function forestArchitecture(c,e,p){
    const h=e.type==='relay'?69:e.type==='power'?54:e.type==='core'?52:e.type==='factory'?57:e.type==='airfield'?34:29;
    const width=e.type==='turret'?.31:e.size*.29;
    const count=e.type==='core'?5:e.type==='relay'?3:3;
    for(let i=0;i<count;i++){
      const angle=(i/(count-1)-.5)*2.5, u=Math.cos(angle)*width-.12,v=Math.sin(angle)*width-.17;
      const a=iso(u*.38,v*.38,h-10),b=iso(u*1.5,v*1.5,h+7+(i%2)*5),d=iso(u+v*.3,v-u*.3,h+1),q=iso(u-v*.3,v+u*.3,h+1);
      poly(c,[a,d,b,q],i%2?p.mid:p.roof,p.deep,1);line(c,[a,b],p.accent,1.1);
    }
    if(e.size>1){for(const side of[-1,1]){const a=iso(side*e.size*.32,e.size*.36,5),b=iso(side*.18,.1,16);line(c,[a,[(a[0]+b[0])/2,a[1]-9],b],p.dark,5);line(c,[a,[(a[0]+b[0])/2,a[1]-10],b],p.accent,1);}}
  }
  function drawBuilding(c, e, p, time, reduced) {
    shadow(c, e.size * 23, e.size * 10);
    const s = e.size;
    if (e.type !== 'core') {
      prism(c, 0, 0, s * .91, s * .91, 5, ['#637267', '#34483f', '#48594d']);
      line(c, [iso(-s * .42, s * .42, 5), iso(s * .42, s * .42, 5), iso(s * .42, -s * .42, 5)], '#a3b39b66', 1);
    }
    if (e.type === 'core') ringCore(c, p, time, reduced);
    else if (e.type === 'power') {
      prism(c, .23, .24, 1.23, 1.17, 17, [p.roof, p.side, p.dark], 5);
      cylinder(c, -.47, -.39, .29, 40, p, 5); cylinder(c, .21, -.4, .29, 40, p, 5);
      for (const u of [-.47, .21]) { const a = iso(u, -.4, 28); line(c, [[a[0] - 8, a[1]], [a[0] + 8, a[1]]], p.accent, 2); }
      prism(c, .46, .48, .52, .46, 8, [p.deep, p.dark, p.side], 22);
      for (let i = 0; i < 4; i++) line(c, [iso(.27 + i * .12, .28, 31), iso(.27 + i * .12, .68, 31)], '#a8bba766', 1);
      line(c, [iso(-.66, .52, 10), iso(-.28, .52, 10), iso(-.28, -.1, 10)], '#a4a178', 3);
      if (!reduced) for (let j = 0; j < 3; j++) { const f = (time * .35 + j / 3) % 1, q = iso(-.45, -.4, 45 + f * 19); ellipse(c, q[0] + f * 10, q[1], 6 + f * 7, 3 + f * 4, `rgba(174,202,187,${.14 * (1 - f)})`); }
    } else if (e.type === 'refinery') {
      prism(c, -.42, -.37, 1.46, 1.77, 29, [p.roof, p.side, p.dark], 5);
      prism(c, .89, -.57, .68, 1.34, 18, [p.mid, p.dark, p.side], 5);
      cylinder(c, -.83, -.65, .26, 29, p, 29); cylinder(c, -.2, -.65, .24, 23, p, 29);
      prism(c, -.12, .83, 1.52, .9, 5, ['#283c3c', '#283a32', '#34453b'], 5);
      for (let i = 0; i < 3; i++) {
        const u = -.7 + i * .5; prism(c, u, .32, .34, .14, 17, [p.mid, p.deep, p.dark], 5);
        line(c, [iso(u, .43, 7), iso(u, .43, 19)], '#d7b76c', 2.5); hazard(c, u, .91, .35, .55, 10.2);
      }
      line(c, [iso(.81, -.61, 32), iso(.81, .08, 32), iso(.18, .08, 32)], '#a5bfb0', 4);
      line(c, [iso(.81, -.61, 32), iso(.81, .08, 32), iso(.18, .08, 32)], p.accent, 1);
      const a = iso(-.1, .55, 36); line(c, [[a[0] - 15, a[1]], [a[0] + 12, a[1] + 14]], p.light, 2);
    } else if (e.type === 'factory') {
      prism(c, -.25, -.25, 2.1, 2.16, 27, [p.roof, p.side, p.dark], 5);
      for (let i = 0; i < 4; i++) prism(c, -.96 + i * .47, -.48, .25, 1.17, 7, [p.mid, p.dark, p.side], 32);
      // Three inset roll-up bays and a suspended industrial gantry.
      for (let j = 0; j < 3; j++) {
        const u = -.83 + j * .64;
        poly(c, [iso(u - .24, .836, 7), iso(u + .24, .836, 7), iso(u + .24, .836, 24), iso(u - .24, .836, 24)], '#0d2228', '#6f8e8b', 1);
        for (let k = 0; k < 3; k++) line(c, [iso(u - .2, .844, 12 + k * 4), iso(u + .2, .844, 12 + k * 4)], '#567274', .9);
        hazard(c, u, 1.02, .52, .19, 5.5);
      }
      prism(c, -.96, .97, .14, .14, 43, [p.light, p.side, p.mid], 5); prism(c, 1.03, .97, .14, .14, 43, [p.light, p.side, p.mid], 5);
      prism(c, .05, .97, 2.18, .22, 6, [p.accent, p.mid, p.side], 46);
      const a = iso(.36, .97, 46), b = iso(.36, .97, 25); line(c, [a, b, [b[0] + 5, b[1] + 3]], '#d2c899', 1.4);
      hazard(c, .05, .97, 2, .2, 52.3);
    } else if (e.type === 'barracks') {
      prism(c, -.08, -.23, 1.68, 1.12, 19, [p.roof, p.side, p.dark], 5);
      prism(c, -.54, .62, .62, .4, 14, [p.mid, p.side, p.dark], 5);
      prism(c, .45, .31, .73, .68, 11, [p.mid, p.side, p.dark], 5);
      for (let i = 0; i < 5; i++) line(c, [iso(-.73 + i * .3, -.73, 25), iso(-.73 + i * .3, .2, 25)], '#afc1b03e', 1.3);
      plate(c, -.4, -.25, .34, .55, 25, p.stripe);
      poly(c, [iso(-.68, .834, 5), iso(-.4, .834, 5), iso(-.4, .834, 15), iso(-.68, .834, 15)], '#0a2028');
      const flag = iso(.7, -.65, 25); line(c, [flag, [flag[0], flag[1] - 24]], '#9aa993', 1.4); poly(c, [[flag[0], flag[1] - 23], [flag[0] + 13, flag[1] - 20], [flag[0] + 12, flag[1] - 12], [flag[0], flag[1] - 14]], p.accent);
    } else if (e.type === 'airfield') {
      plate(c, .1, .32, 2.3, 1.93, 5.5, '#31484a', '#96b2a54a');
      const ring = iso(.27, .31, 6); ellipse(c, ring[0], ring[1], 24, 12, null, '#b0c1ad', 1.5);
      line(c, [iso(.27, -.28, 6), iso(.27, .9, 6)], '#b0c1ad', 1.4); line(c, [iso(-.12, .31, 6), iso(.67, .31, 6)], '#b0c1ad', 1.4);
      prism(c, -.54, -.79, 1.44, .72, 26, [p.roof, p.side, p.dark], 5);
      prism(c, -.98, -.69, .39, .41, 21, [p.mid, p.dark, p.side], 30);
      prism(c, -.98, -.69, .52, .52, 8, [p.roof, p.accent, p.mid], 49);
      for (const u of [-1.15, 1.15]) for (const v of [-1.15, 1.15]) { const a = iso(u, v, 6); light(c, a[0], a[1], p.light, 2, true); }
      hazard(c, 1.19, 0, .16, 2.36, 6);
    } else if (e.type === 'relay') {
      prism(c, .13, .24, 1.38, 1.27, 15, [p.roof, p.side, p.dark], 5);
      for (const u of [-.26, .28]) line(c, [iso(u, -.23, 20), iso(0, -.23, 62)], '#b9c1aa', 2.5);
      for (let i = 0; i < 3; i++) line(c, [iso(-.2, -.23, 28 + i * 9), iso(.2, -.23, 36 + i * 9)], p.mid, 1.5);
      const a = iso(0, -.23, 62); ellipse(c, a[0], a[1], 13, 8, p.mid, p.light, 1.5);
      line(c, [[a[0] - 10, a[1] + 5], [a[0] + 12, a[1] - 7]], p.accent, 2); line(c, [[a[0] + 2, a[1] - 1], [a[0] + 6, a[1] - 13]], '#ddebd2', 1.5);
      light(c, a[0] + 6, a[1] - 13, '#f4bb76', 2, !reduced);
      prism(c, .25, .5, .5, .2, 6, [p.deep, p.accent, p.dark], 20);
    } else if (e.type === 'turret') {
      cylinder(c, 0, 0, .35, 14, p, 5);
      prism(c, 0, 0, .53, .62, 10, [p.roof, p.mid, p.dark], 19);
      for (const u of [-.16, .16]) { line(c, [iso(u, -.1, 28), iso(u, -.75, 32)], p.deep, 5); line(c, [iso(u, -.1, 29), iso(u, -.75, 33)], p.light, 2); }
      light(c, 0, -32, p.accent, 3, !reduced);
    }
    if(p.forest)forestArchitecture(c,e,p);
    if (!e.complete) {
      c.save(); c.globalAlpha *= .65; groundRing(c, e.size, '#f1ca77', true); c.restore();
      const a = e.size * .41;
      for (const [u, v] of [[-a, -a], [a, -a], [a, a], [-a, a]]) {
        line(c, [iso(u, v, 5), iso(u, v, 47)], '#bf9f59', 1.3);
        line(c, [iso(u, v, 47), iso(-u, v, 47)], '#c8b88470', 1);
      }
      line(c, [iso(-a, a, 6 + 40 * (e.progress || 0)), iso(a, a, 6 + 40 * (e.progress || 0))], '#ffe8aa', 2);
    }
  }
  function vehicleProjection(angle) { const ca = Math.cos(angle), sa = Math.sin(angle); return (u, v, z = 0) => iso(-sa * u + ca * v, ca * u + sa * v, z); }
  function drawVehicle(c, e, p, angle, time, reduced) {
    const project = vehicleProjection(angle), type = e.type;
    shadow(c, type === 'scout' ? 14 : 23, type === 'scout' ? 7 : 11);
    const tracks = type === 'scout' ? .28 : type === 'harvester' ? .48 : .4;
    const length = type === 'siege' ? 1 : type === 'scout' ? .55 : .88;
    for (const side of [-1, 1]) {
      prism(c, side * tracks, 0, .18, length, 6, ['#526263', '#111f25', '#26373b'], 1, project);
      for (let i = 0; i < 5; i++) line(c, [project(side * tracks - .1, -length * .42 + i * length * .2, 7), project(side * tracks + .1, -length * .42 + i * length * .2, 7)], '#81908570', 1.1);
    }
    const bodyWidth = type === 'harvester' ? .8 : type === 'scout' ? .43 : .65;
    prism(c, 0, 0, bodyWidth, length * .91, 9, [p.roof, p.side, p.dark], 6, project);
    if (type === 'harvester') {
      prism(c, 0, -.17, .63, .56, 6, ['#353e3a', '#6a6350', '#4b5045'], 15, project);
      if (e.cargo > 0) for (let i = 0; i < 5; i++) { const u = (i % 3 - 1) * .16, v = -.29 + Math.floor(i / 3) * .22, q = project(u, v, 22 + i % 2 * 2); poly(c, [[q[0] - 3, q[1]], [q[0], q[1] - 6], [q[0] + 4, q[1] - 2], [q[0] + 2, q[1] + 3]], i % 2 ? '#c7a84d' : '#ecd38b', '#7b693b', .5); }
      prism(c, 0, .36, .54, .33, 9, [p.mid, p.accent, p.side], 14, project);
      hazard(c, 0, -.29, .62, .15, 21, project);
      for (const u of [-.48, .48]) line(c, [project(u, .28, 8), project(u, .7, 4)], '#b8a27b', 3);
      line(c, [project(-.46, .67, 4), project(.46, .67, 4)], '#bac2aa', 4);
    } else if (type === 'siege') {
      prism(c, 0, -.13, .56, .58, 8, [p.mid, p.side, p.dark], 15, project);
      for (const u of [-.12, .12]) { line(c, [project(u, -.02, 22), project(u, 1.14, 34)], '#132a32', 5); line(c, [project(u, -.02, 24), project(u, 1.14, 36)], '#b3c8bd', 2); }
      prism(c, 0, -.38, .29, .2, 7, [p.accent, p.mid, p.dark], 23, project);
      for (const u of [-.59, .59]) line(c, [project(u * .5, -.31, 6), project(u, -.62, 0)], '#5b6960', 3);
    } else if (type === 'tank') {
      prism(c, 0, -.02, .47, .46, 8, [p.roof, p.mid, p.dark], 15, project);
      line(c, [project(0, .05, 24), project(0, .92, 26)], p.deep, 6);
      line(c, [project(-.025, .05, 26), project(-.025, .92, 28)], '#acccbd', 2.6);
      prism(c, .07, -.1, .16, .15, 2, [p.accent, p.side, p.dark], 24, project);
      line(c, [project(-.2, -.3, 24), project(-.2, -.3, 35)], '#bdcbbc', 1);
    } else {
      prism(c, 0, .04, .32, .3, 6, [p.light, p.accent, p.dark], 15, project);
      line(c, [project(0, .1, 22), project(0, .51, 22)], '#162b33', 3);
      const a = project(-.17, -.21, 19); line(c, [a, [a[0], a[1] - 15]], '#a8c9b2', 1);
    }
    if(p.forest){for(const side of[-1,1])poly(c,[project(side*bodyWidth*.44,-.35,16),project(side*bodyWidth*.72,-.46,24),project(side*bodyWidth*.61,.22,16),project(side*bodyWidth*.25,.34,16)],p.mid,p.accent,.7);}
    for (const u of [-bodyWidth * .35, bodyWidth * .35]) { const a = project(u, length * .47, 13); light(c, a[0], a[1], '#f4eed0', 1.9); }
    if (e.cargo) { c.fillStyle = '#15241f'; c.fillRect(-15, 13, 30, 3); c.fillStyle = '#e0c56d'; c.fillRect(-15, 13, 30 * clamp(e.cargo / 200, 0, 1), 3); }
  }
  function drawInfantry(c, e, p, angle, time, reduced, moving) {
    const gait = moving && !reduced ? Math.sin(time * 15 + e.id) * 2.2 : .7;
    const dir = [Math.cos(angle) * 5 - Math.sin(angle) * 5, (Math.cos(angle) + Math.sin(angle)) * 2.7];
    shadow(c, 7, 3, 1.5);
    line(c, [[-2, -8], [-3 - gait, -2], [-5 - gait, 1]], '#12252b', 3.2);
    line(c, [[2, -8], [3 + gait, -2], [4 + gait, 1]], '#203439', 3.2);
    poly(c, [[-5, -17], [3, -18], [5, -10], [2, -7], [-4, -9]], p.mid, '#102429', 1);
    poly(c, [[-5, -17], [0, -18], [1, -10], [-4, -11]], p.roof);
    c.fillStyle = p.accent; c.fillRect(-4, -15, 2, 4);
    poly(c, [[-4, -22], [0, -25], [5, -22], [5, -18], [1, -16], [-3, -18]], '#8c9d92', '#213536', .8);
    line(c, [[0, -21], [5, -21]], p.light, 1.6);
    if(p.forest){poly(c,[[-5,-22],[-8,-30],[-1,-26],[2,-32],[5,-24]],p.roof,p.accent,.7);}
    if (e.type === 'lancer') {
      line(c, [[-3, -16], [dir[0] * 2 + 3, -17 + dir[1] * 2]], '#172832', 5.5);
      line(c, [[-4, -17], [dir[0] * 2 + 3, -18 + dir[1] * 2]], '#a7b6a7', 2.3);
      c.fillStyle = '#c7a561'; c.fillRect(-6, -17, 3, 4);
    } else if (e.type === 'engineer') {
      line(c, [[3, -15], [9, -9]], '#b7a66a', 3);
      poly(c, [[7, -13], [12, -11], [11, -7], [7, -8]], '#e3bb62', '#715d37', 1);
      line(c, [[-5, -14], [-8, -8]], p.mid, 3); c.fillStyle = '#cab268'; c.fillRect(-8, -15, 4, 7);
      line(c, [[-1, -22], [3, -22]], '#f8d578', 2);
    } else {
      line(c, [[3, -15], [dir[0] + 5, -13 + dir[1]]], p.mid, 3);
      line(c, [[-1, -13], [dir[0] * 1.75 + 5, -14 + dir[1] * 1.7]], '#142329', 3);
      line(c, [[dir[0] + 3, -15 + dir[1]], [dir[0] * 1.8 + 5, -15 + dir[1] * 1.7]], '#bdd0ba', 1);
    }
  }
  function drawFlyer(c, e, p, angle, time, reduced) {
    shadow(c, 22, 9, 9); c.save(); c.translate(0, -28 + (reduced ? 0 : Math.sin(time * 2 + e.id) * 1.5));
    const pr = vehicleProjection(angle);
    poly(c, [pr(0, 1), pr(.19, .22), pr(.88, -.35), pr(.76, -.55), pr(.18, -.3), pr(0, -.72), pr(-.18, -.3), pr(-.76, -.55), pr(-.88, -.35), pr(-.19, .22)], p.mid, '#182d36', 1.5);
    poly(c, [pr(0, .96, 2), pr(.2, -.07, 3), pr(0, -.49, 5), pr(-.2, -.07, 3)], p.roof, p.light, .8);
    poly(c, [pr(0, .5, 4), pr(.095, .06, 6), pr(-.095, .06, 6)], p.accent);
    for (const u of [-.45, .45]) { line(c, [pr(u, -.23, 1), pr(u, -.65, 1)], p.deep, 6); line(c, [pr(u, -.53, 1), pr(u, -.72 - (reduced ? 0 : .1 * Math.sin(time * 20)), 1)], p.light, 2.5); }
    if(p.forest){for(const side of[-1,1])poly(c,[pr(side*.15,.2,3),pr(side*1.13,-.04,2),pr(side*.76,-.53,5),pr(side*.28,-.18,4)],p.roof,p.accent,1);}
    c.restore();
  }
  function drawRock(c, seed, large = false, colors=BIOMES.delta.rock) {
    const sx = large ? 1.3 : 1, h = 12 + seed * 17;
    poly(c, [[-20 * sx, 1], [-12 * sx, -h], [3, -h - 5], [20 * sx, -8], [19 * sx, 5], [1, 13]], colors[0], '#1e3236', .8);
    poly(c, [[-20 * sx, 1], [-12 * sx, -h], [3, -h - 5], [-2, -2], [1, 13]], colors[1]);
    poly(c, [[3, -h - 5], [20 * sx, -8], [-2, -2]], colors[2]);
    line(c, [[-10, -h + 3], [1, -h + 1], [8, -12]], '#b4b69a55', 1);
    poly(c, [[14, 10], [22, 5], [27, 10], [22, 14]], '#5f6b62');
  }
  function drawOre(c, amount, seed) {
    shadow(c, 15, 7);
    const colors = ['#f1d68b', '#dbb861', '#a78544'];
    for (let i = 0; i < 4; i++) {
      const x = (i % 2 * 15 - 8) + seed * 2, y = Math.floor(i / 2) * 7 - 5, h = 8 + ((i + seed * 3) % 3) * 3;
      poly(c, [[x - 5, y], [x - 2, y - h], [x + 3, y - h - 3], [x + 6, y - 2], [x + 1, y + 4]], colors[i % 3], '#72623e', .6);
      poly(c, [[x - 2, y - h], [x + 3, y - h - 3], [x + 1, y + 4]], '#f7e7ad');
    }
    if (amount < 100) { c.fillStyle = '#66715c90'; c.fillRect(-10, 3, 20, 3); }
  }
  function drawForestObstacle(c,seed){
    shadow(c,20,10);prism(c,0,0,.23,.22,32,['#746b4b','#3c4330','#535238'],0);
    for(let i=0;i<3;i++){const h=22+i*12,r=24-i*5;poly(c,[[-r,3-i*8],[0,-h-15],[r,3-i*8],[0,12-i*8]],i%2?'#3a6350':'#426f57','#233e33',.8);poly(c,[[0,-h-15],[r,3-i*8],[0,12-i*8]],'#31523e');line(c,[[0,-h-12],[-r+4,2-i*8]],'#73977566',1);}
    if(seed>.5)line(c,[[-15,8],[-22,11],[-25,10]],'#9aa278',1.3);
  }
  function drawIndustrialObstacle(c,seed){
    shadow(c,23,10);prism(c,0,0,.92,.88,19,['#7c7260','#4c534c','#5c5d50']);prism(c,.02,-.07,.76,.65,9,['#a19b81','#6a6e5d','#797663'],19);for(let i=0;i<4;i++)line(c,[iso(-.32+i*.2,.45,3),iso(-.32+i*.2,.45,18)],'#bbc1a438',1);hazard(c,.1,.44,.48,.08,18.5);if(seed>.65){const p=iso(-.21,-.18,30);line(c,[p,[p[0]-9,p[1]-19],[p[0]-4,p[1]-22]],'#929988',1.3);}
  }
  function drawRuin(c, e) {
    const s = e.size || 1;
    prism(c, 0, 0, s * .76, s * .7, 8, ['#69746b', '#364743', '#465650']);
    prism(c, -.22 * s, -.1 * s, .19, .7 * s, 22, ['#7c8473', '#4a5550', '#596457'], 4);
    prism(c, .16 * s, -.22 * s, .55 * s, .14, 13, ['#7c8473', '#3f4c43', '#555f4d'], 4);
    line(c, [iso(-.22 * s, -.32 * s, 31), iso(-.11 * s, -.2 * s, 44), iso(.12 * s, -.25 * s, 38)], '#8f8e74', 1.5);
    for (let i = 0; i < 4; i++) { const q = iso((i % 2 - .5) * s * .45, .15 + Math.floor(i / 2) * .21); poly(c, [[q[0] - 7, q[1]], [q[0] - 4, q[1] - 5], [q[0] + 5, q[1] - 3], [q[0] + 7, q[1] + 3]], '#6f725e', '#31433c', .6); }
  }
  function create(canvas, minimap) {
    if (!canvas || !canvas.getContext) throw new Error('Stormfront renderer needs a canvas');
    const mainContext = canvas.getContext('2d', { alpha: false }); let c = mainContext;
    const terrainCanvas = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(1, 1) : canvas.ownerDocument?.createElement('canvas');
    const terrainContext = terrainCanvas?.getContext('2d', { alpha: false });
    const viewportTerrainCanvas=typeof OffscreenCanvas!=='undefined'?new OffscreenCanvas(1,1):canvas.ownerDocument?.createElement('canvas');
    const viewportTerrainContext=viewportTerrainCanvas?.getContext('2d',{alpha:false});let viewportTerrainKey='',terrainRevision=0;
    let terrainCacheKey='',terrainTileState=[],terrainLastTick=-1,worldOriginX=0,worldOriginY=60;
    const mc = minimap && minimap.getContext('2d', { alpha: false });
    const camera = { x: 0, y: 0, zoom: 1 };
    let w = 1, h = 1, mw = 1, mh = 1, dpr = 1, lastView = null, prevTick = -1, previousEntities = new Map(), previousShots = new Map();
    let effects = [], frame = 0, metrics = { tiles: 0, entities: 0, effects: 0, terrainUpdates: 0 };
    const facings = new Map(), transitions = new Map(), drawnPositions = new Map();let wasPaused=false;
    function reset(){previousEntities.clear();previousShots.clear();effects=[];facings.clear();transitions.clear();drawnPositions.clear();prevTick=-1;lastView=null;wasPaused=false;terrainCacheKey='';terrainTileState=[];terrainLastTick=-1;viewportTerrainKey='';}
    function observedPosition(e) {
      let x = e.x + (e.size - 1) / 2, y = e.y + (e.size - 1) / 2;
      const next = e.kind === 'unit' && e.edge;
      if (next) { const dx = next.x - e.x, dy = next.y - e.y, distance = Math.hypot(dx, dy); if (distance > 0 && distance <= Math.SQRT2 + .01) { const f = clamp((e.move || 0) / distance, 0, 1); x += dx * f; y += dy * f; } }
      return { x, y };
    }
    function entityPosition(e) { const p = drawnPositions.get(typeof e === 'object' ? e.id : e); return p ? { ...p } : typeof e === 'object' ? observedPosition(e) : null; }
    function fit(el, context) {
      if (!el || !context) return { w: 1, h: 1 };
      const r = el.getBoundingClientRect(), width = Math.max(1, r.width || el.clientWidth || 1), height = Math.max(1, r.height || el.clientHeight || 1);
      if (el.width !== Math.round(width * dpr) || el.height !== Math.round(height * dpr)) { el.width = Math.round(width * dpr); el.height = Math.round(height * dpr); }
      context.setTransform(dpr, 0, 0, dpr, 0, 0); return { w: width, h: height };
    }
    function resize() { dpr = clamp(rootPixelRatio(), 1, 2); const a = fit(canvas, c), b = fit(minimap, mc); w = a.w; h = a.h; mw = b.w; mh = b.h; terrainCacheKey = ''; }
    function rootPixelRatio() { return typeof globalThis !== 'undefined' && globalThis.devicePixelRatio || 1; }
    function worldToScreen(x, y) { return { x: ((x - camera.x) - (y - camera.y)) * HW * camera.zoom + w / 2, y: ((x - camera.x) + (y - camera.y)) * HH * camera.zoom + h / 2 }; }
    function screenToWorld(px, py) { const a = (px - w / 2) / (HW * camera.zoom), b = (py - h / 2) / (HH * camera.zoom); return { x: camera.x + (a + b) / 2, y: camera.y + (b - a) / 2 }; }
    function centerOn(x, y) { camera.x = Number.isFinite(x) ? x : camera.x; camera.y = Number.isFinite(y) ? y : camera.y; }
    function zoomBy(factor, x = w / 2, y = h / 2) {
      const before = screenToWorld(x, y); camera.zoom = clamp(camera.zoom * factor, .52, 2.15); const after = screenToWorld(x, y); camera.x += before.x - after.x; camera.y += before.y - after.y; return camera.zoom;
    }
    function onscreen(p, margin = 100) { return p.x > -margin && p.y > -margin && p.x < w + margin && p.y < h + margin; }
    function inSight(v, x, y) { const ix = Math.round(x), iy = Math.round(y); return ix >= 0 && iy >= 0 && ix < v.width && iy < v.height && !!v.visible[iy * v.width + ix]; }
    function track(v, time) {
      if (v.tick === prevTick && lastView && v.mission === lastView.mission) return;
      if (prevTick > v.tick || lastView && (lastView.mission !== v.mission || lastView.width !== v.width)) { previousEntities.clear(); previousShots.clear(); effects = []; facings.clear(); transitions.clear(); drawnPositions.clear(); }
      const now = new Map();
      for (const e of v.entities || []) {
        const old = previousEntities.get(e.id), observed = observedPosition(e);
        if (old && e.kind === 'unit') transitions.set(e.id, { x: old.rx, y: old.ry, toX: observed.x, toY: observed.y, at: v.time ?? v.tick * .1 });
        if (old && e.hp < old.hp && inSight(v, e.x, e.y)) effects.push({ x: e.x + (e.size - 1) / 2, y: e.y + (e.size - 1) / 2, at: time, kind: 'hit', seed: e.id });
        now.set(e.id, { x: e.x, y: e.y, rx: observed.x, ry: observed.y, hp: e.hp, size: e.size, kind: e.kind, owner: e.owner });
      }
      for (const [id, e] of previousEntities) if (!now.has(id) && (e.owner === 0 || e.kind === 'building') && inSight(v, e.x, e.y)) effects.push({ x: e.x + (e.size - 1) / 2, y: e.y + (e.size - 1) / 2, at: time, kind: 'blast', seed: id });
      const shots = new Map();
      for (const b of v.projectiles || []) { shots.set(b.id, b); if (!previousShots.has(b.id)) effects.push({ x: b.x, y: b.y, at: time, kind: 'muzzle', seed: b.id, owner: b.owner }); }
      effects = effects.filter(q => time - q.at < 1.2).slice(-64);
      previousEntities = now; previousShots = shots; prevTick = v.tick;
      for (const id of transitions.keys()) if (!now.has(id)) transitions.delete(id);
      for (const id of facings.keys()) if (!now.has(id)) facings.delete(id);
      for (const id of drawnPositions.keys()) if (!now.has(id)) drawnPositions.delete(id);
    }
    function tile(v,x,y,time,reduced,worldPoint=null){
      const t=v.terrain[y][x],visible=v.visible[y*v.width+x],p=worldPoint||worldToScreen(x,y),z=worldPoint?1:camera.zoom;
      if(t==='?')return;
      c.save(); c.translate(p.x, p.y); c.scale(z, z);
      const n = noise(x, y), pts = [[0, -HH], [HW, 0], [0, HH], [-HW, 0]];
      if (t === '?') { poly(c, pts, n > .5 ? '#101c24' : '#111e26', '#102029', .3); if (n > .96) { c.fillStyle = '#25343b'; c.fillRect(-1, -1, 1, 1); } c.restore(); return; }
      const colors=biome(v),base = t === '~' ? colors.water[n>.5?0:1] : t === '=' ? '#667467' : colors.ground[Math.floor(n * 5)];
      poly(c, pts, base, t === '~' ? '#3c626533' : '#7b92712a', .45);
      if (t === '~') {
        if (!reduced || n > .64) { const shift = reduced ? 0 : Math.sin(time * .65 + x * .7 + y) * 2; line(c, [[-13 + shift, -3], [-5 + shift, -1], [3 + shift, -3]], '#78968a38', .8); if (n > .6) line(c, [[2 - shift, 4], [12 - shift, 2], [15 - shift, 3]], '#789e9942', .8); }
        for (const [dx, dy, a, b] of [[-1, 0, [-25, 0], [0, -13]], [0, -1, [0, -13], [25, 0]], [1, 0, [25, 0], [0, 13]], [0, 1, [0, 13], [-25, 0]]]) if (v.terrain[y + dy]?.[x + dx] && !['~', '?', '='].includes(v.terrain[y + dy][x + dx])) { line(c, [a, b], '#9eaa8270', 3); line(c, [a, b], '#bbcab07a', .8); }
      } else if (t === '=') {
        poly(c, [[-25, 0], [0, 13], [25, 0], [25, 6], [0, 19], [-25, 6]], '#354742');
        poly(c, [[0, -13], [25, 0], [0, 13], [-25, 0]], '#6d796b', '#a3ac8a77', .9);
        for (let i = -.4; i < .5; i += .2) line(c, [iso(i, -.47), iso(i, .47)], '#364b4790', 1.2);
        const horizontal = v.terrain[y]?.[x - 1] === '=' || v.terrain[y]?.[x + 1] === '=';
        for (const side of [-.44, .44]) { const a = horizontal ? iso(-.49, side, 5) : iso(side, -.49, 5), b = horizontal ? iso(.49, side, 5) : iso(side, .49, 5); line(c, [a, b], '#c9bea0', 1.9); line(c, [[a[0], a[1]], [a[0], a[1] + 6]], '#a6ad95', 1.4); }
      } else {
        if (n > .62) { line(c, [[-14, 1], [-7, -1], [1, 2], [8, 1]], '#334d414b', .9); }
        if (n < .32) { for (let i = 0; i < 3; i++) { const a = noise(x, y, i + 1), tx = (a - .5) * 27, ty = (noise(y, x, i + 3) - .5) * 11; line(c, [[tx, ty], [tx + 1, ty - 2], [tx + 3, ty]], '#71816170', .8); } }
        if (n > .92) { poly(c, [[-6, 1], [-3, -2], [1, -1], [3, 2], [-1, 3]], '#6a7964', '#7d8b7160', .4); }
      }
      if (!visible) poly(c, pts, '#061622a8');
      else {
        // Delineate the knowledge boundary without exposing hidden terrain.
        for (const [dx, dy, a, b] of [[-1, 0, [-25, 0], [0, -13]], [0, -1, [0, -13], [25, 0]], [1, 0, [25, 0], [0, 13]], [0, 1, [0, 13], [-25, 0]]]) if (!v.visible[(y + dy) * v.width + x + dx]) line(c, [a, b], '#5b989557', .85);
      }
      c.restore(); metrics.tiles++;
    }
    function drawTerrainWorld(v){
      if(!terrainContext)return false;
      const key=[v.mission,v.width,v.height,v.biome||'delta'].join('|');
      if(key!==terrainCacheKey||v.tick<terrainLastTick){terrainCacheKey=key;worldOriginX=v.height*HW+60;worldOriginY=60;terrainCanvas.width=(v.width+v.height)*HW+120;terrainCanvas.height=(v.width+v.height)*HH+140;terrainContext.setTransform(1,0,0,1,0,0);terrainContext.fillStyle='#0c1921';terrainContext.fillRect(0,0,terrainCanvas.width,terrainCanvas.height);terrainTileState=Array(v.width*v.height).fill('');terrainLastTick=-1;}
      if(terrainLastTick!==v.tick){const dirty=new Set();for(let y=0;y<v.height;y++)for(let x=0;x<v.width;x++){const i=y*v.width+x,state=v.terrain[y][x]+(v.visible[i]||0);if(terrainTileState[i]===state)continue;terrainTileState[i]=state;dirty.add(i);for(const [dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]])if(x+dx>=0&&x+dx<v.width&&y+dy>=0&&y+dy<v.height)dirty.add((y+dy)*v.width+x+dx);}
        const before=metrics.tiles;
        if(dirty.size){c=terrainContext;c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.save();let redraw;
          if(dirty.size>v.width*v.height/2){c.fillStyle='#0c1921';c.fillRect(0,0,terrainCanvas.width,terrainCanvas.height);redraw=Array.from({length:v.width*v.height},(_,i)=>i);}
          else{const affected=new Set();c.beginPath();for(const i of dirty){const x=i%v.width,y=Math.floor(i/v.width),px=(x-y)*HW+worldOriginX,py=(x+y)*HH+worldOriginY;c.rect(px-27,py-22,54,44);for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++)if(x+dx>=0&&x+dx<v.width&&y+dy>=0&&y+dy<v.height)affected.add((y+dy)*v.width+x+dx);}c.clip();c.fillStyle='#0c1921';c.fillRect(0,0,terrainCanvas.width,terrainCanvas.height);redraw=[...affected];}
          redraw.sort((a,b)=>(a%v.width+Math.floor(a/v.width))-(b%v.width+Math.floor(b/v.width))||a-b);
          for(const i of redraw){const x=i%v.width,y=Math.floor(i/v.width);tile(v,x,y,0,true,{x:(x-y)*HW+worldOriginX,y:(x+y)*HH+worldOriginY});}c.restore();terrainRevision++;}
        metrics.terrainUpdates=metrics.tiles-before;metrics.tiles=before;c=mainContext;terrainLastTick=v.tick;
      }
      const z=camera.zoom,dx=w/2-(camera.x-camera.y)*HW*z-worldOriginX*z,dy=h/2-(camera.x+camera.y)*HH*z-worldOriginY*z;
      const sx=Math.max(0,-dx/z),sy=Math.max(0,-dy/z),ex=Math.min(terrainCanvas.width,(w-dx)/z),ey=Math.min(terrainCanvas.height,(h-dy)/z);
      const viewportKey=[key,terrainRevision,camera.x,camera.y,z,w,h,dpr].join('|');
      if(viewportTerrainContext){if(viewportTerrainKey!==viewportKey){if(viewportTerrainCanvas.width!==canvas.width||viewportTerrainCanvas.height!==canvas.height){viewportTerrainCanvas.width=canvas.width;viewportTerrainCanvas.height=canvas.height;}const pc=viewportTerrainContext;pc.setTransform(dpr,0,0,dpr,0,0);pc.fillStyle='#0c1921';pc.fillRect(0,0,w,h);if(ex>sx&&ey>sy)pc.drawImage(terrainCanvas,sx,sy,ex-sx,ey-sy,dx+sx*z,dy+sy*z,(ex-sx)*z,(ey-sy)*z);viewportTerrainKey=viewportKey;}c.drawImage(viewportTerrainCanvas,0,0,viewportTerrainCanvas.width,viewportTerrainCanvas.height,0,0,w,h);}
      else if(ex>sx&&ey>sy)c.drawImage(terrainCanvas,sx,sy,ex-sx,ey-sy,dx+sx*z,dy+sy*z,(ex-sx)*z,(ey-sy)*z);
      return true;
    }
    function objectiveMark(e, v) {
      if (!e.tag) return null;
      let visible = false;
      for (let y = e.y; y < e.y + e.size && !visible; y++) for (let x = e.x; x < e.x + e.size; x++) if (v.visible[y * v.width + x]) { visible = true; break; }
      if (!visible) return null;
      const o = v.objective || {};
      if (o.destroyTags?.includes(e.tag)) return { kind: 'destroy', color: '#f5c37c', label: '摧毀' };
      if (o.targetTags?.includes(e.tag)) return { kind: 'capture', color: '#a0f2d1', label: e.owner === 0 ? '已接管' : '接管' };
      if (o.protectTags?.includes(e.tag)) return { kind: 'protect', color: '#aad9f1', label: '守護' };
      return null;
    }
    function objectiveIcon(ctx, x, y, mark, scale = 1) {
      ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
      if (mark.kind === 'capture') {
        line(ctx, [[-4, 6], [-4, -6]], mark.color, 1.6);
        poly(ctx, [[-3, -6], [6, -4], [4, 1], [-3, -1]], mark.color, null);
      } else if (mark.kind === 'destroy') {
        poly(ctx, [[0, -7], [6, 0], [0, 7], [-6, 0]], '#412f2255', mark.color, 1.5);
        line(ctx, [[-2, -2], [2, 2]], mark.color, 1.4); line(ctx, [[2, -2], [-2, 2]], mark.color, 1.4);
      } else {
        poly(ctx, [[-6, -5], [0, -7], [6, -5], [5, 2], [0, 7], [-5, 2]], '#193c4855', mark.color, 1.5);
        line(ctx, [[-2, 0], [0, 2], [3, -2]], mark.color, 1.2);
      }
      ctx.restore();
    }
    function objectiveBadge(e, v, p, z) {
      const mark = objectiveMark(e, v); if (!mark) return;
      const spriteHeight = e.kind === 'building' ? e.type === 'relay' ? 85 : e.type === 'power' ? 76 : e.size * 12 + 49 : e.type === 'flyer' ? 54 : 38;
      const y = p.y - spriteHeight * z - 16;
      const width = mark.label.length > 2 ? 64 : 53;
      c.save();
      c.fillStyle = '#0b202ae8'; c.fillRect(p.x - width / 2, y - 10, width, 20);
      c.strokeStyle = mark.color + '75'; c.lineWidth = .7; c.strokeRect(p.x - width / 2 + .5, y - 9.5, width - 1, 19);
      objectiveIcon(c, p.x - width / 2 + 10, y, mark, .88);
      c.fillStyle = mark.color; c.font = '600 10px sans-serif'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(mark.label, p.x - width / 2 + 21, y + .5);
      line(c, [[p.x, y + 11], [p.x, y + 15]], mark.color + '99', 1);
      c.restore();
    }
    function drawEntity(e, v, options, time, selected, entitiesById) {
      const z=camera.zoom,faction=e.owner===0?(v.faction||0):1-(v.faction||0),p=palette(e.owner,faction);
      const observed = observedPosition(e); let ex = observed.x, ey = observed.y;
      const tr = transitions.get(e.id);
      // Accumulated edge distance is authoritative simulation state. Interpolate between
      // previous and current observed samples; never extrapolate using velocity or elapsed time.
      if (tr && e.kind === 'unit' && !options.paused && !v.paused && !options.reduced) { const f = clamp((time - tr.at) / .1, 0, 1); ex = tr.x + (tr.toX - tr.x) * f; ey = tr.y + (tr.toY - tr.y) * f; }
      drawnPositions.set(e.id, { x: ex, y: ey });
      const s = worldToScreen(ex, ey); if (!onscreen(s, 170 * z)) return;
      c.save(); c.translate(s.x, s.y); c.scale(z, z);
      if (selected) groundRing(c, e.size, '#9dffee');
      let dx = e.x - (e.prevX ?? e.x), dy = e.y - (e.prevY ?? e.y);
      const order = e.orders?.[0], target = order?.target && entitiesById.get(order.target);
      if (target) { dx = target.x - e.x; dy = target.y - e.y; }
      else if (!dx && !dy && order && Number.isFinite(order.x)) { dx = order.x - e.x; dy = order.y - e.y; }
      const angle = dx || dy ? Math.atan2(dy, dx) : facings.get(e.id) ?? -.35;
      facings.set(e.id, angle);
      if (e.kind === 'building') { if (!e.complete) c.globalAlpha = .68; drawBuilding(c, e, p, time, options.reduced); c.globalAlpha = 1; }
      else if (e.kind === 'debris') drawRuin(c, e);
      else if (['rifle', 'lancer', 'engineer'].includes(e.type)) drawInfantry(c, e, p, angle, time, options.reduced, e.path?.length > 0);
      else if (e.type === 'flyer') drawFlyer(c, e, p, angle, time, options.reduced);
      else drawVehicle(c, e, p, angle, time, options.reduced);
      if (e.hp < e.maxHp || selected || !e.complete || e.captureProgress) {
        const width = e.kind === 'building' ? Math.max(32, e.size * 23) : 25, top = e.kind === 'building' ? -(e.type === 'relay' ? 85 : e.type === 'power' ? 76 : e.size * 12 + 49) : e.type === 'flyer' ? -54 : -38;
        c.fillStyle = '#07181fdd'; c.fillRect(-width / 2 - 1, top - 1, width + 2, 5);
        c.fillStyle = e.hp / e.maxHp > .5 ? p.accent : e.hp / e.maxHp > .25 ? '#e1c36d' : '#e77955'; c.fillRect(-width / 2, top, width * clamp(e.hp / e.maxHp, 0, 1), 3);
        if (e.kind === 'building') { for (let i = 1; i < 6; i++) { c.fillStyle = '#10232888'; c.fillRect(-width / 2 + width * i / 6, top, 1, 3); } }
        if (!e.complete || e.queue?.length || e.captureProgress) { c.fillStyle = '#14282bdd'; c.fillRect(-width / 2, top + 6, width, 3); c.fillStyle = e.captureProgress ? '#e5b67d' : '#f0d285'; c.fillRect(-width / 2, top + 6, width * clamp(e.captureProgress || (!e.complete ? e.progress : e.queue[0].progress), 0, 1), 3); }
      } else if (e.queue?.length) { c.fillStyle = '#162628'; c.fillRect(-20, 17, 40, 3); c.fillStyle = '#e2c677'; c.fillRect(-20, 17, 40 * clamp(e.queue[0].progress || 0, 0, 1), 3); }
      if (e.kind === 'building' && e.complete && e.powerState) {
        const top = -(e.type === 'relay' ? 85 : e.type === 'power' ? 76 : e.size * 12 + 49), off = e.powerState === 'off';
        c.fillStyle = '#101e25ee'; c.fillRect(-23, top + 12, 46, 15); c.strokeStyle = off ? '#f3aa83' : '#efd382'; c.lineWidth = 1; c.strokeRect(-23, top + 12, 46, 15);
        line(c, [[-14, top + 14], [-18, top + 20], [-13, top + 20], [-16, top + 25]], off ? '#f3aa83' : '#efd382', 1.5);
        if (off) line(c, [[-21, top + 14], [-10, top + 25]], '#f3aa83', 1.2);
        c.fillStyle = off ? '#f3aa83' : '#efd382'; c.font = '700 8px sans-serif'; c.textAlign = 'center'; c.fillText(off ? 'OFF' : 'SLOW', 5, top + 23);
      }
      if (selected && e.orders?.length) { const mark = e.orders[0].kind; if (['hold', 'repair', 'capture'].includes(mark)) { c.fillStyle = mark === 'repair' ? '#bfe6b0' : '#e8d292'; c.font = '700 10px sans-serif'; c.textAlign = 'center'; c.fillText(mark === 'hold' ? 'Ⅱ' : mark === 'repair' ? '+' : '◇', 0, 25); } }
      if (e.tag === 'convoy') { c.strokeStyle = '#f6df97'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-6, -45); c.lineTo(0, -40); c.lineTo(6, -45); c.stroke(); }
      c.restore(); objectiveBadge(e, v, s, z); metrics.entities++;
    }
    function drawOrders(v, selection) {
      for (const e of (v.entities || [])) if (selection.has(e.id) && e.orders?.length) {
        const start = worldToScreen(e.x + (e.size - 1) / 2, e.y + (e.size - 1) / 2), pts = [[start.x, start.y]];
        for (const o of e.orders) if (Number.isFinite(o.x)) { const q = worldToScreen(o.x, o.y); pts.push([q.x, q.y]); }
        if (pts.length > 1) { c.save(); c.setLineDash([5, 6]); line(c, pts, '#d2e1aa65', 1.2); c.setLineDash([]); for (const q of pts.slice(1)) { ellipse(c, q[0], q[1], 5 * camera.zoom, 2.6 * camera.zoom, null, '#ddedbe9a', 1); } c.restore(); }
      }
    }
    function drawEffects(v, time, reduced) {
      const z = camera.zoom;
      for (const b of (v.projectiles || []).slice(0, 180)) {
        const p = worldToScreen(b.x, b.y); if (!onscreen(p, 20)) continue;
        const target = worldToScreen(b.tx, b.ty), dx = target.x - p.x, dy = target.y - p.y, len = Math.hypot(dx, dy) || 1, tail = b.weapon === 'siege' ? 13 : b.weapon === 'arc' ? 16 : 8;
        const color = b.owner === 0 ? '#c0fff1' : '#ffd09c';
        c.save(); c.translate(p.x, p.y - 11 * z); c.lineCap = 'round';
        if (b.weapon === 'arc') line(c, [[-dx / len * tail, -dy / len * tail], [-dx / len * tail * .5 + 2, -dy / len * tail * .5 - 2], [0, 0]], color, 1.8 * z);
        else { line(c, [[-dx / len * tail * z, -dy / len * tail * z], [0, 0]], color + '88', 2.5 * z); ellipse(c, 0, 0, (b.weapon === 'siege' ? 3 : 1.8) * z, 1.6 * z, '#fff4d9'); }
        c.restore();
      }
      const limit = reduced ? 10 : 56;
      for (const f of effects.slice(-limit)) {
        const age = Math.max(0, time - f.at), life = f.kind === 'blast' ? 1.1 : .45; if (age >= life || !inSight(v, f.x, f.y)) continue;
        const p = worldToScreen(f.x, f.y); if (!onscreen(p, 60)) continue;
        c.save(); c.translate(p.x, p.y - (f.kind === 'muzzle' ? 16 : 7) * z); c.scale(z, z); const a = age / life;
        c.globalAlpha = 1 - a;
        if (f.kind === 'muzzle') { poly(c, [[-2, 0], [-8, -2], [-2, -3], [0, -9], [3, -3], [9, -1], [2, 1]], f.owner === 0 ? '#d8ffcf' : '#ffdc97'); }
        else {
          const size = f.kind === 'blast' ? 25 : 12;
          if (a < .35) { ellipse(c, 0, 0, size * (.3 + a), size * (.3 + a), '#ffe2a3'); ellipse(c, 0, 0, size * .25, size * .25, '#fff8d3'); }
          for (let i = 0; i < (reduced ? 3 : 7); i++) { const angle = i * TAU / 7 + f.seed, rr = (8 + a * size) * (.5 + noise(i, f.seed)), xx = Math.cos(angle) * rr, yy = Math.sin(angle) * rr - a * 10; if (a < .6) line(c, [[xx, yy], [xx * 1.22, yy * 1.22]], i % 2 ? '#f7bb6a' : '#fce4af', 1.5); if (f.kind === 'blast') ellipse(c, xx * .6, yy - a * 14, 5 + a * 8, 4 + a * 7, '#435249b0'); }
        }
        c.restore(); metrics.effects++;
      }
    }
    function draw(v, options = {}) {
      if (!v || !v.terrain) return metrics;
      if (!w || canvas.width === 0) resize();
      const z = clamp(camera.zoom || 1, .52, 2.15); camera.zoom = z;
      const paused = options.paused ?? v.paused, time = (v.time ?? v.tick * .1) + (paused || options.reduced ? 0 : clamp(options.alpha || 0, 0, 1) * .1);
      track(v, time);if(paused||wasPaused)transitions.clear();wasPaused=!!paused;lastView = v; frame++; metrics = { tiles: 0, entities: 0, effects: 0, terrainUpdates: 0 };
      c.setTransform(dpr, 0, 0, dpr, 0, 0); c.globalAlpha = 1; c.setLineDash([]); c.fillStyle = '#0c1921'; c.fillRect(0, 0, w, h);
      const corners = [[-120, -180], [w + 120, -180], [w + 120, h + 140], [-120, h + 140]].map(([x, y]) => screenToWorld(x, y));
      const x0 = Math.max(0, Math.floor(Math.min(...corners.map(p => p.x)))), x1 = Math.min(v.width - 1, Math.ceil(Math.max(...corners.map(p => p.x))));
      const y0 = Math.max(0, Math.floor(Math.min(...corners.map(p => p.y)))), y1 = Math.min(v.height - 1, Math.ceil(Math.max(...corners.map(p => p.y))));
      const scenery = [];
      const worldReady=drawTerrainWorld(v);
      for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const q=worldToScreen(x,y);if(!onscreen(q,90*z))continue;if(!worldReady)tile(v,x,y,time,options.reduced);else if(v.terrain[y][x]!=='?')metrics.tiles++;if(v.terrain[y][x]==='#')scenery.push({x,y,depth:x+y,kind:'rock',visible:v.visible[y*v.width+x]});}
      const selection = options.selected instanceof Set ? options.selected : new Set(options.selected || []);
      drawOrders(v, selection);
      for (const o of v.ore || []) if (o.amount > 0) scenery.push({ ...o, depth: o.x + o.y + .05, kind: 'ore', visible: v.visible[o.y * v.width + o.x] });
      for (const e of v.memory || []) if (e.kind === 'building') {
        const q = worldToScreen(e.x + (e.size - 1) / 2, e.y + (e.size - 1) / 2); if (!onscreen(q, 160)) continue;
        c.save(); c.translate(q.x, q.y); c.scale(z, z); c.globalAlpha = .3; groundRing(c, e.size, '#a9b5a0', true); const a = e.size * .39;
        prism(c, 0, 0, a * 2, a * 2, 12, ['#475454', '#243c42', '#31474a']);
        c.strokeStyle = '#93a497'; c.setLineDash([3, 3]); line(c, [iso(-a, a, 13), iso(-a, -a, 13), iso(a, -a, 13), iso(a, a, 13), iso(-a, a, 13)], '#a3b7a4', 1); c.restore();
      }
      const byId = new Map((v.entities || []).map(e => [e.id, e]));
      for (const e of v.entities || []) scenery.push({ depth: e.x + e.y + (e.size - 1) + (e.type === 'flyer' ? 3 : .15), kind: 'entity', entity: e });
      scenery.sort((a, b) => a.depth - b.depth || (a.entity?.id || 0) - (b.entity?.id || 0));
      for (const s of scenery) {
        if (s.kind === 'entity') { drawEntity(s.entity, v, options, time, selection.has(s.entity.id), byId); continue; }
        const p = worldToScreen(s.x, s.y); if (!onscreen(p, 60 * z)) continue;
        c.save(); c.translate(p.x, p.y); c.scale(z, z); if (!s.visible) c.globalAlpha = .32;
        if(s.kind==='rock'){const seed=noise(s.x,s.y),b=biome(v);if(b===BIOMES.forest)drawForestObstacle(c,seed);else if(b===BIOMES.industrial)drawIndustrialObstacle(c,seed);else drawRock(c,seed,false,b.rock);}else drawOre(c, s.amount, noise(s.x, s.y)); c.restore();
      }
      const escort = v.objective?.escort;
      if (escort && v.explored[Math.round(escort.y) * v.width + Math.round(escort.x)]) {
        const p = worldToScreen(escort.x, escort.y); c.save(); c.setLineDash([5, 5]); ellipse(c, p.x, p.y, escort.radius * HW * Math.SQRT2 * z, escort.radius * HH * Math.SQRT2 * z, '#e9d5860a', '#e9d586a0', 1.5); c.restore();
        c.font = '600 11px sans-serif'; c.textAlign = 'center'; c.fillStyle = '#f1dfb0'; c.fillText('撤離信標', p.x, p.y - 12 * z);
      }
      drawEffects(v, time, options.reduced);
      if (options.preview) {
        const pr = options.preview, size = pr.size || ({core:3,refinery:3,factory:3,airfield:3,power:2,barracks:2,relay:2,turret:1}[pr.building || pr.type]) || 1, p = worldToScreen(pr.x + (size - 1) / 2, pr.y + (size - 1) / 2), color = pr.valid === false ? '#f29578' : '#a4ffe0';
        c.save(); c.translate(p.x, p.y); c.scale(z, z); groundRing(c, size, color, true);
        if (pr.type || pr.building) { c.globalAlpha = .4; drawBuilding(c, { type: pr.type || pr.building, size, complete: true, progress: 1 }, palette(0,v.faction||0), time, true); }
        c.restore();
      }
      if (options.box) { const b = options.box, bx = b.x0 ?? b.x, by = b.y0 ?? b.y, bw = b.w ?? ((b.x1 ?? b.x2 ?? bx) - bx), bh = b.h ?? ((b.y1 ?? b.y2 ?? by) - by); c.fillStyle = '#73e8d71a'; c.strokeStyle = '#9bffee'; c.lineWidth = 1; c.fillRect(bx, by, bw, bh); c.strokeRect(bx + .5, by + .5, bw, bh); }
      // A quiet optic vignette leaves the tactical field bright and legible.
      if (!terrainContext && w > 100) { const grad = c.createRadialGradient(w / 2, h / 2, Math.min(w, h) * .29, w / 2, h / 2, Math.max(w, h) * .74); grad.addColorStop(0, '#07131b00'); grad.addColorStop(1, '#06151a49'); c.fillStyle = grad; c.fillRect(0, 0, w, h); }
      return { ...metrics };
    }
    function drawMini(v) {
      if (!mc || !v) return;
      mc.setTransform(dpr, 0, 0, dpr, 0, 0); mc.fillStyle = '#0b171e'; mc.fillRect(0, 0, mw, mh);
      const margin = 6, scale = Math.min((mw - margin * 2) / v.width, (mh - margin * 2) / v.height), ox = (mw - v.width * scale) / 2, oy = (mh - v.height * scale) / 2;
      for (let y = 0; y < v.height; y++) for (let x = 0; x < v.width; x++) {
        const t = v.terrain[y][x]; if (t === '?') continue;
        mc.fillStyle = t === '~' ? biome(v).water[0] : t === '#' ? biome(v).rock[1] : t === '=' ? '#b0aa84' : biome(v).ground[2];
        mc.globalAlpha = v.visible[y * v.width + x] ? 1 : .42; mc.fillRect(ox + x * scale, oy + y * scale, scale + .25, scale + .25);
      }
      mc.globalAlpha = 1;
      for (const o of v.ore || []) if (o.amount > 0) { mc.fillStyle = o.stale ? '#81784c' : '#e8c570'; mc.fillRect(ox + o.x * scale, oy + o.y * scale, Math.max(1.6, scale), Math.max(1.6, scale)); }
      for (const e of v.memory || []) if (e.kind === 'building') { mc.strokeStyle = '#b7806160'; mc.lineWidth = .8; mc.strokeRect(ox + e.x * scale, oy + e.y * scale, e.size * scale, e.size * scale); }
      for (const e of v.entities || []) {
        mc.fillStyle = e.owner === 0 ? '#89f9df' : e.owner === 1 ? '#f39b69' : '#c7b98a';
        const sz = Math.max(e.kind === 'building' ? 3 : 2, e.size * scale); mc.fillRect(ox + (e.x + .5) * scale - (sz - scale) / 2, oy + (e.y + .5) * scale - (sz - scale) / 2, sz, sz);
      }
      for (const e of v.entities || []) {
        const mark = objectiveMark(e, v); if (!mark) continue;
        const x = ox + (e.x + e.size / 2) * scale, y = oy + (e.y + e.size / 2) * scale;
        mc.fillStyle = '#0b202ae6'; mc.fillRect(x - 6, y - 7, 12, 14);
        objectiveIcon(mc, x, y, mark, .72);
      }
      const corners = [[0, 0], [w, 0], [w, h], [0, h]].map(([x, y]) => screenToWorld(x, y));
      mc.save(); mc.beginPath(); mc.rect(ox, oy, v.width * scale, v.height * scale); mc.clip(); poly(mc, corners.map(q => [ox + (q.x + .5) * scale, oy + (q.y + .5) * scale]), '#c7fae90a', '#e3f7d7', 1); mc.restore();
      mc.strokeStyle = '#90b9a23d'; mc.lineWidth = 1; mc.strokeRect(ox - .5, oy - .5, v.width * scale + 1, v.height * scale + 1);
      return { x: ox, y: oy, scale, width: v.width * scale, height: v.height * scale };
    }
    resize();
    return { reset, camera, resize, worldToScreen, screenToWorld, entityPosition, draw, drawMini, centerOn, zoomBy, get metrics() { return { ...metrics,worldTerrainBytes:terrainCanvas?terrainCanvas.width*terrainCanvas.height*4:0 }; }, get viewport() { return { width: w, height: h, dpr }; } };
  }
  return { create, tileHalfWidth: HW, tileHalfHeight: HH };
});
