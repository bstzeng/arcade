/* Original Paper Wind isometric artwork. Canvas vectors; no imported game assets. */
(function(root){'use strict';
const E=root.ParkEngine,TAU=Math.PI*2;
const P={ink:'#274d45',deep:'#315e48',grass:['#a7c785','#a2c480','#aac98a','#a5c684'],water:'#71b8c0',cream:'#fff1cd',gold:'#e9b950',coral:'#d7785e',blue:'#698fa5',rose:'#c884a3'};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),mix=(a,b,t)=>a+(b-a)*t,hash=(x,y)=>((Math.imul(x+19,374761393)^Math.imul(y+43,668265263))>>>0)/4294967295;
function create(canvas){
 const ctx=canvas.getContext('2d',{alpha:false}),terrain=document.createElement('canvas'),tc=terrain.getContext('2d',{alpha:false});
 const view={x:11.6,y:15.5,zoom:1,layer:'all',cursor:[8,13],tool:null,dir:0,selected:null,preview:null};
 let w=0,h=0,ratio=1,tile=52,half=26,rise=14,c=ctx,terrainKey='',lastState=null,lastTick=-1,positions=new Map(),previous=new Map(),tickAge=1,stamp=0,lastStamp=0,wind=0,sim=0,state=null,sceneClock=0,lastMode=null,visualAlpha=0,alphaTick=-1;
 const reduced=!!root.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 function resize(){const r=canvas.getBoundingClientRect();w=Math.max(1,r.width);h=Math.max(1,r.height);ratio=Math.min(2,root.devicePixelRatio||1);for(const v of [canvas,terrain]){v.width=Math.round(w*ratio);v.height=Math.round(h*ratio);}ctx.setTransform(ratio,0,0,ratio,0,0);tc.setTransform(ratio,0,0,ratio,0,0);terrainKey='';}
 function xy(x,y,z=0){return [(x-y-view.x+view.y)*tile*.5+w*.5,(x+y-view.x-view.y)*half*.5+h*.52-z*rise];}
 function inverse(x,y,z=0){const a=(x-w*.5)/(tile*.5),b=(y-h*.52+z*rise)/(half*.5);return [(a+b)*.5+view.x,(b-a)*.5+view.y];}
 function tileAt(x,y){
  // Resolve the highest visible diamond first, so raised land remains clickable.
  let best=null;for(let z=4;z>=0;z--){const a=inverse(x,y,z),ix=Math.floor(a[0]),iy=Math.floor(a[1]);if(state){const cell=E.cell(state,ix,iy);if(cell&&(cell.height||0)===z){best=[ix,iy];break;}}}
  const a=inverse(x,y);return best||a.map(Math.floor);
 }
 view.dragPixels=(dx,dy)=>{view.x=clamp(view.x-dx/tile-dy/half,-2,34);view.y=clamp(view.y+dx/tile-dy/half,-2,34);};
 view.ensureCursor=()=>{const p=xy(view.cursor[0]+.5,view.cursor[1]+.5,E.cell(state||{map:[]},...view.cursor)?.height||0),pad=70;const dx=p[0]<pad?pad-p[0]:p[0]>w-pad?w-pad-p[0]:0,dy=p[1]<pad?pad-p[1]:p[1]>h-pad?h-pad-p[1]:0;view.dragPixels(dx,dy);};
 function poly(points,fill,stroke,width=1){c.beginPath();points.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
 function line(a,b,color,width=1){c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.stroke();}
 function ellipse(x,y,rx,ry,color,stroke,width=1){c.beginPath();c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,TAU);c.fillStyle=color;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
 function circle(x,y,r,fill,stroke,width=1){ellipse(x,y,r,r,fill,stroke,width);}
 function rr(x,y,ww,hh,r,fill,stroke){c.beginPath();if(c.roundRect)c.roundRect(x,y,ww,hh,r);else c.rect(x,y,ww,hh);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1;c.stroke();}}
 function label(t,x,y,size=10,color=P.ink,weight=700){c.fillStyle=color;c.font=weight+' '+size+'px "Noto Sans TC",system-ui,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(t,x,y);}
 function diamond(x,y,z,ww=1,dd=ww,inset=0,fill=null,stroke=null,width=1){const pts=[xy(x+inset,y+inset,z),xy(x+ww-inset,y+inset,z),xy(x+ww-inset,y+dd-inset,z),xy(x+inset,y+dd-inset,z)];poly(pts,fill,stroke,width);return pts;}
 function block(x,y,z,ww,dd,hh,top='#f5e4bb',left='#d9b987',right='#bfa67f',stroke=null){const a=xy(x,y,z+hh),b=xy(x+ww,y,z+hh),d=xy(x,y+dd,z+hh),e=xy(x+ww,y+dd,z+hh),b0=xy(x+ww,y,z),d0=xy(x,y+dd,z),e0=xy(x+ww,y+dd,z);poly([d,e,e0,d0],left,stroke,.6);poly([b,e,e0,b0],right,stroke,.6);poly([a,b,e,d],top,stroke,.6);}
 function visible(x,y,z=0,pad=tile*3){const p=xy(x,y,z);return p[0]>-pad&&p[0]<w+pad&&p[1]>-pad&&p[1]<h+pad;}
 function ground(s,x,y){const n=E.cell(s,Math.floor(x),Math.floor(y));return n?(n.height||0)+(n.path==='bridge'?.25:0):0;}
 function groundPass(s){
  c=tc;c.clearRect(0,0,w,h);const bg=c.createLinearGradient(0,0,w,h);bg.addColorStop(0,'#e4ede1');bg.addColorStop(1,'#c5d9c8');c.fillStyle=bg;c.fillRect(0,0,w,h);
  // Soft, offset island silhouette, surrounded by an unintrusive mint atmosphere.
  const board=[xy(0,0,-.35),xy(32,0,-.35),xy(32,32,-.35),xy(0,32,-.35)];c.save();c.shadowColor='#46694c36';c.shadowBlur=32;c.shadowOffsetY=18;poly(board,'#6a9266');c.restore();
  for(let d=0;d<63;d++)for(let x=Math.max(0,d-31);x<=Math.min(31,d);x++){
   const y=d-x,n=E.cell(s,x,y),z=n.height||0;if(!visible(x+.5,y+.5,z,tile*2))continue;
   const back=xy(x,y,z),right=xy(x+1,y,z),front=xy(x+1,y+1,z),left=xy(x,y+1,z),shade=Math.floor(hash(x,y)*4),base=n.owned?P.grass[shade]:['#90b084','#94b58b','#89aa7e','#9ab98b'][shade];
   const nzx=E.cell(s,x+1,y)?.height??-.8,nzy=E.cell(s,x,y+1)?.height??-.8;
   if(z>nzx)poly([right,front,xy(x+1,y+1,nzx),xy(x+1,y,nzx)],'#789767','#65875b66',.5);
   if(z>nzy)poly([left,front,xy(x+1,y+1,nzy),xy(x,y+1,nzy)],'#90a874','#74946088',.5);
   poly([back,right,front,left],n.water?'#78b7b9':base,null);
   if(n.water){const p=xy(x+.5,y+.5,z-.015);ellipse(p[0],p[1],tile*.34,half*.24,shade%2?'#80c3c5':'#76bec0');for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const nn=E.cell(s,x+dx,y+dy);if(nn&&!nn.water){const edge=dx===1?[right,front]:dx===-1?[back,left]:dy===1?[left,front]:[back,right];line(...edge,'#c5d6a0',Math.max(2,tile*.08));line(...edge,'#f4edbd66',1);}}}
   else if(!n.path){if(view.tool)poly([back,right,front,left],null,'#5f8d6122',.65);if(hash(x+50,y)>.64){const p=xy(x+.26,y+.56,z);line(p,[p[0]-tile*.035,p[1]-tile*.04],'#7fa26777',.75);line(p,[p[0]+tile*.025,p[1]-tile*.055],'#789e5e66',.75);}}
   if(view.landOwnership){if(!n.owned){poly([back,right,front,left],'#a65f5748','#95594f99',.7);for(const t of [.2,.5,.8])line(xy(x+t,y,z+.02),xy(x+t,y+1,z+.02),'#874a4377',1);}else for(const [dx,dy,a,b]of [[1,0,right,front],[-1,0,back,left],[0,1,left,front],[0,-1,back,right]]){if(!E.cell(s,x+dx,y+dy)?.owned)line(a,b,'#2e7059',Math.max(1.5,tile*.045));}}
   if(n.path){
    const bridge=n.path==='bridge',queue=n.path==='queue',pz=z+(bridge?.25:.025);if(bridge)block(x,y,z,1,1,.25,'#cfb182','#a68c60','#8c7954');
    const pp=diamond(x,y,pz,1,1,0,queue?'#dba48d':bridge?'#cfb182':'#e7d4a7');
    for(const [j,dx,dy]of [[0,0,-1],[1,1,0],[2,0,1],[3,-1,0]]){const nn=E.cell(s,x+dx,y+dy);if(!nn?.path||nn.path!==n.path){line(pp[j],pp[(j+1)%4],queue?'#b37c6b':bridge?'#806e50':'#bcbd8b',Math.max(1.4,tile*.038));if(!queue&&!bridge)line(pp[j],pp[(j+1)%4],'#f5e9c7',Math.max(.6,tile*.013));}}
    if(bridge){for(let j=.12;j<1;j+=.19)line(xy(x+j,y+.06,pz+.015),xy(x+j,y+.94,pz+.015),'#a2896366',1);}
    else{const p=xy(x+.3,y+.4,pz+.02);line(p,[p[0]+tile*.13,p[1]+half*.13],queue?'#eec6ae':'#c5b58c77',.8);const q=xy(x+.65,y+.75,pz+.02);line(q,[q[0]+tile*.1,q[1]-half*.1],queue?'#eec6ae':'#c5b58c66',.8);}
   }
  }
  for(const r of s.rides){if(!visible(r.x+r.size/2,r.y+r.size/2,r.z,tile*4))continue;diamond(r.x,r.y,r.z+.035,r.size,r.size,.04,'#e5d3a9','#bba780',1.3);diamond(r.x,r.y,r.z+.05,r.size,r.size,.17,null,'#f5e9c8',1);}
  c=ctx;
 }
 function shadow(x,y,z,rx,ry,opacity=.16){const p=xy(x,y,z+.02);ellipse(p[0]+tile*.06,p[1]+tile*.06,rx,ry,'rgba(40,72,48,'+opacity+')');}
 function tree(x,y,z,seed=0,small=false){const p=xy(x,y,z),u=tile*(small?.48:.7),drift=Math.sin(wind*.65+seed)*u*.018;shadow(x,y,z,u*.43,u*.18,.13);line(p,[p[0],p[1]-u*.6],'#817252',u*.09);line([p[0],p[1]-u*.4],[p[0]-u*.19,p[1]-u*.57],'#817252',u*.05);
  const palettes=[['#578a65','#73a477','#91b681'],['#6c995f','#88af6d','#a8c57d'],['#537f64','#70a18b','#8eb69a']][seed%3];
  ellipse(p[0]+drift,p[1]-u*.65,u*.45,u*.49,palettes[0]);ellipse(p[0]-u*.12+drift,p[1]-u*.75,u*.34,u*.39,palettes[1]);ellipse(p[0]-u*.15+drift,p[1]-u*.86,u*.2,u*.23,palettes[2]);ellipse(p[0]+u*.23+drift,p[1]-u*.48,u*.17,u*.19,palettes[0]);
  if(seed%7===0)for(let k=0;k<4;k++)circle(p[0]+Math.cos(k*2.1)*u*.22,p[1]-u*(.6+k*.055),u*.035,'#edc976');
 }
 function fence(x,y,z,dx,dy,color='#f1e8c5',height=.65){const a=xy(x,y,z),b=xy(x+dx,y+dy,z),at=xy(x,y,z+height),bt=xy(x+dx,y+dy,z+height);line(a,at,'#8c8965',tile*.04);line(b,bt,'#8c8965',tile*.04);line(at,bt,color,tile*.035);line(xy(x,y,z+height*.45),xy(x+dx,y+dy,z+height*.45),color,tile*.027);circle(at[0],at[1],tile*.029,'#fff4cf');circle(bt[0],bt[1],tile*.029,'#fff4cf');}
 function shrub(x,y,z,kind=0){const p=xy(x,y,z);shadow(x,y,z,tile*.19,tile*.09,.1);ellipse(p[0],p[1]-tile*.08,tile*.2,tile*.16,'#719a64');ellipse(p[0]-tile*.04,p[1]-tile*.13,tile*.12,tile*.12,'#99b873');if(kind)for(let i=0;i<4;i++)circle(p[0]+Math.cos(i*2)*tile*.13,p[1]-tile*(.12+Math.sin(i*2)*.055),tile*.037,['#f8e6ae','#e7a180','#f4db97','#f2c4c3'][i]);}
 function scenery(s,items){
  const occupied=new Set();for(const r of s.rides)for(let yy=r.y-1;yy<=r.y+r.size;yy++)for(let xx=r.x-1;xx<=r.x+r.size;xx++)occupied.add(xx+','+yy);for(const o of s.shops)occupied.add(o.x+','+o.y);
  for(let y=0;y<32;y++)for(let x=0;x<32;x++){
   const n=E.cell(s,x,y);if(!visible(x+.5,y+.5,n.height,tile*2))continue;
   const key=x+','+y,nearWater=[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>E.cell(s,x+dx,y+dy)?.water),seed=Math.floor(hash(x,y)*1000),empty=!n.water&&!n.path&&!n.decor&&!occupied.has(key);
   if(empty&&((!n.owned&&seed%3!==0)||((x<2||y<2||y>29||x>29)&&seed%3===0)||(nearWater&&seed%4===0)||(seed%137===0)))items.push({d:x+y+1.25,fn:()=>tree(x+.5,y+.5,n.height,seed,!n.owned&&seed%3===0)});
   else if(empty&&nearWater&&seed%3===0)items.push({d:x+y+1,fn:()=>shrub(x+.5,y+.5,n.height,seed%2)});
   if(n.decor)items.push({d:x+y+1.2,fn:()=>decoration(x,y,n)});
   if(n.path==='queue'||n.path==='bridge'){const z=ground(s,x,y);if(!E.cell(s,x,y+1)?.path)items.push({d:x+y+1.96,fn:()=>fence(x+.04,y+.95,z,.92,0,n.path==='queue'?'#fff0c6':'#a69773',.38)});if(!E.cell(s,x+1,y)?.path)items.push({d:x+y+1.96,fn:()=>fence(x+.95,y+.04,z,0,.92,n.path==='queue'?'#fff0c6':'#a69773',.38)});}
   if(n.litter)items.push({d:x+y+1.02,fn:()=>{for(let j=0;j<Math.min(4,n.litter);j++){const p=xy(x+.25+j*.13,y+.65,n.height+.035);poly([[p[0],p[1]],[p[0]+3,p[1]-2],[p[0]+6,p[1]+1],[p[0]+3,p[1]+3]],'#fff0cd','#b69974',.5);}}});
  }
 }
 function decoration(x,y,n){const z=n.height;
  if(n.decor==='bench'){shadow(x+.5,y+.6,z,tile*.33,tile*.12,.15);block(x+.16,y+.33,z+.32,.68,.25,.13,'#cfad76','#a77a53','#98714d');block(x+.16,y+.32,z+.53,.68,.06,.34,'#e3c58b','#c59761','#b08254');for(const dx of [.23,.74])for(const dy of [.38,.52])line(xy(x+dx,y+dy,z),xy(x+dx,y+dy,z+.38),'#5e7462',tile*.035);}
  else{diamond(x,y,z+.02,1,1,.11,'#a3926b','#e2d8ad',2);for(let k=0;k<5;k++)shrub(x+.22+(k%3)*.23,y+.22+Math.floor(k/3)*.33,z,1);const p=xy(x+.55,y+.52,z+1.25);line(xy(x+.55,y+.52,z),p,'#a18b62',tile*.035);const a=wind*.7+(x+y);for(let k=0;k<4;k++){const angle=a+k*Math.PI*.5,q=[p[0]+Math.cos(angle)*tile*.23,p[1]+Math.sin(angle)*tile*.23],r=[p[0]+Math.cos(angle+.65)*tile*.14,p[1]+Math.sin(angle+.65)*tile*.14];poly([p,q,r],['#e4916b','#f6e2aa','#dfb556','#bcd3ba'][k]);}circle(p[0],p[1],tile*.033,'#fcf0c7');}
 }
 function tentRoof(x,y,z,ww,dd,accent){const a=xy(x,y,z),b=xy(x+ww,y,z),d=xy(x,y+dd,z),e=xy(x+ww,y+dd,z),peak1=xy(x+ww*.5,y,z+.65),peak2=xy(x+ww*.5,y+dd,z+.65);poly([a,peak1,peak2,d],'#faf0ca','#a59168',.5);poly([peak1,b,e,peak2],accent,'#a59168',.5);for(let i=0;i<4;i++){const f=i/4,g=(i+1)/4;poly([xy(x,y+dd*f,z),xy(x+ww*.5,y+dd*f,z+.65),xy(x+ww*.5,y+dd*g,z+.65),xy(x,y+dd*g,z)],i%2?'#faeec4':accent);poly([xy(x+ww*.5,y+dd*f,z+.65),xy(x+ww,y+dd*f,z),xy(x+ww,y+dd*g,z),xy(x+ww*.5,y+dd*g,z+.65)],i%2?'#e7d9ac':accent);}}
 function shop(o){const z=ground(state,o.x,o.y),x=o.x,y=o.y,accent=o.type==='food'?'#da8969':o.type==='drink'?'#70a8ac':'#98a280';shadow(x+.55,y+.55,z,tile*.4,half*.48,.15);block(x+.12,y+.12,z,.77,.74,1.02,'#eee0b8','#f5e6bd','#d8c394','#a68e6d');
  const q=[xy(x+.24,y+.88,z+.32),xy(x+.77,y+.88,z+.32),xy(x+.77,y+.88,z+.76),xy(x+.24,y+.88,z+.76)];poly(q,o.type==='toilet'?'#7d9785':'#506d62','#b49c72',1);if(o.type!=='toilet'){block(x+.15,y+.78,z+.29,.74,.2,.12,'#b38963','#9b704d','#7c6148');for(let k=0;k<3;k++){const p=xy(x+.3+k*.2,y+.83,z+.49);circle(p[0],p[1],tile*.038,o.type==='food'?'#e6b458':'#f9e9ab');}}
  tentRoof(x+.03,y+.04,z+1.04,.97,.93,accent);const p=xy(x+.5,y+.93,z+.94);rr(p[0]-tile*.2,p[1]-tile*.09,tile*.4,tile*.18,tile*.035,'#fff2d3','#aa9675');label(o.type==='food'?'鬆餅':o.type==='drink'?'檸檬':'WC',p[0],p[1],Math.max(6,tile*.115),'#6b7456');
  if(o.type==='drink'){const p=xy(x+.9,y+.15,z+.35);ellipse(p[0],p[1],tile*.11,tile*.065,'#92ad77');circle(p[0],p[1]-tile*.085,tile*.07,'#e8d467');}
 }
 function flag(x,y,z,color=P.coral){const p=xy(x,y,z),q=xy(x,y,z+1);line(p,q,'#8c9771',tile*.028);const flutter=Math.sin(wind*1.7+x)*tile*.025;poly([q,[q[0]+tile*.24,q[1]+tile*.055+flutter],[q[0],q[1]+tile*.13]],color);circle(q[0],q[1],tile*.025,P.cream);}
 // Expansion models are self-contained original geometry. All motion is a function
 // of the engine's cycle progress; none uses wall-clock time or ambient wind.
 function rideGuest(r,index,p,scale=1,walk=0){
  const id=r.riders?.[index];if(id===undefined)return;
  const u=tile*scale,skin=['#edc99e','#ddac83','#b9896d','#f1d2af'][id%4],coat=['#d88767','#b77c9b','#6a93a3','#ddba61','#78a28b','#e1b99a'][id%6];
  line([p[0]-u*.023,p[1]-u*.035],[p[0]-u*.028-walk,p[1]+u*.013],'#536d64',u*.027);line([p[0]+u*.023,p[1]-u*.035],[p[0]+u*.028+walk,p[1]+u*.013],'#536d64',u*.027);
  rr(p[0]-u*.047,p[1]-u*.13,u*.094,u*.105,u*.025,coat);circle(p[0],p[1]-u*.17,u*.043,skin);ellipse(p[0],p[1]-u*.20,u*.044,u*.02,['#67564b','#806449','#785445'][id%3]);
 }
 function rideBox(q,angle,length,width,height,top,left,right){
  const cs=Math.cos(angle),sn=Math.sin(angle),point=(a,b,z)=>xy(q[0]+cs*a-sn*b,q[1]+sn*a+cs*b,q[2]+z),corners=[[-length/2,-width/2],[length/2,-width/2],[length/2,width/2],[-length/2,width/2]],sides=[];
  for(let i=0;i<4;i++){const a=corners[i],b=corners[(i+1)%4];sides.push({d:cs*(a[0]+b[0]-a[1]-b[1])+sn*(a[0]+b[0]+a[1]+b[1]),pts:[point(...a,0),point(...b,0),point(...b,height),point(...a,height)]});}
  sides.sort((a,b)=>a.d-b.d);for(const side of sides)poly(side.pts,side.d>0?right:left,'#675f4b55',.5);poly(corners.map(a=>point(...a,height)),top,'#7a735555',.6);return point;
 }
 function ridePath(points,t){
  const at=clamp(t,0,1)*(points.length-1),i=Math.min(points.length-2,Math.floor(at)),f=at-i,a=points[i],b=points[i+1];return {q:[mix(a[0],b[0],f),mix(a[1],b[1],f),mix(a[2]||0,b[2]||0,f)],angle:Math.atan2(b[1]-a[1],b[0]-a[0])};
 }
 function scenicTrain(r,active,progress){
  const z=r.z||0,cx=r.x+1.5,cy=r.y+1.5,travel=active?(progress-Math.sin(progress*TAU)/TAU)*TAU*2:0,point=(a,offset=0)=>[cx+Math.cos(a)*(1.10+offset),cy+Math.sin(a)*(.93+offset),z+.13];
  diamond(r.x+.21,r.y+.21,z+.06,2.58,2.58,0,'#c2cda2','#adbc8e',.8);
  for(let k=0;k<40;k++){const a=k*TAU/40;line(xy(...point(a,-.11)),xy(...point(a,.11)),'#9a8a64',tile*.038);}
  for(const side of [-.065,.065]){const pts=Array.from({length:65},(_,k)=>xy(...point(k*TAU/64,side)));c.beginPath();pts.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.strokeStyle='#667567';c.lineWidth=tile*.043;c.stroke();c.strokeStyle='#eee0b3';c.lineWidth=tile*.016;c.stroke();}
  // Garden island and a tiny timber halt make this a scenic railway, with its own track.
  block(cx-.39,cy-.37,z+.08,.76,.69,.14,'#d4cb9e','#b3b98b','#a2aa7e');shrub(cx-.19,cy-.14,z+.24,1);shrub(cx+.21,cy+.17,z+.24,0);
  const halt=[r.x+.10,r.y+1.84];block(...halt,z+.05,.63,.77,.16,'#d8bc83','#bca276','#ac926a');for(const a of [[.05,.04],[.54,.04]])line(xy(halt[0]+a[0],halt[1]+a[1],z+.20),xy(halt[0]+a[0],halt[1]+a[1],z+1.10),'#8f8968',tile*.035);tentRoof(halt[0]-.035,halt[1]-.04,z+1.10,.70,.84,'#799e90');
  const cars=[];for(let k=0;k<6;k++){const a=2.30+travel-k*.35,q=point(a),angle=Math.atan2(.93*Math.cos(a),-1.10*Math.sin(a));cars.push({k,a,q,angle,d:q[0]+q[1]});}
  cars.sort((a,b)=>a.d-b.d);for(const o of cars){const {q,angle,k}=o,cs=Math.cos(angle),sn=Math.sin(angle),pt=(a,b,zz=0)=>xy(q[0]+cs*a-sn*b,q[1]+sn*a+cs*b,q[2]+zz);for(const a of [-.10,.10])for(const b of [-.14,.14]){const p=pt(a,b,.035);ellipse(p[0],p[1],tile*.040,tile*.047,'#526b60','#d4ba82',.7);}
   const body=rideBox(q,angle,.35,.25,.18,k===0?'#648b7b':['#e7b55f','#cb8566','#96b3a0'][(k-1)%3],'#ad8058',k===0?'#466d62':'#b7885d');
   if(k===0){rideBox([q[0]+cs*.075,q[1]+sn*.075,q[2]+.18],angle,.24,.18,.16,'#709b83','#567c6b','#3e685f');const chimney=pt(.15,0,.48);line(pt(.15,0,.30),chimney,'#526c5b',tile*.07);ellipse(chimney[0],chimney[1],tile*.046,tile*.022,'#334f45');rideBox([q[0]-cs*.105,q[1]-sn*.105,q[2]+.19],angle,.14,.24,.26,'#f1d3a0','#e5b56c','#cb995c');const bell=pt(-.08,0,.48);circle(bell[0],bell[1],tile*.029,'#e8c76f');if(active){for(let j=0;j<3;j++){const drift=(progress*15+j/3)%1,puff=pt(.15-drift*.20,0,.57+drift*.46);ellipse(puff[0]+drift*tile*.07,puff[1],tile*(.028+drift*.040),tile*(.022+drift*.023),'#f6efcf'+['b3','88','55'][j]);}}}
   else{for(let seat=0;seat<2;seat++)rideGuest(r,(k-1)*2+seat,body((seat-.5)*.13,0,.21),.60);for(const b of [-.13,.13])line(body(-.16,b,.24),body(.16,b,.24),'#fff0c2',tile*.023);}
  }
 }
 function bumperArena(r,active,progress){
  const z=r.z||0,at=(x,y,zz=0)=>xy(r.x+x,r.y+y,z+zz),colors=['#d97f67','#78a5a2','#e0b35f','#b585a4','#8fa76c','#7c98b0','#c4a46e','#91b5a3'];
  block(r.x+.14,r.y+.14,z+.03,2.72,2.72,.13,'#c4b6ac','#ae9d93','#968d86');diamond(r.x+.27,r.y+.27,z+.17,2.46,2.46,0,'#e4d5ba','#fbefcc',tile*.025);
  for(let k=0;k<6;k++)line(at(.31+k*.46,.31,.18),at(.31+k*.46,2.69,.18),'#c6b9a161',.6);for(let k=0;k<6;k++)line(at(.31,.31+k*.46,.18),at(2.69,.31+k*.46,.18),'#c6b9a161',.6);
  const boundary=(a,b)=>{line(at(...a,.22),at(...b,.22),'#8c6e6c',tile*.13);line(at(...a,.31),at(...b,.31),'#dbad98',tile*.065);};boundary([.21,.21],[2.79,.21]);boundary([.21,.21],[.21,2.79]);
  for(const a of [[.20,.20],[2.80,.20],[.20,2.80]])line(at(...a,.18),at(...a,1.65),'#759081',tile*.046);
  const banner=[at(.16,.19,1.45),at(2.84,.19,1.45),at(2.84,.19,1.80),at(.16,.19,1.80)];poly(banner,'#77988b','#5c7a6c',.7);for(let k=0;k<8;k++)circle(...at(.32+k*.33,.19,1.62),tile*.033,k%2?'#e9bd68':'#f7e5b8');
  const t=active?progress*TAU:0,blend=active?Math.sin(progress*Math.PI)**2:0,position=(k,v)=>{const start=[.56+(k%4)*.61,.70+Math.floor(k/4)*1.55],a=k*1.57,xx=1.50+Math.sin(v*(k%2?2:3)+a)*.80,yy=1.50+Math.cos(v*(k%3===0?3:2)+a*.87)*.79;return [mix(start[0],xx,blend),mix(start[1],yy,blend)];},cars=Array.from({length:8},(_,k)=>{const q=position(k,t),b=position(k,t+.01);return{k,q,angle:active&&blend>.02?Math.atan2(b[1]-q[1],b[0]-q[0]):Math.PI/2};}).sort((a,b)=>a.q[0]+a.q[1]-b.q[0]-b.q[1]);
  for(const o of cars){const q=[r.x+o.q[0],r.y+o.q[1],z+.21],p=at(...o.q,.21);ellipse(p[0],p[1]+tile*.025,tile*.18,tile*.075,'#56685e55');const f=rideBox(q,o.angle,.43,.32,.10,'#596d66','#475b55','#3d514c');rideBox([q[0],q[1],q[2]+.10],o.angle,.36,.28,.18,colors[o.k],colors[o.k],colors[o.k]);const cockpit=f(-.035,0,.30);ellipse(cockpit[0],cockpit[1],tile*.094,tile*.044,'#5c7163');rideGuest(r,o.k,cockpit,.74);const bar=f(.10,0,.33);circle(bar[0],bar[1],tile*.035,'#e8dcb5','#64756a',tile*.016);line(f(-.16,0,.18),f(-.16,0,1.21),'#87988b',tile*.015);circle(...f(-.16,0,1.21),tile*.021,'#ead89b');}
  boundary([2.79,.21],[2.79,2.79]);boundary([.21,2.79],[2.79,2.79]);for(const a of [[2.80,.20],[2.80,2.80]])line(at(...a,.18),at(...a,1.65),'#759081',tile*.046);line(at(.2,.2,1.65),at(2.8,2.8,1.65),'#657f7244',.7);line(at(2.8,.2,1.65),at(.2,2.8,1.65),'#657f7244',.7);
 }
 function biplaneFlight(r,active,progress){
  const z=r.z||0,cx=r.x+1,cy=r.y+1,base=xy(cx,cy,z+.10),turn=(progress-Math.sin(progress*TAU)/TAU)*TAU*2,angle=active?turn:0,lift=active?Math.sin(progress*Math.PI):0;
  ellipse(base[0],base[1],tile*.84,tile*.40,'#c2d1aa','#8fa991',tile*.025);ellipse(base[0],base[1],tile*.64,tile*.31,'#dce0b8');block(cx-.12,cy-.12,z+.13,.24,.24,1.32,'#e5c678','#bd9e5c','#a48d54');
  const planes=[];for(let k=0;k<6;k++){const a=angle+k*TAU/6,ht=.66+lift*(.45+.60*(.5+.5*Math.sin(a*1.6+k))),q=[cx+Math.cos(a)*.64,cy+Math.sin(a)*.64,z+ht];planes.push({k,a,q,d:q[0]+q[1]});}planes.sort((a,b)=>a.d-b.d);
  for(const o of planes){const {q,k}=o,a=o.a+Math.PI/2,cs=Math.cos(a),sn=Math.sin(a),at=(f,b,zz)=>xy(q[0]+cs*f-sn*b,q[1]+sn*f+cs*b,q[2]+zz),color=['#d88669','#739fa3','#d5b664','#b788a4','#8aa777','#bc9470'][k];line(xy(cx,cy,z+1.02),at(0,0,.04),'#a5b19a',tile*.043);const gp=xy(q[0],q[1],z+.05);ellipse(gp[0],gp[1],tile*.17,tile*.069,'#69806e22');
   poly([at(-.09,-.34,.10),at(.07,-.34,.10),at(.12,.34,.10),at(-.08,.34,.10)],'#e9d6a0','#9f9876',.6);rideBox(q,a,.48,.14,.13,color,color,'#aa876c');poly([at(-.25,-.15,.16),at(-.11,-.15,.16),at(-.11,.15,.16),at(-.25,.15,.16)],color,'#fff0c6',.5);poly([at(-.22,0,.13),at(-.26,0,.39),at(-.12,0,.16)],'#f0d49a','#a79970',.5);
   for(const b of [-.25,.25])for(const f of [-.04,.055])line(at(f,b,.10),at(f,b,.34),'#8a9784',tile*.018);rideGuest(r,k,at(-.035,0,.15),.58);
   poly([at(-.095,-.35,.34),at(.09,-.35,.34),at(.12,.35,.34),at(-.08,.35,.34)],color,'#fff0cc',tile*.014);for(const b of [-.24,.24])line(at(-.07,b,.35),at(.095,b,.35),'#f7e8bc',tile*.038);const nose=at(.28,0,.12),prop=active?progress*TAU*18+k:Math.PI/2;line([nose[0]-Math.cos(prop)*tile*.12,nose[1]-Math.sin(prop)*tile*.12],[nose[0]+Math.cos(prop)*tile*.12,nose[1]+Math.sin(prop)*tile*.12],'#5f796d',tile*.024);circle(...nose,tile*.026,'#edd188');
  }
  const cap=xy(cx,cy,z+1.66);ellipse(cap[0],cap[1],tile*.19,tile*.075,'#e5b967','#f6e4ae',tile*.024);line(cap,xy(cx,cy,z+2.08),'#899d7d',tile*.024);const pennant=xy(cx,cy,z+2.08);poly([pennant,[pennant[0]+tile*.18,pennant[1]+tile*.045],[pennant[0],pennant[1]+tile*.12]],'#d78968');
 }
 function piratePendulum(r,active,progress){
  const z=r.z||0,p=xy(r.x+1.5,r.y+1.5,z),u=tile*3,pivot=[p[0],p[1]-u*.64],swing=active?Math.sin(progress*TAU*3)*Math.sin(Math.PI*progress)*1.10:0,length=u*.32;
  diamond(r.x+.22,r.y+.22,z+.08,2.56,2.56,0,'#d4c69d','#b4a979',1);ellipse(p[0],p[1]-u*.025,u*.38,u*.155,'#b4bd92');
  const frame=(dx,color)=>{const top=[pivot[0]+dx,pivot[1]];for(const sign of [-1,1]){line([p[0]+dx+sign*u*.23,p[1]+u*.025],top,color,u*.035);line([p[0]+dx+sign*u*.23,p[1]+u*.025],[p[0]+dx+sign*u*.28,p[1]+u*.043],'#8e8360',u*.052);}line([p[0]+dx-u*.13,p[1]-u*.26],[p[0]+dx+u*.13,p[1]-u*.26],'#c4b778',u*.017);};frame(-u*.09,'#7d9a85');
  const bx=pivot[0]+Math.sin(swing)*length,by=pivot[1]+Math.cos(swing)*length;c.save();c.translate(bx,by);c.rotate(-swing);
  for(const xx of [-u*.17,u*.17])line([xx,-u*.026],[0,-length],'#d5c491',u*.015);
  // A crescent hull, raised bow/stern, keel, and plank bands are unique to this ship.
  c.beginPath();c.moveTo(-u*.31,-u*.10);c.quadraticCurveTo(-u*.25,u*.15,0,u*.145);c.quadraticCurveTo(u*.25,u*.15,u*.31,-u*.10);c.lineTo(u*.20,-u*.045);c.quadraticCurveTo(0,u*.026,-u*.20,-u*.045);c.closePath();c.fillStyle='#a87d54';c.fill();c.strokeStyle='#7a6850';c.lineWidth=u*.012;c.stroke();
  c.beginPath();c.moveTo(-u*.285,-u*.055);c.quadraticCurveTo(0,u*.215,u*.285,-u*.055);c.strokeStyle='#d9b66e';c.lineWidth=u*.020;c.stroke();
  for(let k=0;k<7;k++){const xx=(k-3)*u*.064;line([xx,u*.034],[xx*.93,u*.10],'#7d604932',u*.008);}ellipse(0,-u*.012,u*.22,u*.046,'#e4c98d','#b89a63',u*.011);
  for(let row=0;row<2;row++)for(let seat=0;seat<6;seat++)rideGuest(r,row*6+seat,[(seat-2.5)*u*.066,-u*.012+row*u*.029],.69);
  line([-u*.255,-u*.053],[u*.255,-u*.053],'#f4df9d',u*.015);for(let j=0;j<9;j++){const xx=(j-4)*u*.058;line([xx,-u*.05],[xx,-u*.004],'#eacb85',u*.009);}line([0,-u*.08],[0,-u*.24],'#9b855a',u*.012);poly([[0,-u*.24],[u*.075,-u*.20],[0,-u*.16]],'#638d7a');c.restore();
  frame(u*.09,'#5f806f');line([pivot[0]-u*.10,pivot[1]],[pivot[0]+u*.10,pivot[1]],'#e0c47d',u*.054);circle(...pivot,u*.04,'#e2b763','#f2dda0',u*.009);
 }
 function logFlume(r,active,progress){
  const z=r.z||0,nodes=[[.45,2.52,.28],[.40,.66,.28],[.80,.37,.28],[2.30,.37,2.55],[2.58,.72,2.55],[2.58,2.13,.28],[2.20,2.58,.28],[.45,2.52,.28]],times=[0,.20,.27,.58,.66,.76,.84,1],world=q=>[r.x+q[0],r.y+q[1],z+q[2]],at=q=>xy(...world(q));
  diamond(r.x+.15,r.y+.15,z+.06,2.70,2.70,0,'#bdd1b1','#9ebca3',1);const basin=xy(r.x+2.34,r.y+2.26,z+.13);ellipse(basin[0],basin[1],tile*.47,tile*.25,'#a6c8b3');
  const segments=nodes.slice(0,-1).map((a,i)=>({a,b:nodes[i+1],i,d:a[0]+a[1]+nodes[i+1][0]+nodes[i+1][1]})).sort((a,b)=>a.d-b.d);
  for(const {a,b,i}of segments){const dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy),ox=-dy/len*.17,oy=dx/len*.17,quad=zz=>[[a[0]+ox,a[1]+oy,a[2]+zz],[b[0]+ox,b[1]+oy,b[2]+zz],[b[0]-ox,b[1]-oy,b[2]+zz],[a[0]-ox,a[1]-oy,a[2]+zz]];if(a[2]>.5||b[2]>.5){for(const f of [.22,.70]){const q=[mix(a[0],b[0],f),mix(a[1],b[1],f),mix(a[2],b[2],f)];for(const s of [-1,1])line(at([q[0]+ox*s,q[1]+oy*s,.06]),at([q[0]+ox*s,q[1]+oy*s,q[2]-.05]),'#969873',tile*.05);line(at([q[0]-ox,q[1]-oy,.12]),at([q[0]+ox,q[1]+oy,q[2]-.12]),'#b2aa7c',tile*.026);}}
   const lower=quad(-.12),upper=quad(0);poly([at(upper[0]),at(upper[1]),at(lower[1]),at(lower[0])],'#7e9f8e');poly([at(upper[2]),at(upper[3]),at(lower[3]),at(lower[2])],'#698e80');poly(upper.map(at),'#74b9bf','#cee1bc',tile*.025);line(at(a),at(b),i===2?'#bda877':'#9ad0cf',tile*(i===2?.065:.055));if(i===2)for(let f=.05;f<1;f+=.11){const q=[mix(a[0],b[0],f),mix(a[1],b[1],f),mix(a[2],b[2],f)+.015];line(at([q[0]+ox*.7,q[1]+oy*.7,q[2]]),at([q[0]-ox*.7,q[1]-oy*.7,q[2]]),'#ead2a0',tile*.03);}
  }
  const sample=t=>{let i=times.findIndex((v,j)=>j>0&&t<=v);if(i<1)i=times.length-1;const f=(t-times[i-1])/(times[i]-times[i-1]),a=nodes[i-1],b=nodes[i];return {q:[mix(a[0],b[0],f),mix(a[1],b[1],f),mix(a[2],b[2],f)],angle:Math.atan2(b[1]-a[1],b[0]-a[0]),segment:i};},trip=active?(progress-Math.sin(progress*TAU)/TAU):0,logs=[];
  for(let k=0;k<3;k++){const t=(.87+k*.045+trip)%1,o=sample(t);logs.push({...o,k,t});}logs.sort((a,b)=>a.q[0]+a.q[1]-b.q[0]-b.q[1]);
  for(const o of logs){const q=world(o.q),f=rideBox([q[0],q[1],q[2]+.04],o.angle,.50,.24,.17,'#d6aa69','#ab8055','#96704c'),p=at(o.q);if(active&&o.q[2]<.5){ellipse(p[0],p[1]+tile*.028,tile*.22,tile*.073,'#e5efcb99');}poly([f(-.19,-.075,.18),f(.19,-.075,.18),f(.19,.075,.18),f(-.19,.075,.18)],'#8d7954');for(let seat=0;seat<2;seat++)rideGuest(r,o.k*2+seat,f((seat-.5)*.21,0,.20),.61);for(const xx of [-.16,0,.16])line(f(xx,-.12,.12),f(xx,.12,.12),'#ebc88a',tile*.02);
   if(active&&o.t>.74&&o.t<.80){const impact=(o.t-.74)/.06;for(let j=0;j<8;j++){const a=j*TAU/8,rad=(.13+impact*.30),sp=xy(q[0]+Math.cos(a)*rad,q[1]+Math.sin(a)*rad,z+.24+Math.sin(Math.PI*impact)*(.35+(j%3)*.1));line(p,sp,'#e8f1d7aa',tile*.025);circle(...sp,tile*.025,'#e8f4de');}}}
  block(r.x+.13,r.y+1.55,z+.07,.30,1.10,.18,'#d2b682','#ad976e','#978662');for(let j=0;j<5;j++)line(xy(r.x+.15,r.y+1.64+j*.20,z+.26),xy(r.x+.41,r.y+1.64+j*.20,z+.26),'#a78d62',tile*.023);shrub(r.x+1.29,r.y+1.27,z+.10,0);shrub(r.x+1.82,r.y+1.79,z+.10,1);
 }
 function riverRapids(r,active,progress){
  const z=r.z||0,cx=r.x+1.5,cy=r.y+1.5,point=(a,rad,zz=.18)=>xy(cx+Math.cos(a)*rad,cy+Math.sin(a)*rad,z+zz),turn=active?(progress-Math.sin(progress*TAU)/TAU)*TAU*2:0;
  const loop=rad=>Array.from({length:64},(_,j)=>point(j*TAU/64,rad));poly(loop(1.27),'#95ae96','#b6c6a2',tile*.024);poly(loop(1.17),'#629f9f');poly(loop(1.08),'#7dbfc1');poly(loop(.61),'#d2ce9b','#a9c095',tile*.032);
  for(let j=0;j<14;j++){const a=j*TAU/14+(active?turn*.43:0),rad=.83+(j%3)*.06,p=point(a,rad,.20),q=point(a+.14,rad,.20);line(p,q,j%2?'#d5ead1':'#aee0cd',tile*.027);}
  for(let j=0;j<18;j++){const a=j*TAU/18,p=point(a,1.24,.23);ellipse(p[0],p[1],tile*.080,tile*.040,j%3?'#b9bc97':'#9aa88d','#7d9a8433',.5);}
  const objects=[{d:cx+cy,fn:()=>{block(cx-.27,cy-.22,z+.18,.47,.45,.43,'#b0b38f','#959b7f','#7f917a');shrub(cx-.06,cy+.04,z+.58,0);}}];
  for(let k=0;k<3;k++){const a=.65+k*TAU/3+turn,q=[cx+Math.cos(a)*.88,cy+Math.sin(a)*.88,z+.24],spin=active?turn*1.7+k:0;objects.push({d:q[0]+q[1],fn:()=>{const p=xy(...q);ellipse(p[0],p[1]+tile*.035,tile*.205,tile*.098,'#567b70');ellipse(p[0],p[1],tile*.205,tile*.098,'#d9b365','#786f52',tile*.017);ellipse(p[0],p[1]-tile*.006,tile*.137,tile*.060,'#657f70');for(let seat=0;seat<4;seat++){const b=spin+seat*TAU/4,rp=xy(q[0]+Math.cos(b)*.13,q[1]+Math.sin(b)*.13,q[2]+.09);rideGuest(r,k*4+seat,rp,.60);const rim=xy(q[0]+Math.cos(b)*.27,q[1]+Math.sin(b)*.27,q[2]+.06);line(rp,rim,'#f2d690',tile*.022);}circle(p[0],p[1]-tile*.016,tile*.032,'#e5c778');const marker=xy(q[0]+Math.cos(spin)*.24,q[1]+Math.sin(spin)*.24,q[2]+.08);circle(...marker,tile*.024,'#ce8263');}});}
  objects.sort((a,b)=>a.d-b.d);objects.forEach(o=>o.fn());for(const a of [.7,2.8,4.2]){const p=point(a,1.08,.20);ellipse(p[0],p[1],tile*.105,tile*.043,'#e1ebc4aa');for(let j=0;j<3;j++){const q=point(a+j*.07,.94+j*.05,.22);line(q,[q[0]+tile*.055,q[1]-tile*.035],'#f0f4d8',tile*.023);}}
  block(r.x+.06,r.y+1.63,z+.08,.30,.89,.18,'#d5bc83','#b19a6c','#96875d');for(const dy of [1.65,2.5])line(xy(r.x+.09,r.y+dy,z+.27),xy(r.x+.33,r.y+dy,z+.27),'#f0dfaa',tile*.04);
 }
 // A deterministic, connected 5x5 labyrinth. DFS removes walls; BFS finds the
 // visitor corridor, so visible walkers can never cross a hedge to reach the exit.
 const hedgeMaze=(()=>{const n=5,walls=Array.from({length:25},()=>[true,true,true,true]),seen=new Set([20]),stack=[20];let seed=91;while(stack.length){const i=stack.at(-1),x=i%5,y=Math.floor(i/5),choices=[[0,x,y-1],[1,x+1,y],[2,x,y+1],[3,x-1,y]].filter(v=>v[1]>=0&&v[2]>=0&&v[1]<n&&v[2]<n&&!seen.has(v[2]*n+v[1]));if(!choices.length){stack.pop();continue;}seed=(seed*1664525+1013904223)>>>0;const [dir,xx,yy]=choices[seed%choices.length],j=yy*n+xx;walls[i][dir]=false;walls[j][(dir+2)%4]=false;seen.add(j);stack.push(j);}const queue=[20],from=new Map([[20,-1]]);for(let k=0;k<queue.length;k++){const i=queue[k];for(const [d,off]of [[0,-5],[1,1],[2,5],[3,-1]])if(!walls[i][d]&&!from.has(i+off)){from.set(i+off,i);queue.push(i+off);}}const route=[];for(let i=4;i!==-1;i=from.get(i))route.push([.42+(i%5)*.54,.42+Math.floor(i/5)*.54,0]);route.reverse();walls[20][2]=false;walls[4][1]=false;return{walls,route};})();
 function hedgeLabyrinth(r,active,progress){
  const z=r.z||0,objects=[],base=.15,step=.54,thick=.10;diamond(r.x+.12,r.y+.12,z+.07,2.76,2.76,0,'#e3d6ac','#b7b38b',1);
  const hedge=(xx,yy,ww,dd)=>objects.push({d:r.x+r.y+xx+yy+(ww+dd)*.5,fn:()=>{block(r.x+xx,r.y+yy,z+.10,ww,dd,.45,'#8da568','#587f55','#426e50');line(xy(r.x+xx+.03,r.y+yy+.03,z+.57),xy(r.x+xx+ww-.03,r.y+yy+dd-.03,z+.57),'#afbc7c',tile*.018);}});
  for(let i=0;i<25;i++){const xx=base+(i%5)*step,yy=base+Math.floor(i/5)*step,walls=hedgeMaze.walls[i];if(walls[0])hedge(xx,yy,step+thick,thick);if(walls[3])hedge(xx,yy,thick,step+thick);if(i%5===4&&walls[1])hedge(xx+step,yy,thick,step+thick);if(i>=20&&walls[2])hedge(xx,yy+step,step+thick,thick);}
  for(let k=0;k<(r.riders?.length||0);k++){const t=active?clamp((progress-k*.022)/(1-k*.022),0,1):0,o=ridePath(hedgeMaze.route,t),xx=r.x+o.q[0],yy=r.y+o.q[1],walk=active?Math.sin(progress*TAU*22+k)*tile*.012:0;objects.push({d:xx+yy+.06,fn:()=>rideGuest(r,k,xy(xx,yy,z+.14),.65,walk)});}
  objects.sort((a,b)=>a.d-b.d);objects.forEach(o=>o.fn());const entry=xy(r.x+.45,r.y+2.87,z+.13);ellipse(entry[0],entry[1],tile*.09,tile*.043,'#d9bb75');const exit=xy(r.x+2.96,r.y+.42,z+.72);line(xy(r.x+2.96,r.y+.42,z+.1),exit,'#9a9067',tile*.025);poly([exit,[exit[0]+tile*.13,exit[1]+tile*.03],[exit[0],exit[1]+tile*.095]],'#dab75f');
 }
 function puppetTheater(r,active,progress){
  const z=r.z||0,at=(x,y,zz=0)=>xy(r.x+x,r.y+y,z+zz),opening=active?clamp(Math.min(progress/.10,(1-progress)/.10),0,1):0,beat=active?progress*TAU*5:0;
  block(r.x+.10,r.y+.12,z+.03,1.80,.80,.26,'#c8a678','#a58e68','#937f5c');block(r.x+.17,r.y+.17,z+.29,1.66,.14,2.12,'#e4d2a4','#ac8c77','#987a69');poly([at(.25,.80,.55),at(1.75,.80,.55),at(1.75,.80,2.15),at(.25,.80,2.15)],'#576d69');
  for(let j=0;j<6;j++){const p=at(.39+j*.24,.79,1.55+(j%2)*.28);circle(...p,tile*.022,'#b9bea0');}
  block(r.x+.14,r.y+.67,z+.29,1.72,.24,.30,'#ecd099','#c49a69','#af825c');
  for(let k=0;k<2;k++){const dance=active?Math.sin(beat+k*Math.PI):0,xx=.69+k*.59+dance*.055,feet=at(xx,.785,.61+Math.abs(dance)*.09),head=at(xx,.785,1.32+Math.abs(dance)*.09),u=tile,color=k?'#cf9970':'#84a5a0';line(at(xx,.785,2.12),head,'#dfd5b077',u*.012);line([feet[0]-u*.047,feet[1]-u*.056],[feet[0]-u*.085+dance*u*.025,feet[1]],'#e3c58e',u*.027);line([feet[0]+u*.03,feet[1]-u*.056],[feet[0]+u*.07-dance*u*.024,feet[1]],'#e3c58e',u*.027);poly([[head[0]-u*.025,head[1]+u*.055],[head[0]+u*.04,head[1]+u*.055],[feet[0]+u*.10,feet[1]-u*.04],[feet[0]-u*.10,feet[1]-u*.04]],color,'#f0dcae',.5);for(const sign of [-1,1])line([head[0]+sign*u*.04,head[1]+u*.09],[head[0]+sign*u*.15,head[1]+u*(.11+sign*dance*.065)],'#e1c392',u*.025);circle(...head,u*.053,'#e7c593');poly([[head[0]-u*.07,head[1]-u*.03],[head[0]+u*.07,head[1]-u*.03],[head[0]+(k?u*.025:0),head[1]-u*.16]],k?'#d5b063':'#c48298');circle(head[0]+u*.018,head[1]-u*.003,u*.009,'#53665b');}
  // Curtain edges follow the live show opening and close during loading/rest.
  const panel=(left)=>{const edge=left?mix(1,.39,opening):mix(1,1.61,opening),outer=left?.20:1.80;poly([at(outer,.84,.56),at(edge,.84,.56),at(edge,.84,2.20),at(outer,.84,2.20)],left?'#b7798d':'#a76b80','#c18b9d',.6);for(let j=1;j<4;j++){const xx=mix(outer,edge,j/4);line(at(xx,.841,.63),at(xx,.841,2.15),left?'#d09aaa':'#c08c9f',tile*.025);}const tie=at(mix(outer,edge,.5),.86,1.25);line([tie[0]-tile*.047,tie[1]],[tie[0]+tile*.047,tie[1]+tile*.02],'#e5c583',tile*.03);};panel(true);panel(false);
  for(const xx of [.12,1.76])block(r.x+xx,r.y+.78,z+.28,.12,.18,2.03,'#f1dfb2','#d6be8c','#c8ad7c');block(r.x+.07,r.y+.72,z+2.29,1.86,.28,.20,'#e8cb94','#c6a56f','#b99461');const crown=at(1,.81,2.59);poly([at(.15,.81,2.49),crown,at(1.85,.81,2.49)],'#799b88','#f0daa5',tile*.018);circle(crown[0],crown[1]-tile*.035,tile*.047,'#e8bf6d');
  for(let row=0;row<3;row++){const yy=1.18+row*.28;block(r.x+.29,r.y+yy,z+.08,1.41,.12,.18,'#c3a676','#a3875d','#927a57');for(let seat=0;seat<4;seat++)rideGuest(r,row*4+seat,at(.45+seat*.34,yy+.025,.29),.59);}
 }
 function ride(r){const n=r.size||2,x=r.x+n*.5,y=r.y+n*.5,z=r.z||0,p=xy(x,y,z),u=tile*n,active=r.open&&!r.broken&&r.cycle>0,cycleProgress=active?clamp((r.cycleDuration-r.cycle+visualAlpha)/Math.max(1,r.cycleDuration),0,1):0,phase=r.id*.7+cycleProgress*TAU*2;
  shadow(x,y,z,u*.43,u*.17,.15);
  if(r.type==='wheel'){
   const cy=p[1]-u*.57,rad=u*.37,cx=p[0],rx=rad*.86,depth=u*.055;
   for(const off of [-depth,depth]){line([cx+off,cy],[p[0]-u*.25+off,p[1]-u*.03],'#678979',u*.055);line([cx+off,cy],[p[0]+u*.2+off,p[1]+u*.025],'#54796a',u*.055);}
   ellipse(cx+depth,cy,rx,rad,'#ffffff00','#8da99a',u*.034);ellipse(cx,cy,rx,rad,'#ffffff00','#fff0bf',u*.045);
   const angle=r.id*.7+cycleProgress*TAU;for(let k=0;k<10;k++){const a=angle+k*TAU/10,q=[cx+Math.cos(a)*rx,cy+Math.sin(a)*rad];line([cx,cy],q,'#f8eac2',u*.014);line(q,[q[0]+depth,q[1]],'#86a399',u*.019);line(q,[q[0],q[1]+u*.07],'#7d8d78',u*.012);rr(q[0]-u*.057,q[1]+u*.033,u*.114,u*.083,u*.022,k%3===0?'#d97d61':k%3===1?'#e4bb60':'#82ac9f','#628776');rr(q[0]-u*.043,q[1]+u*.041,u*.086,u*.025,u*.008,'#f7e9bf');if(r.riders?.length>k)circle(q[0],q[1]+u*.047,u*.013,'#8c6551');}
   circle(cx,cy,u*.055,'#e5b44f','#fbefd0',u*.016);block(r.x+.28,r.y+1.25,z,.42,.5,.15,'#dfc58b','#bfa47b','#a89774');flag(r.x+.1,r.y+.25,z+1.1);
  }else if(r.type==='carousel'){
   ellipse(p[0],p[1]-u*.035,u*.43,u*.22,'#c49662','#b89268',u*.018);ellipse(p[0],p[1]-u*.065,u*.43,u*.22,'#e8bd7b');ellipse(p[0],p[1]-u*.08,u*.36,u*.17,'#f2d49b');
   const horses=[];for(let k=0;k<6;k++){const a=phase+k*TAU/6;horses.push({k,a,xx:p[0]+Math.cos(a)*u*.30,yy:p[1]+Math.sin(a)*u*.135-u*.08});}horses.sort((a,b)=>a.yy-b.yy);
   for(const o of horses){const bounce=active?Math.sin(phase*2+o.k)*u*.025:0;line([o.xx,o.yy],[o.xx,o.yy-u*.44],'#dfc474',u*.014);const hy=o.yy-u*.105+bounce;line([o.xx-u*.047,hy+u*.015],[o.xx-u*.063,hy+u*.077],'#d7ae77',u*.022);line([o.xx+u*.043,hy+u*.017],[o.xx+u*.073,hy+u*.065],'#d7ae77',u*.022);ellipse(o.xx,hy,u*.083,u*.034,'#fff0cf','#b99362',.5);poly([[o.xx+u*.035,hy],[o.xx+u*.045,hy-u*.084],[o.xx+u*.085,hy-u*.092],[o.xx+u*.108,hy-u*.045],[o.xx+u*.073,hy-u*.041],[o.xx+u*.07,hy+u*.01]],'#fff0cf','#b99362',.5);poly([[o.xx-u*.015,hy-u*.037],[o.xx+u*.04,hy-u*.037],[o.xx+u*.036,hy+u*.011],[o.xx-u*.02,hy+u*.01]],o.k%2?'#74a69a':'#d17e65');if(r.riders?.length>o.k){circle(o.xx,hy-u*.08,u*.018,'#e9c299');line([o.xx,hy-u*.06],[o.xx,hy-u*.022],o.k%2?P.blue:P.rose,u*.03);}}
   const roofY=p[1]-u*.49,top=[p[0],p[1]-u*.79];for(let k=0;k<12;k++){const a=k*TAU/12,b=(k+1)*TAU/12;poly([top,[p[0]+Math.cos(a)*u*.47,roofY+Math.sin(a)*u*.22],[p[0]+Math.cos(b)*u*.47,roofY+Math.sin(b)*u*.22]],k%2?'#f8e5ad':'#d98665','#c79661',.5);}ellipse(p[0],roofY,u*.47,u*.22,'#ffffff00','#b27952',u*.025);for(let k=0;k<9;k++){const a=k*Math.PI/8;circle(p[0]+Math.cos(a)*u*.43,roofY+Math.sin(a)*u*.20,u*.018,'#f5d67e');}line(top,[top[0],top[1]-u*.1],'#ab9768',u*.019);poly([[top[0],top[1]-u*.12],[top[0]+u*.19,top[1]-u*.08],[top[0],top[1]-u*.03]],'#759f8e');
  }else if(r.type==='teacups'){
   ellipse(p[0],p[1]-u*.03,u*.43,u*.22,'#c6a0aa','#ac8b94',1);ellipse(p[0],p[1]-u*.07,u*.42,u*.22,'#ead0ce');ellipse(p[0],p[1]-u*.075,u*.31,u*.155,'#f5e3cd');
   const cups=[];for(let k=0;k<5;k++){const a=phase+k*TAU/5;cups.push({k,a,x:p[0]+Math.cos(a)*u*.28,y:p[1]+Math.sin(a)*u*.14-u*.08});}cups.sort((a,b)=>a.y-b.y);for(const q of cups){ellipse(q.x+u*.095,q.y-u*.055,u*.043,u*.039,'#ffffff00',q.k%2?'#a67a98':'#bb855f',u*.014);rr(q.x-u*.09,q.y-u*.105,u*.18,u*.12,u*.045,q.k%2?'#c997b5':'#e7b37c');ellipse(q.x,q.y-u*.1,u*.09,u*.039,'#fcf0d4','#fff0d3',u*.009);ellipse(q.x,q.y-u*.101,u*.062,u*.022,'#c9b194');if(r.riders?.length>q.k){circle(q.x,q.y-u*.132,u*.019,'#e4b58f');line([q.x,q.y-u*.112],[q.x,q.y-u*.082],P.blue,u*.034);}ellipse(q.x,q.y+u*.014,u*.04,u*.014,'#b49a86');}const tea=xy(x,y,z+1.05);line([p[0],p[1]-u*.1],tea,'#9ca57a',u*.03);for(let k=0;k<4;k++){const a=phase*.65+k*Math.PI/2;poly([tea,[tea[0]+Math.cos(a)*u*.14,tea[1]+Math.sin(a)*u*.14],[tea[0]+Math.cos(a+.9)*u*.11,tea[1]+Math.sin(a+.9)*u*.11]],k%2?'#f0d697':'#c68daa');}circle(tea[0],tea[1],u*.025,'#efd98d');
  }else if(r.type==='swing'){
   ellipse(p[0],p[1],u*.44,u*.22,'#d2d5ab','#a1b28b',1);line(p,[p[0],p[1]-u*.66],'#709789',u*.065);const top=[p[0],p[1]-u*.64];const seats=[];for(let k=0;k<8;k++){const a=phase+k*TAU/8;seats.push({k,a,x:p[0]+Math.cos(a)*u*.37,y:p[1]+Math.sin(a)*u*.19-u*.19});}seats.sort((a,b)=>a.y-b.y);for(const q of seats){line([top[0]+Math.cos(q.a)*u*.27,top[1]+Math.sin(q.a)*u*.12],[q.x,q.y],'#e6dbab',u*.012);ellipse(q.x,q.y,u*.052,u*.025,q.k%2?'#dda872':'#80ab95');if(r.riders?.length>q.k){circle(q.x,q.y-u*.044,u*.02,'#efd0a4');line([q.x,q.y-u*.025],[q.x,q.y],P.coral,u*.033);}}ellipse(top[0],top[1],u*.35,u*.16,'#9bb99c','#5c8d7b',u*.022);poly([[top[0]-u*.35,top[1]],[top[0],top[1]-u*.19],[top[0]+u*.35,top[1]]],'#bed2a9');flag(x,y,z+5.2,'#dfb768');
  }else if(r.type==='tower'){
   ellipse(p[0],p[1],u*.35,u*.18,'#cfc7a1');block(x-.14,y-.14,z,.28,.28,5.5,'#dce4cc','#9dafaa','#799894');for(let k=0;k<7;k++){const a=xy(x-.14,y+.14,z+.5+k*.65),b=xy(x+.14,y+.14,z+.9+k*.65);line(a,b,'#eaf0d1',u*.018);}const lift=cycleProgress<.58?cycleProgress/.58:cycleProgress<.72?1:1-(cycleProgress-.72)/.28,ht=active?.7+clamp(lift,0,1)*3.7:.7,q=xy(x,y,z+ht);rr(q[0]-u*.26,q[1]-u*.07,u*.52,u*.12,u*.025,'#ca8da4','#a4758d');for(let k=0;k<5;k++)rr(q[0]+(k-2)*u*.082-u*.03,q[1]-u*.084,u*.06,u*.07,u*.014,'#f1d8b4');const top=xy(x,y,z+5.65);ellipse(top[0],top[1],u*.22,u*.09,'#e8c373');flag(x,y,z+6,'#bf8098');
  }else if(r.type==='boats'){
   ellipse(p[0],p[1]-u*.02,u*.44,u*.23,'#c7c39b');ellipse(p[0],p[1]-u*.04,u*.38,u*.19,'#74b9bd','#98d0cd',u*.03);for(let k=0;k<3;k++){const a=phase*.5+k*TAU/3,bx=p[0]+Math.cos(a)*u*.24,by=p[1]+Math.sin(a)*u*.12-u*.05;ellipse(bx-u*.018,by+u*.028,u*.09,u*.035,'#c5e3cc');c.save();c.translate(bx,by);c.rotate(Math.sin(a)*.3);poly([[-u*.10,0],[-u*.065,-u*.045],[u*.09,-u*.035],[u*.115,0],[u*.035,u*.04],[-u*.055,u*.035]],'#e9bd77','#b38c56',1);ellipse(0,-u*.006,u*.053,u*.023,'#bfa375');if(r.riders?.length>k){circle(0,-u*.047,u*.02,'#ebcba3');line([0,-u*.026],[0,0],P.coral,u*.04);}c.restore();}block(r.x+.1,r.y+1.4,z+.08,1.2,.23,.12,'#bd9a6e','#a3805d','#8e7257');
  }else if(r.type==='coaster'){
   block(r.x+.02,r.y+.04,z,1,.9,.30,'#bea77b','#a18b64','#967b57');for(const [dx,dy]of [[.12,.12],[.88,.12],[.12,.85],[.88,.85]])line(xy(r.x+dx,r.y+dy,z+.28),xy(r.x+dx,r.y+dy,z+1.45),'#8e7756',tile*.045);tentRoof(r.x-.08,r.y-.04,z+1.45,1.16,1.08,'#bf7055');const q=xy(r.x+.5,r.y+.9,z+.96);label('SKY RAIL',q[0],q[1],Math.max(5,tile*.11),'#fff0cc');
  }else if(r.type==='mini_train')scenicTrain(r,active,cycleProgress);
  else if(r.type==='bumper')bumperArena(r,active,cycleProgress);
  else if(r.type==='airplanes')biplaneFlight(r,active,cycleProgress);
  else if(r.type==='pirate')piratePendulum(r,active,cycleProgress);
  else if(r.type==='splash')logFlume(r,active,cycleProgress);
  else if(r.type==='rapids')riverRapids(r,active,cycleProgress);
  else if(r.type==='maze')hedgeLabyrinth(r,active,cycleProgress);
  else if(r.type==='theater')puppetTheater(r,active,cycleProgress);
  const ex=r.entrance?.[0]??r.x,ey=r.entrance?.[1]??r.y+n,ez=ground(state,ex,ey);fence(ex+.13,ey+.11,ez,.68,0,active?'#faebbd':'#c3856c',.4);const ep=xy(ex+.47,ey+.12,ez+.53);circle(ep[0],ep[1],Math.max(1.6,tile*.048),active?'#6a9a6b':'#d39172','#ffedc3',tile*.017);
  if(r.broken)badge('!',p[0],p[1]-u*.78,'#bc614c');else if(!r.open){const q=xy(r.x+n,r.y+n,z+.5);badge('休',q[0],q[1],'#a38a66',Math.max(6,tile*.12));}
 }
 function badge(t,x,y,fill,size=11){circle(x,y,size*.9,'#fff4d5','#e0c79c',1);label(t,x,y+.5,size,fill);}
 function guestPosition(g,kind,alpha){const k=kind+g.id,p=previous.get(k),cur=positions.get(k);let f=alpha;if(!cur||!p||Math.abs(cur.x-p.x)+Math.abs(cur.y-p.y)>2)f=1;const a=p||g,b=cur||g;return [mix(a.x,b.x,f),mix(a.y,b.y,f),!!p&&(a.x!==b.x||a.y!==b.y)];}
 function person(g,x,y,moving,staff=false){const offset=((g.id%3)-1)*.12,px=x+.5+offset,py=y+.5-offset,z=ground(state,x+.5,y+.5),p=xy(px,py,z),u=tile,walk=moving&&!reduced?Math.sin(sim*10+g.id)*u*.027:0,bob=moving&&!reduced?Math.abs(Math.sin(sim*10+g.id))*u*.011:0,body=staff?(g.role==='mechanic'?'#668ea2':'#73997a'):['#de9671','#b87f9f','#6e97a9','#e0b963','#80a591','#e6c2a5'][g.id%6],skin=['#edc99e','#ddac83','#b9896d','#f1d2af'][g.id%4];
  ellipse(p[0]+u*.016,p[1]+u*.018,u*.065,u*.033,'#4b6e4933');const feet=p[1]-u*.01;line([p[0]-u*.025,feet-u*.055],[p[0]-u*.029-walk,feet],'#526b64',u*.028);line([p[0]+u*.025,feet-u*.055],[p[0]+u*.032+walk,feet],'#526b64',u*.028);rr(p[0]-u*.053,p[1]-u*.173-bob,u*.106,u*.122,u*.031,body);line([p[0]-u*.055,p[1]-u*.138-bob],[p[0]-u*.071+walk,p[1]-u*.075],skin,u*.022);line([p[0]+u*.055,p[1]-u*.138-bob],[p[0]+u*.071-walk,p[1]-u*.075],skin,u*.022);circle(p[0],p[1]-u*.213-bob,u*.052,skin);c.beginPath();c.arc(p[0],p[1]-u*.222-bob,u*.053,Math.PI,TAU+.3);c.fillStyle=staff?'#f0dda5':['#655447','#80674d','#7b5946','#ae8355'][g.id%4];c.fill();if(staff)line([p[0]-u*.067,p[1]-u*.237-bob],[p[0]+u*.055,p[1]-u*.237-bob],'#f8e7b7',u*.025);
  if(!staff&&g.happy<35&&tile>36)badge('!',p[0],p[1]-u*.38,'#bf6955',u*.12);if(!staff&&g.id%13===0&&g.happy>65){const bx=p[0]+u*.16,by=p[1]-u*.65+Math.sin(wind+g.id)*u*.04;line([p[0]+u*.06,p[1]-u*.1],[bx,by+u*.06],'#8e9472',.6);ellipse(bx,by,u*.077,u*.092,g.id%2?'#e6b567':'#c789a3');circle(bx-u*.027,by-u*.03,u*.019,'#ffffff77');}
  if(staff&&g.role==='cleaner'){const a=[p[0]+u*.08,p[1]-u*.12],b=[p[0]+u*.13,p[1]+u*.015];line(a,b,'#b39669',u*.017);line([b[0]-u*.03,b[1]],[b[0]+u*.04,b[1]+u*.012],'#c3ac76',u*.04);}
 }
 function trackItems(r,items){const cap=view.layer==='all'?99:Number(view.layer);for(const seg of r.track||[]){if(Math.max(seg.from.z,seg.to.z)>cap)continue;if(!visible((seg.from.x+seg.to.x)/2,(seg.from.y+seg.to.y)/2,Math.max(seg.from.z,seg.to.z),tile*2))continue;items.push({d:(seg.from.x+seg.from.y+seg.to.x+seg.to.y)/2+1.1+Math.max(seg.from.z,seg.to.z)*.015,fn:()=>trackSegment(seg)});}
  if(r.test?.safe&&r.track.length){const total=r.test.curve.at(-1)?.time||1,t=r.cycle>0?((r.cycleDuration-r.cycle+visualAlpha)/r.cycleDuration)*total:0;for(let k=2;k>=0;k--){let tt=(t-k*.2+total)%total;if(r.cycle<=0)tt=k*.16;const q=trackPoint(r,tt);if(q&&Math.max(q.seg.from.z,q.seg.to.z)<=cap)items.push({d:q.x+q.y+1.16,fn:()=>trainCar(q,k,r.cycle>0)});}}
  if(r.id===view.selected){const end=r.track.length?r.track.at(-1).to:{x:r.x,y:r.y,z:r.z};items.push({d:99,fn:()=>{const p=xy(end.x+.5,end.y+.5,end.z+.1);circle(p[0],p[1],tile*.105,'#fff3bc','#528b70',2);circle(p[0],p[1],tile*.043,'#55876b');}});}
 }
 function trackSegment(seg){const a=xy(seg.from.x+.5,seg.from.y+.5,seg.from.z+.12),b=xy(seg.to.x+.5,seg.to.y+.5,seg.to.z+.12),n=Math.hypot(b[0]-a[0],b[1]-a[1]),ox=-(b[1]-a[1])/n*tile*.105,oy=(b[0]-a[0])/n*tile*.105;
  const gz=ground(state,seg.to.x,seg.to.y);if(seg.to.z>gz+.3){const foot=xy(seg.to.x+.5,seg.to.y+.5,gz);for(const side of [-1,1]){line([b[0]+ox*side,b[1]+oy*side],[foot[0]+ox*side,foot[1]+oy*side],'#9b8a66',tile*.046);line([b[0]+ox*side,b[1]+oy*side+rise*.25],[foot[0]-ox*side,foot[1]-oy*side],'#b09b73',tile*.027);}line([foot[0]-ox*1.4,foot[1]-oy*1.4],[foot[0]+ox*1.4,foot[1]+oy*1.4],'#8c8d70',tile*.07);}
  line(a,b,'#6c755d',tile*.255);for(let j=0;j<=1;j+=.15){const px=mix(a[0],b[0],j),py=mix(a[1],b[1],j);line([px-ox,py-oy],[px+ox,py+oy],'#c4ab7b',tile*.052);}for(const side of [-1,1]){line([a[0]+ox*side*.76,a[1]+oy*side*.76],[b[0]+ox*side*.76,b[1]+oy*side*.76],'#9a6d50',tile*.045);line([a[0]+ox*side*.76,a[1]+oy*side*.76-1],[b[0]+ox*side*.76,b[1]+oy*side*.76-1],'#f2d49b',tile*.022);}if(seg.piece==='lift')line(a,b,'#ebbd56',tile*.034);if(seg.piece==='brake'){for(const f of [.35,.55,.75]){const px=mix(a[0],b[0],f),py=mix(a[1],b[1],f);line([px-ox*.55,py-oy*.55],[px+ox*.55,py+oy*.55],'#b96f57',tile*.035);}}
 }
 function trackPoint(r,t){const curve=r.test.curve;let i=curve.findIndex(v=>v.time>=t);if(i<0)i=curve.length-1;const seg=r.track[i];if(!seg)return null;const start=i?curve[i-1].time:0,f=clamp((t-start)/(curve[i].time-start||1),0,1);return {seg,x:mix(seg.from.x,seg.to.x,f),y:mix(seg.from.y,seg.to.y,f),z:mix(seg.from.z,seg.to.z,f),f};}
 function trainCar(q,k,running){const p=xy(q.x+.5,q.y+.5,q.z+.28),a=xy(q.seg.from.x,q.seg.from.y,q.seg.from.z),b=xy(q.seg.to.x,q.seg.to.y,q.seg.to.z);c.save();c.translate(p[0],p[1]);c.rotate(Math.atan2(b[1]-a[1],b[0]-a[0]));rr(-tile*.15,-tile*.1,tile*.3,tile*.2,tile*.045,k===0?'#c97659':'#d69a65','#855f4a');rr(-tile*.075,-tile*.074,tile*.1,tile*.15,tile*.02,'#f0d3a0');if(running){circle(-tile*.025,-tile*.033,tile*.026,'#8d674c');circle(-tile*.025,tile*.04,tile*.026,'#b5815a');}line([tile*.1,-tile*.1],[tile*.1,tile*.1],'#f5db9e',tile*.025);c.restore();}
 function gate(s){const x=s.gate[0]+.5,y=s.gate[1]+.5,z=ground(s,x,y),left=xy(x-.02,y-.68,z),right=xy(x-.02,y+.68,z),topL=xy(x-.02,y-.68,z+2),topR=xy(x-.02,y+.68,z+2);shadow(x,y,z,tile*.55,half*.35,.15);for(const [a,b]of [[left,topL],[right,topR]]){line(a,b,'#e3d3a4',tile*.10);circle(b[0],b[1]-tile*.05,tile*.07,'#cc9e5b');}const strip=[topL,topR,[topR[0],topR[1]-tile*.28],[topL[0],topL[1]-tile*.28]];poly(strip,'#587f70','#476c5e',1);const p=[(topL[0]+topR[0])/2,(topL[1]+topR[1])/2-tile*.13];c.save();c.translate(p[0],p[1]);c.rotate(-Math.atan(.5));label('PAPER WIND',0,0,Math.max(6,tile*.125),'#fff0c8');c.restore();flag(x,y-.68,z+2.1,P.coral);for(const dy of [-.95,.95]){block(x-.18,y+dy,z,.36,.3,.35,'#e3c499','#c8a67c','#b6986b');shrub(x,y+dy+.13,z+.35,1);}if(s.parkOpen){const p=xy(x,y,z+.4);circle(p[0],p[1],tile*.048,'#80aa71');}}
 function waterAnimation(s){for(let y=0;y<32;y++)for(let x=0;x<32;x++){const n=E.cell(s,x,y);if(!n.water||!visible(x,y,n.height,tile)||hash(x,y)<.68)continue;const p=xy(x+.5,y+.5,n.height+.01),drift=(wind*.14+hash(x,y))%1-.5;ellipse(p[0]+drift*tile*.2,p[1],tile*.15,half*.044,'#c4e4d07a');if(hash(x+2,y)>.8)ellipse(p[0]-tile*.18,p[1]+half*.22,tile*.08,half*.034,'#dbead36b');}}
 function miniMap(s){const size=95,m=2.75,x=w-size-12,y=12;c.save();c.shadowColor='#47684c22';c.shadowBlur=12;rr(x-6,y-6,107,119,10,'#fffbeded','#c0cfba');c.restore();for(let k=0;k<1024;k++){const n=s.map[k];c.fillStyle=n.path?(n.path==='queue'?'#c38d7b':'#e3cda0'):n.water?'#7ab8b9':!n.owned?(view.landOwnership?'#b9786d':'#85a185'):'#a6c385';c.fillRect(x+k%32*m,y+Math.floor(k/32)*m,m+.1,m+.1);}for(const r of s.rides){c.fillStyle=E.RIDES[r.type]?.color||P.coral;c.fillRect(x+r.x*m,y+r.y*m,r.size*m,r.size*m);}for(const o of s.shops){c.fillStyle='#617c71';c.fillRect(x+o.x*m,y+o.y*m,m,m);}const corners=[[0,0],[w,0],[w,h],[0,h]].map(p=>{const a=inverse(...p);return [x+clamp(a[0],0,32)*m,y+clamp(a[1],0,32)*m];});poly(corners,'#fff2b019','#466d59',1.2);label('園區導覽  ↗ N',x+44,y+102,8.5,'#648372');}
 function selection(){const [x,y]=view.cursor,n=E.cell(state,x,y);if(!n)return;const z=n.height+(n.path==='bridge'?.25:0),sz=E.RIDES[view.tool]?.size||1,ok=view.preview?.ok!==false,colour=ok?'#fff2b0':'#df8066';if(view.tool){diamond(x,y,z+.05,sz,sz,.035,ok?'#fff5bf42':'#e6776540',colour,2);c.setLineDash([5,4]);diamond(x,y,z+.06,sz,sz,.035,null,ok?'#fffce5':'#b35745',1.1);c.setLineDash([]);if(E.RIDES[view.tool]){const p=xy(x+.5,y+sz+.5,z+.1);ellipse(p[0],p[1],tile*.23,half*.23,'#fff3cabb',P.coral,1.5);label('入口',p[0],p[1],Math.max(7,tile*.15),'#a66a4b');}}else{diamond(x,y,z+.06,1,1,.055,'#ffffef13','#eef0c4',1.4);}if(view.selected){const r=state.rides.find(v=>v.id===view.selected);if(r)diamond(r.x,r.y,r.z+.06,r.size,r.size,.01,null,'#fff1ac',2.5);}}
 function projectZones(s){if(view.projects===false)return;const plans=E.currentLevel(s).commissions,ch=Number.isInteger(view.projectIndex)&&plans[view.projectIndex]?plans[view.projectIndex]:E.currentCommission(s),zones=(ch.siteSpecs||[]).map((v,i)=>({rect:v.rect,label:'服務 '+(i+1),color:'#478f75'}));if(ch.coasterSpec?.stationRegion)zones.push({rect:ch.coasterSpec.stationRegion,label:'新站台',color:'#bc7754'});for(const [i,v]of (ch.coasterSpec?.visitRegions||[]).entries())zones.push({rect:v.rect,label:'軌道 '+(i+1),color:'#aa9050'});if(ch.goals.riverCampus)zones.push({rect:[27,0,5,32],label:'河東',color:'#478f75'});c.save();for(const z of zones){const [x,y,ww,hh]=z.rect,points=[[x,y],[x+ww,y],[x+ww,y+hh],[x,y+hh]].map(p=>xy(p[0],p[1],ground(s,Math.min(31,p[0]),Math.min(31,p[1]))+.04));c.setLineDash([5,4]);poly(points,z.color+'12',z.color+'b0',1.4);c.setLineDash([]);const p=xy(x+.8,y+.25,ground(s,x,y)+.05);label(z.label,p[0],p[1]-7,9,z.color);}for(const [i,v]of (ch.routeSpecs||[]).entries())for(const p of [v.from,v.to]){const q=xy(p[0]+.5,p[1]+.5,ground(s,...p)+.08);circle(q[0],q[1],Math.max(3,tile*.1),'#fff3b8','#ae875a',1.5);label('近路'+(i+1),q[0],q[1]-10,9,'#816749');}c.restore();}
 function draw(s,alpha=0,now=0){
  state=s;tile=clamp(52*view.zoom,16,125);half=tile*.5;rise=tile*.27;stamp=now||(root.performance?.now()||Date.now());if(!['paused','won','lost'].includes(s.mode))sceneClock+=lastStamp?clamp((stamp-lastStamp)/1000,0,.1):0;wind=reduced?0:sceneClock;const rawAlpha=clamp(alpha,0,1);tickAge=s.mode==='running'?rawAlpha:1;
  if(lastState!==s||s.tick<lastTick){lastState=s;lastTick=-1;lastMode=null;visualAlpha=0;alphaTick=-1;positions=new Map();previous=new Map();terrainKey='';}
  if(s.tick!==alphaTick){visualAlpha=rawAlpha;alphaTick=s.tick;}else if(s.mode==='running')visualAlpha=Math.max(visualAlpha,rawAlpha);tickAge=s.mode==='running'?visualAlpha:1;
  if(s.mode!==lastMode){positions=new Map();for(const [type,list]of [['g',s.guests],['s',s.staff]])for(const g of list)positions.set(type+g.id,{x:g.x,y:g.y});previous=positions;lastMode=s.mode;}
  if(s.tick!==lastTick){previous=positions;positions=new Map();for(const [type,list]of [['g',s.guests],['s',s.staff]])for(const g of list)positions.set(type+g.id,{x:g.x,y:g.y});lastTick=s.tick;}
  sim=s.tick+visualAlpha;if(reduced)sim=Math.floor(sim);lastStamp=stamp;
  const key=[w,h,view.x,view.y,tile,view.tool?'grid':'plain',view.landOwnership?'owned':'art',s.topology||0].join('/');
  if(key!==terrainKey){groundPass(s);terrainKey=key;}
  c=ctx;c.setTransform(ratio,0,0,ratio,0,0);c.drawImage(terrain,0,0,terrain.width,terrain.height,0,0,w,h);waterAnimation(s);projectZones(s);selection();
  const items=[];scenery(s,items);for(const o of s.shops)if(visible(o.x+.5,o.y+.5,ground(s,o.x,o.y),tile*2))items.push({d:o.x+o.y+1.5,fn:()=>shop(o)});for(const r of s.rides){if(visible(r.x+r.size/2,r.y+r.size/2,r.z,tile*5))items.push({d:r.x+r.y+r.size*1.48,fn:()=>ride(r)});if(r.type==='coaster')trackItems(r,items);}
  for(const g of s.guests){if(g.state==='riding'||g.state==='gone')continue;const [x,y,m]=guestPosition(g,'g',tickAge);if(visible(x,y,ground(s,x,y),tile))items.push({d:x+y+1.1,fn:()=>person(g,x,y,m)});}
  for(const p of s.staff){const [x,y,m]=guestPosition(p,'s',tickAge);if(visible(x,y,ground(s,x,y),tile))items.push({d:x+y+1.12,fn:()=>person(p,x,y,m,true)});}
  items.push({d:s.gate[0]+s.gate[1]+1.7,fn:()=>gate(s)});items.sort((a,b)=>a.d-b.d);for(const item of items)item.fn();
  if(s.weather==='rain'){c.fillStyle='#759ba110';c.fillRect(0,0,w,h);if(!reduced)for(let k=0;k<44;k++){const rx=(hash(k,91)*w+wind*18)%w,ry=(hash(k,37)*h+wind*205)%h;line([rx,ry],[rx-3,ry+9],'#e4eed348',.7);}}else if(s.weather==='hot'){const warm=c.createLinearGradient(0,0,w,h);warm.addColorStop(0,'#f4d5890f');warm.addColorStop(1,'#f4d58900');c.fillStyle=warm;c.fillRect(0,0,w,h);}miniMap(s);
  // The scene vignette stays very light, preserving clear placement contrast.
  const v=c.createLinearGradient(0,h-45,0,h);v.addColorStop(0,'#bfd6c000');v.addColorStop(1,'#759a7630');c.fillStyle=v;c.fillRect(0,h-45,w,45);
 }
 function overview(){view.x=16;view.y=16;view.zoom=Math.max(.25,Math.min(w/(32*52),h/(32*26))*.91);}
 function profile(canvas,r){const cc=canvas.getContext('2d'),width=canvas.clientWidth||280,height=130;canvas.width=width*ratio;canvas.height=height*ratio;cc.setTransform(ratio,0,0,ratio,0,0);cc.clearRect(0,0,width,height);cc.fillStyle='#687c6b';cc.font='10px system-ui';cc.fillText('軌道高度 / 列車速度',12,16);if(!r.track.length)return;const maxz=Math.max(2,...r.track.map(t=>t.to.z)),n=r.track.length;for(let j=0;j<=maxz;j++){const yy=105-j/maxz*65;cc.strokeStyle='#dce5d8';cc.beginPath();cc.moveTo(22,yy);cc.lineTo(width-12,yy);cc.stroke();cc.fillText(j,7,yy+3);}function plot(arr,color,max){cc.strokeStyle=color;cc.lineWidth=2;cc.lineJoin='round';cc.beginPath();arr.forEach((v,i)=>{const xx=22+i/Math.max(1,n-1)*(width-35),yy=105-v/max*65;i?cc.lineTo(xx,yy):cc.moveTo(xx,yy);});cc.stroke();}plot(r.track.map(t=>t.to.z),'#b38557',maxz);if(r.test?.curve.length)plot(r.test.curve.map(t=>t.speed),'#6498a9',12);cc.fillText('站台 → '+n+' 段 → 回站',24,122);}
 resize();return {view,draw,resize,xy,tileAt,overview,profile,getTile:()=>tile,getSize:()=>[w,h]};
}
root.ParkRender={create};})(typeof globalThis!=='undefined'?globalThis:this);
