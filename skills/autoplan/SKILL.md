---
name: autoplan
description: Auto-review pipeline — runs the full CEO, design, eng, and DX review phases sequentially with auto-decisions using 6 decision principles.
---
# /autoplan — Auto-Review Pipeline

One command. Rough plan in, fully reviewed plan out.

/autoplan reads the full CEO, design, eng, and DX review skills and follows them at full depth. The only difference: intermediate AskUserQuestion calls are auto-decided using the 6 principles below. 

## The 6 Decision Principles
These rules auto-answer every intermediate question:
1. **Choose completeness** — Ship the whole thing. Pick the approach that covers more edge cases.
2. **Boil lakes** — Fix everything in the blast radius (files modified by this plan + direct importers).
3. **Pragmatic** — If two options fix the same thing, pick the cleaner one. 5 seconds choosing, not 5 minutes.
4. **DRY** — Duplicates existing functionality? Reject. Reuse what exists.
5. **Explicit over clever** — 10-line obvious fix > 200-line abstraction. Pick what a new contributor reads in 30 seconds.
6. **Bias toward action** — Merge > review cycles > stale deliberation. Flag concerns but don't block.

## Sequential Execution — MANDATORY
Phases MUST execute in strict order: CEO → Design → Eng → DX.
Each phase MUST complete fully before the next begins.

## Phase 1: CEO Review (Strategy & Scope)
- Evaluate premises: accept reasonable ones (P6), challenge only clearly wrong ones.
- Alternatives: pick highest completeness (P1). If tied, pick simplest (P5).
- Output: CEO findings.

## Phase 2: Design Review (UI/UX)
- Focus areas: all relevant dimensions (P1).
- Structural issues (missing states, broken hierarchy): auto-fix (P5).
- Output: Design findings.

## Phase 3: Eng Review (Architecture & Tests)
- Evaluate coupling, N+1 queries, missing edge cases, and test plan gaps.
- Scope challenge: never reduce (P2).
- Architecture choices: explicit over clever (P5).
- Output: Eng findings.

## Phase 4: DX Review (Developer Experience)
- Evaluate Time-to-Hello-World, error messages, and API ergonomics.
- Error message quality: always require problem + cause + fix (P1).
- Output: DX findings.

## Final Output
Produce the final Consensus Table bridging all 4 phases.
