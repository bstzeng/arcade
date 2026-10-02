#!/usr/bin/env node
'use strict';
// Check local HTML/CSS references without fetching external resources.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=__dirname;
const files=[];
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){if(entry.name.startsWith('.')||['node_modules','__pycache__'].includes(entry.name))continue;const file=path.join(dir,entry.name);if(entry.isDirectory())walk(file);else if(/\.(html|css)$/.test(file))files.push(file);}}
walk(root);
let checked=0;
function check(file,reference){
 reference=reference.trim().replace(/&amp;/g,'&');
 if(!reference||/^(?:[a-z][\w+.-]*:|\/\/)/i.test(reference))return;
 if(reference.startsWith('#')){
  const fragment=decodeURIComponent(reference.slice(1));
  if(fragment){const html=fs.readFileSync(file,'utf8');assert([...html.matchAll(/\b(?:id|name)=["']([^"']+)["']/g)].some(m=>m[1]===fragment),'Missing fragment: '+path.relative(root,file)+' → '+reference);checked++;}
  return;
 }
 const target=reference.split(/[?#]/)[0];if(!target)return;
 const resolved=path.resolve(reference.startsWith('/')?root:path.dirname(file),target.replace(/^\//,''));
 assert(resolved===root||resolved.startsWith(root+path.sep),'Reference escapes site: '+path.relative(root,file)+' → '+reference);
 assert(fs.existsSync(resolved),'Missing local reference: '+path.relative(root,file)+' → '+reference);
 if(fs.statSync(resolved).isDirectory())assert(fs.existsSync(path.join(resolved,'index.html')),'Directory has no entry: '+reference);
 checked++;
}
for(const file of files){const source=fs.readFileSync(file,'utf8');
 if(file.endsWith('.html'))for(const match of source.matchAll(/\b(?:src|href)\s*=\s*["']([^"']*)["']/gi))check(file,match[1]);
 const css=file.endsWith('.css')?source:[...source.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map(m=>m[1]).join('\n');
 for(const match of css.matchAll(/url\(\s*["']?([^\s"')]+)["']?\s*\)/gi))check(file,match[1]);
}
console.log(`PASS: ${checked} local HTML/CSS references across ${files.length} files; no missing assets or navigation targets.`);
module.exports={files:files.length,references:checked};
