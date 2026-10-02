"""Independent certificate checker: 2-D flood fill plus column reconstruction.
No imports from generator/JS rule engine; built-in Python only.
"""
import json
from pathlib import Path
P=Path(__file__).parent
levels=json.loads((P/'levels.json').read_text())
assert len(levels)==50
seen=set();rows=[]
def signature(a):
 names={};out=[]
 for v in a:
  if v not in names:names[v]=len(names)+1
  out.append(names[v])
 return tuple(out)
for number,l in enumerate(levels,1):
 w,h,c=l['width'],l['height'],l['colors'];assert l['id']==number and w>=5 and h>=5 and 3<=c<=4
 assert len(l['start'])==w*h and all(type(v) is int and 1<=v<=c for v in l['start'])
 mirror=[l['start'][y*w+x] for y in range(h) for x in reversed(range(w))]
 key=(w,h,min(signature(l['start']),signature(mirror)));assert key not in seen;seen.add(key)
 board=[l['start'][y*w:(y+1)*w] for y in range(h)];removed=[]
 for action in l['solution']:
  assert type(action) is int and 0<=action<w*h
  y,x=divmod(action,w);color=board[y][x];assert color
  component={(y,x)};todo=[(y,x)]
  while todo:
   yy,xx=todo.pop()
   for ny,nx in [(yy-1,xx),(yy+1,xx),(yy,xx-1),(yy,xx+1)]:
    if 0<=ny<h and 0<=nx<w and board[ny][nx]==color and (ny,nx) not in component:component.add((ny,nx));todo.append((ny,nx))
  assert len(component)>=2;removed.append(len(component))
  for yy,xx in component:board[yy][xx]=0
  columns=[]
  for xx in range(w):
   col=[board[yy][xx] for yy in range(h) if board[yy][xx]]
   if col:columns.append([0]*(h-len(col))+col)
  columns.extend([[0]*h for _ in range(w-len(columns))])
  board=[[columns[xx][yy] for xx in range(w)] for yy in range(h)]
 assert not any(v for row in board for v in row) and sum(removed)==w*h
 rows.append({'id':number,'width':w,'height':h,'colors':c,'moves':len(removed),'removedGroups':removed,'remaining':0,'solved':True})
report={'game':'samegame','version':1,'count':50,'allSolved':True,'distinctModuloColorNamesAndHorizontalReflection':len(seen),'rows':rows}
(P/'certification.json').write_text(json.dumps(report,indent=2)+'\n')
print('PASS: 50 independently replayed clearing certificates; 50 color/reflection-distinct boards; every removed group has at least 2 tiles.')
