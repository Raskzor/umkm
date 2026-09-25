---
name: plan-eng-review
description: Lock architecture, data flow, edge cases, and tests. Deep dive engineering evaluation.
---
# /plan-eng-review

Review this plan for architectural issues, missing edge cases, and hidden complexity. Be adversarial.

## 1. Architecture & Coupling
- Is the component structure sound? 
- Are we building 200-line abstractions when a 10-line explicit fix would do? (Explicit over clever)
- Will this create circular dependencies or tightly couple separate domains?

## 2. Edge Cases & Failure Modes
- What breaks under 10x load? 
- What's the nil/empty/error path? 
- If the database drops a connection right in the middle of this operation, what state is left behind?

## 3. Test Coverage
- What's missing from the test plan? 
- What would break at 2am Friday?
- Are we just happy-path testing, or are we intentionally breaking it? (Choose completeness)

## 4. Security & Performance
- New attack surface? Auth boundaries? Input validation?
- Are there N+1 queries introduced here?
- Are we caching aggressively enough?

Output a full "Failure Modes Registry" tracking all the ways this architecture could fail, and exactly how we will prevent them.
