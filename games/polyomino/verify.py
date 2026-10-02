"""Independent state audit plus exhaustive solver; no browser required."""
import json,collections,importlib.util
from pathlib import Path
P=Path(__file__).resolve().parent
name=P.name
data=json.loads((P/'levels.json').read_text())
assert len(data['levels'])==50
spec=importlib.util.spec_from_file_location('generation',P/'generate.py');gen=importlib.util.module_from_spec(spec);spec.loader.exec_module(gen)
seen=set();actions=0
for k,l in enumerate(data['levels'],1):
 assert l['id']==k and l['h']>0 and l['w']>0
 h,w=l['h'],l['w']
 if name=='slitherlink':
  # Recreate edge endpoints and cell boundaries independently of browser engine.
  ed=[((r,c),(r,c+1)) for r in range(h+1) for c in range(w)]+[((r,c),(r+1,c)) for r in range(h) for c in range(w+1)]
  assert len(l['solution'])==len(ed) and set(l['solution'])<={0,1}
  chosen={frozenset(ed[i]) for i,v in enumerate(l['solution']) if v};degree=collections.Counter(p for e in chosen for p in e)
  assert chosen and all(v==2 for v in degree.values())
  graph=collections.defaultdict(set)
  for e in chosen:
   a,b=tuple(e);graph[a].add(b);graph[b].add(a)
  visited={next(iter(graph))};q=list(visited)
  for a in q:
   for b in graph[a]:
    if b not in visited:visited.add(b);q.append(b)
  assert len(visited)==len(graph)
  for r in range(h):
   for c in range(w):
    n=l['clues'][r*w+c]
    edges=[((r,c),(r,c+1)),((r+1,c),(r+1,c+1)),((r,c),(r+1,c)),((r,c+1),(r+1,c+1))]
    if n is not None:assert sum(frozenset(e) in chosen for e in edges)==n
  solutions,nodes=gen.solutions(h,w,l['clues']);assert len(solutions)==1 and solutions[0]==l['solution']
  signature=gen.canonical(h,w,l['clues']);actions+=sum(l['solution'])
 else:
  blocked=set(l['blocked']);occupied=set();assert len(blocked)==len(l['blocked'])
  assert len(l['solution'])==len(l['pieces'])
  used=set()
  for p in l['solution']:
   i=p['piece'];assert i not in used and 0<=i<len(l['pieces']);used.add(i)
   shape=[tuple(a) for a in p['cells']];source=[tuple(a) for a in l['pieces'][i]['cells']]
   assert len(set(shape))==len(shape) and tuple(shape) in gen.orientations(source)
   conn={shape[0]};todo=list(conn)
   for r,c in todo:
    for dr,dc in ((1,0),(-1,0),(0,1),(0,-1)):
     b=(r+dr,c+dc)
     if b in shape and b not in conn:conn.add(b);todo.append(b)
   assert len(conn)==len(shape)
   for r,c in shape:
    rr,cc=r+p['row'],c+p['col'];assert 0<=rr<h and 0<=cc<w
    cell=rr*w+cc;assert cell not in occupied|blocked;occupied.add(cell)
  assert occupied|blocked==set(range(h*w))
  solutions,nodes=gen.solve(l);assert solutions
  grid=[[int(r*w+c in blocked) for c in range(w)] for r in range(h)];variants=[]
  for flip in (False,True):
   a=[row[::-1] for row in grid] if flip else grid
   for _ in range(4):variants.append(json.dumps(a));a=[list(row) for row in zip(*a[::-1])]
  signature=json.dumps([min(variants),sorted(min(gen.orientations(p['cells'])) for p in l['pieces'])]);actions+=len(l['pieces'])
 assert signature not in seen;seen.add(signature)
print(f'{name}: 50 distinct verified levels; {actions} witness actions. '+('50 unique solutions.' if name=='slitherlink' else 'Multiple valid tilings allowed.'))
