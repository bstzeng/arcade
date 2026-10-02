'use strict';
importScripts('engine.js');
onmessage=function(event){const {state,level,seed}=event.data;try{postMessage({action:Quarto.ai(state,level,seed)});}catch(error){postMessage({error:String(error)});}};
