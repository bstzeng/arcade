#!/usr/bin/env python3
"""Independent oracle: python-chess 1.999 / chess 1.11.2. Install from requirements-test.txt."""
import hashlib, json, pathlib, subprocess, sys
import chess
ROOT=pathlib.Path(__file__).resolve().parent
script=r'''const E=require('./engine'),levels=require('./levels.json');let x=19937;const rnd=n=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)%n;};const uci=a=>E.coord(a.from)+E.coord(a.to)+(a.promote?' pnbrqk'[a.promote]:'');const cases=levels.map(l=>({id:l.id,fen:E.toFEN(l.start),legal:E.boardLegal(l.start).map(uci).sort(),solution:l.solution.map(uci),puzzle:true}));for(let g=0;g<12;g++){let s=E.initial();for(let p=0;p<90;p++){const ms=E.boardLegal(s);if(!ms.length||E.outcome(s))break;if(p%3===0)cases.push({id:`g${g}p${p}`,fen:E.toFEN(s),legal:ms.map(uci).sort()});const captures=ms.filter(a=>s.board[a.to]||a.promote);const pool=captures.length&&rnd(3)===0?captures:ms;s=E.apply(s,pool[rnd(pool.length)]);if(p%7!==0){const next=E.boardLegal(s);if(next.length&&!E.outcome(s))s=E.apply(s,next[rnd(next.length)]);}}}process.stdout.write(JSON.stringify(cases));'''
cases=json.loads(subprocess.check_output(['node','-e',script],cwd=ROOT))
records=[]
for case in cases:
 b=chess.Board(case['fen']); assert b.is_valid(),(case['id'],'invalid oracle position',b.status())
 expected=sorted(m.uci() for m in b.legal_moves)
 assert expected==case['legal'],(case['id'],'legal move mismatch',set(expected)^set(case['legal']))
 if case.get('puzzle'):
  mates=[]
  for move in list(b.legal_moves):
   b.push(move)
   if b.is_checkmate(): mates.append(move.uci())
   b.pop()
  assert mates==case['solution'],(case['id'],mates,case['solution'])
  records.append({'id':case['id'],'legalMoves':len(expected),'uniqueMate':mates[0]})
report={'game':'chess','oracle':'python-chess 1.999 / chess '+chess.__version__,'puzzles':len(records),'uniqueMatePuzzles':len(records),'differentialPositions':len(cases),'allLegalMoveSetsAgree':True,'levelsSha256':hashlib.sha256((ROOT/'levels.json').read_bytes()).hexdigest(),'engineSha256':hashlib.sha256((ROOT/'engine.js').read_bytes()).hexdigest(),'records':records}
(ROOT/'independent-verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items() if k!='records'},ensure_ascii=False))
