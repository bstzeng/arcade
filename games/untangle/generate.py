"""Deterministic straight-line planar graph generator, no external dependencies."""
import random, math, json
from pathlib import Path
rng=random.Random(61492026)
D=Path(__file__).parent

def cross(a,b,c):return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])
def intersect(a,b,c,d):return cross(a,b,c)*cross(a,b,d)<0 and cross(c,d,a)*cross(c,d,b)<0

def near(p,a,b):
 dx,dy=b[0]-a[0],b[1]-a[1]
 t=max(0,min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy)))
 return math.dist(p,[a[0]+t*dx,a[1]+t*dy])

levels=[]
for k in range(50):
 n=6+k//5;m=n+k%5+k//10
 while True:
  points=[]
  for tries in range(10000):
   p=[round(rng.uniform(10,90),2),round(rng.uniform(10,90),2)]
   if all(math.dist(p,q)>13 for q in points):points.append(p)
   if len(points)==n:break
  if len(points)<n:continue
  candidates=sorted([(math.dist(points[a],points[b])*(.7+rng.random()*.6),a,b) for a in range(n) for b in range(a+1,n)])
  edges=[]
  for _,a,b in candidates:
   if any(near(p,points[a],points[b])<3.5 for i,p in enumerate(points) if i not in (a,b)):continue
   if any(intersect(points[a],points[b],points[c],points[d]) for c,d in edges if len({a,b,c,d})==4):continue
   edges.append([a,b])
  if len(edges)<m:continue
  shuffled=edges[:];rng.shuffle(shuffled);parents=list(range(n))
  def root(i):
   while parents[i]!=i:i=parents[i]
   return i
  chosen=[]
  for a,b in shuffled:
   ra,rb=root(a),root(b)
   if ra!=rb:parents[ra]=rb;chosen.append([a,b])
  if len(chosen)!=n-1:continue
  extra=[e for e in shuffled if e not in chosen];chosen+=extra[:m-len(chosen)];chosen.sort()
  indices=list(range(n));rng.shuffle(indices)
  start=[[round(50+40*math.cos(2*math.pi*j/n-.5*math.pi),2),round(50+40*math.sin(2*math.pi*j/n-.5*math.pi),2)] for j in indices]
  crossings=sum(intersect(start[a],start[b],start[c],start[d]) for i,(a,b) in enumerate(chosen) for c,d in chosen[i+1:] if len({a,b,c,d})==4)
  if crossings<max(2,k//6):continue
  levels.append({'id':k+1,'edges':chosen,'start':start,'solution':points,'initialCrossings':crossings});break
 print(k+1,n,m,crossings)
(D/'levels.json').write_text(json.dumps(levels,indent=2)+'\n')
(D/'levels.js').write_text('const UNTANGLE_LEVELS='+json.dumps(levels,separators=(',',':'))+';\n')
