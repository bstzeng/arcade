#!/usr/bin/env node
'use strict';
// Later presentation-only releases keep the original complete proof artifact
// immutable and run their explicitly scoped correction/preservation gate.
const fs=require('node:fs');
if(fs.existsSync(__dirname+'/expansion120-presentation-correction.json'))require('./verify-expansion120-presentation.cjs');
else require('./verify-expansion120-all.cjs');
