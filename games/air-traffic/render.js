(function (root) {
'use strict';
const W=1000,H=700,TAU=Math.PI*2;
const palettes={
islands:{water:'#215c68',deep:'#174a59',land:'#608677',edge:'#a1ae83',accent:'#92b7a2'},
canyon:{water:'#507c78',deep:'#805e4c',land:'#b98462',edge:'#d9a77b',accent:'#d0a883'},
city:{water:'#225566',deep:'#153c50',land:'#4f716d',edge:'#74948a',accent:'#94a995'},
alpine:{water:'#547a85',deep:'#3d646e',land:'#8ba8a0',edge:'#b8c6b3',accent:'#d7e1d4'},
desert:{water:'#3e9089',deep:'#b19568',land:'#c6aa75',edge:'#e0c68e',accent:'#e5d6a5'},
lakes:{water:'#38767e',deep:'#427566',land:'#73926c',edge:'#adb485',accent:'#b6c897'},
volcano:{water:'#244e5c',deep:'#163744',land:'#62675d',edge:'#98917b',accent:'#b09c7e'},
aurora:{water:'#173b4c',deep:'#102c3e',land:'#416674',edge:'#719291',accent:'#9bbbb5'}
};
function rng(seed){return()=>{seed|=0;seed=seed+0x6d2b79f5|0;let t=Math.imul(seed^seed>>>15,1|seed);t^=t+Math.imul(t^t>>>7,61|t);return((t^t>>>14)>>>0)/4294967296;};}
function path(ctx,points,fill,stroke,width=1,close=true){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));if(close)ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}}
function blob(ctx,x,y,rx,ry,seed,fill,stroke,width=1){const r=rng(seed),pts=[];for(let i=0;i<32;i++){const a=i/32*TAU,z=.84+r()*.25;pts.push([x+Math.cos(a)*rx*z,y+Math.sin(a)*ry*z]);}path(ctx,pts,fill,stroke,width);}
function road(ctx,pts,color,width){ctx.lineCap='round';ctx.lineJoin='round';path(ctx,pts,null,color,width,false);}
function tree(ctx,x,y,s,color){path(ctx,[[x,y-s],[x-s*.55,y+s*.45],[x+s*.55,y+s*.45]],color);path(ctx,[[x,y-s*.2],[x-s*.65,y+s],[x+s*.65,y+s]],color);}
function hills(ctx,x,y,scale,night=false){const d=night?'#567b85':'#cad5c7',m=night?'#416875':'#8da6a0',s=night?'#294e60':'#688a8b';path(ctx,[[x-scale,y+scale*.6],[x,y-scale],[x+scale,y+scale*.6]],m);path(ctx,[[x,y-scale],[x+scale,y+scale*.6],[x+scale*.1,y+scale*.6]],s);path(ctx,[[x-scale*.31,y-scale*.51],[x,y-scale],[x+scale*.4,y-scale*.37],[x+scale*.15,y-scale*.44],[x,y-scale*.22],[x-scale*.14,y-scale*.49]],d);}
function background(ctx,map){const p=palettes[map.biome],r=rng(map.difficulty*1291);ctx.fillStyle=p.deep;ctx.fillRect(0,0,W,H);const gradient=ctx.createLinearGradient(0,0,W,H);gradient.addColorStop(0,p.water);gradient.addColorStop(1,p.deep);ctx.fillStyle=gradient;ctx.fillRect(0,0,W,H);
if(map.biome==='islands'){
for(const [x,y,rx,ry,s] of [[295,295,205,154,1],[700,455,225,155,3],[789,112,76,59,4],[120,580,70,55,7],[516,80,35,24,9]]){blob(ctx,x,y,rx+17,ry+17,s,'#45817c66');blob(ctx,x,y,rx+6,ry+6,s,p.edge);blob(ctx,x,y,rx,ry,s,p.land);blob(ctx,x-8,y+8,rx*.78,ry*.73,s,'#4e796c');}
for(let i=0;i<80;i++){const x=r()*W,y=r()*H;ctx.strokeStyle='#b9e0ca1a';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(x,y,12+r()*20,2,0,0,Math.PI);ctx.stroke();}
for(let i=0;i<46;i++){const b=i%2?{x:300,y:285}:{x:705,y:450},a=r()*TAU;const d=65+r()*80;tree(ctx,b.x+Math.cos(a)*d,b.y+Math.sin(a)*d*.7,6+r()*5,'#315e56');}
}else if(map.biome==='canyon'){
ctx.fillStyle='#9d7257';ctx.fillRect(0,0,W,H);
const river=[[495,-50],[540,85],[450,185],[545,300],[463,410],[527,525],[453,750]];
for(let i=5;i>=0;i--)road(ctx,river,['#b98864','#835f4c','#ca986d','#997054','#c5a27a','#5e8983'][5-i],90+i*58);
road(ctx,river,'#9ab2a388',3);
for(let i=0;i<25;i++){const x=r()*W,y=r()*H;if(Math.abs(x-490)<150)continue;blob(ctx,x,y,20+r()*45,12+r()*20,i+1,null,'#e2ba871e',2);}
road(ctx,[[30,230],[190,300],[230,420],[130,690]],'#c59d7466',3);road(ctx,[[730,0],[800,115],[755,325],[850,490],[790,710]],'#c59d7466',3);
}else if(map.biome==='city'){
path(ctx,[[0,0],[680,0],[635,83],[672,165],[592,274],[635,370],[565,452],[610,570],[526,700],[0,700]],p.land,p.edge,6);blob(ctx,752,350,126,207,55,p.land,p.edge,5);
ctx.save();ctx.beginPath();ctx.rect(30,20,535,650);ctx.clip();for(let row=0;row<11;row++)for(let col=0;col<9;col++){let x=col*66+15,y=row*68+10;ctx.fillStyle='#294f5555';ctx.fillRect(x,y,55,55);for(let k=0;k<3;k++){const bx=x+4+k*17,by=y+5+r()*12;ctx.fillStyle=k%2?'#6a8980':'#7b9484';ctx.fillRect(bx,by,12,25+r()*14);ctx.fillStyle='#9fb0a044';ctx.fillRect(bx+2,by+3,3,6);}}
ctx.restore();road(ctx,[[80,670],[200,545],[370,420],[580,355],[840,355]],'#a9ada366',10);road(ctx,[[80,670],[200,545],[370,420],[580,355],[840,355]],'#d5c99b66',2);
for(let i=0;i<8;i++){const y=66+i*78;road(ctx,[[6,y],[560,y]],'#9dad9533',2);}
for(let i=0;i<3;i++){ctx.fillStyle='#8aa598';ctx.fillRect(604+i*15,495+i*3,10,67);}
}else if(map.biome==='alpine'){
ctx.fillStyle='#8fa99e';ctx.fillRect(0,0,W,H);road(ctx,[[80,-50],[160,120],[420,230],[480,400],[635,540],[930,780]],'#729594',83);road(ctx,[[80,-50],[160,120],[420,230],[480,400],[635,540],[930,780]],'#6b959e',48);for(const t of [[73,380,125],[160,600,120],[370,90,100],[535,155,80],[878,490,125],[890,100,85]])hills(ctx,...t);
for(let i=0;i<110;i++){const x=r()*W,y=r()*H;tree(ctx,x,y,6+r()*10,r()>.5?'#466b66':'#517b6e');}
}else if(map.biome==='desert'){
ctx.fillStyle='#b89c6c';ctx.fillRect(0,0,W,H);for(let j=0;j<9;j++){ctx.beginPath();ctx.moveTo(-100,j*105-100);ctx.bezierCurveTo(220,j*100+70,690,j*100-100,1100,j*100+100);ctx.strokeStyle=j%2?'#d0b780':'#c2a674';ctx.lineWidth=43;ctx.stroke();ctx.strokeStyle='#e8d39b44';ctx.lineWidth=2;ctx.stroke();}
blob(ctx,500,385,160,90,25,'#a1a271');blob(ctx,500,385,133,66,25,'#638e73');blob(ctx,500,385,95,42,25,'#459b97');for(let i=0;i<22;i++){const a=r()*TAU;tree(ctx,500+Math.cos(a)*128,385+Math.sin(a)*62,9,'#417769');}for(const [x,y] of [[150,150],[850,100],[870,610],[75,575]]){blob(ctx,x,y,39,21,52,'#997c60');blob(ctx,x-5,y-5,31,17,52,'#c0a574');}
}else if(map.biome==='lakes'){
ctx.fillStyle='#79936e';ctx.fillRect(0,0,W,H);for(let i=0;i<65;i++){const x=(i%10)*105-10,y=Math.floor(i/10)*112-20;ctx.fillStyle=['#8f9f70','#7e9564','#9b9f68','#698965','#a6a878'][i%5];ctx.fillRect(x+2,y+2,98,105);for(let k=0;k<6;k++)road(ctx,[[x+8+k*15,y+5],[x+8+k*15,y+100]],'#d4cf9022',2);}
blob(ctx,510,353,194,237,11,'#9eac7b');blob(ctx,510,353,184,227,11,'#467d80');blob(ctx,495,359,163,208,11,'#3d747c');blob(ctx,507,360,60,65,19,'#7b9b72');for(let i=0;i<45;i++){const x=r()*W,y=r()*H;if(Math.abs(x-500)<180)continue;tree(ctx,x,y,5+r()*7,'#467359');}road(ctx,[[40,320],[200,340],[325,320],[693,340],[900,310]],'#b8b391',5);
}else if(map.biome==='volcano'){
blob(ctx,500,360,407,277,38,'#38606a');blob(ctx,500,360,393,263,38,p.edge);blob(ctx,500,360,382,252,38,p.land);for(let i=5;i>0;i--)blob(ctx,490,350,i*30,i*24,77,['#7f554c','#645950','#5b615a','#555d56','#58675e'][i-1]);blob(ctx,490,350,39,27,77,'#352e32');blob(ctx,490,350,22,15,77,'#bd7251');road(ctx,[[500,355],[526,394],[510,430],[557,469]],'#c4855f99',5);for(let i=0;i<25;i++){const a=r()*TAU,d=145+r()*90;tree(ctx,500+Math.cos(a)*d*1.35,350+Math.sin(a)*d*.8,6+r()*6,'#345650');}
}else if(map.biome==='aurora'){
for(const t of [[225,240,190,175,9],[735,300,210,220,10],[645,515,199,139,12],[225,500,180,160,14]]){blob(ctx,...t,p.edge);blob(ctx,t[0],t[1],t[2]-6,t[3]-6,t[4],p.land);}
for(const t of [[470,55,100],[62,400,73],[885,610,85]])hills(ctx,...t,true);
for(let i=0;i<45;i++){ctx.fillStyle=i%3?'#aedbd12b':'#dcfff077';ctx.beginPath();ctx.arc(r()*W,r()*H,.6+r(),0,TAU);ctx.fill();}for(let i=0;i<6;i++){const g=ctx.createLinearGradient(0,0,W,H);g.addColorStop(0,'#69dfb900');g.addColorStop(.5,'#69dfb913');g.addColorStop(1,'#8fa4e100');road(ctx,[[100+i*50,-30],[330+i*40,70],[610+i*40,-20],[1100,80+i*30]],g,30);}
}
for(let i=0;i<850;i++){ctx.fillStyle=i%2?'#ffffff05':'#07182108';ctx.fillRect(r()*W,r()*H,1+r()*2,1+r()*2);}
ctx.strokeStyle='#d0f2ea09';ctx.lineWidth=1;for(let x=50;x<W;x+=100){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}for(let y=50;y<H;y+=100){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
const vignette=ctx.createRadialGradient(500,350,200,500,350,610);vignette.addColorStop(0,'#031c2700');vignette.addColorStop(1,'#031c274a');ctx.fillStyle=vignette;ctx.fillRect(0,0,W,H);
for(const a of map.airports)airport(ctx,a,map.biome==='aurora');
}
function airport(ctx,a,night){const len=a.length||100;
ctx.save();ctx.translate(a.x,a.y);ctx.rotate(a.heading);ctx.strokeStyle=a.color+'65';ctx.lineWidth=1.4;ctx.setLineDash([5,6]);ctx.beginPath();ctx.moveTo(-len/2-125,-15);ctx.lineTo(-len/2,-15);ctx.moveTo(-len/2-125,15);ctx.lineTo(-len/2,15);ctx.stroke();ctx.setLineDash([]);
ctx.fillStyle='#14343f66';ctx.fillRect(-len/2-11,-24,len+22,48);ctx.fillStyle='#122d38';ctx.fillRect(-len/2,-13,len,26);ctx.strokeStyle=a.color+'99';ctx.lineWidth=2;ctx.strokeRect(-len/2,-13,len,26);
for(let i=0;i<3;i++){ctx.fillStyle=a.color+'bb';ctx.fillRect(-len/2+5,-9+i*7,6,4);}
ctx.lineWidth=1.2;ctx.strokeStyle='#d5e9de77';for(let x=-len/2+23;x<len/2-10;x+=14){ctx.beginPath();ctx.moveTo(x,-1);ctx.lineTo(x+7,-1);ctx.stroke();}
ctx.fillStyle=a.color;path(ctx,[[len/2-12,-5],[len/2-5,0],[len/2-12,5]],a.color);for(let x=-len/2-100;x<-len/2-20;x+=34){path(ctx,[[x-3,-4],[x+3,0],[x-3,4]],null,a.color+'88',1.5,false);}
if(night){ctx.shadowColor=a.color;ctx.shadowBlur=8;for(let x=-len/2;x<=len/2;x+=14){ctx.fillStyle=a.color;ctx.fillRect(x,-17,2,2);ctx.fillRect(x,15,2,2);}ctx.shadowBlur=0;}ctx.restore();
const h=a.helipad;ctx.fillStyle='#12303acf';ctx.strokeStyle=a.color+'88';ctx.lineWidth=2;ctx.beginPath();ctx.arc(h.x,h.y,18,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle=a.color;ctx.textAlign='center';ctx.font='bold 18px system-ui';ctx.fillText('H',h.x,h.y+6);
const labelX=a.x+Math.sin(a.heading)*61,labelY=a.y-Math.cos(a.heading)*61;ctx.font='600 12px system-ui';ctx.fillStyle='#f1f6e4';ctx.textAlign='center';ctx.fillText(a.id+' · '+a.name,labelX,labelY+22);ctx.beginPath();ctx.fillStyle=a.color;ctx.arc(labelX,labelY,9,0,TAU);ctx.fill();ctx.font='bold 11px system-ui';ctx.fillStyle='#183b40';ctx.fillText(a.id,labelX,labelY+4);
}
function edges(ctx,activeSide){ctx.save();const exits=[['N',500,17,0,'↑ 北'],['E',978,350,0,'→ 東'],['S',500,680,0,'↓ 南'],['W',22,350,0,'← 西']];for(const [s,x,y,rot,label]of exits){ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.textAlign='center';ctx.font='600 11px system-ui';ctx.fillStyle=s===activeSide?'#d4fff3':'#d1ece888';ctx.fillText(label,0,0);ctx.restore();}if(activeSide){ctx.strokeStyle='#aef3d0aa';ctx.lineWidth=5;ctx.beginPath();if(activeSide==='N'){ctx.moveTo(50,2);ctx.lineTo(950,2);}if(activeSide==='S'){ctx.moveTo(50,698);ctx.lineTo(950,698);}if(activeSide==='W'){ctx.moveTo(2,50);ctx.lineTo(2,650);}if(activeSide==='E'){ctx.moveTo(998,50);ctx.lineTo(998,650);}ctx.stroke();}ctx.restore();}
function route(ctx,aircraft,points,selected){if(!points?.length)return;ctx.save();ctx.strokeStyle=selected?'#e8fff3e6':aircraft.color+'70';ctx.lineWidth=selected?2.8:1.4;ctx.lineJoin='round';ctx.lineCap='round';ctx.setLineDash(selected?[]:[4,6]);ctx.beginPath();ctx.moveTo(aircraft.x,aircraft.y);for(const p of points)ctx.lineTo(p.x,p.y);ctx.stroke();ctx.setLineDash([]);const end=points[points.length-1];ctx.strokeStyle=aircraft.color;ctx.lineWidth=2;ctx.beginPath();ctx.arc(end.x,end.y,selected?5:3,0,TAU);ctx.stroke();ctx.restore();}
const exitArrows={N:'↑',E:'→',S:'↓',W:'←'};
function flight(ctx,a,time,opts){const scale=Math.max(1,.62/opts.scale),labelScale=Math.max(1,.87/opts.scale);const selected=opts.selected===a.id;
ctx.save();ctx.translate(a.x,a.y);
if(opts.danger.has(a.id)){ctx.strokeStyle='#ff9a8c';ctx.lineWidth=2;ctx.setLineDash([4,3]);ctx.beginPath();ctx.arc(0,0,26*scale,0,TAU);ctx.stroke();ctx.setLineDash([]);}
if(selected){ctx.strokeStyle='#fff9';ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(0,0,19*scale,0,TAU);ctx.stroke();}
ctx.save();ctx.rotate(a.heading+Math.PI/2);ctx.scale(scale,scale);ctx.shadowColor='#082130';ctx.shadowBlur=3;ctx.shadowOffsetY=3;ctx.fillStyle=a.color;ctx.strokeStyle='#14303d';ctx.lineWidth=1.1;
if(a.type==='helicopter'){ctx.beginPath();ctx.ellipse(0,0,4,8,0,0,TAU);ctx.fill();ctx.stroke();path(ctx,[[-1,5],[-2,16],[2,16],[1,5]],a.color,'#163441');ctx.shadowBlur=0;ctx.save();ctx.rotate(time*18);ctx.strokeStyle='#e7faf5';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(-13,0);ctx.lineTo(13,0);ctx.moveTo(0,-13);ctx.lineTo(0,13);ctx.stroke();ctx.restore();ctx.strokeStyle=a.color;ctx.beginPath();ctx.moveTo(-5,14);ctx.lineTo(5,14);ctx.stroke();
}else{const jet=a.type==='jet';path(ctx,[[0,-14],[3,-8],[3,-2],[jet?14:15,jet?7:3],[15,7],[3,5],[2,11],[6,14],[6,16],[0,13],[-6,16],[-6,14],[-2,11],[-3,5],[-15,7],[-15,jet?7:3],[-3,-2],[-3,-8]],a.color,'#173849',1);ctx.shadowBlur=0;ctx.fillStyle='#214951';ctx.fillRect(-1.4,-8,2.8,4);}
ctx.restore();ctx.save();ctx.scale(labelScale,labelScale);const text=a.airportId+(a.kind==='departure'?' '+exitArrows[a.exitSide]:'');ctx.font='700 10px system-ui';ctx.textAlign='center';const w=ctx.measureText(text).width+10;ctx.fillStyle='#102e3be8';ctx.fillRect(-w/2,14,w,14);ctx.fillStyle=a.color;ctx.fillText(text,0,24);ctx.restore();ctx.restore();
}
function pending(ctx,p,time,scale){const f=Math.max(1,.7/scale),x=Math.max(24,Math.min(976,p.x)),y=Math.max(35,Math.min(662,p.y));ctx.save();ctx.translate(x,y);ctx.strokeStyle=p.color||'#e3f8df';ctx.lineWidth=1.5*f;ctx.globalAlpha=.65;ctx.setLineDash([3*f,4*f]);ctx.beginPath();ctx.arc(0,0,19*f,0,TAU);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1;ctx.fillStyle='#0e303fe8';ctx.beginPath();ctx.arc(0,0,12*f,0,TAU);ctx.fill();ctx.font=`bold ${12*f}px system-ui`;ctx.textAlign='center';ctx.fillStyle=p.color||'#edf9e9';ctx.fillText(p.waiting?'待':Math.max(1,Math.ceil(p.countdown||0)),0,4*f);ctx.font=`600 ${9*f}px system-ui`;ctx.fillText((p.airportId||'')+(p.kind==='departure'?' '+exitArrows[p.exitSide]:' 入場'),0,33*f);ctx.restore();}
function draw(ctx,cache,state,opts={}){opts.scale=opts.scale||1;ctx.clearRect(0,0,W,H);ctx.drawImage(cache,0,0,W,H);const selected=state.aircraft.find(a=>a.id===opts.selected);edges(ctx,selected?.kind==='departure'?selected.exitSide:null);const danger=new Set((state.warnings||[]).flatMap(w=>w.ids));for(const a of state.aircraft){if(opts.preview&&a.id===opts.selected)route(ctx,a,opts.preview,true);else route(ctx,a,a.route,a.id===opts.selected);}
for(const p of state.pending||[])pending(ctx,p,state.time,opts.scale);
if(opts.snap){const a=opts.snap;ctx.strokeStyle=a.color;ctx.lineWidth=3;ctx.save();ctx.translate(a.x,a.y);ctx.rotate(a.heading);ctx.strokeRect(-a.length/2-5,-18,a.length+10,36);ctx.restore();}
for(const a of state.aircraft)flight(ctx,a,state.time,{...opts,danger});
if(state.status==='failed'&&state.failure?.ids){const pair=state.aircraft.filter(a=>state.failure.ids.includes(a.id));if(pair.length){const x=pair.reduce((n,a)=>n+a.x,0)/pair.length,y=pair.reduce((n,a)=>n+a.y,0)/pair.length;ctx.strokeStyle='#ff9c8e';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,40,0,TAU);ctx.stroke();}}
}
root.AirTrafficRenderer={background,draw,airport,palettes,exitArrows};
})(typeof globalThis!=='undefined'?globalThis:this);
