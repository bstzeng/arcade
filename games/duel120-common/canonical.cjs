'use strict';
/* Normalizes reflection and ordering. Only collision geometry, not names, colors, seeds or IDs. */
function canonicalGeometry(L){const cells=L.obstacles.map(o=>[o.x,o.y,o.w,o.h]);const variants=[];for(let fx=0;fx<2;fx++)for(let fy=0;fy<2;fy++)variants.push(JSON.stringify(cells.map(([x,y,w,h])=>[fx?960-x-w:x,fy?540-y-h:y,w,h]).sort((a,b)=>a[0]-b[0]||a[1]-b[1]||a[2]-b[2])));return variants.sort()[0];}
module.exports={canonicalGeometry};
