'use strict';
// Adapted from the preserved published lobby harness. This is a synthetic DOM, not browser evidence.
const vm=require('node:vm');
module.exports=function createHarness({source,index}){
const decode=s=>s.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>');
class Element{
 constructor(tag='div',document){this.tagName=tag.toLowerCase();this.ownerDocument=document;this.children=[];this.attributes={};this.events={};this._text='';this.value='';this.hidden=false;this.style={setProperty:(key,value)=>this.style[key]=value};this.dataset=new Proxy({}, {set:(target,key,value)=>{target[key]=String(value);this.attributes['data-'+key.replace(/[A-Z]/g,m=>'-'+m.toLowerCase())]=String(value);return true;}});this.classList={contains:c=>this.className.split(/\s+/).includes(c),add:(...cs)=>this.className=[...new Set([...this.className.split(/\s+/).filter(Boolean),...cs])].join(' '),remove:(...cs)=>this.className=this.className.split(/\s+/).filter(c=>!cs.includes(c)).join(' '),toggle:(c,force)=>{const add=force===undefined?!this.classList.contains(c):force;this.classList[add?'add':'remove'](c);return add;}};}
 get className(){return this.attributes.class||'';}set className(v){this.attributes.class=String(v);}
 get id(){return this.attributes.id||'';}set id(v){this.attributes.id=String(v);}
 get textContent(){return this._text+this.children.map(c=>c.textContent).join('');}set textContent(v){this._text=String(v);this.children=[];}
 set innerHTML(v){this._html=String(v);this.children=[];}get innerHTML(){return this._html||'';}
 append(...nodes){for(const n of nodes){if(typeof n==='string')this._text+=n;else{n.parentElement=this;this.children.push(n);}}}
 replaceChildren(...nodes){this.children=[];this._text='';this.append(...nodes);}
 setAttribute(key,value){this.attributes[key]=String(value);if(key==='hidden')this.hidden=true;if(key==='value')this.value=String(value);if(key.startsWith('data-'))this.dataset[key.slice(5).replace(/-([a-z])/g,(_,l)=>l.toUpperCase())]=value;}
 getAttribute(key){return this.attributes[key]??null;}removeAttribute(key){delete this.attributes[key];if(key==='hidden')this.hidden=false;}
 addEventListener(event,fn){(this.events[event]??=[]).push(fn);}
 emit(event,props={}){const e={target:this,currentTarget:this,preventDefault(){this.defaultPrevented=true;},...props};for(const fn of this.events[event]||[])fn(e);return e;}
 focus(){this.ownerDocument.activeElement=this;this.focused=true;}scrollIntoView(options){this.scrollOptions=options;}
 matches(selector){return selector.split(',').some(part=>{part=part.trim();const attrMatches=[...part.matchAll(/\[([^\]=]+)(?:=["']?([^\]"']*)["']?)?\]/g)];for(const [,k,v]of attrMatches)if(this.getAttribute(k)===null||(v!==undefined&&this.getAttribute(k)!==v))return false;part=part.replace(/\[[^\]]+\]/g,'');const id=part.match(/#([\w-]+)/);if(id&&this.id!==id[1])return false;for(const [,c]of part.matchAll(/\.([\w-]+)/g))if(!this.classList.contains(c))return false;const tag=part.match(/^[\w-]+/);return !tag||this.tagName===tag[0].toLowerCase();});}
 querySelectorAll(selector){return this.children.flatMap(child=>[...(child.matches(selector)?[child]:[]),...child.querySelectorAll(selector)]);}querySelector(selector){return this.querySelectorAll(selector)[0]||null;}
}
function boot(url='https://example.test/arcade/'){
 const document={activeElement:null,events:{},addEventListener(event,fn){(this.events[event]??=[]).push(fn);},createElement:tag=>new Element(tag,document)};
 const root=new Element('document',document);document.querySelector=s=>root.querySelector(s);document.querySelectorAll=s=>root.querySelectorAll(s);document.getElementById=id=>document.querySelector('#'+id);
 const stack=[root],voidTags=new Set(['meta','link','input','br','hr','img','source','wbr']);
 for(const token of index.matchAll(/<!--[\s\S]*?-->|<[^>]+>|[^<]+/g)){
  const text=token[0];if(text.startsWith('<!--')||text.startsWith('<!'))continue;
  if(text.startsWith('</')){const tag=text.match(/^<\/([\w-]+)/)?.[1];if(stack.at(-1).tagName===tag)stack.pop();continue;}
  if(text.startsWith('<')){const tag=text.match(/^<([\w-]+)/)?.[1];if(!tag)continue;const n=new Element(tag,document);for(const m of text.slice(tag.length+1,-1).matchAll(/([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g))n.setAttribute(m[1],decode(m[2]??m[3]??m[4]??''));stack.at(-1).append(n);if(!voidTags.has(tag)&&!text.endsWith('/>'))stack.push(n);}else stack.at(-1)._text+=decode(text);
 }
 document.body=document.querySelector('body');document.documentElement=document.querySelector('html');
 const location={href:url,search:new URL(url).search,pathname:new URL(url).pathname,hash:new URL(url).hash};
 const setURL=value=>{const next=new URL(value,location.href);Object.assign(location,{href:next.href,search:next.search,pathname:next.pathname,hash:next.hash});};
 const history={calls:[],pushState(state,title,next){this.calls.push({type:'push',next});setURL(next);},replaceState(state,title,next){this.calls.push({type:'replace',next});setURL(next);}};
 const window={document,location,history,events:{},addEventListener(event,fn){(this.events[event]??=[]).push(fn);},scrollTo(){},matchMedia:()=>({matches:false})};
 const context={document,window,location,history,URL,URLSearchParams,console,setTimeout:fn=>{fn();return 1;},clearTimeout(){},requestAnimationFrame:fn=>fn()};
 vm.runInNewContext(source,context);
 return{document,root,window,location,history,pop(next){setURL(next);for(const fn of window.events.popstate||[])fn({});},node:s=>document.querySelector(s),cards:()=>document.querySelector('#game-grid').querySelectorAll('.card'),groups:()=>document.querySelector('#game-grid').querySelectorAll('.game-group')};
}

return {boot};
};
