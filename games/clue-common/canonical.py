"""Rule-preserving canonical public starts; no IDs, names or witness hashes."""
import itertools,json,hashlib
J=lambda v:json.dumps(v,sort_keys=True,separators=(',',':'))
def graphcanon(colors,edges):
 # Colored, directed, edge-labeled graph. Exact enumeration within equitable cells.
 edges=sorted(set(edges))
 c=[J(v) for v in colors]
 for _ in range(len(c)):
  desc=[J([c[i],sorted((t,c[b]) for a,b,t in edges if a==i),sorted((t,c[a]) for a,b,t in edges if b==i)]) for i in range(len(c))]
  ids={v:str(j) for j,v in enumerate(sorted(set(desc)))};nc=[ids[v] for v in desc]
  if len(set(nc))==len(set(c)):c=nc;break
  c=nc
 groups=[[i for i,v in enumerate(c) if v==k] for k in sorted(set(c))];best=None
 for parts in itertools.product(*(itertools.permutations(g) for g in groups)):
  order=sum((list(p) for p in parts),[]);m={old:new for new,old in enumerate(order)};s=J([[colors[i] for i in order],sorted((m[a],m[b],t) for a,b,t in edges)])
  if best is None or s<best:best=s
 return best

def canonical(p):
 k=p['kind'];n=p.get('n');variants=[]
 if k=='logic':
  for rev in [False,True]:
   for swap in [False,True]:
    clues=[]
    def ref(a):
     cat=a[0];v=a[1] if cat==0 else p['solution'][cat-1].index(a[1]);return [3-cat if swap and cat else cat,n-1-v if rev else v]
    for c in p['clues']:
     a,b=ref(c['a']),ref(c['b']);op='eq' if c['op']=='gap' and c['d']==0 else c['op']
     if op=='before' and rev:a,b=b,a
     if op!='before':a,b=sorted([a,b])
     clues.append([op,a,b,c['d'] if op=='gap' else None])
    variants.append(J([n,sorted(clues)]))
 elif k=='truth':
  colors=[['speaker',s['op'],s['neg']] for s in p['statements']];edges=[]
  for j,s in enumerate(p['statements']):
   op=s['op'];edges.append((j,s['a'],'premise' if op=='implies' else 'ref'))
   if op!='single':edges.append((j,s['b'],'conclusion' if op=='implies' else 'ref'))
  variants=[J([p['honest'],graphcanon(colors,edges)])]
 elif k=='timeline':
  order=sorted(range(n),key=lambda j:p['solution']['times'][j]);m={v:i for i,v in enumerate(order)};cs=[]
  for c in p['clues']:
   a,b=m[c['a']],m[c['b']]
   if c['op']=='gap':a,b=sorted([a,b])
   cs.append([c['op'],a,b,c.get('d',c.get('v'))])
  variants=[J([p['crime'],[p['distances'][i] for i in order],[p['returns'][i] for i in order],sorted(cs)])]
 elif k=='cipher':
  # Cipher symbols and alphabet symbols are both arbitrary names. Dictionary words
  # are unordered paths; message word order is fixed and creates colored paths.
  colors=[];edges=[];letters={}
  def node(color):colors.append(color);return len(colors)-1
  def letter(c):
   if c not in letters:letters[c]=node(['letter'])
   return letters[c]
  for w in p['bank']:
   wn=node(['word',len(w)])
   for j,c in enumerate(w):edges.append((wn,letter(c),'position'+str(j)))
  for i,w in enumerate(p['encoded']):
   wn=node(['message',i,len(w)])
   for j,c in enumerate(w):edges.append((wn,letter(p['solution'][c]),'position'+str(j)))
  for c,v in p['anchors']:colors[letter(v)]=['letter','anchor']
  variants=[graphcanon(colors,edges)]
 elif k=='family':
  colors=[['person',g] for g in p['generations']];edges=[]
  for c in p['clues']:
   edges.append((c['a'],c['b'],c['op']))
   if c['op'] in ['siblings','different']:edges.append((c['b'],c['a'],c['op']))
  variants=[graphcanon(colors,edges)]
 elif k=='hats':
  for flip in [False,True]:
   colors=[];edges=[]
   for j in range(n):colors.append(['person',[(i,1-t['answer'] if flip and t['answer']>=0 else t['answer']) for i,t in enumerate(p['transcript']) if t['who']==j]])
   for j,seen in enumerate(p['seen']):
    for b in seen:edges.append((j,b,'sees'))
   variants.append(J([sorted(n-v for v in p['totals']) if flip else p['totals'],graphcanon(colors,edges)]))
 elif k=='evidence':
  closure=set(map(tuple,p['edges']))
  for mid in range(n):
   for a in range(n):
    for b in range(n):
     if (a,mid) in closure and (mid,b) in closure:closure.add((a,b))
  nontrivial_apart=[(a,b) for a,b in p['apart'] if not any(((a,c) in closure and (c,b) in closure) or ((b,c) in closure and (c,a) in closure) for c in range(n))]
  for reverse in [False,True]:
   edges=[(b,a,'before') if reverse else (a,b,'before') for a,b in closure]
   for a,b in nontrivial_apart:edges.extend([(a,b,'apart'),(b,a,'apart')])
   variants.append(graphcanon([['event']]*n,edges))
 elif k=='rule':
  table=p['certificate']['truthTable']
  for perm in itertools.permutations(range(3)):
   for flips in itertools.product(range(2),repeat=3):
    transformed=[]
    for v in itertools.product(range(4),repeat=3):
     u=[3-v[perm[j]] if flips[j] else v[perm[j]] for j in range(3)];transformed.append(table[u[0]*16+u[1]*4+u[2]])
    variants.append(''.join(map(str,transformed)))
 elif k=='map':
  size=p['size']
  for flip in [False,True]:
   for rot in range(4):
    coords=[]
    for l in p['landmarks']:
     x,y=l['x'],l['y']
     if flip:x=size-1-x
     for _ in range(rot):x,y=size-1-y,x
     coords.append((x,y))
    order=sorted(range(len(coords)),key=lambda j:coords[j]);m={v:i for i,v in enumerate(order)};cs=[]
    for c in p['clues']:cs.append([m[c['landmark']],c['op'],-c['v'] if flip and c['op'] in ['right','rightsign'] else c['v']])
    variants.append(J([size,[coords[j] for j in order],sorted(cs)]))
 elif k=='escape':
  colors=[['item',v,j==p['goal']] for j,v in enumerate(p['initial'])];edges=[]
  for r in p['recipes']:
   j=len(colors);colors.append(['recipe'])
   for a,v in r['take']:edges.append((a,j,'take'+str(v)))
   for a,v in r['give']:edges.append((j,a,'give'+str(v)))
  variants=[graphcanon(colors,edges)]
 else:raise ValueError(k)
 return hashlib.sha256((k+min(variants)).encode()).hexdigest()
if __name__=='__main__':
 import pathlib
 root=pathlib.Path(__file__).parent.parent
 for path in root.glob('*/levels.json'):
  if path.parent.name not in ['logic-grid','truth-liars','alibi-timeline','substitution-cipher','family-tree','hat-deduction','evidence-order','rule-lab','landmark-location','escape-inventory']:continue
  levels=json.loads(path.read_text());sigs=[canonical(p) for p in levels];print(path.parent.name,len(set(sigs)),flush=True)
