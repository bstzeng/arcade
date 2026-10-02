importScripts('engine.js');
onmessage=function(event){try{postMessage({id:event.data.id,...CheckersEngine.chooseMove(event.data.state,event.data.difficulty)})}catch(e){postMessage({id:event.data.id,error:true})}};
