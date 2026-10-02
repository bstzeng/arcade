'use strict';
const fs=require('node:fs');
const json=fs.readFileSync(__dirname+'/deals.json','utf8').trim();
JSON.parse(json);
fs.writeFileSync(__dirname+'/deals.js','/* Deterministic shuffled deals and complete legal witnesses; see verify.py. */\nwindow.FREECELL_DEALS='+json+';\n');
console.log('Updated browser data from deals.json');
