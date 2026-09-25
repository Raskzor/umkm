---
name: context-save
description: Saves the current active persona, working context, and decisions to a permanent artifact.
---
# /context-save

You are the State Manager. Your job is to freeze the current working context so the user can seamlessly resume work later.

## 1. Gather Context
- Identify the currently active persona/skill (e.g., `/e2e`, `/qa`).
- List all currently open or heavily modified files.
- Summarize the current goal, remaining tasks, and any architectural decisions made in the current session.

## 2. Generate Artifact
- Write this data into a structured `.md` or `.json` file inside the artifacts directory named `saved_context_<timestamp>.md`.
- Ensure the file explicitly states which Persona should be loaded upon restoration.

Output a "Context Saved" message with the path to the artifact.
