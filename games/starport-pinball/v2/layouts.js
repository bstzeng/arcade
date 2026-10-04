(function(root,factory){
 'use strict';
 const modules=typeof module==='object'?{G:require('./geometry.js'),B:require('./layouts/transfer-geometry.js'),M:require('./math.js'),T:require('./table.js'),D:require('./depth.js'),P:require('./missions.js'),E:require('./engine.js'),R:require('./render.js'),L:require('./levels.js'),V:require('./status.js')}:{G:root.PinballGeometry,B:root.PinballTransferGeometry,M:root.PinballMath,T:root.PinballTable,D:root.PinballDepth,P:root.PinballMissions,E:root.PinballEngine,R:root.PinballRender,L:root.PinballLevels,V:root.PinballStatus};
 const api=factory(modules);if(typeof module==='object')module.exports=api;else{root.PinballLayouts=api;root.PinballEngine=api.engine;root.PinballRender=api.renderer;}
})(globalThis,function(A){
 'use strict';
 const bundleA={id:'dock-a',geometry:A.G,table:A.T,depth:A.D,missions:A.P,engine:A.E,renderer:A.R};
 const tableB=A.T.withGeometry(A.B),depthB=A.D.withGeometry(A.B,tableB),missionsB=A.P.withGeometry(A.B,A.L),engineB=A.E.withGeometry(A.B,A.M,tableB,A.L,missionsB),rendererB=A.R.withGeometry(A.B,depthB,A.V);
 const bundleB={id:'transfer-b',geometry:A.B,table:tableB,depth:depthB,missions:missionsB,engine:engineB,renderer:rendererB};
 function deepFreeze(value,seen=new Set()){if(!value||typeof value!=='object'||seen.has(value))return value;seen.add(value);for(const child of Object.values(value))deepFreeze(child,seen);return Object.freeze(value);}
 const bundles=deepFreeze({'dock-a':bundleA,'transfer-b':bundleB}),owners=new WeakMap();
 const invalid=()=>{throw Error('無效或不相容的球台存檔');};
 function stageLayout(stage){if(stage===undefined||stage===null)return null;const level=A.L.get(stage);if(!level)invalid();const id=level.layoutID||(level.id<=10?'dock-a':level.id<=20?'transfer-b':null);if(!id)invalid();return id;}
 function get(id){if(typeof id!=='string'||!Object.hasOwn(bundles,id))invalid();return bundles[id];}
 function attach(state,b){state.layoutID=b.id;owners.set(state,b);return state;}
 function bound(state){const b=owners.get(state);if(!b||state.layoutID!==b.id)invalid();if(stageLayout(state.campaign?.id)!==null&&stageLayout(state.campaign.id)!==b.id)invalid();return b;}
 function forSnapshot(state={}){if(!state||typeof state!=='object')invalid();if(owners.has(state))return bound(state);const id=Object.hasOwn(state,'layoutID')?state.layoutID:(state.campaign?.id>10?null:'dock-a'),b=get(id),expected=stageLayout(state.campaign?.id);if(expected&&expected!==id)invalid();return b;}
 function create(options={}){const expected=stageLayout(options.stage),id=Object.hasOwn(options,'layoutID')?options.layoutID:expected||'dock-a';if(expected&&expected!==id)invalid();const b=get(id);return attach(b.engine.create(options),b);}
 function action(s,a){return bound(s).engine.action(s,a);}function step(s,seconds){return bound(s).engine.step(s,seconds);}function snapshot(s){return bound(s).engine.snapshot(s);}
 function serialize(s){const b=bound(s),payload=JSON.parse(b.engine.serialize(s));payload.layoutID=b.id;payload.geometryRevision=b.geometry.revision;return JSON.stringify(payload);}
 function restore(raw){const p=JSON.parse(raw),s=p?.state;if(!s||typeof s!=='object')invalid();const expected=stageLayout(s.campaign?.id),envelopeID=p.layoutID,stateID=s.layoutID;let id;
  if(envelopeID===undefined&&stateID===undefined){if(expected&&expected!=='dock-a')invalid();if(s.campaign?.id>10)invalid();id='dock-a';}
  else{if(typeof envelopeID!=='string'||typeof stateID!=='string'||envelopeID!==stateID)invalid();id=envelopeID;}
  const b=get(id),marked=envelopeID!==undefined||stateID!==undefined;if(expected&&id!==expected)invalid();if(marked&&p.geometryRevision!==b.geometry.revision)invalid();if(p.geometryRevision!==undefined&&p.geometryRevision!==b.geometry.revision)invalid();const restored=b.engine.restore(raw);if(b.geometry.orbit.sensors?.recordPasses)for(const ball of restored.balls){const o=ball.orbit;if(!o)continue;const entry=restored.events.find(e=>e.seq===o.entrySeq),mid=restored.events.find(e=>e.seq===o.midSeq);if(!Number.isSafeInteger(o.entrySeq)||!entry||entry.id!=='orbitEnter'||entry.ball!==ball.id||entry.direction!==o.direction||(o.mid?(!Number.isSafeInteger(o.midSeq)||!mid||mid.id!=='orbitMid'||mid.ball!==ball.id||mid.direction!==o.direction||mid.entrySeq!==o.entrySeq||mid.seq<=entry.seq):o.midSeq!==null))invalid();}return attach(restored,b);
 }
 const engine=Object.freeze({DT:A.E.DT,GRAVITY:A.E.GRAVITY,SLOPE:A.E.SLOPE,MAX_SPEED:A.E.MAX_SPEED,create,action,step,snapshot,serialize,restore,physics:Object.freeze({...A.E.physics,collision:(s,...args)=>bound(s).engine.physics.collision(s,...args)}),model:'State-bound table bundles; TableB core remains in development.'});
 const renderer=Object.freeze({draw:(canvas,s,options)=>forSnapshot(s).renderer.draw(canvas,s,options),project:A.R.project});
 return Object.freeze({engine,renderer,get,forSnapshot,ids:Object.freeze(Object.keys(bundles))});
});
