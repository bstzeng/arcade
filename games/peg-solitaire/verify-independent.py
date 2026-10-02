#!/usr/bin/env python3
"""Independent rules/checker: does not import or execute the JavaScript engine."""
import json, pathlib, hashlib
base=pathlib.Path(__file__).resolve().parent
levels=json.loads((base/'levels.json').read_text())
assert len(levels)==50
seen=set(); seen_starts=set(); transitions=0

def canonical(level, with_goal=True):
    w=level['width']; cells=[(v%w,v//w) for v in level['cells']]; pegs=set(level['pegs']); variants=[]
    for swap in (False,True):
        for sx in (-1,1):
            for sy in (-1,1):
                points=[(sx*(y if swap else x),sy*(x if swap else y)) for x,y in cells]
                minx=min(x for x,y in points); miny=min(y for x,y in points)
                rows=sorted((x-minx,y-miny,int(v in pegs),int(with_goal and v==level['goal'])) for v,(x,y) in zip(level['cells'],points))
                variants.append(tuple(rows))
    return min(variants)

for number,l in enumerate(levels,1):
    assert l['id']==number
    w,h=l['width'],l['height']; board=set(l['cells']); pegs=set(l['pegs'])
    assert len(board)==len(l['cells']) and len(pegs)==len(l['pegs'])
    assert 3<=w<=9 and 3<=h<=9 and all(0<=i<w*h for i in board)
    assert pegs<=board and 3<=len(pegs)<=27
    assert l['goal'] is None or l['goal'] in board
    key=canonical(l); start_key=canonical(l,False)
    assert key not in seen and start_key not in seen_starts, ('symmetric duplicate',number)
    seen.add(key); seen_starts.add(start_key)
    # Every advertised hole belongs to a single orthogonally connected board.
    reached={next(iter(board))}; frontier=list(reached)
    while frontier:
        i=frontier.pop(); x,y=i%w,i//w
        for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)):
            xx,yy=x+dx,y+dy; j=yy*w+xx
            if 0<=xx<w and 0<=yy<h and j in board and j not in reached:
                reached.add(j);frontier.append(j)
    assert reached==board
    assert len(l['solution'])==len(pegs)-1
    for a in l['solution']:
        src,mid,dst=a['from'],a['over'],a['to']; assert all(v in board for v in (src,mid,dst))
        x1,y1=src%w,src//w; x2,y2=dst%w,dst//w
        assert (abs(x2-x1),abs(y2-y1)) in ((2,0),(0,2))
        assert mid%w==(x1+x2)//2 and mid//w==(y1+y2)//2
        assert src in pegs and mid in pegs and dst not in pegs
        old=pegs.copy();pegs.remove(src);pegs.remove(mid);pegs.add(dst)
        assert len(pegs)==len(old)-1 and old^pegs=={src,mid,dst}
        transitions+=1
    assert len(pegs)==1 and (l['goal'] is None or pegs=={l['goal']})
    assert len(l['pegs'])==3+(number-1)//2
print(json.dumps({'status':'PASS','independent':'Python coordinate/set rules; no JavaScript imports','levels':len(levels),'transitions':transitions,'canonical_unique':len(seen),'initial_patterns_unique_ignoring_goal':len(seen_starts),'shape_families':len(set(l['name'] for l in levels)),'sha256':hashlib.sha256((base/'levels.json').read_bytes()).hexdigest()},ensure_ascii=False,indent=2))
