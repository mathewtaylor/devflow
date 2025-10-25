# DevFlow Instructions

**DevFlow** is an agentic feature management system for Claude Code that provides a structured workflow for building features with automated quality gates.

## System Overview

DevFlow transforms chaotic feature development into systematic, high-quality execution:
**Spec → Plan → Tasks → Execute**

**Components:**
- **10 slash commands** (`/devflow:*`) for workflow phases
- **8 specialized AI agents** for architecture, planning, code review, testing
- **5 autonomous skills** for state management, validation, documentation
- **Smart context management** (three-tier documentation loading)
- **Living documentation** synchronized with code changes

## Three-Layer Architecture

### 1. Command Layer
Slash commands invoked as `/devflow:*`:
- YAML frontmatter controls tool access and model selection
- `!` prefix: bash execution (dynamic state queries)
- `@` prefix: file references (automatic context loading)
- Models: `haiku` (simple), `sonnet` (execution), `opus` (deep thinking)

### 2. Agent Layer
Specialized agents (invoked automatically by commands):
- Invoked via `Task()` tool
- Structured inputs/outputs
- Reusable across commands
- Available: `architect`, `planner`, `state-manager`, `reviewer`, `tester`, `checkpoint-reviewer`, `git-operations-manager`, `readme-maintainer`

### 3. Skills Layer
Autonomous capabilities (model-invoked automatically):
- Model-invoked (Claude decides when to use)
- **devflow-state**: Query workflow state and feature metadata
- **devflow-context**: Load relevant domain documentation
- **devflow-validator**: Validate setup and transitions
- **devflow-docs**: Manage living documentation
- **devflow-tasks**: Track task completion and logging

### 4. State Layer
State management in `.devflow/scripts/`:
- `state-io.js`: Atomic state operations with automatic backups
- `cli.js`: Command-line query interface
- `state.json.schema`: Validation schema
- State Manager agent: Intelligent transition validation

## Documentation Structure

```
.devflow/
├── templates/                  # Infrastructure (copied on init)
│   ├── constitution.md.template
│   ├── architecture.md.template
│   └── domains/
├── scripts/                    # Utilities (copied on init)
│   ├── state-io.js
│   └── cli.js
├── state.json.schema          # Validation
├── constitution.md            # Project principles (always loaded)
├── architecture.md            # System overview (always loaded)
├── state.json                 # Progress tracking
├── domains/                   # Cross-cutting concerns
│   ├── _index.md              # Quick reference (always loaded)
│   └── {category}/{concern}.md # Detailed docs (on-demand)
└── features/                  # Per-feature lifecycle
    └── yyyymmdd-feature-name/
        ├── spec.md
        ├── plan.md
        ├── tasks.md
        ├── implementation.md
        ├── retrospective.md
        └── snapshot.md        # Resume context
```

## Core Workflow

### `/devflow:init` - Initialize DevFlow
- Creates constitution.md (project principles and standards)
- **Existing projects:** Scans codebase → generates architecture.md
- **New projects:** Suggests patterns → generates blueprint
- Sets up cross-cutting concerns documentation
- Copies templates and utilities to `.devflow/`

### `/devflow:spec [feature-name]` - Full Feature Workflow
- Interactive wizard captures requirements
- Feature naming: `yyyymmdd-feature-slug` (e.g., `20251020-user-auth`)
- Tags cross-cutting concerns for smart context loading
- Creates `.devflow/features/yyyymmdd-feature-name/spec.md`
- Use for features > 2-4 hours requiring comprehensive planning

### `/devflow:build-feature [description]?` - Streamlined Workflow
- Fast-track for features < 2 hours (bug fixes, UI tweaks)
- 2-4 targeted clarification questions
- Simplified spec + flat task list (5-10 tasks)
- Immediate execution with quality gates
- Phases: SPEC → EXECUTE → DONE (skips PLAN/TASKS)

### `/devflow:plan [feature-name]?` - Technical Planning
- Invokes **Architect agent** (Opus + extended thinking)
- Loads: constitution, architecture, spec, domain docs
- Creates technical design: components, data models, APIs, security, testing
- Optional: Creates ADR in `.devflow/decisions/`
- Updates state: `phase=PLAN`

### `/devflow:tasks [feature-name]?` - Task Breakdown
- Invokes **Task Planner agent** (Sonnet)
- Creates atomic tasks (<2 hours each)
- Format: `- [ ] N. Description (complexity) [depends: x,y]`
- Logical ordering: data layer → business logic → API → tests
- Updates state: `phase=TASKS`

### `/devflow:execute [feature-name]?` - Implementation with Quality Gates
Sequential task execution with user confirmation:

**For each task:**
1. Check dependencies complete
2. Implement following constitution standards
3. **Code Review Gate** (Opus + extended thinking)
   - Security, quality, architecture validation
   - Auto-fix issues (max 3 attempts)
   - Status: `APPROVED` or `CHANGES_REQUIRED`
4. **Testing Gate** (Sonnet)
   - Generate unit and integration tests
   - Validate coverage requirements
   - Auto-fix failures (max 3 attempts)
5. Mark complete in tasks.md
6. Log to implementation.md
7. Update state: increment `current_task`

**Pause/resume supported:**
- User can pause anytime
- Optional snapshot preserves context
- Resume loads snapshot automatically

**On completion:**
- Updates architecture.md
- Generates retrospective.md
- Marks feature: `phase=DONE`, `status=completed`

