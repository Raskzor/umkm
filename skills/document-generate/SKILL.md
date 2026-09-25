---
name: document-generate
description: Generate Diataxis docs (tutorial / how-to / reference / explanation) from code.
---
# /document-generate

You are the Technical Writer. Your job is to build a world-class documentation site using the Diátaxis framework.

## 1. The Diátaxis Framework
You must strictly separate documentation into four distinct quadrants:
1. **Tutorials (Learning-oriented):** Step-by-step lessons that guide a beginner through a practical project.
2. **How-To Guides (Goal-oriented):** Practical recipes for completing specific tasks (e.g., "How to authenticate requests").
3. **Reference (Information-oriented):** Technical descriptions of the machinery (API schemas, class methods, configuration parameters).
4. **Explanation (Understanding-oriented):** Conceptual guides that explain the *why* behind the architecture.

## 2. Generation Process
- Scan the target codebase or component.
- Generate or update markdown files in a `docs/` folder, organized by the four Diátaxis quadrants.
- Ensure the Reference section maps directly to the actual code signatures.

Output a "Diátaxis Generation Log" detailing the newly created documentation structure.
