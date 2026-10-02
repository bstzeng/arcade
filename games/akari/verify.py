"""Independent solver: bitset lighting-cover branching, not generator's cardinality-variable solver."""
import json,pathlib,itertools
ROOT=pathlib.Path(__file__).parent

def solve(p,cap=2):
 n=p['size'];b=p['board'];white=[i for i in range(n*n) if b[i//n][i%n]=='.'];allwhite=sum(1<<i for i in white);ray={}
 for i in white:
  r,c=divmod(i,n);visible=1<<i
  for dr,dc in ((1,0),(-1,0),(0,1),(0,-1)):
   y,x=r+dr,c+dc
   while 0<=y<n and 0<=x<n and b[y][x]=='.':visible|=1<<(y*n+x);y+=dr;x+=dc
  ray[i]=visible
 clues=[]
 for r in range(n):
  for c in range(n):
   if b[r][c].isdigit():
    neighbors=0
    for y,x in ((r-1,c),(r+1,c),(r,c-1),(r,c+1)):
     if 0<=y<n and 0<=x<n and b[y][x]=='.':neighbors|=1<<(y*n+x)
    clues.append((neighbors,int(b[r][c])))
 result=[];nodes=0
 def dfs(on,off,lit):
  nonlocal nodes
  nodes+=1
  while True:
   changed=False
   for around,target in clues:
    used=(around&on).bit_count();available=around&~(on|off)
    if used>target or used+available.bit_count()<target:return
    if used==target and available:off|=available;changed=True
    elif used+available.bit_count()==target and available:
     while available:
      bit=available&-available;available-=bit;i=bit.bit_length()-1
      if off&bit or (ray[i]&on):return
      on|=bit;off|=ray[i]&~bit;lit|=ray[i];changed=True
   if not changed:break
  if lit==allwhite:
   if all((around&on).bit_count()==target for around,target in clues):result.append([i for i in white if on>>i&1])
   return
  best=None
  for i in white:
   if not (lit>>i&1):
    possible=ray[i]&~off
    if not possible:return
    if best is None or possible.bit_count()<best.bit_count():best=possible
  candidates=best
  while candidates:
   bit=candidates&-candidates;candidates-=bit;i=bit.bit_length()-1
   dfs(on|bit,off|(ray[i]&~bit),lit|ray[i])
   if len(result)>=cap:return
   off|=bit
 dfs(0,0,0);return result,nodes

def validate(p,sol):
 n=p['size'];b=p['board'];bulbs=set(sol);lit=set()
 for r,c in itertools.product(range(n),repeat=2):
  i=r*n+c
  if i in bulbs:
   assert b[r][c]=='.';lit.add(i)
   for dr,dc in ((1,0),(-1,0),(0,1),(0,-1)):
    y,x=r+dr,c+dc
    while 0<=y<n and 0<=x<n and b[y][x]=='.':
     assert y*n+x not in bulbs;lit.add(y*n+x);y+=dr;x+=dc
  if b[r][c].isdigit():assert sum(y*n+x in bulbs for y,x in ((r-1,c),(r+1,c),(r,c-1),(r,c+1)) if 0<=y<n and 0<=x<n)==int(b[r][c])
 assert lit=={i for i in range(n*n) if b[i//n][i%n]=='.'}

def canonical(p):
 a=[list(r) for r in p['board']];all=[]
 for _ in range(4):
  all.extend(['/'.join(''.join(r) for r in a),'/'.join(''.join(r[::-1]) for r in a)]);a=[list(r) for r in zip(*a[::-1])]
 return min(all)

if __name__=='__main__':
 levels=json.loads((ROOT/'levels.json').read_text());assert len(levels)==50;assert len({canonical(p) for p in levels})==50
 results=[]
 for p in levels:
  validate(p,p['solution']);solutions,nodes=solve(p);assert len(solutions)==1,(p['id'],len(solutions));assert solutions[0]==p['solution'];results.append({'id':p['id'],'size':p['size'],'solutionCount':1,'independentNodes':nodes,'bulbs':len(solutions[0]),'whiteCells':sum(r.count('.') for r in p['board']),'numberedCells':sum(ch.isdigit() for r in p['board'] for ch in r)})
 (ROOT/'proof.json').write_text(json.dumps({'game':'akari','levels':50,'allUnique':True,'distinctUnderEightBoardSymmetries':True,'method':'Independent bitset illumination-cover solver, branching on bulbs that can illuminate an unlit cell. Exhaustive search up to two solutions, independently checking every rule.', 'results':results},indent=2))
 print('Akari: 50/50 independently proved unique; all solutions satisfy every rule; no dihedral duplicates')
