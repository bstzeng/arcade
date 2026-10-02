"""Deterministic Dominosa generator: cell-MRV exact cover with tile-pair uniqueness."""
import random,json,pathlib,itertools
ROOT=pathlib.Path(__file__).parent
R=random.Random(620241)
def canonical(board,h,w):
    a=[board[r*w:(r+1)*w] for r in range(h)]; out=[]
    for _ in range(4):
        for b in (a,[row[::-1] for row in a]):
            labels={}; flat=[]
            for row in b:
                for v in row:
                    if v not in labels: labels[v]=len(labels)
                    flat.append(labels[v])
            out.append((len(b),len(b[0]),tuple(flat)))
        a=[list(row) for row in zip(*a[::-1])]
    return min(out)
def solve(board,h,w,limit=2):
    N=h*w; options=[[] for _ in board]; nodes=0; answers=[]
    pairs=sorted(set(tuple(sorted((x,y))) for x in range(max(board)+1) for y in range(x,max(board)+1)))
    ids={p:i for i,p in enumerate(pairs)}
    for a in range(N):
        for b in (a+1,a+w):
            if b>=N or (b==a+1 and a//w!=b//w):continue
            opt=(a,b,ids[tuple(sorted((board[a],board[b])))])
            options[a].append(opt);options[b].append(opt)
    def dfs(filled,used,chosen):
        nonlocal nodes
        nodes+=1
        if len(answers)>=limit:return
        if filled==(1<<N)-1:answers.append([list(x[:2]) for x in chosen]);return
        best=None
        for i in range(N):
            if filled>>i&1:continue
            cand=[o for o in options[i] if not (filled>>o[0]&1 or filled>>o[1]&1 or used>>o[2]&1)]
            if not cand:return
            if best is None or len(cand)<len(best):best=cand
            if len(best)==1:break
        for a,b,t in best:dfs(filled|1<<a|1<<b,used|1<<t,chosen+[(a,b,t)])
    dfs(0,0,[]);return answers,nodes

def tiling(h,w):
    N=h*w
    def dfs(used):
        if len(used)==N:return[]
        a=next(i for i in range(N) if i not in used);near=[]
        for b in (a+1,a+w):
            if b<N and b not in used and (b!=a+1 or a//w==b//w):near.append(b)
        R.shuffle(near)
        for b in near:
            rest=dfs(used|{a,b})
            if rest is not None:return [[a,b]]+rest
        return None
    return dfs(set())
def main():
    levels=[];seen=set()
    for m,count in [(2,10),(3,10),(4,15),(5,15)]:
        h,w=m+1,m+2;done=0;attempts=0
        while done<count:
            attempts+=1; board=[0]*(h*w);tiles=tiling(h,w);pairs=[(a,b) for a in range(m+1) for b in range(a,m+1)];R.shuffle(pairs)
            for cells,pair in zip(tiles,pairs):
                pair=list(pair);R.shuffle(pair)
                for i,v in zip(cells,pair):board[i]=v
            key=canonical(board,h,w)
            if key in seen:continue
            answers,nodes=solve(board,h,w)
            if len(answers)!=1:continue
            seen.add(key);done+=1
            levels.append(dict(id=len(levels)+1,height=h,width=w,max=m,board=board,solution=answers[0],generationNodes=nodes))
        print(m,count,'attempts',attempts,flush=True)
    data=json.dumps(levels,ensure_ascii=False,separators=(',',':'));(ROOT/'levels.json').write_text(data+'\n');(ROOT/'levels.js').write_text('const DOMINOSA_LEVELS='+data+';\n')
if __name__=='__main__':main()
