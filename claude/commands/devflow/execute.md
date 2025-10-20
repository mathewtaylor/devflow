---
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Task(reviewer), Task(tester), Task(state-manager)
argument-hint: [feature-name]?
description: Execute feature tasks with automated code review and testing
model: sonnet
---

> **Windows Users:** This command uses bash syntax. Ensure you have Git Bash installed and are running Claude Code from a Git Bash terminal, not PowerShell. [Installation guide](https://github.com/mathewtaylor/devflow#requirements)

# Execute Feature Implementation

Implement tasks for: **$1** (or active feature)

## Current State

- Active feature: !`node -pe "try { const s=require('./.devflow/state.json'); s.active_feature || 'none' } catch { 'none' }"`
- Feature exists: !`node -pe "try { const s=require('./.devflow/state.json'); const key = '$1' ? Object.keys(s.features).find(k=>k.includes('$1')) : s.active_feature; key || 'none' } catch { 'none' }"`

## Your Task

### Setup Phase

1. **Determine target feature:**
   - If $1 provided: Find matching feature key
   - If not: Use active_feature from state.json
   - If none: Show available features and error

2. **Validate feature:**
   - Must have tasks.md file
   - If missing: Error "Run /tasks first"

3. **Activate feature** (if not already active):
   - Invoke State Manager to set status="active"
   - Update active_feature in state.json

4. **Load context:**

@.devflow/constitution.md
@.devflow/architecture.md
@.devflow/features/{{featureKey}}/spec.md
@.devflow/features/{{featureKey}}/plan.md
@.devflow/features/{{featureKey}}/tasks.md

**Load relevant domain docs** based on feature's `concerns` array from state.json

---

### Execution Loop

**For each task from current_task to end:**

#### 1. Display Task

```
─────────────────────────────────────────
Task {{current_task + 1}}/{{total_tasks}}: {{task_description}} ({{complexity}})
{{#if dependencies}}Dependencies: {{dependencies}} ✓ All met{{/if}}
─────────────────────────────────────────

Continue? (y/n/skip/pause)
  y - Implement this task
  n - Stop execution
  skip - Mark complete without implementing (use cautiously)
  pause - Save progress and exit
```

#### 2. Check Dependencies

If task has `[depends: x,y,z]`:
- Verify those tasks are marked complete in tasks.md
- If not: Show which are incomplete, offer to:
  - Jump to incomplete dependency
  - Skip this task for now
  - Exit

#### 3. Implement Task

Based on task description:
- Write code following constitution standards
- Create new files or modify existing
- Follow patterns from architecture.md
- Apply relevant domain documentation rules
- Log what you're doing for implementation.md

#### 4. Code Review (with Extended Thinking)

**Skip review if task is:**
- Documentation only
- Configuration changes
- Test file creation

**For code tasks:**

Invoke **Code Reviewer agent** (opus with extended thinking) with:
- Code changes made
- Constitution standards
- Task description and acceptance criteria
- Relevant spec.md sections

**Handle review result:**

If `CHANGES_REQUIRED`:
```
⚠️ Code review found issues:

Critical Issues:
- {{issue with location and fix suggestion}}

Warnings:
- {{warning with location}}

Fixing issues... (attempt {{attempt}}/3)
```
- Fix the issues
- Re-invoke reviewer
- Max 3 attempts, then ask user:
  ```
  Unable to pass review after 3 attempts.

  Remaining issues: {{list}}

  Options:
  a) Continue anyway (not recommended)
  b) Skip this task
  c) Pause execution
  d) Let me try to fix manually

  Choose:
  ```

If `APPROVED`:
```
✓ Code review passed
{{#if warnings or suggestions}}
  Warnings: {{count}}
  Suggestions: {{count}}
{{/if}}
```

#### 5. Testing

**Skip testing if task is:**
- Documentation
- Configuration
- Test file itself

**For code tasks:**

Invoke **Test Engineer agent** with:
- Implemented code
- Constitution testing requirements
- Task acceptance criteria

**Handle test result:**

If `FAIL`:
```
✗ Tests failed ({{failed_count}}/{{total_count}})

Failed tests:
- {{test_name}}: {{failure_message}}

Fixing... (attempt {{attempt}}/3)
```
- Analyze failures
- Fix code or tests
- Re-run tests
- Max 3 attempts, then ask user

If `PASS`:
```
✓ Tests passed ({{passed_count}}/{{total_count}})
  Coverage: {{coverage}}% (target: {{target}}%)
```

#### 6. Mark Complete

- Update tasks.md: Change `- [ ]` to `- [x]` for this task
- Create/append to implementation.md:

```markdown
## Task {{number}}: {{description}}
**Completed:** {{ISO timestamp}}
**Complexity:** {{complexity}}
{{#if dependencies}}**Dependencies:** {{dependencies}}{{/if}}

### Implementation
{{summary of what was done}}

### Code Review
{{#if skipped}}
Skipped (non-code task)
{{else}}
✓ Approved
{{#if warnings}}Warnings: {{count}}{{/if}}
{{#if suggestions}}Suggestions: {{count}}{{/if}}
{{/if}}

### Testing
{{#if skipped}}
Skipped (non-code task)
{{else}}
✓ {{passed}}/{{total}} tests passed
✓ Coverage: {{coverage}}%
{{/if}}

### Files Modified
{{list of files created/modified}}

---
```

#### 7. Update State

Invoke State Manager to:
- Increment `current_task`
- If last task: Transition to phase=DONE, status=completed

#### 8. Continue or Finish

If more tasks remaining:
```
Task {{n}} complete. Continue to next task? (y/n)
```

If all tasks complete: Go to **Completion Flow**

---

### Pause Handling

When user chooses "pause":
1. Current task index is already in state.json
2. Optionally create snapshot:
   ```
   Create snapshot for easy resume? (y/n)

   If yes:
   - Save current context summary to snapshots/snap_{{feature}}_{{timestamp}}.md
   - Include: completed tasks, current task, key decisions made
   ```
3. Output:
   ```
   ⏸️ Execution paused

   Feature: {{display_name}}
   Progress: {{current_task}}/{{total_tasks}} tasks

   Resume: /execute (without arguments)
   ```

---

### Completion Flow

When all tasks are marked complete:

```
🎉 All tasks complete!

Summary:
- Feature: {{display_name}}
- Tasks completed: {{total_tasks}}
- Files modified: {{file_count}}
- Tests added: {{test_count}}
- Time: {{duration if trackable}}
```

**1. Update Architecture**

Ask: "Update architecture.md with changes from this feature? (y/n)"

If yes:
- Analyze code changes made
- Identify: new services, endpoints, database changes, patterns used
- **Minor updates** (auto-apply): new endpoints, utility functions
- **Major updates** (show diff, ask approval): new architectural patterns, new tech stack items
- Update architecture.md

**2. Generate Retrospective**

Create `features/{{featureKey}}/retrospective.md`:
```markdown
# Feature Retrospective: {{display_name}}

**Completed:** {{ISO timestamp}}
**Duration:** {{duration if trackable}}
**Tasks:** {{total}}
**Tests Added:** {{count}}

## What Went Well
- {{positive outcome 1}}
- {{positive outcome 2}}

## Challenges Faced
- {{challenge 1 and how it was resolved}}
- {{challenge 2 and how it was resolved}}

## Lessons Learned
- {{lesson 1}}
- {{lesson 2}}

## Technical Debt Created
{{#if any}}
- {{debt item 1}}
- {{debt item 2}}
{{else}}
None identified
{{/if}}

## Recommendations for Future
- {{recommendation 1}}
- {{recommendation 2}}
```

**3. Mark Feature Complete**

Invoke State Manager to:
- Set phase=DONE
- Set status=completed
- Set completed_at timestamp
- Clear active_feature

**4. Celebration!**

```
✅ Feature complete: {{display_name}}!

Documentation:
- Spec: features/{{key}}/spec.md
- Plan: features/{{key}}/plan.md
- Tasks: features/{{key}}/tasks.md ({{total}} ✓)
- Implementation: features/{{key}}/implementation.md
- Retrospective: features/{{key}}/retrospective.md

Architecture: {{updated/unchanged}}

Next: Run /spec to start a new feature!
```

---

## Error Recovery

### Review Rejection After 3 Attempts
- Show user the persistent issues
- Offer to continue anyway, skip, pause, or get manual help
- Log the decision

### Test Failure After 3 Attempts
- Show failing tests
- Offer to continue anyway (tests marked incomplete), skip, pause, or get manual help
- Log the decision

### Task Implementation Failure
If an error occurs during implementation:
```
❌ Error implementing task: {{error message}}

Options:
a) Retry
b) Skip this task
c) Pause execution
d) Manual intervention needed

Choose:
```

---

## Resume Behavior

When `/execute` runs without arguments and active_feature exists:

```
Resuming feature: {{display_name}}
Progress: {{current_task}}/{{total_tasks}} tasks completed

Last completed: Task {{current_task}}: {{description}}
Next task: Task {{current_task + 1}}: {{description}}

Continue from where you left off? (y/n)
```

---

## Notes

- **Token management**: If context gets large (>50K tokens), offer to create snapshot and continue with fresh context
- **Git integration**: If git available, use `git diff` to show exact changes for code review
- **Incremental saves**: implementation.md updates after each task, never lose progress
- **Flexible workflow**: Can skip non-critical tasks, pause anytime, jump to dependencies

Execute with confidence - every task is reviewed and tested before proceeding.
