# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**DevFlow** is an agentic feature management system for Claude Code that provides a structured workflow for building features with automated quality gates. It transforms chaotic feature development into a systematic process: Spec → Plan → Tasks → Execute → Validate.

The system consists of:
- **15 slash commands** (namespaced as `devflow:*`) for workflow phases
- **10 specialized AI agents** for architecture, planning, code review, testing, validation, and state management
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
- Agents: `architect`, `planner`, `reviewer`, `tester`, `validation-analyzer`, `state-manager`, `git-operations-manager`, `readme-maintainer`, `checkpoint-reviewer`, `ideas`

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
        ├── validation.md      # Testing and issues (VALIDATE phase)
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
  - Cleans up snapshot.md
  - Transitions to VALIDATE phase: `phase=VALIDATE`, `status=active`

### `/validate [feature-name]?` - Start Validation Phase
- Transitions feature from EXECUTE → VALIDATE phase
- Parses acceptance criteria from spec.md
- Creates validation.md tracking document
- Sets up intelligent bug reporting system
- Displays testing instructions and available commands

### `/test-fail "<error or logs>"` - Report Bug with Intelligent Analysis
- Accepts any input format: stack traces, test output, manual descriptions
- **Validation Analyzer Agent** (Opus + extended thinking)
  - Deep root cause analysis using extended thinking
  - Identifies error type, location, and code path
  - Determines severity (CRITICAL/HIGH/MEDIUM/LOW)
  - Creates structured resolution plan with atomic fix tasks
- Auto-generates fix tasks with file paths and estimates
- Implements fixes with same quality gates as /execute
  - Code Review Gate (Opus)
  - Testing Gate (Sonnet)
- Logs fixes to validation.md
- Updates state with issue tracking
- Re-validation prompt after fixes applied

### `/test-pass <criterion-number>` - Mark Criterion Passing
- Updates validation.md checklist (`[ ]` → `[x]`)
- Updates state metrics (passed/pending counts)
- Shows progress toward validation completion
- Detects when all criteria passed and ready to finalize

### `/validate-status [feature-name]?` - View Validation Dashboard
- Acceptance criteria progress with visual bar
- Issues summary by status (open/fixing/fixed/closed)
- Issues summary by severity (CRITICAL/HIGH/MEDIUM/LOW)
- Detailed issue list with timestamps and tasks
- Validation metrics and time tracking
- Clear next steps guidance

### `/validate-complete [feature-name]?` - Finalize Validation
- Validates all criteria passed and no open issues
- Offers architecture.md updates (minor auto-apply, major require approval)
- Generates comprehensive retrospective.md
- Cleans up snapshot.md
- Marks feature complete: `phase=DONE`, `status=completed`
- Clears active_feature

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

### `/consolidate-docs` - Organize Existing Documentation
- Scans all markdown files in project
- Consolidates scattered technical docs into DevFlow domains
- Provides archival recommendations
- Safe migration preserves original files

### `/readme-manager` - Update Project README
- Invokes readme-maintainer agent
- Analyzes current project state
- Updates or creates comprehensive README.md
- Ensures documentation accuracy

### `/idea [text | complete N | clear]` - Quick Idea Capture
- Capture ideas without leaving terminal
- Add: `/idea "Your idea here"`
- List: `/idea` (shows all ideas)
- Mark complete: `/idea complete 3`
- Clear done: `/idea clear`
- Stored in `.devflow/ideas.md`
- Uses ideas agent for isolated context

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

### Validation Analyzer Agent
- **Model:** opus (extended thinking)
- **Purpose:** Intelligent bug analysis during validation phase
- **Accepts:** Any input format (stack traces, test output, manual descriptions, logs)
- **Analysis:** Deep root cause detection with extended thinking
  - Error type and location identification
  - Code path tracing
  - Severity assessment (CRITICAL/HIGH/MEDIUM/LOW)
  - Pattern recognition (null_check, error_handling, validation, integration)
- **Output:** Structured JSON with resolution plan and atomic fix tasks
- **Prevention:** Recommends patterns to avoid similar issues
- **Used in:** `/test-fail` command for intelligent bug reporting and auto-fixing

### State Manager Agent
- **Model:** sonnet
- **Purpose:** Intelligent state transitions and validation
- **Enforces:** Single active feature, phase progression guidance
- **Philosophy:** Guided flexibility (warns but allows skipping phases)
- **Output:** Structured success/warning status with next action guidance

### Git Operations Manager Agent
- **Model:** sonnet
- **Purpose:** Git workflow automation
- **Functions:** Commits, pushes, pulls, branch management, worktree management
- **Standards:** Conventional commit format enforcement
- **Output:** Conflict detection and resolution guidance

### README Maintainer Agent
- **Model:** sonnet
- **Purpose:** Comprehensive README.md creation and updates
- **Functions:** Project structure analysis, accuracy verification
- **Output:** Multi-audience documentation (users, contributors, operators)

