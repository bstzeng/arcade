(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f(require('../management-common/model.js'));else(r.ManagementGames||={})['hotel-manager']={...(r.ManagementGames||{})['hotel-manager'],engine:f(r.ManagementModel)};})(globalThis,function(M){'use strict';const {need,make}=M;
return make({
 start:l=>({day:0,cash:l.cash,rooms:l.rooms.map(()=>({guest:-1,dirty:false})),workers:l.workers.map(()=>0),arrived:l.guests.map(()=>false),served:l.guests.map(()=>false),checkedOut:0,nights:0,failed:false,note:'先安排抵達旅客，再分派員工。'}),
 status:(l,s)=>s.failed?'lost':s.day===l.days?(s.checkedOut===l.guests.length&&s.cash>=l.target?'won':'lost'):'playing',
 step(l,s,a){
 if(a.type==='checkin'){const g=l.guests[a.guest],r=l.rooms[a.room],rs=s.rooms[a.room];need(g&&r&&g.arrive===s.day&&!s.arrived[a.guest],'這位旅客不在今天等待入住。');need(rs.guest===-1&&!rs.dirty,'客房尚未清空或打掃。');need(r.beds>=g.beds&&(!g.quiet||r.quiet)&&(!g.view||r.view),'房型不符合旅客需求。');rs.guest=a.guest;s.arrived[a.guest]=true;s.note=g.name+'入住 '+r.name;}
 else if(a.type==='clean'){const r=s.rooms[a.room],w=l.workers[a.worker];need(r&&w&&r.guest===-1&&r.dirty,'只能打掃退房後的空房。');need(s.workers[a.worker]<w.hours,'員工工時已用完。');s.workers[a.worker]++;r.dirty=false;s.note=w.name+'完成客房打掃';}
 else if(a.type==='serve'){const g=l.guests[a.guest],w=l.workers[a.worker];need(g&&w&&s.rooms.some(r=>r.guest===a.guest)&&!s.served[a.guest],'旅客不在房內，或今天已服務。');const service=g.services[s.day-g.arrive];need(w.skills.includes(service)&&s.workers[a.worker]+g.effort<=w.hours,'技能或工時不符合服務需求。');s.workers[a.worker]+=g.effort;s.served[a.guest]=true;s.note=w.name+'完成 '+g.name+'的'+['早餐','行程','洗衣'][service];}
 else if(a.type==='night'){const due=l.guests.filter(g=>g.arrive===s.day).length,admitted=l.guests.filter((g,i)=>g.arrive===s.day&&s.arrived[i]).length;let income=0;for(const r of s.rooms){if(r.guest<0)continue;const g=l.guests[r.guest];if(!s.served[r.guest])s.failed=true;else{s.nights++;income+=g.rate;}if(g.depart===s.day+1){r.guest=-1;r.dirty=true;s.checkedOut++;}}
 if(due!==admitted)s.failed=true;s.cash+=income-l.workers.reduce((n,w)=>n+w.wage,0);if(s.cash<0)s.failed=true;s.day++;s.workers.fill(0);s.served.fill(false);s.note='夜間結算：房費 +'+income+'，薪資 −'+l.workers.reduce((n,w)=>n+w.wage,0)+'。';}
 else throw Error('未知旅館動作。');
 },
 actions(l,s){const a=[{type:'night'}];l.guests.forEach((g,i)=>{l.rooms.forEach((r,j)=>a.push({type:'checkin',guest:i,room:j}));l.workers.forEach((w,j)=>a.push({type:'serve',guest:i,worker:j}));});l.rooms.forEach((r,i)=>l.workers.forEach((w,j)=>a.push({type:'clean',room:i,worker:j})));return a;},
 describe:(l,a)=>a.type==='night'?'結束今天／收取房費':a.type==='checkin'?`讓${l.guests[a.guest].name}入住${l.rooms[a.room].name}`:a.type==='clean'?`${l.workers[a.worker].name}打掃${l.rooms[a.room].name}`:`${l.workers[a.worker].name}服務${l.guests[a.guest].name}`,
 tip:(l,s)=>'查看入住日與退房日；先把大房、安靜房與景觀房留給需要的旅客。退房後需一工時打掃，每位在住旅客每天都要完成服務，再結束今天。'
});});
