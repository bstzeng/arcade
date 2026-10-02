"""Seeded Numberlink full-cover puzzle generator with exhaustive uniqueness proof.
The constructor partitions randomized Hamiltonian paths; acceptance ALWAYS uses
an exhaustive independent path enumeration (cut off after two solutions).
"""
import random,json,time,pathlib
R=random.Random(31415926);OUT=pathlib.Path(__file__).parent
class Budget(Exception):pass

def adjacencies(n):return [[j for j in (i-n,i+n,i-1,i+1) if 0<=j<n*n and abs(i//n-j//n)+abs(i%n-j%n)==1] for i in range(n*n)]

def solve(n,pairs,budget=1000000):
    adj=adjacencies(n); endpoints={x for p in pairs for x in p};nodes=0;results=[];ALL=(1<<(n*n))-1
    def tick():
      nonlocal nodes
      nodes+=1
      if nodes>budget:raise Budget()
    def viable(used,remain):
      available=ALL^used; ends={x for p in remain for x in pairs[p]}
      for x in range(n*n):
        if available>>x&1:
          degree=sum(available>>j&1 for j in adj[x])
          if degree<(1 if x in ends else 2):return False
      # Every connected leftover component must contain terminals; both of
      # each remaining pair must lie in the same leftover component.
      comp={};ci=0
      for x in range(n*n):
        if available>>x&1 and x not in comp:
          stack=[x];comp[x]=ci;has=False
          while stack:
            v=stack.pop();has|=v in ends
            for w in adj[v]:
              if available>>w&1 and w not in comp:comp[w]=ci;stack.append(w)
          if not has:return False
          ci+=1
      return all(comp[a]==comp[b] for a,b in (pairs[p] for p in remain))
    def paths(pid,used,cap):
      a,b=pairs[pid];blocked=used
      for x in endpoints-{a,b}:blocked|=1<<x
      out=[]
      def walk(x,mask,path):
        tick()
        if x==b:out.append(path[:]);return
        # A reachability test prevents exploring a trapped endpoint.
        for y in adj[x]:
          bit=1<<y
          if not (blocked|mask)&bit:
            if len(path)>=cap:continue
            walk(y,mask|bit,path+[y])
      walk(a,1<<a,[a]);return out
    def rec(used,remain,chosen):
      tick()
      if len(results)>=2:return
      if not remain:
        if used==ALL:results.append(chosen.copy())
        return
      if not viable(used,remain):return
      choices=None;pick=None
      # Enumerate complete candidate paths, then exact-cover remaining cells.
      for p in remain:
        others=[q for q in remain if q!=p]
        minimum=sum(abs(pairs[q][0]//n-pairs[q][1]//n)+abs(pairs[q][0]%n-pairs[q][1]%n)+1 for q in others)
        cap=n*n-used.bit_count()-minimum
        opts=paths(p,used,cap)
        if not opts:return
        if choices is None or len(opts)<len(choices):choices=opts;pick=p
        if len(opts)==1:break
      for path in choices:
        bits=sum(1<<i for i in path)
        chosen[pick]=path;rec(used|bits,[q for q in remain if q!=pick],chosen)
        if len(results)>=2:return
      chosen.pop(pick,None)
    rec(0,list(range(len(pairs))),{})
    return results,nodes

def canonical(n,pairs):
    variants=[]
    for f in range(2):
      for rot in range(4):
        a=[]
        for pair in pairs:
          p=[]
          for v in pair:
            x,y=divmod(v,n)
            if f:y=n-1-y
            for _ in range(rot):x,y=y,n-1-x
            p.append(x*n+y)
          a.append(tuple(sorted(p)))
        variants.append(str(sorted(a)))
    return str(n)+'/'+min(variants)

def construct(n,k):
    adj=adjacencies(n);p=[r*n+c for r in range(n) for c in (range(n) if r%2==0 else range(n-1,-1,-1))]
    for _ in range(n*n*12):
      if R.randrange(2):p.reverse()
      opts=[v for v in adj[p[0]] if v!=p[1]]
      if opts:
        j=p.index(R.choice(opts));p=p[j-1::-1]+p[j:]
    lengths=[3]*k
    for _ in range(n*n-3*k):lengths[R.randrange(k)]+=1
    R.shuffle(lengths);paths=[];at=0
    for length in lengths:paths.append(p[at:at+length]);at+=length
    return paths

def main():
    levels=[];seen=set();batches=[]
    for n,k,total in [(4,4,8),(5,6,10),(6,8,12),(6,7,10),(7,8,10)]:
      start=time.time();batch=[];tries=0
      while len(batch)<total:
        tries+=1;paths=construct(n,k);pairs=[[p[0],p[-1]] for p in paths];key=canonical(n,pairs)
        if key in seen:continue
        try:sols,nodes=solve(n,pairs,350000)
        except Budget:continue
        if len(sols)!=1:continue
        seen.add(key);solution=[sols[0][i] for i in range(k)]
        score=nodes+sum(len(p)**2 for p in solution)
        batch.append(dict(n=n,pairs=pairs,solution=solution,score=score,proof=dict(solutionCount=1,nodes=nodes,method='complete simple-path exact cover',canonical=key)))
        print('found',n,k,len(batch),'tries',tries,'nodes',nodes,flush=True)
        if tries>100000:raise RuntimeError('generation budget exceeded')
      levels+=sorted(batch,key=lambda l:l['score']);batches.append(dict(n=n,pairs=k,trials=tries,seconds=round(time.time()-start,2)))
    for i,l in enumerate(levels):l['id']=i+1;l['tier']='初探' if i<8 else '推理' if i<30 else '進階' if i<40 else '大師'
    (OUT/'levels.json').write_text(json.dumps(levels,separators=(',',':'),ensure_ascii=False))
    (OUT/'levels.js').write_text('globalThis.NUMBERLINK_LEVELS='+json.dumps(levels,separators=(',',':'),ensure_ascii=False)+';\n')
    (OUT/'generation-report.json').write_text(json.dumps(dict(seed=31415926,levels=len(levels),batches=batches),indent=2))
if __name__=='__main__':main()
