#!/usr/bin/env python3
"""Check all 625 tiny clue patterns against brute-force full cell assignments."""
import importlib.util,pathlib,itertools,json
HERE=pathlib.Path(__file__).parent
spec=importlib.util.spec_from_file_location('verify',HERE/'verify.py');v=importlib.util.module_from_spec(spec);spec.loader.exec_module(v)
def brute_legal(a):
 seen=set()
 for start in range(4):
  if start in seen:continue
  todo=[start];group={start};seen.add(start)
  while todo:
   i=todo.pop()
   for j in range(4):
    if j not in group and a[j]==a[start] and abs(i//2-j//2)+abs(i%2-j%2)==1:group.add(j);seen.add(j);todo.append(j)
  if len(group)!=a[start]:return False
 return True
legal=[a for a in itertools.product(range(1,5),repeat=4) if brute_legal(a)];tests=0
for g in itertools.product(range(5),repeat=4):
 expected=[a for a in legal if all(not x or a[i]==x for i,x in enumerate(g))];p={'size':2,'givens':list(g)}
 actual,_,cap=v.solve(p);assert len(actual)==min(2,len(expected)),(g,actual,expected,cap)
 if len(expected)==1:assert actual[0]==list(expected[0])
 tests+=1
report={'passed':True,'comparisons':tests,'method':'Every 2x2 clue pattern (0 through 4) against all 256 complete cell-value assignments','legalBlankBoardSolutions':len(legal),'includesClueFreeRegions':True};(HERE/'solver-test-report.json').write_text(json.dumps(report,indent=2)+'\n');print(report)
