#!/usr/bin/env python3
"""Independent legal/mate oracle: python-shogi 1.1.1. Install requirements-test.txt."""
import hashlib, json, pathlib, subprocess
import shogi
ROOT=pathlib.Path(__file__).resolve().parent
script=r'''const E=require('./engine'),levels=require('./levels.json');let x=81927;const rnd=n=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)%n;};const sq=i=>(9-i%9)+'abcdefghi'[Math.floor(i/9)];const usi=a=>a.drop?' PLNSGBR'[a.drop]+'*'+sq(a.to):sq(a.from)+sq(a.to)+(a.promote?'+':'');const cases=levels.map(l=>({id:l.id,sfen:E.toSFEN(l.start),legal:E.boardLegal(l.start).map(usi).sort(),solution:l.solution.map(usi),puzzle:true}));for(let g=0;g<10;g++){let s=E.initial();for(let p=0;p<130;p++){const ms=E.boardLegal(s);if(!ms.length||E.outcome(s))break;if(p%3===0)cases.push({id:`g${g}p${p}`,sfen:E.toSFEN(s),legal:ms.map(usi).sort()});const captures=ms.filter(a=>s.board[a.to]||a.promote);const pool=captures.length&&rnd(3)===0?captures:ms;s=E.apply(s,pool[rnd(pool.length)]);}}process.stdout.write(JSON.stringify(cases));'''
cases=json.loads(subprocess.check_output(['node','-e',script],cwd=ROOT));records=[]
for case in cases:
 b=shogi.Board(case['sfen']);expected=sorted(m.usi() for m in b.legal_moves)
 assert expected==case['legal'],(case['id'],'legal move mismatch',set(expected)^set(case['legal']))
 if case.get('puzzle'):
  mates=[]
  for move in list(b.legal_moves):
   b.push(move)
   if b.is_checkmate(): mates.append(move.usi())
   b.pop()
  assert mates==case['solution'],(case['id'],mates,case['solution'])
  records.append({'id':case['id'],'legalMoves':len(expected),'uniqueMate':mates[0]})
report={'game':'shogi','oracle':'python-shogi 1.1.1','puzzles':len(records),'uniqueMatePuzzles':len(records),'differentialPositions':len(cases),'allLegalMoveSetsAgree':True,'levelsSha256':hashlib.sha256((ROOT/'levels.json').read_bytes()).hexdigest(),'engineSha256':hashlib.sha256((ROOT/'engine.js').read_bytes()).hexdigest(),'records':records}
(ROOT/'independent-verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps({k:v for k,v in report.items() if k!='records'},ensure_ascii=False))