### Checkpoint Reviewer Agent
- **Model:** opus (extended thinking)
- **Purpose:** Phase-level integration validation
- **Functions:** Post-parent-task review gate, remediation subtask creation
- **Output:** Multi-level quality assurance validation

### Ideas Agent
- **Model:** haiku
- **Purpose:** Quick idea capture and management
- **Functions:** Add, list, complete, and clear ideas
- **Output:** Maintains `.devflow/ideas.md` checklist with fast, isolated context

## Build, Test, and Development Commands

### No Traditional Build System

DevFlow is **documentation and script-based** - there is no compilation, transpilation, bundling, or package management.

**Technology stack:**
- Markdown files for commands, agents, and templates
- JavaScript (Node.js) for state utilities
- Bash scripts for installation

**No dependencies:**
- No `package.json` or `npm install` required
- No build step
- No automated test suite (tested through actual usage)

### Installation and Testing

**Production installation (one-line):**
```bash
curl -sSL https://raw.githubusercontent.com/mathewtaylor/devflow/main/scripts/install-devflow.sh | bash
```

**Local development installation:**
```bash
# From DevFlow repository root
cd /path/to/devflow
./scripts/local-install.sh /path/to/test-project
```

**Manual testing workflow:**
```bash
# 1. Make changes in DevFlow repo
# 2. Install to test project
cd /path/to/devflow
./scripts/local-install.sh /tmp/test-project

# 3. Test in target project
cd /tmp/test-project
/init
/spec test-feature
/plan
/tasks
/execute
/status
```

### Working with State (cli.js)

The `cli.js` utility provides a centralized interface for state operations, reducing permission prompts.

**Query operations (read-only):**
```bash
# Active feature info
node .devflow/lib/cli.js query active_feature
node .devflow/lib/cli.js query active_feature_name
node .devflow/lib/cli.js query active_phase
node .devflow/lib/cli.js query active_progress

# Feature queries
node .devflow/lib/cli.js query feature_count
node .devflow/lib/cli.js query has_spec feature-name
node .devflow/lib/cli.js query feature_phase feature-name
node .devflow/lib/cli.js query current_task feature-name

# Validation queries (NEW)
node .devflow/lib/cli.js query validation_criteria feature-name
node .devflow/lib/cli.js query validation_issues feature-name
node .devflow/lib/cli.js query validation_progress feature-name
```

**Update operations (state mutations):**
```bash
# Phase transitions
node .devflow/lib/cli.js update transition-phase feature-key EXECUTE 1.1

# Task updates
node .devflow/lib/cli.js update set-current-task feature-key 1.2
node .devflow/lib/cli.js update increment-task feature-key

# Validation updates
node .devflow/lib/cli.js update mark-criterion-passed feature-key 1
node .devflow/lib/cli.js update add-issue feature-key "Bug description"
```

### Debugging Commands
```bash
# Check if DevFlow initialized
test -f .devflow/constitution.md && echo "Initialized" || echo "Not initialized"

# Restore from backup
cp .devflow/state.json.bak .devflow/state.json

# Check state directly (use cli.js queries instead for production)
cat .devflow/state.json | jq '.'
```

### Adding New Files to Installation

When adding new commands, agents, or templates:

1. **Create the file** in appropriate location:
   - Commands: `devflow/integrations/claude/commands/devflow/new-command.md`
   - Agents: `devflow/integrations/claude/agents/new-agent.md`
   - Templates: `devflow/templates/new-template.md.template`

2. **Update install script** (`scripts/install-devflow.sh`):
   ```bash
   # Add to FILES array
   "devflow/integrations/claude/commands/devflow/new-command.md:.claude/commands/devflow/new-command.md"
   ```

3. **Update file count** in script comments:
   ```bash
   # Example: "10 agents" → "11 agents"
   ```

4. **Test installation:**
   ```bash
   ./scripts/local-install.sh /tmp/test-project
   # Verify file exists in target location
   ```

## DevFlow Repository Development

### Repository Structure
```
devflow/
├── devflow/
│   ├── integrations/claude/
│   │   ├── agents/              # 9 specialized agents
│   │   └── commands/devflow/    # 11 workflow commands
│   ├── templates/               # Shared infrastructure templates
│   ├── lib/                     # Utilities (state-io.js, cli.js)
│   └── instructions.md          # Core documentation
├── scripts/
│   └── install-devflow.sh       # Bash installer (Linux/Mac/Git Bash)
├── README.md                    # User-facing documentation
└── CLAUDE.md                    # This file
```

### Installation Path Mapping
When users install DevFlow in their projects:
- `devflow/integrations/claude/agents/` → `.claude/agents/`
- `devflow/integrations/claude/commands/devflow/` → `.claude/commands/devflow/`
- `devflow/templates/` → `.devflow/templates/`
- `devflow/lib/` → `.devflow/lib/`
- `devflow/state.json.schema` → `.devflow/state.json.schema`
- `devflow/instructions.md` → `.devflow/instructions.md`

