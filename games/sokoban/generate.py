#!/usr/bin/env python3
"""Deterministic reverse-play generation, followed by independent forward push BFS.
All boards have distinct wall topologies even modulo D4 transforms.
"""
import random,json,collections,hashlib,pathlib,time
ROOT=pathlib.Path(__file__).parent
SEED=2026100222
D=[(-1,0,'U'),(1,0,'D'),(0,-1,'L'),(0,1,'R')]
OP={'U':'D','D':'U','L':'R','R':'L'}
def reach(floor,player,boxes):
    found={player:''};q=collections.deque([player]);boxes=set(boxes)
    while q:
        y,x=q.popleft()
        for dy,dx,d in D:
            p=(y+dy,x+dx)
            if p in floor and p not in boxes and p not in found:found[p]=found[y,x]+d;q.append(p)
    return found

def canonical(w,h,wall):
    configs=[]
    for flip in range(2):
      for rot in range(4):
        cells=[];W,H=w,h
        for y,x in wall:
          a,b=x,y;W,H=w,h
          if flip:a=W-1-a
          for _ in range(rot):a,b,H,W=H-1-b,a,W,H
          cells.append((b,a))
        configs.append(str((W,H,sorted(cells))))
    return min(configs)
def dead_cells(floor,goals):
    live=set(goals);q=list(goals)
    for y,x in q:
      for dy,dx,d in D:
        p=(y+dy,x+dx);back=(y+2*dy,x+2*dx)
        if p in floor and back in floor and p not in live:live.add(p);q.append(p)
    return floor-live

def solve(floor,goals,player,boxes,cap=75000):
    boxes=tuple(sorted(boxes));rr=reach(floor,player,boxes);nodes=[(player,boxes,rr,-1,'',0)];seen={(min(rr),boxes)};dead=dead_cells(floor,goals)
    for i,(p,bs,r,parent,edge,depth) in enumerate(nodes):
      for by,bx in bs:
        for dy,dx,d in D:
          back=(by-dy,bx-dx);dest=(by+dy,bx+dx)
          if back not in r or dest not in floor or dest in bs or dest in dead:continue
          new=tuple(sorted((set(bs)-{(by,bx)})|{dest}));np=(by,bx);nr=reach(floor,np,new);k=(min(nr),new)
          if k in seen:continue
          seen.add(k);nodes.append((np,new,nr,i,r[back]+d,depth+1))
          if set(new)==goals:
            route=[];at=len(nodes)-1
            while nodes[at][3]>=0:route.append(nodes[at][4]);at=nodes[at][3]
            return ''.join(route[::-1]),depth+1,len(seen)
          if len(nodes)>=cap:return None
    return None

def make_map(rng,stage):
    h=7 if stage<4 else rng.choice([7,8]);w=7 if stage<3 else rng.choice([7,8]);floor={(y,x)for y in range(1,h-1)for x in range(1,w-1)}
    # Bite into different edges plus interior posts: distinct actual play topologies.
    for p in rng.sample(sorted(floor),rng.randint(3,7 if stage<3 else 10)):floor.discard(p)
    if len(floor)<16:return None
    if len(reach(floor,min(floor),()))!=len(floor):return None
    return w,h,floor

def generate():
    rng=random.Random(SEED);out=[];topologies=set();tries=0
    targets=[(1,2,8)]*5+[(2,5,14)]*10+[(3,9,22)]*15+[(4,13,30)]*20
    while len(out)<50:
      tries+=1;num=len(out);boxes_n,minpush,maxpush=targets[num];stage=1 if num<5 else 2 if num<15 else 3 if num<30 else 4
      m=make_map(rng,stage)
      if not m:continue
      w,h,floor=m;walls={(y,x)for y in range(h)for x in range(w)}-floor;canon=canonical(w,h,walls)
      if canon in topologies:continue
      goals=set(rng.sample(sorted(floor),boxes_n));boxes=set(goals);player=rng.choice(sorted(floor-boxes));last=None;pushes=0
      # Legal inverse pushes: walk to a box's front, pull box into the front,
      # player backs away. Every chosen edge has a legal forward inverse.
      for _ in range(110+stage*35):
        rr=reach(floor,player,boxes);opts=[]
        for by,bx in sorted(boxes):
          for dy,dx,d in D:
            front=(by+dy,bx+dx);back=(by+2*dy,bx+2*dx)
            if front in rr and back in floor and back not in boxes:
              weight=1 if last==((by,bx),OP[d])else 4;opts.extend([((by,bx),front,back,d)]*weight)
        if not opts:break
        box,front,back,d=rng.choice(opts);boxes.remove(box);boxes.add(front);player=back;last=(front,d);pushes+=1
      if boxes==goals or len(boxes&goals)>0 and stage>1:continue
      # BFS certifies reachability and produces an economical example, without
      # asserting move optimality in the UI.
      result=solve(floor,goals,player,boxes)
      if not result:continue
      route,pushcount,visited=result
      if not minpush<=pushcount<=maxpush:continue
      if stage>=2 and len({d for d in route})<4:continue
      rows=[]
      for y in range(h):
        row=''
        for x in range(w):
          p=(y,x);ch='#' if p not in floor else '.' if p in goals else ' '
          if p in boxes:ch='*' if p in goals else '$'
          if p==player:ch='+' if p in goals else '@'
          row+=ch
        rows.append(row)
      topologies.add(canon)
      name=['倉庫暖身','雙箱換位','三箱調度','四箱協作'][stage-1]
      out.append(dict(id=len(out)+1,name=name,stage=stage,map=rows,solution=route,solutionMoves=len(route),solutionPushes=pushcount,searchStates=visited,topologyHash=hashlib.sha256(canon.encode()).hexdigest()[:16]))
      print(f'{len(out):02} boxes={boxes_n} pushes={pushcount} moves={len(route)} states={visited} tries={tries}',flush=True)
    raw=json.dumps(out,ensure_ascii=False,indent=2)+'\n';(ROOT/'levels.json').write_text(raw);(ROOT/'levels.js').write_text('/* Generated by generate.py; full legal witnesses, not optimal-move claims. */\nwindow.SOKOBAN_LEVELS = '+json.dumps(out,ensure_ascii=False,separators=(',',':'))+';\n');return out
if __name__=='__main__':generate()
