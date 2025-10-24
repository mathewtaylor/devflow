# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**DevFlow** is an agentic feature management system for Claude Code that provides a structured workflow for building features with automated quality gates. It transforms chaotic feature development into a systematic process: Spec → Plan → Tasks → Execute.

The system consists of:
- **10 slash commands** (namespaced as `devflow:*`) for workflow phases
- **8 specialized AI agents** for architecture, planning, code review, testing, and state management
- **Smart context management** using three-tier documentation loading
- **Living documentation** that stays synchronized with code changes

## Architecture Overview

### Three-Layer Architecture

**1. Command Layer** (`.claude/commands/devflow/`)
- Slash commands orchestrate workflows using YAML frontmatter
- Use `!` prefix for bash execution (dynamic state gathering)
- Use `@` prefix for file references (automatic context loading)
- Model selection: `haiku` (simple), `sonnet` (execution), `opus` (deep thinking)

**2. Agent Layer** (`.claude/agents/`)
- Specialized agents invoked via `Task()` tool
- Each agent has structured inputs/outputs
- Reusable across multiple commands
- Agents: `architect`, `planner`, `state-manager`, `reviewer`, `tester`

**3. State Layer** (`.devflow/lib/state-io.js`)
- JavaScript utilities for atomic state operations
- Automatic backups before writes (`state.json.bak`)
- Schema validation before state changes
- State Manager agent adds intelligence on top of utilities

### Documentation Structure

```
.devflow/
├── templates/                  # Infrastructure templates (overwritten on update)
│   ├── constitution.md.template
│   ├── architecture.md.template
│   ├── .devflowignore.template
│   ├── CLAUDE.md.template
│   └── domains/
│       ├── _index.md.template
│       └── concern.md.template
├── lib/                        # Utilities
│   └── state-io.js
├── state.json.schema          # Validation schema
├── constitution.md            # Project principles (always loaded)
├── architecture.md            # Living system docs (always loaded)
├── state.json                 # Progress tracking
├── domains/                   # Cross-cutting concerns (user-created)
│   ├── _index.md              # Quick reference (always loaded)
│   └── {category}/{concern}.md # Full docs (loaded on-demand)
└── features/                  # Per-feature lifecycle
    └── yyyymmdd-feature-name/
        ├── spec.md            # Requirements
        ├── plan.md            # Technical design
        ├── tasks.md           # Executable checklist
        ├── implementation.md  # Execution log
        ├── retrospective.md   # Lessons learned
        └── snapshot.md        # Resume context (created on pause)
```

## Core Workflow Commands

### `/init` - Initialize DevFlow
- Creates constitution.md (project principles and standards)
- For existing projects: scans codebase → presents findings → user reviews → generates architecture.md
- For new projects: suggests tech stack patterns → user chooses → generates blueprint
- Sets up cross-cutting concerns documentation structure

### `/spec [feature-name]` - Create Feature Specification (Full Workflow)
- Interactive wizard captures requirements
- Feature naming: `yyyymmdd-feature-slug` format (e.g., `20251020-user-auth`)
- Tags cross-cutting concerns for smart context loading
- Creates `.devflow/features/yyyymmdd-feature-name/spec.md`
- Invokes State Manager to update `state.json`
- Use for features > 2-4 hours requiring comprehensive planning

### `/build-feature [description]?` - Streamlined Workflow for Small Features
- Fast-track for features < 2 hours (bug fixes, UI tweaks, simple enhancements)
- Interactive wizard with 2-4 targeted clarification questions
- Creates simplified `spec.md` (description, rationale, acceptance criteria, files)
- Auto-generates flat task list (5-10 tasks, no parent hierarchy)
- Immediately starts execution with same quality gates (Opus review + testing)
- Streamlined documentation (lighter logging, brief retrospective)
- State: `workflow_type="build"`, phases: SPEC → EXECUTE → DONE (skips PLAN/TASKS)
- No `plan.md` created (planning happens inline during execution)

### `/plan [feature-name]?` - Generate Technical Plan
- Invokes **Architect agent** (Opus with extended thinking)
- Loads: constitution, architecture, spec, relevant domain docs
- Creates technical design: components, data models, APIs, security, testing
- Optional: Creates ADR in `.devflow/decisions/` for significant choices
- Updates state: `phase=PLAN`

### `/tasks [feature-name]?` - Break Into Executable Tasks
- Invokes **Task Planner agent** (Sonnet)
- Creates atomic tasks (<2 hours each)
- Task format: `- [ ] N. Description (complexity) [depends: x,y]`
- Logical ordering: data layer → business logic → API → tests
- Creates `.devflow/features/yyyymmdd-feature-name/tasks.md`
- Updates state: `phase=TASKS`

### `/execute [feature-name]?` - Implement with Quality Gates
- Sequential task execution with user confirmation per task
- **For each task:**
  1. Check dependencies are complete
  2. Implement code following constitution standards
  3. **Code Review Gate** (Opus + extended thinking)
     - Security, quality, architecture validation
     - Auto-fix issues (max 3 attempts)
     - Status: `APPROVED` or `CHANGES_REQUIRED`
  4. **Testing Gate** (Sonnet)
     - Generates unit and integration tests
     - Validates coverage requirements
     - Auto-fix failures (max 3 attempts)
  5. Mark complete in tasks.md
  6. Log to implementation.md
  7. Update state: increment `current_task`
