---
# Note: Bash unrestricted - intentional for feature implementation flexibility
# This command needs to run tests, migrations, build tools, etc.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Task(reviewer), Task(tester), Task(state-manager), Bash(node:*)
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

**IMPORTANT CONSTRAINTS:**
- Follow the execution loop exactly as specified below
- Do NOT skip quality gates (code review, testing) unless explicitly allowed by user
- Use ONLY the allowed tools listed in frontmatter
- Pause/resume supported - save progress to state.json at each step
- Use three-state checkbox system in tasks.md

---

## Task Structure and Checkbox System

**Hierarchical Task Format:**

Tasks.md uses a hierarchical structure with parent tasks and subtasks:
```markdown
[ ] 1. Parent Task Title (effort: high)
- [ ] 1.1. First subtask
- [ ] 1.2. Second subtask
- [ ] 1.3. Third subtask

[ ] 2. Another Parent Task (effort: medium)
- [ ] 2.1. Subtask description
- [ ] 2.2. Another subtask
```

**Three-State Checkbox System:**
- `[ ]` = Not started
- `[-]` = In progress (parent task only)
- `[x]` = Complete

**Checkbox Rules:**
- **Parent tasks:** Mark `[-]` when starting first subtask, `[x]` when all subtasks complete
- **Subtasks:** Mark `[x]` immediately when subtask passes review/tests

**Execution Flow:**
1. Show confirmation ONCE per parent task
2. Execute subtasks sequentially (1.1 → 1.2 → 1.3 → 2.1)
3. Track current subtask in state.json (e.g., "1.2")
4. Mark checkboxes as work progresses
5. When resuming, continue from saved subtask

---

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

Parse tasks.md to identify parent tasks (1, 2, 3) and their subtasks (1.1, 1.2, 1.3).

**For each parent task from current position to end:**

#### 1. Display Parent Task (Confirmation Point)

Show this ONCE per parent task:

```
─────────────────────────────────────────
Parent Task {{parent_number}}: {{parent_title}} ({{effort}})
Subtasks: {{subtask_list}} ({{subtask_count}} total)
{{#if parent_in_progress}}Status: IN PROGRESS ({{completed_count}}/{{subtask_count}} complete){{/if}}
─────────────────────────────────────────

This will implement all subtasks under this parent task.
Continue? (y/n/skip/pause)
  y - Implement all subtasks in this parent
  n - Stop execution
  skip - Mark all subtasks complete without implementing (use cautiously)
  pause - Save progress and exit
```

**If continuing:**

- Mark parent task in tasks.md: `[ ]` → `[-]` (if not already `[-]`)
- Begin iterating through subtasks

#### 2. For Each Subtask Under Current Parent

**Display subtask:**
```
Starting subtask {{subtask_number}}: {{subtask_description}}
{{#if dependencies}}Dependencies: {{dependencies}}{{/if}}
```

**Check Dependencies:**

If subtask has `[depends: x.y]`:
- Verify those subtasks are marked `[x]` in tasks.md
- If not: Show which are incomplete, offer to:
  - Jump to incomplete dependency
  - Skip this subtask for now
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

#### 6. Mark Subtask Complete

**Update tasks.md with three-state checkbox system:**

1. Mark current subtask complete: `- [ ]` → `- [x]` (e.g., subtask 1.2)
2. Check if all subtasks under parent are now `[x]`:
   - If YES: Mark parent task complete: `[ ]` or `[-]` → `[x]`
   - If NO: Parent stays as `[-]` (in progress)

**Example:**
```markdown
Before (completing subtask 1.2):
[-] 1. Parent Task (effort: high)
- [x] 1.1. First subtask
- [ ] 1.2. Second subtask ← completing this one
- [ ] 1.3. Third subtask

After:
[-] 1. Parent Task (effort: high)  ← stays [-] (still has 1.3)
- [x] 1.1. First subtask
- [x] 1.2. Second subtask
- [ ] 1.3. Third subtask

After completing 1.3:
[x] 1. Parent Task (effort: high)  ← now [x] (all subtasks done)
- [x] 1.1. First subtask
- [x] 1.2. Second subtask
- [x] 1.3. Third subtask
```

**Create/append to implementation.md:**

```markdown
## Subtask {{subtask_number}}: {{subtask_description}}
**Parent Task:** {{parent_number}}. {{parent_title}}
**Completed:** {{ISO timestamp}}
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

Invoke State Manager to update state.json:
```json
{
  "current_task": "{{subtask_number}}",  // e.g., "1.2", "2.1"
  "current_parent": {{parent_number}}     // e.g., 1, 2
}
```

**If last subtask of parent task:**
- Display: `✓ Parent Task {{parent_number}} complete ({{subtask_count}}/{{subtask_count}} subtasks)`
- Move to next parent task
- Show next parent task confirmation

**If last subtask of entire feature:**
- Transition to phase=DONE, status=completed
- Go to **Completion Flow**

#### 8. Continue Through Subtasks

Continue automatically to next subtask in same parent (no confirmation between subtasks).

When parent task complete or all feature tasks complete: Show appropriate completion message

---

### Pause Handling

When user chooses "pause":
1. Current subtask is already saved in state.json (e.g., "1.2")
2. Tasks.md shows current state with checkboxes:
   - Parent tasks: `[x]` complete, `[-]` in progress, `[ ]` not started
   - Subtasks: `[x]` complete, `[ ]` not done
3. Optionally create snapshot:
   ```
   Create snapshot for easy resume? (y/n)

   If yes:
   - Save current context summary to snapshots/snap_{{feature}}_{{timestamp}}.md
   - Include: completed subtasks, current subtask, key decisions made
   ```
4. Output:
   ```
   ⏸️ Execution paused

   Feature: {{display_name}}
   Progress: {{completed_subtask_count}}/{{total_subtask_count}} subtasks complete
   Current: Subtask {{current_task}} in Parent Task {{current_parent}}

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

**Parse current_task from state.json** (e.g., "1.2"):
- Extract parent task number (1)
- Extract subtask number (1.2)
- Determine which subtasks in parent are complete by reading tasks.md checkboxes

**Display resume information:**
```
Resuming feature: {{display_name}}
Progress: {{completed_subtask_count}}/{{total_subtask_count}} subtasks completed

Parent Task {{current_parent}}: {{parent_title}} ({{status}})
├─ Completed: {{list of completed subtasks with [x]}}
└─ Next: Subtask {{current_task}} - {{subtask_description}}

Remaining in this parent: {{remaining_subtasks}}

Continue from where you left off? (y/n)
```

**If continuing:**
- If resuming mid-parent (parent marked `[-]`): Continue with subtasks, no new confirmation
- If resuming at new parent (parent marked `[ ]`): Show parent task confirmation prompt

---

## Notes

- **Token management**: If context gets large (>50K tokens), offer to create snapshot and continue with fresh context
- **Git integration**: If git available, use `git diff` to show exact changes for code review
- **Incremental saves**: implementation.md updates after each task, never lose progress
- **Flexible workflow**: Can skip non-critical tasks, pause anytime, jump to dependencies

Execute with confidence - every task is reviewed and tested before proceeding.
