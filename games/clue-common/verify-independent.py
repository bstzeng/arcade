#!/usr/bin/env python3
"""Independent reference solvers; intentionally does not import shipped engine or generator."""
import json,itertools,hashlib,pathlib,collections,time
from canonical import canonical
ROOT=pathlib.Path(__file__).parent.parent
SLUGS=['logic-grid','truth-liars','alibi-timeline','substitution-cipher','family-tree','hat-deduction','evidence-order','rule-lab','landmark-location','escape-inventory']
def check(p):
 kind=p['kind'];n=p.get('n');sol=p['solution']
 if kind=='logic':
  def good(w):
   for c in p['clues']:
    def position(ref):return ref[1] if ref[0]==0 else w[ref[0]-1].index(ref[1])
    a,b=position(c['a']),position(c['b'])
    if not {'eq':a==b,'ne':a!=b,'before':a<b,'gap':abs(a-b)==c.get('d')}[c['op']]:return False
   return True
  results=[w for w in itertools.product(itertools.permutations(range(n)),repeat=2) if good(w)]
  assert len(results)==1 and list(map(list,results[0]))==sol;return len(results)
 if kind=='truth':
  def good(w):
   if sum(w)!=p['honest']:return False
   for j,s in enumerate(p['statements']):
    a,b=bool(w[s['a']]),bool(w[s['b']]);op=s['op'];val=(a if op=='single' else a and b if op=='and' else a or b if op=='or' else a!=b if op=='xor' else a==b if op=='same' else not a or b)
    if s['neg']:val=not val
    if bool(w[j])!=val:return False
   return True
  results=[w for w in itertools.product(range(2),repeat=n) if good(w)];assert len(results)==1 and list(results[0])==sol;return 1
 if kind=='timeline':
  def good(w):
   for c in p['clues']:
    if c['op']=='at':v=w[c['a']]==c['v']
    elif c['op']=='gap':v=abs(w[c['a']]-w[c['b']])==c['d']
    else:v=w[c['a']]<w[c['b']]
    if not v:return False
   return True
  results=[w for w in itertools.permutations(range(n)) if good(w)];assert len(results)==1 and list(results[0])==sol['times']
  w=results[0];possible=[j for j in range(n) if w[j]*10+p['distances'][j]<=p['crime'] and p['crime']+p['distances'][j]<=p['returns'][j]];assert possible==[sol['culprit']];return 1
 if kind=='cipher':
  # Work word by word without using a precomputed pattern signature.
  result=[]
  def dfs(i,m):
   if i==len(p['encoded']):result.append(m);return
   text=p['encoded'][i]
   for word in p['bank']:
    if len(word)!=len(text):continue
    candidate=m.copy();valid=True
    for c,a in zip(text,word):
     if c in candidate and candidate[c]!=a or c not in candidate and a in candidate.values():valid=False;break
     candidate[c]=a
    if valid:dfs(i+1,candidate)
  dfs(0,dict(p['anchors']));assert len(result)==1 and result[0]==sol;return 1
 if kind=='family':
  variables=[i for i,g in enumerate(p['generations']) if g>0];domains=[[i for i,g in enumerate(p['generations']) if g==p['generations'][j]-1] for j in variables];results=[]
  for assignment in itertools.product(*domains):
   w=[-1]*n
   for k,v in zip(variables,assignment):w[k]=v
   valid=True
   for c in p['clues']:
    a,b=c['a'],c['b'];op=c['op'];v=w[b]==a if op=='parent' else w[b]>=0 and w[w[b]]==a if op=='grand' else w[a]==w[b] if op=='siblings' else w[a]!=w[b]
    if not v:valid=False;break
   if valid:results.append(w)
  assert results==[sol];return 1
 if kind=='hats':
  worlds=[w for w in itertools.product(range(2),repeat=n) if sum(w) in p['totals']];trace=[]
  for speech in p['transcript']:
   person=speech['who'];out=[]
   for w in worlds:
    consistent=[v for v in worlds if tuple(v[j] for j in p['seen'][person])==tuple(w[j] for j in p['seen'][person])];colors=set(v[person] for v in consistent);claim=next(iter(colors)) if len(colors)==1 else -1
    if claim==speech['answer']:out.append(w)
   worlds=out;trace.append(len(worlds))
  assert worlds
  claims=[next(iter({w[j] for w in worlds})) if len({w[j] for w in worlds})==1 else -1 for j in range(n)]
  assert claims==sol and trace==p['certificate']['afterEach'] and set(worlds)==set(map(tuple,p['certificate']['worlds']));return 1
 if kind=='evidence':
  count=0
  for w in itertools.permutations(range(n)):
   valid=all(w.index(a)<w.index(b) for a,b in p['edges']) and all(abs(w.index(a)-w.index(b))>1 for a,b in p['apart'])
   count+=valid
  assert count==p['certificate']['solutions'] and count>0;assert all(sol.index(a)<sol.index(b) for a,b in p['edges']) and all(abs(sol.index(a)-sol.index(b))>1 for a,b in p['apart']);return count
 if kind=='rule':
  table=[int((x*sol['weights'][0]+y*sol['weights'][1]+z*sol['weights'][2])%sol['mod']==sol['residue']) for x,y,z in itertools.product(range(4),repeat=3)];assert table==p['certificate']['truthTable'];assert all(table[e['input'][0]*16+e['input'][1]*4+e['input'][2]]==e['output'] for e in p['samples']);assert 0<sum(table)<64;return 'equivalence-class'
 if kind=='map':
  results=[]
  for x,y,f in itertools.product(range(p['size']),range(p['size']),range(4)):
   if any(l['x']==x and l['y']==y for l in p['landmarks']):continue
   valid=True
   for c in p['clues']:
    l=p['landmarks'][c['landmark']];dx,dy=l['x']-x,l['y']-y;basis=[((0,-1),(1,0)),((1,0),(0,1)),((0,1),(-1,0)),((-1,0),(0,-1))][f];front=dx*basis[0][0]+dy*basis[0][1];right=dx*basis[1][0]+dy*basis[1][1]
    v=abs(dx)+abs(dy) if c['op']=='distance' else front if c['op']=='forward' else right if c['op']=='right' else (front>0)-(front<0) if c['op']=='frontsign' else (right>0)-(right<0)
    if v!=c['v']:valid=False;break
   if valid:results.append({'x':x,'y':y,'facing':f})
  assert results==[sol];return 1
 if kind=='escape':
  def advance(w,a):
   if any(w[k]<v for k,v in a['take']):return None
   z=list(w)
   for k,v in a['take']:z[k]-=v
   for k,v in a['give']:z[k]+=v
   return tuple(z)
  start=tuple(p['initial']);q=collections.deque([(start,0)]);seen={start};depth=None
  while q:
   w,d=q.popleft()
   if w[p['goal']]>0:depth=d;break
   for a in p['recipes']:
    z=advance(w,a)
    if z is not None and z not in seen:seen.add(z);q.append((z,d+1))
  assert depth==len(sol)==p['certificate']['shortestSteps'];w=start
  for j in sol:w=advance(w,p['recipes'][j]);assert w is not None
  assert w[p['goal']]>0;return 'all-valid-plans'
 raise AssertionError(kind)
