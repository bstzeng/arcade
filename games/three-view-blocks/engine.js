(function(root,factory){const U=typeof module==='object'&&module.exports?require('../spatial-common/util.js'):root.SpatialUtil;const E=factory(U);if(typeof module==='object'&&module.exports)module.exports=E;else root.SpatialEngine=E;})(globalThis,function(U){'use strict';

function views(l,h){return{top:h.map(x=>x>0?1:0),front:Array.from({length:l.w},(_,x)=>Math.max(...Array.from({length:l.h},(_,y)=>h[y*l.w+x]))),side:Array.from({length:l.h},(_,y)=>Math.max(...h.slice(y*l.w,(y+1)*l.w))),budget:U.sum(h)};}
const E=U.wrapper('three-view-blocks',{views,createState:l=>({heights:Array(l.w*l.h).fill(0)}),validateState:(l,s)=>s&&Array.isArray(s.heights)&&s.heights.length===l.w*l.h&&s.heights.every(v=>U.integer(v,0,l.max)),act(l,s,a){U.demand(a.type==='height'&&U.integer(a.cell,0,s.heights.length-1)&&U.integer(a.height,0,l.max));s.heights[a.cell]=a.height;return s;},inspect(l,s){const v=views(l,s.heights),won=U.same(v,l.target);return{status:won?'won':'playing',goalMet:won,used:v.budget,violations:v.budget>l.target.budget?['積木用量超過材料數']:[]};},describe:(l,a)=>'將第 '+(Math.floor(a.cell/l.w)+1)+' 排、第 '+(a.cell%l.w+1)+' 柱調為 '+a.height+' 顆。這是一組參考解，也接受其他符合三視圖和用量的堆法。'});

return E;});
