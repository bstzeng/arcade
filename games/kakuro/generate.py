#!/usr/bin/env python3
"""Deterministic Kakuro generation, no white-cell givens. Python standard library only."""
import random,json,itertools,functools,pathlib,time,hashlib,sys
BASE=pathlib.Path(__file__).parent
@functools.lru_cache(None)
def patterns(n,s):
 return tuple(p for c in itertools.combinations(range(1,10),n) if sum(c)==s for p in itertools.permutations(c))
def runs_for(mask,h,w):
 runs=[]
 for dr,dc,d in [(0,1,'across'),(1,0,'down')]:
  for r in range(h):
   for c in range(w):
    i=r*w+c
    if not mask[i] or (r>=dr and c>=dc and mask[(r-dr)*w+c-dc]):continue
    cells=[];y,x=r,c
    while y<h and x<w and mask[y*w+x]:cells.append(y*w+x);y+=dr;x+=dc
    if len(cells)<2 or len(cells)>9:return None
    runs.append({'cells':cells,'direction':d,'clue':(r-dr)*w+c-dc})
 return runs

def solve(p,limit=2,maxnodes=20000):
 runs=p['runs'];n=p['height']*p['width'];white=[i for i,v in enumerate(p['mask']) if v]
 domains=[511 if v else 0 for v in p['mask']];tuples=[patterns(len(r['cells']),r['sum']) for r in runs];count=0;nodes=0;first=None
 def rec(dom,poss):
  nonlocal nodes,count,first
  nodes+=1
  if nodes>maxnodes:raise TimeoutError
  changed=True
  while changed:
   changed=False
   for j,r in enumerate(runs):
    cs=r['cells'];ps=[t for t in poss[j] if all(dom[c]&(1<<(v-1)) for c,v in zip(cs,t))]
    if not ps:return
    poss[j]=ps
    for k,c in enumerate(cs):
     m=0
     for t in ps:m|=1<<(t[k]-1)
     m&=dom[c]
     if not m:return
     if m!=dom[c]:dom[c]=m;changed=True
  choices=[i for i in white if dom[i]&(dom[i]-1)]
  if not choices:
   count+=1
   if first is None:first=[m.bit_length() if m else 0 for m in dom]
   return
  c=min(choices,key=lambda i:dom[i].bit_count());bits=dom[c]
  while bits and count<limit:
   b=bits&-bits;bits-=b;d=dom[:];d[c]=b;rec(d,poss[:])
 rec(domains,tuples[:]);return count,first,nodes

def maskgen(rng,h,w,minwhite):
 # An irregular connected mask; each white cell must cross exactly two runs.
 for _ in range(15000):
  a=[int(r>0 and c>0 and rng.random()<(.74 if h>=9 else .83)) for r in range(h) for c in range(w)]
  # Remove one-cell horizontal/vertical fragments until stable.
  changed=True
  while changed:
   changed=False
   for r in range(1,h):
    for c in range(1,w):
     i=r*w+c
     if not a[i]:continue
     if not((c>0 and a[i-1]) or (c+1<w and a[i+1])) or not((r>0 and a[i-w]) or (r+1<h and a[i+w])):a[i]=0;changed=True
  if sum(a)<minwhite:continue
  runs=runs_for(a,h,w)
  if not runs or max(len(r['cells']) for r in runs)>5:continue
  seen={next(i for i,v in enumerate(a) if v)};q=list(seen)
  while q:
   i=q.pop();r,c=divmod(i,w)
   for rr,cc in [(r+1,c),(r-1,c),(r,c+1),(r,c-1)]:
    j=rr*w+cc
    if 0<=rr<h and 0<=cc<w and a[j] and j not in seen:seen.add(j);q.append(j)
  if len(seen)!=sum(a):continue
  if all(a[r*w+c] for r in range(1,h) for c in range(1,w)):continue
  return a,runs
 raise RuntimeError('mask search failed')

def fill(rng,mask,runs,edge_bias=False):
 peers=[set() for _ in mask]
 for r in runs:
  for c in r['cells']:peers[c].update(set(r['cells'])-{c})
 v=[0]*len(mask);white=[i for i,x in enumerate(mask) if x]
 # Favor edge sums while still exploring all 1..9; different cell palettes.
 palette=list(range(1,10));rng.shuffle(palette)
 if rng.random()<(.96 if edge_bias else .6):palette=([1,2,3,4,5,6,7,8,9] if rng.random()<.5 else [9,8,7,6,5,4,3,2,1])
 def rec(left):
  if not left:return True
  c=max(left,key=lambda i:(len({v[j] for j in peers[i] if v[j]}),len(peers[i]),rng.random()))
  used={v[j] for j in peers[c]};vals=[d for d in palette if d not in used]
  # Some randomness without losing useful low/high totals.
  if rng.random()<(.05 if edge_bias else .3):rng.shuffle(vals)
  for d in vals:
   v[c]=d
   if rec(left-{c}):return True
  v[c]=0;return False
 rec(set(white));return v

def canonical_mask(p):
 h,w=p['height'],p['width'];pts=[divmod(i,w) for i,x in enumerate(p['mask']) if x];keys=[]
 for k in range(8):
  out=[]
  for r,c in pts:
   y,x=(c,r) if k&4 else (r,c)
   if k&1:y=-y
   if k&2:x=-x
   out.append((y,x))
  a=min(y for y,x in out);b=min(x for y,x in out)
  keys.append(tuple(sorted((y-a,x-b) for y,x in out)))
 return min(keys)

def generate():
 rng=random.Random(2026100219);levels=[];seen=set();start=time.time()
 if '--resume' in sys.argv and (BASE/'levels.json').exists():
  levels=json.loads((BASE/'levels.json').read_text())
  if len(levels)<32:raise ValueError('--resume requires a checkpoint of at least 32 levels; otherwise regenerate from the start')
  seen={canonical_mask(p) for p in levels};rng.seed(2026100219+len(levels))
 for idx in range(len(levels),50):
  if idx>=32:rng.seed(2026100219+idx)
  tier=idx//10;h,w=[(5,5),(6,6),(7,7),(8,8),(9,9)][tier];minimum=[10,15,21,27,33][tier]
  tries=0
  while True:
   mask,runs=maskgen(rng,h,w,minimum);p={'id':idx+1,'height':h,'width':w,'mask':mask,'runs':runs,'tier':tier+1};sig=canonical_mask(p)
   if sig in seen:continue
   for rep in range(45):
    tries+=1
    if tries%1000==0:print('search',idx+1,tries,flush=True)
    sol=fill(rng,mask,runs,idx>=33)
    for r in runs:r['sum']=sum(sol[c] for c in r['cells'])
    try:count,found,nodes=solve(p,maxnodes=60)
    except TimeoutError:continue
    if count==1:
     p['solution']=found;p['proof']={'solutions':count,'nodes':nodes,'whiteCells':sum(mask),'runs':len(runs),'attempts':tries};break
   else:continue
   break
  seen.add(sig);levels.append(p);print('Kakuro',idx+1,sum(mask),len(runs),'attempts',tries,'nodes',nodes,'secs',round(time.time()-start,1),flush=True)
  (BASE/'levels.json').write_text(json.dumps(levels,separators=(',',':')))
 (BASE/'levels.js').write_text('/* Generated by generate.py; 50 independently counted unique puzzles. */\n(function(r){const levels='+json.dumps(levels,separators=(',',':'))+';if(typeof module!=="undefined")module.exports=levels;else r.KAKURO_LEVELS=levels;})(globalThis);\n')
if __name__=='__main__':generate()
