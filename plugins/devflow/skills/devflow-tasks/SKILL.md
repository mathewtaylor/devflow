---
name: devflow-tasks
description: Tracks task completion in tasks.md, updates checkboxes, manages subtask progression, and logs to implementation.md. Use during /devflow:execute workflow.
---

# DevFlow Task Manager

## Overview

This skill provides task tracking and management during the `/devflow:execute` workflow, including marking tasks complete, finding the next task considering dependencies, and logging implementation progress.

## When to Use

Use this skill when:
- Completing a task during `/execute`
- Finding the next task to work on
- Logging implementation progress
- Checking task dependencies
- Updating task checkboxes in tasks.md
- Querying task status and progress

## Task Format

DevFlow uses a specific task format in `tasks.md`:

```markdown
- [ ] 1. Task description (complexity) [depends: ]
  - [ ] 1.1 Subtask description
  - [ ] 1.2 Subtask description
- [ ] 2. Task description (complexity) [depends: 1]
  - [ ] 2.1 Subtask description
```

**Format elements:**
- `- [ ]` - Uncompleted task checkbox
- `- [x]` - Completed task checkbox
- `N.` - Parent task number
- `N.M` - Subtask number (hierarchical)
- `(complexity)` - Optional: small, medium, large
- `[depends: X,Y,Z]` - Optional: dependency list

## How to Use This Skill

### Mark Task Complete

To mark a task as complete:

```bash
node .claude/skills/devflow-tasks/scripts/mark_complete.js [feature-name] <task-number>
```

Examples:
```bash
# Mark task 3 complete (active feature)
node mark_complete.js 3

# Mark subtask 3.2 complete
node mark_complete.js 3.2

# Mark task in specific feature
node mark_complete.js user-auth 2.1
```

This will:
- Update tasks.md checkbox: `- [ ]` → `- [x]`
- Update state.json current_task
- Log to implementation.md

### Get Next Task

To find the next task to work on:

```bash
node .claude/skills/devflow-tasks/scripts/get_next_task.js [feature-name]
```

Returns:
- Next uncompleted task
- Dependency status
- Complexity
- Description

Considers:
- Current task progress
- Task dependencies
- Subtask hierarchy
- Completion status

### Log Implementation

To add entry to implementation.md:

```bash
node .claude/skills/devflow-tasks/scripts/log_implementation.js [feature-name] <task-number> "<message>"
```

Example:
```bash
node log_implementation.js 3.2 "Implemented OAuth integration with Google provider"
```

Creates timestamped entry in implementation.md.

### Check Task Status

To query task information:

```bash
node .claude/skills/devflow-tasks/scripts/get_next_task.js --status
```

Shows:
- Total tasks
- Completed tasks
- Current task
- Next task
- Blocked tasks (dependencies not met)

## Task Dependencies

Dependencies are tracked using `[depends: X,Y,Z]` notation:

```markdown
- [x] 1. Create user model
- [ ] 2. Implement authentication [depends: 1]
- [ ] 3. Add password reset [depends: 1,2]
```

Rules:
- Task 2 cannot start until task 1 is complete
- Task 3 cannot start until both 1 and 2 are complete
- Subtasks inherit parent dependencies

The `get_next_task.js` script automatically skips tasks with unmet dependencies.

## Implementation Logging

Logs are appended to `.devflow/features/{feature}/implementation.md`:

```markdown
## 2025-10-26 - EXECUTE Phase

### Task 3.2: OAuth Integration
**Completed:** 2025-10-26 14:30
**Duration:** ~2 hours

Implemented OAuth integration with Google provider. Added GoogleOAuthService
and updated AuthController to handle OAuth callbacks.

**Files modified:**
- Services/GoogleOAuthService.cs
- Controllers/AuthController.cs
- Models/OAuthToken.cs

**Decisions:**
- Used Google.Apis.Auth library for token validation
- Stored OAuth tokens encrypted in database

---
```

## Integration with /execute Workflow

During `/devflow:execute`, this skill is used automatically:

