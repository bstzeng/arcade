#!/usr/bin/env python3
"""Permanent semantic-normalization regressions, independent of generation seeds."""
import copy,json,pathlib
from canonical import canonical
ROOT=pathlib.Path(__file__).parent
fixtures=json.loads((ROOT/'semantic-regression-fixtures.json').read_text())['equivalentLogicStarts']
assert len({canonical(p) for p in fixtures})==1, 'audit fixtures 010/014/015 must collapse after gap(0)=eq normalization'
levels=json.loads((ROOT.parent/'logic-grid/levels.json').read_text())
checks=1
for p in fixtures+levels:
 expected=canonical(p)
 eq=copy.deepcopy(p)
 for c in eq['clues']:
  if c['op']=='gap' and c['d']==0:c['op']='eq';c.pop('d')
 assert canonical(eq)==expected, 'zero gap must equal equality'
 checks+=1
 gap=copy.deepcopy(p)
 for c in gap['clues']:
  if c['op']=='eq':c['op']='gap';c['d']=0
 assert canonical(gap)==expected, 'equality must equal zero gap'
 checks+=1
assert len(levels)==100 and len({canonical(p) for p in levels})==100, 'corpus must contain 100 semantically normalized starts'
checks+=1
report={'passed':True,'checks':checks,'canonicalDistinct':100,'regressions':['Original audit fixtures 010/014/015 collapse','Replace every gap(0) by equality','Replace every equality by gap(0)','100 final starts remain distinct']}
(ROOT/'canonical-regression-verification.json').write_text(json.dumps(report,indent=2));print('PASS',checks,'semantic canonicalization regression checks')
