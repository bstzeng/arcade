'use strict';
importScripts('engine.js');
onmessage=e=>{try{postMessage(PegEngine.solve(e.data.level,e.data.state,60000));}catch(err){postMessage({solution:null,limited:true,error:String(err)});}};
