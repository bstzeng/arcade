#!/usr/bin/env python3
"""Independent cell-value domain CSP; allows numberless regions of every possible size."""
import json,pathlib,time,hashlib
HERE=pathlib.Path(__file__).parent

def adjacency(n):
 return [[j for j in range(n*n) if abs(i//n-j//n)+abs(i%n-j%n)==1] for i in range(n*n)]
def components(cells,adj):
 cells=set(cells);out=[]
 while cells:
  q=[cells.pop()];s=set(q)
  while q:
   for j in adj[q.pop()]:
    if j in cells:cells.remove(j);s.add(j);q.append(j)
  out.append(s)
 return out

def solve(p):
 n=p['size'];N=n*n;g=p['givens'];adj=adjacency(n)
 # Any clue-free region lies entirely in a connected blank component. This is a completeness bound, not an extra game rule.
 blank=max([len(c) for c in components([i for i,v in enumerate(g) if not v],adj)]+[0]);cap=max(max(g),blank)
 full=(1<<cap)-1;domains=[1<<(g[i]-1) if g[i] else full for i in range(N)];answers=[];nodes=0
 def single(x):return x and not x&(x-1)
 def search(d):
  nonlocal nodes
  nodes+=1
  while True:
   prev=d[:]
   if not all(d):return
   for value in range(1,cap+1):
    bit=1<<(value-1)
    potential=components([i for i in range(N) if d[i]&bit],adj)
    for group in potential:
     if len(group)<value:
      for i in group:d[i]&=~bit
    assigned=components([i for i in range(N) if d[i]==bit],adj)
    for group in assigned:
     if len(group)>value:return
     if len(group)==value:
      for i in group:
       for j in adj[i]:
        if j not in group:d[j]&=~bit
     else:
      reachable=set(group);q=list(group)
      while q:
       for j in adj[q.pop()]:
        if j not in reachable and d[j]&bit:reachable.add(j);q.append(j)
      if len(reachable)<value:return
      if len(reachable)==value:
       for i in reachable:d[i]=bit
   if d==prev:break
  choices=[i for i in range(N) if not single(d[i])]
  if not choices:
   a=[x.bit_length() for x in d]
   if legal(p,a):answers.append(a)
   return
  i=min(choices,key=lambda i:(d[i].bit_count(),-sum(single(d[j]) for j in adj[i])))
  options=d[i]
  while options:
   bit=options&-options;options-=bit;c=d[:];c[i]=bit;search(c)
   if len(answers)>=2:return
 search(domains)
 return answers,nodes,cap

def legal(p,a):
 n=p['size'];N=n*n
 if len(a)!=N or any(not isinstance(v,int) or v<1 or v>N for v in a):return False
 if any(g and g!=a[i] for i,g in enumerate(p['givens'])):return False
 adj=adjacency(n)
 for v in set(a):
  if any(len(group)!=v for group in components([i for i,x in enumerate(a) if x==v],adj)):return False
 return True

def canonical(a,n):
 forms=[]
 for f in [False,True]:
  for k in range(4):
   b=[0]*len(a)
   for i,v in enumerate(a):
    y,x=divmod(i,n)
    if f:x=n-1-x
    for _ in range(k):y,x=x,n-1-y
    b[y*n+x]=v
   forms.append(tuple(b))
 return min(forms)

def main():
 data=json.loads((HERE/'levels.json').read_text());assert len(data)==50;assert [p['id'] for p in data]==list(range(1,51));seen=set();rows=[];start=time.time()
 for p in data:
  assert legal(p,p['solution']);key=(p['size'],canonical(p['solution'],p['size']));assert key not in seen;seen.add(key)
  ans,nodes,cap=solve(p);assert len(ans)==1,(p['id'],len(ans));assert ans[0]==p['solution'];rows.append({'id':p['id'],'solutionCount':1,'nodes':nodes,'completeValueDomain':list(range(1,cap+1)),'cluelessRegions':p['proof']['cluelessRegions']});print(p['id'],nodes,flush=True)
 # Fully blank boards have many solutions; 2x2 permits a clue-free region of size four despite no digit-four clue.
 no_clues={'size':2,'givens':[0,0,0,0]};assert legal(no_clues,[4,4,4,4]);assert len(solve(no_clues)[0])==2
 assert not legal(no_clues,[1,1,2,2]) # Adjacent 1-regions actually merge to size 2 and are invalid.
 assert legal({'size':2,'givens':[0,0,0,3]},[1,3,3,3]) # Region of size one has no given.
 assert len(solve({'size':2,'givens':[1,1,0,0]})[0])==0
 report={'game':'fillomino','levels':50,'uniqueLevels':50,'canonicalDistinctSolutions':50,'cluelessRegionsAllowed':True,'levelsWithCluelessRegions':sum(p['proof']['cluelessRegions']>0 for p in data),'method':'Independent cell-value-domain CSP with connected-component propagation and exhaustive branching to second solution; full clue-free-region size domain','seconds':round(time.time()-start,3),'results':rows}
 report['datasetSHA256']=hashlib.sha256((HERE/'levels.json').read_bytes()).hexdigest()
 (HERE/'verification-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print('PASS',report['seconds'])
if __name__=='__main__':main()
