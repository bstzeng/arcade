(function(root,factory){'use strict';const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.Words120Engine=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const clone=x=>JSON.parse(JSON.stringify(x));
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const fail=message=>({ok:false,message});
const ok=(message,details={})=>({ok:true,message,...details});
const clean=s=>typeof s==='string'?s.trim():'';
function normalizePunctuation(s){return clean(s).replace(/\s/g,'').replace(/[!！。]$/,'。').replaceAll(',','，').replaceAll('?','？').replaceAll(';','；').replaceAll(':','：');}
function letters(s){return clean(s).replace(/[\s，。！？、：；「」『』“”‘’,.!?;:"'…—（）()]/g,'');}
function telegramPartner(observation){
 let msg=clean(observation.message).replace(/[\s，。；、,.;]/g,'');if(!msg)return {commands:[],error:'電報是空的。'};
 const parse=(remaining,acc)=>{if(!remaining)return [acc];let result=[];for(let cmd of observation.dictionary)for(let alias of cmd.aliases)if(remaining.startsWith(alias))result.push(...parse(remaining.slice(alias.length),[...acc,cmd.id]));return result;};
 let results=parse(msg,[]),unique=[...new Map(results.map(x=>[JSON.stringify(x),x])).values()];if(unique.length!==1)return {commands:[],error:unique.length?'句子有多種拆法。':'含有詞典未收錄的指令。'};return {commands:unique[0],characters:Array.from(msg).length,trace:unique[0].map(id=>observation.dictionary.find(x=>x.id===id).meaning)};
}
function alienPartner(o){
 let t=clean(o.sentence).split(/\s+/).filter(Boolean);if(!t.length)return {error:'尚未組句。'};let neg=false,plural=false;
 const strip=()=>{let end=o.grammar.suffix?t.length-1:0,v=t[end];if(v==='nu'||v==='zo'){if(v==='nu'){if(neg)return false;neg=true;}else{if(plural)return false;plural=true;}t.splice(end,1);return true;}return null;};
 let r;while((r=strip())===true){}if(r===false)return {error:'數量或否定標記不能重複。'};
 const role={};if(o.grammar.marked&&o.grammar.caseBefore){for(let i=0;i<t.length;){let token=t[i],key=token==='ka'?'S':token==='po'?'O':'V',word=key==='V'?token:t[i+1];let n=o.vocab[key].findIndex(x=>x[0]===word);if(n<0||role[key]!==undefined)return {error:'前置格標記、角色或詞組不正確。'};role[key]=n;i+=key==='V'?1:2;}}
 else if(o.grammar.marked){for(let i=0;i<t.length;){let word=t[i],found=Object.keys(o.vocab).filter(k=>o.vocab[k].some(x=>x[0]===word));if(found.length!==1)return {error:'未知詞或錯位格標記。'};let key=found[0];if(role[key]!==undefined)return {error:'角色重複。'};role[key]=o.vocab[key].findIndex(x=>x[0]===word);i++;if(key!=='V'){if(t[i]!==({S:'ka',O:'po'})[key])return {error:'名詞的格標記不正確。'};i++;}}}
 else {if(t.length!==3)return {error:'這個方言需要三個主幹詞。'};for(let i=0;i<3;i++){let key=o.grammar.order[i],n=o.vocab[key].findIndex(x=>x[0]===t[i]);if(n<0)return {error:'主詞、動詞、受詞的順序不合語料。'};role[key]=n;}}
 if(Object.keys(role).length!==3)return {error:'句子缺少角色。'};return {...role,neg,plural};
}
function featurePartner(o){
 if(!Array.isArray(o.message)||!o.message.length)return {matches:[],error:'至少傳一條線索。'};
 if(new Set(o.message).size!==o.message.length)return {matches:[],error:'線索重複。'};
 let chosen=o.message.map(id=>o.clues.find(c=>c.id===id));if(chosen.some(x=>!x))return {matches:[],error:'有未知線索。'};
 let forbidden=chosen.flatMap(x=>(o.banned||[]).filter(b=>x.label.includes(b)));if(forbidden.length)return {matches:[],error:'使用了禁字：'+[...new Set(forbidden)].join('、')};
 return {matches:o.board.filter(obj=>chosen.every(c=>obj.features.includes(c.feature))).map(x=>x.id),trace:chosen.map(x=>x.label)};
}
function logic(expr,bits){if(typeof expr==='number')return !!bits[expr];let [op,...args]=expr;return op==='not'?!logic(args[0],bits):op==='and'?args.every(x=>logic(x,bits)):args.some(x=>logic(x,bits));}
function fateEffects(level,bits){return level.scene.nodes.map(([name,expr])=>({name,value:logic(expr,bits)}));}
function parseExpression(expression,board){
 let s=clean(expression).replace(/\s/g,'');if(s.length>250)return {error:'描述太長。'};
 let tokens=s.match(/而且|非|或|[紅藍圓方大小實空()（）]/g)||[];if(tokens.join('')!==s||!tokens.length)return {error:'請只用屬性詞、而且、或、非與括號。'};tokens=tokens.map(x=>x==='（'?'(':x==='）'?')':x);let pos=0,atoms=0;
 function primary(){let t=tokens[pos++];if(t==='非')return {op:'not',a:primary()};if(t==='('){let e=disj();if(tokens[pos++]!==')')throw Error('括號未成對。');return e;}if('紅藍圓方大小實空'.includes(t||'')&&t){atoms++;return {op:'atom',value:t};}throw Error('缺少屬性詞。');}
 function conj(){let a=primary();while(tokens[pos]==='而且'){pos++;a={op:'and',a,b:primary()};}return a;}
 function disj(){let a=conj();while(tokens[pos]==='或'){pos++;a={op:'or',a,b:conj()};}return a;}
 function test(e,o){return e.op==='atom'?o.features.includes(e.value):e.op==='not'?!test(e.a,o):e.op==='and'?test(e.a,o)&&test(e.b,o):test(e.a,o)||test(e.b,o);}
 try{let tree=disj();if(pos!==tokens.length)throw Error('詞與詞之間需要連接詞。');let matches=board.filter(o=>test(tree,o)).map(o=>o.id);return {atoms,matches,mask:matches.reduce((m,n)=>m|(1<<n),0),tree};}catch(e){return {error:e.message};}
}
function evaluate(level,input,state){
 if(!input||typeof input!=='object'||Array.isArray(input))return fail('尚未輸入。');
 switch(level.kind){
 case 'punctuation':{let meanings=[];for(let j=0;j<level.rules.length;j++){let r=level.rules[j],text=clean(input['p'+j]);if(letters(text)!==r.raw)return fail(`告示 ${j+1} 只能改標點，不可增刪漢字。`);let reading=r.readings.findIndex(x=>normalizePunctuation(x)===normalizePunctuation(text));if(reading<0)return fail(`告示 ${j+1} 的句法未收錄；可參考本題的標點工具卡。`);if(reading!==r.goal)return fail(`告示 ${j+1} 的意思還不符合通行條件。`);meanings.push(reading);}return ok('兩道語意鎖都打開了。',{meanings});}
 case 'radical':{let produced=[];for(let k=0;k<level.recipes.length;k++){let recipe=level.recipes[k],parts=recipe[1].map((p,j)=>input[`part${k}_${j}`]);if(parts.some(x=>!x)||!input['layout'+k])return fail('零件或結構尚未選完。');if(!equal(parts,recipe[1])||input['layout'+k]!==recipe[2])return fail(`工作臺 ${k+1} 的部件與排列尚未組成目標字。`);produced.push(recipe[0]);}return ok('修復成功：'+produced.join('、'),{produced});}
 case 'telegram':{let res=telegramPartner({message:input.message,dictionary:level.dictionary});if(res.error)return fail(res.error);if(res.characters>level.max)return fail(`電報有 ${res.characters} 字，超過 ${level.max} 字。`);if(!equal(res.commands,level.goal))return fail('隊友照電報做了：'+res.trace.join(' → ')+'。這與任務順序不同。');return ok('隊友只讀電報，完成：'+res.trace.join(' → '),{observationResult:res});}
 case 'grammar':{let r=alienPartner({sentence:input.sentence,grammar:level.grammar,vocab:level.vocab});if(r.error)return fail(r.error);if(Object.keys(level.goal).some(k=>r[k]!==level.goal[k]))return fail('機器理解成：'+describeAlien(r,level.vocab)+'。尚未符合目標。');return ok('機器執行：'+describeAlien(r,level.vocab),{animation:r});}
 case 'homophone':{let effects=[];for(let j=0;j<level.conversions.length;j++){let r=level.conversions[j],choice=r.tools.find(t=>t.char===input['h'+j]&&t.pronunciation===r.pronunciation);if(!choice)return fail(`第 ${j+1} 個字必須同音同調，且能解決眼前障礙。`);effects.push(choice.effect);}return ok(effects.join(' '));}
 case 'pronoun':{for(let j=0;j<level.cases.length;j++)for(let k=0;k<level.cases[j].references.length;k++)if(input[`r${j}_${k}`]!==String(level.cases[j].references[k]))return fail(`案件 ${j+1} 的第 ${k+1} 條指代尚不符合事件線索。`);return ok('四條指代都已重建。'+level.cases.map(x=>x.explanation).join(' '));}
 case 'forbidden':{for(let j=0;j<level.route.length;j++){let r=level.route[j],res=featurePartner({message:input['stop'+j],clues:r.clues,board:r.board,banned:r.banned});if(res.error)return fail(`第 ${j+1} 站：${res.error}`);if(res.matches.length!==1||res.matches[0]!==r.target)return fail(`第 ${j+1} 站，店員推理出 ${res.matches.length} 件可能用品；需要唯一指向你要的物品。`);}return ok('三站都買到需要的用品，沒有說出禁字。');}
 case 'relay':{if(input.opening!==level.genre+'A'||input.closing!==level.genre+'Z')return fail('開頭或結尾的文體不合要求。');let chosen=Array.isArray(input.body)?input.body.map(x=>level.bodyCards.find(c=>c.id===x)):[];if(chosen.length!==2||chosen.some(x=>!x))return fail('需要完整的事件與條件兩張內容卡。');if(chosen.some(x=>x.style!==level.genre||x.value!==level.event.id)||new Set(chosen.map(x=>x.fact)).size!==2)return fail('文體、事件或條件被改掉了；請保留兩項原始事實。');return ok('文體轉換完成，事件與條件都保留。',{text:chosen.map(x=>x.label).join('')});}
 case 'fate':{let bits=state&&state.bits;if(!Array.isArray(bits)||bits.length!==4)return fail('故事狀態不完整。');if(!logic(level.scene.nodes[level.goalNode][1],bits))return fail('連鎖結果還沒達成目標。可查看下方因果追蹤。');return ok('一字引起連鎖，故事抵達目標。',{effects:fateEffects(level,bits)});}
 case 'metaphor':{let res=featurePartner({message:input.clues,board:level.board,clues:level.clues,banned:[]});if(res.error)return fail(res.error);if(res.matches.length!==1||res.matches[0]!==level.target)return fail('隊友依比喻找到 '+res.matches.length+' 件可能作品，還未唯一指向目標。');return ok('隊友依比喻猜中：'+level.board.find(x=>x.id===res.matches[0]).name,{observationResult:res});}
 case 'tone':{let form=level.forms.find(x=>x.id===input.fact);if(input.opening!==level.register||input.closing!==level.register||!form||form.style!==level.register)return fail('稱呼、句式、收尾還沒有共同符合場合。');if(form.event!==level.event.id)return fail('語氣符合，但事件被換掉了。');return ok('語氣符合場合，所有原始事實與條件都保留。',{text:form.label});}
 case 'dictionary':{let vals=level.words.map(w=>input[w]);if(vals.some(x=>typeof x!=='string'||!/^\d+$/.test(x)))return fail('字典還沒填完。');if(new Set(vals).size!==level.words.length)return fail('本題各詞不同義，不能重複指同一物。');for(let o of level.observations){let got=o.words.map(w=>Number(input[w])).sort((a,b)=>a-b);if(!equal(got,[...o.objects].sort((a,b)=>a-b)))return fail('這份字典無法解釋全部畫面。請比對語料交集。');}return ok('四個詞義都能解釋全部語料。');}
 case 'segmentation':{for(let j=0;j<level.rules.length;j++){let r=level.rules[j],s=clean(input['s'+j]);if(s.replaceAll('/','')!==r.raw)return fail('只能切詞，不能改字。');let interpreted=r.readings.filter(x=>x[0]===s);if(!interpreted.some(x=>x[2]===r.goal))return fail(`畫面 ${j+1} 的切法尚未符合指定句意。`);}return ok('兩條詞路都通向指定場景。');}
 case 'rhyme':{let text=clean(input.ending),together=text.startsWith('一起')||text.startsWith('一同'),phrase=together?text.slice(2):text;if(Array.from(level.prefix+text).length!==level.meter)return fail(`整句必須 ${level.meter} 字。`);let entries=level.lexicon.filter(x=>x.phrases.includes(phrase));if(!entries.length)return fail('句尾尚未收錄，請使用詩句工具卡或它列出的同義句。');if(!entries.some(x=>x.rhyme===level.rhyme))return fail('韻腳不同；需押 '+level.rhyme+' 韻部。');if(!entries.some(x=>x.id===level.goal)||together!==level.team)return fail('字數與韻部合適，但行動或合作條件不符合情節。');return ok('字數、韻腳與情節都符合：'+level.prefix+text);}
 case 'naming':{let r=parseExpression(input.expression,level.board);if(r.error)return fail(r.error);if(r.mask!==level.targetMask)return fail(`描述選中 ${r.matches.length} 個圖案，但仍有漏選或誤選。`);if(r.atoms>level.minCost)return fail(`已選對！再壓縮至 ${level.minCost} 個屬性詞；目前 ${r.atoms} 個。`);return ok(`用 ${r.atoms} 個屬性詞精準圈選全部目標。`,{observationResult:r});}
 default:return fail('未知規則。');}
}
function describeAlien(q,v){return `${q.plural?'兩個':'一個'}${v.S[q.S]?.[1]||'?'}${q.neg?'不':''}${v.V[q.V]?.[1]||'?'}${v.O[q.O]?.[1]||'?'}`;}
function createState(level){let input={};for(let f of level.fields||[])input[f.key]=f.type==='multi'?[]:f.type==='segmentation'?f.raw:f.initial||'';if(level.kind==='forbidden')for(let j=0;j<3;j++)input['stop'+j]=[];return {levelId:level.id,input,bits:level.initial?[...level.initial]:null,stage:0,assisted:false,status:'editing',result:null,history:[],revision:0};}
function legalField(level,key){if(level.kind==='forbidden')return /^stop[012]$/.test(key)?{key,type:'multi',options:level.route[Number(key.slice(4))].clues.map(x=>({value:x.id}))}:null;return (level.fields||[]).find(x=>x.key===key);}
function reduce(level,state,action){
 if(!state||state.levelId!==level.id||!action||typeof action!=='object')return state;
 if(action.type==='reset')return createState(level);
 let s=clone(state);if(action.type==='assist'){s.assisted=true;s.revision++;return s;}
 if(s.status==='won')return state;
 if(action.type==='set'){
 let f=legalField(level,action.key);if(!f||level.kind==='fate')return state;
 if(level.kind==='forbidden'&&Number(action.key.slice(4))!==s.stage)return state;
 let value=action.value;if(f.type==='multi'){if(!Array.isArray(value)||value.length>30||new Set(value).size!==value.length||value.some(v=>!f.options.some(o=>o.value===v)))return state;}else {if(typeof value!=='string'||value.length>600)return state;if(f.options&&!f.options.some(x=>x.value===value)&&value!=='')return state;}
 s.input[action.key]=clone(value);s.result=null;s.status='editing';
 }else if(action.type==='edit'){
 if(level.kind!=='fate'||!Number.isInteger(action.index)||action.index<0||action.index>3)return state;let j=action.index,before=level.scene.switches[j][s.bits[j]?0:1];s.bits[j]=s.bits[j]?0:1;let after=level.scene.switches[j][s.bits[j]?0:1];if([...before].filter((c,i)=>c!==[...after][i]).length!==1)return state;s.history.push({before,after,index:j,effects:fateEffects(level,s.bits)});s.result=null;
 }else if(action.type==='submit'){
 if(level.kind==='forbidden'&&s.stage<2){let r=level.route[s.stage],res=featurePartner({message:s.input['stop'+s.stage],board:r.board,clues:r.clues,banned:r.banned});if(res.error||res.matches.length!==1||res.matches[0]!==r.target)s.result=fail(res.error||'店員仍無法唯一判斷你要的用品。');else{s.stage++;s.result=ok('這一站成功！下一站新增禁字。');}s.revision++;return s;}
 s.result=evaluate(level,s.input,s);if(s.result.ok)s.status='won';
 }else return state;s.revision++;return s;
}
function witnessActions(level,input){if(level.kind==='fate')return [...input.edits.map(index=>({type:'edit',index})),{type:'submit'}];if(level.kind==='forbidden')return level.route.flatMap((r,j)=>[{type:'set',key:'stop'+j,value:input['stop'+j]},{type:'submit'}]);return [...Object.entries(input).map(([key,value])=>({type:'set',key,value})),{type:'submit'}];}
function replay(level,input,assisted=false){let s=createState(level);if(assisted)s=reduce(level,s,{type:'assist'});for(let a of witnessActions(level,input))s=reduce(level,s,a);return s;}
function saveRecord(progress,level,state){let p=validateProgress(progress);if(state.status!=='won'||!state.result?.ok)return p;let key=String(level.id),old=p.records[key]||{manual:false,assisted:false};p.records[key]={manual:old.manual||!state.assisted,assisted:old.assisted||state.assisted};return p;}
function validateProgress(data){let p={version:1,level:1,records:{},notebook:{}};if(!data||data.version!==1)return p;if(Number.isInteger(data.level)&&data.level>=1&&data.level<=100)p.level=data.level;if(data.records&&typeof data.records==='object')for(let [key,v] of Object.entries(data.records)){if(/^(?:[1-9]|[1-9]\d|100)$/.test(key)&&v&&typeof v.manual==='boolean'&&typeof v.assisted==='boolean')p.records[key]={manual:v.manual,assisted:v.assisted};}if(data.notebook&&typeof data.notebook==='object')for(let [k,v] of Object.entries(data.notebook)){if(/^[a-z]{2,16}$/.test(k)&&typeof v==='string'&&v.length<=20)p.notebook[k]=v;}return p;}
function semanticSignature(l){
 const featureBoard=board=>board.map(o=>[...o.features].sort().join('|')).sort();
 let key;switch(l.kind){
 case 'punctuation':key=l.rules.map(r=>({raw:r.raw,readings:r.readings,goal:r.goal}));break;
 case 'radical':key=l.recipes.map(r=>r.slice(0,3));break;
 case 'telegram':key={commands:l.goal,max:l.max};break;
 case 'grammar':key={grammar:l.grammar.marked?{marked:true,suffix:l.grammar.suffix,caseBefore:l.grammar.caseBefore}:l.grammar,goal:l.goal};break;
 case 'homophone':key=l.conversions;break;
 case 'pronoun':key=l.cases.map((c,i)=>({narrative:c.entities.reduce((text,name,k)=>text.split(name.replace(/（.*$/,'')).join('角色'+k),l.cards[i].text),references:c.references}));break;
 case 'forbidden':key=l.route.map(r=>({target:r.board.find(o=>o.id===r.target).features,board:featureBoard(r.board),banned:r.banned}));break;
 case 'relay':key={facts:[l.event.action,l.event.condition],genre:l.genre};break;
 case 'fate':key={sentences:l.scene.switches,nodes:l.scene.nodes,initial:l.initial,goalNode:l.goalNode};break;
 case 'metaphor':key={target:l.board.find(o=>o.id===l.target).features,board:featureBoard(l.board)};break;
 case 'tone':key={facts:[l.event.action,l.event.condition],register:l.register};break;
 case 'dictionary':{let rows=l.observations.map(o=>o.words.map(w=>l.words.indexOf(w)));let perm=a=>!a.length?[[]]:a.flatMap((v,i)=>perm(a.filter((_,j)=>i!==j)).map(t=>[v,...t]));key=perm([0,1,2,3]).map(p=>rows.map(row=>row.reduce((m,j)=>m|(1<<p[j]),0)).sort((a,b)=>a-b).join(',')).sort()[0];break;}
 case 'segmentation':key=l.rules.map(r=>({raw:r.raw,readings:r.readings,goal:r.goal}));break;
 case 'rhyme':key={meaning:l.lexicon.find(x=>x.id===l.goal).meaning,rhyme:l.rhyme,meter:l.meter,team:l.team};break;
 case 'naming':{let perm=a=>a.length?a.flatMap((v,i)=>perm(a.filter((_,j)=>i!==j)).map(p=>[v,...p])):[[]],best=l.targetMask;for(let p of perm([0,1,2,3]))for(let flip=0;flip<16;flip++){let mask=0;for(let x=0;x<16;x++)if(l.targetMask&(1<<x)){let y=p.reduce((n,j,k)=>n|(((x>>j)&1)<<k),0)^flip;mask|=1<<y;}best=Math.min(best,mask);}key={canonicalSignedAttributeMask:best,cost:l.minCost};break;}
 default:key=l.semantic;}return JSON.stringify(key);
}
return {createState,reduce,evaluate,replay,witnessActions,telegramPartner,alienPartner,featurePartner,logic,fateEffects,parseExpression,describeAlien,saveRecord,validateProgress,semanticSignature,letters};
});
