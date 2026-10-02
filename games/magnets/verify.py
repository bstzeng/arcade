#!/usr/bin/env python3
"""Independent row-pattern enumerator; does not import the JS engine or generator."""
import json,itertools,functools,time,pathlib
ROOT=pathlib.Path(__file__).parent

def transform_key(p,a):
 keys=[];w,h=p['w'],p['h']
 for swap,fr,fc,sign in itertools.product(range(2),range(2),range(2),[1,-1]):
  ww,hh=(h,w) if swap else (w,h);b=[0]*(w*h)
  for r in range(h):
   for c in range(w):
    rr,cc=(c,r) if swap else (r,c)
    if fr:rr=hh-1-rr
    if fc:cc=ww-1-cc
    b[rr*ww+cc]=a[r*w+c]*sign
  keys.append(f'{ww}x{hh}:'+''.join(str(v+1) for v in b))
 return min(keys)
def validate(p):
 w,h=p['w'],p['h'];flat=[i for pair in p['dominoes'] for i in pair]
 assert sorted(flat)==list(range(w*h)), 'Partition is incomplete'
 a=[None]*(w*h)
 for pair,v in zip(p['dominoes'],p['solution']):
  x,y=pair;assert len(pair)==2 and (abs(x-y)==w or abs(x-y)==1 and x//w==y//w)
  assert v in (0,1,2);a[x],a[y]=[(0,0),(1,-1),(-1,1)][v]
 for i,v in enumerate(a):
  for j in ([i+1] if i%w<w-1 else [])+([i+w] if i+w<w*h else []):assert not(v!=0 and v==a[j]),'Same poles touch'
 for key,length,isrow,pol in [('rp',h,1,1),('rn',h,1,-1),('cp',w,0,1),('cn',w,0,-1)]:
  assert len(p[key])==length
  for k,t in enumerate(p[key]):
   ids=[k*w+j for j in range(w)] if isrow else [j*w+k for j in range(h)]
   assert t is None or sum(a[i]==pol for i in ids)==t
 return a

def count(p):
 w,h=p['w'],p['h'];owner={i:d for d,pair in enumerate(p['dominoes']) for i in pair};patterns=[]
 for r in range(h):
  row=[]
  for v in itertools.product([-1,0,1],repeat=w):
   if p['rp'][r] is not None and v.count(1)!=p['rp'][r]:continue
   if p['rn'][r] is not None and v.count(-1)!=p['rn'][r]:continue
   if any(v[c]!=0 and v[c]==v[c+1] for c in range(w-1)):continue
   if any(owner[r*w+c]==owner[r*w+c+1] and v[c]!=-v[c+1] for c in range(w-1)):continue
   row.append(v)
  patterns.append(row)
 minp=[[0]*w for _ in range(h+1)];maxp=[[0]*w for _ in range(h+1)];minm=[[0]*w for _ in range(h+1)];maxm=[[0]*w for _ in range(h+1)]
 for r in range(h-1,-1,-1):
  for c in range(w):
   for value,lo,hi in [(1,minp,maxp),(-1,minm,maxm)]:
    values=[v[c]==value for v in patterns[r]];lo[r][c]=lo[r+1][c]+min(values);hi[r][c]=hi[r+1][c]+max(values)
 @functools.lru_cache(None)
 def walk(r,prev,cp,cn):
  if r==h:return 1
  found=0
  for v in patterns[r]:
   if r and any((owner[r*w+c]==owner[(r-1)*w+c] and v[c]!=-prev[c]) or (owner[r*w+c]!=owner[(r-1)*w+c] and v[c]!=0 and v[c]==prev[c]) for c in range(w)):continue
   pp=tuple(cp[c]+(v[c]==1) for c in range(w));nn=tuple(cn[c]+(v[c]==-1) for c in range(w));ok=True
   for total,targets,lo,hi in [(pp,p['cp'],minp,maxp),(nn,p['cn'],minm,maxm)]:
    if any(t is not None and not total[c]+lo[r+1][c]<=t<=total[c]+hi[r+1][c] for c,t in enumerate(targets)):ok=False;break
   if not ok:continue
   found+=walk(r+1,v,pp,nn)
   if found>=2:return 2
  return found
 result=walk(0,(0,)*w,(0,)*w,(0,)*w);return result,walk.cache_info().currsize
if __name__=='__main__':
 levels=json.loads((ROOT/'levels.json').read_text());assert len(levels)==50;seen=set();out=[];start=time.time()
 for p in levels:
  a=validate(p);key=transform_key(p,a);assert key not in seen;seen.add(key);assert key==p['fingerprint'];n,nodes=count(p);assert n==1,(p['id'],n);out.append({'id':p['id'],'solutions':n,'states':nodes});print('Magnets independent',p['id'],n,nodes,flush=True)
 (ROOT/'independent-proof.json').write_text(json.dumps({'method':'Python row-pattern exact enumerator plus independent full-rule checker; cap 2; all D4 and global polarity swaps excluded','elapsedSeconds':round(time.time()-start,3),'verifiedLevels':len(out),'levels':out},indent=2))
 print('PASS 50 unique solutions, 50 canonical layouts, independent rule checks')
