#!/usr/bin/env python3
"""Independent witness verifier. Does NOT import engine.js or generation code."""
from pathlib import Path
import json, hashlib, collections
P=Path(__file__).resolve().parent
D=json.loads((P/'levels.json').read_text())
def board(pieces):
    assert len(pieces)==10 and pieces[0][2:]==[2,2]
    cells={}
    for i,(x,y,w,h) in enumerate(pieces):
        assert all(isinstance(v,int) for v in (x,y,w,h))
        assert (w,h) in [(2,2),(1,2),(2,1),(1,1)]
        assert 0<=x and x+w<=4 and 0<=y and y+h<=5
        for yy in range(y,y+h):
            for xx in range(x,x+w):
                assert (xx,yy) not in cells,'Overlap'
                cells[xx,yy]=i
    assert len(cells)==18
    return cells

def canonical(pieces):
    def key(mirror):
        return tuple(sorted((i==0,4-w-x if mirror else x,y,w,h) for i,(x,y,w,h) in enumerate(pieces)))
    return min(key(False),key(True))
seen=set();steps=0;minimum_pair_distance=20;grids=[]
for n,l in enumerate(D['levels'],1):
    assert l['id']==n
    p=[q[:] for q in l['pieces']];board(p)
    k=canonical(p);assert k not in seen, 'Mirror or shape-identical duplicate';seen.add(k)
    assert len(l['solution'])==l['optimal']>=8
    assert sum(q[2:]==[1,2] for q in p)==l['family']
    assert sum(q[2:]==[2,1] for q in p)==5-l['family']
    assert sum(q[2:]==[1,1] for q in p)==4
    assert p[0][:2]!=[1,3]
    for from_,to,w,h in l['solution']:
        candidates=[i for i,q in enumerate(p) if q==[from_%4,from_//4,w,h]]
        assert len(candidates)==1
        i=candidates[0];ox,oy=p[i][:2];nx,ny=to%4,to//4
        assert (ox==nx) != (oy==ny), 'Not a straight nonzero move'
        dx=(nx>ox)-(nx<ox);dy=(ny>oy)-(ny<oy)
        cells=board(p)
        for t in range(1,abs(nx-ox)+abs(ny-oy)+1):
            xx,yy=ox+dx*t,oy+dy*t
            assert 0<=xx and xx+w<=4 and 0<=yy and yy+h<=5
            assert all(cells.get((x,y),i)==i for y in range(yy,yy+h) for x in range(xx,xx+w)), 'Illegal intermediate crossing'
        p[i][:2]=[nx,ny];board(p);steps+=1
    assert p[0][:2]==[1,3], 'Not won'
assert len(seen)==50
assert [l['optimal'] for l in D['levels']]==sorted(l['optimal'] for l in D['levels'])
assert len(set(l['family'] for l in D['levels']))==4
# All pairs are compared after removing labels and considering horizontal mirrors.
for l in D['levels']:
    variants=[]
    for mirror in (False,True):
        g=[0]*20
        for i,(x,y,w,h) in enumerate(l['pieces']):
            if mirror:x=4-w-x
            shape=4 if i==0 else 1 if w==h==1 else 2 if w==1 else 3
            for yy in range(y,y+h):
                for xx in range(x,x+w):g[yy*4+xx]=shape
        variants.append(g)
    grids.append(variants)
for i,a in enumerate(grids):
    for b in grids[:i]:minimum_pair_distance=min(minimum_pair_distance,*(sum(x!=y for x,y in zip(v,b[0])) for v in a))
summary={'passed':True,'levels':len(seen),'witnessMovesVerified':steps,'distinctShapeMirrorCanonicalStates':len(seen),'shapeMixtures':4,'optimalRange':[D['levels'][0]['optimal'],D['levels'][-1]['optimal']],'tiers':dict(collections.Counter(l['tier'] for l in D['levels'])),'minimumCellDifferenceBetweenAnyStartsIgnoringMirror':minimum_pair_distance,'reverseBFSReachableStates':sum(f['reachableStates'] for f in D['families']),'levelsSHA256':hashlib.sha256((P/'levels.json').read_bytes()).hexdigest()}
(P/'verification.json').write_text(json.dumps(summary,indent=2)+'\n')
print(json.dumps(summary,indent=2))