### Branch Strategy
- **`main`** - Current stable branch with manual installation (formerly `stable-manual-install`)
- **`v2`** - Previous main branch preserved for reference
- See `BRANCHES.md` for historical context (note: may contain outdated branch names)

### Testing Changes
```bash
# Test installer in a separate directory
cd /tmp/test-project
bash /path/to/devflow/scripts/install-devflow.sh

# Verify installation
ls -la .claude/
ls -la .devflow/

# Test a workflow command
/init
```

### Common Development Patterns

**Modifying an existing command:**
```bash
# 1. Edit the command file
# Example: devflow/integrations/claude/commands/devflow/execute.md

# 2. Install to test project
./scripts/local-install.sh /tmp/test-project

# 3. Test the command in test project
cd /tmp/test-project
/execute

# 4. Iterate until working correctly
# 5. Commit changes to DevFlow repo
```

**Adding a new agent:**
```bash
# 1. Create agent file with YAML frontmatter
# devflow/integrations/claude/agents/new-agent.md

---
name: new-agent
description: Brief description of what agent does
model: sonnet
color: blue
version: 2025.10.29
---

# Agent prompt content...

# 2. Update installation script
# Add to FILES array in scripts/install-devflow.sh

# 3. Update CLAUDE.md agent count
# Example: "10 specialized agents" → "11 specialized agents"

# 4. Test installation
./scripts/local-install.sh /tmp/test-project
ls -la /tmp/test-project/.claude/agents/new-agent.md

# 5. Invoke from command using Task tool
# In a command: Task(subagent_type: "new-agent", ...)
```

**Updating templates:**
```bash
# Templates are infrastructure files (overwritten on update)
# Users should NOT customize templates directly

# 1. Edit template
# devflow/templates/some-template.md.template

# 2. Test by running command that uses it
# Example: /spec uses spec.md.template

# 3. Verify template placeholders work correctly
# Check: {{FEATURE_NAME}}, {{CREATED_DATE}}, etc.
```

**Testing state transitions:**
```bash
# 1. Initialize DevFlow in test project
cd /tmp/test-project
/init

# 2. Create feature
/spec test-feature

# 3. Check state after each command
node .devflow/lib/cli.js query active_phase

# 4. Test transition validation
# Try skipping phases (should warn but allow)
/execute  # Skip /plan and /tasks

# 5. Check state.json directly
cat .devflow/state.json | jq '.features'
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
3. **Model selection** matches task complexity (opus for thinking, sonnet for execution, haiku for fast operations)
4. **Reusability** across multiple commands

### State Transitions
**Valid phases:** `SPEC → PLAN → TASKS → EXECUTE → VALIDATE → DONE`
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
- `.claude/commands/devflow/validate.md` - Start validation phase
- `.claude/commands/devflow/test-fail.md` - Report bugs with intelligent analysis
- `.claude/commands/devflow/test-pass.md` - Mark acceptance criterion passing
- `.claude/commands/devflow/validate-status.md` - View validation dashboard
- `.claude/commands/devflow/validate-complete.md` - Finalize validation
- `.claude/commands/devflow/status.md` - Progress dashboard
- `.claude/commands/devflow/think.md` - Deep analysis and ADRs
- `.claude/commands/devflow/consolidate-docs.md` - Documentation organization
- `.claude/commands/devflow/readme-manager.md` - README maintenance
- `.claude/commands/devflow/idea.md` - Quick idea capture

**Quality agents:**
- `.claude/agents/architect.md` - Technical planning (opus + extended thinking)
- `.claude/agents/planner.md` - Task breakdown (sonnet)
- `.claude/agents/reviewer.md` - Code review (opus + extended thinking)
- `.claude/agents/tester.md` - Test generation and validation (sonnet)
- `.claude/agents/validation-analyzer.md` - Bug root cause analysis (opus + extended thinking)
- `.claude/agents/checkpoint-reviewer.md` - Phase-level integration validation (opus)
- `.claude/agents/state-manager.md` - State transition validation (sonnet)
- `.claude/agents/git-operations-manager.md` - Git workflow automation (sonnet)
- `.claude/agents/readme-maintainer.md` - README maintenance (sonnet)
- `.claude/agents/ideas.md` - Idea capture (haiku)

**Installation scripts:**
- `scripts/install-devflow.sh` - Bash installer (Linux/Mac/Git Bash on Windows)
- Downloads files from GitHub `main` branch to target project
- Path mapping: `devflow/` repo folder → `.devflow/` in target project
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

---

## DevFlow Runtime Instructions

The comprehensive development guide above is for working on DevFlow itself. For **runtime instructions** when DevFlow is being used (testing workflows in this repo), see:

@.devflow/instructions.md

This file contains context management guidelines, workflow instructions, and agent behaviors that Claude Code uses during feature development.

---

Last updated: 2025-10-29 (Enhanced with build/test commands, cli.js usage, and common development patterns)
