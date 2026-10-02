"""Independent region-first exact placement counter, no generator imports.
Each region's k-subsets are enumerated, then exact row/column quotas and
king-move non-touching constraints are applied. Counts star sets up to two.
"""
import json,pathlib,itertools,time
ROOT=pathlib.Path(__file__).parent

def solve(n,k,regions,limit=2):
  cells=[[i for i,v in enumerate(regions) if v==r] for r in range(n)]
  touch=[sum(1<<j for j in range(n*n) if max(abs(i//n-j//n),abs(i%n-j%n))<=1) for i in range(n*n)]
  opts=[]
  for group in cells:
    options=[]
    for p in itertools.combinations(group,k):
      if any(touch[a]>>b&1 for a,b in itertools.combinations(p,2)):continue
      mask=sum(1<<v for v in p);blocked=0
      for v in p:blocked|=touch[v]
      rr=[0]*n;cc=[0]*n
      for v in p:rr[v//n]+=1;cc[v%n]+=1
      if max(rr+cc)<=k:options.append((mask,blocked,rr,cc))
    opts.append(options)
  nodes=0
  def rec(rem,blocked,rows,cols):
    nonlocal nodes
    nodes+=1
    if not rem:return int(rows==[k]*n and cols==[k]*n)
    candidates=[]
    for r in rem:
      valid=[o for o in opts[r] if not o[0]&blocked and all(rows[i]+o[2][i]<=k and cols[i]+o[3][i]<=k for i in range(n))]
      if not valid:return 0
      candidates.append((len(valid),r,valid))
    _,r,valid=min(candidates,key=lambda t:t[0]);total=0
    for mask,b,rr,cc in valid:
      total+=rec([x for x in rem if x!=r],blocked|b,[a+b for a,b in zip(rows,rr)],[a+b for a,b in zip(cols,cc)])
      if total>=limit:return limit
    return total
  return rec(list(range(n)),0,[0]*n,[0]*n),nodes

def canonical(l):
  n=l['n'];out=[]
  for f in range(2):
    for r in range(4):
      a=[0]*(n*n)
      for v,region in enumerate(l['regions']):
        x,y=divmod(v,n)
        if f:y=n-y-1
        for _ in range(r):x,y=y,n-x-1
        a[x*n+y]=region
      ids={};normal=[]
      for x in a:
        if x not in ids:ids[x]=len(ids)
        normal.append(ids[x])
      out.append(str(normal))
  return f"{n}/{l['k']}/"+min(out)

def validate(l):
  n=l['n'];k=l['k'];reg=l['regions'];stars=l['solution'];assert len(stars)==n*k and len(set(stars))==n*k
  assert sorted(set(reg))==list(range(n))
  for r in range(n):
    group={i for i,v in enumerate(reg) if v==r};assert len(group)>=2;reached={next(iter(group))};stack=list(reached)
    while stack:
      x=stack.pop()
      for y in group-reached:
        if abs(x//n-y//n)+abs(x%n-y%n)==1:reached.add(y);stack.append(y)
    assert reached==group
    assert sum(i//n==r for i in stars)==k
    assert sum(i%n==r for i in stars)==k
    assert sum(reg[i]==r for i in stars)==k
  for a,b in itertools.combinations(stars,2):assert max(abs(a//n-b//n),abs(a%n-b%n))>1

def main():
  assert solve(5,1,[i//5 for i in range(25)])[0]==2
  assert solve(2,1,[0,0,1,1])[0]==0
  levels=json.loads((ROOT/'levels.json').read_text());seen=set();records=[];start=time.time()
  for l in levels:
    validate(l);key=canonical(l);assert key not in seen;seen.add(key)
    c,nodes=solve(l['n'],l['k'],l['regions']);assert c==1,(l['id'],c)
    records.append(dict(level=l['id'],n=l['n'],k=l['k'],count=c,nodes=nodes));print(l['id'],c,nodes,flush=True)
  report=dict(game='star-battle',levels=len(levels),unique=True,symmetryDistinct=len(seen),oneStarLevels=sum(l['k']==1 for l in levels),twoStarLevels=sum(l['k']==2 for l in levels),solver='independent region-subset exact cover with row, column and king-distance constraints',seconds=round(time.time()-start,3),records=records)
  (ROOT/'verification-report.json').write_text(json.dumps(report,indent=2));print(json.dumps({k:v for k,v in report.items() if k!='records'}))
if __name__=='__main__':main()
