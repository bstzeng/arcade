#!/usr/bin/env python3
"""Independent verifier: ordinal-position CSP with arc consistency and all-different."""
import pathlib,json,time,hashlib
HERE=pathlib.Path(__file__).parent

def solve(p):
 n=p['size'];N=n*n;dirs=[(-1,0),(-1,1),(0,1),(1,1),(1,0),(1,-1),(0,-1),(-1,-1)]
 forward=[];back=[0]*N
 for i,a in enumerate(p['arrows']):
  mask=0
  if a>=0:
   dr,dc=dirs[a];r,c=divmod(i,n);r+=dr;c+=dc
   while 0<=r<n and 0<=c<n:mask|=1<<(r*n+c);r+=dr;c+=dc
  forward.append(mask)
  for j in range(N):
   if mask>>j&1:back[j]|=1<<i
 dom=[(1<<N)-1 for _ in range(N)]
 for i,v in enumerate(p['givens']):
  if v:dom[v-1]=1<<i
 dom[-1]&=sum(1<<i for i,a in enumerate(p['arrows']) if a==-1)
 nodes=0;solutions=[]
 def union(mask,table):
  out=0
  while mask:
   bit=mask&-mask;mask-=bit;out|=table[bit.bit_length()-1]
  return out
 def search(d):
  nonlocal nodes
  nodes+=1
  while True:
   prev=d[:];fixed=0
   for x in d:
    if not x:return
    if not x&(x-1):
     if fixed&x:return
     fixed|=x
   for k in range(N):
    if d[k]&(d[k]-1):d[k]&=~fixed
   for k in range(N-1):
    d[k+1]&=union(d[k],forward);d[k]&=union(d[k+1],back)
   if d==prev:break
  candidates=[k for k,x in enumerate(d) if x&(x-1)]
  if not candidates:
   a=[0]*N
   for k,x in enumerate(d):a[x.bit_length()-1]=k+1
   solutions.append(a);return
  k=min(candidates,key=lambda k:d[k].bit_count());opts=d[k]
  while opts:
   bit=opts&-opts;opts-=bit;child=d[:];child[k]=bit;search(child)
   if len(solutions)>=2:return
 search(dom)
 return solutions,nodes

def canonical(a,n):
 forms=[]
 for reverse in [False,True]:
  for flip in [False,True]:
   for turns in range(4):
    b=[0]*len(a)
    for r in range(n):
     for c in range(n):
      y,x=r,n-1-c if flip else c
      for _ in range(turns):y,x=x,n-1-y
      b[y*n+x]=len(a)+1-a[r*n+c] if reverse else a[r*n+c]
    forms.append(tuple(b))
 return min(forms)

def legal(p,a):
 n=p['size'];N=n*n;assert sorted(a)==list(range(1,N+1));loc={v:i for i,v in enumerate(a)}
 assert all(not g or a[i]==g for i,g in enumerate(p['givens']))
 dirs=[(-1,0),(-1,1),(0,1),(1,1),(1,0),(1,-1),(0,-1),(-1,-1)]
 for value in range(1,N):
  i,j=loc[value],loc[value+1];r,c=divmod(i,n);y,x=divmod(j,n);dr,dc=y-r,x-c
  assert dr==0 or dc==0 or abs(dr)==abs(dc)
  assert dirs[p['arrows'][i]]==((dr>0)-(dr<0),(dc>0)-(dc<0))
 assert p['arrows'][loc[N]]==-1

def main():
 data=json.loads((HERE/'levels.json').read_text());assert len(data)==50;assert [p['id'] for p in data]==list(range(1,51));seen=set();rows=[];start=time.time()
 for p in data:
  legal(p,p['solution']);canon=(p['size'],canonical(p['solution'],p['size']));assert canon not in seen;seen.add(canon)
  sol,nodes=solve(p);assert len(sol)==1,(p['id'],len(sol));assert sol[0]==p['solution'];rows.append({'id':p['id'],'solutionCount':len(sol),'nodes':nodes,'givens':sum(bool(x) for x in p['givens'])});print(p['id'],nodes,flush=True)
 assert all(p['proof']['longJumps']>0 for p in data)
 assert len(solve({'size':3,'arrows':[4,4,5,1,7,6,2,-1,0],'givens':[0,0,1,0,0,0,0,9,0]})[0])==2
 # Independent method must detect ambiguity and contradictions, including long-ray transitions.
 assert len(solve({'size':2,'arrows':[2,4,0,-1],'givens':[1,0,0,4]})[0])==0
 report={'game':'signpost','levels':50,'uniqueLevels':50,'canonicalDistinctSolutions':50,'equivalencesChecked':'D4 rotations/reflections plus reversing the ordinal path','method':'Independent ordinal-position domain CSP; exact arc consistency, all-different and exhaustive branching to second solution','seconds':round(time.time()-start,3),'results':rows}
 report['datasetSHA256']=hashlib.sha256((HERE/'levels.json').read_bytes()).hexdigest()
 (HERE/'verification-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print('PASS',report['seconds'])
if __name__=='__main__':main()
