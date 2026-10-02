(function(root){'use strict';
const BASE=[[[0,0],[4,0],[0,4]],[[0,0],[4,0],[0,4]],[[0,0],[2,2],[-2,2]],[[0,0],[2,0],[0,2]],[[0,0],[2,0],[0,2]],[[0,0],[2,0],[2,2],[0,2]],[[0,0],[2,0],[4,2],[2,2]]],AREAS=[8,8,4,2,2,4,4],EPS=1e-6;
function area(p){return Math.abs(p.reduce((sum,a,i)=>{const b=p[(i+1)%p.length];return sum+a[0]*b[1]-a[1]*b[0]},0))/2}
function cross(a,b,c){return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])}
function polygon(i,p){let a=BASE[i].map(([x,y])=>[p.f?-x:x,y]);const t=p.r*Math.PI/4,c=Math.cos(t),s=Math.sin(t);a=a.map(([x,y])=>[p.x+x*c-y*s,p.y+x*s+y*c]);return p.f?a.reverse():a}
function intersection(a,b){let p=a.map(x=>x.slice());for(let i=0;i<b.length;i++){const u=b[i],v=b[(i+1)%b.length],q=[];for(let j=0;j<p.length;j++){const x=p[j],y=p[(j+1)%p.length],cx=cross(u,v,x),cy=cross(u,v,y),ix=cx>=-1e-9,iy=cy>=-1e-9;if(ix)q.push(x);if(ix!==iy){const t=cx/(cx-cy);q.push([x[0]+t*(y[0]-x[0]),x[1]+t*(y[1]-x[1])]);}}p=q;if(!p.length)return 0;}return area(p)}
function initial(){return Array(7).fill(null)}
function proper(p){return p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&Math.abs(p.x)<100&&Math.abs(p.y)<100&&Number.isInteger(p.r)&&p.r>=0&&p.r<8&&typeof p.f==='boolean'&&Math.abs(p.x*2-Math.round(p.x*2))<EPS&&Math.abs(p.y*2-Math.round(p.y*2))<EPS}
function reason(l,s,i,p){if(!proper(p))return '座標或方向無效';const poly=polygon(i,p),inside=l.target.reduce((a,q)=>a+intersection(poly,q),0);if(Math.abs(inside-AREAS[i])>EPS)return '拼片有一部分超出剪影';for(let j=0;j<7;j++)if(j!==i&&s[j]&&intersection(poly,polygon(j,s[j]))>EPS)return '拼片不能互相重疊';return ''}
function valid(l,s){return Array.isArray(s)&&s.length===7&&s.every((p,i)=>p===null||!reason(l,s,i,p))}
function legal(l,s,a){return a&&Number.isInteger(a.i)&&a.i>=0&&a.i<7&&(a.p===null||!reason(l,s,a.i,a.p))}
function step(l,s,a){if(!legal(l,s,a))throw Error('illegal placement');const q=s.map(p=>p?{...p}:null);q[a.i]=a.p?{...a.p}:null;return q}
function won(l,s){return valid(l,s)&&s.every(Boolean)}
function replay(l,actions){if(!Array.isArray(actions)||actions.length>20000)throw Error('invalid history');let s=initial();for(const a of actions)s=step(l,s,a);return s}
function equivalent(i,a,b){if(!a||!b)return false;return Math.abs(intersection(polygon(i,a),polygon(i,b))-AREAS[i])<EPS}
const api={kind:'tangram',BASE,AREAS,area,polygon,intersection,proper,reason,initial,valid,legal,step,won,replay,equivalent};root.GameEngine=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
