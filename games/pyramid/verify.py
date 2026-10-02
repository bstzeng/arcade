#!/usr/bin/env python3
"""Independent proof checker: deliberately does not import generator or JS gameplay engine."""
import json
from pathlib import Path

def verify(data):
    assert data['rules']=='draw-one-waste-only-two-redeals-clear-pyramid'
    assert len(data['deals'])>=50
    canonical=set(); ids=set(); total=0
    for d in data['deals']:
        assert d['id'] not in ids; ids.add(d['id'])
        p=d['pyramid']; stock=d['stock']
        assert len(p)==28 and len(stock)==24
        assert all(type(c) is int for c in p+stock)
        assert sorted(p+stock)==list(range(52)), 'not a unique standard deck'
        flat=tuple(c%13+1 for c in p+stock)
        reflected=tuple(p[r*(r+1)//2+c]%13+1 for r in range(7) for c in range(r,-1,-1))+tuple(c%13+1 for c in stock)
        k=min(flat,reflected); assert k not in canonical, 'rank-equivalent or mirrored duplicate'; canonical.add(k)
        # Independent representation: occupied coordinates, draw queue, waste stack.
        board={(r,c):p[r*(r+1)//2+c] for r in range(7) for c in range(r+1)}
        queue=stock.copy(); waste=[]; removed=set(); cycles=0
        for n,a in enumerate(d['witness']):
            assert board, f'post-win action in deal {d["id"]}'
            if a['type']=='draw':
                assert queue, 'draw from empty stock'; waste.append(queue.pop(0))
            elif a['type']=='recycle':
                assert not queue and waste and cycles<2, 'illegal recycle'
                queue=waste.copy(); waste=[]; cycles+=1
            elif a['type']=='remove':
                cs=a['cards']; assert len(cs) in (1,2) and len(set(cs))==len(cs)
                free={card for (r,c),card in board.items() if (r+1,c) not in board and (r+1,c+1) not in board}
                if waste: free.add(waste[-1])
                assert all(c in free for c in cs), f'covered or unavailable card in {d["id"]}, action {n}'
                assert (len(cs)==1 and cs[0]%13+1==13) or (len(cs)==2 and sum(c%13+1 for c in cs)==13)
                for card in cs:
                    loc=next((q for q,v in board.items() if v==card),None)
                    if loc is not None: del board[loc]
                    else: assert waste.pop()==card
                    assert card not in removed; removed.add(card)
            else: raise AssertionError('unknown action')
            live=list(board.values())+queue+waste+list(removed)
            assert sorted(live)==list(range(52)), 'card lost or duplicated'
            total+=1
        assert not board, f'unsolved deal {d["id"]}'
    return {'verified':len(ids),'rank_and_mirror_distinct':len(canonical),'legal_actions':total}

if __name__=='__main__':
    print(json.dumps(verify(json.loads((Path(__file__).parent/'deals.json').read_text())),indent=2))
