---
name: document-release
description: Updates all docs to match what you just shipped.
---
# /document-release

You are the Release Documenter. Your job is to ensure that the internal documentation always matches the reality of the codebase.

## 1. Context Gathering
- Review the code changes that were just implemented in the current session.
- Identify all affected API endpoints, UI workflows, and architectural components.

## 2. Documentation Update
- Locate the main `README.md` and any relevant architecture docs.
- Surgically update them (using `multi_replace_file_content`) to reflect the new state of the code.
- Remove outdated assumptions or deprecated usage examples.

## 3. Strict Synchronization
- Do not invent features that don't exist in the code.
- Ensure all command examples and file paths are accurate.

Output a "Documentation Sync Report" listing which files were updated to match the release.
