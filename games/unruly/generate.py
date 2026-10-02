"""Balanced-row-domain solver; only equal counts and no triples, no all-different rule."""
import itertools,random,json,pathlib
R=random.Random(551028);ROOT=pathlib.Path(__file__).parent
PAT={n:[p for p in itertools.product((1,2),repeat=n) if p.count(1)==n//2 and all(not(p[i]==p[i+1]==p[i+2]) for i in range(n-2))] for n in (4,6,8)}
def canon(flat,n):
    a=[flat[i*n:(i+1)*n] for i in range(n)];out=[]
    for _ in range(4):
        for b in (a,[row[::-1] for row in a]):
            f=tuple(x for row in b for x in row);out.extend((f,tuple(3-x if x else 0 for x in f)))
        a=[list(row) for row in zip(*a[::-1])]
    return min(out)
def solve(clues,n,limit=2,shuffle=False):
    domains=[[p for p in PAT[n] if all(not clues[r*n+c] or clues[r*n+c]==p[c] for c in range(n))] for r in range(n)]
    if shuffle:
        for d in domains:R.shuffle(d)
    ans=[];nodes=0
    def dfs(rows,counts):
        nonlocal nodes
        nodes+=1;r=len(rows)
        if len(ans)>=limit:return
        if r==n:ans.append([v for row in rows for v in row]);return
        for p in domains[r]:
            new=[counts[c]+(p[c]==1) for c in range(n)]
            if any(k>n//2 or k+(n-r-1)<n//2 for k in new):continue
            if r>=2 and any(rows[-1][c]==rows[-2][c]==p[c] for c in range(n)):continue
            dfs(rows+[p],new)
    dfs([],[0]*n);return ans,nodes

def main():
    levels=[];seen=set();solutions=set()
    for n,count in [(4,5),(6,20),(8,25)]:
        done=0
        while done<count:
            answer,_=solve([0]*(n*n),n,1,True);answer=answer[0];cs=canon(answer,n)
            if (n,cs) in solutions:continue
            clues=answer[:];order=list(range(n*n));R.shuffle(order)
            for i in order:
                old=clues[i];clues[i]=0
                a,_=solve(clues,n)
                if len(a)!=1:clues[i]=old
            key=canon(clues,n)
            if (n,key) in seen:continue
            seen.add((n,key));solutions.add((n,cs));done+=1
            a,nodes=solve(clues,n)
            levels.append(dict(id=len(levels)+1,size=n,clues=clues,solution=answer,generationNodes=nodes))
            print(n,done,'clues',sum(bool(v) for v in clues),flush=True)
    data=json.dumps(levels,ensure_ascii=False,separators=(',',':'));(ROOT/'levels.json').write_text(data+'\n');(ROOT/'levels.js').write_text('const UNRULY_LEVELS='+data+';\n')
if __name__=='__main__':main()
