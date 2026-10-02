#!/usr/bin/env python3
"""Independent cell-by-cell verifier; does not load the JS engine or generator.
Runs exact initial-state BFS for every published puzzle, checking the claimed
minimum and every witness; rejects duplicate layouts up to relabeling/reflection.
"""
import json, pathlib, collections, hashlib, sys, time
BASE=pathlib.Path(__file__).resolve().parent

def board(cars, positions):
    assert len(cars)==len(positions)
    grid=[None]*36
    for i,((axis,lane,size),p) in enumerate(zip(cars,positions)):
        assert axis in ('H','V') and 0<=lane<6 and size in (2,3)
        assert type(p)==int and 0<=p<=6-size
        for off in range(size):
            x,y=(p+off,lane) if axis=='H' else (lane,p+off)
            assert grid[y*6+x] is None,'overlap'
            grid[y*6+x]=i
    return grid

def neighbors(cars, state):
    grid=board(cars,state)
    for i,(axis,lane,size) in enumerate(cars):
        for sign in (-1,1):
            for p in range(state[i]+sign,(6-size+1 if sign>0 else -1),sign):
                cells=[lane*6+p+k if axis=='H' else (p+k)*6+lane for k in range(size)]
                if any(grid[cell] not in (None,i) for cell in cells):break
                new=list(state);new[i]=p
                yield tuple(new),(i,p)

def canonical(cars,state):
    images=[]
    for fx in (False,True):
        for fy in (False,True):
            items=[]
            for i,((axis,lane,size),p) in enumerate(zip(cars,state)):
                x,y,w,h=(p,lane,size,1) if axis=='H' else (lane,p,1,size)
                if fx:x=6-x-w
                if fy:y=6-y-h
                items.append((int(i!=0),x,y,w,h))
            images.append(tuple(sorted(items)))
    return min(images)

def verify(exact=True):
    starttime=time.time();raw=(BASE/'levels.json').read_bytes();data=json.loads(raw)
    levels=data['levels'];assert len(levels)==50
    hashes=set();topologies=set();report=[];actions=0
    for num,l in enumerate(levels,1):
        assert l['id']==num and l['difficulty']==(num-1)//10+1
        cars=l['cars'];assert cars[0]==['H',2,2]
        state=tuple(l['start']);board(cars,state);assert state[0]!=4
        signature=canonical(cars,state);assert signature not in hashes;hashes.add(signature)
        topo=tuple(sorted(tuple(c) for c in cars[1:]));assert topo not in topologies;topologies.add(topo)
        for car,pos in l['solution']:
            assert state[0]!=4
            nxt=tuple(pos if i==car else p for i,p in enumerate(state))
            assert any(n==nxt and m==(car,pos) for n,m in neighbors(cars,state)),'illegal witness'
            state=nxt;actions+=1
        assert state[0]==4 and len(l['solution'])==l['optimal']
        visited=0
        if exact:
            q=collections.deque([(tuple(l['start']),0)]);seen={tuple(l['start'])};found=None
            while q:
                state,dist=q.popleft();visited+=1
                if state[0]==4:found=dist;break
                for nxt,_ in neighbors(cars,state):
                    if nxt not in seen:seen.add(nxt);q.append((nxt,dist+1))
            assert found==l['optimal'],(num,found,l['optimal'])
        report.append({'id':num,'cars':len(cars),'optimal':l['optimal'],'independentBfsVisited':visited})
        print(f"level {num:02} ✓ {l['optimal']} optimal slides; {visited} states",flush=True)
    result={'passed':True,'levels':50,'distinctCanonicalLayouts':50,'distinctVehicleTopologies':50,'legalWitnessSlides':actions,'exactMinimumIndependentlyChecked':exact,'sha256':hashlib.sha256(raw).hexdigest(),'seconds':round(time.time()-starttime,2),'levelsDetail':report}
    (BASE/'verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(json.dumps({k:v for k,v in result.items() if k!='levelsDetail'}))
if __name__=='__main__':verify('--quick' not in sys.argv)
