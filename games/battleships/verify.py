#!/usr/bin/env python3
"""Independent whole-ship placement enumerator, not the runtime's row search."""
import json,itertools,time,pathlib
ROOT=pathlib.Path(__file__).parent

def canonical(n,a):
 keys=[]
 for sw,fr,fc in itertools.product(range(2),repeat=3):
  b=[0]*(n*n)
  for r in range(n):
   for c in range(n):
    rr,cc=(c,r) if sw else (r,c)
    if fr:rr=n-1-rr
    if fc:cc=n-1-cc
    b[rr*n+cc]=a[r*n+c]
  keys.append(str(n)+':'+''.join(map(str,b)))
 return min(keys)
def validate(p):
 n=p['n'];a=p['solution'];assert len(a)==n*n and all(v in [0,1] for v in a)
 assert [sum(a[r*n:r*n+n]) for r in range(n)]==p['rows']
 assert [sum(a[r*n+c] for r in range(n)) for c in range(n)]==p['cols']
 assert all(a[int(i)]==v for i,v in p['givens'].items())
 seen=set();lengths=[]
 for i,v in enumerate(a):
  if not v or i in seen:continue
  group={i};todo=[i];seen.add(i)
  while todo:
   j=todo.pop();r,c=divmod(j,n)
   for dr,dc in [(1,0),(-1,0),(0,1),(0,-1)]:
    rr,cc=r+dr,c+dc;k=rr*n+cc
    if 0<=rr<n and 0<=cc<n and a[k] and k not in seen:seen.add(k);group.add(k);todo.append(k)
  assert len({j//n for j in group})==1 or len({j%n for j in group})==1
  lengths.append(len(group))
  for j in group:
   r,c=divmod(j,n)
   for dr in [-1,1]:
    for dc in [-1,1]:
     rr,cc=r+dr,c+dc
     if 0<=rr<n and 0<=cc<n:assert not a[rr*n+cc]
 assert sorted(lengths)==sorted(p['fleet'])

def count(p):
 n=p['n'];fleet=sorted(p['fleet'],reverse=True);options={};given=sum(1<<int(i) for i,v in p['givens'].items() if v);water=sum(1<<int(i) for i,v in p['givens'].items() if not v)
 for length in set(fleet):
  choices=[]
  for r in range(n):
   for c in range(n):
    for vertical in range(1 if length==1 else 2):
     if r+(length if vertical else 1)>n or c+(1 if vertical else length)>n:continue
     cells=[(r+(k if vertical else 0),c+(0 if vertical else k)) for k in range(length)];mask=sum(1<<(rr*n+cc) for rr,cc in cells)
     if mask&water:continue
     halo=0
     for rr,cc in cells:
      for dr in [-1,0,1]:
       for dc in [-1,0,1]:
        if 0<=rr+dr<n and 0<=cc+dc<n:halo|=1<<((rr+dr)*n+cc+dc)
     rows=[sum(rr==i for rr,cc in cells) for i in range(n)];cols=[sum(cc==i for rr,cc in cells) for i in range(n)]
     if any(rows[i]>p['rows'][i] or cols[i]>p['cols'][i] for i in range(n)):continue
     choices.append((mask,halo,rows,cols))
  options[length]=choices
 found=set();nodes=0
 def rec(k,occ,blocked,rs,cs,last):
  nonlocal nodes;nodes+=1
  if (given&blocked)&~occ:return
  if k==len(fleet):
   if rs==p['rows'] and cs==p['cols'] and given&occ==given:found.add(occ)
   return
  length=fleet[k];start=last+1 if k and fleet[k-1]==length else 0;remain=sum(fleet[k+1:])
  for j in range(start,len(options[length])):
   mask,halo,rows,cols=options[length][j]
   if mask&blocked:continue
   rr=[rs[i]+rows[i] for i in range(n)];cc=[cs[i]+cols[i] for i in range(n)]
   if any(rr[i]>p['rows'][i] or cc[i]>p['cols'][i] or rr[i]+remain<p['rows'][i] or cc[i]+remain<p['cols'][i] for i in range(n)):continue
   rec(k+1,occ|mask,blocked|halo,rr,cc,j)
   if len(found)>=2:return
 rec(0,0,0,[0]*n,[0]*n,-1);return len(found),nodes
if __name__=='__main__':
 levels=json.loads((ROOT/'levels.json').read_text());assert len(levels)==50;seen=set();out=[];start=time.time()
 for p in levels:
  validate(p);key=canonical(p['n'],p['solution']);assert key not in seen;seen.add(key);assert key==p['fingerprint'];cnt,nodes=count(p);assert cnt==1,(p['id'],cnt);out.append({'id':p['id'],'solutions':cnt,'states':nodes});print('Battleships independent',p['id'],cnt,nodes,flush=True)
 (ROOT/'independent-proof.json').write_text(json.dumps({'method':'Python whole-ship placement enumerator plus full-rule checker; identical ships ordered, occupied patterns deduplicated; cap 2; all D4 transforms excluded','elapsedSeconds':round(time.time()-start,3),'verifiedLevels':len(out),'levels':out},indent=2))
 print('PASS 50 unique occupied patterns, 50 canonical layouts, independent rule checks')
