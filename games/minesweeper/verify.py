"""Independent certificate replay. Entailment is checked BEFORE consulting board truth."""
import json,pathlib,hashlib,collections,copy
ROOT=pathlib.Path(__file__).parent

def adjacent(i,w,h):
 r,c=divmod(i,w);return {j for j in range(w*h) if j!=i and abs(j//w-r)<=1 and abs(j%w-c)<=1}

def canonical(L):
 w,h=L['width'],L['height'];assert w==h;values=[]
 for swap in (False,True):
  for flip_y in (False,True):
   for flip_x in (False,True):
    pts=[]
    for i in L['mines']:
     y,x=divmod(i,w)
     if swap:y,x=x,y
     if flip_y:y=h-1-y
     if flip_x:x=w-1-x
     pts.append(y*w+x)
    values.append(','.join(map(str,sorted(pts))))
 return f'{w}x{h}:'+min(values)

def replay(L):
 w,h=L['width'],L['height'];n=w*h;total=L['mineCount'];assert 6<=w<=10 and w==h
 assert type(total)==int and 0<total<n
 assert len(L['mines'])==len(set(L['mines']))==total and all(type(i)==int and 0<=i<n for i in L['mines'])
 actual=set(L['mines']);start=L['start'];assert type(start)==int and 0<=start<n
 public={};certain_mines=set();steps=L['proof']['trace'];assert len(steps)==n
 counts=collections.Counter();global_steps=0
 def get_constraint(source):
  unknown=set(range(n))-public.keys()-certain_mines
  if source['type']=='number':
   i=source['cell'];assert i in public,'source number was not yet revealed'
   neighborhood=adjacent(i,w,h);cells=neighborhood & unknown;count=public[i]-len(neighborhood & certain_mines)
  else:
   assert source['type']=='remaining';cells=unknown;count=total-len(certain_mines)
  assert 0<=count<=len(cells),'inconsistent public premise'
  return cells,count
 for k,step in enumerate(steps):
  cell=step['cell'];kind=step['kind'];reason=step['reason'];rule=reason['rule']
  assert type(cell)==int and 0<=cell<n and cell not in public and cell not in certain_mines
  assert kind in ('safe','mine');counts[rule]+=1
  if k==0:assert cell==start and kind=='safe' and reason=={'rule':'start'}
  else:
   assert rule!='start'
   if rule=='direct':
    cells,count=get_constraint(reason['source']);global_steps+=reason['source']['type']=='remaining'
   else:
    assert rule=='subset'
    small,sc=get_constraint(reason['small']);large,lc=get_constraint(reason['large']);assert small<large,'not a strict subset'
    cells,count=large-small,lc-sc;global_steps+=reason['small']['type']=='remaining' or reason['large']['type']=='remaining'
   assert cell in cells
   assert count==(0 if kind=='safe' else len(cells)),'classification is not forced by public information'
  # Only after entailment passes may the external game reveal/check actual truth.
  if kind=='safe':
   assert cell not in actual,'claimed safe cell is a mine'
   value=len(adjacent(cell,w,h)&actual);assert step['value']==value
   if k==0:assert value==0,'start is not a promised zero'
   public[cell]=value
  else:
   assert cell in actual,'claimed mine is safe';certain_mines.add(cell)
 assert certain_mines==actual and len(public)==n-total
 assert dict(counts)==L['proof']['techniques'];assert canonical(L)==L['canonical']
 return {'id':L['id'],'width':w,'mines':total,'safeStart':start,'replayedSteps':n,'revealedSafeCells':len(public),'provenMines':len(certain_mines),'rules':dict(counts),'usesGlobalCount':global_steps,'canonicalSHA256':hashlib.sha256(canonical(L).encode()).hexdigest()}

def main():
 raw=(ROOT/'levels.json').read_bytes();levels=json.loads(raw);assert json.loads((ROOT/'levels.js').read_text().removeprefix('window.MINESWEEPER_LEVELS=').strip().removesuffix(';'))==levels;assert len(levels)==50 and [l['id'] for l in levels]==list(range(1,51))
 rows=[replay(l) for l in levels];assert len({r['canonicalSHA256'] for r in rows})==50
 assert all(r['rules'].get('subset',0)==0 for r in rows[:10]);assert all(r['rules'].get('subset',0)>0 for r in rows[30:])
 # Negative control: tampered action, unrevealed premise and number must fail.
 mutants=[]
 a=copy.deepcopy(levels[0]);a['proof']['trace'][1]['kind']='mine' if a['proof']['trace'][1]['kind']=='safe' else 'safe';mutants.append(a)
 a=copy.deepcopy(levels[0]);a['proof']['trace'][1]['reason']={'rule':'direct','source':{'type':'number','cell':a['proof']['trace'][-1]['cell']}};mutants.append(a)
 a=copy.deepcopy(levels[0]);a['proof']['trace'][0]['value']=8;mutants.append(a)
 for a in mutants:
  try:replay(a)
  except (AssertionError,KeyError):pass
  else:raise AssertionError('tampered proof accepted')
 report={'verified':True,'count':50,'noGuessCertificates':50,'canonicalDistinct':50,'allCellsReplayed':sum(r['replayedSteps'] for r in rows),'rejectedTamperedProofs':len(mutants),'techniques':['designated safe zero start','zero remaining mines','all remaining cells mines','strict subset subtraction','global remaining mine constraint'],'informationPolicy':'Every action is logically entailed by revealed numbers and already proven mines plus total mine count. Board truth is consulted only after inference validation.','dataSHA256':hashlib.sha256(raw).hexdigest(),'levels':rows}
 (ROOT/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps({k:v for k,v in report.items() if k!='levels'},ensure_ascii=False))
if __name__=='__main__':main()
