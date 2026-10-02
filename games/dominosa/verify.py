"""Independent Algorithm-X verification, including symmetry + arbitrary digit relabelling."""
import json,pathlib
ROOT=pathlib.Path(__file__).parent

def fingerprint(p):
    grid=[p['board'][r*p['width']:(r+1)*p['width']] for r in range(p['height'])];keys=[]
    for flip in range(2):
        a=[row[:] for row in (grid if not flip else grid[::-1])]
        for turn in range(4):
            ids={};s=[]
            for row in a:
                for x in row:
                    ids.setdefault(x,len(ids));s.append(ids[x])
            keys.append((len(a),len(a[0]),tuple(s)));a=[list(row) for row in zip(*a)][::-1]
    return min(keys)

def count(p):
    h,w,m=p['height'],p['width'],p['max'];N=h*w;board=p['board'];types=[(a,b) for a in range(m+1) for b in range(a,m+1)]
    assert N==2*len(types) and len(board)==N and all(type(x)==int and 0<=x<=m for x in board)
    rows=[]
    for r in range(h):
        for c in range(w):
            a=r*w+c
            for rr,cc in ((r+1,c),(r,c+1)):
                if rr>=h or cc>=w:continue
                b=rr*w+cc;t=types.index(tuple(sorted((board[a],board[b]))));rows.append((frozenset((a,b,N+t)),(a,b)))
    columns=frozenset(range(N+len(types)));answer=[];nodes=0
    def visit(cols,remaining,chosen):
        nonlocal nodes
        nodes+=1
        if len(answer)>=2:return
        if not cols:answer.append(sorted(tuple(sorted(x)) for x in chosen));return
        choices=min(([i for i in remaining if c in rows[i][0]] for c in cols),key=len)
        for i in choices:
            mask,tile=rows[i];visit(cols-mask,[j for j in remaining if not mask&rows[j][0]],chosen+[tile])
    visit(columns,list(range(len(rows))),[])
    assert len(answer)==1,('nonunique',p['id'],len(answer))
    assert answer[0]==sorted(tuple(sorted(x)) for x in p['solution'])
    pairs=[tuple(sorted((board[a],board[b]))) for a,b in answer[0]]
    assert sorted(pairs)==types
    return dict(id=p['id'],solutions=len(answer),nodes=nodes)

def main():
    levels=json.loads((ROOT/'levels.json').read_text());assert len(levels)==50
    assert (ROOT/'levels.js').read_text().strip()=='const DOMINOSA_LEVELS='+json.dumps(levels,ensure_ascii=False,separators=(',',':'))+';'
    seen=set();proof=[]
    for p in levels:
        key=fingerprint(p);assert key not in seen,('duplicate',p['id']);seen.add(key);proof.append(count(p))
    (ROOT/'proof.json').write_text(json.dumps(dict(method='independent Algorithm X, all cell and pair columns; count capped at 2',canonicalDistinct=50,levels=proof),indent=2)+'\n');print('Dominosa: 50/50 unique, complete standard sets, 50 canonical digit-renaming-distinct boards; independent counts verified')
if __name__=='__main__':main()
