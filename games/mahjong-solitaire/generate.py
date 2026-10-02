"""Deterministically generate 50 layered, geometrically distinct, solvable tile layouts."""
import json,random,pathlib,hashlib
P=pathlib.Path(__file__).parent
R=random.Random(2601002)
def free(ts,alive,i):
 x,y,z=ts[i]
 if any(j!=i and j in alive and q[2]>z and abs(q[0]-x)<2 and abs(q[1]-y)<2 for j,q in enumerate(ts)):return False
 return not all(any(j in alive and q[2]==z and q[0]==x+d and abs(q[1]-y)<2 for j,q in enumerate(ts)) for d in [-2,2])
def canon(ts):
 out=[]
 for swap in [False,True]:
  for sx in [-1,1]:
   for sy in [-1,1]:
    q=[(sx*(y if swap else x),sy*(x if swap else y),z) for x,y,z in ts];mx=min(x for x,y,z in q);my=min(y for x,y,z in q)
    out.append(tuple(sorted((x-mx,y-my,z) for x,y,z in q)))
 return min(out)
levels=[];seen=set();attempt=0
while len(levels)<50:
 attempt+=1;n=len(levels);rows=3+n//13;maxw=4+2*(n//17);depth=2+n//19
 widths=[R.choice(list(range(2,maxw+1,2))) for _ in range(rows)]
 if n<5:widths=[4 if j in [1,2] else 2 for j in range(rows)]
 ts=[];previous=widths
 for z in range(depth):
  ws=previous if z==0 else [max(0,w-R.choice([0,2,2,4])) for w in previous]
  if z==1 and not any(ws):ws[rows//2]=2
  for y,w in enumerate(ws):
   for x in range(-w+1,w,2):ts.append((x,y*2,z))
  previous=ws
 if len(ts)<16 or len(ts)>76:continue
 key=canon(ts)
 if key in seen:continue
 seen.add(key)
 # Remove arbitrary accessible positions before assigning faces. Retrying a purely
 # geometric dead end yields a legal witness without making matching mirror-trivial.
 solution=None
 for trial in range(300):
  alive=set(range(len(ts)));route=[]
  while alive:
   options=[i for i in sorted(alive) if free(ts,alive,i)]
   if len(options)<2:break
   a=R.sample(options,2);route.append(a);alive.difference_update(a)
  if not alive:solution=route;break
 if solution is None:
  seen.remove(key);continue
 faces=list(range(34));R.shuffle(faces)
 assignments=[faces[(i//2)%34] for i in range(len(solution))];R.shuffle(assignments)
 tiles=[dict(id=i,x=x,y=y,z=z,face=-1) for i,(x,y,z) in enumerate(ts)]
 for a,face in zip(solution,assignments):
  for i in a:tiles[i]['face']=face
 names=['庭院','階台','雲閣','回廊','山門','疊翠','望樓','雙峰','石階','星庭']
 levels.append(dict(id=n+1,name=names[n%10]+' '+str(n//10+1),tiles=tiles,solution=solution,layers=max(t['z'] for t in tiles)+1,canonical=hashlib.sha256(repr(key).encode()).hexdigest()))
P.joinpath('levels.json').write_text(json.dumps(levels,ensure_ascii=False,separators=(',',':'))+'\n')
P.joinpath('levels.js').write_text('window.GAME_LEVELS='+json.dumps(levels,ensure_ascii=False,separators=(',',':'))+';\n')
print('Generated 50 levels;',sum(len(l['tiles']) for l in levels),'tiles;',attempt,'attempts')
