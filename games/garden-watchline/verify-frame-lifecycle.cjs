// Controller regression: event timestamps and RAF timestamps must never mix.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const source=path.resolve(process.argv[2]||__dirname);
const E=require(source+'/engine.js'),levels=require(source+'/levels.js');
function boot(memory=new Map()){
  const nodes=new Map(),handlers={
  },windowHandlers={
  },intervals=[],queue=[];
  let clock=1000,draws=0,rendered=null,steps=[];
  function node(id){
    if(!nodes.has(id))nodes.set(id,{
      id,open:false,hidden:false,disabled:false,textContent:'',innerHTML:'',style:{
      },firstChild:{
        textContent:''
      },classList:{
        toggle(){
        }
      },attrs:{
      },handlers:{
      },setAttribute(k,v){
        this.attrs[k]=v;
      },addEventListener(k,f){
        this.handlers[k]=f;
      },showModal(){
        this.open=true;
      },close(){
        this.open=false;
      },focus(){
        document.activeElement=this;
      },querySelector(k){
        return node(id+':'+k);
      },click(){
        if(!this.disabled)this.onclick?.();
      }
    });
    return nodes.get(id);
  } const document={
    getElementById:node,hidden:false,addEventListener:(k,f)=>handlers[k]=f,activeElement:null
  };
  const ctx={
    Bloomward:{
      ...E,step:(s,l,dt)=>{
        steps.push(dt);
        return E.step(s,l,dt);
      }
    },BloomwardLevels:levels,GardenRender:{
      icon:()=>'',draw(c,s){
        draws++;
        rendered=JSON.parse(E.serialize(s));
      },cellFrom:(_,e)=>e.cell
    },document,localStorage:{
      getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)
    },performance:{
      now:()=>clock
    },Date,console,matchMedia:()=>({
      matches:false
    }),setInterval:f=>intervals.push(f),requestAnimationFrame:f=>queue.push(f)
  };
  ctx.window=ctx;
  ctx.addEventListener=(k,f)=>windowHandlers[k]=f;
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(source+'/app.js','utf8'),ctx,{
    filename:source+'/app.js'
  });
  const api={
    ctx,node,memory,document,handlers,windowHandlers,intervals,setClock(n){
      clock=n;
    },frame(timestamp){
      clock=Math.max(clock,timestamp+.1);
      const fn=queue.shift();
      if(!fn)throw Error('No pending requestAnimationFrame');
      fn(timestamp);
    },click(id){
      node(id).click();
    },place(type,row,col){
      node('seedTray').handlers.click({
        target:{
          closest:()=>({
            dataset:{
              plant:type
            }
          })
        }
      });
      node('canvas').handlers.pointerdown({
        button:0,preventDefault(){
        },cell:{
          row,col
        }
      });
    },snapshot:()=>ctx.GardenWatchline.snapshot(),ui:()=>ctx.GardenWatchline.ui(),pending:()=>queue.length,drawCount:()=>draws,rendered:()=>rendered,steps:()=>steps
  };
  return api;
} const results=[];
let assertions=0;
function check(v,message){
  assert.ok(v,message);
  assertions++;
}function equal(a,b,message){
  assert.deepEqual(JSON.parse(JSON.stringify(a)),JSON.parse(JSON.stringify(b)),message);
  assertions++;
}function test(name,fn){
  try{
    results.push({
      name,status:'pass',detail:fn()
    });
  }catch(e){
    results.push({
      name,status:'fail',error:e.stack
    });
  }
} function running(){
  const a=boot();
  a.click('start');
  a.click('sendWave');
  a.frame(1016);
  a.frame(1032);
  check(a.snapshot().t>0,'Running time advances');
  return a;
} function transition(a,flow,clock){
  if(flow==='map-close')a.click('menu');
  if(flow==='help-close')a.click('help');
  if(flow==='restart-cancel')a.click('restart');
  if(flow==='escape-cancel')a.click('menu');
  if(flow==='visibility-resume'){
    a.document.hidden=true;
    a.handlers.visibilitychange();
  }a.setClock(clock);
  if(flow==='map-close')a.click('closeMenu');
  if(flow==='help-close')a.click('closeHelp');
  if(flow==='restart-cancel')a.click('cancelRestart');
  if(flow==='escape-cancel'){
    a.node('menuDialog').handlers.cancel({
      preventDefault(){
      }
    });
    a.node('menuDialog').close();
  }if(flow==='visibility-resume'){
    a.document.hidden=false;
    a.handlers.visibilitychange();
    a.click('resume');
  }
} for(const flow of ['map-close','help-close','restart-cancel','escape-cancel','visibility-resume'])for(const skew of [0,.1,1,8,32])test(flow+' with event clock '+skew+'ms after frame timestamp',()=>{
  const a=running(),before=a.snapshot().t,drawBefore=a.drawCount();
  transition(a,flow,1064+skew);
  a.frame(1064);
  equal(a.snapshot().t,before,'First resumed frame establishes a baseline with no catch-up');
  equal(a.pending(),1,'Next RAF remains queued');
  equal(a.drawCount(),drawBefore+1,'First resumed frame is rendered');
  a.frame(1080);
  check(a.snapshot().t>before,'Second frame advances simulation');
  equal(a.pending(),1,'Exactly one next RAF');
  check(a.steps().every(dt=>dt>=0&&dt<=.12),'All normal-speed simulation deltas are bounded');
  return{
    time:a.snapshot().t,firstResumeDelta:a.steps().at(-2),nextDelta:a.steps().at(-1),draws:a.drawCount(),pending:a.pending()
  };
});
test('Map, help and restart dialogs suspend gameplay without catch-up',()=>{
  const a=running();
  for(const [open,close]of [['menu','closeMenu'],['help','closeHelp'],['restart','cancelRestart']]){
    a.click(open);
    const before=a.snapshot();
    a.frame(900000);
    equal(a.snapshot(),before,'Open dialog must not simulate');
    a.setClock(900016.1);
    a.click(close);
    a.frame(900016);
    equal(a.snapshot(),before,'Close must not catch up elapsed dialog time');
    a.frame(900032);
    check(a.snapshot().t>before.t,'Run resumes');
  }return{
    pending:a.pending()
  };
});
test('Paused placement and refund redraw after crossed-clock map close',()=>{
  const a=running();
  a.click('pause');
  const before=a.snapshot();
  a.place('pod',1,2);
  equal(a.snapshot().sun,before.sun-90,'Paused plant remains paid');
  equal(a.snapshot().t,before.t,'Paused plant does not simulate');
  a.click('menu');
  a.setClock(1064.1);
  a.click('closeMenu');
  a.frame(1064);
  check(a.ui().paused,'Map close preserves explicit pause');
  check(a.rendered().plants.some(p=>p.row===1&&p.col===2),'New paused plant is rendered');
  a.click('shovel');
  a.node('canvas').handlers.pointerdown({
    button:0,preventDefault(){
    },cell:{
      row:1,col:2
    }
  });
  equal(a.snapshot().sun,before.sun-18,'Shovel refunds exactly 80 percent');
  a.frame(1080);
  equal(a.rendered().plants.length,0,'Shoveled plant is removed from rendered state');
  equal(a.snapshot().t,before.t,'Paused actions have no income or time');
  a.click('resume');
  a.frame(1096);
  check(a.snapshot().t>before.t,'Resume advances');
  return{
    sun:a.snapshot().sun,pending:a.pending()
  };
});
test('Paid placements, occupied protection and rendering survive restart Cancel',()=>{
  const a=running();
  transition(a,'restart-cancel',1064.1);
  a.frame(1064);
  const sun=a.snapshot().sun;
  a.place('pod',1,2);
  a.place('pod',3,2);
  equal(a.snapshot().sun,sun-180,'Two placements have correct cost');
  const draws=a.drawCount();
  a.frame(1080);
  equal(a.rendered().plants.length,2,'Both paid placements draw');
  equal(a.drawCount(),draws+1,'RAF continues');
  a.place('pod',1,2);
  equal(a.snapshot().sun,sun-180,'Occupied retry costs nothing');
  equal(a.node('sun').textContent,sun-180,'Currency HUD is synchronized');
  return{
    plants:a.snapshot().plants.length,pending:a.pending()
  };
});
test('Continue restores gameplay state exactly and starts paused',()=>{
  const a=running();
  a.place('pod',1,2);
  a.click('pause');
  const expected=a.snapshot();
  expected.fx=[];
  const b=boot(a.memory);
  check(!b.node('continue').hidden,'Saved Continue is available');
  b.setClock(1100.1);
  b.click('continue');
  equal(b.snapshot(),expected,'Simulation save restores exactly except transient effects');
  check(b.ui().paused,'Restored running session is paused');
  b.frame(1100);
  equal(b.snapshot(),expected,'First restore draw has no time catch-up');
  check(b.rendered().plants.some(p=>p.row===1&&p.col===2),'Saved plant renders');
  b.click('resume');
  b.frame(1116);
  check(b.snapshot().t>expected.t,'Restored simulation resumes');
  return{
    restoredTime:expected.t,pending:b.pending()
  };
});
test('Visibility return remains paused until user resumes',()=>{
  const a=running();
  a.document.hidden=true;
  a.handlers.visibilitychange();
  const before=a.snapshot();
  a.frame(900000);
  equal(a.snapshot(),before,'Hidden tab cannot simulate');
  a.document.hidden=false;
  a.setClock(900016.1);
  a.handlers.visibilitychange();
  a.frame(900016);
  equal(a.snapshot(),before,'Visible return cannot auto-resume');
  check(a.ui().paused,'Pause state visible after return');
  a.click('resume');
  a.frame(900032);
  check(a.snapshot().t>before.t,'Explicit resume works');
  return{
    pending:a.pending()
  };
});
test('Repeated interruptions retain exactly one RAF and valid time',()=>{
  const a=running();
  let timestamp=1100;
  for(let i=0;
  i<300;
  i++){
    const before=a.snapshot().t;
    const flow=['map-close','help-close','restart-cancel','escape-cancel','visibility-resume'][i%5];
    transition(a,flow,timestamp+[.1,1,8,32][i%4]);
    a.frame(timestamp);
    equal(a.snapshot().t,before,'No catch-up on interruption '+i);
    timestamp+=16;
    a.frame(timestamp);
    check(a.snapshot().t>before,'Resumes after interruption '+i);
    equal(a.pending(),1,'No missing or duplicate RAF '+i);
    timestamp+=16;
  }return{
    cycles:300,time:a.snapshot().t,pending:a.pending()
  };
});
test('Frame cap and 2x speed remain valid',()=>{
  const a=running();
  a.click('speed');
  equal(a.ui().speed,2,'2x speed enabled');
  const t=a.snapshot().t;
  a.frame(2032);
  check(Math.abs(a.snapshot().t-t-.24)<1e-10,'Long frame capped at 0.12 seconds before 2x multiplier');
  a.click('menu');
  a.setClock(2048.1);
  a.click('closeMenu');
  a.frame(2048);
  equal(a.steps().at(-1),0,'2x reset remains zero');
  a.frame(2064);
  equal(a.steps().at(-1),.032,'2x normal frame doubles elapsed');
  return{
    pending:a.pending()
  };
});
test('Ready state has no passive income across menu transitions',()=>{
  const a=boot();
  a.click('start');
  const before=a.snapshot();
  a.frame(1016);
  a.click('menu');
  a.setClock(900016.1);
  a.click('closeMenu');
  a.frame(900016);
  a.frame(900032);
  equal(a.snapshot(),before,'Ready state unchanged by elapsed time');
  return{
    pending:a.pending()
  };
});
const report={
  source,scope:'Actual unmodified controller and engine in Node VM with DOM/storage/RAF shims and recorded draw state. Separate event/performance and RAF clocks exercise lifecycle races. Not actual-browser, visual-layout or real-frame-timing evidence.',assertions,passed:results.filter(x=>x.status==='pass').length,failed:results.filter(x=>x.status==='fail').length,results
};
console.log(JSON.stringify(report,null,2));
if(report.failed)process.exitCode=1;
