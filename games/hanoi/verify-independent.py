#!/usr/bin/env python3
"""Independent certification; JSON-only input, explicit stacks and tuple-state BFS."""
from pathlib import Path
from collections import deque
from itertools import permutations
import json, hashlib
ROOT=Path(__file__).resolve().parent
levels=json.loads((ROOT/'levels.json').read_text())
assert len(levels)==50 and [l['id'] for l in levels]==list(range(1,51))
canonical=set(); tables={};report=[]
for n in range(3,9):
 goal=(2,)*n;dist={goal:0};q=deque([goal])
 while q:
  s=q.popleft();stacks=[[i+1 for i,p in enumerate(s) if p==peg] for peg in range(3)]
  for source in range(3):
   if not stacks[source]:continue
   rank=min(stacks[source])
   for target in range(3):
    if source==target or (stacks[target] and min(stacks[target])<rank):continue
    after=list(s);after[rank-1]=target;after=tuple(after)
    if after not in dist:dist[after]=dist[s]+1;q.append(after)
 assert len(dist)==3**n and max(dist.values())==2**n-1
 tables[n]=dist
for l in levels:
 n=l['discs'];s=l['start'][:];assert len(s)==n and all(type(x)==int and 0<=x<3 for x in s)
 # Stronger than target-aware uniqueness: ignore peg names altogether.
 key=min(tuple(p[x] for x in s) for p in permutations(range(3)))
 assert key not in canonical,'Peg relabel duplicate';canonical.add(key)
 assert l['target']==2
 for a in l['solution']:
  rank,source,target=a['disc'],a['from'],a['to']
  assert type(rank)==int and 1<=rank<=n and source!=target and 0<=source<3 and 0<=target<3
  stacks=[[i+1 for i,p in enumerate(s) if p==peg] for peg in range(3)]
  assert stacks[source] and min(stacks[source])==rank
  assert not stacks[target] or rank<min(stacks[target])
  s[rank-1]=target
 assert s==[2]*n
 optimum=tables[n][tuple(l['start'])]
 assert l['optimal']==len(l['solution'])==optimum
 classic=len(set(l['start']))==1
 assert l['layout']==('classic' if classic else 'challenge')
 if classic:assert optimum==2**n-1
 report.append({'id':l['id'],'discs':n,'layout':l['layout'],'minimumMoves':optimum,'legalWitnessMoves':len(l['solution']),'statesExhaustivelyEnumerated':3**n,'passed':True})
assert sum(l['layout']=='classic' for l in levels)==6
out={'game':'hanoi','status':'passed','levels':50,'uniqueBeyondPegRelabeling':50,'classicFullTowerStarts':6,'intermediateLayoutChallenges':44,'independentWitnessesReplayed':50,'exactOptimaCertified':50,'allStatesEnumerated':sum(3**n for n in range(3,9)),'sourceSha256':hashlib.sha256((ROOT/'levels.json').read_bytes()).hexdigest(),'results':report}
(ROOT/'certification.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print('PASS: 50 independent Hanoi witnesses, exact shortest paths, legal top-disc moves, 50 peg-relabel-distinct layouts; all 9,828 states across 3–8 discs enumerated')
