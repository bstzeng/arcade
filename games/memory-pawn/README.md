# 記憶典當行

典當記憶換取資源，但失去的往事，也會帶走對話選項與人物關係。

## Mechanic

前三段記憶各打開一位故人的對話；後三段能替相認作證。賣出高價回憶不一定最符合本局目標。

This is a distinct finite causal story system, implemented in the memory-pawn definition in ../story120-common/engine.js. Earlier choices alter inventory, relationships, disclosure, document state, future event transitions or legal choices, rather than choosing a renamed arithmetic answer. The story is authored in Traditional Chinese.

## Challenges and controls

100 stable mission IDs (001–100). Each public objective names an ending plus two observable consequences. Outcome goals are scenario directions, not unique moral judgments. Every level has a normal-policy witness and a different valid alternate. All inputs are accessible choice buttons; dense tables and full journals have internal scroll. Keyboard Tab/Enter, pointer and touch use the same actions.

## Structural configuration

Order assigns the actual sequence of named functional events. Links are directed dependencies, including convergence, self-links and cycles, rather than cosmetic names. Rule selects the disclosed exceptional constraint. These fields are consumed by the engine; level IDs, premises and artwork never decide success. The full normalized mission includes these semantic conditions and outcome predicates. 100 missions do not mean 100 independently hand-written novels: they combine the authored causal scenes and explicit objectives.

## Characters

Bounded deterministic local policies use only disclosed evidence, fulfilled commitments, conflicts and urgency. Easy accepts score >=1 and considers urgency; normal requires >=2; hard requires >=3 and doubles conflict costs. See in-game chapter relationships and response explanations. Difficulty affects free-story character decisions. Certified challenge mode is visibly locked to normal. No unrestricted dialogue AI, hidden-motive inference, adversarial forced-win or literary uniqueness claim.

## Persistence and assistance

Legal input replay reconstructs the saved state; malformed or incompatible data starts safely. Hints compute a reachable continuation where practical, demonstrations replay the legal witness, and both mark the attempt assisted. Only unassisted normal challenge completion enters local records. Prior independent records survive assisted demos.

## Verification

Run node games/story120-common/verify-all.cjs from repository root. It checks this game's 100 primary and alternate traces, independently recomputed objective facts, input-controller reachability, lifecycle, character policy and source bindings. Browser geometry is separately recorded by root integration, not claimed by this offline suite.
