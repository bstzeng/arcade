#!/usr/bin/env python3
"""Independent matrix transitions and first-row chasing (not GF(2) elimination)."""
import json,pathlib,hashlib
base=pathlib.Path(__file__).resolve().parent
levels=json.loads((base/'levels.json').read_text())
assert len(levels)==50

def press(board,n,i):
    out=board.copy(); x,y=i%n,i//n
    for xx,yy in ((x,y),(x-1,y),(x+1,y),(x,y-1),(x,y+1)):
        if 0<=xx<n and 0<=yy<n:out[yy*n+xx]^=1
    return out

def canonical(board,n):
    variants=[]
    for swap in (False,True):
        for sx in (-1,1):
            for sy in (-1,1):
                transformed=[0]*(n*n)
                for i,v in enumerate(board):
                    x,y=i%n,i//n
                    if swap:x,y=y,x
                    if sx==-1:x=n-1-x
                    if sy==-1:y=n-1-y
                    transformed[y*n+x]=v
                variants.append(tuple(transformed))
    return n,min(variants)

def exact_minimum(board,n):
    # Any solution's first row is one of 2^n choices. Each subsequent row
    # is forced by the row immediately above; this enumerates every solution.
    solutions=[]
    for mask in range(1<<n):
        b=board.copy(); moves=[]
        for x in range(n):
            if mask>>x&1:b=press(b,n,x);moves.append(x)
        for y in range(1,n):
            for x in range(n):
                if b[(y-1)*n+x]:b=press(b,n,y*n+x);moves.append(y*n+x)
        if not any(b):solutions.append(moves)
    assert solutions
    return min(map(len,solutions)),len(solutions)

seen=set();transitions=0;mins={};counts={}
for number,l in enumerate(levels,1):
    assert l['id']==number and 3<=l['size']<=6
    n=l['size']; b=l['lights'].copy()
    assert len(b)==n*n and all(v in (0,1) for v in b) and any(b)
    key=canonical(b,n);assert key not in seen;seen.add(key)
    minimum,count=exact_minimum(b,n);assert minimum==l['par']==len(l['solution'])
    mins[n]=mins.get(n,[])+[minimum];counts[n]=count
    for click in l['solution']:
        assert isinstance(click,int) and 0<=click<n*n
        before=b.copy();b=press(b,n,click)
        expected=3 if click%n in (0,n-1) and click//n in (0,n-1) else 4 if click%n in (0,n-1) or click//n in (0,n-1) else 5
        assert sum(a!=c for a,c in zip(before,b))==expected
        transitions+=1
    assert not any(b)
for n,values in mins.items():assert values==sorted(values)
print(json.dumps({'status':'PASS','independent':'Python coordinate toggles and exhaustive first-row chasing; no JavaScript imports','levels':50,'transitions':transitions,'canonical_unique':len(seen),'minimum_range_by_size':{n:[min(v),max(v)] for n,v in mins.items()},'solution_count_by_size':counts,'sha256':hashlib.sha256((base/'levels.json').read_bytes()).hexdigest()},indent=2))
