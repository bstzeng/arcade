#!/usr/bin/env python3
"""Independent row-mask exhaustive counter; never imports generator or JS engine."""
import json,pathlib,hashlib,time
BASE=pathlib.Path(__file__).parent

def valid(p,black):
 n=p['size']; nums=p['numbers']; N=n*n
 if len(black)!=N or not any(not x for x in black):return False
 for r in range(n):
  row=[nums[r*n+c] for c in range(n) if not black[r*n+c]]
  if len(set(row))!=len(row):return False
 for c in range(n):
  col=[nums[r*n+c] for r in range(n) if not black[r*n+c]]
  if len(set(col))!=len(col):return False
 for i,x in enumerate(black):
  if x and ((i%n<n-1 and black[i+1]) or (i//n<n-1 and black[i+n])):return False
 start=next(i for i,x in enumerate(black) if not x);seen={start};stack=[start]
 while stack:
  i=stack.pop();r,c=divmod(i,n)
  for j in ([i-n] if r else [])+([i+n] if r<n-1 else [])+([i-1] if c else [])+([i+1] if c<n-1 else []):
   if not black[j] and j not in seen:seen.add(j);stack.append(j)
 return len(seen)==sum(not x for x in black)

def count(p):
 n=p['size'];nums=p['numbers'];rows=[]
 for r in range(n):
  options=[]
  for m in range(1<<n):
   if m&(m<<1):continue
   kept=[nums[r*n+c] for c in range(n) if not(m>>c&1)]
   if len(set(kept))==len(kept):options.append(m)
  rows.append(options)
 found=[];nodes=0;used=[set() for _ in range(n)]
 def dfs(r,last,masks):
  nonlocal nodes
  nodes+=1
  if len(found)>=2:return
  if r==n:
   black=[bool(masks[y]>>x&1) for y in range(n) for x in range(n)]
   if valid(p,black):found.append(black)
   return
  for mask in rows[r]:
   if mask&last:continue
   cols=[c for c in range(n) if not(mask>>c&1)]
   if any(nums[r*n+c] in used[c] for c in cols):continue
   for c in cols:used[c].add(nums[r*n+c])
   dfs(r+1,mask,masks+[mask])
   for c in cols:used[c].remove(nums[r*n+c])
   if len(found)>=2:return
 dfs(0,0,[])
 return found,nodes

def canonical(p):
 n=p['size'];forms=[]
 for flip in range(2):
  for rot in range(4):
   out=[0]*(n*n)
   for i,v in enumerate(p['numbers']):
    r,c=divmod(i,n);c=n-1-c if flip else c
    for _ in range(rot):r,c=c,n-1-r
    out[r*n+c]=v
   labels={};norm=[]
   for v in out:
    if v not in labels:labels[v]=len(labels)+1
    norm.append(labels[v])
   forms.append(tuple(norm))
 return n,min(forms)

def constraint_canonical(p):
 n=p['size'];nums=p['numbers'];edges=[(i,j) for i in range(n*n) for j in range(i+1,n*n) if nums[i]==nums[j] and (i//n==j//n or i%n==j%n)];forms=[]
 for flip in range(2):
  for rot in range(4):
   mapping=[]
   for i in range(n*n):
    r,c=divmod(i,n);c=n-1-c if flip else c
    for _ in range(rot):r,c=c,n-1-r
    mapping.append(r*n+c)
   forms.append(tuple(sorted(tuple(sorted((mapping[i],mapping[j]))) for i,j in edges)))
 return n,min(forms)

def run():
 levels=json.loads((BASE/'levels.json').read_text());assert len(levels)==50
 seen=set();structures=set();results=[]
 for p in levels:
  k=canonical(p);assert k not in seen,'rotation/mirror/relabel duplicate';seen.add(k)
  structure=constraint_canonical(p);assert structure not in structures,'duplicate equality-constraint graph';structures.add(structure)
  assert len(p['numbers'])==p['size']**2 and all(isinstance(v,int) and 1<=v<=p['size'] for v in p['numbers'])
  sol=[v==2 for v in p['solution']];assert valid(p,sol)
  found,nodes=count(p);assert len(found)==1,(p['id'],len(found));assert found[0]==sol
  assert not valid(p,[False]*len(sol)),'trivial initial board'
  assert not valid(p,[True]*len(sol)),'empty white set'
  results.append({'id':p['id'],'size':p['size'],'solutions':len(found),'rowSearchNodes':nodes,'blackCells':sum(sol),'canonicalSHA256':hashlib.sha256(repr(k).encode()).hexdigest()})
 report={'passed':True,'algorithm':'Independent Python row-mask enumeration with row uniqueness, inter-row black separation, column digit sets; terminal direct-rule flood-fill','levelCount':50,'distinctConstraintGraphsIgnoringAllDigitLabelsAndD4':len(structures),'results':results,'source':'https://www.nikoli.co.jp/en/puzzles/hitori/','levelsSHA256':hashlib.sha256((BASE/'levels.json').read_bytes()).hexdigest()}
 (BASE/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print('Hitori: 50/50 independently unique; rotations/reflections/global numeric relabels excluded; all rule validators pass')
if __name__=='__main__':run()
