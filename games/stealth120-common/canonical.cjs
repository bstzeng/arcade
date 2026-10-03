'use strict';
// Bug Sweep's known offsets are automatically calibrated away. Only the board
// geometry and two device locations determine its deduction problem. Frequency
// labels are interchangeable; reflections and transposition preserve distances.
function bugSweep(l) {
  const keys=[];
  for(let transpose=0;transpose<2;transpose++)
    for(let flipX=0;flipX<2;flipX++)
      for(let flipY=0;flipY<2;flipY++) {
        const w=transpose?l.h:l.w,h=transpose?l.w:l.h;
        const bugs=l.bugs.map(p=>{
          let x=p%l.w,y=Math.floor(p/l.w);
          if(transpose)[x,y]=[y,x];
          if(flipX)x=w-1-x;
          if(flipY)y=h-1-y;
          return y*w+x;
        }).sort((a,b)=>a-b);
        keys.push(JSON.stringify([w,h,bugs]));
      }
  return keys.sort()[0];
}
module.exports={bugSweep};
