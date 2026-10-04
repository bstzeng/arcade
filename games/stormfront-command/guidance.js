/* Presentation-only advice from the current public observation. Never issues orders. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.StormfrontGuidance=api;})(globalThis,function(){
'use strict';
const combatTypes=['rifle','lancer','tank','siege','flyer'],productionTypes=['factory','barracks','airfield'];
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const centre=e=>({x:e.x+((e.size||1)-1)/2,y:e.y+((e.size||1)-1)/2});
const cellVisible=(v,p)=>Number.isInteger(p.x)&&Number.isInteger(p.y)&&p.x>=0&&p.y>=0&&p.x<v.width&&p.y<v.height&&!!v.visible?.[p.y*v.width+p.x];
const entityVisible=(v,e)=>{for(let y=e.y;y<e.y+(e.size||1);y++)for(let x=e.x;x<e.x+(e.size||1);x++)if(cellVisible(v,{x,y}))return true;return false;};
const armedEnemies=v=>v.entities.filter(e=>e.owner>0&&e.hp>0&&['rifle','lancer','tank','siege','flyer','scout','turret'].includes(e.type)&&entityVisible(v,e));
/* Distances describe known proximity only. Fog memory is never proof of a safe route. */
function logistics(v){
 const own=v.entities.filter(e=>e.owner===0&&e.hp>0),refineries=own.filter(e=>e.kind==='building'&&e.type==='refinery'&&e.complete),centres=refineries.map(centre),patches=new Map();
 for(const ore of v.ore||[]){const key=ore.x+','+ore.y;if(!patches.has(key))patches.set(key,{x:ore.x,y:ore.y,amount:Math.max(0,ore.amount),stale:!!ore.stale||!cellVisible(v,ore)});}
 const known=[...patches.values()],nearby=known.filter(ore=>centres.some(ref=>distance(ref,ore)<=13)),nearbyOre=nearby.reduce((n,ore)=>n+ore.amount,0),nearbyOreStale=nearby.some(ore=>ore.stale),nearbyOreConfidence=!nearby.length?'unknown':nearbyOreStale?'last-known':'current';
 const anchors=[...centres,...own.filter(e=>e.kind==='building'&&e.type==='core'&&e.complete).map(centre)],nearestDistance=ore=>anchors.length?Math.min(...anchors.map(anchor=>distance(anchor,ore))):Infinity;
 const positive=known.filter(ore=>ore.amount>0),unserved=positive.filter(ore=>!centres.some(ref=>distance(ref,ore)<=13)),nextOre=(unserved.length?unserved:positive).sort((a,b)=>nearestDistance(a)-nearestDistance(b)||a.x-b.x||a.y-b.y)[0]||null,armed=armedEnemies(v),riskyMiners=[];
 for(const miner of own.filter(e=>e.kind==='unit'&&e.type==='harvester')){const order=miner.orders?.[0];if(order?.kind!=='harvest'||!Number.isInteger(order.x)||!Number.isInteger(order.y))continue;const ore=patches.get(order.x+','+order.y),stale=!!ore?.stale||!cellVisible(v,order),threatened=armed.some(enemy=>distance(centre(enemy),miner)<11||distance(centre(enemy),order)<11);if(stale||threatened)riskyMiners.push({id:miner.id,x:miner.x,y:miner.y,oreX:order.x,oreY:order.y,stale,threatened});}
 return{refineries,nearbyOre,nearbyOreStale,nearbyOreConfidence,knownNearbyPatchCount:nearby.length,nextOre,riskyMiners};
}
function summarize(v){const own=v.entities.filter(e=>e.owner===0),units=own.filter(e=>e.kind==='unit'),buildings=own.filter(e=>e.kind==='building'),queued=buildings.flatMap(e=>e.queue||[]);return{own,units,buildings,miners:units.filter(e=>e.type==='harvester'),engineers:units.filter(e=>e.type==='engineer'),combat:units.filter(e=>combatTypes.includes(e.type)),siege:units.filter(e=>e.type==='siege'),producers:buildings.filter(e=>productionTypes.includes(e.type)),idle:buildings.filter(e=>productionTypes.includes(e.type)&&e.complete&&!e.queue?.length),queued,count:type=>units.filter(e=>e.type===type).length,planned:type=>units.filter(e=>e.type===type).length+queued.filter(q=>q.type===type).length};}
function derive(v,mission){const x=summarize(v),supply=logistics(v),label=tag=>mission.objectiveLabels?.[tag]||tag,aliveTargets=v.entities.filter(e=>e.owner!==0&&((v.objective.destroyTags||[]).includes(e.tag)||(v.objective.targetTags||[]).includes(e.tag))),anchor=x.combat.length?{x:x.combat.reduce((n,e)=>n+e.x,0)/x.combat.length,y:x.combat.reduce((n,e)=>n+e.y,0)/x.combat.length}:x.buildings.find(e=>e.type==='core')||{x:0,y:0},nearest=aliveTargets.slice().sort((a,b)=>distance(a,anchor)-distance(b,anchor))[0];
 const result={code:'overview',priority:'normal',text:'保住礦路，持續生產；技師維修會持續到目標修復，並消耗晶礦。',detail:'空閒技師會尋找附近6格內受損友軍。已下達的維修命令會持續追隨目標，資金不足時等待補給；不必反覆按維修。',focusID:null,focusPoint:null,focusLabel:null,counts:{miners:x.miners.length,queuedMiners:x.queued.filter(q=>q.type==='harvester').length,engineers:x.engineers.length,combat:x.combat.length,siege:x.siege.length,idleProducers:x.idle.length,refineries:supply.refineries.length,nearbyOre:supply.nearbyOre,nearbyOreStale:supply.nearbyOreStale,nearbyOreConfidence:supply.nearbyOreConfidence,knownNearbyPatchCount:supply.knownNearbyPatchCount,riskyMiners:supply.riskyMiners.length},nextTarget:nearest?{id:nearest.id,name:label(nearest.tag),kind:(v.objective.targetTags||[]).includes(nearest.tag)?'capture':'destroy',x:nearest.x,y:nearest.y}:null};
 const focus=(type,text)=>{const b=x.producers.find(e=>e.type===type&&e.complete)||x.producers.find(e=>e.type===type);if(b){result.focusID=b.id;result.focusLabel=text;}};
 const focusOre=()=>{if(supply.nextOre){result.focusPoint={x:supply.nextOre.x,y:supply.nextOre.y};result.focusLabel=supply.nextOre.stale?'查看上次已知礦點':'查看已知礦點';}};
 if(v.status!=='playing')return result;
 if(mission.id==='01'&&supply.knownNearbyPatchCount&&supply.nearbyOre===0){result.code='nearby-ore-exhausted';result.priority='urgent';result.text=supply.nearbyOreStale?'附近礦點上次已採空：先重查視野，再安排新礦路。':supply.nextOre?'附近晶礦已耗盡：先偵察下一礦點，護礦後再補車。':'附近晶礦已耗盡：先派偵察車找礦，再安排礦路。';result.detail='附近指已完成精煉廠13格內的已知礦點，不代表礦路安全。'+(supply.nextOre?.stale?'下一礦點是上次情報，存量與周圍敵情都要重新偵察。':'確認礦點與敵情後，再用前哨延伸施工範圍、建立精煉與防守。')+'替補礦車會自行尋找已知晶礦，可能前往失去視野的礦點。';focusOre();return result;}
 const knownArmed=armedEnemies(v),supplyUnits=[...x.miners,...supply.refineries],threat=knownArmed.find(e=>supplyUnits.some(f=>distance(centre(e),centre(f))<11));
 if(threat){result.code='logistics-threat';result.priority='urgent';result.text='已見敵軍逼近礦路：先保護礦車與精煉廠。';result.detail='用坦克與反裝甲步兵掩護前排，砲車留後方；敵方砲車射程超過防塔，出現時應先處理。';result.focusID=threat.id;result.focusLabel='查看已見威脅';return result;}
 if(supply.riskyMiners.length){const miner=supply.riskyMiners.find(m=>m.threatened)||supply.riskyMiners[0];result.code='risky-miners';result.priority=miner.threatened?'urgent':'warning';result.text=miner.threatened?'採礦目標附近有已見敵軍：先護礦，必要時撤回礦車。':'採礦目標目前失去視野，勿讓礦車單獨往返。';result.detail='目前採礦命令仍在執行。失去視野的礦點存量與沿途敵情尚未確認；可先選礦車撤回，重新偵察後再採集。';result.focusID=miner.id;result.focusLabel='查看礦車';return result;}
 if(!x.miners.length){result.code='no-miners';result.priority='urgent';result.text=x.planned('harvester')?'礦車出廠前先守住礦路，暫緩擴張。':'礦車全失：先守住礦路，再由工廠補礦車。';result.detail='礦車必須活著運回精煉廠，才會得到晶礦。請保留維修費，不要一次填滿作戰生產佇列。';focus('factory','選工廠');return result;}
 if(mission.id==='01'&&supply.knownNearbyPatchCount&&supply.nearbyOre>0&&supply.nearbyOre<=2500){result.code='nearby-ore-low';result.priority='warning';result.text=supply.nearbyOreStale?'附近晶礦上次約'+Math.floor(supply.nearbyOre)+'：先確認存量與下一礦路。':'附近晶礦剩約'+Math.floor(supply.nearbyOre)+'：先偵察並準備新精煉廠。';result.detail='附近只計已完成精煉廠13格內的已知晶礦，不代表安全。趁仍有收入，偵察新礦、用前哨延伸施工範圍，並安排精煉、防塔與技師；不要只補礦車。';focusOre();return result;}
 if(v.power.ratio<1){result.code='low-power';result.priority='warning';result.text='供電不足會拖慢生產；低於60%時防塔停火。';return result;}
 if(mission.id!=='01'){if(x.idle.length){result.code='idle-production';result.text='生產設施待命：依目前威脅持續補兵。';result.focusID=x.idle[0].id;result.focusLabel='選待命設施';}return result;}
 const westDone=!!v.objectiveProgress.destroyStatus?.['west-foundry'],eastDone=!!v.objectiveProgress.destroyStatus?.['east-array'];
 if(x.planned('harvester')<2){result.code='restore-miners';result.priority='warning';result.text='先恢復2輛礦車；守住礦路後，再補第3輛。';focus('factory','選工廠');return result;}
 if(x.planned('engineer')<1){result.code='repair-support';result.priority='warning';result.text='先補技師維修，保留晶礦支付修復費。';focus('barracks','選兵營');return result;}
 if(westDone){const core=x.buildings.find(e=>e.type==='core'),front=x.buildings.filter(e=>e.type==='refinery'&&core&&distance(e,core)>15),weak=front.find(b=>x.buildings.filter(t=>t.type==='turret'&&distance(t,b)<9).length<2);
  if(!front.length||weak){result.code='secure-expansion';result.text=weak?'前線精煉廠要有兩塔與技師掩護，再帶主力推進。':'西岸已清除：用前哨連接已知中央礦，再建精煉廠。';result.detail='參考策略是精煉廠附近兩座防塔加技師維修；這是戰術建議，不是任務硬性條件。敵人仍可能由另一座橋反擊。';if(weak){result.focusID=weak.id;result.focusLabel='查看前線精煉廠';}return result;}
 }
 if(x.idle.length&&x.combat.length<20){result.code='idle-production';result.priority='warning';result.text='生產設施待命：繼續補兵，另留200–300晶礦維修。';result.detail='出廠是持續循環，不只第一批。工廠與兵營可同時工作；每次補一項，保留礦車與技師的替補預算。';result.focusID=x.idle[0].id;result.focusLabel='選待命設施';return result;}
 if(!westDone&&(x.combat.length<13||x.siege.length<3)){result.code='stage-force';result.text='過橋前先整編：約13支作戰單位，包含3輛砲車。';result.detail='偵察車、礦車和技師不計入這個建議數量。坦克在前、裂甲手對裝甲、砲車在後；不是強制等候或兵力門檻。';return result;}
 if(westDone&&x.combat.length<11){result.code='regroup';result.priority='warning';result.text='主力受損：先回守得住的補給點，維修並補兵。';return result;}
 result.code='advance';result.text=!westDone?'擊退當前來襲部隊後，再由西橋分段推進。':!eastDone?'前線補給守穩後，再偵察東岸前哨；礦路留人守。':'沿已偵察路線處理北岸目標；旗標設施要接管。';return result;
}
return{derive,summarize,logistics};
});
