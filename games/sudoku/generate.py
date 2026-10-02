"""Deterministic Sudoku generation; uniqueness search and symmetry mask rejection."""
import json,random,itertools,pathlib,hashlib
ROOT=pathlib.Path(__file__).parent
R=random.Random(2026100201)
def units(n,b):
 return [[r*n+c for c in range(n)] for r in range(n)]+[[r*n+c for r in range(n)] for c in range(n)]+[[r*n+c for r in range(br,br+b) for c in range(bc,bc+b)] for br in range(0,n,b) for bc in range(0,n,b)]
def count_solutions(p,n,b,limit=2):
 u=units(n,b); peers=[set().union(*(set(x) for x in u if i in x))-{i} for i in range(n*n)]; a=p[:]; count=0; solution=None; nodes=0
 def search():
  nonlocal count,solution,nodes
  nodes+=1; pick=-1; opts=None
  for i,v in enumerate(a):
   if not v:
    q=set(range(1,n+1))-{a[j] for j in peers[i]}
    if not q:return
    if opts is None or len(q)<len(opts):pick,opts=i,q
  if pick<0:count+=1;solution=a[:];return
  for v in sorted(opts):
   a[pick]=v;search();a[pick]=0
   if count>=limit:return
 search();return count,solution,nodes

def mask_key(p,n,b):
 """Canonical clue mask under digit relabel, D4, band/stack and in-band permutations."""
 permutations=list(itertools.permutations(range(b)))
 colorders=[]
 for blocks in permutations:
  for choices in itertools.product(permutations,repeat=b):
   colorders.append(tuple(block*b+x for block in blocks for x in choices[block]))
 masks=[[int(p[r*n+c]!=0) for c in range(n)] for r in range(n)]
 best=None
 for matrix in [masks,list(map(list,zip(*masks)))]:
  for order in colorders:
   bands=[]
   for br in range(b):
    rows=sorted(''.join(str(matrix[r][c]) for c in order) for r in range(br*b,(br+1)*b))
    bands.append(''.join(rows))
   key=''.join(sorted(bands))
   if best is None or key<best:best=key
 return str(n)+':'+best

def logical(p,n,b):
 a=p[:];u=units(n,b); trace=[]
 while 0 in a:
  candidates={i:set(range(1,n+1))-{a[j] for unit in u if i in unit for j in unit} for i,v in enumerate(a) if not v}
  move=next(((i,next(iter(v)),'naked-single') for i,v in candidates.items() if len(v)==1),None)
  if not move:
   for unit in u:
    for v in range(1,n+1):
     cells=[i for i in unit if i in candidates and v in candidates[i]]
     if len(cells)==1:move=(cells[0],v,'hidden-single');break
    if move:break
  if not move:break
  i,v,t=move;a[i]=v;trace.append({'cell':i,'value':v,'rule':t})
 return trace,a

def generate():
 levels=[];seen=set()
 for k in range(50):
  n,b=(4,2) if k<10 else (9,3)
  tier=0 if k<10 else 1+(k-10)//10
  target= max(4,10-k//2) if n==4 else [0,45,38,32,27][tier]-(k%10)//4
  tries=0
  while True:
   tries+=1
   rows=[g*b+r for g in R.sample(range(b),b) for r in R.sample(range(b),b)]
   cols=[g*b+c for g in R.sample(range(b),b) for c in R.sample(range(b),b)]
   nums=R.sample(range(1,n+1),n)
   solution=[nums[(r*b+r//b+c)%n] for r in rows for c in cols]
   # Randomized full MRV solutions avoid a single base-grid solution family.
   if n==9:
    empty=[0]*(n*n)
    for c,v in enumerate(R.sample(range(1,n+1),n)):empty[c]=v
    _,solution,_=count_solutions(empty,n,b,1)
    # Alternate independent random Latin seed via shuffled initial diagonal boxes.
    if k%2:
     empty=[0]*(n*n)
     for q in range(b):
      vals=R.sample(range(1,n+1),n)
      for j,v in enumerate(vals):empty[(q*b+j//b)*n+q*b+j%b]=v
     _,solution,_=count_solutions(empty,n,b,1)
   p=solution[:];order=R.sample(range(n*n),n*n)
   for i in order:
    if sum(v>0 for v in p)<=target:break
    old=p[i];p[i]=0
    if count_solutions(p,n,b)[0]!=1:p[i]=old
   key=mask_key(p,n,b)
   if key not in seen:seen.add(key);break
   if tries>1000:raise RuntimeError('canonical exhaustion')
  trace,partial=logical(p,n,b)
  count,_,nodes=count_solutions(p,n,b)
  levels.append({'id':k+1,'size':n,'boxRows':b,'boxCols':b,'tier':['迷你入門','九宮基礎','交叉推理','進階挑戰','專家棋局'][tier], 'clues':p,'solution':solution,'givens':sum(v>0 for v in p),'canonicalMask':key,'proof':{'solutions':count,'searchNodes':nodes,'singlesSolved':0 not in partial,'logicalTrace':trace}})
  print(k+1,n,levels[-1]['givens'],len(trace),nodes,flush=True)
 text=json.dumps(levels,ensure_ascii=False,separators=(',',':'))
 (ROOT/'levels.json').write_text(text)
 (ROOT/'levels.js').write_text('window.SUDOKU_LEVELS='+text+';\n')
if __name__=='__main__':generate()
