"""Independent cell-domain propagation/backtracking; equality and no-three only."""
import json,pathlib
ROOT=pathlib.Path(__file__).parent

def key(board,n):
    a=[board[i*n:(i+1)*n] for i in range(n)];out=[]
    for t in range(4):
        for b in (a,a[::-1]):
            f=tuple(x for row in b for x in row);out+=[f,tuple({0:0,1:2,2:1}[v] for v in f)]
        a=[list(z) for z in zip(*a)][::-1]
    return min(out)

def independent(clues,n):
    lines=[[r*n+c for c in range(n)] for r in range(n)]+[[r*n+c for r in range(n)] for c in range(n)]
    answers=[];nodes=0
    def rec(values):
        nonlocal nodes
        nodes+=1
        if len(answers)>=2:return
        while True:
            forced={}
            for line in lines:
                for color in (1,2):
                    places=[i for i in line if values[i]==color];unknown=[i for i in line if not values[i]]
                    if len(places)>n//2 or len(places)+len(unknown)<n//2:return
                    if len(places)==n//2:
                        for i in unknown:forced.setdefault(i,set()).add(3-color)
                for start in range(n-2):
                    trip=line[start:start+3];v=[values[i] for i in trip]
                    if v[0] and v[0]==v[1]==v[2]:return
                    if v.count(0)==1:
                        nonzero=[x for x in v if x]
                        if nonzero[0]==nonzero[1]:forced.setdefault(trip[v.index(0)],set()).add(3-nonzero[0])
            if any(len(v)>1 for v in forced.values()):return
            if not forced:break
            for i,v in forced.items():values[i]=next(iter(v))
        if 0 not in values:answers.append(values);return
        candidates=[i for i,v in enumerate(values) if not v]
        def score(i):
            r,c=divmod(i,n);return sum(bool(values[r*n+j]) for j in range(n))+sum(bool(values[j*n+c]) for j in range(n))
        i=max(candidates,key=score)
        for color in (1,2):
            branch=values[:];branch[i]=color;rec(branch)
    rec(clues[:]);return answers,nodes

def main():
    levels=json.loads((ROOT/'levels.json').read_text());assert len(levels)==50
    assert (ROOT/'levels.js').read_text().strip()=='const UNRULY_LEVELS='+json.dumps(levels,ensure_ascii=False,separators=(',',':'))+';'
    puzzles=set();solutions=set();proof=[]
    for p in levels:
        n=p['size'];c=p['clues'];sol=p['solution'];assert len(c)==len(sol)==n*n
        assert all(x in (0,1,2) and (not x or x==sol[i]) for i,x in enumerate(c));a,nodes=independent(c,n)
        assert len(a)==1 and a[0]==sol,('nonunique',p['id'])
        for row in [[sol[r*n+c] for c in range(n)] for r in range(n)]+[[sol[r*n+c] for r in range(n)] for c in range(n)]:
            assert row.count(1)==row.count(2)==n//2 and all(not(row[i]==row[i+1]==row[i+2]) for i in range(n-2))
        pk=(n,key(c,n));sk=(n,key(sol,n));assert pk not in puzzles and sk not in solutions;puzzles.add(pk);solutions.add(sk)
        proof.append(dict(id=p['id'],solutions=len(a),nodes=nodes,clues=sum(bool(v) for v in c)))
    repeated=[1,1,2,2]*2+[2,2,1,1]*2
    assert independent(repeated,4)[0]==[repeated] # Repeated rows/columns are explicitly valid.
    (ROOT/'proof.json').write_text(json.dumps(dict(method='independent cell propagation/backtracking, count capped at 2',canonicalDistinct=50,solutionCanonicalDistinct=50,repeatedRowsAllowed=True,levels=proof),indent=2)+'\n');print('Unruly: 50/50 unique, 50 canonical-distinct clues AND solutions, repeated rows permitted; independent counts verified')
if __name__=='__main__':main()
