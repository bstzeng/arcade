#!/usr/bin/env python3
"""Deterministic Signpost generation. Full directed-ray Hamilton paths; no adjacent-only restriction."""
import json, random, pathlib, time
HERE=pathlib.Path(__file__).parent
DIRS=[(-1,0),(-1,1),(0,1),(1,1),(1,0),(1,-1),(0,-1),(-1,-1)]

def ray(n,i,d):
    if d<0:return []
    r,c=divmod(i,n);dr,dc=DIRS[d];r+=dr;c+=dc;out=[]
    while 0<=r<n and 0<=c<n:out.append(r*n+c);r+=dr;c+=dc
    return out

def count(p,limit=2,budget=150000):
    n=p['size'];N=n*n;adj=[ray(n,i,d) for i,d in enumerate(p['arrows'])];fixed={v:i for i,v in enumerate(p['givens']) if v};nodes=0;answers=[]
    known=p['givens'];future=[next((v for v in range(k+1,N+1) if v in fixed),N+1) for k in range(N+1)]
    # Exact reachable-at-distance bitmasks to each future fixed clue, allowing revisits (safe pruning).
    reach={}
    for val,cell in fixed.items():
        rows=[1<<cell]
        for _ in range(N):rows.append(sum(1<<i for i,a in enumerate(adj) if any(rows[-1]>>j&1 for j in a)))
        reach[val]=rows
    def dfs(at,k,seen,path):
        nonlocal nodes
        nodes+=1
        if nodes>budget:raise TimeoutError
        if known[at] and known[at]!=k:return
        nxt=future[k]
        if nxt<=N and not(reach[nxt][nxt-k]>>at&1):return
        if k==N:answers.append(path[:]);return
        choices=[fixed[k+1]] if k+1 in fixed else adj[at]
        for j in choices:
            if j not in adj[at] or seen>>j&1 or (known[j] and known[j]!=k+1):continue
            dfs(j,k+1,seen|1<<j,path+[j])
            if len(answers)>=limit:return
    try:
        starts=[fixed[1]] if 1 in fixed else range(N)
        for i in starts:
            dfs(i,1,1<<i,[i])
            if len(answers)>=limit:break
        return len(answers),answers,nodes
    except TimeoutError:return None,[],nodes

def canonical(values,n):
    forms=[]
    for flip in range(2):
        for rot in range(4):
            out=[0]*(n*n)
            for i,v in enumerate(values):
                r,c=divmod(i,n)
                if flip:c=n-1-c
                for _ in range(rot):r,c=c,n-1-r
                out[r*n+c]=v
            forms.append(tuple(out))
    return min(forms)

def make_path(n,rng):
    N=n*n;adj=[sum([ray(n,i,d) for d in range(8)],[]) for i in range(N)]
    for attempt in range(100):
        path=[rng.randrange(N)];seen=set(path)
        while len(path)<N:
            cand=[j for j in adj[path[-1]] if j not in seen]
            if not cand:break
            rng.shuffle(cand);cand.sort(key=lambda j:sum(k not in seen for k in adj[j])+rng.random()*3)
            j=cand[0];seen.add(j);path.append(j)
        if len(path)==N:return path
    raise RuntimeError('path generation exhausted')

def main():
    rng=random.Random(9257102);levels=[];seen=set();start=time.time()
    for ix in range(50):
        n=4 if ix<12 else 5 if ix<32 else 6;N=n*n
        while True:
            path=make_path(n,rng);solution=[0]*N;arrows=[-1]*N
            for k,i in enumerate(path):
                solution[i]=k+1
                if k+1<N:
                    r,c=divmod(i,n);y,x=divmod(path[k+1],n);arrows[i]=DIRS.index(((y>r)-(y<r),(x>c)-(x<c)))
            canon=canonical(solution,n)
            if canon not in seen:break
        p={'id':ix+1,'size':n,'arrows':arrows,'givens':solution[:],'solution':solution,'tier':'入門' if ix<12 else '進階' if ix<32 else '挑戰'}
        cells=[i for i in range(N) if solution[i] not in (1,N)];rng.shuffle(cells)
        for i in cells:
            v=p['givens'][i];p['givens'][i]=0
            c,_,_=count(p,budget=80000)
            if c!=1:p['givens'][i]=v
        c,ans,nodes=count(p,budget=3000000);assert c==1
        p['proof']={'solutionCount':c,'nodes':nodes,'longJumps':sum(max(abs(i//n-path[k+1]//n),abs(i%n-path[k+1]%n))>1 for k,i in enumerate(path[:-1]))}
        seen.add(canon);levels.append(p);print(ix+1,n,sum(bool(v) for v in p['givens']),nodes,flush=True)
    text=json.dumps(levels,ensure_ascii=False,separators=(',',':'))
    (HERE/'levels.json').write_text(text+'\n');(HERE/'levels.js').write_text('const SIGNPOST_LEVELS = '+text+';\n')
    print('seconds',time.time()-start)
if __name__=='__main__':main()
