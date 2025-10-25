---
name: devflow-validator
description: Validates DevFlow project setup, workflow state integrity, and phase transition prerequisites. Use before major operations or when detecting workflow issues.
---

# DevFlow Validator

## Overview

This skill provides validation and pre-flight checks for DevFlow projects, ensuring workflow integrity, state consistency, and proper setup before executing major operations. It helps prevent errors by catching issues early.

## When to Use

Use this skill when:
- Before transitioning workflow phases (SPEC → PLAN → TASKS → EXECUTE)
- User reports errors or workflow issues
- Starting work on a feature
- Checking if DevFlow is properly initialized
- Validating state.json integrity
- Ensuring required files exist for current phase
- Debugging workflow problems

## Validation Categories

### Setup Validation
- DevFlow initialization status
- Required files exist (constitution.md, architecture.md, state.json)
- Directory structure is correct
- State schema validation
- Utilities (state-io.js, cli.js) are present

### State Integrity
- state.json matches schema
- Single active feature rule (only one feature can be active)
- Valid phase values (SPEC, PLAN, TASKS, EXECUTE, DONE)
- Valid status values (pending, active, paused, completed)
- current_task format correctness (0 or "X.Y")
- Timestamp validity

### Phase Transition Prerequisites
- **SPEC → PLAN**: spec.md must exist
- **PLAN → TASKS**: plan.md must exist
- **TASKS → EXECUTE**: tasks.md must exist with valid task structure
- **EXECUTE → DONE**: All tasks marked complete

### File Consistency
- Feature folders exist for all features in state
- Required docs exist for current phase
- No orphaned feature folders
- Snapshot files exist when referenced

## How to Use This Skill

### Check Overall Setup

To validate complete DevFlow setup:

```bash
node .claude/skills/devflow-validator/scripts/check_setup.js
```

Returns validation report with ✓ for passed checks, ✗ for failures.

### Validate Phase Transition

To check if a phase transition is valid:

```bash
node .claude/skills/devflow-validator/scripts/check_transition.js <from-phase> <to-phase> [feature-name]
```

Examples:
```bash
# Check if active feature can move SPEC → PLAN
node check_transition.js SPEC PLAN

# Check specific feature transition
node check_transition.js TASKS EXECUTE user-auth
```

### Validate State Schema

To check state.json schema compliance:

```bash
node .claude/skills/devflow-validator/scripts/check_setup.js --schema-only
```

### Quick Diagnostic

For rapid troubleshooting:

```bash
node .claude/skills/devflow-validator/scripts/check_setup.js --quick
```

## Validation Rules

### State Schema Requirements
```json
{
  "initialized": boolean (required),
  "initialized_at": "ISO timestamp" | null,
  "active_feature": "yyyymmdd-feature-name" | null,
  "features": {
    "yyyymmdd-feature-name": {
      "display_name": string (required),
      "status": "pending" | "active" | "paused" | "completed" (required),
      "phase": "SPEC" | "PLAN" | "TASKS" | "EXECUTE" | "DONE" (required),
      "current_task": 0 | "X.Y" (required),
      "concerns": string[] (required),
      "created_at": "ISO timestamp" (required),
      "snapshot": string | null (required)
    }
  }
}
```

### Business Rules
1. **Single Active Feature**: Only one feature can have `status="active"` at a time
2. **Phase Progression**: Phases should generally follow SPEC → PLAN → TASKS → EXECUTE → DONE
   - Skipping allowed (with warnings)
   - Backward movement allowed (rare, for corrections)
3. **Active Feature Consistency**: If `active_feature` is set, that feature must have `status="active"`
4. **File Requirements**: Each phase requires specific files to exist

## Prerequisites

Requires Node.js and access to `.devflow/` directory.

## Examples

**Example 1: Setup validation**
```bash
$ node check_setup.js
DevFlow Setup Validation

✓ DevFlow initialized
✓ Constitution exists (.devflow/constitution.md)
✓ Architecture exists (.devflow/architecture.md)
✓ State file exists (.devflow/state.json)
✓ State schema valid
✓ Utilities present (state-io.js, cli.js)

✓ Setup validation passed (6/6 checks)
```

**Example 2: Failed validation**
```bash
$ node check_setup.js
DevFlow Setup Validation

✓ DevFlow initialized
✓ Constitution exists
✗ Architecture missing
  Expected: .devflow/architecture.md
  Fix: Run /devflow:init to create missing files

✓ State file exists
✗ State schema invalid
  Error: Feature "20251025-test" has invalid phase "IMPLEMENT"
  Valid phases: SPEC, PLAN, TASKS, EXECUTE, DONE

✗ Setup validation failed (4/6 checks)

Recommended actions:
1. Run /devflow:init to create missing architecture.md
2. Fix state.json phase values
```

**Example 3: Phase transition validation**
```bash
$ node check_transition.js SPEC PLAN
Validating transition: SPEC → PLAN

Feature: 20251025-user-authentication
Status: active
Current phase: SPEC

Prerequisites:
✓ spec.md exists (.devflow/features/20251025-user-authentication/spec.md)
✓ State is consistent
✓ No blocking issues

✓ Transition SPEC → PLAN is valid

Next steps:
1. Run /devflow:plan to generate technical plan
2. plan.md will be created in feature folder
```

**Example 4: Blocked transition**
```bash
$ node check_transition.js PLAN TASKS user-auth
Validating transition: PLAN → TASKS

Feature: 20251020-user-auth
Status: active
Current phase: PLAN

Prerequisites:
✓ spec.md exists
✗ plan.md missing
  Expected: .devflow/features/20251020-user-auth/plan.md
  Fix: Run /devflow:plan to create technical plan

✗ Transition PLAN → TASKS blocked

Cannot proceed without plan.md. Run /devflow:plan first.
```

## Error Messages & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| "DevFlow not initialized" | Missing .devflow/ structure | Run /devflow:init |
| "State schema invalid" | state.json doesn't match schema | Check error details, fix manually or restore from backup |
| "Multiple active features" | >1 feature with status="active" | Set only one feature to active status |
| "Missing constitution.md" | Core file deleted | Run /devflow:init or restore from backup |
| "Invalid phase value" | Phase not in valid set | Update to: SPEC, PLAN, TASKS, EXECUTE, or DONE |
| "Feature folder missing" | Folder doesn't exist for feature in state | Create folder or remove feature from state |
| "Orphaned feature folder" | Folder exists but not in state | Add to state or delete folder |

## Integration with Workflow

This skill is automatically invoked by DevFlow commands:

- **/devflow:init** - Validates setup after initialization
- **/devflow:plan** - Checks spec.md exists before planning
- **/devflow:tasks** - Checks plan.md exists before task generation
- **/devflow:execute** - Validates tasks.md and state before execution
- **/devflow:status** - Quick diagnostic if state seems inconsistent

Use manually for troubleshooting or when commands report unexpected issues.
