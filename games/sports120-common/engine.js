/* The only state transition implementation, used by browser, corpus builder and tests. */
(function(root,factory){const api=factory();if(typeof module==='object')module.exports=api;else root.SportsEngine=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const VERSION='sports120-1.0.1',DT=1/60,TAU=Math.PI*2;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));const len=(x,y)=>Math.hypot(x,y);const dist=(a,b)=>len(a.x-b.x,a.y-b.y);const rad=a=>a*Math.PI/180;const deg=a=>a*180/Math.PI;const clone=x=>JSON.parse(JSON.stringify(x));
function rng(seed){return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
function vec(a,p){return{x:Math.cos(rad(a))*p,y:Math.sin(rad(a))*p};}
function ball(x,y,r=10){return{x,y,vx:0,vy:0,r,z:0,vz:0,active:true};}
function actor(x,y,r=22){return{x,y,r,vx:0,vy:0,stamina:100,cooldown:0,stun:0,attack:0,parry:0};}
function input(raw={}){let a={};for(const k of ['mx','my','aim','power','spin','loft','p2x','p2y'])if(Number.isFinite(raw[k]))a[k]=clamp(raw[k],k==='power'?1:k==='loft'?10:k==='aim'?-180:-1,k==='power'?100:k==='loft'?85:k==='aim'?180:1);if(raw.target&&Number.isFinite(raw.target.x)&&Number.isFinite(raw.target.y))a.target={x:clamp(raw.target.x,0,1000),y:clamp(raw.target.y,0,600)};if(['shoot','lob','drop','smash','pass','switch','fake','receive','set','spike','parry','feint'].includes(raw.action))a.action=raw.action;if(['shoot','parry','feint','lob','drop','smash'].includes(raw.p2action))a.p2action=raw.p2action;if(raw.sweep)a.sweep=true;if(raw.run)a.run=true;return a;}
function move(p,u,s,b){const ox=p.x,oy=p.y;let mx=u.mx||0,my=u.my||0;if(u.target){mx=u.target.x-p.x;my=u.target.y-p.y;const d=len(mx,my);if(d>s){mx*=s/d;my*=s/d;}p.x+=mx;p.y+=my;}else{const d=Math.max(1,len(mx,my));p.x+=mx/d*s;p.y+=my/d*s;}p.x=clamp(p.x,b[0],b[1]);p.y=clamp(p.y,b[2],b[3]);p.vx=p.x-ox;p.vy=p.y-oy;}
function toward(p,x,y,s,b){move(p,{target:{x,y}},s,b);}
function finish(s,won,text){if(s.status!=='playing')return;s.status=won?'won':'lost';s.message=text;s.resultTick=s.tick;}
function resetShot(s,b){b.vx=b.vy=b.vz=0;s.phase='ready';s.lastLanding={x:b.x,y:b.y};if(s.attempts>=(s.level.maxShots||3))finish(s,false,'次數用完，調整角度後再試。');else {b.x=s.level.start.x;b.y=s.level.start.y;b.z=0;}}
function circle(a,b,e=0.9){if(!a.active||!b.active)return false;let dx=b.x-a.x,dy=b.y-a.y,d=len(dx,dy),r=a.r+b.r;if(d>=r)return false;if(d<0.0001){dx=1;dy=0;d=1;}const nx=dx/d,ny=dy/d;const overlap=r-d;a.x-=nx*overlap*.5;a.y-=ny*overlap*.5;b.x+=nx*overlap*.5;b.y+=ny*overlap*.5;const rel=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;if(rel<0){const impulse=-(1+e)*rel*.5;a.vx-=impulse*nx;a.vy-=impulse*ny;b.vx+=impulse*nx;b.vy+=impulse*ny;}return true;}
function rail(b,x0,x1,y0,y1,e=.85){if(b.x-b.r<x0){b.x=x0+b.r;b.vx=Math.abs(b.vx)*e;}if(b.x+b.r>x1){b.x=x1-b.r;b.vx=-Math.abs(b.vx)*e;}if(b.y-b.r<y0){b.y=y0+b.r;b.vy=Math.abs(b.vy)*e;}if(b.y+b.r>y1){b.y=y1-b.r;b.vy=-Math.abs(b.vy)*e;}}
function rectHit(b,r){const x=clamp(b.x,r.x,r.x+r.w),y=clamp(b.y,r.y,r.y+r.h);let dx=b.x-x,dy=b.y-y;if(dx*dx+dy*dy>=b.r*b.r)return false;if(Math.abs(dx)>Math.abs(dy)){b.x=x+Math.sign(dx||1)*b.r;b.vx*=-.82;}else{b.y=y+Math.sign(dy||1)*b.r;b.vy*=-.82;}return true;}
function create(kind,level,options={}){const L=clone(level),s={version:VERSION,kind,level:L,tick:0,status:'playing',phase:'ready',message:'準備好了。',attempts:0,contacts:0,passes:0,score:0,aiEvents:[],options:{difficulty:options.opponent==='human'?'normal':options.difficulty||'normal',opponent:options.opponent||'ai',mode:options.mode||'challenge'},lastInput:{},trail:[]};s.p=actor(L.player?.x||L.start?.x||120,L.player?.y||L.start?.y||300);s.q=actor(L.opponent?.x||850,L.opponent?.y||300);s.b=Object.assign(ball(L.start?.x||150,L.start?.y||300),L.ball||{});s.target=clone(L.target||{x:850,y:300,r:30});s.controls={aim:L.defaultAim??0,power:60,spin:0,loft:45};
s.aiDifficultyScale={easy:.72,normal:1,hard:1.28}[s.options.difficulty]||1;s.aiSpeed=(L.aiSpeed||2)*s.aiDifficultyScale;s.aiLatency={easy:18,normal:10,hard:5}[s.options.difficulty]||10;s.aiTarget={x:s.q.x,y:s.q.y};
if(kind==='hockey'){s.p.r=28;s.q.r=29;s.b.r=13;}
if(kind==='pong'){s.p.x=70;s.q.x=930;s.p.r=L.paddle||43;s.q.r=L.aiPaddle||43;s.b.x=90;s.b.y=s.p.y;s.b.r=9;s.spin=0;}
if(kind==='badminton'||kind==='volleyball'){s.p.y=s.q.y=500;s.b.r=kind==='badminton'?7:13;s.b.z=0;s.b.y=L.start.y;s.lastHitter=0;}
if(kind==='soccer'){s.team=(L.team||[{x:200,y:350},{x:430,y:220},{x:420,y:450}]).map(p=>actor(p.x,p.y,19));s.defenders=(L.defenders||[{x:650,y:180},{x:630,y:430},{x:900,y:300}]).map(p=>actor(p.x,p.y,20));s.selected=0;s.owner=0;s.b.x=s.team[0].x+24;s.b.y=s.team[0].y;s.p=s.team[0];s.q=s.defenders[2];s.passTo=-1;}
if(kind==='basketball'){s.b.z=35;s.q.stun=0;s.fakes=0;}
if(kind==='tennis'){s.b.z=L.ball?.z??65;s.bounces=0;s.lastHitter=0;}
if(kind==='volleyball'){s.touches=0;s.cooldown=0;}
if(kind==='bowling'){s.b.r=17;s.pins=L.pins.map(p=>Object.assign(ball(p.x,p.y,13),{homeX:p.x,homeY:p.y,fallen:false}));s.rolls=[];}
if(kind==='billiards'){s.b.r=12;s.objects=L.objects.map(p=>Object.assign(ball(p.x,p.y,12),{number:p.number||1}));s.pockets=[{x:42,y:42},{x:500,y:32},{x:958,y:42},{x:42,y:558},{x:500,y:568},{x:958,y:558}];s.firstCollision=false;}
if(kind==='curling'){s.b.r=19;s.stones=(L.stones||[]).map(p=>Object.assign(ball(p.x,p.y,19),{team:p.team||1}));s.sweepTicks=0;}
if(kind==='archery'){s.b.r=4;s.wind=L.wind||0;}
if(kind==='golf'){s.b.r=10;s.gates=clone(L.gates||[]);s.obstacles=clone(L.obstacles||[]);}
if(kind==='baseball'){s.b.x=850;s.b.y=325;s.b.z=0;s.phase='pitch';s.pitch=L.pitch||'fast';s.pitchDelay=L.pitchDelay||35;s.swingCooldown=0;s.strikes=0;s.runner=0;s.runTarget=1;s.fielders=(L.fielders||[{x:650,y:180},{x:770,y:420},{x:850,y:300}]).map(p=>actor(p.x,p.y,18));s.returnTimer=0;s.fielderSpeed=(L.fielderSpeed||3.3)*(s.options.opponent==='human'?1:s.aiDifficultyScale);s.fielderTargets=s.fielders.map(p=>({x:p.x,y:p.y}));s.fieldTargetsSet=false;}
if(kind==='fencing'){s.p.y=s.q.y=430;s.p.x=L.player.x;s.q.x=L.opponent.x;s.q.attack=L.incoming||0;s.q.cooldown=L.incoming?60:0;s.parries=0;}
if(kind==='frisbee'){s.b.z=20;s.b.r=12;}
return s;}
function aiMove(s,x,y,bounds){if(s.options.opponent==='human'){move(s.q,{mx:s.lastInput.p2x,my:s.lastInput.p2y},({hockey:7,pong:6.5,badminton:5,basketball:4.8,tennis:5.5,volleyball:5.2}[s.kind]||s.aiSpeed),bounds);return;}if(s.tick%s.aiLatency===0)s.aiTarget={x,y};toward(s.q,s.aiTarget.x,s.aiTarget.y,s.aiSpeed,bounds);}
function logAI(s,action){s.aiEvents.push({tick:s.tick,action,x:s.q.x,y:s.q.y,stamina:s.q.stamina});if(s.aiEvents.length>300)s.aiEvents.shift();}
function readyShot(s,u,speed){if(s.phase!=='ready'||u.action!=='shoot')return false;const v=vec(s.controls.aim,speed);s.b.vx=v.x;s.b.vy=v.y;s.phase='flight';s.attempts++;s.trail=[];return true;}
function hockey(s,u){let b=s.b,L=s.level;move(s.p,u,7,[50,950,320,552]);aiMove(s,b.x,clamp(b.y-70,65,240),[60,940,55,260]);
if(u.action==='shoot'&&dist(s.p,b)<s.p.r+b.r+25){const v=vec(s.controls.aim,8+s.controls.power*.14);b.vx=v.x;b.vy=v.y;s.phase='flight';s.attempts++;}
for(const p of [s.p,s.q]){let dx=b.x-p.x,dy=b.y-p.y,d=len(dx,dy);if(d<b.r+p.r&&d>0){const nx=dx/d,ny=dy/d;b.x=p.x+nx*(b.r+p.r);b.y=p.y+ny*(b.r+p.r);const vn=b.vx*nx+b.vy*ny;if(vn<0){b.vx-=2*vn*nx;b.vy-=2*vn*ny;}b.vx+=p.vx*.85;b.vy+=p.vy*.85;s.contacts++;}}
for(let k=0;k<3;k++){b.x+=b.vx/3;b.y+=b.vy/3;if(b.y<25){if(Math.abs(b.x-L.goalX)<L.goalWidth/2){finish(s,true,'進球！');return;}b.y=25;b.vy=Math.abs(b.vy);}if(b.y>575){if(Math.abs(b.x-500)<110){finish(s,false,'己方失球。');return;}b.y=575;b.vy=-Math.abs(b.vy);}if(b.x<35){b.x=35;b.vx=Math.abs(b.vx);}if(b.x>965){b.x=965;b.vx=-Math.abs(b.vx);}for(const r of L.obstacles||[])rectHit(b,r);}b.vx*=.9985;b.vy*=.9985;if(len(b.vx,b.vy)<.08)b.vx=b.vy=0;}
function pong(s,u){const b=s.b;move(s.p,{my:u.my,target:u.target&&{x:70,y:u.target.y}},6.5,[70,70,35+s.p.r,565-s.p.r]);aiMove(s,930,b.y,[930,930,35+s.q.r,565-s.q.r]);if(s.phase==='ready'){b.y=s.p.y;if(u.action==='shoot'){const v=vec(clamp(s.controls.aim,-65,65),12+s.controls.power*.08);b.vx=Math.abs(v.x);b.vy=v.y;s.spin=s.controls.spin;s.phase='flight';}}
if(s.phase!=='flight')return;b.vy+=s.spin*.075;b.x+=b.vx;b.y+=b.vy;if(b.y<35||b.y>565){b.y=clamp(b.y,35,565);b.vy*=-1;s.spin*=-.8;}
if(b.vx<0&&b.x<85&&b.x>55&&Math.abs(b.y-s.p.y)<s.p.r+9){b.x=85;const v=vec(clamp(s.controls.aim+(b.y-s.p.y)*.25,-70,70),Math.min(24,Math.abs(b.vx)+2));b.vx=Math.abs(v.x);b.vy=v.y;s.spin=s.controls.spin;s.contacts++;}
if(b.vx>0&&b.x>915&&b.x<950&&Math.abs(b.y-s.q.y)<s.q.r+9){b.x=914;b.vx=-Math.min(24,Math.abs(b.vx)+.4);b.vy=clamp((300-s.p.y)*.02+(b.y-s.q.y)*.17,-11,11);s.spin=(s.tick%3-1)*.45;logAI(s,'return');}
if(b.x>995)finish(s,true,'落點成功拉開對手！');if(b.x<5)finish(s,false,'未能接回來球。');}
function badminton(s,u){const b=s.b,L=s.level;move(s.p,{mx:u.mx,target:u.target&&{x:u.target.x,y:500}},5,[55,460,500,500]);aiMove(s,clamp(b.x+(b.vy>0?0:b.vx*13),545,940),500,[540,945,500,500]);s.p.stamina=Math.min(100,s.p.stamina+.25);s.q.stamina=Math.min(100,s.q.stamina+.22);s.p.cooldown=Math.max(0,s.p.cooldown-1);s.q.cooldown=Math.max(0,s.q.cooldown-1);
function hit(p,type,dir){const cost=type==='smash'?32:type==='drop'?13:18;if(p.stamina<cost||p.cooldown||Math.abs(b.x-p.x)>95||b.y<265||b.y>505)return false;p.stamina-=cost;p.cooldown=22;const power=s.controls.power/100;b.vx=dir*(type==='smash'?11+power*4:type==='drop'?4.4+power*2:7+power*3);b.vy=type==='smash'?-3.8:type==='drop'?-8:-13.5;b.vx+=s.controls.spin*.5;s.lastHitter=dir===1?0:1;s.phase='flight';s.contacts++;return true;}
if(['shoot','lob','drop','smash'].includes(u.action))hit(s.p,u.action==='shoot'?'lob':u.action,1);
if(s.lastHitter===0&&s.phase==='flight'&&b.vy>0&&b.x>515){if(s.options.opponent==='human'){if(u.p2action)hit(s.q,u.p2action,-1);}else if(hit(s.q,b.y<355?'smash':(s.p.x>300?'lob':'drop'),-1))logAI(s,'racket');}
if(s.phase!=='flight')return;const oldX=b.x;b.vx*=.994;b.vy+=.24;b.x+=b.vx;b.y+=b.vy;if((oldX-500)*(b.x-500)<0&&b.y>(L.netTop||300)){finish(s,s.lastHitter===1,'羽球碰網。');return;}if(b.y>520)finish(s,b.x>500,'羽球落地。');if(b.x<25||b.x>975)finish(s,s.lastHitter===1,'羽球出界。');}
function soccer(s,u){
 const b=s.b,L=s.level;let p=s.team[s.selected];
 if(u.action==='switch'){s.selected=(s.selected+1)%3;p=s.team[s.selected];}
 s.p=p;move(p,u,u.run?5.6:4.3,[50,900,55,545]);
 if(s.owner>=0){const o=s.team[s.owner];b.x=o.x+23;b.y=o.y;b.vx=b.vy=0;}
 if(u.action==='pass'&&s.owner>=0){
  const next=(s.owner+1)%3,q=s.team[next],a=deg(Math.atan2(q.y-b.y,q.x-b.x)),v=vec(a,12);
  b.vx=v.x;b.vy=v.y;s.owner=-1;s.passTo=next;s.selected=next;s.phase='flight';s.passStart=s.tick;
 }
 if(u.action==='shoot'&&s.owner>=0){
  const v=vec(s.controls.aim,10+s.controls.power*.15);
  b.vx=v.x;b.vy=v.y;s.owner=-1;s.passTo=-1;s.phase='flight';s.attempts++;s.shotTick=s.tick;
 }
 for(let i=0;i<3;i++){
  const q=s.defenders[i];let tx,ty;
  if(i===2){tx=925;ty=clamp(b.y,L.goalY-L.goalWidth/2,L.goalY+L.goalWidth/2);}
  else{tx=b.x>480?b.x:640+i*35;ty=b.x>480?b.y:(i===0?125:480);}
  if(s.options.opponent==='human'&&i===2)move(q,{mx:u.p2x,my:u.p2y},s.aiSpeed,[880,940,60,540]);
  else toward(q,tx,ty,s.aiSpeed*(i===2?1:.75),[510,945,55,545]);
 }
 if(s.owner<0){
  b.x+=b.vx;b.y+=b.vy;b.vx*=.994;b.vy*=.994;
  if(b.x>965){finish(s,Math.abs(b.y-L.goalY)<L.goalWidth/2&&s.passes>=(L.minPasses||0),'射門完成。');return;}
  if(b.x<30||b.y<35||b.y>565){finish(s,false,'足球出界。');return;}
  if(s.passTo>=0&&s.tick>s.passStart+2&&dist(b,s.team[s.passTo])<30){
   s.owner=s.passTo;s.selected=s.owner;s.passes++;s.passTo=-1;s.phase='ready';s.message='傳球成功，可以跑位或射門。';
  }else if(s.passTo<0&&s.tick>(s.shotTick||0)+8){
   for(let i=0;i<3;i++)if(dist(b,s.team[i])<23){s.owner=i;s.selected=i;s.phase='ready';}
  }
 }
 // Possession does not make the ball immune: a defender may tackle a dribble or intercept a pass.
 for(const q of s.defenders)if(dist(q,b)<q.r+b.r-4){s.owner=-1;finish(s,false,'防守成功攔截。');return;}
}
function basketball(s,u){const b=s.b,L=s.level;move(s.p,u,4.8,[65,780,70,530]);if(s.q.stun>0)s.q.stun--;else aiMove(s,s.p.x+40,s.p.y,[130,850,60,540]);if(u.action==='fake'&&s.phase==='ready'&&s.p.stamina>=18){s.fakes++;s.p.stamina-=18;if(dist(s.p,s.q)<180)s.q.stun=70;s.message='防守短暫停步，找空間出手。';}s.p.stamina=Math.min(100,s.p.stamina+.12);
if(s.phase==='ready'){b.x=s.p.x;b.y=s.p.y;b.z=40;if(u.action==='shoot'){if(dist(s.p,s.q)<65&&!s.q.stun){finish(s,false,'投籃被封阻。');return;}const v=vec(s.controls.aim,3+s.controls.power*.11);b.vx=v.x;b.vy=v.y;b.vz=11;s.phase='flight';s.attempts++;}}
if(s.phase!=='flight')return;const prev=b.z;b.x+=b.vx;b.y+=b.vy;b.z+=b.vz;b.vz-=.32;if(prev>=70&&b.z<70&&b.vz<0&&dist(b,s.target)<(L.rim||24)){s.score=dist(s.p,s.target)>340?3:2;finish(s,true,'空心入網！得 '+s.score+' 分。');}else if(b.z<0||b.x>995||b.y<10||b.y>590)finish(s,false,'球沒有落進籃圈。');}
function tennis(s,u){const b=s.b,L=s.level;move(s.p,u,5.5,[60,455,65,535]);aiMove(s,clamp(b.x+b.vx*6,560,935),clamp(b.y+b.vy*8,70,530),[550,940,65,535]);s.p.cooldown=Math.max(0,s.p.cooldown-1);s.q.cooldown=Math.max(0,s.q.cooldown-1);
function hit(p,dir,type){if(p.cooldown||dist(p,b)>75||b.z>150||b.z<0)return false;p.cooldown=22;const speed=9+s.controls.power*.065;const v=vec(clamp(s.controls.aim,-50,50),speed);b.vx=Math.abs(v.x)*dir;b.vy=dir===1?v.y:clamp((300-s.p.y)*.02,-6,6);b.vz=type==='lob'?9:6.8;b.z=Math.max(35,b.z);s.bounces=0;s.lastHitter=dir===1?0:1;s.phase='flight';s.contacts++;return true;}
if(u.action==='shoot'||u.action==='lob')hit(s.p,1,u.action);if(s.lastHitter===0&&s.phase==='flight'&&b.vx>0&&b.x>530&&s.bounces>0){if(s.options.opponent==='human'){if(u.p2action)hit(s.q,-1,u.p2action);}else if(hit(s.q,-1,'shoot'))logAI(s,'return');}
if(s.phase!=='flight')return;const old=b.x;b.x+=b.vx;b.y+=b.vy;b.z+=b.vz;b.vz-=.34;if((old-500)*(b.x-500)<0&&b.z<(L.netHeight||46)){finish(s,s.lastHitter===1,'網球碰網。');return;}if(b.z<=0){b.z=0;b.vz=Math.abs(b.vz)*.62;s.bounces++;if(s.bounces===1&&((s.lastHitter===0&&b.x<=500)||(s.lastHitter===1&&b.x>=500))){finish(s,s.lastHitter===1,'回球第一次落地未越過球網。');return;}if(b.y<55||b.y>545||b.x<45||b.x>955){finish(s,s.lastHitter===1,'網球落在界外。');return;}if(s.bounces>=2)finish(s,b.x>500,'第二次彈地，得分成立。');}if(b.x<-50||b.x>1050)finish(s,s.lastHitter===1,'球飛出底線。');}
function volleyball(s,u){const b=s.b,L=s.level;move(s.p,{mx:u.mx,target:u.target&&{x:u.target.x,y:500}},5.2,[70,455,500,500]);aiMove(s,clamp(b.x+b.vx*8,550,925),500,[545,935,500,500]);s.cooldown=Math.max(0,s.cooldown-1);
function touch(type){if(s.cooldown||Math.abs(b.x-s.p.x)>105||b.y<315||b.y>510)return;if((type==='receive'&&s.touches!==0)||(type==='set'&&s.touches!==1)||(type==='spike'&&s.touches!==2))return;s.touches++;s.contacts++;s.cooldown=18;s.phase='flight';s.lastHitter=0;if(type==='receive'){b.vx=1.15;b.vy=-10.5;}if(type==='set'){b.vx=1.4;b.vy=-11.5;}if(type==='spike'){b.vx=5+s.controls.power*.02;b.vy=-5.8;}}
if(u.action==='shoot')touch(['receive','set','spike'][s.touches]);else if(['receive','set','spike'].includes(u.action))touch(u.action);
if(s.phase!=='flight')return;const old=b.x;b.x+=b.vx;b.y+=b.vy;b.vy+=.23;if((old-500)*(b.x-500)<0&&b.y>(L.netTop||295)){finish(s,s.lastHitter===1,'排球碰網。');return;}if(s.lastHitter===0&&b.x>525&&b.vy>0&&b.y>365&&dist({x:b.x,y:500},s.q)<90){if(s.options.opponent!=='human'||u.p2action){b.vx=-8;b.vy=-12;s.lastHitter=1;s.touches=0;logAI(s,'receive');}}
if(b.y>525)finish(s,b.x>500&&s.touches===3,'排球落地。');if(b.x<35||b.x>965)finish(s,s.lastHitter===1,'排球出界。');}
function bowling(s,u){
 const b=s.b,L=s.level;
 if(readyShot(s,u,10+s.controls.power*.12)){s.curve=s.controls.spin;s.rollTick=s.tick;s.rollStart=s.pins.filter(p=>p.fallen).length;}
 if(s.phase!=='flight'&&s.phase!=='settle')return;
 if(s.phase==='flight'){
  b.vy+=s.curve*(L.oil||.019);b.x+=b.vx;b.y+=b.vy;b.vx*=.999;b.vy*=.999;
  if(b.y<120||b.y>480)b.gutter=true;
  if(!b.gutter)for(const p of s.pins)if(p.active&&circle(b,p,.94))s.contacts++;
  if(b.x>990||s.tick-s.rollTick>500){b.vx=b.vy=0;s.phase='settle';s.settleUntil=s.tick+75;}
 }
 for(const p of s.pins){if(!p.active)continue;p.x+=p.vx;p.y+=p.vy;p.vx*=.966;p.vy*=.966;if(dist(p,{x:p.homeX,y:p.homeY})>8)p.fallen=true;for(const q of s.pins)if(q!==p&&q.active)circle(p,q,.94);if(p.x>975||p.y<80||p.y>520){p.active=false;p.fallen=true;}}
 if(s.phase==='settle'&&s.tick>=s.settleUntil){
  b.x=110;b.y=L.start.y;b.gutter=false;s.rolls.push(s.pins.filter(p=>p.fallen).length-s.rollStart);
  for(const p of s.pins){if(p.fallen)p.active=false;p.vx=p.vy=0;}
  if(s.pins.every(p=>p.fallen)){s.score=s.pins.length;finish(s,true,'球瓶全部倒下！');}
  else if(s.attempts>=(L.bowlingRolls||2))finish(s,false,'仍有殘瓶，試試補中角度。');
  else s.phase='ready';
 }
}
function billiards(s,u){const b=s.b;if(readyShot(s,u,2+s.controls.power*.16)){s.follow=s.controls.spin;s.firstCollision=false;}
if(s.phase!=='flight')return;let all=[b,...s.objects];for(let sub=0;sub<3;sub++){for(const p of all){if(!p.active)continue;p.x+=p.vx/3;p.y+=p.vy/3;if(s.pockets.some(k=>dist(p,k)<25)){p.active=false;p.vx=p.vy=0;if(p===b){finish(s,false,'母球洗袋。');return;}s.score++;continue;}rail(p,35,965,35,565,.91);}for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++)if(circle(all[i],all[j],.98)){s.contacts++;if(i===0&&!s.firstCollision){s.firstCollision=true;b.vx+=s.follow*all[j].vx*.8;b.vy+=s.follow*all[j].vy*.8;}}}
for(const p of all){p.vx*=.986;p.vy*=.986;if(len(p.vx,p.vy)<.085)p.vx=p.vy=0;}if(s.objects.every(p=>!p.active)){finish(s,true,'清檯成功！');return;}if(all.every(p=>!p.active||len(p.vx,p.vy)===0)){s.phase='ready';if(s.attempts>=(s.level.maxShots||6))finish(s,false,'桿數用完。');}}
function curling(s,u){const b=s.b,L=s.level;if(readyShot(s,u,4+s.controls.power*.16))s.curve=s.controls.spin;
if(s.phase!=='flight')return;const all=[b,...s.stones];if(u.sweep)s.sweepTicks++;for(const p of all){p.x+=p.vx;p.y+=p.vy;const speed=len(p.vx,p.vy);if(p===b&&speed>.1){p.vy+=s.curve*.010*(speed/8);let loss=u.sweep?.022:(L.friction||.034);const n=Math.max(0,speed-loss);p.vx*=n/speed;p.vy*=n/speed;}else if(speed>0){const n=Math.max(0,speed-.034);p.vx*=n/speed;p.vy*=n/speed;}if(p.x<30||p.x>970||p.y<60||p.y>540){p.active=false;p.vx=p.vy=0;}}
for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++)if(circle(all[i],all[j],.87))s.contacts++;
if(all.every(p=>len(p.vx,p.vy)<.035)){s.phase='ready';const d=b.active?dist(b,s.target):9999;const other=Math.min(9999,...s.stones.filter(p=>p.active&&p.team===1).map(p=>dist(p,s.target)));s.score=Math.round(d);finish(s,d<other&&d<=(L.requiredDistance||50),'離圓心 '+Math.round(d)+'；對手最近 '+Math.round(other)+'。');}}
function archery(s,u){const b=s.b,L=s.level;if(readyShot(s,u,11+s.controls.power*.17))s.shotStart=s.tick;
if(s.phase!=='flight')return;const ox=b.x,oy=b.y;s.wind=L.wind+(L.gust||0)*Math.sin((s.tick+(L.phase||0))*.035);b.vx+=s.wind;b.vy+=.21;b.x+=b.vx;b.y+=b.vy;for(const r of L.obstacles||[])if(b.x>=r.x&&b.x<=r.x+r.w&&b.y>=r.y&&b.y<=r.y+r.h){s.message='箭被擋板擋住。';resetShot(s,b);return;}
if(ox<s.target.x&&b.x>=s.target.x){const y=oy+(b.y-oy)*(s.target.x-ox)/(b.x-ox);s.lastLanding={x:s.target.x,y};const d=Math.abs(y-s.target.y);s.score=Math.max(0,10-Math.floor(d/8));if(d<=(L.bull||14)){finish(s,true,'命中靶心！');return;}s.message='偏離靶心 '+Math.round(d)+'。';resetShot(s,b);return;}if(b.x<0||b.x>1010||b.y>585||b.y<-200)resetShot(s,b);}
function golf(s,u){const b=s.b,L=s.level;for(const g of s.gates){g.currentX=g.x+(g.axis==='x'?Math.sin((s.tick+g.phase)*g.rate)*g.amplitude:0);g.currentY=g.y+(g.axis!=='x'?Math.sin((s.tick+g.phase)*g.rate)*g.amplitude:0);}
if(readyShot(s,u,1+s.controls.power*.15))s.message='球滾動中。';if(s.phase!=='flight')return;
for(let sub=0;sub<3;sub++){b.x+=b.vx/3;b.y+=b.vy/3;rail(b,30,970,30,570,.85);for(const r of s.obstacles)rectHit(b,r);for(const g of s.gates)rectHit(b,{x:g.currentX,y:g.currentY,w:g.w,h:g.h});for(const r of L.water||[])if(b.x>r.x&&b.x<r.x+r.w&&b.y>r.y&&b.y<r.y+r.h){finish(s,false,'球落水。');return;}if(dist(b,s.target)<(L.holeRadius||18)&&len(b.vx,b.vy)<(L.captureSpeed||4.2)){b.x=s.target.x;b.y=s.target.y;b.vx=b.vy=0;finish(s,true,'入洞！ '+s.attempts+' 桿。');return;}}
for(const r of L.ramps||[])if(b.x>r.x&&b.x<r.x+r.w&&b.y>r.y&&b.y<r.y+r.h){b.vx+=r.ax;b.vy+=r.ay;}const sp=len(b.vx,b.vy),f=L.friction||.052;if(sp<=f)b.vx=b.vy=0;else{b.vx*=1-f/sp;b.vy*=1-f/sp;}if(!b.vx&&!b.vy){s.phase='ready';if(s.attempts>=(L.maxShots||4))finish(s,false,'超過標準桿數。');}}
function baseball(s,u){const b=s.b,L=s.level;s.swingCooldown=Math.max(0,s.swingCooldown-1);if(s.phase==='pitch'){if(s.options.opponent==='human'&&!s.pitched&&u.p2action)s.pitch={shoot:'fast',lob:'curve',drop:'change'}[u.p2action]||'fast';if(s.tick>=s.pitchDelay){if(!s.pitched){s.pitched=true;const pitch=s.pitch;s.pitch=pitch;b.vx=-(pitch==='curve'?8.7:pitch==='change'?7.3:11.8);logAI(s,'pitch-'+pitch);}b.x+=b.vx;b.y=325+(s.pitch==='curve'?Math.sin((850-b.x)/670*Math.PI)*(L.curve||65):0);}
if(u.action==='shoot'&&!s.swingCooldown){s.swingCooldown=25;s.attempts++;if(Math.abs(b.x-170)<(L.window||31)&&Math.abs(b.y-325)<45){s.phase='field';b.x=170;b.y=325;b.z=30;const v=vec(clamp(s.controls.aim,-38,38),8+s.controls.power*.11);b.vx=v.x;b.vy=v.y;b.vz=10+s.controls.loft*.055;s.runner=0;s.contacts++;s.message='安打！按住跑壘可以續跑。';}else s.message='揮空了，等球靠近。';}
if(b.x<115){s.strikes++;if(s.strikes>=3)finish(s,false,'三振出局。');else{b.x=850;s.pitched=false;s.pitchDelay=s.tick+65;s.message='好球 '+s.strikes+'。';}}}
else if(s.phase==='field'){b.x+=b.vx;b.y+=b.vy;b.z+=b.vz;b.vz-=.28;if(b.z<0){b.z=0;b.vz=Math.abs(b.vz)*.3;b.vx*=.965;b.vy*=.965;}if(b.x>985||b.y<35||b.y>565){b.x=clamp(b.x,35,985);b.y=clamp(b.y,35,565);b.vx*=.6;b.vy*=.6;}
if(u.run&&s.runTarget<4&&s.runner>=s.runTarget-.02)s.runTarget++;s.runner=Math.min(s.runTarget,s.runner+(L.runnerSpeed||.010));if(!s.fieldTargetsSet||s.tick%s.aiLatency===0){s.fielderTargets=s.fielders.map(()=>({x:b.x,y:b.y}));s.fieldTargetsSet=true;}for(let fi=0;fi<s.fielders.length;fi++){const q=s.fielders[fi],target=s.fielderTargets[fi];toward(q,target.x,target.y,s.fielderSpeed,[80,970,40,560]);if(b.z<35&&dist(q,b)<30&&!s.returnTimer){s.returnTimer=55+Math.round(dist(q,{x:170,y:325})/10);s.message='守備開始回傳！';}}if(s.returnTimer>0){s.returnTimer--;if(s.returnTimer===0){const safe=Math.abs(s.runner-Math.round(s.runner))<.04;s.score=safe?Math.round(s.runner):0;finish(s,safe&&s.score>=(L.requiredBases||1),safe?'安全上壘：'+s.score+' 壘。':'在壘間遭觸殺。');}}}}
function fencing(s,u){const L=s.level,p=s.p,q=s.q;for(const a of [p,q]){a.stamina=Math.min(100,a.stamina+.24);a.cooldown=Math.max(0,a.cooldown-1);a.stun=Math.max(0,a.stun-1);a.parry=Math.max(0,a.parry-1);a.feint=Math.max(0,(a.feint||0)-1);}if(!p.stun&&!p.attack)move(p,{mx:u.mx,target:u.target&&{x:u.target.x,y:430}},4.5,[70,q.x-48,430,430]);
function act(a,type){if(a.stun||a.cooldown)return false;if(type==='shoot'&&a.stamina>=25){a.attack=L.windup||14;a.cooldown=55;a.stamina-=25;return true;}if(type==='parry'&&a.stamina>=12){a.parry=18;a.cooldown=24;a.stamina-=12;return true;}if(type==='feint'&&a.stamina>=8){a.stamina-=8;a.cooldown=15;a.feint=9;return true;}return false;}
act(p,u.action);if(s.options.opponent==='human'){if(!q.stun&&!q.attack)move(q,{mx:u.p2x},4.5,[p.x+48,930,430,430]);act(q,u.p2action);}else if(!q.stun&&!q.attack){const d=q.x-p.x;if(!q.cooldown&&d<220&&(p.feint||(p.attack>0&&p.attack<13))){if(act(q,'parry'))logAI(s,'parry');}else if(!q.cooldown&&d<(L.aiReach||185)+15){if(act(q,'shoot'))logAI(s,'lunge');}else if(s.tick>20&&d>190)toward(q,p.x+175,430,s.aiSpeed,[p.x+48,930,430,430]);}
function resolve(a,other,isPlayer){if(a.attack>0){a.attack--;if(a.attack===0){const range=isPlayer?(L.reach||190):(L.aiReach||185);if(Math.abs(a.x-other.x)<=range){if(other.parry>0){a.stun=55;a.cooldown=65;if(!isPlayer)s.parries++;s.message='格擋成功！';}else finish(s,isPlayer&&s.parries>=(L.requiredParries||0),isPlayer?'突刺命中。':'被對手刺中。');}}}}
resolve(q,p,false);if(s.status==='playing')resolve(p,q,true);}
function frisbee(s,u){const b=s.b,L=s.level;if(readyShot(s,u,5+s.controls.power*.13)){b.z=20;b.vz=2+s.controls.loft*.095;s.curve=s.controls.spin;}
if(s.phase!=='flight')return;let a=Math.atan2(b.vy,b.vx)+s.curve*.007,sp=len(b.vx,b.vy)*.996;b.vx=Math.cos(a)*sp;b.vy=Math.sin(a)*sp;b.x+=b.vx;b.y+=b.vy;b.z+=b.vz;b.vz-=.18;for(const r of L.obstacles||[])if(b.x>r.x-b.r&&b.x<r.x+r.w+b.r&&b.y>r.y-b.r&&b.y<r.y+r.h+b.r&&b.z<r.height){s.message='飛盤撞上障礙。';resetShot(s,b);return;}
if(b.z<=0){s.lastLanding={x:b.x,y:b.y};if(dist(b,s.target)<(L.radius||30)){finish(s,true,'飛盤落進目標！');return;}s.message='落地偏差 '+Math.round(dist(b,s.target))+'。';resetShot(s,b);}else if(b.x<0||b.x>1000||b.y<20||b.y>580)resetShot(s,b);}
const handlers={hockey,pong,badminton,soccer,basketball,tennis,volleyball,bowling,billiards,curling,archery,golf,baseball,fencing,frisbee};
function step(s,raw={}){if(s.status!=='playing')return s;const u=input(raw);s.lastInput=u;for(const k of ['aim','power','spin','loft'])if(u[k]!==undefined)s.controls[k]=u[k];handlers[s.kind](s,u);if(s.tick%3===0&&s.phase!=='ready'){s.trail.push({x:s.b.x,y:s.b.y,z:s.b.z||0});if(s.trail.length>90)s.trail.shift();}s.tick++;if(s.tick>(s.level.maxTicks||2400))finish(s,false,'時間用完，重開再試。');return s;}
function replay(kind,L,witness=L.witness,options={}){const s=create(kind,L,options);let index=0,held={};const events=witness||[];const limit=L.maxTicks||2400;for(let t=0;t<=limit&&s.status==='playing';t++){let cmd={...held};while(index<events.length&&events[index].tick===t){const e=events[index++];if(e.hold)held={...e.hold};cmd={...held,...(e.input||{})};}step(s,cmd);}return s;}
function bowlingScore(rolls){let score=0,j=0;for(let frame=0;frame<10&&j<rolls.length;frame++){const a=rolls[j]||0;if(a===10){score+=10+(rolls[j+1]||0)+(rolls[j+2]||0);j++;}else{const b=rolls[j+1]||0;score+=a+b;if(a+b===10)score+=rolls[j+2]||0;j+=2;}}return score;}
function fingerprint(L){const o=clone(L);delete o.witness;delete o.id;delete o.title;delete o.description;delete o.defaultAim;delete o.proof;return JSON.stringify(o);}
return{VERSION,DT,create,step,replay,input,clone,rng,clamp,dist,rad,deg,vec,handlers,physics:{circle,rail,rectHit},bowlingScore,fingerprint};
});
