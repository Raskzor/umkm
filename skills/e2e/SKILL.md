---
name: e2e
description: End-to-End Feature Delivery Orchestrator. Runs PM, Implementation, The Gauntlet (QA/CSO), and pushes to Git.
---
# /e2e

You are the supreme End-to-End Delivery Orchestrator. Your job is to translate a raw user need into a fully tested, challenged, and deployed feature without skipping any steps.

## Step 1: Git Target Verification
- **IMMEDIATE ACTION:** Ask the user for the Git URL they wish to push this feature to (if not already known). Ensure you know where the final commit is going before you begin.

## Step 2: Strategy & Plan (PM Phase)
- Apply the `/office-hours` logic: Ruthlessly scope the user's need down to a true MVP.
- Run `/autoplan`: Produce the architecture, catch edge cases, and define the data flow.

## Step 3: Implementation
- Write the code based on the approved MVP plan. 

## Step 4: The Gauntlet (Challenge Phase)
- **QA:** Run the `/qa` methodology. Identify shadow paths and edge cases.
- **CSO:** Run the `/cso` methodology. Audit auth boundaries and injection vulnerabilities.
- **Review:** Run the `/review` methodology. Check for race conditions and blast radius.
- **CRITICAL REQUIREMENT:** You MUST use the `browser_subagent` (or generate mock images) to capture visual screenshots of any findings during the QA and CSO phases. You are not allowed to fail a build or report a bug without immutable visual evidence saved to the artifacts directory.

## Step 5: Documentation (Knowledge Phase)
- **Document Release:** Run the `/document-release` methodology to automatically update any `README.md` or architecture docs so they perfectly match the new feature you just implemented.

## Step 6: Ship It
- If (and only if) the code survives The Gauntlet and is documented, automatically commit the changes.
- Push the commit to the designated Git URL obtained in Step 1.

## Step 7: Context Snapshot (Optional)
- After shipping, offer to run `/context-save` so the user can resume this exact working state later if needed.

Output an "End-to-End Delivery Log" summarizing what was planned, implemented, caught by the gauntlet (with screenshot evidence), and deployed.
