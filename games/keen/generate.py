#!/usr/bin/env python3
"""Deterministic arithmetic-cage generator; tuple-level exact CSP counter."""
import random,itertools,json,pathlib,hashlib,time,math
ROOT=pathlib.Path(__file__).parent
SEED=734891
rng=random.Random(SEED)
def neighbors(i,n):
 r,c=divmod(i,n)
 return [rr*n+cc for rr,cc in ((r-1,c),(r+1,c),(r,c-1),(r,c+1)) if 0<=rr<n and 0<=cc<n]
def latin(n):
 a=[0]*(n*n); rows=[set() for _ in range(n)]; cols=[set() for _ in range(n)]
 def dfs():
  best=None; opts=None
  for i,v in enumerate(a):
   if v:continue
   r,c=divmod(i,n); ds=set(range(1,n+1))-rows[r]-cols[c]
   if not ds:return False
   if opts is None or len(ds)<len(opts):best,opts=i,list(ds)
  if best is None:return True
  r,c=divmod(best,n);rng.shuffle(opts)
  for v in opts:
   a[best]=v;rows[r].add(v);cols[c].add(v)
   if dfs():return True
   rows[r].remove(v);cols[c].remove(v);a[best]=0
  return False
 dfs();return a

def cage(cells,a):
 vals=[a[i] for i in cells]
 if len(cells)==1:op='=';target=vals[0]
 else:
  ops=['+','*']
  if len(cells)==2:
   if vals[0]!=vals[1]:ops+=['-','-']
   if max(vals)%min(vals)==0:ops+=['/','/']
  op=rng.choice(ops)
  target=sum(vals) if op=='+' else math.prod(vals) if op=='*' else abs(vals[0]-vals[1]) if op=='-' else max(vals)//min(vals)
 return {'cells':sorted(cells),'op':op,'target':target}
def make(n,a,tier):
 free=set(range(n*n)); cages=[]
 while free:
  start=rng.choice(sorted(free));cells=[start];free.remove(start)
  size=rng.choices([2,3,4],[5,4,1 if tier<3 else 3])[0]
  while len(cells)<size:
   edge=sorted({j for i in cells for j in neighbors(i,n) if j in free})
   if not edge:break
   j=rng.choice(edge);cells.append(j);free.remove(j)
  cages.append(cage(cells,a))
 return cages

def tuples(c,n):
 out=[];cells=c['cells'];op=c['op'];t=c['target']
 for vals in itertools.product(range(1,n+1),repeat=len(cells)):
  if any(vals[x]==vals[y] and (cells[x]//n==cells[y]//n or cells[x]%n==cells[y]%n) for x in range(len(cells)) for y in range(x)):continue
  v=sum(vals) if op=='+' else math.prod(vals) if op=='*' else abs(vals[0]-vals[1]) if op=='-' else max(vals)/min(vals) if op=='/' else vals[0]
  if v==t:out.append(vals)
 return out

def count(p,cap=2):
 n=p['size']; cs=p['cages']; ts=[tuples(c,n) for c in cs];rows=[0]*n;cols=[0]*n;answer=[0]*(n*n);found=[];nodes=0
 def dfs(todo):
  nonlocal nodes
  nodes+=1
  if not todo:found.append(answer[:]);return
  best=None;options=None
  for k in todo:
   viable=[t for t in ts[k] if all(not ((rows[i//n]|cols[i%n])&(1<<v)) for i,v in zip(cs[k]['cells'],t))]
   if not viable:return
   if options is None or len(viable)<len(options):best,options=k,viable
  left=[k for k in todo if k!=best]
  for vals in options:
   for i,v in zip(cs[best]['cells'],vals):rows[i//n]|=1<<v;cols[i%n]|=1<<v;answer[i]=v
   dfs(left)
   for i,v in zip(cs[best]['cells'],vals):rows[i//n]^=1<<v;cols[i%n]^=1<<v;answer[i]=0
   if len(found)>=cap:return
 dfs(list(range(len(cs))));return found,nodes,sum(map(len,ts))

def transform(i,n,t):
 r,c=divmod(i,n)
 if t>=4:c=n-1-c
 for _ in range(t%4):r,c=c,n-1-r
 return r*n+c

def canonical(p,shape=False):
 n=p['size'];vs=[]
 for t in range(8):
  cages=sorted((sorted(transform(i,n,t) for i in c['cells']), '' if shape else c['op'],0 if shape else c['target']) for c in p['cages'])
  vs.append(json.dumps([n,cages],separators=(',',':')))
 return min(vs)

def main():
 levels=[];seen=set();shapes=set();stats=[]
 for tier,n in enumerate([4,4,5,5,6],1):
  batch=[];tries=0
  while len(batch)<10:
   tries+=1;a=latin(n);cs=make(n,a,tier)
   if sum(len(c['cells'])==1 for c in cs)>max(1,n//2):continue
   if not all(any(c['op']==op for c in cs) for op in ('+','*')):continue
   p={'size':n,'tier':tier,'cages':cs,'solution':a}
   sig=canonical(p);shape=canonical(p,True)
   if sig in seen or shape in shapes:continue
   found,nodes,cands=count(p)
   if len(found)!=1:continue
   assert found[0]==a
   seen.add(sig);shapes.add(shape);p['generation']={'nodes':nodes,'candidateTuples':cands};batch.append(p)
   print('keen',tier,len(batch),'tries',tries,'nodes',nodes,flush=True)
  batch.sort(key=lambda p:(p['generation']['nodes'],p['generation']['candidateTuples']))
  levels+=batch;stats.append({'tier':tier,'size':n,'accepted':10,'attempts':tries})
 names=['小徑起點','數字花園','算術漫遊','交錯思路','方格之巔']
 for i,p in enumerate(levels):p.update(id=i+1,name=f'{names[p["tier"]-1]} {i%10+1:02d}')
 (ROOT/'levels.json').write_text(json.dumps(levels,ensure_ascii=False,separators=(',',':'))+'\n')
 (ROOT/'levels.js').write_text("(function(r){const x="+json.dumps(levels,ensure_ascii=False,separators=(',',':'))+";if(typeof module!=='undefined')module.exports=x;else r.KEEN_LEVELS=x;})(globalThis);\n")
 (ROOT/'generation.json').write_text(json.dumps({'seed':SEED,'method':'Random Latin squares and connected arithmetic cages; exhaustive cage-tuple exact search to second solution','canonicalPuzzleCount':len(seen),'canonicalCagePartitionCount':len(shapes),'tiers':stats},indent=2)+'\n')
if __name__=='__main__':main()
