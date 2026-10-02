"""Independent edge-degree CSP counter. Does not import the generator.
This enumerates undirected grid-edge subsets, not paths or stored answers.
"""
import json,itertools,pathlib,time
ROOT=pathlib.Path(__file__).parent

def count_solutions(n,pairs,limit=2):
  edges=[(i,j) for i in range(n*n) for j in (i+1,i+n) if j<n*n and (j==i+n or i//n==j//n)]
  inc=[[] for _ in range(n*n)]
  for e,(a,b) in enumerate(edges):inc[a].append(e);inc[b].append(e)
  labels={v:p for p,ab in enumerate(pairs) for v in ab};need=[1 if v in labels else 2 for v in range(n*n)];nodes=0
  def propagate(s):
    while True:
      change=False;parent=list(range(n*n));tags=[[] for _ in parent]
      for v,p in labels.items():tags[v]=[p]
      def root(a):
        while parent[a]!=a:a=parent[a]
        return a
      for e,(a,b) in enumerate(edges):
        if s[e]!=1:continue
        x,y=root(a),root(b)
        if x==y:return None
        t=tags[x]+tags[y]
        if len(t)>2 or len(set(t))>1:return None
        parent[x]=y;tags[y]=t
      for e,(a,b) in enumerate(edges):
        if s[e]!=-1:continue
        x,y=root(a),root(b);t=tags[x]+tags[y]
        if x==y or len(t)>2 or len(set(t))>1:s[e]=0;change=True
      for v in range(n*n):
        yes=sum(s[e]==1 for e in inc[v]);unknown=[e for e in inc[v] if s[e]<0];d=need[v]-yes
        if d<0 or d>len(unknown):return None
        if unknown and (d==0 or d==len(unknown)):
          for e in unknown:s[e]=1 if d else 0
          change=True
      if not change:return s
  def rec(s):
    nonlocal nodes
    nodes+=1;s=propagate(s)
    if s is None:return 0
    if -1 not in s:return 1
    choices=[]
    for v in range(n*n):
      u=[e for e in inc[v] if s[e]<0]
      if not u:continue
      d=need[v]-sum(s[e]==1 for e in inc[v]);opts=list(itertools.combinations(u,d));choices.append((len(opts),u,opts))
    _,u,opts=min(choices,key=lambda x:x[0]);total=0
    for chosen in opts:
      t=s[:]
      for e in u:t[e]=int(e in chosen)
      total+=rec(t)
      if total>=limit:return limit
    return total
  count=rec([-1]*len(edges));return count,nodes

def check_solution(l):
  n=l['n'];seen=set()
  assert len(l['solution'])==len(l['pairs'])
  for pair,path in zip(l['pairs'],l['solution']):
    assert set((path[0],path[-1]))==set(pair)
    assert len(path)==len(set(path))
    for x in path:assert isinstance(x,int) and 0<=x<n*n and x not in seen;seen.add(x)
    for a,b in zip(path,path[1:]):assert abs(a//n-b//n)+abs(a%n-b%n)==1
  assert len(seen)==n*n

def canonical(l):
  n=l['n'];out=[]
  for f in range(2):
    for r in range(4):
      ps=[]
      for pair in l['pairs']:
        a=[]
        for v in pair:
          x,y=divmod(v,n)
          if f:y=n-y-1
          for _ in range(r):x,y=y,n-x-1
          a.append(x*n+y)
        ps.append(tuple(sorted(a)))
      out.append(str(sorted(ps)))
  return str(n)+'/'+min(out)

def main():
  levels=json.loads((ROOT/'levels.json').read_text());records=[];keys=set();start=time.time()
  for l in levels:
    check_solution(l);key=canonical(l);assert key not in keys;keys.add(key)
    c,nodes=count_solutions(l['n'],l['pairs']);assert c==1,(l['id'],c)
    records.append(dict(level=l['id'],n=l['n'],pairs=len(l['pairs']),count=c,nodes=nodes));print(l['id'],c,nodes,flush=True)
  # Known ambiguous 2x2 single pair adjacent cannot cover all four? It can
  # cover exactly one of the two length-three alternatives on 3x3.
  assert count_solutions(2,[[0,1]])[0]==1
  assert count_solutions(2,[[0,3]])[0]==0
  assert count_solutions(3,[[0,8]])[0]==2
  result=dict(game='numberlink',levels=len(levels),unique=all(x['count']==1 for x in records),symmetryDistinct=len(keys),solver='independent undirected-edge degree CSP with component/terminal constraints',seconds=round(time.time()-start,3),records=records)
  (ROOT/'verification-report.json').write_text(json.dumps(result,indent=2));print(json.dumps({k:v for k,v in result.items() if k!='records'}))
if __name__=='__main__':main()
