(function(root,f){if(typeof module==='object'&&module.exports)module.exports=f();else root.NumericUtil=f();})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const copy=x=>JSON.parse(JSON.stringify(x)),eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b),int=Number.isSafeInteger;
function gcd(a,b){a=Math.abs(a);b=Math.abs(b);while(b){let t=a%b;a=b;b=t;}return a||1;}
function rat(n,d=1){if(!int(n)||!int(d)||d===0)throw Error('分數超出範圍');if(d<0){n=-n;d=-d;}const g=gcd(n,d);return[n/g,d/g];}
function calc(a,b,op){if(op==='+')return rat(a[0]*b[1]+b[0]*a[1],a[1]*b[1]);if(op==='-')return rat(a[0]*b[1]-b[0]*a[1],a[1]*b[1]);if(op==='*')return rat(a[0]*b[0],a[1]*b[1]);if(op==='/')return rat(a[0]*b[1],a[1]*b[0]);throw Error('未知運算');}
const fmt=a=>a[1]===1?String(a[0]):a[0]+'/'+a[1],sum=a=>a.reduce((s,x)=>calc(s,x,'+'),[0,1]);
function wrap(spec){spec.initial=spec.createState;spec.apply=spec.applyAction;spec.isSolved=(l,s)=>spec.inspect(l,s).goalMet;return spec;}
return{copy,eq,int,gcd,rat,calc,fmt,sum,wrap};});
