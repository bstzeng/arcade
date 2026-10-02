#!/usr/bin/env python3
"""Independent FreeCell verifier, intentionally does not import JS or C++ rules.
Usage: python3 games/freecell/verify.py [--regenerate]
Card = suit*13+(rank-1); suits S,H,C,D; proof [srcKind,src,dstKind,dst,count].
"""
import json, pathlib, hashlib, itertools, subprocess, tempfile, sys
HERE=pathlib.Path(__file__).resolve().parent
deals=json.loads((HERE/'deals.json').read_text())
def rank(card): return card%13+1
def suit(card): return card//13
def ordered(a,b): return rank(a)==rank(b)+1 and suit(a)%2!=suit(b)%2
def canonical(columns):
    # Remove column order plus every suit renaming that preserves/opposes color classes.
    perms=[]
    for p in itertools.permutations(range(4)):
        if (p[0]%2==p[2]%2) and (p[1]%2==p[3]%2) and p[0]%2!=p[1]%2:
            perms.append(tuple(sorted(tuple(p[suit(c)]*13+c%13 for c in col) for col in columns)))
    return min(perms)
def verify(d):
    cols=[list(c) for c in d['columns']];cells=[None]*4;home=[0]*4
    assert [len(c) for c in cols]==[7,7,7,7,6,6,6,6], 'deal shape'
    assert sorted(sum(cols,[]))==list(range(52)), 'unique deck'
    def inventory():
        return sorted(sum(cols,[])+[c for c in cells if c is not None]+[s*13+r for s,n in enumerate(home) for r in range(n)])
    for step,move in enumerate(d['proof'],1):
        assert len(move)==5 and all(type(v)==int for v in move)
        f,i,t,j,n=move
        assert f in (0,1) and t in (0,1,2) and 0<=i<(8 if f==0 else 4) and 0<=j<(8 if t==0 else 4)
        assert (f,i)!=(t,j) and n>=1
        if f==0:
            assert n<=len(cols[i]);taken=cols[i][-n:]
            assert all(ordered(a,b) for a,b in zip(taken,taken[1:])), (d['id'],step,'unpacked run')
        else:
            assert n==1 and cells[i] is not None;taken=[cells[i]]
        c=taken[0]
        if t==0:
            assert not cols[j] or ordered(cols[j][-1],c), (d['id'],step,'bad destination')
            capacity=(1+cells.count(None))*2**sum(not pile and k!=j for k,pile in enumerate(cols))
            assert n<=capacity,(d['id'],step,'supermove capacity')
        elif t==1: assert n==1 and cells[j] is None
        else: assert n==1 and suit(c)==j and rank(c)==home[j]+1
        if f==0: del cols[i][-n:]
        else: cells[i]=None
        if t==0: cols[j].extend(taken)
        elif t==1: cells[j]=c
        else: home[j]+=1
        assert inventory()==list(range(52)),(d['id'],step,'card conservation')
    assert home==[13]*4 and not any(cols) and cells==[None]*4,'not a complete victory'
    # A certificate must require rearrangement, rather than 52 foundation taps.
    assert any(m[2]!=2 for m in d['proof'])
    return len(d['proof'])
assert len(deals)>=50
assert [d['id'] for d in deals]==list(range(1,len(deals)+1))
assert len({canonical(d['columns']) for d in deals})==len(deals),'duplicate modulo suits/columns'
counts=[verify(d) for d in deals]
# Independent structural challenge check: buried lower suit ranks make foundation-only play stall.
stalled=0
for d in deals:
    cols=[c[:] for c in d['columns']];h=[0]*4
    while True:
        progress=False
        for c in cols:
            if c and rank(c[-1])==h[suit(c[-1])]+1:
                x=c.pop();h[suit(x)]+=1;progress=True
        if not progress: break
    stalled+=any(cols)
assert stalled==len(deals),'trivial foundation-only deal'
print(f'PASS: {len(deals)} canonical-distinct deals, {sum(counts)} legal moves, {min(counts)}–{max(counts)} moves per witness, all 52-card wins; all require tableau/free-cell play.')
print('deals.json sha256:',hashlib.sha256((HERE/'deals.json').read_bytes()).hexdigest())
if '--regenerate' in sys.argv:
    with tempfile.TemporaryDirectory() as tmp:
        exe=pathlib.Path(tmp)/'solve'
        subprocess.run(['g++','-O3','-std=c++17',str(HERE/'solve.cpp'),'-o',str(exe)],check=True)
        result=subprocess.run([str(exe),'50','150000'],stdout=subprocess.PIPE,stderr=subprocess.PIPE,check=True)
        assert json.loads(result.stdout)==deals,'regeneration differs'
        print('PASS: exact deterministic regeneration (MT19937 + specified Fisher–Yates).')
