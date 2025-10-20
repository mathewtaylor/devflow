---
allowed-tools: Read, Task(planner), Task(state-manager)
argument-hint: [feature-name]?
description: Break technical plan into atomic executable tasks
model: sonnet
---

# Generate Executable Tasks

Break down technical plan for: **$1** (or active feature)

## Determine Target Feature

If $1 provided: Use it (exact match or partial match)
If not: Use active feature or most recent pending/active from state.json

## Current State for Feature

- Has plan: !`find .devflow/features -name "plan.md" | grep -i '$1' | head -1 | xargs test -f && echo "yes" || echo "no"`
- Has tasks: !`find .devflow/features -name "tasks.md" | grep -i '$1' | head -1 | xargs test -f && echo "yes" || echo "no"`
- Current phase: !`node -pe "try { const s=require('./.devflow/state.json'); const f=Object.keys(s.features).find(k=>k.includes('$1')); s.features[f]?.phase || 'unknown' } catch { 'unknown' }"`

## Context for Task Planner

@.devflow/constitution.md
@.devflow/architecture.md
@.devflow/features/{{featureKey}}/spec.md
@.devflow/features/{{featureKey}}/plan.md

## Your Task

Invoke **Task Planner agent** with all loaded context.

The Task Planner will:
1. Analyze the technical plan
2. Create logical task groups (Data Layer, Business Logic, API, Testing, Documentation)
3. Break each into atomic tasks (<2 hours)
4. Add dependencies with `[depends: x,y,z]` notation
5. Estimate complexity (small/medium/large)
6. Order tasks: Foundation → Logic → Interface → Tests → Documentation
7. Ensure all services have unit tests
8. Ensure all APIs have integration tests
9. Include migration, verification, and documentation tasks

---

## Generate tasks.md

Format:
```markdown
# Implementation Tasks: {{Feature Name}}

**Total Tasks:** {{count}}
**Estimated Time:** {{hours}} hours

## Task Groups
1. Data Layer (Tasks 1-5)
2. Business Logic (Tasks 6-12)
3. API Layer (Tasks 13-18)
4. Testing (Tasks 19-25)
5. Documentation (Tasks 26-28)

## Tasks

### Data Layer
- [ ] 1. Create User entity with properties (small)
- [ ] 2. Add UserConfiguration to DbContext (small) [depends: 1]
- [ ] 3. Create migration for Users table (small) [depends: 1,2]

### Business Logic
- [ ] 4. Create IUserService interface (small)
- [ ] 5. Implement UserService.CreateUser (medium) [depends: 1,4]
...
```

Write to: `.devflow/features/{{featureKey}}/tasks.md`

---

## Update State

Invoke State Manager to update:
```json
{
  "phase": "TASKS",
  "current_task": 0
}
```

---

## Output

```
✅ Task breakdown generated!

Feature: {{Display Name}}
Tasks: .devflow/features/{{featureKey}}/tasks.md

Task Summary:
- Total Tasks: {{count}}
- Estimated Time: {{hours}} hours
- Task Groups: {{list}}

Complexity Breakdown:
- Small: {{count}} tasks (~{{hours}}hrs)
- Medium: {{count}} tasks (~{{hours}}hrs)
- Large: {{count}} tasks (~{{hours}}hrs)

Next: Run /execute to start implementing with automated reviews
```
