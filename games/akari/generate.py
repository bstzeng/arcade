"""Generate distinct Akari boards and prove uniqueness by cardinality-constraint search."""
import random,json,pathlib,hashlib
R=random.Random(1783981);ROOT=pathlib.Path(__file__).parent

def geometry(board):
 n=len(board);white=[i for i in range(n*n) if board[i//n][i%n]=='.']; ws=set(white)
 segments=[];visibility={i:{i} for i in white}
 for axis in range(2):
  for a in range(n):
   run=[]
   for b in range(n+1):
    i=a*n+b if axis==0 else b*n+a
    if b<n and i in ws:run.append(i)
    elif run:
     segments.append(run)
     for x in run:visibility[x].update(run)
     run=[]
 return white,segments,visibility

def solve(board,cap=2,randomize=False):
 n=len(board);white,segments,vis=geometry(board); constraints=[(s,0,1) for s in segments]+[(list(v),1,len(v)) for v in vis.values()]
 for r in range(n):
  for c in range(n):
   if board[r][c].isdigit():
    adjacent=[rr*n+cc for rr,cc in ((r-1,c),(r+1,c),(r,c-1),(r,c+1)) if 0<=rr<n and 0<=cc<n and board[rr][cc]=='.']
    v=int(board[r][c]);constraints.append((adjacent,v,v))
 degree={x:sum(x in a for a,_,_ in constraints) for x in white}; solutions=[]; nodes=0
 def dfs(values):
  nonlocal nodes
  nodes+=1
  while True:
   changed=False
   for cells,lo,hi in constraints:
    yes=sum(values.get(x,-1)==1 for x in cells);unknown=[x for x in cells if x not in values]
    if yes>hi or yes+len(unknown)<lo:return
    force=0 if yes==hi else 1 if yes+len(unknown)==lo else None
    if force is not None:
     for x in unknown:values[x]=force;changed=True
   if not changed:break
  if len(values)==len(white):solutions.append(sorted(x for x in white if values[x]));return
  choices=[x for x in white if x not in values]
  if randomize:R.shuffle(choices)
  x=max(choices,key=lambda v:degree[v]); opts=[0,1]
  if randomize:R.shuffle(opts)
  for v in opts:
   dfs(dict(values,**{str(x):v}) if False else {**values,x:v})
   if len(solutions)>=cap:return
 dfs({});return solutions,nodes

def canon(board):
 mats=[];a=board
 for _ in range(4):
  mats.append('/'.join(''.join(r) for r in a));mats.append('/'.join(''.join(reversed(r)) for r in a));a=[list(r) for r in zip(*a[::-1])]
 return min(mats)

levels=[];seen=set();attempts=0
for idx in range(50):
 n=5 if idx<10 else 6 if idx<20 else 7 if idx<35 else 8
 while True:
  attempts+=1
  density=R.uniform(.22,.34)
  board=[['#' if R.random()<density else '.' for _ in range(n)] for _ in range(n)]
  white,_,_=geometry(board)
  if len(white)<n*n*.57:continue
  sols,_=solve(board,1,True)
  if not sols:continue
  bulbs=set(sols[0])
  for r in range(n):
   for c in range(n):
    if board[r][c]=='#':board[r][c]=str(sum(rr*n+cc in bulbs for rr,cc in ((r-1,c),(r+1,c),(r,c-1),(r,c+1)) if 0<=rr<n and 0<=cc<n))
  sols,nodes=solve(board)
  if len(sols)!=1:continue
  positions=[(r,c) for r in range(n) for c in range(n) if board[r][c]!='.'];R.shuffle(positions)
  for r,c in positions:
   old=board[r][c];board[r][c]='#'
   test,_=solve(board)
   if len(test)!=1:board[r][c]=old
  sig=canon(board)
  if sig in seen:continue
  seen.add(sig);sols,nodes=solve(board)
  # Reject tiny bulb counts / dull almost-filled blocks.
  if len(sols[0])<3:continue
  p={'id':idx+1,'size':n,'board':[''.join(r) for r in board],'solution':sols[0],'uniqueSolutions':1,'searchNodes':nodes,'canonicalHash':hashlib.sha256(sig.encode()).hexdigest()}
  levels.append(p);print('Akari',idx+1,n,'bulbs',len(sols[0]),'nodes',nodes,'attempts',attempts,flush=True);break
(ROOT/'levels.json').write_text(json.dumps(levels,separators=(',',':')))
(ROOT/'levels.js').write_text('window.AKARI_LEVELS='+json.dumps(levels,separators=(',',':'))+';\n')
