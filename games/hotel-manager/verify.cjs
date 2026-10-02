'use strict';
const {spawnSync}=require('node:child_process'),path=require('node:path');const result=spawnSync(process.execPath,[path.join(__dirname,'../management-common/audit.cjs'),'hotel-manager'],{stdio:'inherit'});process.exitCode=result.status??1;
