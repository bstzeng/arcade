#!/usr/bin/env python3
"""Independent certificate checker. Does not import generator or game engine."""
import json,pathlib,hashlib,collections,subprocess,sys
ROOT=pathlib.Path(__file__).parent

def canonical(rows):
    a=tuple(''.join('#' if c=='#' else ' ' for c in r) for r in rows);forms=[]
    for flip in (False,True):
        b=tuple(r[::-1] for r in a) if flip else a
        for _ in range(4):
            forms.append('\n'.join(b));b=tuple(''.join(row) for row in zip(*b[::-1]))
    return min(forms)

def check():
    data=json.loads((ROOT/'levels.json').read_text());assert len(data)==50;unique=set();summary=[];totals=collections.Counter()
    for index,level in enumerate(data,1):
        assert level['id']==index;rows=level['map'];h=len(rows);w=len(rows[0]);assert 6<=h<=8 and 6<=w<=8 and all(len(r)==w for r in rows)
        assert set(''.join(rows))<=set('# .@$+*')
        assert all(rows[y][x]=='#' for y in range(h) for x in range(w) if y in(0,h-1) or x in(0,w-1))
        walls={(x,y)for y,r in enumerate(rows)for x,c in enumerate(r)if c=='#'};goals={(x,y)for y,r in enumerate(rows)for x,c in enumerate(r)if c in'.+*'};boxes={(x,y)for y,r in enumerate(rows)for x,c in enumerate(r)if c in'$*'};players=[(x,y)for y,r in enumerate(rows)for x,c in enumerate(r)if c in'@+'];assert len(players)==1;p=players[0]
        assert len(goals)==len(boxes)==(1 if index<=5 else 2 if index<=15 else 3 if index<=30 else 4)
        floor={(x,y)for y in range(h)for x in range(w)}-walls;seen={p};q=[p]
        for x,y in q:
            for dx,dy in [(1,0),(-1,0),(0,1),(0,-1)]:
                n=x+dx,y+dy
                if n in floor and n not in seen:seen.add(n);q.append(n)
        assert seen==floor;assert boxes!=goals
        shape=canonical(rows);assert shape not in unique,'duplicate topology';unique.add(shape)
        pushes=0;moved_origins=set();moves=level['solution'];assert moves and set(moves)<=set('UDLR')
        for i,d in enumerate(moves):
            assert boxes!=goals,'witness continues after first win';dx,dy={'U':(0,-1),'D':(0,1),'L':(-1,0),'R':(1,0)}[d];n=p[0]+dx,p[1]+dy;assert n in floor,(index,i,'walk wall')
            if n in boxes:
                q=n[0]+dx,n[1]+dy;assert q in floor and q not in boxes,(index,i,'illegal push');boxes.remove(n);boxes.add(q);pushes+=1
            p=n
        assert boxes==goals;assert len(moves)==level['solutionMoves'];assert pushes==level['solutionPushes'];totals['moves']+=len(moves);totals['pushes']+=pushes
        summary.append({'id':index,'boxes':len(boxes),'moves':len(moves),'pushes':pushes,'mapSha256':hashlib.sha256('\n'.join(rows).encode()).hexdigest(),'witnessSha256':hashlib.sha256(moves.encode()).hexdigest()})
    js=(ROOT/'levels.js').read_text();assert json.loads(js[js.index('window.SOKOBAN_LEVELS = ')+len('window.SOKOBAN_LEVELS = '):].rstrip().rstrip(';'))==data
    report={'schema':1,'game':'standard-sokoban','checker':'independent Python cell simulation; no gameplay imports','levels':50,'uniqueWallTopologiesModuloD4':len(unique),'allSolvable':True,'solutionIsMoveOptimal':False,'totals':dict(totals),'dataSha256':hashlib.sha256((ROOT/'levels.json').read_bytes()).hexdigest(),'details':summary};(ROOT/'certification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(f'PASS 50/50 independent replays; {totals["moves"]} moves, {totals["pushes"]} pushes; 50 distinct D4 wall topologies')
if __name__=='__main__':
    if '--regenerate' in sys.argv:
        before={f:(ROOT/f).read_bytes() for f in('levels.json','levels.js')};subprocess.run([sys.executable,str(ROOT/'generate.py')],check=True);assert all((ROOT/f).read_bytes()==b for f,b in before.items()),'Non-reproducible generation'
    check()
