"""Independent proof replay and layout-equivalence audit; imports no game/generator code."""
import json,pathlib,hashlib,collections
P=pathlib.Path(__file__).parent
levels=json.loads(P.joinpath('levels.json').read_text())
def signature(tiles):
 variants=[]
 for swap in [0,1]:
  for sx in [-1,1]:
   for sy in [-1,1]:
    q=[(sx*t['yx'[swap]],sy*t['xy'[swap]],t['z']) for t in tiles];mx=min(x for x,y,z in q);my=min(y for x,y,z in q)
    variants.append(tuple(sorted((x-mx,y-my,z) for x,y,z in q)))
 return min(variants)
def accessible(t,remaining):
 above=any(q['z']>t['z'] and max(t['x'],q['x'])<min(t['x']+2,q['x']+2) and max(t['y'],q['y'])<min(t['y']+2,q['y']+2) for q in remaining.values())
 left=any(q['z']==t['z'] and q['x']+2==t['x'] and abs(q['y']-t['y'])<2 for q in remaining.values())
 right=any(q['z']==t['z'] and t['x']+2==q['x'] and abs(q['y']-t['y'])<2 for q in remaining.values())
 return not above and not(left and right)
def check(l):
 ts=l['tiles'];assert l['layers']==max(t['z'] for t in ts)+1
 assert len(ts)%2==0 and 16<=len(ts)<=76
 assert [t['id'] for t in ts]==list(range(len(ts)))
 assert all(all(isinstance(t[k],int) for k in ['id','x','y','z','face']) and 0<=t['face']<34 and 0<=t['z']<5 for t in ts)
 for i,t in enumerate(ts):
  for q in ts[i+1:]:assert t['z']!=q['z'] or abs(t['x']-q['x'])>=2 or abs(t['y']-q['y'])>=2,'same-layer overlap'
  if t['z']>0:assert any(q['z']==t['z']-1 and q['x']==t['x'] and q['y']==t['y'] for q in ts),'unsupported upper tile'
 assert set(collections.Counter(t['face'] for t in ts).values())<={2,4}
 r={t['id']:t for t in ts}
 for pair in l['solution']:
  assert len(pair)==2 and pair[0]!=pair[1] and all(i in r for i in pair)
  a,b=(r[i] for i in pair);assert a['face']==b['face'];assert accessible(a,r) and accessible(b,r),'blocked removal'
  for i in pair:del r[i]
 assert not r
 return dict(id=l['id'],tiles=len(ts),layers=max(t['z'] for t in ts)+1,moves=len(l['solution']),solvable=True,canonical=hashlib.sha256(repr(signature(ts)).encode()).hexdigest())
assert len(levels)==50 and [l['id'] for l in levels]==list(range(1,51))
rows=[check(l) for l in levels];assert len({r['canonical'] for r in rows})==50,'geometrically equivalent layouts'
# Deliberate malformed witnesses must be rejected by this independent checker.
bad=json.loads(json.dumps(levels[0]));bad['solution'][0][1]=bad['solution'][0][0]
try:check(bad);raise RuntimeError('bad witness accepted')
except AssertionError:pass
# Explicit half-overlap covering and both-side blocker cases.
f={0:dict(id=0,x=0,y=0,z=0),1:dict(id=1,x=1,y=1,z=1)};assert not accessible(f[0],f)
f={i:dict(id=i,x=x,y=0,z=0) for i,x in enumerate([-2,0,2])};assert not accessible(f[1],f);del f[0];assert accessible(f[1],f)
report=dict(game='mahjong-solitaire',count=50,uniqueLayouts=50,method='Independent geometric blocker checks and full pair-removal witness replay',levels=rows)
P.joinpath('certification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print('PASS Mahjong: 50 distinct layered layouts,',sum(r['moves'] for r in rows),'legal pairs, full clearance, <=4 copies per face; negative/partial-cover tests')
