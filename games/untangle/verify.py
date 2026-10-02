"""Independent graph/geometry verifier. No generator or JS engine imports."""
import json,math,itertools
from pathlib import Path
P=Path(__file__).parent
levels=json.loads((P/'levels.json').read_text());assert len(levels)==50

def determinant(p,q,r):return p[0]*(q[1]-r[1])+q[0]*(r[1]-p[1])+r[0]*(p[1]-q[1])
def closed_hit(a,b,c,d):
 v=[determinant(a,b,c),determinant(a,b,d),determinant(c,d,a),determinant(c,d,b)]
 if v[0]*v[1]<0 and v[2]*v[3]<0:return True
 for k,p,x,y in [(0,c,a,b),(1,d,a,b),(2,a,c,d),(3,b,c,d)]:
  if abs(v[k])<1e-7 and all(min(x[j],y[j])-1e-7<=p[j]<=max(x[j],y[j])+1e-7 for j in (0,1)):return True
 return False

def segment_distance(p,a,b):
 length=math.dist(a,b)
 if not length:return math.dist(p,a)
 ap=(p[0]-a[0],p[1]-a[1]);ab=(b[0]-a[0],b[1]-a[1]);project=(ap[0]*ab[0]+ap[1]*ab[1])/length
 if project<0:return math.dist(p,a)
 if project>length:return math.dist(p,b)
 return abs(determinant(a,b,p))/length

def inspect(points,edges):
 cross=sum(closed_hit(points[a],points[b],points[c],points[d]) for (a,b),(c,d) in itertools.combinations(edges,2) if len({a,b,c,d})==4)
 overlaps=sum(math.dist(a,b)<5.5 for a,b in itertools.combinations(points,2))
 overlaps+=sum(segment_distance(p,points[a],points[b])<1.2 for a,b in edges for i,p in enumerate(points) if i not in (a,b))
 return cross,overlaps
seen=set();rows=[]
for i,l in enumerate(levels,1):
 n=len(l['start']);edges=l['edges'];m=len(edges);assert l['id']==i and len(l['solution'])==n
 assert (n,m) not in seen;seen.add((n,m)) # Different order/size proves graphs are non-isomorphic.
 assert len({tuple(e) for e in edges})==m
 assert all(len(e)==2 and type(e[0]) is int and type(e[1]) is int and 0<=e[0]<e[1]<n for e in edges)
 reached={0}
 while True:
  enlarged=reached|{b for a,b in edges if a in reached}|{a for a,b in edges if b in reached}
  if enlarged==reached:break
  reached=enlarged
 assert len(reached)==n
 for points in [l['start'],l['solution']]:assert all(len(p)==2 and all(type(v) in (int,float) and math.isfinite(v) and 5<=v<=95 for v in p) for p in points)
 startCross,_=inspect(l['start'],edges);assert startCross>=2
 endCross,degenerate=inspect(l['solution'],edges);assert endCross==0 and degenerate==0
 rows.append({'id':i,'nodes':n,'edges':m,'connected':True,'initialCrossings':startCross,'solutionCrossings':endCross,'degenerateConflicts':degenerate,'solved':True})
report={'game':'untangle','version':1,'count':50,'allSolved':True,'nonIsomorphicGraphCount':len(seen),'rows':rows}
(P/'certification.json').write_text(json.dumps(report,indent=2)+'\n')
print('PASS: 50 connected pairwise non-isomorphic graphs, 50 crossing-free nondegenerate straight-line embeddings; all starts have crossings.')
