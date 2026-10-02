/* Deterministic 60 Hz arcade primitives. No clock, DOM, storage, network or hidden state. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ActionBase=api})(globalThis,function(){
'use strict';
const W=480,H=600, clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), copy=v=>JSON.parse(JSON.stringify(v));
function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}}
function integer(r,a,b){return a+Math.floor(r()*(b-a+1))}
function dist2(a,b){return(a.x-b.x)**2+(a.y-b.y)**2}
function segmentDistance(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,t=clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1),0,1);return Math.hypot(p.x-a.x-dx*t,p.y-a.y-dy*t)}
function finite(v){if(typeof v==='number')return Number.isFinite(v);if(v===null||typeof v==='string'||typeof v==='boolean')return true;if(Array.isArray(v))return v.length<10000&&v.every(finite);return v&&typeof v==='object'&&Object.keys(v).length<200&&Object.entries(v).every(([k,x])=>!['__proto__','prototype','constructor'].includes(k)&&finite(x))}
function input(i){return i&&typeof i==='object'&&!Array.isArray(i)&&finite(i)&&Object.keys(i).every(k=>['x','y','left','right','up','down','fire','jump','slide','reel','cast','hook','dir','lanes','hit','stroke','aim','launch','shield','rebase'].includes(k))}
function baseState(extra){return Object.assign({tick:0,status:'playing',score:0,events:[]},extra)}
function event(s,type,data={}){s.events.push(Object.assign({tick:s.tick,type},data))}
function frame(ctx){ctx.clearRect(0,0,W,H);ctx.fillStyle='#081626';ctx.fillRect(0,0,W,H);ctx.font='18px system-ui';ctx.textAlign='center';ctx.lineCap='round'}
function text(ctx,t,x,y,color='#e7f3ff',size=18){ctx.fillStyle=color;ctx.font=size+'px system-ui';ctx.fillText(t,x,y)}
function circle(ctx,x,y,r,color){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=color;ctx.fill()}
function rect(ctx,x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(x,y,w,h)}
function line(ctx,a,b,color,width=4){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}
function shape(template,value){if(template===null)return true;if(Array.isArray(template))return Array.isArray(value)&&(!template.length||value.every(v=>shape(template[0],v)));if(typeof template==='object')return !!value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(template).every(k=>Object.prototype.hasOwnProperty.call(value,k)&&shape(template[k],value[k]));return typeof template===typeof value}
function define(id,config){const schemas=new WeakMap();config.id=id;config.rulesRevision='action-1';config.contentRevision='action-1';config.fixedHz=60;config.validateState=(l,s)=>{try{let template=schemas.get(l);if(!template){template=config.createState(l);schemas.set(l,template)}return !!s&&finite(s)&&shape(template,s)&&Number.isInteger(s.tick)&&s.tick>=0&&s.tick<=l.maxTicks&&['playing','won','lost'].includes(s.status)&&Array.isArray(s.events)&&(!config.valid||config.valid(l,s))}catch(_){return false}};config.applyAction=(l,s,a)=>{if(!input(a))throw Error('Invalid action');let n=copy(s);if(n.status==='playing'){config.step(l,n,a);if(n.tick>=l.maxTicks&&n.status==='playing')n.status='lost'}return n};config.inspect=(l,s)=>({status:s.status,goalMet:s.status==='won',violations:[]});return config}
return{W,H,clamp,copy,rng,integer,dist2,segmentDistance,finite,input,baseState,event,frame,text,circle,rect,line,define};
});
