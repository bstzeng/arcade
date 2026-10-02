import random,json
from pathlib import Path

def normalize(cells):
 r=min(x[0] for x in cells);c=min(x[1] for x in cells)
 return sorted((x-r,y-c) for x,y in cells)
def orientations(cells):
 out=set()
 for flip in (1,-1):
  a=[(x,y*flip) for x,y in cells]
  for _ in range(4):
   out.add(tuple(normalize(a)));a=[(y,-x) for x,y in a]
 return sorted(out)
def solve(level,limit=1,budget=200000):
 h,w=level['h'],level['w'];blocked=set(level['blocked']);target=frozenset(set(range(h*w))-blocked);pieces=level['pieces'];placements=[]
 for pi,p in enumerate(pieces):
  opts=[]
  for shape in orientations(p['cells']):
   for r in range(h-max(x for x,y in shape)):
    for c in range(w-max(y for x,y in shape)):
     ids=frozenset((r+x)*w+c+y for x,y in shape)
     if not(ids&blocked):opts.append((ids,r,c,[list(v) for v in shape]))
  placements.append(opts)
 answers=[];visits=0
 def search(filled,remaining,path):
  nonlocal visits
  visits+=1
  if visits>budget:raise RuntimeError('budget')
  if not remaining:
   if filled==target:answers.append(path)
   return
  free=target-filled
  best=None
  for cell in free:
   options=[(pi,opt) for pi in remaining for opt in placements[pi] if cell in opt[0] and not opt[0]&filled]
   if not options:return
   if best is None or len(options)<len(best):best=options
  for pi,opt in best:
   search(filled|opt[0],remaining-{pi},path+[dict(piece=pi,row=opt[1],col=opt[2],cells=opt[3])])
   if len(answers)>=limit:return
 search(frozenset(),set(range(len(pieces))),[])
 return answers,visits

def generate():
 rng=random.Random(680041);levels=[];seen=set()
 while len(levels)<50:
  stage=len(levels)//10;h,w=[(3,4),(4,4),(4,5),(5,5),(5,6)][stage]
  blocked=[]
  if stage>=2 and len(levels)%3==0:blocked=[rng.randrange(h*w)]
  remain=set(range(h*w))-set(blocked);parts=[];failed=False
  while remain:
   if len(remain)==1:failed=True;break
   # choose constrained cell to reduce disconnected residue
   seed=min(remain,key=lambda a:sum(b in remain for b in [a-w,a+w,a-1 if a%w else -1,a+1 if a%w<w-1 else -1]))
   part={seed};target=min(rng.choice([3,4,4,5]),len(remain))
   if len(remain)-target==1:target+=1
   while len(part)<target:
    options=set()
    for a in part:
     r,c=divmod(a,w)
     for dr,dc in ((1,0),(-1,0),(0,1),(0,-1)):
      nr,nc=r+dr,c+dc;b=nr*w+nc
      if 0<=nr<h and 0<=nc<w and b in remain and b not in part:options.add(b)
    if not options:break
    part.add(rng.choice(sorted(options)))
   if len(part)<2:failed=True;break
   remain-=part;parts.append(part)
  if failed:continue
  pieces=[];solution=[]
  rng.shuffle(parts)
  for i,part in enumerate(parts):
   pts=[divmod(a,w) for a in part];shape=normalize(pts)
   solution.append(dict(piece=i,row=min(r for r,c in pts),col=min(c for r,c in pts),cells=[list(x) for x in shape]))
   # scramble initial orientation; exact transformations remain available
   pieces.append(dict(id=i,cells=[list(x) for x in rng.choice(orientations(shape))]))
  variants=[]
  grid=[[int(r*w+c in blocked) for c in range(w)] for r in range(h)]
  for flip in (False,True):
   a=[row[::-1] for row in grid] if flip else grid
   for _ in range(4):
    variants.append(json.dumps(a,separators=(',',':')));a=[list(row) for row in zip(*a[::-1])]
  signature=json.dumps([min(variants),sorted([min(orientations(p['cells'])) for p in pieces])])
  if signature in seen:continue
  level=dict(id=len(levels)+1,h=h,w=w,blocked=blocked,pieces=pieces,solution=solution,tier=stage+1)
  try:found,nodes=solve(level)
  except RuntimeError:continue
  if not found:raise AssertionError('partition not solvable')
  level['solverNodes']=nodes;levels.append(level);seen.add(signature)
  print('poly',len(levels),'size',h,w,'pieces',len(pieces),'nodes',nodes,flush=True)
 data=dict(format=1,seed=680041,method='Connected partitions, shuffled orientation, independent exact-cover search. Multiple valid tilings allowed.',levels=levels)
 Path(__file__).with_name('levels.json').write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')))
 return data
if __name__=='__main__':generate()
