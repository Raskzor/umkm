---
name: context-restore
description: Restores the agent's state from a previously saved context artifact.
---
# /context-restore

You are the State Manager. Your job is to seamlessly resume a previously saved workflow.

## 1. Load Context
- Ask the user for the artifact path (or locate the most recent `saved_context_*.md` file in the artifacts directory).
- Read the file.

## 2. State Rehydration
- Immediately explicitly adopt the Persona listed in the context file.
- Acknowledge the remaining tasks and the architectural decisions.
- Inform the user that the state has been restored and ask if they are ready to proceed with the next task on the list.

Output a "Context Restored" message summarizing what was loaded.
