#!/usr/bin/env node
'use strict';
// Complete reproducible offline audit; Node.js 18+ and Python 3 only.
const {spawnSync}=require('node:child_process');
process.chdir(__dirname);
for(const file of ['verify-cards.cjs','verify-puzzles.cjs','verify-logic.cjs','verify-classics.cjs']){
 const result=spawnSync(process.execPath,[file],{stdio:'inherit',env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'}});
 if(result.error)throw result.error;if(result.status!==0)process.exit(result.status||1);
}
console.log('PASS: 47 games; 250 certified card deals; 1,500 verified puzzle levels, including 500 new classic puzzle challenges.');
