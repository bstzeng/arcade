#!/usr/bin/env python3
"""Independent implementation: imports JSON only, never the JS engine/generator."""
from pathlib import Path
from collections import deque
import json, hashlib
ROOT=Path(__file__).resolve().parent
levels=json.loads((ROOT/'levels.json').read_text())
assert len(levels)==50
assert [l['id'] for l in levels]==list(range(1,51))
assert len({(l['size'],tuple(l['start'])) for l in levels})==50
# Certify all 181,440 3x3 states using an independently implemented BFS.
goal=tuple([1,2,3,4,5,6,7,8,0]);dist={goal:0};queue=deque([goal])
while queue:
 s=queue.popleft();zero=s.index(0);r,c=divmod(zero,3)
 for dr,dc in [(0,1),(1,0),(0,-1),(-1,0)]:
  rr,cc=r+dr,c+dc
  if 0<=rr<3 and 0<=cc<3:
   j=rr*3+cc;a=list(s);a[j],a[zero]=a[zero],a[j];t=tuple(a)
   if t not in dist:dist[t]=dist[s]+1;queue.append(t)
assert len(dist)==181440 and max(dist.values())==31
report=[]
for l in levels:
 n=l['size'];s=l['start'][:];assert sorted(s)==list(range(n*n))
 inv=sum(s[i]>s[j] for i in range(n*n) for j in range(i+1,n*n) if s[i] and s[j])
 assert inv%2==0 if n==3 else (inv+n-s.index(0)//n)%2==1
 for a in l['solution']:
  assert isinstance(a,int) and 0<a<n*n
  j=s.index(a);z=s.index(0)
  assert abs(j%n-z%n)+abs(j//n-z//n)==1,(l['id'],a)
  s[j],s[z]=s[z],s[j]
 assert s==list(range(1,n*n))+[0]
 assert l['referenceLength']==len(l['solution'])
 md=sum(abs(i%n-(v-1)%n)+abs(i//n-(v-1)//n) for i,v in enumerate(l['start']) if v)
 assert l['lowerBound']==md
 if n==3:assert l['optimal']==dist[tuple(l['start'])]==len(l['solution'])
 else:assert l['optimal'] is None and len(l['solution'])>=md
 report.append({'id':l['id'],'size':n,'legalWitnessMoves':len(l['solution']),'certifiedMinimum':l['optimal'],'manhattanLowerBound':md,'passed':True})
assert [l['optimal'] for l in levels[:20]]==list(range(6,26))
assert [l['referenceLength'] for l in levels[20:]]==list(range(14,74,2))
out={'game':'fifteen-puzzle','status':'passed','levels':50,'uniqueStartingStates':50,'independentWitnessesReplayed':50,'allCorrectParity':True,'threeByThreeStatesEnumerated':len(dist),'exactOptimaCertified':20,'fourByFourReferenceOnly':30,'sourceSha256':hashlib.sha256((ROOT/'levels.json').read_bytes()).hexdigest(),'results':report}
(ROOT/'certification.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print('PASS: 50 independent sliding witnesses, proper parity, standard goals, unique starts; 20 exact optima via all 181,440 3×3 states; 30 honest 4×4 reference lengths')
