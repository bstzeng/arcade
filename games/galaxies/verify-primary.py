#!/usr/bin/env python3
"""Recheck the saved corpus with the generator's exhaustive primary counter."""
import json,pathlib,hashlib
from generate import solve
ROOT=pathlib.Path(__file__).parent
levels=json.loads((ROOT/'levels.json').read_text())
results=[]
for p in levels:
 found,nodes,candidates=solve(p)
 assert len(found)==1,(p['id'],len(found))
 assert all(found[0][k]==sum(1<<i for i,v in enumerate(p['solution']) if v==k) for k in range(len(p['centers'])))
 results.append({'id':p['id'],'solutionCount':len(found),'nodes':nodes,'candidates':candidates})
assert len(results)==50
report={'game':'galaxies','passed':True,'levels':50,'primary':True,'independentCounter':'verify-independent.cjs','dataSHA256':hashlib.sha256((ROOT/'levels.json').read_bytes()).hexdigest(),'results':results}
(ROOT/'proof.json').write_text(json.dumps(report,indent=2)+'\n')
print('galaxies primary counter: all 50 puzzles have exactly one solution')
