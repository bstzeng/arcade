#!/usr/bin/env python3
"""Generate point-symmetric tilings; enumerate all legal regions, exact cover."""
import random,json,pathlib,hashlib
ROOT=pathlib.Path(__file__).parent;SEED=493147;rng=random.Random(SEED)
def near(i,n):
 r,c=divmod(i,n);return [rr*n+cc for rr,cc in ((r-1,c),(r+1,c),(r,c-1),(r,c+1)) if 0<=rr<n and 0<=cc<n]
def seeds(center,n):
 y,x=center;return sorted({r*n+c for r in (y//2,(y+1)//2) for c in (x//2,(x+1)//2)})
def reflect(i,center,n):
 r,c=divmod(i,n);rr,cc=center[0]-r,center[1]-c
 return rr*n+cc if 0<=rr<n and 0<=cc<n else -1

def symmetry(cells,n):
 rs=[i//n for i in cells];cs=[i%n for i in cells];center=[min(rs)+max(rs),min(cs)+max(cs)]
 if not all(reflect(i,center,n) in cells for i in cells):return None
 if not set(seeds(center,n))<=cells:return None
 return center

def tiling(n):
 regions=[{i} for i in range(n*n)]
 while True:
  joins=[]
  for j,a in enumerate(regions):
   edge={k for i in a for k in near(i,n)}
   for k in range(j):
    b=regions[k]
    if not edge&b or len(a|b)>min(14,n*n//2):continue
    center=symmetry(a|b,n)
    if center is not None:joins.append((j,k))
  if not joins:break
  j,k=rng.choice(joins);regions[k]|=regions[j];regions.pop(j)
  if len(regions)<=n*n//5 and rng.random()<.25:break
 return regions

def candidates(p,limit=None):
 n=p['size'];centers=p['centers'];mandatory=[set(seeds(c,n)) for c in centers];out=[]
 for k,center in enumerate(centers):
  forbidden=set.union(*[v for j,v in enumerate(mandatory) if j!=k]) if len(centers)>1 else set()
  seed=sum(1<<i for i in mandatory[k]);orbits=[]
  for i in range(n*n):
   j=reflect(i,center,n)
   if j<0 or i>j or i in forbidden or j in forbidden:continue
   orbit=(1<<i)|(1<<j)
   if orbit&seed:continue
   edges=sum(1<<v for v in set(near(i,n)+near(j,n)))
   orbits.append((orbit,edges))
  found={seed};todo=[seed]
  while todo:
   mask=todo.pop()
   for orbit,edges in orbits:
    if mask&orbit or not mask&edges:continue
    new=mask|orbit
    if new not in found:
     found.add(new);todo.append(new)
     if limit and len(found)>limit:raise ValueError('candidate budget')
  out.append(sorted(found))
 return out

def solve(p,limit=None):
 opts=candidates(p,limit);N=p['size']**2;full=(1<<N)-1;found=[];nodes=0
 def dfs(covered,todo,chosen):
  nonlocal nodes
  nodes+=1
  if not todo:
   if covered==full:found.append(chosen.copy())
   return
  k=min(todo,key=lambda k:sum(not m&covered for m in opts[k]));viable=[m for m in opts[k] if not m&covered]
  if not viable:return
  possible=covered
  for j in todo:
   for m in opts[j]:
    if not m&covered:possible|=m
  if possible!=full:return
  for m in viable:
   chosen[k]=m;dfs(covered|m,[j for j in todo if j!=k],chosen)
   if len(found)>=2:return
 dfs(0,list(range(len(opts))),{});return found,nodes,sum(map(len,opts))

def transform(center,n,t):
 r,c=center
 if t>=4:c=2*(n-1)-c
 for _ in range(t%4):r,c=c,2*(n-1)-r
 return r,c

def canonical(p):return min(json.dumps([p['size'],sorted(transform(c,p['size'],t) for c in p['centers'])],separators=(',',':')) for t in range(8))
def main():
 levels=[];seen=set();stats=[]
 for tier,n in enumerate([4,5,5,6,7],1):
  batch=[];tries=0
  while len(batch)<10:
   tries+=1;regions=tiling(n)
   nonrect=sum(len(a)!=(max(i//n for i in a)-min(i//n for i in a)+1)*(max(i%n for i in a)-min(i%n for i in a)+1) for a in regions)
   if nonrect<(0 if tier==1 else 1):continue
   if sum(len(a)==1 for a in regions)>max(2,n):continue
   centers=[symmetry(a,n) for a in regions]
   if not any(c[0]%2 or c[1]%2 for c in centers):continue
   p={'size':n,'tier':tier,'centers':centers,'solution':[next(j for j,a in enumerate(regions) if i in a) for i in range(n*n)]}
   sig=canonical(p)
   if sig in seen:continue
   try:found,nodes,cands=solve(p,30000)
   except ValueError:continue
   if len(found)!=1:continue
   assert all(found[0][k]==sum(1<<i for i in a) for k,a in enumerate(regions))
   seen.add(sig);p['generation']={'nodes':nodes,'candidateRegions':cands,'nonRectangularRegions':nonrect};batch.append(p)
   print('galaxies',tier,len(batch),'tries',tries,'nodes',nodes,'cands',cands,'nonrect',nonrect,flush=True)
  batch.sort(key=lambda p:(p['generation']['candidateRegions'],p['generation']['nodes']))
  levels+=batch;stats.append({'tier':tier,'size':n,'accepted':10,'attempts':tries})
 names=['星光初現','星群漫步','旋轉軌跡','深空巡禮','銀河盡頭']
 for i,p in enumerate(levels):p.update(id=i+1,name=f'{names[p["tier"]-1]} {i%10+1:02d}')
 data=json.dumps(levels,ensure_ascii=False,separators=(',',':'))
 (ROOT/'levels.json').write_text(data+'\n');(ROOT/'levels.js').write_text("(function(r){const x="+data+";if(typeof module!=='undefined')module.exports=x;else r.GALAXIES_LEVELS=x;})(globalThis);\n")
 (ROOT/'generation.json').write_text(json.dumps({'seed':SEED,'method':'Random merges into connected point-symmetric tiles; full connected rotational-orbit region enumeration and exact cover to second solution','canonicalPuzzleCount':len(seen),'tiers':stats},indent=2)+'\n')
if __name__=='__main__':main()