- **Pause/resume supported**: User can pause anytime
  - Optional snapshot creation preserves context summary
  - Snapshot helpful after Claude Code's `/compact` command
  - Resume automatically loads snapshot for context
- **On completion:**
  - Updates architecture.md with changes
  - Generates retrospective.md
  - Cleans up snapshot.md
  - Marks feature complete: `phase=DONE`, `status=completed`

### `/status` - View Progress Dashboard
- Active feature and current task
- All features table (pending/active/paused/completed)
- Context usage estimates
- Quick action suggestions

### `/think [question]` - Deep Analysis for Decisions
- Opus model with extended thinking for complex choices
- Structured analysis: context → options → tradeoffs → recommendation
- Optional: Creates Architecture Decision Record (ADR)
- Use for: technology selection, architectural patterns, design decisions

## Key Behavioral Patterns

### Smart Context Loading (Three-Tier System)

**Tier 1: Always Loaded** (~3K tokens)
- `.devflow/constitution.md` - Project principles
- `.devflow/architecture.md` - System overview
- `.devflow/domains/_index.md` - Concerns reference

**Tier 2: Feature-Specific** (~5-7K tokens)
- Current feature: spec.md, plan.md, tasks.md
- Relevant source files for the task

**Tier 3: On-Demand** (~1-3K tokens each)
- Domain docs loaded when:
  - Feature explicitly tags concerns in spec
  - Keywords detected (e.g., "auth" → `authentication.md`)
  - Agent recognizes patterns requiring specific guidance

**Result:** 15-20K tokens vs 100K+ without smart loading

### State Management Hybrid Approach

**Simple operations** use `state-io.js` utilities directly:
```javascript
const { readState, writeState, validateSchema } = require('./.devflow/lib/state-io.js');
```

**Complex operations** invoke State Manager agent:
- State transition validation
- Conflict detection (single active feature rule)
- Phase progression warnings
- File existence checks

### Quality Gates with Retry Logic

Both code review and testing follow this pattern:
1. Initial check/test
2. If issues found: Auto-fix and retry
3. Max 3 attempts
4. After 3 failures: Ask user for guidance (continue anyway / skip / pause / manual help)

### Feature Naming Convention

Format: `yyyymmdd-feature-slug`
- Examples: `20251020-user-authentication`, `20251022-payment-integration`
- Provides chronological ordering
- Ensures uniqueness
- Used as folder name and state.json key

## Agent Specializations

### Architect Agent
- **Model:** opus (extended thinking)
- **Purpose:** Technical planning and design decisions
- **Tech stack awareness:** Recommends patterns for .NET, Node.js, Python, React, etc.
- **Output:** Structured plan.md with components, data models, APIs, security, testing
- **Creates ADRs:** For significant architectural decisions

### Task Planner Agent
- **Model:** sonnet
- **Purpose:** Break technical plans into atomic, executable tasks
- **Task sizing:** Small (<1hr), Medium (1-2hrs), Large (2hrs, rare)
- **Dependency tracking:** `[depends: 5,7,9]` format
- **Output:** Ordered checklist in tasks.md

### Code Reviewer Agent
- **Model:** opus (extended thinking)
- **Purpose:** Deep code review with security and quality focus
- **Checks:** Security, constitution compliance, architecture alignment, code quality
- **Output:** `APPROVED` or `CHANGES_REQUIRED` with specific, actionable feedback
- **Used in:** `/execute` after each task implementation

### Test Engineer Agent
- **Model:** sonnet
- **Purpose:** Generate comprehensive tests
- **Generates:** Unit tests (AAA pattern) and integration tests
- **Validates:** Coverage requirements from constitution
- **Output:** Test files + execution results (PASS/FAIL with specifics)

### State Manager Agent
- **Model:** sonnet
- **Purpose:** Intelligent state transitions and validation
- **Enforces:** Single active feature, phase progression guidance
- **Philosophy:** Guided flexibility (warns but allows skipping phases)
- **Output:** Structured success/warning status with next action guidance

## Development Commands

### Testing DevFlow
```bash
# In a test project directory
cd /path/to/test-project

# Initialize DevFlow
/init

# Create a simple feature
/spec test-feature

# Generate plan
/plan

# Create tasks
/tasks

# Execute (with quality gates)
/execute

# Check status
/status
```

### Working with State
```bash
# Read current state
node -e "console.log(JSON.stringify(require('./.devflow/state.json'), null, 2))"

# Get active feature
node -pe "require('./.devflow/state.json').active_feature"

# Restore from backup
cp .devflow/state.json.bak .devflow/state.json
```

### Debugging Commands
```bash
# Check if DevFlow initialized
test -f .devflow/constitution.md && echo "Initialized" || echo "Not initialized"

# List all features
node -pe "Object.keys(require('./.devflow/state.json').features).join('\n')"

# Count features by status
node -pe "const s=require('./.devflow/state.json'); Object.values(s.features).filter(f=>f.status==='active').length"
```

