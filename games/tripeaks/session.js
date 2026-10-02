/* Persistence accepts only action histories that replay legally on this dataset. */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./engine.js'),require('./deals.js'));
  else root.TriPeaksSession=factory(root.TriPeaks,root.TRIPEAKS_DATA);
})(typeof globalThis!=='undefined'?globalThis:this,function(E,D){
  'use strict';
  const VERSION=1, MAX_TIME=31*24*60*60*1000;
  function empty(){return {version:VERSION,active:1,records:Object.create(null),completed:Object.create(null)};}
  function validRecord(record,deal,mustWin){
    if(!record||record.seed!==deal.seed||!Array.isArray(record.actions)||record.actions.length>51)return null;
    let state;try{state=E.replay(deal,record.actions);}catch(_){return null;}
    if(mustWin&&state.remaining)return null;
    return {seed:deal.seed,actions:record.actions.slice(),elapsed:Number.isFinite(record.elapsed)&&record.elapsed>=0?Math.min(record.elapsed,MAX_TIME):0,assisted:record.assisted===true};
  }
  function decode(raw){
    if(typeof raw!=='string'||raw.length>250000)return {book:empty(),recovered:!!raw};
    let data;try{data=JSON.parse(raw);}catch(_){return {book:empty(),recovered:true};}
    if(!data||data.version!==VERSION)return {book:empty(),recovered:true};
    const book=empty();let recovered=false;
    if(Number.isInteger(data.active)&&D.deals.some(d=>d.id===data.active))book.active=data.active;
    for(const deal of D.deals){
      for(const field of ['records','completed']){
        if(!data[field]||typeof data[field]!=='object')continue;
        const value=data[field][deal.id];if(!value)continue;
        const record=validRecord(value,deal,field==='completed');
        if(record)book[field][deal.id]=record;else recovered=true;
      }
    }
    return {book,recovered};
  }
  function encode(book){return JSON.stringify(book);}
  return Object.freeze({VERSION,empty,decode,encode,validRecord});
});
