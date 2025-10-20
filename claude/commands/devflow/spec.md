---
allowed-tools: Read, Write, AskUserQuestion, Task(state-manager), Bash(test:*), Bash(node:*)
argument-hint: [feature-name]
description: Create feature specification through interactive wizard
model: sonnet
---

> **Windows Users:** This command uses bash syntax. Ensure you have Git Bash installed and are running Claude Code from a Git Bash terminal, not PowerShell. [Installation guide](https://github.com/mathewtaylor/devflow#requirements)

# Create Feature Specification

Create a comprehensive specification for: **$ARGUMENTS**

## Current State

- DevFlow initialized: !`test -f .devflow/constitution.md && echo "✓" || (echo "✗ Run /init first" && exit 1)`
- Active feature: !`node -pe "try { const s=require('./.devflow/state.json'); s.active_feature || 'none' } catch { 'none' }"`
- Total features: !`node -pe "try { const s=require('./.devflow/state.json'); Object.keys(s.features).length } catch { 0 }"`

## Project Context

@.devflow/constitution.md
@.devflow/domains/_index.md

## Your Task

Generate feature folder name: `yyyymmdd-feature-slug`
- Date: Today (yyyymmdd format)
- Slug: $ARGUMENTS lowercased, spaces→hyphens, special chars removed
- Example: "user authentication" → "20251020-user-authentication"

Check if active feature exists. If yes, inform user and ask to continue (feature will be pending).

---

## Specification Wizard

Run interactive wizard to gather:

1. **Problem statement** - What problem does this solve? (2-3 sentences)

2. **Goals** - What should users be able to do?

3. **User stories** (2-5 stories):
   - Format: "As a [user type], I want to [action], so that [benefit]"
   - Collect one at a time until user says "done"

4. **Acceptance criteria** - What must be true when complete?
   - Collect one at a time until user says "done"

5. **Technical requirements** - Specific constraints or integrations?

6. **Dependencies**:
   - External services/APIs?
   - Other features that must be completed first?
   - Database schema changes?

7. **Cross-cutting concerns** (from domains/_index.md):
   - Present available concerns as checkboxes
   - User selects all that apply
   - These drive context loading in /plan and /execute

8. **Risks and challenges** - Known issues or complexities?

9. **Out of scope** - What is explicitly NOT included?

---

## Generate Specification

Create `.devflow/features/{{featureKey}}/spec.md`:

```markdown
# Feature Specification: {{Display Name}}

**Status:** Pending
**Created:** {{ISO timestamp}}
**Feature ID:** {{featureKey}}

## Problem Statement
{{gathered}}

## Goals and Objectives
{{gathered}}

## User Stories
{{list}}

## Acceptance Criteria
{{checklist}}

## Technical Requirements
{{gathered}}

## Dependencies
{{gathered}}

## Cross-Cutting Concerns
{{list of tagged concerns}}

## Risks and Challenges
{{gathered}}

## Out of Scope
{{gathered}}
```

---

## Update State

Invoke State Manager agent to add feature to state.json:
```json
{
  "{{featureKey}}": {
    "display_name": "{{Display Name}}",
    "status": "pending",
    "phase": "SPEC",
    "current_task": 0,
    "concerns": [{{selected concerns}}],
    "created_at": "{{ISO timestamp}}",
    "snapshot": null
  }
}
```

---

## Output

```
✅ Feature specification created!

Feature: {{Display Name}}
Location: .devflow/features/{{featureKey}}/
Status: Pending
Phase: SPEC
Concerns: {{list}}

Next: Run /plan to generate technical implementation plan
```
