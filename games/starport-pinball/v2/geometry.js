(function(root,factory){const api=factory();if(typeof module==='object')module.exports=api;else root.PinballGeometry=api;})(globalThis,function(){'use strict';
const W=600,H=1000,R=10;const p=(x,y,z=0)=>[x,y,z],curve=(id,points,extra={})=>({id,points,...extra});
const railDefs=[
 curve('outer-left',[p(137,627),p(80,591),p(27,357),p(34,198)],{height:20}),
 curve('outer-crown-a',[p(34,198),p(38,107.14285714285714),p(147,110),p(253,114)],{height:20}),
 curve('outer-crown-b',[p(253,114),p(359,118),p(482,90),p(545,158)],{height:20}),
 curve('outer-crown-c',[p(545,158),p(576.5,192),p(576,235),p(576,325)],{height:20}),
 curve('shooter-outer',[p(576,325),p(576,473),p(576,734),p(576,950)],{height:20}),
 curve('shooter-divider',[p(530,983),p(530,720),p(530,523),p(530,335)],{height:14}),
 curve('left-shoulder',[p(137,627),p(156,639),p(33,613.6666666666666),p(32,648)],{height:20}),
 curve('left-cabinet-lower',[p(32,648),p(29,751),p(30,833),p(32,934)],{height:20}),
 curve('left-outlane',[p(94,642),p(80,715),p(115,809),p(176,880)],{height:10}),
 curve('left-feed',[p(160,782),p(177,805),p(190,820),p(198,832)],{height:10}),
 curve('right-outlane',[p(490,641),p(502,715),p(478,809),p(424,880)],{height:10}),
 curve('right-feed',[p(440,782),p(423,805),p(410,820),p(402,832)],{height:10})
];
const orbit={id:'orbit',name:'外環航道',width:38,outerBoundary:'cabinet',curves:[
 [p(147,611),p(90,575),p(60,335),p(68,240)],
 [p(68,240),p(76,145),p(154,148),p(267,147)],
 [p(267,147),p(380,146),p(517,181),p(514,312)],
 [p(514,312),p(511,443),p(509,516),p(493,597)]
]};
const ramp={id:'ramp',name:'返航天橋',solidEnd:.52,deckThickness:5,railHeight:7,railRadius:3.2,runnerRadius:2,runnerHeight:-1.85,wireStart:.50,tieRadius:1,tieHeight:-2,tieEvery:6,brake:{start:.73,full:.81,coefficient:.009,width:15,thickness:1},curves:[
 [p(398,561,0),p(439,453,0),p(450,378,54),p(402,299,70)],
 [p(402,299,70),p(354,220,86),p(242,200,78),p(185,282,65)],
 [p(185,282,65),p(128,364,52),p(122,420,50),p(121,560,44)],
 [p(121,560,44),p(120,700,38),p(163,795,34),p(191,823,34)]
],widthAt:u=>{const smooth=x=>x*x*(3-2*x);if(u<.08)return 52-12*smooth(u/.08);if(u<.43)return 40;if(u<.57)return 40-10*smooth((u-.43)/.14);return 30;}};
const bumpers=[{id:'b1',x:213,y:363,r:31,height:27},{id:'b2',x:303,y:306,r:31,height:27},{id:'b3',x:375,y:389,r:29,height:27}];
const slings=[{id:'slingL',curves:[[p(138,665),p(126,706),p(146,755),p(160,782)],[p(160,782),p(182,790),p(218,791),p(239,777)],[p(239,777),p(226,751),p(170,690),p(138,665)]]},{id:'slingR',curves:[[p(450,665),p(462,706),p(448,755),p(440,782)],[p(440,782),p(418,790),p(382,791),p(361,777)],[p(361,777),p(374,751),p(418,690),p(450,665)]]}].map(s=>{const footprintScale=.85,center=s.id==='slingL'?[177,740]:[418,740],scaled=v=>[center[0]+(v[0]-center[0])*footprintScale,center[1]+(v[1]-center[1])*footprintScale,v[2]||0],xs=s.id==='slingL'?[153,173,216]:[447,427,384],ys=[696,766,777];return{...s,center,footprintScale,curves:s.curves.map(c=>c.map(scaled)),screws:xs.map((x,i)=>scaled([x,ys[i],0])),coverHeight:30,rubberHeight:24,rubberRadius:5};});
const flippers=[{id:'left',pivot:p(200,850),length:80,radius:10,axisZ:10,rest:.38,active:-.52},{id:'right',pivot:p(400,850),length:80,radius:10,axisZ:10,rest:Math.PI-.38,active:Math.PI+.52}];
const targets=[{id:'A',x:255,y:445,w:22,h:14},{id:'B',x:285,y:436,w:22,h:14},{id:'C',x:315,y:445,w:22,h:14}].map((t,i)=>{const angle=[-.16,.13,.16][i],dx=Math.cos(angle)*t.w/2,dy=Math.sin(angle)*t.w/2;return{...t,angle,face:[p(t.x-dx,t.y-dy),p(t.x+dx,t.y+dy)]};}),lock={id:'lock',x:353,y:465,r:20},shooterGate={a:p(530,335),b:p(576,302),height:20,containmentHeight:138};
function bezier(c,t){const u=1-t;return c[0].map((_,i)=>u*u*u*c[0][i]+3*u*u*t*c[1][i]+3*u*t*t*c[2][i]+t*t*t*c[3][i]);}
function tangent(c,t){const u=1-t;return c[0].map((_,i)=>3*u*u*(c[1][i]-c[0][i])+6*u*t*(c[2][i]-c[1][i])+3*t*t*(c[3][i]-c[2][i]));}
function distance(a,b){return Math.hypot(...a.map((v,i)=>v-b[i]));}function mid(a,b){return a.map((v,i)=>(v+b[i])/2);}
function chordDistance(q,a,b){const d=b.map((v,i)=>v-a[i]),len=d.reduce((s,v)=>s+v*v,0),u=Math.max(0,Math.min(1,q.reduce((s,v,i)=>s+(v-a[i])*d[i],0)/(len||1)));return Math.hypot(...q.map((v,i)=>v-a[i]-u*d[i]));}
function flatten(c,error=.3,maxChord=8){const out=[{p:c[0],t:0}];function walk(q,a,b,depth){if(depth>=16||(Math.max(chordDistance(q[1],q[0],q[3]),chordDistance(q[2],q[0],q[3]))<=error&&distance(q[0],q[3])<=maxChord)){out.push({p:q[3],t:b});return;}const ab=mid(q[0],q[1]),bc=mid(q[1],q[2]),cd=mid(q[2],q[3]),abc=mid(ab,bc),bcd=mid(bc,cd),center=mid(abc,bcd),m=(a+b)/2;walk([q[0],ab,abc,center],a,m,depth+1);walk([center,bcd,cd,q[3]],m,b,depth+1);}walk(c,0,1,0);return out;}
function sampleTrack(track){let out=[],s=0;track.curves.forEach((c,part)=>{const samples=flatten(c);samples.forEach((v,i)=>{if(part&&i===0)return;const t=tangent(c,v.t),xy=Math.hypot(t[0],t[1]),len=Math.hypot(...t),n=[-t[1]/xy,t[0]/xy,0],u=(part+v.t)/track.curves.length;if(out.length)s+=distance(out[out.length-1].p,v.p);out.push({...v,s,u,part,tangent:t.map(v=>v/len),normal:n,width:track.widthAt?track.widthAt(u):track.width});});});return out;}
const rails=railDefs.map(d=>({...d,containmentHeight:(d.id.startsWith('outer-')||['shooter-outer','shooter-divider','left-shoulder','left-cabinet-lower'].includes(d.id))?138:null,radius:4,samples:flatten(d.points).map(v=>v.p)})),orbitSamples=sampleTrack(orbit),rampSamples=sampleTrack(ramp);function offset(samples,side){return samples.map(q=>q.p.map((v,i)=>v+q.normal[i]*q.width*.5*side));}
const orbitMouthPosts=[];for(const q of [orbitSamples[0],orbitSamples.at(-1)])for(const side of [-1,1]){const point=q.p.map((v,i)=>v+q.normal[i]*q.width*.5*side);if(q===orbitSamples.at(-1)&&side===-1)point[0]=530;orbitMouthPosts.push(point);}const glass={x0:24,x1:584,y0:53,y1:983,height:138,frontLower:40};
return {revision:'slings-085-v1',W,H,R,glass,orbitMouthPosts,railDefs,rails,orbit,ramp,orbitSamples,rampSamples,bumpers,slings,flippers,targets,lock,shooterGate,bezier,tangent,flatten,sampleTrack,offset,distance,curveTolerance:.3,maxChord:8};
});
