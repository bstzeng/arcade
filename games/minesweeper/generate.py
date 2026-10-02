"""Seeded no-guess generator. Deduction receives public observations, never mines."""
import random,json,pathlib,collections
ROOT=pathlib.Path(__file__).parent
R=random.Random(2026100202)
def neighbors(i,w,h):
 r,c=divmod(i,w)
 return [y*w+x for y in range(max(0,r-1),min(h,r+2)) for x in range(max(0,c-1),min(w,c+2)) if (y,x)!=(r,c)]
def constraints(w,h,total,revealed,flags):
 unknown=set(range(w*h))-set(revealed)-flags
 out=[]
 for i,value in sorted(revealed.items()):
  near=set(neighbors(i,w,h));cells=near & unknown; count=value-len(near & flags)
  if cells:out.append((cells,count,{'type':'number','cell':i}))
 if unknown:out.append((unknown,total-len(flags),{'type':'remaining'}))
 return out

def deduce(w,h,total,revealed,flags):
 """Only revealed numbers and count are inputs. Returns a logically forced action."""
 cs=constraints(w,h,total,revealed,flags)
 for cells,count,source in cs:
  if count==0 or count==len(cells):return min(cells),('safe' if count==0 else 'mine'),{'rule':'direct','source':source}
 for a,ca,sa in cs:
  for b,cb,sb in cs:
   if len(a)<len(b) and a<=b:
    d=b-a; count=cb-ca
    if count==0 or count==len(d):return min(d),('safe' if count==0 else 'mine'),{'rule':'subset','small':sa,'large':sb}
 return None

def certify(w,h,mines,start):
 """Host reveals actual numbers only AFTER solver chose its proven-safe cell."""
 public={};flags=set();trace=[];action=(start,'safe',{'rule':'start'})
 while action:
  i,kind,reason=action
  step={'cell':i,'kind':kind,'reason':reason}
  if kind=='safe':
   if i in mines:raise AssertionError('unsound deduction')
   value=sum(j in mines for j in neighbors(i,w,h));public[i]=value;step['value']=value
  else:
   if i not in mines:raise AssertionError('unsound mine')
   flags.add(i)
  trace.append(step)
  if len(public)+len(flags)==w*h:return trace
  action=deduce(w,h,len(mines),public,flags)
 return None

def canonical(w,h,mines):
 points=[divmod(i,w) for i in mines];keys=[]
 for t in range(8):
  transformed=[]
  for r,c in points:
   if t>=4:r,c=c,r
   for _ in range(t%4):r,c=c,w-1-r
   transformed.append(r*w+c)
  keys.append(','.join(map(str,sorted(transformed))))
 return str(w)+'x'+str(h)+':'+min(keys)

def generate():
 levels=[];seen=set()
 for k in range(50):
  tier=k//10;w=h=6+tier
  count=[5,8,12,17,22][tier]+(k%10)//3
  required=1 if tier>=3 else 0
  for attempt in range(20000):
   # A fixed zero opening is explicitly part of every level, not chosen by answer-aware play.
   start=R.choice([0,w-1,(h-1)*w,w*h-1,w*(h//2)+w//2])
   allowed=set(range(w*h))-set(neighbors(start,w,h))-{start}
   mines=set(R.sample(sorted(allowed),count));key=canonical(w,h,mines)
   if key in seen:continue
   trace=certify(w,h,mines,start)
   if not trace:continue
   subset=sum(x['reason']['rule']=='subset' for x in trace)
   if subset<required or (tier==0 and subset>0) or (tier==1 and subset>3):continue
   seen.add(key);break
  else:raise RuntimeError('no solvable candidate')
  counts=collections.Counter(x['reason']['rule'] for x in trace)
  levels.append({'id':k+1,'width':w,'height':h,'mineCount':count,'mines':sorted(mines),'start':start,'tier':['安全起步','邊界探索','交集推理','子集挑戰','邏輯專家'][tier],'canonical':key,'proof':{'techniques':dict(counts),'trace':trace,'allCellsClassified':True,'attempts':attempt+1}})
  print(k+1,w,count,'subset',subset,'attempts',attempt+1,flush=True)
 text=json.dumps(levels,ensure_ascii=False,separators=(',',':'))
 (ROOT/'levels.json').write_text(text)
 (ROOT/'levels.js').write_text('window.MINESWEEPER_LEVELS='+text+';\n')
if __name__=='__main__':generate()
