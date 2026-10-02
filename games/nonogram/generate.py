"""50 authored pixel icons, deterministic clue extraction and exact line-domain solver."""
import json,pathlib,itertools
ROOT=pathlib.Path(__file__).parent
# Every picture is authored as an icon, not sampled random noise.
ART='''
小十字|..#../..#../#####/..#../..#..
小箭頭|..#../.###./#####/..#../..#..
小愛心|.#.#./#####/#####/.###./..#..
小屋|..#../.###./#####/##.##/##.##
小樹|.###./#####/.###./..#../..#..
小旗|####./####./####./#..../#....
水滴|..#../..#../.###./#####/.###.
小船|..#../..##./#####/#####/.###.
沙漏|#####/.###./..#../.###./#####
寶石|.###./#####/#####/.###./..#..
信封|#######/##...##/#.#.#.#/#..#..#/#######
茶杯|#####../#...###/#...#.#/#...###/.###.../#######
月牙|..####./.###.../###..../###..../###..../.###.../..####.
太陽|...#.../.#.#.#./..###../#######/..###../.#.#.#./...#...
雨傘|...#.../.#####./#######/...#.../...#.../.#.#.../..##...
音符|...####/...#..#/...#..#/...#..#/.###.##/#######/.##.##.
鑰匙|.###.../##.##../##.##../.######/....#.#/....#.#
皇冠|#..#..#/#.###.#/#######/#######/.#####.
仙人掌|...#.../#.###../#.###.#/#####.#/.######/..###../..###..
火箭|...#.../..###../..###../.#####./###.###/..###../..#.#..
蝴蝶|##...##/###.###/#######/.#####./#######/###.###/##...##
魚兒|..####./.######/####.##/.######/..####./....#../...###.
蝸牛|..####./.######/###..##/###.###/#######/.######/######.
小鳥|...##../..###../######./.######/..#####/...#.#./..##.##
花朵|..###../.#####./#######/.#####./..###../...#.../.###...
山峰|....#..../...###.../..#####../.#######./#########
城堡|##..##..##/##..##..##/##########/##########/###....###/###....###/##########
蘋果|....##.../...##..../..#####../.#######./#########/#########/.#######./..#####..
南瓜|....#..../...###.../.#######./#########/###.#.###/#########/.#######./..#####..
鈴鐺|....#..../...###.../..#####../..#####../..#####../.#######./#########/...###...
蠟燭|....#..../...###.../....#..../...###.../...###.../...###.../...###.../.#######.
電池|..####.../########./##....##./##.##.##./##.##.##./##....##./########.
錨|....#..../...###.../....#..../.#######./....#..../#...#...#/##..#..##/.#######./..#####..
機器人|....#..../.#######./.##.#.##./.#######./...###.../#########/##.###.##/...#.#.../..##.##..
雪人|...###.../..#####../..##.##../..#####../...###.../.#######./.###.###./.#######./..#####..
熱氣球|..#####../.#######./#########/#########/.#######./..#####../...#.#.../...###.../...###...
風箏|....#..../...###.../..#####../.#######./..#####../...###.../....#..../.....#.../....#....
火焰|....#..../...##..../..####.../..#####../.######../.#######./#########/.#######./..#####..
盾牌|#########/#########/#########/.#######./.#######./..#####../...###.../....#....
蘑菇|...###.../.#######./#########/#########/..#####../...###.../...###.../..#####..
燈塔|.....#...../....###..../...#####.../....###..../....###..../...#####.../...#####.../..#######../..#######../###########
松樹|.....#...../....###..../...#####.../..#######../...#####.../..#######../.#########./###########/....###..../....###....
城門|..#######../.#########./###########/####...####/###.....###/###.....###/###.....###/###.....###/###.....###/###########
蛋糕|..#..#..#../..#..#..#../.#########./.#########./.........../###########/###########/###########/.#########.
書本|#####.#####/#####.#####/##.##.##.##/##.##.##.##/#####.#####/#####.#####/#####.#####/.#########./..#######..
手提包|...#####.../..##...##../..##...##../.#########./###########/###########/###########/###########/.#########.
鯨魚|...######../..########./.##########/########.##/###########/.#########./..#######../.....##..../....####...
機關車|...####..../...####..../...####..../...####..../.#########./###########/###########/.#########./..##...##..
小幽靈|...#####.../..#######../.#########./####.#.####/####.#.####/###########/###########/###########/###.###.###/##...#...##
勝利獎盃|..#######../###########/##.#####.##/##.#####.##/.#########./..#######../....###..../....###..../..#######../.#########.
望遠鏡|.......####/.....######/...########/.#########./########.../.#####...../...#......./..###....../.##.##...../##...##....
飛碟|....###..../..#######../.#########./###########/###########/.#########./..#..#..#../.#...#...#./#....#....#
鉛筆|........##./.......####/......####./.....####../....####.../...####..../..####...../.####....../####......./###......../##.........
蝙蝠|##.......##/###..#..###/#######.###/###########/###########/.#########./..##.#.##../...#...#...
樹葉|......###../....######./...#######./..########./.#########./.########../.#######.../.######..../..####...../..#......../.#.........
''' 

