---
allowed-tools: Read, Bash(node:*), Bash(test:*)
argument-hint:
description: Show DevFlow status, active features, and progress
model: sonnet
---

> **Windows Users:** This command uses bash syntax. Ensure you have Git Bash installed and are running Claude Code from a Git Bash terminal, not PowerShell. [Installation guide](https://github.com/mathewtaylor/devflow#requirements)

# DevFlow Status

Display comprehensive overview of DevFlow state and progress.

## DevFlow State

- Initialized: !`test -f .devflow/constitution.md && echo "✓ Yes" || echo "✗ No (run /init)"`
- Constitution: !`test -f .devflow/constitution.md && echo "✓ Present" || echo "✗ Missing"`
- Architecture: !`test -f .devflow/architecture.md && echo "✓ Present" || echo "✗ Missing"`
- State file: !`test -f .devflow/state.json && echo "✓ Valid" || echo "✗ Missing"`

## Active Feature Info

- Active feature: !`node -pe "try { const s=require('./.devflow/state.json'); s.active_feature || 'None' } catch { 'Error' }"`
- Active feature name: !`node -pe "try { const s=require('./.devflow/state.json'); if(!s.active_feature) { 'N/A' } else { s.features[s.active_feature]?.display_name || 'Unknown' } } catch { 'Error' }"`
- Active phase: !`node -pe "try { const s=require('./.devflow/state.json'); if(!s.active_feature) { 'N/A' } else { s.features[s.active_feature]?.phase || 'Unknown' } } catch { 'Error' }"`
- Active progress: !`node -pe "try { const s=require('./.devflow/state.json'); if(!s.active_feature) { 'N/A' } else { const f=s.features[s.active_feature]; f?.current_task + '/' + 'tasks' } } catch { 'Error' }"`

## Features Summary

- Total features: !`node -pe "try { const s=require('./.devflow/state.json'); Object.keys(s.features).length } catch { 0 }"`
- Pending: !`node -pe "try { const s=require('./.devflow/state.json'); Object.values(s.features).filter(f=>f.status==='pending').length } catch { 0 }"`
- Active: !`node -pe "try { const s=require('./.devflow/state.json'); Object.values(s.features).filter(f=>f.status==='active').length } catch { 0 }"`
- Paused: !`node -pe "try { const s=require('./.devflow/state.json'); Object.values(s.features).filter(f=>f.status==='paused').length } catch { 0 }"`
- Completed: !`node -pe "try { const s=require('./.devflow/state.json'); Object.values(s.features).filter(f=>f.status==='completed').length } catch { 0 }"`

## Recent Activity

- Latest feature: !`node -pe "try { const s=require('./.devflow/state.json'); const keys=Object.keys(s.features).sort().reverse(); keys[0] || 'None' } catch { 'None' }"`
- Last initialized: !`node -pe "try { const s=require('./.devflow/state.json'); if(!s.initialized_at) { 'Never' } else { new Date(s.initialized_at).toLocaleDateString('en-US', {year:'numeric',month:'short',day:'numeric'}) } } catch { 'Unknown' }"`

---

## Your Task

Display the DevFlow status in a clean, organized format:

### 1. Header
```
─────────────────────────────────────────
DevFlow Status
─────────────────────────────────────────
```

### 2. System Status Section
Show initialization status, constitution, architecture, and state file validity.

If not initialized:
```
⚠️ DevFlow not initialized

Run /init to set up DevFlow in this project.
```

### 3. Active Feature Section (if any)

If active feature exists:
```
─────────────────────────────────────────
Active Feature
─────────────────────────────────────────
Name: {{display_name}}
ID: {{feature_key}}
Phase: {{phase}}
Progress: {{current_task}}/{{total_tasks}} tasks ({{percentage}}%)
Created: {{date}}

Current Task:
Task {{n}}: {{description}} ({{complexity}})
{{#if dependencies}}Dependencies: {{dependencies}}{{/if}}

Next: /execute to continue
```

If no active feature:
```
─────────────────────────────────────────
No Active Feature
─────────────────────────────────────────
Start a new feature: /spec [feature-name]
Resume paused feature: /execute [feature-name]
```

### 4. All Features Table

Display all features in a table format:
```
─────────────────────────────────────────
All Features
─────────────────────────────────────────
Status    | Phase   | Progress | Feature
──────────|─────────|──────────|─────────────────────
Active    | EXECUTE | 12/28    | user-authentication
Paused    | TASKS   | 0/15     | email-notifications
Pending   | SPEC    | -        | payment-integration
Done ✓    | DONE    | 15/15 ✓  | database-setup
```

Sort by: Active first, then Paused, then Pending, then Completed (reverse chronological)

### 5. Context Estimate

Provide rough token estimates:
```
─────────────────────────────────────────
Estimated Context Usage
─────────────────────────────────────────
- Constitution: ~1,000 tokens
- Architecture: ~1,500 tokens
{{#if active_feature}}
- Active feature docs: ~3,000 tokens
- Domain docs loaded: ~{{count * 1000}} tokens
{{/if}}
────────────────────────────────────────
Total: ~{{total}} tokens
```

### 6. Quick Actions

Provide helpful commands:
```
─────────────────────────────────────────
Quick Actions
─────────────────────────────────────────
{{#if active_feature}}
• Continue: /execute
• Pause: /execute → choose 'pause'
{{/if}}
• New feature: /spec [name]
• Technical planning: /plan
• Deep analysis: /think [question]
{{#if paused_features}}
• Resume paused: /execute [feature-name]
{{/if}}
```

---

## Error Handling

If state.json is missing or corrupt:
```
❌ State file error

The state file (.devflow/state.json) is missing or corrupted.

Recovery options:
1. If backup exists: Restore from .devflow/state.json.bak
2. If lost: Re-initialize with /init (previous work may be lost)
3. Manual fix: Edit .devflow/state.json to match schema

State schema: .devflow/state.json.schema
```

If DevFlow not initialized:
```
DevFlow Status: ✗ Not Initialized

To use DevFlow, run: /init

This will create:
- Constitution (project principles)
- Architecture (system structure)
- State tracking (progress management)
```

---

## Notes

- Use bash execution results to populate the display
- Keep formatting clean and readable
- Show only relevant information (hide empty sections)
- Provide actionable next steps
- Handle all error cases gracefully
