#!/usr/bin/env python3
"""Compare independent CSP counts with literal permutation enumeration on tiny boards."""
import importlib.util,pathlib,itertools,json
HERE=pathlib.Path(__file__).parent
spec=importlib.util.spec_from_file_location('verify',HERE/'verify.py');v=importlib.util.module_from_spec(spec);spec.loader.exec_module(v)
D=[(-1,0),(-1,1),(0,1),(1,1),(1,0),(1,-1),(0,-1),(-1,-1)]
perms=list(itertools.permutations(range(4)));tests=0
for last in range(4):
 cells=[i for i in range(4) if i!=last]
 options=[[j for j in range(4) if j!=i] for i in cells]
 for targets in itertools.product(*options):
  nexts=dict(zip(cells,targets));a=[-1]*4
  for i,j in nexts.items():
   dr,dc=j//2-i//2,j%2-i%2;a[i]=D.index((dr,dc))
  for first in range(4):
   if first==last:continue
   g=[0]*4;g[first]=1;g[last]=4;p={'size':2,'arrows':a,'givens':g}
   brute=[x for x in perms if x[0]==first and x[-1]==last and all(nexts[x[k]]==x[k+1] for k in range(3))]
   assert len(v.solve(p)[0])==min(2,len(brute));tests+=1
p={'size':3,'arrows':[4,4,5,1,7,6,2,-1,0],'givens':[0,0,1,0,0,0,0,9,0]};assert len(v.solve(p)[0])==2;tests+=1
p={'size':3,'arrows':[2,3,6,4,6,6,2,2,-1],'givens':[1,3,2,6,5,4,7,8,9]};v.legal(p,p['givens']);assert len(v.solve(p)[0])==1;tests+=1
report={'passed':True,'comparisons':tests,'method':'Exhaustive 2x2 directed graphs against permutation enumeration; 3x3 ambiguity and long-jump fixtures'};(HERE/'solver-test-report.json').write_text(json.dumps(report,indent=2)+'\n');print(report)