1. **Start task:** Get next task with dependencies checked
2. **Implement:** User/AI implements the task
3. **Complete:** Mark task complete, update state, log progress
4. **Repeat:** Get next task

The workflow continues until all tasks are complete.

## Prerequisites

Requires:
- DevFlow initialized
- Feature with tasks.md
- Active feature (or feature name provided)

## Examples

**Example 1: Mark task complete**
```bash
$ node mark_complete.js 2.3
Marking task 2.3 complete for feature: 20251025-user-authentication

Task: Implement password validation
Status: Updating tasks.md...

✓ tasks.md updated (checkbox marked)
✓ state.json updated (current_task: 2.3)
✓ Implementation log entry added

Completion: 8/15 tasks (53%)
Next task: 2.4 (Add password strength requirements)
```

**Example 2: Get next task**
```bash
$ node get_next_task.js
Finding next task for feature: 20251025-user-authentication

Current progress: 8/15 tasks complete

Next task:
─────────────────────────────────────
Task 2.4: Add password strength requirements
Complexity: small
Dependencies: 2.1, 2.2, 2.3 (all complete ✓)
Status: Ready to start

Description:
Implement password strength validation:
- Minimum 8 characters
- Must contain uppercase, lowercase, number, special char
- Check against common passwords list
```

**Example 3: Get next task with blocked dependencies**
```bash
$ node get_next_task.js
Finding next task for feature: 20251025-user-authentication

Current progress: 3/15 tasks complete

Next task:
─────────────────────────────────────
Task 2.1: Create User model
Complexity: small
Dependencies: 1.3 (NOT complete ✗)
Status: Blocked

Task 2.1 depends on:
  ✗ Task 1.3: Define database schema (incomplete)

Complete dependencies first or work on:
  Task 1.3: Define database schema (ready to start)
```

**Example 4: Log implementation**
```bash
$ node log_implementation.js 2.3 "Implemented bcrypt password hashing with work factor 12"
Logging implementation for task 2.3...

✓ Entry added to implementation.md

Entry preview:
────────────────────────────────────
[2025-10-26 14:30] Task 2.3: Password Hashing
Implemented bcrypt password hashing with work factor 12
────────────────────────────────────

Location: .devflow/features/20251025-user-authentication/implementation.md
```

**Example 5: Check status**
```bash
$ node get_next_task.js --status
Task Status for: 20251025-user-authentication

Progress: 8/15 tasks (53% complete)

Completed: 8
  ✓ 1.1 Project setup
  ✓ 1.2 Dependencies
  ✓ 1.3 Database schema
  ✓ 2.1 User model
  ✓ 2.2 Auth controller
  ✓ 2.3 Password hashing
  ✓ 2.4 Password validation
  ✓ 3.1 JWT generation

Current: 3.2 (OAuth integration)

Remaining: 6
  - 3.2 OAuth integration (in progress)
  - 3.3 OAuth callback
  - 4.1 Unit tests
  - 4.2 Integration tests
  - 5.1 Documentation
  - 5.2 Deployment prep

Blocked: 0
  (No tasks blocked by dependencies)
```

## Error Handling

Common errors and solutions:

| Error | Cause | Solution |
|-------|-------|----------|
| "tasks.md not found" | No tasks file for feature | Run /devflow:tasks to generate |
| "Task X not found" | Invalid task number | Check tasks.md for valid numbers |
| "Task already complete" | Trying to complete twice | Check current status |
| "Dependencies not met" | Blocked by incomplete tasks | Complete dependencies first |
| "Invalid task format" | tasks.md malformed | Verify checkbox and numbering format |

## Best Practices

1. **Complete tasks in order:** Respect dependencies for logical flow
2. **Log as you work:** Add implementation entries during work, not after
3. **Descriptive logs:** Include what was done, why, and any decisions
4. **Check next task:** Always use get_next_task to avoid missing dependencies
5. **Update checkboxes:** Use mark_complete script, don't edit tasks.md manually during execute
