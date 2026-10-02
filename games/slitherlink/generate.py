"""Generate unique Slitherlink puzzles; Python stdlib only."""
import random,json,collections,time
from pathlib import Path

def geometry(h,w):
 edges=[]
 for r in range(h+1):
  for c in range(w): edges.append((r*(w+1)+c,r*(w+1)+c+1))
 for r in range(h):
  for c in range(w+1): edges.append((r*(w+1)+c,(r+1)*(w+1)+c))
 cells=[]
 off=(h+1)*w
 for r in range(h):
  for c in range(w):cells.append([r*w+c,(r+1)*w+c,off+r*(w+1)+c,off+r*(w+1)+c+1])
 verts=[[] for _ in range((h+1)*(w+1))]
 for i,(a,b) in enumerate(edges):verts[a].append(i);verts[b].append(i)
 return edges,cells,verts

def solutions(h,w,clues,limit=2,budget=300000):
 edges,cells,verts=geometry(h,w);answers=[];visits=0
 def connected(x):
  selected=[i for i,v in enumerate(x) if v==1]
  if not selected:return False
  adj=collections.defaultdict(list)
  for i in selected:
   a,b=edges[i];adj[a].append(b);adj[b].append(a)
  seen={next(iter(adj))};q=list(seen)
  for a in q:
   for b in adj[a]:
    if b not in seen:seen.add(b);q.append(b)
  return len(seen)==len(adj)
 def search(x):
  nonlocal visits
  visits+=1
  if visits>budget:raise RuntimeError('solver budget exceeded')
  while True:
   changed=False
   for ids,n in zip(cells,clues):
    if n is None:continue
    ones=sum(x[i]==1 for i in ids);unk=[i for i in ids if x[i]<0]
    if ones>n or ones+len(unk)<n:return
    if unk and (ones==n or ones+len(unk)==n):
     value=0 if ones==n else 1
     for i in unk:x[i]=value
     changed=True
   for ids in verts:
    ones=sum(x[i]==1 for i in ids);unk=[i for i in ids if x[i]<0]
    options=[k for k in (0,2) if ones<=k<=ones+len(unk)]
    if not options:return
    if len(options)==1 and unk:
     n=options[0]
     if ones==n or ones+len(unk)==n:
      val=0 if ones==n else 1
      for i in unk:x[i]=val
      changed=True
   if not changed:break
  unknown=[i for i,v in enumerate(x) if v<0]
  if not unknown:
   if connected(x):answers.append(x)
   return
  # Branch where most adjacent constrained information is present.
  weights=[0]*len(x)
  for ids,n in zip(cells,clues):
   if n is not None:
    score=8-sum(x[i]<0 for i in ids)
    for i in ids:weights[i]+=score
  i=max(unknown,key=lambda k:weights[k])
  for val in (1,0):
   y=x.copy();y[i]=val;search(y)
   if len(answers)>=limit:return
 search([-1]*len(edges))
 return answers,visits

def valid_loop(h,w,region):
 edges,cells,_=geometry(h,w);counts=collections.Counter(e for c in region for e in cells[c]);sol=[int(counts[i]==1) for i in range(len(edges))]
 deg=collections.Counter()
 for i,v in enumerate(sol):
  if v:
   for a in edges[i]:deg[a]+=1
 if any(n!=2 for n in deg.values()):return None
 adj=collections.defaultdict(set)
 for i,v in enumerate(sol):
  if v:a,b=edges[i];adj[a].add(b);adj[b].add(a)
 if not adj:return None
 seen={next(iter(adj))};q=list(seen)
 for a in q:
  for b in adj[a]:
   if b not in seen:seen.add(b);q.append(b)
 return sol if len(seen)==len(adj) else None

def canonical(h,w,clues):
 grid=[clues[r*w:(r+1)*w] for r in range(h)];variants=[]
 for flip in (False,True):
  a=[row[::-1] for row in grid] if flip else grid
  for _ in range(4):
   variants.append(json.dumps(a,separators=(',',':')));a=[list(row) for row in zip(*a[::-1])]
 return min(variants)

def generate():
 rng=random.Random(907135);levels=[];seen=set();attempts=0
 while len(levels)<50:
  attempts+=1;stage=len(levels)//10;h,w=[(3,3),(3,4),(4,4),(4,5),(5,5)][stage]
  region={rng.randrange(h*w)}
  for _ in range(rng.randrange(max(3,h*w//3),h*w-1)):
   frontier=set()
   for p in region:
    r,c=divmod(p,w)
    for dr,dc in ((1,0),(-1,0),(0,1),(0,-1)):
     nr,nc=r+dr,c+dc
     if 0<=nr<h and 0<=nc<w and nr*w+nc not in region:frontier.add(nr*w+nc)
   candidates=list(frontier);rng.shuffle(candidates)
   for c in candidates:
    if valid_loop(h,w,region|{c}) is not None:region.add(c);break
  sol=valid_loop(h,w,region)
  if sol is None or sum(sol)<8:continue
  _,cells,_=geometry(h,w);clues=[sum(sol[i] for i in ids) for ids in cells]
  if max(clues)>3:continue
  try:
   found,_=solutions(h,w,clues)
   if len(found)!=1:continue
   order=list(range(h*w));rng.shuffle(order)
   for i in order:
    old=clues[i];clues[i]=None
    found,_=solutions(h,w,clues)
    if len(found)!=1:clues[i]=old
   key=canonical(h,w,clues)
   if key in seen:continue
   found,nodes=solutions(h,w,clues)
   if len(found)!=1 or found[0]!=sol:raise AssertionError('proof mismatch')
  except RuntimeError:continue
  seen.add(key);levels.append(dict(id=len(levels)+1,h=h,w=w,clues=clues,solution=sol,unique=True,solverNodes=nodes,tier=stage+1))
  print('slither',len(levels),'size',h,w,'clues',sum(c is not None for c in clues),'nodes',nodes,flush=True)
 data=dict(format=1,seed=907135,method='Connected-cell boundary, clue removal, exhaustive edge constraint solver counts up to two distinct single loops.',levels=levels)
 Path(__file__).with_name('levels.json').write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')))
 return data
if __name__=='__main__':generate()