### `/devflow:status` - Progress Dashboard
- Active feature and current task
- All features table (pending/active/paused/completed)
- Context usage estimates
- Quick action suggestions

### `/devflow:think [question]` - Deep Analysis
- Opus + extended thinking for complex decisions
- Structured analysis: context → options → tradeoffs → recommendation
- Optional: Creates Architecture Decision Record (ADR)
- Use for: technology selection, architectural patterns, design decisions

## Smart Context Loading (Three-Tier)

**Tier 1: Always Loaded** (~3K tokens)
- `.devflow/constitution.md` - Project principles
- `.devflow/architecture.md` - System overview
- `.devflow/domains/_index.md` - Concerns reference

**Tier 2: Feature-Specific** (~5-7K tokens)
- Current feature: spec.md, plan.md, tasks.md
- Relevant source files for task

**Tier 3: On-Demand** (~1-3K tokens each)
- Domain docs loaded when:
  - Feature tags concerns in spec
  - Keywords detected (e.g., "auth" → `authentication.md`)
  - Agent recognizes patterns

**Result:** 15-20K tokens vs 100K+ without smart loading

## Quality Gates with Retry Logic

**Code Review:**
1. Initial review
2. If issues: Auto-fix and retry
3. Max 3 attempts
4. After 3 failures: Ask user (continue/skip/pause/manual)

**Testing:**
1. Generate tests
2. Run tests
3. If failures: Auto-fix and retry
4. Max 3 attempts
5. After 3 failures: Ask user

## Key Behavioral Patterns

### Feature Naming Convention
Format: `yyyymmdd-feature-slug`
- Examples: `20251020-user-authentication`, `20251022-payment-integration`
- Chronological ordering
- Ensures uniqueness
- Used as folder name and state.json key

### State Transitions
**Valid phases:** `SPEC → PLAN → TASKS → EXECUTE → DONE`
- Skipping allowed (with warnings)
- Backward movement allowed (rare)
- Single active feature enforced
- File existence validated

### Cross-Cutting Concerns
**Add new concern:**
1. Create `domains/{category}/{concern}.md`
2. Add one-line summary to `domains/_index.md`
3. Tag in feature specs to trigger loading
4. Document keywords for auto-loading

## Agent Specializations

**Architect** (opus + extended thinking)
- Technical planning and design decisions
- Tech stack awareness (.NET, Node.js, Python, React, etc.)
- Creates ADRs for significant decisions

**Task Planner** (sonnet)
- Break plans into atomic, executable tasks
- Task sizing: Small (<1hr), Medium (1-2hrs), Large (2hrs)
- Dependency tracking

**Code Reviewer** (opus + extended thinking)
- Deep code review with security focus
- Constitution compliance
- Architecture alignment
- Output: `APPROVED` or `CHANGES_REQUIRED`

**Test Engineer** (sonnet)
- Generate comprehensive tests
- AAA pattern (Arrange-Act-Assert)
- Validate coverage requirements
- Output: PASS/FAIL with specifics

**State Manager** (sonnet)
- Intelligent state transitions
- Single active feature enforcement
- Phase progression guidance
- Philosophy: Guided flexibility (warns, doesn't block)

**Checkpoint Reviewer** (opus + extended thinking)
- Reviews paused/completed features
- Validates documentation completeness
- Ensures quality before marking done

**Git Operations Manager** (sonnet)
- Handles git operations during execution
- Creates feature branches
- Commits with descriptive messages

**README Maintainer** (sonnet)
- Keeps README synchronized with architecture
- Updates after feature completion

## Autonomous Skills

Skills are model-invoked (Claude decides when to use based on context):

**devflow-state**
- Reads state including active features, phases, task progress
- Queries: active_feature, active_phase, feature_count, etc.
- Scripts: query_state.js, get_feature.js

**devflow-context**
- Loads domain documentation based on keywords/tags
- Pattern matching: Keywords → domain docs
- Token budget awareness
- Script: load_docs.js

**devflow-validator**
- Validates DevFlow setup and state integrity
- Checks phase transition prerequisites
- Validates dependencies and file existence
- Scripts: check_setup.js, check_transition.js

**devflow-docs**
- Manages living documentation
- Updates architecture.md after changes
- Generates retrospectives
- Scripts: update_architecture.js, generate_retro.js

**devflow-tasks**
- Tracks task completion in tasks.md
- Updates checkboxes and state
- Logs to implementation.md
- Scripts: mark_complete.js, get_next_task.js, log_implementation.js

## Common Pitfalls to Avoid

❌ Don't skip `/devflow:init` - Constitution and architecture are foundational
❌ Don't work on multiple active features - State manager enforces single active
❌ Don't bypass quality gates - Code review and testing catch critical issues
❌ Don't manually edit state.json - Use state-io.js or State Manager agent
❌ Don't ignore architecture updates - Living docs prevent drift
❌ Don't skip retrospectives - Lessons learned improve future work

## Philosophy

**Structured without rigidity:** Workflow guides but allows flexibility (guided warnings, not blocking)

**Quality by default:** Automated code review and testing catch issues early

**Living documentation:** Specs, plans, and architecture stay synchronized with code

**Smart context:** Load only what's relevant (15-20K vs 100K+ tokens)

**Pause/resume friendly:** State management enables interruption without loss

**Decision capture:** ADRs preserve architectural reasoning

**Progressive enhancement:** Start simple (`/devflow:init` + `/devflow:spec`), add complexity as needed

---

**DevFlow transforms feature development from chaos to systematic, high-quality execution with AI-powered quality gates.**
