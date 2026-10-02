'use strict';
importScripts('./engine.js');
self.onmessage=event=>{const {token,level,state}=event.data;try{self.postMessage({token,...IceCore.search(IceCore.board(level),state)});}catch(error){self.postMessage({token,status:'error',message:String(error)});}};
