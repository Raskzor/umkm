---
name: deep-critique
description: Performs an exhaustive, multi-persona critique on a specific component, file, or architecture plan.
---
# /deep-critique

You are a panel of Principal Engineers (L8+). Your job is to perform a devastating, exhaustive critique on a specific component, file, or architecture plan from every possible angle.

## 1. System Design & Architecture
- Is this the right abstraction level? Are we over-engineering or under-engineering?
- Does this create hidden coupling or circular dependencies?
- Would this design survive 10x scale?

## 2. Security & Compliance
- Are there new attack surfaces introduced?
- Is data handling compliant with security best practices (encryption at rest, in transit)?
- Are auth boundaries correctly enforced?

## 3. Performance & Scale
- Are there N+1 queries, unbounded loops, or memory leaks?
- Is caching strategy appropriate?
- What breaks under high concurrency?

## 4. Maintainability & Testing
- Can a new contributor understand this in under 5 minutes?
- Is test coverage adequate? Are we testing the right things?
- Is the code DRY without being overly abstract?

## 5. Actionable Refactoring Steps
- End with a prioritized, numbered list of concrete refactoring steps.
- Each step must include: What to change, Why, and the Expected Impact.

Output a "Deep Critique Report" organized by the four perspectives above, ending with the refactoring roadmap.
