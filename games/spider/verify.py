#!/usr/bin/env python3
"""Independent checker. Does not import generator or gameplay engine.
Physical IDs, 8 copies/rank, exact initial layout, every move/deal and 8 removals.
"""
from pathlib import Path
from collections import Counter
import json,hashlib
HERE=Path(__file__).resolve().parent

def verify(d):
    rank=d['ranks']; initial=d['tableau']; stock=d['stock'][:]
    assert len(rank)==104 and Counter(rank)==Counter({r:8 for r in range(1,14)})
    assert [len(c) for c in initial]==[6]*4+[5]*6
    assert len(stock)==50
    assert sorted(sum(initial,[])+stock)==list(range(104))
    columns=[[ [id,i==len(c)-1] for i,id in enumerate(c)] for c in initial]
    assert sum(not up for c in columns for _,up in c)==44
    removed=[]; deals=0; flips=0; longest_move=0; deal_steps=[]
    def conserve():
        assert sorted([id for c in columns for id,_ in c]+stock+sum(removed,[]))==list(range(104))
        for c in columns:
            assert not c or c[-1][1]
            faces=[up for _,up in c]; assert faces==sorted(faces)
    for step,a in enumerate(d['solution']):
        if a['type']=='deal':
            assert len(stock)>=10 and all(columns),f'deal {step} has an empty column'
            for c in columns:c.append([stock.pop(0),True])
            deals+=1;deal_steps.append(step)
        else:
            assert a['type']=='move'
            src,idx,dst=a['from'],a['index'],a['to']
            assert 0<=src<10 and 0<=dst<10 and src!=dst
            assert 0<=idx<len(columns[src])
            block=columns[src][idx:]
            assert all(up for _,up in block)
            assert all(rank[block[k][0]]==rank[block[k+1][0]]+1 for k in range(len(block)-1))
            assert not columns[dst] or (columns[dst][-1][1] and rank[columns[dst][-1][0]]==rank[block[0][0]]+1)
            del columns[src][idx:]; columns[dst].extend(block)
            longest_move=max(longest_move,len(block))
        again=True
        while again:
            again=False
            for c in columns:
                if c and not c[-1][1]:c[-1][1]=True;flips+=1;again=True
                if len(c)>=13 and all(up for _,up in c[-13:]) and [rank[id] for id,_ in c[-13:]]==list(range(13,0,-1)):
                    removed.append([id for id,_ in c[-13:]]);del c[-13:];again=True
        conserve()
    assert len(removed)==8 and not stock and not any(columns)
    assert deals==5 and flips==44
    # Column-invariant rank tracks pair each tableau with its five stock cards.
    tracks=sorted([[ [rank[id] for id in c], [rank[d['stock'][10*r+i]] for r in range(5)]] for i,c in enumerate(initial)])
    signature=hashlib.sha256(json.dumps(tracks,separators=(',',':')).encode()).hexdigest()
    return {'deal':d['id'],'actions':len(d['solution']),'dealSteps':deal_steps,'hiddenRevealed':flips,'completedRuns':len(removed),'longestMovedRun':longest_move,'canonicalSHA256':signature}

def main():
    data=json.loads((HERE/'deals.json').read_text());assert len(data['deals'])>=50
    results=[verify(d) for d in data['deals']]
    assert len({r['canonicalSHA256'] for r in results})==len(results),'Rank-layout duplicate up to simultaneous column permutation'
    assert len({d['id'] for d in data['deals']})==len(results)
    output={'verifier':'Independent Python rules replay (no engine or generator imports)','verifiedDeals':len(results),'uniqueColumnInvariantRankLayouts':len(results),'totalLegalActions':sum(r['actions'] for r in results),'results':results}
    (HERE/'verification.json').write_text(json.dumps(output,indent=2)+'\n')
    print(f"PASS: {len(results)} deals; {output['totalLegalActions']} legal actions; 400 completed runs; 2,200 hidden cards exposed; 250 legal stock rows; 50 column-invariant rank layouts")
if __name__=='__main__':main()
