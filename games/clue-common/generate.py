#!/usr/bin/env python3
"""Deterministic 1,000-puzzle generator. All public clues are machine-readable.
Reference enumeration here is independent from the shipped JS validator."""
import json,random,itertools,hashlib,os,collections
ROOT=os.path.dirname(__file__)
NAMES=['安禾','柏辰','采寧','冬晴','以南','方睿','光希','海棠','景然','可悠']
JOBS=['畫師','園丁','陶匠','樂師','木匠']; DRINKS=['紅茶','可可','牛奶','果汁','咖啡']
KINNAMES=['文松','雲蘭','昭明','若青','星河','雨禾','青芷','清嵐','予安','子澄']
GAMES={}
SEED_SHIFT=0
from canonical import canonical
def dump(slug,title,levels):
 d=os.path.join(ROOT,'..',slug);os.makedirs(d,exist_ok=True)
 for i,p in enumerate(levels):p['id']=f'{slug}-{i+1:03d}';p['tier']=min(5,i//20+1);p['title']=['初探','交叉推理','深入調查','專家挑戰','最終檔案'][i//20]+f' {i%20+1:02d}'
 with open(os.path.join(d,'levels.json'),'w') as f:json.dump(levels,f,ensure_ascii=False,separators=(',',':'))
 with open(os.path.join(d,'levels.js'),'w') as f:f.write('(function(g){const levels='+json.dumps(levels,ensure_ascii=False,separators=(',',':'))+';if(typeof module!=="undefined")module.exports=levels;else g.CLUE_LEVELS=levels;})(typeof window!=="undefined"?window:globalThis);\n')
 GAMES[slug]={'title':title,'levels':levels}
def select_clues(cands,worlds,truth,pred,rng):
 pool=list(cands);rng.shuffle(pool);chosen=[];remain=worlds
 while len(remain)>1:
  best=None;bestlen=len(remain)
  for c in pool[:80]:
   count=sum(pred(w,c) for w in remain)
   if count<bestlen:best,bestlen=c,count
  if best is None:
   for c in pool:
    count=sum(pred(w,c) for w in remain)
    if count<bestlen:best,bestlen=c,count
  if best is None:raise RuntimeError('cannot isolate')
  chosen.append(best);remain=[w for w in remain if pred(w,best)];pool.remove(best)
 assert remain==[truth] or truth in remain
 return chosen

def logic():
 out=[]
 for i in range(100):
  r=random.Random(71300+i+SEED_SHIFT);n=3 if i<25 else 4 if i<65 else 5
  perms=list(itertools.permutations(range(n)));worlds=list(itertools.product(perms,perms));truth=r.choice(worlds)
  # references: category 0 = people, 1 = professions, 2 = drinks; value names an item.
  def pos(w,a):return a[1] if a[0]==0 else w[a[0]-1].index(a[1])
  def pred(w,c):
   a,b=pos(w,c['a']),pos(w,c['b']);return (a==b if c['op']=='eq' else a!=b if c['op']=='ne' else a<b if c['op']=='before' else abs(a-b)==c['d'])
  refs=[(k,j) for k in range(3) for j in range(n)];cands=[]
  for a,b in itertools.combinations(refs,2):
   if a[0]==b[0]==0:continue
   av,bv=pos(truth,a),pos(truth,b)
   for op in ['eq','ne','before','gap']:
    c={'a':a,'b':b,'op':op};
    if op=='gap':c['d']=abs(av-bv)
    if pred(truth,c):cands.append(c)
  clues=select_clues(cands,worlds,truth,pred,r)
  out.append({'kind':'logic','n':n,'people':NAMES[:n],'jobs':JOBS[:n],'drinks':DRINKS[:n],'clues':clues,'solution':[list(x) for x in truth],'certificate':{'solutions':1,'worlds':len(worlds)}})
 return out

def statement(w,s):
 a=w[s['a']];b=w[s['b']];v={'single':a,'and':a and b,'or':a or b,'xor':a!=b,'same':a==b,'implies':not a or b}[s['op']]
 return bool(v)^bool(s['neg'])
def truthgames():
 out=[]
 for i in range(100):
  r=random.Random(9200+i+SEED_SHIFT);n=4+i//20;worlds=list(itertools.product([0,1],repeat=n))
  for attempt in range(10000):
   truth=r.choice([w for w in worlds if 0<sum(w)<n]);stm=[]
   for j in range(n):
    a,b=r.sample([k for k in range(n) if k!=j],2);op=r.choice(['single','and','or','xor','same','implies'][:min(6,2+i//20)])
    s={'a':a,'b':b,'op':op,'neg':0};s['neg']=int(statement(truth,s)!=bool(truth[j]));stm.append(s)
   sols=[w for w in worlds if sum(w)==sum(truth) and all(bool(w[j])==statement(w,s) for j,s in enumerate(stm))]
   if len(sols)==1:break
  else:raise RuntimeError('truth')
  out.append({'kind':'truth','n':n,'people':NAMES[:n],'honest':sum(truth),'statements':stm,'solution':list(truth),'certificate':{'solutions':1,'worlds':2**n}})
 return out

def timeline():
 out=[]
 for i in range(100):
  r=random.Random(17400+i+SEED_SHIFT);n=4+min(2,i//34);worlds=list(itertools.permutations(range(n)));truth=r.choice(worlds);culprit=r.randrange(n);crime=(n+1)*10
  loc=[];returns=[]
  for j in range(n):
   dep=truth[j]*10
   if j==culprit:dist=r.randint(5,min(25,crime-dep));ret=crime+dist+r.choice([0,5,10])
   else:
    dist=r.randint(10,35);ret=max(dep+5,crime+dist-r.randint(1,4)*5)
   loc.append(dist);returns.append(ret)
  def pred(w,c):
   a=w[c['a']];b=w[c['b']];return a<b if c['op']=='before' else abs(a-b)==c['d'] if c['op']=='gap' else a==c['v']
  cands=[]
  for a,b in itertools.combinations(range(n),2):
   aa,bb=(a,b) if truth[a]<truth[b] else (b,a)
   cands.extend([{'a':aa,'b':bb,'op':'before'},{'a':a,'b':b,'op':'gap','d':abs(truth[a]-truth[b])}])
  for a in range(n):cands.append({'a':a,'b':a,'op':'at','v':truth[a]})
  clues=select_clues(cands,worlds,truth,pred,r)
  candidates=[j for j in range(n) if truth[j]*10+loc[j]<=crime<=returns[j]-loc[j]]
  assert candidates==[culprit]
  out.append({'kind':'timeline','n':n,'people':NAMES[:n],'crime':crime,'distances':loc,'returns':returns,'clues':clues,'solution':{'times':list(truth),'culprit':culprit},'certificate':{'solutions':1,'worlds':len(worlds),'culprit':culprit}})
 return out

WORDS=['APPLE','PEAR','PLUM','MELON','LEMON','BERRY','CHERRY','MANGO','OLIVE','COCOA','PAPAYA','GUAVA','BANANA','ORANGE','GRAPE','PEACH','FIG','KIWI','LYCHEE','APRICOT','CLOUD','RAIN','SNOW','STORM','WIND','SUN','MOON','STAR','SKY','RIVER','OCEAN','LAKE','STREAM','HILL','FOREST','TREE','LEAF','FLOWER','GRASS','STONE','SAND','SHELL','CORAL','ISLAND','BRIDGE','TOWER','GATE','HOUSE','CABIN','CASTLE','LIGHT','NIGHT','DAWN','DUSK','SHADOW','SPARK','FLAME','FROST','GLASS','CLOCK']
def pattern(w):return tuple(w.index(c) for c in w)
def cipher_solve(p,limit=100):
 bank=p['bank'];words=p['encoded'];anchors=p['anchors'];results=[];order=sorted(range(len(words)),key=lambda j:sum(pattern(words[j])==pattern(w) for w in bank))
 def dfs(depth,m):
  if len(results)>=limit:return
  if depth==len(order):results.append(m.copy());return
  text=words[order[depth]]
  for w in bank:
   if pattern(w)!=pattern(text):continue
   mm=m.copy();rev={v:k for k,v in mm.items()};ok=True
   for a,b in zip(text,w):
    if a in mm and mm[a]!=b or b in rev and rev[b]!=a:ok=False;break
    mm[a]=b;rev[b]=a
   if ok:dfs(depth+1,mm)
 dfs(0,{a:b for a,b in anchors});return results

def ciphers():
 out=[]
 for i in range(100):
  r=random.Random(44100+i+SEED_SHIFT);count=3+i//25;plain=r.sample(WORDS,count);decoys=r.sample([w for w in WORDS if w not in plain],4+i//20);bank=sorted(plain+decoys);letters=sorted(set(''.join(plain)));codes=r.sample(list('ABCDEFGHIJKLMNOPQRSTUVWXYZ'),len(letters));enc=dict(zip(letters,codes));solution={v:k for k,v in enc.items()};p={'kind':'cipher','bank':bank,'encoded':[''.join(enc[c] for c in w) for w in plain],'symbols':sorted(codes),'alphabet':sorted(set(''.join(bank))),'anchors':[]}
  sols=cipher_solve(p)
  while len(sols)>1:
   keys=[k for k in codes if k not in dict(p['anchors'])];best=max(keys,key=lambda k:len(set(s.get(k) for s in sols)));p['anchors'].append([best,solution[best]]);sols=cipher_solve(p)
  assert len(sols)==1 and sols[0]==solution
  p['solution']=solution;p['plain']=plain;p['certificate']={'solutions':1,'dictionaryWords':len(bank),'search':'pattern-preserving bijection'};out.append(p)
 return out

def families():
 out=[]
 for i in range(100):
  r=random.Random(81700+i+SEED_SHIFT);counts=[2,2+(i>=30),2+(i>=15)+(i>=65)];gens=[g for g,n in enumerate(counts) for _ in range(n)];n=len(gens);choices=[[j for j in range(n) if gens[j]==gens[k]-1] for k in range(n) if gens[k]>0];indices=[k for k in range(n) if gens[k]>0]
  worlds=[]
  for vals in itertools.product(*choices):
   w=[-1]*n
   for k,v in zip(indices,vals):w[k]=v
   worlds.append(tuple(w))
  truth=r.choice(worlds)
  def pred(w,c):
   a,b=c['a'],c['b'];return w[b]==a if c['op']=='parent' else w[a]==w[b] if c['op']=='siblings' else w[a]!=w[b] if c['op']=='different' else w[b]>=0 and w[w[b]]==a
  cands=[]
  for a in range(n):
   for b in range(n):
    if a==b:continue
    for op in ['parent','grand','siblings','different']:
     if op in ['siblings','different'] and (gens[a]!=gens[b] or gens[a]==0):continue
     c={'a':a,'b':b,'op':op}
     if pred(truth,c):cands.append(c)
  clues=select_clues(cands,worlds,truth,pred,r)
  out.append({'kind':'family','n':n,'people':KINNAMES[:n],'generations':gens,'clues':clues,'solution':list(truth),'certificate':{'solutions':1,'worlds':len(worlds)}})
 return out

def knowledge(worlds,seen,who,w):
 options={v[who] for v in worlds if all(v[j]==w[j] for j in seen[who])};return next(iter(options)) if len(options)==1 else -1

def hats():
 out=[];norm=set()
 for i in range(100):
  r=random.Random(67000+i+SEED_SHIFT);n=3+min(4,i//20)
  for attempt in range(2000):
   totals=sorted(r.sample(range(1,n),min(n-1,1+i//35)));worlds=[w for w in itertools.product([0,1],repeat=n) if sum(w) in totals];initial=len(worlds);truth=r.choice(worlds)
   seen=[sorted(r.sample([k for k in range(n) if k!=j],r.randint(1,n-1))) for j in range(n)];transcript=[];trace=[]
   for turn in range(n*3):
    who=r.randrange(n);answer=knowledge(worlds,seen,who,truth);new=[w for w in worlds if knowledge(worlds,seen,who,w)==answer]
    if len(new)<len(worlds):transcript.append({'who':who,'answer':answer});trace.append(len(new));worlds=new
    if len(worlds)==1 or len(transcript)>=2+i//20:break
   sol=[next(iter({w[j] for w in worlds})) if len({w[j] for w in worlds})==1 else -1 for j in range(n)]
   sig=json.dumps([totals,seen,transcript])
   if transcript and any(x>=0 for x in sol) and sig not in norm:break
  else:raise RuntimeError('hats')
  norm.add(sig);out.append({'kind':'hats','n':n,'people':NAMES[:n],'totals':totals,'seen':seen,'transcript':transcript,'solution':sol,'certificate':{'solutions':1,'initialWorlds':initial,'survivors':len(worlds),'afterEach':trace,'worlds':list(worlds)}})
 return out

EVENTS=['總電源接通','壓力槽充能','水閘升起','輸送帶啟動','感測器校正','防護罩落下','機械臂轉向','封條印製','樣本入庫']
def evidence():
 out=[];sigs=set()
 for i in range(100):
  r=random.Random(55100+i+SEED_SHIFT);n=5+min(3,i//25)
  while True:
   sol=r.sample(range(n),n);edges=[]
   for a in range(n):
    for b in range(a+1,n):
     if r.random()<.27+i/500:edges.append([sol[a],sol[b]])
   # Every event participates; the graph never encodes a single linear sequence alone.
   for j in range(n):
    if not any(j in e for e in edges):
     ix=sol.index(j);other=sol[ix-1] if ix else sol[1];edges.append([other,j] if ix else [j,other])
   apart=[]
   if i>=25:
    a,b=r.sample(range(n),2)
    if abs(sol.index(a)-sol.index(b))>1:apart=[[a,b]]
   sig=json.dumps([sorted(edges),apart]);
   if sig not in sigs:break
  sigs.add(sig)
  sols=[]
  for w in itertools.permutations(range(n)):
   pos={v:k for k,v in enumerate(w)}
   if all(pos[a]<pos[b] for a,b in edges) and all(abs(pos[a]-pos[b])>1 for a,b in apart):sols.append(w)
  assert sols
  out.append({'kind':'evidence','n':n,'events':EVENTS[:n],'edges':edges,'apart':apart,'solution':list(sols[0]),'certificate':{'solutions':len(sols),'worlds':len(list(itertools.permutations(range(n)))),'acceptsAllValid':True}})
 return out

def rule_value(params,v):return sum(a*b for a,b in zip(params['weights'],v))%params['mod']==params['residue']
def rules():
 out=[];sigs=set();domain=list(itertools.product(range(4),repeat=3))
 for i in range(100):
  r=random.Random(98600+i+SEED_SHIFT)
  while True:
   mod=r.choice([4,5,7] if i<20 else [5,7,9] if i<50 else [7,9,11]);weights=[r.randrange(mod) for _ in range(3)];residue=r.randrange(mod);p={'weights':weights,'mod':mod,'residue':residue};table=[int(rule_value(p,v)) for v in domain];sig=''.join(map(str,table))
   if sig not in sigs and 4<=sum(table)<=48 and sum(x>0 for x in weights)>=min(3,1+i//30):break
  sigs.add(sig);samples=r.sample(domain,3 if i<30 else 2)
  out.append({'kind':'rule','domain':4,'maxMod':11,'samples':[{'input':v,'output':int(rule_value(p,v))} for v in samples],'solution':p,'certificate':{'solutions':'all equivalent expressions accepted','truthTable':table,'experiments':64}})
 return out

def map_pred(p,w,c):
 x,y,f=w;lm=p['landmarks'][c['landmark']];dx=lm['x']-x;dy=lm['y']-y;forward=[-dy,dx,dy,-dx][f];right=[dx,dy,-dx,-dy][f];d=abs(dx)+abs(dy)
 return d==c['v'] if c['op']=='distance' else forward==c['v'] if c['op']=='forward' else right==c['v'] if c['op']=='right' else (1 if forward>0 else -1 if forward<0 else 0)==c['v'] if c['op']=='frontsign' else (1 if right>0 else -1 if right<0 else 0)==c['v']

def maps():
 out=[]
 for i in range(100):
  r=random.Random(23600+i+SEED_SHIFT);size=5+i//25;n=3+i//25;cells=r.sample(range(size*size),n+1);landmarks=[{'name':['古塔','石橋','花園','噴泉','鐘樓','湖亭'][j],'x':v%size,'y':v//size} for j,v in enumerate(cells[:n])];truth=(cells[-1]%size,cells[-1]//size,r.randrange(4));worlds=[(x,y,f) for y in range(size) for x in range(size) if y*size+x not in cells[:n] for f in range(4)];p={'kind':'map','size':size,'landmarks':landmarks};cands=[]
  for j,lm in enumerate(landmarks):
   dx=lm['x']-truth[0];dy=lm['y']-truth[1];f=truth[2];forward=[-dy,dx,dy,-dx][f];right=[dx,dy,-dx,-dy][f]
   for op,v in [('distance',abs(dx)+abs(dy)),('forward',forward),('right',right),('frontsign',(forward>0)-(forward<0)),('rightsign',(right>0)-(right<0))]:cands.append({'landmark':j,'op':op,'v':v})
  # Later stages emphasize directional signs; exact projections are fallback if needed.
  if i>=40:cands.sort(key=lambda c:c['op'] in ['forward','right'])
  clues=select_clues(cands,worlds,truth,lambda w,c:map_pred(p,w,c),r)
  p.update({'clues':clues,'solution':{'x':truth[0],'y':truth[1],'facing':truth[2]},'certificate':{'solutions':1,'worlds':len(worlds)}});out.append(p)
 return out

ITEMS=['銅片','玻璃','磁石','細繩','齒輪','透鏡','線圈','把手','光核','感應鎖','穩壓器','門栓','出口']
def inventory_apply(inv,recipe):
 if any(inv[k]<v for k,v in recipe['take']):return None
 a=list(inv)
 for k,v in recipe['take']:a[k]-=v
 for k,v in recipe['give']:a[k]+=v
 return tuple(a)
def inventory_solve(p):
 start=tuple(p['initial']);q=collections.deque([start]);seen={start:None};via={}
 while q:
  w=q.popleft()
  if w[p['goal']]>0:
   seq=[]
   while seen[w] is not None:seq.append(via[w]);w=seen[w]
   return seq[::-1],len(seen)
  for j,a in enumerate(p['recipes']):
   new=inventory_apply(w,a)
   if new is not None and new not in seen:seen[new]=w;via[new]=j;q.append(new)
 return None,len(seen)

def escapes():
 out=[];sigs=set()
 for i in range(100):
  r=random.Random(11100+i+SEED_SHIFT);steps=4+i//20;base=3+(i>=40);n=base+steps+1;goal=n-1
  while True:
   recipes=[]
   for j in range(steps):
    k=base+j;pool=list(range(k));take=r.sample(pool,min(len(pool),2+(i>=60 and r.random()<.3)));recipes.append({'take':[[v,1] for v in sorted(take)],'give':[[k,1]],'name':'組裝'+str(j+1)})
   recipes.append({'take':[[base+steps-1,1],[base+max(0,steps-2),1]],'give':[[goal,1]],'name':'開啟出口'})
   need=[0]*n;need[goal]=1
   for j in range(len(recipes)-1,-1,-1):
    outitem=recipes[j]['give'][0][0];amt=need[outitem];need[outitem]=0
    for k,v in recipes[j]['take']:need[k]+=v*amt
   initial=need[:]
   sig=json.dumps([recipes,initial])
   if sig not in sigs and sum(initial)<65:break
  sigs.add(sig)
  # A visible waste press is a genuine recoverable dead end, never a hidden rule.
  recipes.insert(r.randrange(len(recipes)),{'take':[[r.randrange(base),1]],'give':[],'name':'廢料壓床'})
  names=ITEMS[:base]+['模組'+chr(65+j) for j in range(steps)]+['出口'];p={'kind':'escape','items':names,'initial':initial,'recipes':recipes,'goal':goal}
  sol,visited=inventory_solve(p);assert sol is not None;p['solution']=sol;p['certificate']={'solvable':True,'shortestSteps':len(sol),'visitedStates':visited,'acceptsAllValid':True};out.append(p)
 return out

if __name__=='__main__':
 import argparse
 parser=argparse.ArgumentParser(description=__doc__)
 parser.add_argument('--only',choices=['logic-grid','truth-liars','alibi-timeline','substitution-cipher','family-tree','hat-deduction','evidence-order','rule-lab','landmark-location','escape-inventory'],help='Regenerate only one corpus; leave all others untouched.')
 args=parser.parse_args()
 for slug,title,fn in [('logic-grid','邏輯配對',logic),('truth-liars','真話與謊言',truthgames),('alibi-timeline','時間線追兇',timeline),('substitution-cipher','替換密文',ciphers),('family-tree','家譜追蹤',families),('hat-deduction','帽色推理',hats),('evidence-order','物證因果',evidence),('rule-lab','規則實驗室',rules),('landmark-location','地圖定位',maps),('escape-inventory','密室道具',escapes)]:
  if args.only and slug!=args.only:continue
  print('Generating',slug,flush=True)
  buckets=[[] for _ in range(5)];seen=set();rounds=0
  while any(len(b)<20 for b in buckets):
   SEED_SHIFT=rounds*100003
   for i,p in enumerate(fn()):
    bucket=buckets[i//20]
    if len(bucket)>=20:continue
    signature=canonical(p)
    if signature not in seen:seen.add(signature);p['canonicalSha256']=signature;bucket.append(p)
   rounds+=1
   if rounds>100:raise RuntimeError('not enough inequivalent puzzles '+slug)
  dump(slug,title,[p for b in buckets for p in b])
  print('Canonical unique:',slug,100,'batches',rounds,flush=True)
 print('Generated',sum(len(x['levels']) for x in GAMES.values()),'puzzles')