def runs(a):
 out=[];v=0
 for x in list(a)+[0]:
  if x:v+=1
  elif v:out.append(v);v=0
 return out

def patterns(n,cl):
 if not cl:return [0]
 out=[]
 def rec(k,start,mask):
  if k==len(cl):out.append(mask);return
  remain=sum(cl[k:])+len(cl)-k-1
  for pos in range(start,n-remain+1):rec(k+1,pos+cl[k]+1,mask|((1<<cl[k])-1)<<pos)
 rec(0,0,0);return out

def count(p,limit=2):
 h=p['height'];w=p['width'];rd=[patterns(w,x) for x in p['rows']];cd=[patterns(h,x) for x in p['cols']];nodes=0;found=[]
 def dfs(rows,cols):
  nonlocal nodes;nodes+=1
  while True:
   change=False
   for r in range(h):
    if not rows[r]:return
    some=0;all_=(1<<w)-1
    for a in rows[r]:some|=a;all_&=a
    for c in range(w):
     old=cols[c];cols[c]=[a for a in old if (a>>r&1) in ([1] if all_>>c&1 else [0] if not(some>>c&1) else [0,1])]
     if not cols[c]:return
     change |=len(old)!=len(cols[c])
   for c in range(w):
    some=0;all_=(1<<h)-1
    for a in cols[c]:some|=a;all_&=a
    for r in range(h):
     old=rows[r];rows[r]=[a for a in old if (a>>c&1) in ([1] if all_>>r&1 else [0] if not(some>>r&1) else [0,1])]
     if not rows[r]:return
     change|=len(old)!=len(rows[r])
   if not change:break
  if all(len(x)==1 for x in rows):found.append([1 if rows[r][0]>>c&1 else 2 for r in range(h) for c in range(w)]);return
  size,r=min((len(x),r) for r,x in enumerate(rows) if len(x)>1)
  for a in rows[r]:
   nr=[x[:] for x in rows];nc=[x[:] for x in cols];nr[r]=[a];dfs(nr,nc)
   if len(found)>=limit:return
 dfs(rd,cd);return len(found),nodes,found

def canonical(p):
 h=p['height'];w=p['width'];a=[p['solution'][r*w:(r+1)*w] for r in range(h)];out=[]
 for _ in range(4):
  out.append(str(len(a))+':'+str(len(a[0]))+':'+''.join(map(str,sum(a,[]))));out.append(str(len(a))+':'+str(len(a[0]))+':'+''.join(map(str,sum([r[::-1] for r in a],[]))));a=[list(x) for x in zip(*a[::-1])]
 return min(out)

def generate():
 levels=[];rejected=[];seen=set()
 for line in ART.strip().splitlines():
  name,s=line.split('|');rows=s.split('/');w=len(rows[0]);h=len(rows);assert all(len(x)==w for x in rows),name
  a=[[int(x=='#') for x in row] for row in rows]
  p={'name':name,'height':h,'width':w,'rows':[runs(r) for r in a],'cols':[runs([a[r][c] for r in range(h)]) for c in range(w)],'solution':[1 if x else 2 for row in a for x in row]}
  ct,nodes,sol=count(p)
  if ct!=1:rejected.append({'name':name,'solutionsAtLeast':ct});continue
  assert sol[0]==p['solution'];
  if canonical(p) in seen:rejected.append({"name":name,"reason":"symmetry duplicate"});continue
  seen.add(canonical(p));p['proofNodes']=nodes;p['complexity']=h*w+sum(len(x) for x in p['rows']+p['cols'])/5+(nodes-1)*2;levels.append(p)
 levels.sort(key=lambda p:p['complexity']);print('unique authored icons',len(levels),'rejected',rejected)
 assert len(levels)>=50
 levels=levels[:50]
 for i,p in enumerate(levels):p.update(id=i+1,tier=i//10+1)
 data=json.dumps(levels,ensure_ascii=False,separators=(',',':'))
 (ROOT/'levels.json').write_text(data+'\n');(ROOT/'levels.js').write_text('/* Generated by generate.py. */\n(function(r){const levels='+data+';if(typeof module!=="undefined")module.exports=levels;else r.NONOGRAM_LEVELS=levels;})(globalThis);\n')
 (ROOT/'generation.json').write_text(json.dumps({'count':50,'source':'Authored monochrome pixel icons in generate.py','rejected':rejected,'difficulty':'Ascending board area + total number of clue runs / 5 + 2*(proof search nodes - 1); 5 tiers of 10. Structural proxy, not a human rating.'},ensure_ascii=False,indent=2))
if __name__=='__main__':generate()
