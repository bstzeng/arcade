#!/usr/bin/env python3
"""Independent Python Masyu proof checker and exact count-to-two solver.
Does not load JavaScript, the generation solver, or recorded counts.
"""
import json, pathlib, time
ROOT=pathlib.Path(__file__).parent
SHAPES=(0,3,5,6,9,10,12)
BITS=(1,2,4,8)
def topology(w,h):
    ns=[]
    for r in range(h):
        for c in range(w): ns.append(( (r-1)*w+c if r else -1, r*w+c+1 if c<w-1 else -1, (r+1)*w+c if r<h-1 else -1,r*w+c-1 if c else -1))
    return ns

def validate(p,assignment):
    w,h=p['w'],p['h']; ns=topology(w,h); n=w*h
    if len(assignment)!=n or any(x not in SHAPES for x in assignment): return False
    active=[i for i,x in enumerate(assignment) if x]
    if not active:return False
    for i,m in enumerate(assignment):
        for d,b in enumerate(BITS):
            if m&b and (ns[i][d]<0 or not assignment[ns[i][d]]&BITS[(d+2)%4]): return False
        kind=p['pearls'][i]
        adjacent=[assignment[ns[i][d]] for d,b in enumerate(BITS) if m&b]
        if kind=='B' and (m in (0,5,10) or any(x not in (5,10) for x in adjacent)): return False
        if kind=='W' and (m not in (5,10) or not any(x not in (0,5,10) for x in adjacent)): return False
    # Walk degree-two cycle, and ensure it accounts for every nonempty vertex.
    previous=-1;current=active[0];visited=set()
    while current not in visited:
        visited.add(current)
        choices=[ns[current][d] for d,b in enumerate(BITS) if assignment[current]&b and ns[current][d]!=previous]
        if not choices:return False
        previous,current=current,choices[0]
    return current==active[0] and len(visited)==len(active)

def count(p,limit=2):
    w,h=p['w'],p['h'];n=w*h;ns=topology(w,h);pearls=p['pearls'];solutions=[];nodes=0
    domains=[]
    for i in range(n):
        shape=(3,6,9,12) if pearls[i]=='B' else (5,10) if pearls[i]=='W' else SHAPES
        domains.append(set(m for m in shape if all(j>=0 or not(m&BITS[d]) for d,j in enumerate(ns[i]))))
    def propagate(ds):
        while True:
            before=tuple(tuple(sorted(x)) for x in ds)
            for i in range(n):
                if not ds[i]:return False
                for d,j in enumerate(ns[i]):
                    if j<0:continue
                    offered={bool(x&BITS[(d+2)%4]) for x in ds[j]}
                    ds[i]={x for x in ds[i] if bool(x&BITS[d]) in offered}
                if pearls[i]=='B':
                    ds[i]={m for m in ds[i] if all((5 if d%2==0 else 10) in ds[ns[i][d]] for d,b in enumerate(BITS) if m&b)}
                    for d,j in enumerate(ns[i]):
                        if ds[i] and all(m&BITS[d] for m in ds[i]):ds[j]&={5 if d%2==0 else 10}
                if pearls[i]=='W':
                    ds[i]={m for m in ds[i] if any(any(x not in (0,5,10) for x in ds[ns[i][d]]) for d,b in enumerate(BITS) if m&b)}
                    if len(ds[i])==1:
                        m=next(iter(ds[i]));adj=[ns[i][d] for d,b in enumerate(BITS) if m&b]
                        for a,b in (adj,adj[::-1]):
                            if not any(x not in (0,5,10) for x in ds[a]):ds[b]-={0,5,10}
                if not ds[i]:return False
            # Detect a closed loop of fully decided nonempty vertices.
            fixed={i for i,x in enumerate(ds) if len(x)==1 and 0 not in x};visited=set()
            for start in fixed:
                if start in visited:continue
                stack=[start];comp=set();closed=True
                while stack:
                    i=stack.pop()
                    if i in comp:continue
                    comp.add(i);visited.add(i);m=next(iter(ds[i]))
                    for d,b in enumerate(BITS):
                        if m&b:
                            j=ns[i][d]
                            if j not in fixed:closed=False
                            elif j not in comp:stack.append(j)
                if closed:
                    for i in range(n):
                        if i not in comp:
                            if 0 not in ds[i]:return False
                            ds[i]={0}
            if any(not x for x in ds):return False
            if before==tuple(tuple(sorted(x)) for x in ds):return True
    def search(ds):
        nonlocal nodes
        nodes+=1
        if len(solutions)>=limit or not propagate(ds):return
        choices=[i for i in range(n) if len(ds[i])>1]
        if not choices:
            assignment=[next(iter(s)) for s in ds]
            if validate(p,assignment):solutions.append(assignment)
            return
        i=min(choices,key=lambda k:(len(ds[k]),-sum(pearls[j]!='.' for j in ns[k] if j>=0),-k))
        for v in sorted(ds[i],reverse=True):
            child=[s.copy() for s in ds];child[i]={v};search(child)
            if len(solutions)>=limit:return
    search(domains)
    return len(solutions),nodes,solutions

def canonical(p):
    w,h=p['w'],p['h'];a=list(p['pearls']);forms=[]
    for mirror in range(2):
        b=a[:]
        if mirror:b=[a[r*w+(w-1-c)] for r in range(h) for c in range(w)]
        ww,hh=w,h
        for rotation in range(4):
            forms.append(f'{ww}x{hh}:'+''.join(b))
            b=[b[(hh-1-c)*ww+r] for r in range(ww) for c in range(hh)];ww,hh=hh,ww
    return min(forms)

def main():
    start=time.time();levels=json.loads((ROOT/'levels.json').read_text());assert len(levels)==50
    assert len({canonical(p) for p in levels})==50
    report=[]
    for p in levels:
        assert validate(p,p['solution']),f"invalid proof {p['id']}"
        c,n,sol=count(p)
        assert c==1 and sol[0]==p['solution'],f"nonunique {p['id']}: {c}"
        report.append({'id':p['id'],'grid':f"{p['w']}x{p['h']}",'solutionCount':c,'independentSearchNodes':n,'proofValid':True})
        print(f"Masyu {p['id']:02}: unique; {n} independent search nodes",flush=True)
    assert count({'w':3,'h':3,'pearls':'.'*9})[0]==2
    assert count({'w':3,'h':3,'pearls':'....B....'})[0]==0
    result={'game':'Masyu','levels':50,'uniqueSolutions':50,'dihedralDistinct':50,'method':'Independent Python vertex-domain exhaustive search, limit two; full single-cycle and black/white validation','seconds':round(time.time()-start,3),'results':report}
    (ROOT/'verification-report.json').write_text(json.dumps(result,indent=2)+'\n')
    print('PASS: 50 proof-valid, unique, symmetry-distinct Masyu puzzles')
if __name__=='__main__':main()
