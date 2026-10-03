/* Offline witness search only. Never loaded by the opponent AI or browser controller. */
const E=require('./engine.js');
function policy(s,variant=0){const[p,q]=s.players,d=E.distance(p,q),n=E.nav(s,p,q),clear=E.clearLine(s,p,q);const u={x:0,y:0,a:false,b:false,c:false,d:false};let desired=[58,51,124,108,55,56,56,54,90,145,52,55,57,54,57][s.kind];if(s.kind===3)desired=92;if(s.kind===1&&p.stats.salvage<(s.level.goal||1)&&s.parts.length){const part=s.parts.find(t=>t.owner!==p.id);if(part){const to=E.nav(s,p,part);u.x=to.x;u.y=to.y;u.c=true;return u;}}
if(d>desired+5||!clear){u.x=n.x;u.y=n.y;}else if(d<desired-10&&s.kind!==7&&s.kind!==8){u.x=-n.x;u.y=-n.y;}
if(variant===1&&s.tick<18)return{d:true};
if(p.stats.blocks<(s.level.defenseGoal||0)){if(d>68||!clear){u.x=n.x;u.y=n.y;}else{u.x=0;u.y=0;}u.d=true;return u;}
switch(s.kind){
case 0:u.b=p.polarity!==-1&&!p.prev.b;u.c=d<310&&(d>85||q.magnetTicks<25);u.a=d<105;break;
case 1:u.b=p.stats.salvage<(s.level.goal||1)&&q.modules.length>0&&d<83;u.c=true;u.a=!u.b&&d<140;break;
case 2:u.b=true;u.c=d<195;break;
case 3:u.a=true;u.b=p.length>Math.max(52,Math.min(160,d))+2;u.c=p.length<Math.max(52,Math.min(160,d))-2;break;
case 4:u.a=d<145;u.b=p.cool>0&&!p.attack&&!p.toolCool&&!p.prev.b;break;
case 5:u.b=p.blades<3;u.a=d<105;break;
case 6:u.b=!p.burst&&p.breath<80;u.c=d<100&&p.breath>=60;u.a=false;break;
case 7:if(p.air<=0&&(!p.attached||p.gravity===0)){const target={x:p.x<480?18:942,y:p.y};u.x=p.x<480?-1:1;u.y=0;u.b=E.distance(p,target)<98;}else {u.c=p.attached&&p.gravity!==0;u.a=!p.attached&&p.gravity!==0&&d<110;}break;
case 8:u.b=s.pole<.72;u.c=s.pole<.8;u.a=s.pole>.55&&d<207;break;
case 9:u.b=p.wraps<2&&d<187;u.c=p.wraps>=2&&d<217;u.a=false;break;
case 10:u.c=d<210;u.a=d<107;u.b=(p.weightFlips<2||p.balance>58)&&!p.prev.b;break;
case 11:u.b=p.stats.echoHit<(s.level.goal||1)&&s.tick%160>=74&&s.tick%160<112&&d<99;u.a=!u.b&&d<102;break;
case 12:u.a=d<115&&s.tick%61<19;u.b=d<115&&s.tick%87<40;break;
case 13:u.a=d<106;u.b=q.aura===p.element&&!p.prev.b&&p.cool>0&&!p.attack;break;
case 14:u.a=E.height(s,p)<=E.height(s,q)&&d<119;u.b=!u.a&&d<118;break;
}
return u;}
function solve(id,L,variant=0){const s=E.create(id,L),trace=[];let last='';while(s.status==='playing'){const u=E.pack(policy(s,variant)),json=JSON.stringify(u);if(json===last&&trace[trace.length-1][0]<600)trace[trace.length-1][0]++;else{trace.push([1,u]);last=json;}E.step(s,u);}return{state:s,witness:trace};}
module.exports={policy,solve};
