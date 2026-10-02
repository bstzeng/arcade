"""Reproducible exact Star Battle generator. No solutions are assumed unique.
Run python3 generate.py. Enumerates every row/column/non-touching placement,
then filters all placements by generated connected region quotas.
"""
import random,json,itertools,time, pathlib
R=random.Random(27182818)
OUT=pathlib.Path(__file__).parent

def placements(n,k):
    rows=[t for t in itertools.combinations(range(n),k) if all(b-a>1 for a,b in zip(t,t[1:]))]
    masks=[sum(1<<x for x in t) for t in rows]
    ans=[]; cols=[0]*n
    def dfs(r,prev,chosen):
        if r==n:
            if all(c==k for c in cols):ans.append(tuple(chosen))
            return
        for t,m in zip(rows,masks):
            if m&(prev|(prev<<1)|(prev>>1)):continue
            if any(cols[c]>=k for c in t):continue
            for c in t:cols[c]+=1
            if all(c+n-r-1>=k for c in cols):dfs(r+1,m,chosen+[r*n+c for c in t])
            for c in t:cols[c]-=1
    dfs(0,0,[])
    return ans

def canonical(reg,n,k):
    variants=[]
    for flip in range(2):
      for rot in range(4):
        a=[0]*(n*n)
        for r in range(n):
          for c in range(n):
            x,y=r,c
            if flip:y=n-1-y
            for _ in range(rot):x,y=y,n-1-x
            a[x*n+y]=reg[r*n+c]
        ids={}; norm=[]
        for x in a:
          if x not in ids:ids[x]=len(ids)
          norm.append(ids[x])
        variants.append(','.join(map(str,norm)))
    return f'{n}/{k}/'+min(variants)

def region_map(n,k,sol):
    adj=[[j for j in (i-n,i+n,i-1,i+1) if 0<=j<n*n and abs(i//n-j//n)+abs(i%n-j%n)==1] for i in range(n*n)]
    # k=2: each seed grows until it contains a pair of stars. Other stars can
    # only be claimed while that region has spare quota.
    stars=set(sol); reg=[-1]*(n*n); counts=[0]*n
    seeds=R.sample(list(sol),n) if k==1 else R.sample(list(sol),n)
    for i,s in enumerate(seeds):reg[s]=i;counts[i]=1
    left=n*n-n
    while left:
      candidates=[(i,j) for j in range(n*n) if reg[j]<0 for i in {reg[a] for a in adj[j] if reg[a]>=0} if j not in stars or counts[i]<k]
      if not candidates:return None
      i,j=R.choice(candidates);reg[j]=i;left-=1
      if j in stars:counts[i]+=1
    if counts!=[k]*n:return None
    return reg

def main():
    levels=[];seen=set();audit=[]
    spec=[(5,1,8),(6,1,10),(7,1,12),(8,1,10),(8,2,5),(9,2,5)]
    for n,k,total in spec:
      start=time.time(); allsol=placements(n,k);print('base',n,k,len(allsol),flush=True)
      found=[];tries=0
      while len(found)<total:
        tries+=1; sol=R.choice(allsol);reg=region_map(n,k,sol)
        if reg is None:continue
        sizes=[reg.count(i) for i in range(n)]
        if min(sizes)<2:continue
        key=canonical(reg,n,k)
        if key in seen:continue
        valid=[]
        for p in allsol:
          ct=[0]*n
          for i in p:ct[reg[i]]+=1
          if ct==[k]*n:
            valid.append(p)
            if len(valid)>1:break
        if len(valid)!=1:continue
        seen.add(key)
        # Irregularity and area imbalance are presentation difficulty signals,
        # uniqueness is proven independently from this ranking.
        score=max(sizes)-min(sizes)+sum(reg[i]!=reg[i+1] for i in range(n*n-1) if i%n<n-1)
        found.append(dict(n=n,k=k,regions=reg,solution=list(valid[0]),score=score,proof=dict(solutionCount=1,basePlacements=len(allsol),method='complete row-placement enumeration',canonical=key)))
        print('found',n,k,len(found),'tries',tries,flush=True)
        if tries>300000:raise RuntimeError('generation budget exceeded')
      levels+=sorted(found,key=lambda x:x['score'])
      audit.append(dict(n=n,k=k,trials=tries,seconds=round(time.time()-start,2)))
    for i,l in enumerate(levels):l['id']=i+1;l['tier']='初探' if i<8 else '推理' if i<30 else '進階' if i<40 else '雙星挑戰'
    (OUT/'levels.json').write_text(json.dumps(levels,separators=(',',':'),ensure_ascii=False))
    (OUT/'levels.js').write_text('globalThis.STAR_LEVELS='+json.dumps(levels,separators=(',',':'),ensure_ascii=False)+';\n')
    (OUT/'generation-report.json').write_text(json.dumps(dict(seed=27182818,levels=len(levels),batches=audit),indent=2))
if __name__=='__main__':main()
