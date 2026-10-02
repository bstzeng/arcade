#!/usr/bin/env python3
"""Seeded region generation and complete Fillomino region-cover enumeration."""
import json,random,pathlib,time
HERE=pathlib.Path(__file__).parent

def neighbors(n):
 return [[j for j in (i-n if i>=n else -1,i+n if i<n*(n-1) else -1,i-1 if i%n else -1,i+1 if i%n<n-1 else -1) if j>=0] for i in range(n*n)]

def canonical(a,n):
 out=[]
 for f in range(2):
  for t in range(4):
   b=[0]*len(a)
   for i,v in enumerate(a):
    r,c=divmod(i,n)
    if f:c=n-1-c
    for _ in range(t):r,c=c,n-1-r
    b[r*n+c]=v
   out.append(tuple(b))
 return min(out)

def blankmax(g,near):
 rem={i for i,v in enumerate(g) if not v};big=0
 while rem:
  q=[rem.pop()];count=0
  while q:
   i=q.pop();count+=1
   for j in near[i]:
    if j in rem:rem.remove(j);q.append(j)
  big=max(big,count)
 return big

def shapes(n,cap):
 near=neighbors(n);nb=[sum(1<<j for j in a) for a in near];out=[]
 for anchor in range(n*n):
  current={1<<anchor};allowed=~((1<<anchor)-1)
  for size in range(1,cap+1):
   nxt=set()
   for mask in current:
    border=0;m=mask
    while m:
     bit=m&-m;m-=bit;border|=nb[bit.bit_length()-1]
    border&=~mask;out.append((mask,size,border))
    if size<cap:
     options=border&allowed
     while options:
      bit=options&-options;options-=bit;nxt.add(mask|bit)
   current=nxt
 return out

SHAPES={}
def count(p,limit=2,budget=100000):
 n=p['size'];N=n*n;g=p['givens'];near=neighbors(n);cap=max(max(g),blankmax(g,near));cache=SHAPES.setdefault(n,{})
 if cap not in cache:cache[cap]=shapes(n,cap)
 clues=sum(1<<i for i,v in enumerate(g) if v);bymark={k:sum(1<<i for i,v in enumerate(g) if v==k) for k in range(1,cap+1)}
 candidates=[];at=[[] for _ in g]
 for mask,k,border in cache[cap]:
  if mask&clues&~bymark[k]:continue
  ci=len(candidates);candidates.append((mask,k,border));m=mask
  while m:
   bit=m&-m;m-=bit;at[bit.bit_length()-1].append(ci)
 answers=[];nodes=0;allmask=(1<<N)-1
 def dfs(used,forbidden,path):
  nonlocal nodes
  nodes+=1
  if nodes>budget:raise TimeoutError
  if used==allmask:
   arr=[0]*N
   for ci in path:
    mask,k,_=candidates[ci]
    for i in range(N):
     if mask>>i&1:arr[i]=k
   answers.append(arr);return
  best=None;remain=allmask^used
  while remain:
   bit=remain&-remain;remain-=bit;i=bit.bit_length()-1
   poss=[ci for ci in at[i] if not(candidates[ci][0]&used or candidates[ci][0]&forbidden[candidates[ci][1]])]
   if not poss:return
   if best is None or len(poss)<len(best):best=poss
   if len(best)==1:break
  for ci in best:
   mask,k,border=candidates[ci];f=forbidden[:];f[k]|=border
   dfs(used|mask,f,path+[ci])
   if len(answers)>=limit:return
 try:dfs(0,[0]*(cap+1),[])
 except TimeoutError:return None,[],nodes
 return len(answers),answers,nodes

def partition(n,rng):
 near=neighbors(n);N=n*n;groups=[];empty=set(range(N))
 while empty:
  seed=rng.choice(sorted(empty));empty.remove(seed);g={seed};target=rng.choices([1,2,3,4,5],[1,3,4,4,2])[0]
  while len(g)<target:
   border={j for i in g for j in near[i] if j in empty}
   if not border:break
   j=rng.choice(sorted(border));g.add(j);empty.remove(j)
  groups.append(g)
 changed=True
 while changed:
  changed=False
  for a in range(len(groups)):
   for b in range(a):
    if len(groups[a])==len(groups[b]) and any(j in groups[b] for i in groups[a] for j in near[i]):
     groups[b]|=groups[a];groups.pop(a);changed=True;break
   if changed:break
 ans=[0]*N
 for g in groups:
  for i in g:ans[i]=len(g)
 return ans,groups

def main():
 rng=random.Random(4029255);levels=[];seen=set();start=time.time()
 for ix in range(50):
  n=4 if ix<12 else 5 if ix<32 else 6;near=neighbors(n)
  while True:
   ans,regions=partition(n,rng)
   if max(ans)<=6 and len(regions)>=4 and canonical(ans,n) not in seen:break
  p={'id':ix+1,'size':n,'givens':ans[:],'solution':ans,'tier':'入門' if ix<12 else '進階' if ix<32 else '挑戰'}
  cells=list(range(n*n));rng.shuffle(cells)
  for i in cells:
   v=p['givens'][i];p['givens'][i]=0
   if blankmax(p['givens'],near)>5:p['givens'][i]=v;continue
   c,_,_=count(p,budget=100000)
   if c!=1:p['givens'][i]=v
  c,sol,nodes=count(p,budget=2000000);assert c==1 and sol[0]==ans
  seen.add(canonical(ans,n));p['proof']={'solutionCount':c,'nodes':nodes,'cluelessRegions':sum(not any(p['givens'][i] for i in g) for g in regions),'maxBlankComponent':blankmax(p['givens'],near)};levels.append(p)
  print(ix+1,n,sum(bool(v) for v in p['givens']),nodes,'clueless',p['proof']['cluelessRegions'],flush=True)
 text=json.dumps(levels,ensure_ascii=False,separators=(',',':'));(HERE/'levels.json').write_text(text+'\n');(HERE/'levels.js').write_text('const FILLOMINO_LEVELS = '+text+';\n');print('seconds',time.time()-start)
if __name__=='__main__':main()
