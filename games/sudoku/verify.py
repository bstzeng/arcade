"""Independent exhaustive uniqueness and symmetry verifier. No generator imports."""
import json,pathlib,itertools,hashlib
ROOT=pathlib.Path(__file__).parent

def all_solutions(board,n,side):
 full=(1<<n)-1; rows=[0]*n;cols=[0]*n;boxes=[0]*n;grid=board[:];result=[];nodes=0
 def box(i):return (i//n//side)*side+(i%n//side)
 for i,v in enumerate(grid):
  if v:
   r,c=i//n,i%n;b=box(i);bit=1<<(v-1)
   assert not (rows[r]&bit or cols[c]&bit or boxes[b]&bit),'invalid givens'
   rows[r]|=bit;cols[c]|=bit;boxes[b]|=bit
 def recurse():
  nonlocal nodes
  nodes+=1;best=None
  for i,v in enumerate(grid):
   if v:continue
   bits=full&~(rows[i//n]|cols[i%n]|boxes[box(i)])
   if not bits:return
   if best is None or bits.bit_count()<best[1].bit_count():best=i,bits
  if best is None:result.append(grid[:]);return
  i,bits=best;r,c=i//n,i%n;b=box(i)
  while bits:
   v=bits&-bits;bits-=v;grid[i]=v.bit_length();rows[r]|=v;cols[c]|=v;boxes[b]|=v
   recurse();grid[i]=0;rows[r]^=v;cols[c]^=v;boxes[b]^=v
   if len(result)>=2:return
 recurse();return result,nodes

def canonical_mask(board,n,b):
 # Enumerate every legal column order; sort rows within bands and then bands.
 per=list(itertools.permutations(range(b)));best=None
 for transpose in (False,True):
  for stacks in per:
   for inside in itertools.product(per,repeat=b):
    columns=[s*b+c for s in stacks for c in inside[s]]
    chunks=[]
    for band in range(b):
     rowstrings=[]
     for r in range(band*b,band*b+b):
      rowstrings.append(''.join('1' if board[c*n+r if transpose else r*n+c] else '0' for c in columns))
     chunks.append(''.join(sorted(rowstrings)))
    mask=''.join(sorted(chunks))
    best=mask if best is None or mask<best else best
 return str(n)+':'+best

def check(level):
 n=level['size'];b=level['boxRows'];assert n in (4,9) and b*b==n and level['boxCols']==b
 p=level['clues'];s=level['solution'];assert len(p)==len(s)==n*n
 assert all(type(v)==int and 0<=v<=n for v in p)
 assert all(type(v)==int and 1<=v<=n for v in s)
 assert all(not v or v==s[i] for i,v in enumerate(p));assert sum(bool(v) for v in p)==level['givens']
 answers,nodes=all_solutions(p,n,b);assert len(answers)==1,'not uniquely solvable';assert answers[0]==s
 key=canonical_mask(p,n,b);assert key==level['canonicalMask']
 # Independently replay every claimed simple logical step.
 u=[[r*n+c for c in range(n)] for r in range(n)]+[[r*n+c for r in range(n)] for c in range(n)]
 u += [[(br+y)*n+bc+x for y in range(b) for x in range(b)] for br in range(0,n,b) for bc in range(0,n,b)]
 a=p[:]
 for step in level['proof']['logicalTrace']:
  i,v,rule=step['cell'],step['value'],step['rule'];assert a[i]==0
  candidates={j:set(range(1,n+1))-{a[k] for unit in u if j in unit for k in unit} for j in range(n*n) if not a[j]}
  if rule=='naked-single':assert candidates[i]=={v}
  elif rule=='hidden-single':assert any(i in unit and [j for j in unit if j in candidates and v in candidates[j]]==[i] for unit in u)
  else:assert False,'unknown rule'
  assert v==s[i];a[i]=v
 assert level['proof']['singlesSolved']==(0 not in a)
 return {'id':level['id'],'size':n,'givens':level['givens'],'solutions':len(answers),'independentSearchNodes':nodes,'canonicalSHA256':hashlib.sha256(key.encode()).hexdigest(),'singlesSolved':0 not in a,'logicalSteps':len(level['proof']['logicalTrace'])}

def main():
 raw=(ROOT/'levels.json').read_bytes();levels=json.loads(raw);assert json.loads((ROOT/'levels.js').read_text().removeprefix('window.SUDOKU_LEVELS=').strip().removesuffix(';'))==levels;assert len(levels)==50;assert [l['id'] for l in levels]==list(range(1,51));rows=[check(l) for l in levels];assert len({r['canonicalSHA256'] for r in rows})==50
 report={'verified':True,'count':50,'uniqueSolutions':50,'canonicalDistinct':50,'canonicalGroup':'digit relabel, transpose, row permutations within bands, band permutations, column permutations within stacks, stack permutations; clue masks ignore digits entirely','subgrids':{'4x4':'2x2','9x9':'3x3'},'dataSHA256':hashlib.sha256(raw).hexdigest(),'levels':rows}
 (ROOT/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps({k:v for k,v in report.items() if k!='levels'},ensure_ascii=False))
if __name__=='__main__':main()
