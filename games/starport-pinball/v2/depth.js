(function(root,factory){const api=typeof module==='object'?factory(require('./geometry.js'),require('./table.js')):factory(root.PinballGeometry,root.PinballTable);Object.defineProperty(api,'withGeometry',{value:factory});if(typeof module==='object')module.exports=api;else root.PinballDepth=api;})(globalThis,function(G,T){'use strict';
// Cabinet projection and occlusion share the actual solid ribbon triangles and
// physical open-wire tubes. A projected overlap alone never establishes depth.
const tilt=.72,D=1+tilt*tilt,project=p=>[300+(p[0]-300)*(.93+.07*p[1]/1000),p[1]-tilt*(p[2]||0)];
const bounds=points=>({minX:Math.min(...points.map(p=>p[0])),maxX:Math.max(...points.map(p=>p[0])),minY:Math.min(...points.map(p=>p[1])),maxY:Math.max(...points.map(p=>p[1]))});
const faces=[...T.deck,...T.bodies];
const triangles=faces.map(q=>{const points=[q.a,q.b,q.c].map(p=>project([p.x,p.y,p.z]));return{...bounds(points),points,z:[q.a.z,q.b.z,q.c.z]};});
const tubes=T.segments.filter(c=>c.kind==='tube').map(c=>{const points=[c.a,c.b].map(p=>project([p.x,p.y,p.z])),box=bounds(points),r=c.radius;return{...box,minX:box.minX-r,maxX:box.maxX+r,minY:box.minY-r,maxY:box.maxY+r,points,z:[c.a.z,c.b.z],r};});
function candidates(b){const q=project([b.x,b.y,b.z]),r=b.r||G.R;return{q,r,triangles:triangles.filter(p=>p.maxX>=q[0]-r&&p.minX<=q[0]+r&&p.maxY>=q[1]-r&&p.minY<=q[1]+r),tubes:tubes.filter(p=>p.maxX>=q[0]-r&&p.minX<=q[0]+r&&p.maxY>=q[1]-r&&p.minY<=q[1]+r)};}
function triangleZ(t,x,y){const[a,b,c]=t.points,den=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]);if(Math.abs(den)<1e-12)return-Infinity;const u=((b[1]-c[1])*(x-c[0])+(c[0]-b[0])*(y-c[1]))/den,v=((c[1]-a[1])*(x-c[0])+(a[0]-c[0])*(y-c[1]))/den;if(u<0||v<0||u+v>1)return-Infinity;return u*t.z[0]+v*t.z[1]+(1-u-v)*t.z[2];}
function tubeZ(t,x,y){const[a,b]=t.points,dx=b[0]-a[0],dy=b[1]-a[1],u=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy||1))),px=a[0]+u*dx,py=a[1]+u*dy,d2=(x-px)**2+(y-py)**2;if(d2>t.r*t.r)return-Infinity;return t.z[0]+u*(t.z[1]-t.z[0])+Math.sqrt(t.r*t.r-d2);}
function hidden(b,x,y,c=candidates(b)){const dx=x-c.q[0],dy=y-c.q[1],disc=D*(c.r*c.r-dx*dx)-dy*dy;if(disc<0)return false;const ballFront=b.z+(-tilt*dy+Math.sqrt(disc))/D;for(const t of c.triangles)if(x>=t.minX&&x<=t.maxX&&y>=t.minY&&y<=t.maxY&&triangleZ(t,x,y)>ballFront+.04)return true;for(const t of c.tubes)if(x>=t.minX&&x<=t.maxX&&y>=t.minY&&y<=t.maxY&&tubeZ(t,x,y)>ballFront+.04)return true;return false;}
return{project,candidates,hidden,triangleZ,tubeZ};});
