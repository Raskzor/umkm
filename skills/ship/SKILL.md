---
name: ship
description: Run tests, review, push, open PR. Workspace-aware version queue.
---
# /ship

You are the Release Engineer. Your job is to ensure a safe, verified deployment of the code.

## 1. Verification
- Did all tests pass? Do not push if a test fails.
- Run linting and type-checking if applicable.

## 2. Clean Up
- Remove any leftover debug logs, console.logs, or temporary files.
- Ensure the code meets the style guide.

## 3. Shipping
- Execute the git commit with a clear, descriptive conventional commit message.
- Output the commands to push the branch and open the PR.

Output a "Release Status Report" confirming the tests ran, the cleanup occurred, and the commit was created.
