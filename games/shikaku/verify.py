#!/usr/bin/env python3
"""Independent clue-first rectangle assignment counter; no engine/generator imports."""
import json,pathlib,hashlib
BASE=pathlib.Path(__file__).parent

def options(p):
 n=p['size'];clues={int(i):v for i,v in p['clues'].items()};out={}
 # Enumerate all four-coordinate rectangles, independently of factor-pair generator.
 for clue,area in clues.items():
  opts=[]
  for top in range(n):
   for bottom in range(top,n):
    for left in range(n):
     for right in range(left,n):
      if (bottom-top+1)*(right-left+1)!=area:continue
      cells=frozenset(r*n+c for r in range(top,bottom+1) for c in range(left,right+1))
      if clue in cells and sum(k in cells for k in clues)==1:opts.append((cells,[top,left,bottom,right]))
  out[clue]=opts
 return out

def valid(p,zs):
 n=p['size'];seen=set();clues={int(i):v for i,v in p['clues'].items()}
 for z in zs:
  if len(z)!=4 or any(type(v)!=int or v<0 or v>=n for v in z):return False
  t,l,b,r=z
  if t>b or l>r:return False
  cells=set(y*n+x for y in range(t,b+1) for x in range(l,r+1));cs=[i for i in clues if i in cells]
  if len(cs)!=1 or clues[cs[0]]!=len(cells) or cells&seen:return False
  seen|=cells
 return len(seen)==n*n

def count(p):
 opts=options(p);solutions=[];nodes=0
 def dfs(remaining,used,zs):
  nonlocal nodes
  nodes+=1
  if len(solutions)>=2:return
  if not remaining:
   if len(used)==p['size']**2:solutions.append(zs)
   return
  available={i:[a for a in opts[i] if not(a[0]&used)] for i in remaining}
  i=min(remaining,key=lambda k:len(available[k]))
  for cells,z in available[i]:
   dfs(remaining-{i},used|cells,zs+[z])
   if len(solutions)>=2:return
 dfs(set(opts),set(),[])
 return solutions,nodes

def canonical(p):
 n=p['size'];forms=[]
 for flip in range(2):
  for rot in range(4):
   out=[0]*(n*n)
   for s,v in p['clues'].items():
    r,c=divmod(int(s),n);c=n-1-c if flip else c
    for _ in range(rot):r,c=c,n-1-r
    out[r*n+c]=v
   forms.append(tuple(out))
 return n,min(forms)

def run():
 levels=json.loads((BASE/'levels.json').read_text());assert len(levels)==50;seen=set();results=[]
 for p in levels:
  k=canonical(p);assert k not in seen,'rotation/mirror duplicate';seen.add(k)
  assert sum(p['clues'].values())==p['size']**2
  assert valid(p,p['solution']);sols,nodes=count(p);assert len(sols)==1,(p['id'],len(sols))
  assert sorted(sols[0])==sorted(p['solution'])
  assert not valid(p,[]) and not valid(p,p['solution']+[p['solution'][0]])
  results.append({'id':p['id'],'size':p['size'],'solutions':len(sols),'clueSearchNodes':nodes,'rectangles':len(p['clues']),'canonicalSHA256':hashlib.sha256(repr(k).encode()).hexdigest()})
 report={'passed':True,'algorithm':'Independent Python four-coordinate rectangle enumeration, clue-first disjoint-set assignment, and terminal full-coverage validator','levelCount':50,'results':results,'source':'https://www.nikoli.co.jp/en/puzzles/shikaku/','levelsSHA256':hashlib.sha256((BASE/'levels.json').read_bytes()).hexdigest()}
 (BASE/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print('Shikaku: 50/50 independently unique; rotations/reflections excluded; full rectangle-cover rules pass')
if __name__=='__main__':run()
