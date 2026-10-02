"""Independent Python rules for eight tactical puzzle families.
No JavaScript engine is imported or executed by this checker. Every witness
move, resulting board and stated objective is checked separately.
"""
import json, pathlib, copy, hashlib
ROOT=pathlib.Path(__file__).resolve().parent.parent
D4=[(1,0),(-1,0),(0,1),(0,-1)]
D8=D4+[(1,1),(1,-1),(-1,1),(-1,-1)]
def sign(x): return (x>0)-(x<0)
def adj(i,w,h=None,ds=D4):
    h=h or w;x,y=i%w,i//w
    return [(y+dy)*w+x+dx for dx,dy in ds if 0<=x+dx<w and 0<=y+dy<h]
def group(b,i,w):
    seen={i};todo=[i];libs=set()
    for j in todo:
        for k in adj(j,w):
            if b[k]==0:libs.add(k)
            elif b[k]==b[i] and k not in seen:seen.add(k);todo.append(k)
    return seen,libs
def ray(b,fr,to,w,h=None):
    h=h or w
    if fr==to or not (0<=fr<len(b) and 0<=to<len(b)):return False
    x,y=fr%w,fr//w;xx,yy=to%w,to//w;dx,dy=xx-x,yy-y
    if dx and dy and abs(dx)!=abs(dy):return False
    dx,dy=sign(dx),sign(dy);x+=dx;y+=dy
    while (x,y)!=(xx,yy):
        if b[y*w+x]:return False
        x+=dx;y+=dy
    return b[to]==0

def mobility(b,p):
    n=0
    for i,v in enumerate(b):
        if v!=p:continue
        for dx,dy in D8:
            x,y=i%10+dx,i//10+dy
            while 0<=x<10 and 0<=y<10 and not b[y*10+x]:n+=1;x+=dx;y+=dy
    return n

