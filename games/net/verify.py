#!/usr/bin/env python3
"""Independent Python no-wrap tree-network verifier and exact count-to-two search."""
import json,pathlib,time
ROOT=pathlib.Path(__file__).parent
BITS=(1,2,4,8)
def rotations(m):
    return {sum(1<<((d+r)%4) for d in range(4) if m&(1<<d)) for r in range(4)}
def neighbors(w,h):
    return [[(r-1)*w+c if r else -1,r*w+c+1 if c+1<w else -1,(r+1)*w+c if r+1<h else -1,r*w+c-1 if c else -1] for r in range(h) for c in range(w)]
def validate(p,a):
    w,h=p['w'],p['h'];n=w*h;ns=neighbors(w,h)
    if len(a)!=n or any(m not in rotations(p['tiles'][i]) for i,m in enumerate(a)):return False
    if sum(m.bit_count() for m in a)!=2*(n-1):return False
    for i,m in enumerate(a):
        for d,b in enumerate(BITS):
            if m&b and (ns[i][d]<0 or not a[ns[i][d]]&BITS[(d+2)%4]):return False
    visited={0};frontier=[0]
    while frontier:
        i=frontier.pop()
        for d,b in enumerate(BITS):
            j=ns[i][d]
            if a[i]&b and j not in visited:visited.add(j);frontier.append(j)
    return len(visited)==n

def count(p,limit=2):
    w,h=p['w'],p['h'];n=w*h;ns=neighbors(w,h);solutions=[];nodes=0
    domains=[{m for m in rotations(p['tiles'][i]) if all(j>=0 or not m&BITS[d] for d,j in enumerate(ns[i]))} for i in range(n)]
    def propagate(ds):
        while True:
            changed=False
            for i in range(n):
                old=ds[i].copy()
                for d,j in enumerate(ns[i]):
                    if j<0:continue
                    offered={bool(x&BITS[(d+2)%4]) for x in ds[j]}
                    ds[i]={x for x in ds[i] if bool(x&BITS[d]) in offered}
                if not ds[i]:return False
                changed|=old!=ds[i]
            # Reject forced cycles with a DFS on the currently forced undirected edges.
            graph=[[] for _ in range(n)]
            for i in range(n):
                for d in (1,2):
                    j=ns[i][d]
                    if j>=0 and all(x&BITS[d] for x in ds[i]):graph[i].append(j);graph[j].append(i)
            seen=set()
            for source in range(n):
                if source in seen:continue
                stack=[(source,-1)]
                while stack:
                    i,prev=stack.pop()
                    if i in seen:return False
                    seen.add(i)
                    for j in graph[i]:
                        if j!=prev:stack.append((j,i))
            # Possible connectivity, independent of chosen tile orientations.
            seen={0};stack=[0]
            while stack:
                i=stack.pop()
                for d,j in enumerate(ns[i]):
                    if j>=0 and j not in seen and any(x&BITS[d] for x in ds[i]):seen.add(j);stack.append(j)
            if len(seen)!=n:return False
            if not changed:return True
    def search(ds):
        nonlocal nodes
        nodes+=1
        if len(solutions)>=limit or not propagate(ds):return
        undecided=[i for i in range(n) if len(ds[i])>1]
        if not undecided:
            a=[next(iter(x)) for x in ds]
            if validate(p,a):solutions.append(a)
            return
        i=min(undecided,key=lambda k:(len(ds[k]),-k))
        for m in sorted(ds[i],reverse=True):
            child=[x.copy() for x in ds];child[i]={m};search(child)
            if len(solutions)>=limit:return
    search(domains)
    return len(solutions),nodes,solutions

def canonical(p):
    w,h=p['w'],p['h'];a=[min(rotations(x)) for x in p['tiles']];forms=[]
    for mirror in range(2):
        b=a[:]
        if mirror:b=[a[r*w+w-1-c] for r in range(h) for c in range(w)]
        ww,hh=w,h
        for rotation in range(4):
            forms.append(f'{ww}x{hh}:'+','.join(map(str,b)))
            b=[b[(hh-1-c)*ww+r] for r in range(ww) for c in range(hh)];ww,hh=hh,ww
    return min(forms)

def main():
    start=time.time();levels=json.loads((ROOT/'levels.json').read_text());assert len(levels)==50
    assert len({canonical(p) for p in levels})==50
    report=[]
    for p in levels:
        assert validate(p,p['solution'])
        c,n,sol=count(p);assert c==1 and sol[0]==p['solution'],f"nonunique {p['id']}: {c}"
        report.append({'id':p['id'],'grid':f"{p['w']}x{p['h']}",'solutionCount':c,'independentSearchNodes':n,'proofValid':True})
        print(f"Net {p['id']:02}: unique; {n} independent search nodes",flush=True)
    assert count({'w':4,'h':4,'tiles':[4,4,6,8,5,3,15,12,5,2,13,1,3,10,11,8]})[0]==2
    assert len(rotations(5))==2 and len(rotations(15))==1
    assert count({'w':2,'h':2,'tiles':[3]*4})[0]==0
    result={'game':'Net','levels':50,'uniqueSolutions':50,'dihedralDistinct':50,'method':'Independent Python connector-domain exhaustive search, limit two; exact matched-edge tree validation','seconds':round(time.time()-start,3),'results':report}
    (ROOT/'verification-report.json').write_text(json.dumps(result,indent=2)+'\n')
    print('PASS: 50 proof-valid, unique, symmetry-distinct Net puzzles')
if __name__=='__main__':main()
