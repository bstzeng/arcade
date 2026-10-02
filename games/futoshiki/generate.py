#!/usr/bin/env python3
"""Deterministic unique Futoshiki generation. No subgrid constraints."""
import random,json,pathlib,time,hashlib
BASE=pathlib.Path(__file__).parent

def solve(p,limit=2,maxnodes=150000):
 n=p['size'];groups=[[r*n+c for c in range(n)] for r in range(n)]+[[r*n+c for r in range(n)] for c in range(n)]
 d=[1<<(v-1) if v else (1<<n)-1 for v in p['givens']];count=0;nodes=0;first=None
 def rec(dom):
  nonlocal count,nodes,first
  nodes+=1
  if nodes>maxnodes:raise TimeoutError
  change=True
  while change:
   change=False
   for g in groups:
    singles=[dom[i] for i in g if dom[i] and not dom[i]&(dom[i]-1)]
    if len(singles)!=len(set(singles)):return
    used=0
    for m in singles:used|=m
    for i in g:
     if dom[i]&(dom[i]-1):
      m=dom[i]&~used
      if not m:return
      if m!=dom[i]:dom[i]=m;change=True
    for k in range(n):
     b=1<<k;places=[i for i in g if dom[i]&b]
     if not places:return
     if len(places)==1 and dom[places[0]]!=b:dom[places[0]]=b;change=True
   for a,b in p['less']:
    # a < b: retain values below max(b), and above min(a).
    ma=dom[a]&((1<<(dom[b].bit_length()-1))-1)
    if not ma:return
    mb=dom[b]&~((dom[a]&-dom[a])*2-1)
    if not mb:return
    if ma!=dom[a]:dom[a]=ma;change=True
    if mb!=dom[b]:dom[b]=mb;change=True
  ambiguous=[i for i,m in enumerate(dom) if m&(m-1)]
  if not ambiguous:
   count+=1
   if first is None:first=[m.bit_length() for m in dom]
   return
  i=min(ambiguous,key=lambda i:dom[i].bit_count());bits=dom[i]
  while bits and count<limit:
   b=bits&-bits;bits-=b;d=dom[:];d[i]=b;rec(d)
 rec(d);return count,first,nodes

def latin(rng,n):
 # Randomized backtracking yields Latin squares beyond cyclic row/column relabelings.
 v=[0]*(n*n);rows=[set() for _ in range(n)];cols=[set() for _ in range(n)]
 def rec(left):
  if not left:return True
  i=min(left,key=lambda i:len(set(range(1,n+1))-rows[i//n]-cols[i%n]));r,c=divmod(i,n);ds=list(set(range(1,n+1))-rows[r]-cols[c]);rng.shuffle(ds)
  for d in ds:
   v[i]=d;rows[r].add(d);cols[c].add(d)
   if rec(left-{i}):return True
   rows[r].remove(d);cols[c].remove(d)
  v[i]=0;return False
 rec(set(range(n*n)));return v

def canonical_structure(p):
 n=p['size'];keys=[]
 for k in range(8):
  def tr(i):
   r,c=divmod(i,n)
   if k&4:r,c=c,r
   if k&1:r=n-1-r
   if k&2:c=n-1-c
   return r*n+c
  # Ignore all digit names AND sign orientations: a deliberately stronger test.
  giv=tuple(sorted(tr(i) for i,x in enumerate(p['givens']) if x));edges=tuple(sorted(tuple(sorted((tr(a),tr(b)))) for a,b in p['less']))
  keys.append((giv,edges))
 return min(keys)

def generate():
 rng=random.Random(2026100207);levels=[];seen=set();start=time.time()
 for idx in range(50):
  tier=idx//10;n=[4,5,6,7,7][tier]
  while True:
   sol=latin(rng,n);edges=[]
   for r in range(n):
    for c in range(n):
     i=r*n+c
     for j in ([i+1] if c<n-1 else [])+([i+n] if r<n-1 else []):edges.append((i,j) if sol[i]<sol[j] else (j,i))
   rng.shuffle(edges);p={'id':idx+1,'size':n,'givens':sol[:],'less':edges,'tier':tier+1}
   # Early levels retain anchors; later ones intentionally have sparse givens.
   target=[4,4,3,3,1][tier];order=list(range(n*n));rng.shuffle(order)
   for i in order:
    if sum(bool(v) for v in p['givens'])<=target:break
    old=p['givens'][i];p['givens'][i]=0
    if solve(p)[0]!=1:p['givens'][i]=old
   # Remove redundant inequality clues; uniqueness must survive every accepted change.
   order=p['less'][:];rng.shuffle(order)
   for e in order:
    p['less'].remove(e)
    try:count,_,_=solve(p,maxnodes=20000)
    except TimeoutError:count=2
    if count!=1:p['less'].append(e)
   sig=(n,canonical_structure(p))
   if sig not in seen:break
  seen.add(sig);count,found,nodes=solve(p);assert found==sol and count==1
  p['solution']=sol;p['proof']={'solutions':1,'nodes':nodes,'givens':sum(bool(v) for v in p['givens']),'inequalities':len(p['less'])};levels.append(p)
  print('Futoshiki',idx+1,n,'givens',p['proof']['givens'],'signs',len(p['less']),'nodes',nodes,'secs',round(time.time()-start,1),flush=True)
 (BASE/'levels.json').write_text(json.dumps(levels,separators=(',',':')))
 (BASE/'levels.js').write_text('/* Generated and counted by generate.py. */\n(function(r){const levels='+json.dumps(levels,separators=(',',':'))+';if(typeof module!=="undefined")module.exports=levels;else r.FUTOSHIKI_LEVELS=levels;})(globalThis);\n')
if __name__=='__main__':generate()
