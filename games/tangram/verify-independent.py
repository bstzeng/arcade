"""Exact rational geometry verification. Does not import the runtime or generator."""
import json,pathlib,math,hashlib
from fractions import Fraction as F
P=pathlib.Path(__file__).parent
BASE=[[(0,0),(4,0),(0,4)],[(0,0),(4,0),(0,4)],[(0,0),(2,2),(-2,2)],[(0,0),(2,0),(0,2)],[(0,0),(2,0),(0,2)],[(0,0),(2,0),(2,2),(0,2)],[(0,0),(2,0),(4,2),(2,2)]]
AREAS=[8,8,4,2,2,4,4]
def cross(a,b,c):return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])
def signed(p):return sum(a[0]*b[1]-a[1]*b[0] for a,b in zip(p,p[1:]+p[:1]))/F(2)
def clip(subject,mask):
 p=[tuple(F(v) for v in pt) for pt in subject]
 for a,b in zip(mask,mask[1:]+mask[:1]):
  q=[]
  for u,v in zip(p,p[1:]+p[:1]):
   x,y=cross(a,b,u),cross(a,b,v)
   if x>=0:q.append(u)
   if (x>=0)!=(y>=0):
    t=x/(x-y);q.append(tuple(u[k]+t*(v[k]-u[k]) for k in [0,1]))
  p=q
  if not p:return F(0)
 return abs(signed(p))
def transformed(i,p):
 assert p['r'] in [0,2,4,6] and isinstance(p['f'],bool)
 assert all(isinstance(p[k],int) for k in ['x','y'])
 out=[]
 for x,y in BASE[i]:
  if p['f']:x=-x
  for _ in range(p['r']//2):x,y=-y,x
  out.append((x+p['x'],y+p['y']))
 if p['f']:out.reverse()
 return out
def canon(polys):
 # Four equal-area lattice triangles per unit square: sample their exact centroids.
 xs=[x for p in polys for x,y in p];ys=[y for p in polys for x,y in p];occ=[]
 for x in range(min(xs),max(xs)):
  for y in range(min(ys),max(ys)):
   for dx,dy in [(3,1),(5,3),(3,5),(1,3)]:
    pt=(F(6*x+dx,6),F(6*y+dy,6))
    if any(all(cross(a,b,pt)>=0 for a,b in zip(p,p[1:]+p[:1])) for p in polys):occ.append((6*x+dx,6*y+dy))
 assert len(occ)==128
 variants=[]
 for swap in [0,1]:
  for sx in [-1,1]:
   for sy in [-1,1]:
    q=[(sx*(y if swap else x),sy*(x if swap else y)) for x,y in occ];mx=min(x for x,y in q);my=min(y for x,y in q)
    variants.append(tuple(sorted((x-mx,y-my) for x,y in q)))
 return min(variants)
def boundary(polys):
 all_edges={}
 for p in polys:
  for a,b in zip(p,p[1:]+p[:1]):
   n=math.gcd(abs(b[0]-a[0]),abs(b[1]-a[1]));assert n>0
   for k in range(n):
    u=tuple(a[j]+(b[j]-a[j])*k//n for j in [0,1]);v=tuple(a[j]+(b[j]-a[j])*(k+1)//n for j in [0,1])
    if (v,u) in all_edges:del all_edges[v,u]
    else:assert (u,v) not in all_edges;all_edges[u,v]=1
 return set(all_edges)
def check(l):
 assert len(l['target'])==7 and sorted(a['i'] for a in l['solution'])==list(range(7))
 target=[[tuple(pt) for pt in p] for p in l['target']]
 assert all(all(isinstance(v,int) for pt in p for v in pt) for p in target)
 assert min(x for p in target for x,y in p)==0 and min(y for p in target for x,y in p)==0
 assert max(x for p in target for x,y in p)==l['width'] and max(y for p in target for x,y in p)==l['height']
 assert sum(signed(p) for p in target)==32
 for i,p in enumerate(target):
  assert signed(p)>0 and all(cross(p[j-1],p[j],p[(j+1)%len(p)])>0 for j in range(len(p)))
  for q in target[i+1:]:assert clip(p,q)==0,'target overlap'
 placed=[]
 for a in l['solution']:
  p=transformed(a['i'],a['p']);assert signed(p)==AREAS[a['i']]
  assert sum(clip(p,q) for q in target)==AREAS[a['i']],'outside target'
  assert all(clip(p,q)==0 for q in placed),'piece overlap'
  placed.append(p)
 assert sum(signed(p) for p in placed)==32
 edges=boundary(target);assert edges=={(tuple(a),tuple(b)) for a,b in l['boundary']}
 neighbors={}
 for a,b in edges:neighbors.setdefault(a,set()).add(b);neighbors.setdefault(b,set()).add(a)
 assert all(len(v)==2 for v in neighbors.values()),'non-simple silhouette'
 seen=set();todo=[next(iter(neighbors))]
 while todo:
  a=todo.pop()
  if a not in seen:seen.add(a);todo.extend(neighbors[a])
 assert len(seen)==len(neighbors),'disconnected/hole boundary'
 return dict(id=l['id'],solvable=True,pieces=7,area=32,width=l['width'],height=l['height'],canonical=hashlib.sha256(repr(canon(target)).encode()).hexdigest())
levels=json.loads(P.joinpath('levels.json').read_text());assert len(levels)==50 and [l['id'] for l in levels]==list(range(1,51))
rows=[check(l) for l in levels];assert len({r['canonical'] for r in rows})==50,'equivalent silhouettes'
bad=json.loads(json.dumps(levels[0]));bad['solution'][0]['p']['x']+=99
try:check(bad);raise RuntimeError('bad witness accepted')
except AssertionError:pass
assert clip([(0,0),(2,0),(0,2)],[(1,0),(3,0),(1,2)])==F(1,2)
report=dict(game='tangram',count=50,uniqueSilhouettes=50,method='Exact Fraction polygon clipping, area coverage, boundary connectivity and D4 silhouette deduplication',levels=rows)
P.joinpath('certification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print('PASS Tangram: 50 geometrically distinct silhouettes, 350 standard pieces, exact area/containment/no-overlap, connected simple boundary, negative tests')
