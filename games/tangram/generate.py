"""Seeded edge-attachment generator. Seven standard tangram pieces; no dependencies."""
import json,random,pathlib,math,hashlib
P=pathlib.Path(__file__).parent
BASE=[[(0,0),(4,0),(0,4)],[(0,0),(4,0),(0,4)],[(0,0),(2,2),(-2,2)],[(0,0),(2,0),(0,2)],[(0,0),(2,0),(0,2)],[(0,0),(2,0),(2,2),(0,2)],[(0,0),(2,0),(4,2),(2,2)]]
def area(p):return abs(sum(a[0]*b[1]-a[1]*b[0] for a,b in zip(p,p[1:]+p[:1])))/2
def cross(a,b,c):return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])
def intersect(a,b):
 p=a[:]
 for u,v in zip(b,b[1:]+b[:1]):
  q=[]
  for x,y in zip(p,p[1:]+p[:1]):
   cx,cy=cross(u,v,x),cross(u,v,y);ix,iy=cx>=-1e-9,cy>=-1e-9
   if ix:q.append(x)
   if ix!=iy:
    t=cx/(cx-cy);q.append((x[0]+t*(y[0]-x[0]),x[1]+t*(y[1]-x[1])))
  p=q
  if not p:return 0
 return area(p)
def form(i,r,f):
 p=[((-x if f else x),y) for x,y in BASE[i]]
 for _ in range(r//2):p=[(-y,x) for x,y in p]
 if f:p.reverse()
 return p
def segments(p):
 out=[]
 for a,b in zip(p,p[1:]+p[:1]):
  dx,dy=b[0]-a[0],b[1]-a[1];n=math.gcd(abs(dx),abs(dy))
  for k in range(n):out.append(((a[0]+k*dx//n,a[1]+k*dy//n),(a[0]+(k+1)*dx//n,a[1]+(k+1)*dy//n)))
 return out
def boundary(polys):
 d={}
 for p in polys:
  for a,b in segments(p):
   if (b,a) in d:del d[b,a]
   else:d[a,b]=1
 return list(d)
def occupancy(polys):
 xs=[x for p in polys for x,y in p];ys=[y for p in polys for x,y in p];out=[]
 for x in range(min(xs),max(xs)):
  for y in range(min(ys),max(ys)):
   for dx,dy in [(3,1),(5,3),(3,5),(1,3)]:
    pt=(x+dx/6,y+dy/6)
    if any(all(cross(a,b,pt)>=-1e-9 for a,b in zip(p,p[1:]+p[:1])) for p in polys):out.append((6*x+dx,6*y+dy))
 return out
def canonical(occ):
 variants=[]
 for swap in [0,1]:
  for sx in [-1,1]:
   for sy in [-1,1]:
    a=[(sx*(y if swap else x),sy*(x if swap else y)) for x,y in occ];mx=min(x for x,y in a);my=min(y for x,y in a)
    variants.append(tuple(sorted((x-mx,y-my) for x,y in a)))
 return min(variants)
def one(seed):
 rng=random.Random(seed);polys=[];placements=[None]*7;order=[0]+rng.sample(list(range(1,7)),6)
 for i in order:
  options=[]
  if not polys:options=[(form(i,0,False),dict(x=0,y=0,r=0,f=False))]
  else:
   edges=boundary(polys);rng.shuffle(edges)
   attempts=0
   for a,b in edges[:35]:
    for r in [0,2,4,6]:
     for f in ([False,True] if i==6 else [False]):
      shape=form(i,r,f)
      for c,d in segments(shape):
       if (b[0]-a[0],b[1]-a[1])!=(c[0]-d[0],c[1]-d[1]):continue
       tx,ty=b[0]-c[0],b[1]-c[1];q=[(x+tx,y+ty) for x,y in shape]
       if any(intersect(q,p)>1e-8 for p in polys):continue
       xs=[x for p in polys+[q] for x,y in p];ys=[y for p in polys+[q] for x,y in p]
       box=(max(xs)-min(xs))*(max(ys)-min(ys))
       if max(xs)-min(xs)>14 or max(ys)-min(ys)>12:continue
       # Weight toward compact but visibly diverse assemblies.
       score=box*(.65+rng.random()*.7)
       options.append((score,q,dict(x=tx,y=ty,r=r,f=f)))
   if not options:return None
   options.sort(key=lambda o:o[0]);_,q,p=rng.choice(options[:min(18,len(options))]);options=[(q,p)]
  q,p=options[0];polys.append(q);placements[i]=p
 mx=min(x for q in polys for x,y in q);my=min(y for q in polys for x,y in q)
 polys=[[(x-mx,y-my) for x,y in q] for q in polys]
 for p in placements:p['x']-=mx;p['y']-=my
 # Reconstruct in standard piece order, with exact integer coordinates.
 polys=[[(x+p['x'],y+p['y']) for x,y in form(i,p['r'],p['f'])] for i,p in enumerate(placements)]
 edges=boundary(polys)
 # A simple boundary (each vertex degree two) excludes point-only joins and holes.
 neighbors={}
 for a,b in edges:neighbors.setdefault(a,[]).append(b);neighbors.setdefault(b,[]).append(a)
 if any(len(v)!=2 for v in neighbors.values()):return None
 visited=set();todo=[next(iter(neighbors))]
 while todo:
  x=todo.pop()
  if x in visited:continue
  visited.add(x);todo.extend(neighbors[x])
 if len(visited)!=len(neighbors):return None
 occ=occupancy(polys)
 assert len(occ)==128
 return dict(target=polys,solution=[dict(i=i,p=p) for i,p in enumerate(placements)],boundary=edges,width=max(x for p in polys for x,y in p),height=max(y for p in polys for x,y in p),canonical=hashlib.sha256(repr(canonical(occ)).encode()).hexdigest(),seed=seed,perimeter=len(edges))
if __name__=='__main__':
 levels=[];seen=set();seed=2601002
 while len(levels)<50:
  l=one(seed);seed+=1
  if not l or l['canonical'] in seen:continue
  levels.append(l);seen.add(l['canonical'])
 levels.sort(key=lambda l:(l['width']*l['height'],l['perimeter'],l['canonical']))
 names=['斜角','展翼','交錯','折光','山形','風帆','躍動','階梯','轉折','遠行']
 for n,l in enumerate(levels):l.update(id=n+1,name=names[n%10]+'・'+str(n//10+1))
 P.joinpath('levels.json').write_text(json.dumps(levels,ensure_ascii=False,separators=(',',':'))+'\n')
 P.joinpath('levels.js').write_text('window.GAME_LEVELS='+json.dumps(levels,ensure_ascii=False,separators=(',',':'))+';\n')
 print('Generated 50 distinct silhouettes from',seed-2601002,'seeds; each exact area 32')