## Critical Implementation Notes

### Slash Command Best Practices
1. **Use frontmatter** for tool restrictions and model selection
2. **Dynamic state** via `!` bash execution (prevents stale prompts)
3. **Context loading** via `@` file references (automatic includes)
4. **Namespacing** in `.claude/commands/devflow/` shows as `devflow:*` commands

### Agent Design Principles
1. **Concise prompts** with YAML frontmatter (40-65 lines)
2. **Structured outputs** (JSON or markdown with specific sections)
3. **Model selection** matches task complexity (opus for thinking, sonnet for execution)
4. **Reusability** across multiple commands

### State Transitions
**Valid phases:** `SPEC → PLAN → TASKS → EXECUTE → DONE`
- Skipping allowed (with warnings)
- Backward movement allowed (rare, for corrections)
- Single active feature enforced
- File existence validated before transitions

### Cross-Cutting Concerns
**Add new concern:**
1. Create `domains/{category}/{concern}.md` with full details
2. Add one-line summary to `domains/_index.md`
3. Tag in feature specs to trigger loading
4. Document keywords that trigger auto-loading

## Common Pitfalls to Avoid

❌ **Don't skip `/init`** - Constitution and architecture are foundational
❌ **Don't work on multiple active features** - State manager enforces single active
❌ **Don't bypass quality gates** - Code review and testing catch critical issues
❌ **Don't manually edit state.json** - Use state-io.js or State Manager agent
❌ **Don't ignore architecture updates** - Living docs prevent drift
❌ **Don't skip retrospectives** - Lessons learned improve future work

## Extension Points

### Adding New Commands
1. Create `.claude/commands/devflow/new-command.md`
2. Add YAML frontmatter (allowed-tools, model, description)
3. Use `!` for dynamic state, `@` for context loading
4. Invoke existing agents via `Task()` when possible

**CRITICAL: @ Path Resolution**
- `@` file references resolve **relative to the command file**, not project root
- Command location: `.claude/commands/devflow/command.md`
- To reference templates: `@../../../.devflow/templates/file.template`
- Three levels up (`../../../`) reaches project root from command file
- Do NOT use `@.devflow/` as it will look in `.claude/commands/devflow/.devflow/`

### Adding New Agents
1. Create `.claude/agents/new-agent.md`
2. Use YAML frontmatter (name, description, model)
3. Define structured input/output format
4. Keep prompt concise (40-65 lines)

### Adding Domain Documentation
1. Create `domains/{category}/{concern}.md`
2. Include: key rules, implementation patterns, examples, anti-patterns
3. Update `domains/_index.md` with summary and keywords
4. ~1000 tokens recommended for full doc

## Key Files Reference

**Core configuration:**
- `.devflow/constitution.md` - Project principles and standards
- `.devflow/architecture.md` - System structure and patterns
- `.devflow/state.json` - Current workflow state

**State management:**
- `.devflow/lib/state-io.js` - Atomic state operations (readState, writeState, validateSchema)
- `.claude/agents/state-manager.md` - Intelligent validation agent

**Workflow commands:**
- `.claude/commands/devflow/init.md` - Initialization wizard
- `.claude/commands/devflow/spec.md` - Requirements capture (full workflow)
- `.claude/commands/devflow/build-feature.md` - Streamlined workflow for small features
- `.claude/commands/devflow/plan.md` - Technical planning
- `.claude/commands/devflow/tasks.md` - Task breakdown
- `.claude/commands/devflow/execute.md` - Implementation with quality gates
- `.claude/commands/devflow/status.md` - Progress dashboard
- `.claude/commands/devflow/think.md` - Deep analysis and ADRs

**Quality agents:**
- `.claude/agents/architect.md` - Technical planning (opus + extended thinking)
- `.claude/agents/planner.md` - Task breakdown (sonnet)
- `.claude/agents/reviewer.md` - Code review (opus + extended thinking)
- `.claude/agents/tester.md` - Test generation and validation (sonnet)

**Installation scripts:**
- `scripts/install-devflow.sh` - Bash installer (Linux/Mac/Git Bash)
- `scripts/Install-DevFlow.ps1` - PowerShell installer (Windows)
- Both download files from `devflow/` repo folder to `.devflow/` in target project
- Path mapping: `devflow/templates/` → `.devflow/templates/` (strip leading dot)
- Template files NOT backed up on update (infrastructure, not user data)

## Philosophy and Design Goals

**Structured without rigidity:** Workflow guides but allows flexibility (guided warnings, not blocking)

**Quality by default:** Automated code review and testing catch issues before they compound

**Living documentation:** Specs, plans, and architecture stay synchronized with code changes

**Smart context:** Load only what's relevant (15-20K vs 100K+ tokens)

**Pause/resume friendly:** Life happens - state management enables interruption without loss

**Decision capture:** ADRs preserve architectural reasoning for future reference

**Progressive enhancement:** Start simple (/init + /spec), add complexity as needed

---

**DevFlow transforms feature development from chaos to systematic, high-quality execution with AI-powered quality gates.**
