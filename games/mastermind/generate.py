"""Deterministic Mastermind clue-challenge generator; standard duplicate-aware feedback."""
import random,itertools,json,hashlib,collections,pathlib
R=random.Random(284719)
ROOT=pathlib.Path(__file__).parent

def feedback(secret,guess):
    exact=sum(a==b for a,b in zip(secret,guess))
    total=sum((collections.Counter(secret)&collections.Counter(guess)).values())
    return (exact,total-exact)

def canonical(p):
    # Exhaustive position permutations and color relabelings: row ordering is irrelevant.
    best=None
    for perm in itertools.permutations(range(p['length'])):
        secret=tuple(p['solution'][i] for i in perm)
        # Relabel secret's used colors by first occurrence. Remaining colors permute freely.
        used=list(dict.fromkeys(secret)); missing=[x for x in range(p['colors']) if x not in used]
        for extra in itertools.permutations(missing):
            mapping={old:new for new,old in enumerate(used+list(extra))}
            s=tuple(mapping[x] for x in secret)
            clues=tuple(sorted((tuple(mapping[c['guess'][i]] for i in perm),tuple(c['feedback'])) for c in p['clues']))
            key=(s,clues)
            if best is None or key<best:best=key
    return hashlib.sha256(repr((p['length'],p['colors'],p['repeat'],best)).encode()).hexdigest()

levels=[];seen=set()
for idx in range(50):
    stage=idx//10
    n,k,repeat=[(3,4,False),(4,5,False),(4,5,True),(4,6,True),(5,6,True)][stage]
    codes=list(itertools.product(range(k),repeat=n)) if repeat else list(itertools.permutations(range(k),n))
    while True:
        secret=R.choice(codes)
        if repeat and len(set(secret))==n:continue
        remaining=codes[:];clues=[]
        # Vary clue selection among good splits to make distinct deduction structures.
        while len(remaining)>1:
            pool=R.sample(codes,min(240,len(codes)))
            ranked=[]
            for guess in pool:
                if guess==secret or any(tuple(c['guess'])==guess for c in clues):continue
                fb=feedback(secret,guess)
                survivors=[code for code in remaining if feedback(code,guess)==fb]
                if len(survivors)<len(remaining):ranked.append((len(survivors),guess,fb,survivors))
            if not ranked:break
            ranked.sort(key=lambda x:x[0]); limit=min(4,len(ranked))
            pick=ranked[R.randrange(limit)] if len(remaining)>12 else ranked[0]
            _,guess,fb,remaining=pick
            clues.append({'guess':list(guess),'feedback':list(fb)})
        if len(remaining)!=1:continue
        # Remove redundant clues. Every retained clue is necessary for uniqueness.
        for c in clues[:]:
            rest=[x for x in clues if x is not c]
            if sum(all(feedback(code,x['guess'])==tuple(x['feedback']) for x in rest) for code in codes)==1:clues=rest
        p={'id':idx+1,'length':n,'colors':k,'repeat':repeat,'limit':8,'clues':clues,'solution':list(secret),'space':len(codes)}
        sig=canonical(p)
        if sig not in seen:seen.add(sig);p['canonicalHash']=sig;levels.append(p);break
    print('Mastermind',idx+1,n,k,len(clues),flush=True)
(ROOT/'levels.json').write_text(json.dumps(levels,separators=(',',':')))
(ROOT/'levels.js').write_text('window.MASTERMIND_LEVELS='+json.dumps(levels,separators=(',',':'))+';\n')
