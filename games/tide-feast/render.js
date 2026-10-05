(function(root){'use strict';
 const E=root.TideFeast||(typeof require==='function'?require('./engine.js'):null),TAU=Math.PI*2;
 const hash=(x,y=0)=>{const n=Math.sin(x*127.1+y*311.7)*43758.5453123;return n-Math.floor(n);};
 function ellipse(c,x,y,rx,ry,fill){c.beginPath();c.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),0,0,TAU);c.fillStyle=fill;c.fill();}
 function path(c,points,fill){c.beginPath();c.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)c.lineTo(points[i][0],points[i][1]);c.closePath();c.fillStyle=fill;c.fill();}
 function rounded(c,x,y,w,h,r,fill){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();}
 function fish(c,sp,x,y,length,angle,time,hero=false,boost=false){
   c.save();c.translate(x,y);if(Math.cos(angle)<0){c.rotate(angle-Math.PI);c.scale(-1,1);}else c.rotate(angle);
   const l=length,w=Math.max(3,l),kind=hero?'hero':sp.shape,tail=Math.sin(time*(boost?15:7)+x*.003)*.09*w;
   let deep=['disc','round','shield'].includes(kind)?.30:kind==='giant'?.23:kind==='ribbon'?.15:.22;
   const body=hero?'#f3dba0':sp.color,fin=hero?'#e9a376':sp.fin,shadow=hero?'#deae76':sp.fin;
   // Distinct silhouettes rather than recolouring a single oval.
   path(c,[[-w*.28,0],[-w*.61,-w*.23+tail],[-w*.52,tail*.6],[-w*.62,w*.21+tail],[-w*.26,w*.035]],fin);
   if(kind==='sail')path(c,[[-w*.20,-w*.12],[-w*.10,-w*.53],[w*.14,-w*.38],[w*.27,-w*.09]],fin);
   else if(kind==='dart')path(c,[[-w*.20,-w*.09],[-w*.02,-w*.31],[w*.10,-w*.12]],fin);
   else path(c,[[-w*.26,-w*.04],[-w*.14,-w*(deep+.14)],[w*.13,-w*(deep+.03)],[w*.25,-w*.02]],fin);
   path(c,[[-w*.18,w*.05],[-w*.09,w*(deep+.15)],[w*.21,w*.13]],fin);
   const grad=c.createLinearGradient(0,-w*deep,0,w*deep);grad.addColorStop(0,body);grad.addColorStop(.67,body);grad.addColorStop(1,shadow);
   c.beginPath();c.moveTo(-w*.39,0);c.bezierCurveTo(-w*.25,-w*deep,w*.28,-w*(deep*1.3),w*.49,-w*.012);c.bezierCurveTo(w*.46,w*deep,w*.02,w*(deep*1.08),-w*.39,0);c.fillStyle=grad;c.fill();
   c.strokeStyle=hero?'#fff2cf88':'#d2f3ed22';c.lineWidth=Math.max(.6,w*.013);c.stroke();
   c.globalAlpha=.23;c.beginPath();c.moveTo(-w*.25,-w*.05);c.bezierCurveTo(0,-w*.19,w*.29,-w*.21,w*.38,-w*.04);c.lineTo(-w*.25,-w*.05);c.fillStyle='#fff9d1';c.fill();c.globalAlpha=1;
   if(kind==='ribbon'||kind==='shield'||kind==='sun'||kind==='disc')for(let i=0;i<3;i++){c.strokeStyle=fin+'99';c.lineWidth=w*.055;c.beginPath();c.moveTo(-w*.16+i*w*.14,-w*deep*.76);c.quadraticCurveTo(-w*.23+i*w*.14,0,-w*.12+i*w*.14,w*deep*.65);c.stroke();}
   if(kind==='giant'){for(let i=0;i<5;i++)ellipse(c,(-.19+i*.105)*w,-.06*w,w*.023,w*.017,'#d8e9e1aa');}
   if(kind==='lantern'){c.strokeStyle=fin;c.lineWidth=Math.max(1,w*.025);c.beginPath();c.moveTo(w*.17,-w*.15);c.quadraticCurveTo(w*.12,-w*.48,w*.36,-w*.35);c.stroke();ellipse(c,w*.37,-w*.35,w*.045,w*.045,'#efe6ab');}
   // Pectoral fin and gill.
   c.globalAlpha=.62;path(c,[[w*.075,w*.015],[-w*.015,w*.20],[w*.19,w*.10]],fin);c.globalAlpha=1;
   c.strokeStyle=fin;c.lineWidth=Math.max(.6,w*.015);c.beginPath();c.arc(w*.22,0,w*.12,2.25,4.02);c.stroke();
   ellipse(c,w*.30,-w*.055,w*.064,w*.069,'#fcf4d8');ellipse(c,w*.319,-w*.055,w*.033,w*.043,'#15343e');ellipse(c,w*.33,-w*.075,w*.012,w*.015,'#fff');
   c.strokeStyle=hero?'#91604f':'#204a5a';c.lineWidth=Math.max(.7,w*.013);c.beginPath();c.moveTo(w*.43,w*.068);c.quadraticCurveTo(w*.39,w*.091,w*.36,w*.069);c.stroke();
   if(hero){ellipse(c,w*.28,w*.055,w*.045,w*.024,'#efad86aa');c.fillStyle='#fff2bc';c.beginPath();c.moveTo(-w*.055,-w*.27);c.lineTo(-w*.10,-w*.36);c.lineTo(w*.015,-w*.30);c.lineTo(w*.09,-w*.37);c.lineTo(w*.12,-w*.23);c.closePath();c.fill();}
   c.restore();
 }
 function biome(s){const p=s.player,sector=Math.floor((p.x+s.rebaseX)/180)+Math.floor((p.y+s.rebaseY)/210);const n=((sector%4)+4)%4;return [{name:'日光淺灣',top:'#237d82',mid:'#105866',bottom:'#082f42'}, {name:'翡翠草海',top:'#267b72',mid:'#145d61',bottom:'#0b3445'}, {name:'藍潮外海',top:'#226b87',mid:'#144e70',bottom:'#092c47'}, {name:'幽光深流',top:'#32567e',mid:'#253f67',bottom:'#10283f'}][n];}
 function create(canvas){const c=canvas.getContext('2d');let camera=null,lastSize=2,ww=960,hh=600,dpr=1,lastZ=12.5;
   function resize(width,height,ratio=1){ww=width;hh=height;dpr=Math.min(2,Math.max(1,ratio));canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);}
   function reset(s){camera={x:s.player.x,y:s.player.y};lastSize=s.player.size;}
   function draw(s,opts={}){
     const now=opts.reduced?0:s.time,p=s.player; if(!camera||Math.abs(camera.x-p.x)>E.view(s).w*5||Math.abs(camera.y-p.y)>E.view(s).h*5)reset(s);const smoothing=opts.snap?1:.11;camera.x+=(p.x-camera.x)*smoothing;camera.y+=(p.y-camera.y)*smoothing;lastSize+=(p.size-lastSize)*.11;
     const v=E.view(s),z=hh/(48*E.scale(lastSize)),b=biome(s),sx=x=>(x-camera.x)*z+ww/2,sy=y=>(y-camera.y)*z+hh/2;
     lastZ=z;c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,ww,hh);
     const gradient=c.createLinearGradient(0,0,0,hh);gradient.addColorStop(0,b.top);gradient.addColorStop(.55,b.mid);gradient.addColorStop(1,b.bottom);c.fillStyle=gradient;c.fillRect(0,0,ww,hh);
     // Distant surface rays and filtered underwater light.
     c.save();c.globalCompositeOperation='screen';for(let i=0;i<6;i++){const x=ww*(i*.24-.19)+Math.sin(now*.06+i)*ww*.03-camera.x*z*.055%100;c.beginPath();c.moveTo(x,0);c.lineTo(x+ww*.08,0);c.lineTo(x-ww*.03,hh);c.lineTo(x-ww*.23,hh);c.closePath();const ray=c.createLinearGradient(0,0,0,hh);ray.addColorStop(0,'#b3e4b712');ray.addColorStop(1,'#bad1b300');c.fillStyle=ray;c.fill();}c.restore();
     // Far reefs are decorative; they never secretly block a fish's movement.
     const unit=94,parx=camera.x*z*.12,pary=camera.y*z*.12;
     for(let i=-2;i<=Math.ceil(ww/unit)+2;i++){
       const index=i+Math.floor(parx/unit),x=i*unit-(parx%unit),base=hh*.90+Math.sin(index*1.27)*hh*.16-(pary%57)*.2,h=50+hash(index,2)*100;
       c.globalAlpha=.32;ellipse(c,x,base+30,unit*.8,40+hash(index,3)*40,'#082e43');
       for(let j=0;j<3;j++){const xx=x+(j-1)*16,top=base-h*(.55+j*.19),sway=Math.sin(now*.45+index+j)*9;c.beginPath();c.moveTo(xx-5,base);c.bezierCurveTo(xx-20,base-h*.5,xx+sway+14,top+18,xx+sway,top);c.bezierCurveTo(xx+sway-12,top+30,xx+10,base-h*.4,xx+5,base);c.closePath();c.fillStyle=j%2?'#226c79':'#36867c';c.fill();}
       c.globalAlpha=.55;if(hash(index,5)>.5){for(let j=0;j<4;j++){const xx=x-18+j*13;c.strokeStyle='#688e94';c.lineWidth=3;c.lineCap='round';c.beginPath();c.moveTo(xx,base+3);c.lineTo(xx+Math.sin(j+index)*12,base-22-j*5);c.lineTo(xx-7,base-35-j*4);c.stroke();}}c.globalAlpha=1;
     }
     // Drifting marine snow creates parallax without filling the entity simulation.
     for(let i=0;i<70;i++){const x=((hash(i,9)*ww-camera.x*z*.27+now*(1+hash(i,1)))%ww+ww)%ww,y=((hash(i,12)*hh-camera.y*z*.27-now*(.5+hash(i,3)))%hh+hh)%hh;ellipse(c,x,y,.6+hash(i,4)*1.2,.6+hash(i,4)*1.2,'#c7e5d126');}
     for(const f of s.plankton){const x=sx(f.x),y=sy(f.y);if(x< -10||x>ww+10||y< -10||y>hh+10)continue;const r=2.1+Math.sin(now*2+f.phase)*.45;c.globalAlpha=.15;ellipse(c,x,y,r*3,r*3,'#eff2b4');c.globalAlpha=.95;ellipse(c,x,y,r,r,'#d8eaa8');c.strokeStyle='#f4f1b39c';c.lineWidth=.7;c.beginPath();c.moveTo(x-r-2,y);c.lineTo(x+r+2,y);c.moveTo(x,y-r-2);c.lineTo(x,y+r+2);c.stroke();c.globalAlpha=1;}
     const sorted=s.fish.slice().sort((a,b)=>b.size-a.size),nearby=[];
     for(const f of sorted){const x=sx(f.x),y=sy(f.y),len=f.size*z;if(x< -len||x>ww+len||y< -len||y>hh+len)continue;const rel=E.relation(p.size,f.size),d=Math.hypot(f.x-p.x,f.y-p.y);
       fish(c,E.byId[f.species],x,y,len,f.angle,now);
       if(d<p.size*5.6+f.size*2.5)nearby.push({f,x,y,len,rel,d});
       if(rel==='prey'){c.strokeStyle='#acf1bd99';c.lineWidth=1.4;c.beginPath();c.arc(x,y,Math.max(7,len*.43),-.6,.75);c.stroke();}
       if(rel==='danger'){const yy=y-Math.max(12,len*.30);path(c,[[x,yy-6],[x-4,yy+1],[x+4,yy+1]],'#f8a79a');if(f.state==='warn'||f.state==='hunt'){c.strokeStyle=f.state==='warn'?'#ffbd9299':'#fd8b8899';c.lineWidth=1.5;c.beginPath();c.arc(x,y,len*.51+(Math.sin(now*9)+1)*3,0,TAU);c.stroke();c.font='bold 15px system-ui';c.fillStyle='#ffe0ac';c.textAlign='center';c.fillText('!',x,yy-11);}}
     }
     nearby.sort((a,b)=>a.d-b.d);for(const o of nearby.slice(0,7)){const {f,x,y,len,rel}=o;if(len<12)continue;const label=E.formatSize(f.size);c.font='10px system-ui';c.textAlign='center';const tw=c.measureText(label).width;rounded(c,x-tw/2-5,y+len*.31+5,tw+10,17,5,'#082b3acc');c.fillStyle=rel==='prey'?'#b7edbd':rel==='danger'?'#f5b7a6':'#c7d4d6';c.fillText(label,x,y+len*.31+17);}
     const px=sx(p.x),py=sy(p.y),plen=lastSize*z;
     if(p.boosting){for(let i=0;i<7;i++){const d=(i*.15+(now*3%1))%1,x=px-Math.cos(p.angle)*plen*(.5+d*.9),y=py-Math.sin(p.angle)*plen*(.5+d*.9);ellipse(c,x,y,3*(1-d),3*(1-d),'#e6e8b257');}}
     if(p.invulnerable>0){c.fillStyle='#d8eadc0b';c.strokeStyle='#c5eee08a';c.lineWidth=1.2;c.beginPath();c.arc(px,py,Math.max(18,plen*.72),0,TAU);c.fill();c.stroke();}
     if(p.invulnerable<=0||s.time% .22<.15||p.invulnerable>3.2)fish(c,null,px,py,plen,p.angle,now,true,p.boosting);
     // The physical length stays attached to the player, even while the camera glides.
     const label=E.formatSize(p.size),font=ww<600?12:13;c.font='600 '+font+'px system-ui';c.textAlign='center';const labelW=c.measureText(label).width+24,labelY=py-Math.max(23,plen*.48)-19;
     rounded(c,px-labelW/2,labelY,labelW,25,12,'#f6e2af');c.fillStyle='#163e49';c.fillText(label,px,labelY+17);path(c,[[px-4,labelY+24],[px+4,labelY+24],[px,labelY+29]],'#f6e2af');
     if(p.invulnerable>3.2){c.font='9px system-ui';c.fillStyle='#ddedd1';c.fillText('護泡 '+Math.ceil(p.invulnerable)+'s',px,py+Math.max(22,plen*.44)+14);}
     for(const e of s.effects){const x=sx(e.x),y=sy(e.y),a=Math.min(1,e.life),t=1-e.life;c.globalAlpha=a;
       if(e.type==='mote'||e.type==='eat'){const r=(e.type==='eat'?Math.max(8,e.size*z*.4):3)+t*22;c.strokeStyle=e.type==='eat'?'#d9eeb3':'#f0ecc1';c.lineWidth=1.5;c.beginPath();c.arc(x,y,r,0,TAU);c.stroke();}
       else if(e.type==='level'){c.strokeStyle='#f3da9977';c.lineWidth=2;c.beginPath();c.arc(x,y,Math.max(16,e.size*z*.7)+(2.4-e.life)*35,0,TAU);c.stroke();}
       c.globalAlpha=1;
     }
     // A quiet waypoint points to actual food when the immediate view is empty.
     const foods=p.size<3.1?s.plankton:s.fish.filter(f=>E.relation(p.size,f.size)==='prey');
     if(foods.length&&!foods.some(f=>Math.abs(sx(f.x)-ww/2)<ww*.43&&Math.abs(sy(f.y)-hh/2)<hh*.40)){
       let target=foods.reduce((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)<Math.hypot(b.x-p.x,b.y-p.y)?a:b),dx=target.x-p.x,dy=target.y-p.y,ang=Math.atan2(dy,dx),r=Math.min(ww*.37/(Math.abs(Math.cos(ang))||.01),hh*.34/(Math.abs(Math.sin(ang))||.01)),x=ww/2+Math.cos(ang)*r,y=hh/2+Math.sin(ang)*r;c.save();c.translate(x,y);c.rotate(ang);path(c,[[8,0],[-4,-5],[-1,0],[-4,5]],'#d3e2ad');c.restore();c.font='10px system-ui';c.fillStyle='#c5debb';c.textAlign='center';c.fillText(p.size<3.1?'浮游生物':'小魚群',x,y+20);
     }
     if(opts.pointer&&opts.pointer.active&&!opts.pointer.touch){c.strokeStyle='#e1e6b87a';c.lineWidth=1;c.beginPath();c.arc(opts.pointer.x,opts.pointer.y,7,0,TAU);c.stroke();}
     const vig=c.createRadialGradient(ww*.5,hh*.43,hh*.25,ww*.5,hh*.5,Math.max(ww,hh)*.71);vig.addColorStop(0,'#00152200');vig.addColorStop(1,'#031b3844');c.fillStyle=vig;c.fillRect(0,0,ww,hh);
     return{camera:{...camera},z,px,py,biome:b.name};
   }
   function playerScreen(s){const z=lastZ;return{x:(s.player.x-(camera?.x??s.player.x))*z+ww/2,y:(s.player.y-(camera?.y??s.player.y))*z+hh/2};}
   return {draw,resize,reset,playerScreen};
 }
 const api={create,fish,biome};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.TideRender=api;
})(typeof globalThis!=='undefined'?globalThis:this);