def normalized(p):
 q={k:v for k,v in p.items() if k not in ['id','title','tier','solution','certificate','plain','people','jobs','drinks','events','items']}
 # Cipher symbol names are arbitrary; collapse their naming and strip unused UI alphabets.
 if p['kind']=='cipher':
  order=list(dict.fromkeys(''.join(p['encoded'])));m={v:str(j) for j,v in enumerate(order)};q['encoded']=[[m[c] for c in w] for w in p['encoded']];q['anchors']=sorted([[m[k],v] for k,v in p['anchors']]);q.pop('symbols');q.pop('alphabet')
 if p['kind']=='rule':q={'kind':'rule','truthTable':p['certificate']['truthTable']}
 if p['kind']=='escape':
  q['recipes']=[{k:v for k,v in r.items() if k!='name'} for r in p['recipes']]
 return hashlib.sha256(json.dumps(q,sort_keys=True,separators=(',',':')).encode()).hexdigest()
if __name__=='__main__':
 regression=json.loads((ROOT/'clue-common'/'semantic-regression-fixtures.json').read_text())['equivalentLogicStarts']
 assert len({canonical(p) for p in regression})==1, 'semantic regression: gap(0) and equality must canonicalize together'
 report={'generatedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'method':'Independent exhaustive enumeration / finite-state BFS; does not import generator or browser engine.','total':0,'games':{}}
 for slug in SLUGS:
  levels=json.loads((ROOT/slug/'levels.json').read_text());assert len(levels)==100;assert len({p['id'] for p in levels})==100;hashes=[canonical(p) for p in levels];assert len(set(hashes))==100,(slug,'duplicate public puzzle');rows=[]
  for p,h in zip(levels,hashes):
   assert p['canonicalSha256']==h, (p['id'],'stale canonical certificate')
   rows.append({'id':p['id'],'normalizedSha256':h,'verifiedSolutions':check(p),'tier':p['tier']})
  report['games'][slug]={'levels':100,'normalizedDistinct':100,'certificatesVerified':100,'levelsVerified':rows};report['total']+=100;print(slug,'100 independent checks passed',flush=True)
 (ROOT/'clue-common'/'independent-verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print('PASS',report['total'])