def connected(b,p):
    q=[i for i in range(121) if b[i]==p and (i//11==0 if p==1 else i%11==0)];seen=set(q)
    for i in q:
        if i//11==10 if p==1 else i%11==10:return True
        for j in adj(i,11,ds=D4+[(1,-1),(-1,1)]):
            if b[j]==p and j not in seen:seen.add(j);q.append(j)
    return False

def bg_simple(s,d):
    p=s['turn'];k=0 if p==1 else 1;b=s['board'];out=[]
    for fr in ([-1] if s['bar'][k] else [i for i,v in enumerate(b) if sign(v)==p]):
        to=(24-d if p==1 else d-1) if fr==-1 else fr-p*d
        if 0<=to<24:
            if b[to]*p>=-1:out.append({'from':fr,'to':to,'die':d})
        elif fr>=0 and not s['bar'][k] and all(sign(v)!=p or (i<6 if p==1 else i>=18) for i,v in enumerate(b)):
            exact=fr+1 if p==1 else 24-fr
            farther=any(sign(v)==p and (i>fr if p==1 else i<fr) for i,v in enumerate(b))
            if d==exact or d>exact and not farther:out.append({'from':fr,'to':24,'die':d})
    return out

def bg_step(s,m):
    n=copy.deepcopy(s);p=s['turn'];k=0 if p==1 else 1
    if m['from']==-1:n['bar'][k]-=1
    else:n['board'][m['from']]-=p
    if m['to']==24:n['off'][k]+=1
    else:
        if n['board'][m['to']]==-p:n['bar'][1-k]+=1;n['board'][m['to']]=0
        n['board'][m['to']]+=p
    n['dice'].remove(m['die']);return n

def bg_sequences(s):
    out=[]
    for d in set(s['dice']):
        for m in bg_simple(s,d):
            for tail in bg_sequences(bg_step(s,m)):out.append([m]+tail)
    return out or [[]]

def bg_allowed(s):
    lines=bg_sequences(s);n=max(map(len,lines));lines=[a for a in lines if len(a)==n]
    if n==1 and len(set(s['dice']))==2:
        high=max(a[0]['die'] for a in lines);lines=[a for a in lines if a[0]['die']==high]
    return [a[0] for a in lines if a]

def transition(game,s,m):
    n=copy.deepcopy(s);b=n['board'];old=s['board'];p=s['turn'];fr=m.get('from');to=m.get('to');n['ply']+=1;n['turn']=-p
    if game=='go9':
        if m.get('type')=='pass':n['passes']+=1;return n
        assert old[to]==0;b[to]=p;captured=0;suicide=0
        for j in adj(to,9):
            if b[j]==-p:
                stones,libs=group(b,j,9)
                if not libs:
                    captured+=len(stones)
                    for k in stones:b[k]=0
        stones,libs=group(b,to,9)
        if not libs:
            suicide=len(stones)
            for k in stones:b[k]=0
        key=','.join(map(str,b));assert key not in s['history'];n['history'].append(key);n['passes']=0;n['captures'][str(p)]+=captured;n['captures'][str(-p)]+=suicide
    elif game=='hex':
        assert old[to]==0;b[to]=p;n['swapAvailable']=s['ply']==0
    elif game=='ataxx':
        assert old[fr]==p and old[to]==0;d=max(abs(fr%7-to%7),abs(fr//7-to//7));assert d in (1,2)
        if d==2:b[fr]=0
        b[to]=p;capture=0
        for j in adj(to,7,ds=D8):
            if b[j]==-p:b[j]=p;capture+=1
        n['quiet']=s['quiet']+1 if d==2 and not capture else 0
    elif game=='amazons':
        assert old[fr]==p and ray(b,fr,to,10);b[fr]=0;b[to]=p;arrow=m['arrow'];assert ray(b,to,arrow,10);b[arrow]=2
    elif game=='dots-and-boxes':
        edge=m['edge'];assert b[edge]==0;b[edge]=p;won=0
        for i in range(16):
            x,y=i%4,i//4;edges=[y*4+x,(y+1)*4+x,20+y*5+x,20+y*5+x+1]
            if not n['boxes'][i] and all(b[j] for j in edges):n['boxes'][i]=p;won+=1
        if won:n['turn']=p
    elif game=='dou-shou-qi':
        water=lambda i:3<=i//7<=5 and i%7 in (1,2,4,5)
        trap=lambda i:-1 if i in (2,4,10) else 1 if i in (58,60,52) else 0
        assert sign(old[fr])==p and sign(old[to])!=p and to!=(59 if p==1 else 3)
        dx,dy=to%7-fr%7,to//7-fr//7;assert bool(dx)!=bool(dy)
        distance=abs(dx)+abs(dy);rank=abs(old[fr])
        if distance!=1:
            assert rank in (6,7);x,y=fr%7+sign(dx),fr//7+sign(dy)
            while (x,y)!=(to%7,to//7):
                j=y*7+x;assert water(j) and not old[j];x+=sign(dx);y+=sign(dy)
            assert not water(to)
        elif water(to):assert rank==1
        if old[to]:
            assert water(fr)==water(to)
            target=abs(old[to]);assert trap(to)==p or rank==1 and target==8 or rank>=target and not(rank==8 and target==1)
        b[fr]=0;b[to]=old[fr];n['quiet']=0 if old[to] else s['quiet']+1
    elif game=='hnefatafl':
        restricted=lambda i:i in (0,10,60,110,120)
        assert sign(old[fr])==p and ray(b,fr,to,11) and (fr//11==to//11 or fr%11==to%11) and (not restricted(to) or old[fr]==-2)
        b[fr]=0;b[to]=old[fr];rem=[]
        for dx,dy in D4:
            x,y=to%11+dx,to//11+dy;xx,yy=x+dx,y+dy
            if not(0<=xx<11 and 0<=yy<11 and 0<=x<11 and 0<=y<11):continue
            j=y*11+x;k=yy*11+xx
            hostile=sign(b[k])==p or k in (0,10,110,120) or k==60 and (b[j]>0 or b[k]==0)
            if sign(b[j])==-p and b[j]!=-2 and hostile:rem.append(j)
        for j in rem:b[j]=0
        if p==1 and -2 in b:
            k=b.index(-2);ns=adj(k,11)
            if len(ns)==4 and all(b[j]==1 or j==60 and b[j]==0 for j in ns):b[k]=0
    elif game=='backgammon':
        assert m in bg_allowed(s);n=bg_step(s,m);n['ply']=s['ply']+1
        if n['off'][0 if p==1 else 1]==15:n['result']={'winner':p}
        elif not n['dice'] or not bg_allowed(n):n['turn']=-p;n['phase']='roll';n['dice']=[]
    else:raise AssertionError(game)
    if 'keys' in n:n['keys'].append(str(n['turn'])+':'+','.join(map(str,n['board'])))
    return n

def goal(game,start,s,g):
    p=start['turn'];b=start['board'];a=s['board'];t=g['type']
    if t=='capture-go':return s['captures'][str(p)]-start['captures'][str(p)]>=g['count']
    if t=='connect':return connected(a,p)
    if t=='gain':return a.count(p)-b.count(p)>=g['count']
    if t=='boxes':return s['boxes'].count(p)-start['boxes'].count(p)>=g['count']
    if t=='mobility':return mobility(a,-p)<=g['maximum']
    if t=='capture-rank':return sum(abs(x) for x in b if sign(x)==-p)-sum(abs(x) for x in a if sign(x)==-p)>=g['rank']
    if t=='capture-tafl':return sum(sign(x)==-p for x in b)-sum(sign(x)==-p for x in a)>=g['count']
    if t=='bear-off':
        k=0 if p==1 else 1
        return (s['turn']!=p or s.get('result')) and s['off'][k]-start['off'][k]>=g['count']
    return False

def canonical(s,w,h):
    out=[]
    for flipx in (False,True):
        for flipy in (False,True):
            for transpose in (False,True) if w==h else (False,):
                b=[0]*(w*h)
                for i,v in enumerate(s['board']):
                    x,y=i%w,i//w
                    if flipx:x=w-1-x
                    if flipy:y=h-1-y
                    if transpose:x,y=y,x
                    b[y*w+x]=v
                out.append(tuple(b))
    return min(out)

if __name__=='__main__':
    dimensions={'go9':(9,9),'hex':(11,11),'ataxx':(7,7),'amazons':(10,10),'dots-and-boxes':(40,1),'dou-shou-qi':(7,9),'hnefatafl':(11,11),'backgammon':(24,1)}
    report={'checker':'Independent Python move geometry, capture, dice sequencing, and objective implementation; no JS engine imports','games':{},'allPassed':True}
    for game,(w,h) in dimensions.items():
        levels=json.loads((ROOT/game/'levels.json').read_text());assert len(levels)==100;seen=set();moves=0
        for l in levels:
            initial=l['start'];state=copy.deepcopy(initial)
            if game=='dots-and-boxes':
                geometric=[0]*81
                for i,v in enumerate(state['board']):
                    if i<20:x,y=(i%4)*2+1,(i//4)*2
                    else:x,y=((i-20)%5)*2,((i-20)//5)*2+1
                    geometric[y*9+x]=int(bool(v))
                fingerprint=canonical({'board':geometric},9,9)
            else:fingerprint=canonical(state,w,h)
            assert fingerprint not in seen,(game,l['id'],'symmetric duplicate');seen.add(fingerprint)
            for action in l['solution']:state=transition(game,state,action);moves+=1
            assert goal(game,initial,state,l['goal']), (game,l['id'])
        engine=ROOT/game/'engine.js';report['games'][game]={'puzzles':len(levels),'witnessMoves':moves,'canonicalUnique':len(seen),'engineSha256':hashlib.sha256(engine.read_bytes()).hexdigest(),'levelsSha256':hashlib.sha256((ROOT/game/'levels.json').read_bytes()).hexdigest()};print(game,len(levels),moves,'PASS')
    (ROOT/'competitive-common'/'independent-verification.json').write_text(json.dumps(report,indent=2)+'\n')
