(function(root,factory){const api=factory();if(typeof module==='object')module.exports=api;else root.PinballTransferGeometry=api;})(globalThis,function(){'use strict';
const W=600,H=1000,R=10;const p=(x,y,z=0)=>[x,y,z],curve=(id,points,extra={})=>({id,points,...extra});
const railDefs=[
 curve('outer-left',[p(137,627),p(80,591),p(27,357),p(34,198)],{height:20}),
 curve('outer-crown-a',[p(34,198),p(39.14465408805031,81.14285714285714),p(147,84),p(253,88)],{height:20}),
 curve('outer-crown-b',[p(253,88),p(359,92),p(482,64),p(545,132)],{height:20}),
 curve('outer-crown-c',[p(545,132),p(576.5,166),p(576,209),p(576,325)],{height:20}),
 curve('shooter-outer',[p(576,325),p(576,473),p(576,734),p(576,950)],{height:20}),
 curve('shooter-divider',[p(530,983),p(530,720),p(530,523),p(530,335)],{height:14}),
 curve('left-shoulder',[p(137,627),p(156,639),p(33,613.6666666666666),p(32,648)],{height:20}),
 curve('left-cabinet-lower',[p(32,648),p(29,751),p(30,833),p(32,934)],{height:20}),
 curve('left-outlane',[p(94,642),p(80,715),p(115,809),p(176,880)],{height:10}),
 curve('left-feed',[p(160,782),p(177,805),p(190,820),p(198,832)],{height:10}),
 curve('right-outlane',[p(490,641),p(502,715),p(478,809),p(424,880)],{height:10}),
 curve('right-feed',[p(440,782),p(423,805),p(410,820),p(402,832)],{height:10})
];
const orbit={id:'orbit',name:'中繼環線',width:38,outerBoundary:'rails',sensors:{entryHalfWidth:8,middleHalfWidth:7,exitHalfWidth:8,heightMargin:8,recordPasses:true},widthAt:u=>{const smooth=x=>x*x*(3-2*x);return u<.08?46-8*smooth(u/.08):u>.92?46-8*smooth((1-u)/.08):38;},curves:[
 [p(262,478),p(240,413),p(214,294),p(225,223)],
 [p(225,223),p(236,152),p(304,139),p(360,145)],
 [p(360,145),p(416,151),p(472,167),p(471,246)],
 [p(471,246),p(470,325),p(458,426),p(420,515)]
]};
const ramp={id:'ramp',name:'轉運天橋',solidEnd:.55,deckThickness:5,railHeight:7,railRadius:3.2,runnerRadius:2,runnerHeight:-1.85,runnerFriction:.025,wireRailFriction:.04,tieFriction:.04,wireStart:.53,tieRadius:1,tieHeight:-2,tieEvery:6,brake:{start:.73,full:.81,coefficient:.009,width:15,thickness:1},curves:[
 [p(198,613,0),p(157,542,0),p(163,433,50),p(244,408,72)],
 [p(244,408,72),p(325,383,94),p(324,485,80),p(393,452,60)],
 [p(393,452,60),p(462,419,40),p(503,471,42),p(484,570,44)],
 [p(484,570,44),p(465,669,46),p(437,795,34),p(409,823,34)]
],widthAt:u=>{const smooth=x=>x*x*(3-2*x);if(u<.08)return 52-12*smooth(u/.08);if(u<.46)return 40;if(u<.60)return 40-10*smooth((u-.46)/.14);return 30;}};
const launchBranch={id:'launch-feed',name:'發射分流',width:38,curves:[[p(552,318),p(552,286),p(530,274),p(505,289)],[p(505,289),p(480,304),p(466,314),p(446,312)]]};
const bumpers=[{id:'b1',x:306,y:284,r:29,height:27},{id:'b2',x:392,y:245,r:27,height:27},{id:'b3',x:382,y:355,r:28,height:27}];
const slings=[{id:'slingL',curves:[[p(138,665),p(126,706),p(146,755),p(160,782)],[p(160,782),p(182,790),p(218,791),p(239,777)],[p(239,777),p(226,751),p(170,690),p(138,665)]]},{id:'slingR',curves:[[p(450,665),p(462,706),p(448,755),p(440,782)],[p(440,782),p(418,790),p(382,791),p(361,777)],[p(361,777),p(374,751),p(418,690),p(450,665)]]}].map(s=>{const footprintScale=.85,center=s.id==='slingL'?[177,740]:[418,740],scaled=v=>[center[0]+(v[0]-center[0])*footprintScale,center[1]+(v[1]-center[1])*footprintScale,v[2]||0],xs=s.id==='slingL'?[153,173,216]:[447,427,384],ys=[696,766,777];return{...s,center,footprintScale,curves:s.curves.map(c=>c.map(scaled)),screws:xs.map((x,i)=>scaled([x,ys[i],0])),coverHeight:30,rubberHeight:24,rubberRadius:5};});
const flippers=[{id:'left',pivot:p(200,850),length:80,radius:10,axisZ:10,rest:.38,active:-.52},{id:'right',pivot:p(400,850),length:80,radius:10,axisZ:10,rest:Math.PI-.38,active:Math.PI+.52}];
const targets=[{id:'A',x:260,y:555,w:22,h:14},{id:'B',x:320,y:580,w:22,h:14},{id:'C',x:355,y:520,w:22,h:14}].map((t,i)=>{const angle=[-.16,.13,.16][i],dx=Math.cos(angle)*t.w/2,dy=Math.sin(angle)*t.w/2;return{...t,angle,face:[p(t.x-dx,t.y-dy),p(t.x+dx,t.y+dy)]};}),lock={id:'lock',x:125,y:240,r:20,eject:{rise:380,vx:155,vy:145}},shooterGate={a:p(530,335),b:p(576,302),height:20,containmentHeight:138};
function bezier(c,t){const u=1-t;return c[0].map((_,i)=>u*u*u*c[0][i]+3*u*u*t*c[1][i]+3*u*t*t*c[2][i]+t*t*t*c[3][i]);}
function tangent(c,t){const u=1-t;return c[0].map((_,i)=>3*u*u*(c[1][i]-c[0][i])+6*u*t*(c[2][i]-c[1][i])+3*t*t*(c[3][i]-c[2][i]));}
function distance(a,b){return Math.hypot(...a.map((v,i)=>v-b[i]));}function mid(a,b){return a.map((v,i)=>(v+b[i])/2);}
function chordDistance(q,a,b){const d=b.map((v,i)=>v-a[i]),len=d.reduce((s,v)=>s+v*v,0),u=Math.max(0,Math.min(1,q.reduce((s,v,i)=>s+(v-a[i])*d[i],0)/(len||1)));return Math.hypot(...q.map((v,i)=>v-a[i]-u*d[i]));}
function flatten(c,error=.3,maxChord=8){const out=[{p:c[0],t:0}];function walk(q,a,b,depth){if(depth>=16||(Math.max(chordDistance(q[1],q[0],q[3]),chordDistance(q[2],q[0],q[3]))<=error&&distance(q[0],q[3])<=maxChord)){out.push({p:q[3],t:b});return;}const ab=mid(q[0],q[1]),bc=mid(q[1],q[2]),cd=mid(q[2],q[3]),abc=mid(ab,bc),bcd=mid(bc,cd),center=mid(abc,bcd),m=(a+b)/2;walk([q[0],ab,abc,center],a,m,depth+1);walk([center,bcd,cd,q[3]],m,b,depth+1);}walk(c,0,1,0);return out;}
function sampleTrack(track){let out=[],s=0;track.curves.forEach((c,part)=>{const samples=flatten(c);samples.forEach((v,i)=>{if(part&&i===0)return;const t=tangent(c,v.t),xy=Math.hypot(t[0],t[1]),len=Math.hypot(...t),n=[-t[1]/xy,t[0]/xy,0],u=(part+v.t)/track.curves.length;if(out.length)s+=distance(out[out.length-1].p,v.p);out.push({...v,s,u,part,tangent:t.map(v=>v/len),normal:n,width:track.widthAt?track.widthAt(u):track.width});});});return out;}
const rails=railDefs.map(d=>({...d,containmentHeight:(d.id.startsWith('outer-')||['shooter-outer','shooter-divider','left-shoulder','left-cabinet-lower'].includes(d.id))?138:null,radius:4,samples:flatten(d.points).map(v=>v.p)})),orbitSamples=sampleTrack(orbit),rampSamples=sampleTrack(ramp);function offset(samples,side){return samples.map(q=>q.p.map((v,i)=>v+q.normal[i]*q.width*.5*side));}
const launchSamples=sampleTrack(launchBranch);
function distanceToTrack(p,samples){let d=Infinity;for(let i=1;i<samples.length;i++)d=Math.min(d,chordDistance(p,samples[i-1].p,samples[i].p));return d;}
function splitOutside(points,opening){const runs=[];let run=[];for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],inside=opening(mid(a,b));if(inside){if(run.length>1)runs.push(run);run=[];}else{if(!run.length)run.push(a);run.push(b);}}if(run.length>1)runs.push(run);return runs;}
const groundRailRuns=[];
for(const side of [-1,1])for(const points of splitOutside(offset(orbitSamples,side),p=>distanceToTrack(p,launchSamples)<launchBranch.width/2+4))groundRailRuns.push({id:'orbit-'+(side<0?'outer':'inner'),points,radius:3.5,height:8});
for(const side of [-1,1])for(const points of splitOutside(offset(launchSamples,side),p=>distanceToTrack(p,orbitSamples)<orbit.width/2+4||(side===-1&&p[0]>514)))groundRailRuns.push({id:'launch-feed-'+side,points,radius:3.5,height:16});
// The launch mechanism has a real closed rear housing. Its inner boundary is
// the same outer horseshoe and upper feed curve; its cap is above those lips.
function intersection(a,b,c,d){const ux=b[0]-a[0],uy=b[1]-a[1],vx=d[0]-c[0],vy=d[1]-c[1],den=ux*vy-uy*vx;if(Math.abs(den)<1e-9)return null;const wx=c[0]-a[0],wy=c[1]-a[1],t=(wx*vy-wy*vx)/den,u=(wx*uy-wy*ux)/den;return t>=0&&t<=1&&u>=0&&u<=1?[a[0]+t*ux,a[1]+t*uy,0]:null;}
function triangulate(points){const p=points.slice(0,-1),cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);let area=0;for(let i=0;i<p.length;i++)area+=p[i][0]*p[(i+1)%p.length][1]-p[(i+1)%p.length][0]*p[i][1];const ids=Array.from({length:p.length},(_,i)=>i);if(area<0)ids.reverse();const triangles=[];while(ids.length>3){let found=false;for(let j=0;j<ids.length;j++){const a=ids[(j+ids.length-1)%ids.length],b=ids[j],c=ids[(j+1)%ids.length];if(cross(p[a],p[b],p[c])<1e-7)continue;const inside=ids.some(k=>k!==a&&k!==b&&k!==c&&cross(p[a],p[b],p[k])>=-1e-7&&cross(p[b],p[c],p[k])>=-1e-7&&cross(p[c],p[a],p[k])>=-1e-7);if(inside)continue;triangles.push([a,b,c]);ids.splice(j,1);found=true;break;}if(!found)throw Error('Housing polygon is not a simple triangulable outline');}triangles.push([...ids]);return triangles;}
const exterior=offset(orbitSamples,-1),upperFeed=offset(launchSamples,1);let crossing=null;for(let i=1;i<exterior.length;i++)for(let j=1;j<upperFeed.length;j++){const p=intersection(exterior[i-1],exterior[i],upperFeed[j-1],upperFeed[j]);if(p)crossing={i,j,p};}if(!crossing)throw Error('Missing physical launch housing junction');
const housingStart=orbitSamples.findIndex(q=>q.u>=.27),housingOutline=[...exterior.slice(housingStart,crossing.i),crossing.p,...upperFeed.slice(0,crossing.j).reverse(),[576,325,0],...rails.slice(1,4).flatMap((r,i)=>r.samples.slice(i?1:0)).reverse()];
const housingClean=housingOutline.filter((p,i)=>!i||distance(p,housingOutline[i-1])>1e-7);housingClean.push(housingClean[0]);const bodyPanels=[{id:'launch-housing',height:24,polygon:housingClean,triangles:triangulate(housingClean)}];
const orbitMouthPosts=[];for(const q of [orbitSamples[0],orbitSamples.at(-1)])for(const side of [-1,1]){const point=q.p.map((v,i)=>v+q.normal[i]*q.width*.5*side);orbitMouthPosts.push(point);}const glass={x0:24,x1:584,y0:53,y1:983,height:138,frontLower:40};
return {layoutID:'transfer-b',revision:'transfer-b-wire01',bodyPanels,rampSupports:[{u:.171875,side:-1},{u:.453125,side:-1},{u:.765625,side:1},{u:.9,side:1,baseHeight:30}],launchBranch,launchSamples,groundRailRuns,returnRegion:{side:'right',x:[300,450],y:[760,920],z:[0,50]},shooterStartsOrbit:false,W,H,R,glass,orbitMouthPosts,railDefs,rails,orbit,ramp,orbitSamples,rampSamples,bumpers,slings,flippers,targets,lock,shooterGate,bezier,tangent,flatten,sampleTrack,offset,distance,curveTolerance:.3,maxChord:8};
});
