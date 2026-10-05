#!/usr/bin/env node
'use strict';
// Presentation releases preserve the original proof artifacts and run their scoped correction gate.
const fs = require('node:fs');
if (fs.existsSync(__dirname + '/garden-aquarium-release.json')) require('./verify-garden-aquarium.cjs');
else if (fs.existsSync(__dirname + '/classic-duo-release.json')) require('./verify-classic-duo.cjs');
else if (fs.existsSync(__dirname + '/frontier120-presentation-correction.json')) require('./verify-frontier120-presentation.cjs');
else require('./verify-frontier120-all.cjs');
