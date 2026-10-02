'use strict';
const {spawnSync}=require('node:child_process'),path=require('node:path');const result=spawnSync(process.execPath,[path.join(__dirname,'../management-common/audit.cjs'),'museum-curator'],{stdio:'inherit'});process.exitCode=result.status??1;
