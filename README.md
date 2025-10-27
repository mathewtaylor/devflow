# DevFlow

**Agentic Feature Management for Claude Code**

> Structured workflow system that transforms how you build features—from specification to production-ready code with automated quality gates.

---

## The Problem

Building software features is often chaotic:
- **Requirements drift**: What you build isn't what was needed
- **Quality varies**: Code quality depends on your energy level and focus
- **Documentation lags**: Docs become stale the moment code changes
- **Context overload**: Managing what's relevant is manual and error-prone
- **No systematic approach**: Every feature is built differently
- **Lost decisions**: Why did we choose X over Y? Nobody remembers.

---

## The Solution

DevFlow brings structure, automation, and intelligence to feature development:

- **Structured workflow**: Spec → Plan → Tasks → Execute
- **Living documentation**: Constitution, architecture, and per-feature specs stay current
- **Automated quality**: Every task gets code review and testing before proceeding
- **Smart context**: Loads only relevant docs (15-20K tokens vs 100K+)
- **Progress tracking**: State management means you always know where you are
- **Decision capture**: ADRs document important architectural choices
- **Pause/resume**: Life happens—pause work, resume later without losing context

---

## Key Features

### Workflow Commands (11 total)

**`/init`** - Initialize DevFlow in your project
- Interactive wizard for project constitution
- Automatic architecture documentation for existing projects
- Sets up cross-cutting concerns documentation

**`/spec [feature-name]`** - Create feature specifications (full workflow)
- Interactive wizard guides requirements gathering
- User stories and acceptance criteria
- Cross-cutting concerns tagging for smart context loading

**`/build-feature [description]`** - Streamlined workflow for small features (< 2 hours)
- Interactive wizard with 2-4 targeted clarification questions
- Creates simplified spec and auto-generates tasks
- Immediately starts execution with same quality gates
- Ideal for bug fixes, UI tweaks, simple enhancements

**`/plan`** - Generate technical implementation plans
- AI Architect agent (Opus with extended thinking)
- Component breakdown, data models, API designs
- Addresses security, performance, and architectural fit
- Creates ADRs for significant decisions

**`/tasks`** - Break plans into executable tasks
- Task Planner agent creates atomic tasks (<2 hours each)
- Dependency tracking: `[depends: 5,7,9]`
- Complexity estimation (small/medium/large)
- Logical ordering (data → logic → API → tests)

**`/execute`** - Implement with automated quality gates
- Sequential task execution with user confirmation
- **Per-Task Code Review** (Opus + extended thinking)
  - Security, quality, standards validation
  - Constitution compliance checks
  - Auto-fix issues (max 3 attempts)
- **Phase Review Gate** (NEW in v2025.10.24)
  - Automatic integration review after parent task completion
  - Validates all subtasks work together correctly
  - Creates remediation subtasks if issues found
  - Configurable via quality_gates.phase_review setting
- **Automated Testing**
  - Generates unit and integration tests
  - Validates coverage requirements
  - Ensures tests pass before proceeding
- **Context Management**
  - Monitors token usage during execution
  - Warns at 150K tokens (75% of 200K budget)
  - Offers context compaction to maintain performance
- Progress logging to implementation.md
- Architecture updates on completion
- Generates retrospectives

### Utility Commands

**`/status`** - View project status
- Active feature and progress
- All features table (pending/active/paused/completed)
- Context usage estimates
- Quick action suggestions

**`/think [question]`** - Deep analysis for complex decisions
- Opus model with extended thinking
- Structured analysis framework
- Multiple options with tradeoffs
- Actionable recommendations
- Optional ADR creation

**`/consolidate-docs`** - Organize existing documentation
- Scans all markdown files in project
- Consolidates scattered technical docs into DevFlow domains
- Provides archival recommendations
- Safe migration preserves original files

**`/readme-manager`** - Update project README
- Invokes readme-maintainer agent
- Analyzes current project state
- Updates or creates comprehensive README.md
- Ensures documentation accuracy

**`/idea [text | complete N | clear]`** - Quick idea capture
- Capture ideas without leaving the terminal
- Add: `/idea "Your idea here"`
- List: `/idea` (shows all ideas)
- Mark complete: `/idea complete 3`
- Clear done: `/idea clear`
- Stored in `.devflow/ideas.md`
- Uses ideas agent for isolated context

### Intelligent Agents (9 total)

**Architect Agent** (Opus)
- Technical planning and design
- Extended thinking for complex decisions
- Tech stack-aware recommendations
- ADR creation for significant choices

**Task Planner Agent** (Sonnet)
- Breaks plans into atomic tasks
- Dependency analysis and ordering
- Complexity estimation
- Testing and documentation tasks included

**Code Reviewer Agent** (Opus)
- Deep code review with extended thinking
- Security, quality, architecture checks
- Constitution standards enforcement
- Specific, actionable feedback

**Test Engineer Agent** (Sonnet)
- Automated test generation
- Unit and integration tests
- Coverage validation
- Test execution and failure analysis

**State Manager Agent** (Sonnet)
- State transition validation
- Guided workflow (warn but allow skipping)
- Single active feature enforcement
- Progress tracking

**Git Operations Manager** (Sonnet)
- Git workflow automation (commits, pushes, pulls)
- Branch and worktree management
- Conventional commit standards enforcement
- Conflict detection and resolution guidance

**README Maintainer** (Sonnet)
- Comprehensive README.md creation and updates
- Project structure analysis and documentation
- Accuracy verification against actual codebase
- Multi-audience documentation (users, contributors, operators)

**Checkpoint Reviewer** (Opus)
- Phase-level integration validation
- Post-parent-task review gate
- Remediation subtask creation
- Multi-level quality assurance

**Ideas Agent** (Haiku)
- Quick idea capture and management
- Add, list, complete, and clear ideas
- Maintains .devflow/ideas.md checklist
- Fast, isolated context for rapid capture

---

## Installation

### 🚀 Quick Start (30 seconds)

**From your project directory:**

```bash
# Navigate to your project
cd /path/to/your/project

# Windows users: Open Git Bash terminal (not PowerShell)

# Install DevFlow (creates .claude/ and .devflow/ directories)
curl -sSL https://raw.githubusercontent.com/mathewtaylor/devflow/main/scripts/install-devflow.sh | bash

# Initialize (creates constitution, architecture, integrates with CLAUDE.md)
/init

# Create your first feature
/spec user-authentication
```

**That's it!** DevFlow is now managing your feature development.

**Windows Note:** All commands above should be run in Git Bash, not PowerShell.

---

### Requirements

- **Claude Code CLI** (latest version)
- **Node.js** (for state.json utilities)
- **Bash shell**
  - **Linux/Mac:** Already installed ✓
  - **Windows:** Git Bash (comes with [Git for Windows](https://git-scm.com/download/win))

### Why Git Bash on Windows?

DevFlow's slash commands use bash for file operations and state queries. Git Bash provides these POSIX utilities on Windows.

**Checking if you have it:**
```bash
bash --version
# Should show: GNU bash, version X.X.X
```

**If not installed:**
Download [Git for Windows](https://git-scm.com/download/win) - Git Bash is included in the installation.

### Bash Installation (Linux/Mac/Git Bash on Windows)

```bash
# 1. Navigate to your project directory
cd /path/to/your/project

# 2. Install DevFlow
curl -sSL https://raw.githubusercontent.com/mathewtaylor/devflow/main/scripts/install-devflow.sh | bash

# Or download, review, then run
curl -O https://raw.githubusercontent.com/mathewtaylor/devflow/main/scripts/install-devflow.sh
chmod +x install-devflow.sh
./install-devflow.sh

# 3. Initialize DevFlow
/init
```

### Manual Installation

If you prefer manual setup:

```bash
# 1. Clone repository
git clone https://github.com/mathewtaylor/devflow.git
cd devflow

# 2. Copy files to your project
# Copy Claude Code integration (agents and commands)
cp -r devflow/integrations/claude/agents /path/to/your-project/.claude/
cp -r devflow/integrations/claude/commands /path/to/your-project/.claude/

# Copy shared templates and utilities
cp -r devflow/templates /path/to/your-project/.devflow/
cp -r devflow/lib /path/to/your-project/.devflow/
cp devflow/state.json.schema /path/to/your-project/.devflow/
cp devflow/instructions.md /path/to/your-project/.devflow/

# 3. Initialize DevFlow
cd /path/to/your-project
/init
```

### What Gets Installed

The installer creates:
- `.claude/agents/` - 9 specialized AI agents
- `.claude/commands/devflow/` - 11 slash commands
- `.devflow/templates/` - 9 infrastructure templates
- `.devflow/lib/` - 2 utility libraries (state-io.js, cli.js)
- `.devflow/` - Schema and instructions files

**Version:** 2025.10.24 (latest)

**Note on Repository Structure:**
DevFlow's repository is organized for multi-agent support:
- `devflow/integrations/claude/` - Claude Code-specific files
- Future: `devflow/integrations/codex/`, `devflow/integrations/gemini/`
- Installation maps to `.claude/` and `.devflow/` in your project

**Note:** Installation does NOT modify existing files. The `/init` command will automatically integrate DevFlow instructions with your existing CLAUDE.md if present.

---

## Quick Start

**5-Minute Tutorial:**

```bash
# Step 1: Initialize DevFlow
/init
# Interactive wizard asks about:
# - Project type and tech stack
# - Architecture patterns (Clean Architecture, MVC, etc.)
# - Testing requirements
# - Cross-cutting concerns (auth, multi-tenancy, caching, etc.)

# Step 2: Create your first feature
/spec user-authentication
# Answer questions about:
# - Problem and goals
# - User stories
# - Acceptance criteria
# - Technical requirements

# Step 3: Generate technical plan
/plan
# AI Architect analyzes and creates:
# - Component breakdown
# - Data models
# - API endpoints
# - Testing strategy
# - Implementation order

# Step 4: Break into tasks
/tasks
# Task Planner creates atomic task list:
# - 1. Create User entity (small)
# - 2. Add DbContext configuration (small)
# - 3. Implement PasswordHasher (medium)
# ... etc

# Step 5: Execute with quality gates
/execute
# For each task:
# - Implement code
# - Code review (Opus + extended thinking)
# - Generate and run tests
# - Mark complete
# - Move to next task

# Step 6: Check progress anytime
/status
# See active feature, progress, all features
```

---

## Quick Feature Workflow (< 2 Hours)

For small features, bug fixes, or simple enhancements, use the streamlined `/build-feature` command:

```bash
/build-feature "Add email validation to signup form"

# DevFlow analyzes and confirms understanding:
# "I understand you want to:
#  → Add email validation to the user signup form
#  → Validate email format on client side
#  → Show error message for invalid emails
# Is this correct? (y/n)"

# Then asks 2-4 targeted clarification questions:
# 1. Which file contains the signup form?
# 2. Should validation happen on blur, on submit, or both?
# 3. What error message should display?
# 4. Any existing validation library to use?

# Creates:
# ✓ Simplified spec.md
# ✓ Auto-generated tasks.md (5-10 tasks)

# Immediately starts execution with same quality gates:
# - Code review (Opus + extended thinking)
# - Test generation and validation
# - Streamlined documentation
```

**When to use `/build-feature`:**
- ✅ Feature takes < 2 hours
- ✅ Well-understood requirements
- ✅ Simple changes (bug fix, UI tweak, validation, etc.)
- ✅ Want quality gates without heavy process

**When to use full workflow (`/spec` → `/plan` → `/tasks` → `/execute`):**
- ✅ Feature takes > 2-4 hours
- ✅ Significant architectural decisions needed
- ✅ Multiple components/modules affected
- ✅ Cross-cutting concerns to consider

---

## Optional: Consolidate Existing Documentation

If you're adding DevFlow to an **existing project** with scattered documentation, use `/consolidate-docs` to organize it into DevFlow's structured domain system.

### What It Does

`/consolidate-docs` automatically:
- **Scans** all markdown files in your project
- **Analyzes** content to detect topics (authentication, database, API, caching, etc.)
- **Consolidates** information into structured domain files
- **Provides** clear recommendations for archiving old docs

### When to Use

✅ **Use consolidation if you have:**
- Multiple documentation files scattered across folders
- Technical docs mixed with general project info
- Documentation for authentication, APIs, database, infrastructure
- Wiki or docs/ folders with technical content

❌ **Skip consolidation if:**
- Fresh project with no existing docs
- Only have README, CONTRIBUTING, CHANGELOG (general project files)
- Prefer to document as you build features

### Usage

```bash
# After running /init
/consolidate-docs

# Review the consolidation report
# Verify domain files created correctly
# Archive old documentation using provided commands
```

### Example: Before & After

**Before consolidation:**
```
my-project/
├── docs/
│   ├── auth.md              # Authentication details
│   ├── database.md          # Database conventions
│   ├── api-design.md        # API patterns
│   ├── caching.md           # Cache strategy
│   └── deployment.md        # Deployment guide
├── wiki/
│   ├── permissions.md       # RBAC system
│   └── login-flow.md        # Login sequence
├── README.md                # Mixed content
└── ARCHITECTURE.md          # System overview
```

**After consolidation:**
```
my-project/
├── .devflow/
│   └── domains/
│       ├── _index.md                           # Auto-updated index
│       ├── security/
│       │   ├── authentication.md               # From: docs/auth.md, wiki/login-flow.md, README.md
│       │   └── authorization.md                # From: wiki/permissions.md
│       ├── data/
│       │   └── database-conventions.md         # From: docs/database.md, ARCHITECTURE.md
│       ├── infrastructure/
│       │   └── caching.md                      # From: docs/caching.md
│       └── integration/
│           └── third-party-apis.md             # From: docs/api-design.md, README.md
├── archive/
│   └── 20251020/                               # Old docs safely archived
│       ├── auth.md
│       ├── database.md
│       ├── api-design.md
│       ├── caching.md
│       ├── permissions.md
│       └── login-flow.md
├── README.md                                   # General info preserved
└── ARCHITECTURE.md                             # System overview preserved
```

### Benefits

✅ **Centralized** - All technical documentation in one structured location
✅ **Organized** - Consistent format across all domains
✅ **Smart loading** - Claude Code only loads relevant domains per feature
✅ **Safe migration** - Original files preserved until you archive them
✅ **Source tracked** - Each domain file notes where information came from
✅ **Maintainable** - Update one domain file instead of scattered docs

### What Gets Consolidated

The command detects and consolidates:

| Domain Category | Detects Content About |
|-----------------|----------------------|
| **Security** | Authentication, authorization, encryption, access control |
| **Data** | Database conventions, migrations, audit trails |
| **Infrastructure** | Caching, logging, error handling, multi-tenancy |
| **Integration** | API design, third-party APIs, message queues, webhooks |

General project files (README, CONTRIBUTING, CHANGELOG, LICENSE) are **never consolidated** - they stay in your project root.

### Consolidation Report

After running, you'll get a detailed report showing:
- Which domain files were created
- Source files for each domain
- Files safe to archive
- Commands to archive old docs

**Example report snippet:**
```
✅ Documentation consolidated successfully!

Created Domain Files:
  • security/authentication.md (from 3 files)
  • security/authorization.md (from 2 files)
  • data/database-conventions.md (from 2 files)

Archival Recommendations:
  ⚠️ docs/auth.md → consolidated into security/authentication.md
  ⚠️ docs/database.md → consolidated into data/database-conventions.md

Archive commands provided to safely move old files.
```

---

## Workflow Deep Dive

### Phase 1: Specification (`/spec`)

**Purpose:** Capture requirements clearly before coding

**Outputs:**
- `.devflow/features/yyyymmdd-feature-name/spec.md`
- Tagged cross-cutting concerns for smart loading
- Updated `state.json` with feature entry

**What it captures:**
- Problem statement
- Goals and objectives
- User stories (As a X, I want Y, so that Z)
- Acceptance criteria (checklist)
- Technical requirements
- Dependencies (services, features, database)
- Risks and challenges
- Explicitly out of scope

### Phase 2: Technical Planning (`/plan`)

**Purpose:** Transform requirements into technical design

**Agent:** Architect (Opus with extended thinking)

**Outputs:**
- `.devflow/features/yyyymmdd-feature-name/plan.md`
- Optional ADR in `.devflow/decisions/`
- Updated state: phase=PLAN

**What it creates:**
- Technical approach and architecture pattern
- Component breakdown (services, controllers, repositories)
- Data models (entities, relationships, migrations)
- API designs (endpoints, request/response)
- Business logic flow
- Integration points
- Cross-cutting concern implementation
- Security and performance considerations
- Testing strategy
- Implementation order

### Phase 3: Task Breakdown (`/tasks`)

**Purpose:** Create actionable, ordered task list

**Agent:** Task Planner (Sonnet)

**Outputs:**
- `.devflow/features/yyyymmdd-feature-name/tasks.md`
- Updated state: phase=TASKS

**What it creates:**
```markdown
- [ ] 1. Create User entity with properties (small)
- [ ] 2. Add UserConfiguration to DbContext (small) [depends: 1]
- [ ] 3. Create migration for Users table (small) [depends: 1,2]
- [ ] 4. Implement IPasswordHasher interface (small)
- [ ] 5. Implement PasswordHasher with BCrypt (medium) [depends: 4]
- [ ] 6. Write unit tests for PasswordHasher (medium) [depends: 5]
... (20-30 tasks total for medium feature)
```

**Task groups:**
1. Data Layer
2. Business Logic
3. API Layer
4. Integration
5. Testing
6. Documentation

### Phase 4: Execution (`/execute`)

**Purpose:** Implement tasks with automated quality gates

**Outputs:**
- Working, tested code
- `.devflow/features/yyyymmdd-feature-name/implementation.md`
- `.devflow/features/yyyymmdd-feature-name/retrospective.md`
- Updated `architecture.md`
- Updated state: phase=DONE, status=completed

**Execution loop:**
```
For each parent task:
  1. Display parent task with all subtasks
  2. Ask user confirmation once per parent (y/n/skip/pause)
  3. For each subtask in parent:
     a. Implement code following constitution
     b. Per-Task Code Review (Opus + extended thinking)
        - If rejected: Fix issues (max 3 attempts)
        - If approved: Continue
     c. Generate Tests (unit + integration)
        - If failing: Fix code/tests (max 3 attempts)
        - If passing: Continue
     d. Mark subtask complete in tasks.md
     e. Log to implementation.md
     f. Update state
  4. Phase Review Gate (after all subtasks in parent):
     a. Validate integration across all subtasks
     b. Check spec alignment and architecture compliance
     c. If issues found: Create remediation subtasks
     d. Re-run phase review after remediation
     e. Max 3 review cycles, then ask user
  5. Check context usage (warn at 150K tokens)
  6. Move to next parent task

On completion:
  - Update architecture.md with feature changes
  - Generate retrospective.md with lessons learned
  - Mark feature complete in state.json
```

---

## Documentation Structure

```
.devflow/
├── constitution.md              # Project principles (read first!)
├── architecture.md              # Living system documentation
├── state.json                   # Progress tracking
├── .devflowignore              # Context exclusions
│
├── lib/
│   ├── state-io.js             # State management utilities
│   └── cli.js                  # CLI helper utilities
│
├── domains/                    # Cross-cutting concerns
│   ├── _index.md               # Quick reference (always loaded)
│   ├── security/
│   │   ├── authentication.md
│   │   ├── authorization.md
│   │   └── encryption.md
│   ├── infrastructure/
│   │   ├── multi-tenancy.md
│   │   ├── caching.md
│   │   ├── logging.md
│   │   └── error-handling.md
│   ├── data/
│   │   ├── database-conventions.md
│   │   ├── migrations.md
│   │   └── audit-trails.md
│   └── integration/
│       ├── third-party-apis.md
│       └── message-queues.md
│
├── features/                   # Per-feature documentation
│   └── yyyymmdd-feature-name/
│       ├── spec.md             # Requirements
│       ├── plan.md             # Technical design
│       ├── tasks.md            # Task checklist
│       ├── implementation.md   # Execution log
│       ├── retrospective.md    # Lessons learned
│       └── snapshot.md         # Resume context (created on pause)
│
└── decisions/                  # Architecture Decision Records
    ├── 0001-use-clean-architecture.md
    ├── 0002-jwt-for-authentication.md
    └── 0003-redis-for-caching.md
```

---

## Smart Context Management

DevFlow optimizes token usage through intelligent context loading:

### Tier 1: Always Loaded (~3K tokens)
- `constitution.md` - Project principles
- `architecture.md` - System overview
- `domains/_index.md` - Concerns reference

### Tier 2: Feature-Specific (~5-7K tokens)
- Current feature: spec, plan, tasks
- Relevant source code files

### Tier 3: On-Demand (~1-3K tokens each)
Domain docs loaded based on:
- **Tagged concerns** in spec
- **Keyword detection** (auth → authentication.md, tenant → multi-tenancy.md)
- **Agent intelligence** (pattern recognition)

**Result:** 15-20K tokens vs 100K+ without DevFlow

**Benefit:** Faster responses, lower costs, focused attention

---

## Cross-Cutting Concerns

Enterprise patterns documented once, applied consistently:

### Example: Multi-Tenancy

**Document once** (`.devflow/domains/infrastructure/multi-tenancy.md`):
```markdown
# Multi-Tenancy

## Key Rules
1. All entities must include TenantId column
2. Use HasQueryFilter for automatic tenant filtering
3. Resolve tenant from JWT claim "tenant_id"
4. Never allow TenantId in request body

## Implementation Pattern
[Code examples and best practices]
```

**Referenced automatically:**
- `/plan` loads when keywords detected
- `/execute` loads for relevant tasks
- Consistent implementation across features

### Supported Concerns

- **Authentication**: JWT, OAuth, session management
- **Authorization**: RBAC, ABAC, FLS patterns
- **Multi-tenancy**: Tenant isolation strategies
- **Caching**: Redis/Memcached patterns
- **Logging**: Structured logging, levels
- **Error handling**: Consistent error responses
- **Message queues**: Pub/sub patterns
- **Migrations**: Database change management
- **Third-party APIs**: Integration patterns
- **Rate limiting**: API throttling

---

## Why DevFlow?

### For Solo Developers

- **Never forget context**: Resume work instantly after breaks
- **Maintain quality**: Even when tired, quality gates protect you
- **Document naturally**: Docs generate as you build
- **Learn patterns**: Sees best practices in action

### For Teams

- **Shared vocabulary**: Everyone uses same structure
- **Living documentation**: Onboarding guide included
- **Decision history**: ADRs preserve reasoning
- **Consistent quality**: Standards enforced automatically
- **Parallel work**: Clear feature boundaries

### For Claude Code Users

- **Leverages strengths**: Uses Claude for analysis and generation
- **Extended thinking**: Critical reviews use deep reasoning
- **Smart agents**: Right model for each task (opus/sonnet/haiku)
- **Best practices**: Modern slash command patterns

---

## Advanced Features

### Pause and Resume

```bash
/execute
# Working on Task 12/28...
# [Interruption occurs]
Task 12/28: Continue? (y/n/skip/pause): pause

Create/update snapshot for easy resume? (y/n): y
✓ Snapshot saved: .devflow/features/20251024-user-auth/snapshot.md

⏸️ Execution paused at Task 12/28
Resume: /execute (no arguments needed)

# Later...
/execute
📸 Loading snapshot...

Last session summary:
─────────────────────────────────────────
Progress: 11/28 subtasks (39%)
Last completed: Subtask 1.11 - Validate user input
Files modified: 8 files
─────────────────────────────────────────

Resuming: User Authentication
Progress: 11/28 complete
Next: Task 12: Write integration tests...
Continue? (y): y
```

**Snapshots** preserve execution context when pausing, especially useful when:
- Using Claude Code's `/compact` to reset conversation context
- Resuming after long interruptions
- Working on complex features with many subtasks

Snapshot contains:
- Progress metrics (completed vs. total)
- Recent completed work
- Files modified
- Issues encountered
- Next steps

Snapshot is automatically created when you pause and deleted when the feature completes.

### Dependency Management

Tasks declare dependencies:
```markdown
- [ ] 5. Implement UserService.CreateUser (medium)
- [ ] 12. Create POST /api/users endpoint (medium) [depends: 5,7,9]
```

Before Task 12:
```
Task 12: Create POST /api/users endpoint
Dependencies: 5, 7, 9
Checking...
✓ Task 5: Complete
✓ Task 7: Complete
✓ Task 9: Complete

All dependencies met. Proceeding...
```

### Quality Gates

**Per-Task Code Review Gate:**
```
Code Review (Opus + extended thinking)...
🧠 Thinking about security implications...
🧠 Checking null handling...
🧠 Validating against constitution standards...

✗ CHANGES_REQUIRED

Critical Issues:
- Line 23: SQL injection vulnerability in query
  Fix: Use parameterized queries

Fixing... (attempt 1/3)
[Auto-fix applied]

Re-reviewing...
✓ APPROVED
```

**Phase Review Gate (NEW in v2025.10.24):**
```
Phase Review: Validating Parent Task 1 (Data Layer)
🧠 Checking integration across 4 completed subtasks...
🧠 Validating against spec requirements...
🧠 Analyzing architecture alignment...

⚠️ Phase review found issues

Critical Issues:
- User-Project relationship mapping incorrect
- Missing validation in User model

Creating remediation subtasks...
✓ Added: 1.R1. Fix User-Project relationship mapping
✓ Added: 1.R2. Add missing validation in User model

Executing remediation...
[Implements fixes with normal review + test gates]

Re-running phase review...
✓ Phase review APPROVED
  Parent Task 1: Data Layer validated
  All subtasks integrated correctly
```

**Testing Gate:**
```
Generating tests...
✓ 8 unit tests generated
✓ 3 integration tests generated

Running tests...
✗ 2 tests failed

Failed:
- UserService_CreateUser_ValidData: Expected email, got null

Fixing... (attempt 1/3)
[Fix applied to User entity initialization]

Re-running tests...
✓ 11/11 tests passed
Coverage: 92% (target: 80%)
```

**Context Management:**
```
⚠️ Context Warning

Current usage: 152,000/200,000 tokens (76%)
Remaining: 48,000 tokens

Large context may impact performance and increase costs.

Options:
a) Compact context now (recommended - creates summary and continues fresh)
b) Continue without compacting (may hit limit during next phase)
c) Pause execution (save progress and exit)

Choose: a

✓ Context compacted
  Summary preserved in .devflow/snapshots/
  Execution continues with fresh context
  All progress saved in state.json and tasks.md
```

### Decision Documentation

```bash
/think Should we use Redis or Memcached for caching?

🧠 Deep analysis with extended thinking...

[Comprehensive analysis with 3 options, tradeoffs]

Recommendation: Redis
- SignalR pub/sub integration
- Complex session data structures
- Horizontal scaling support

Should I create an ADR? (y): y

✓ ADR created: .devflow/decisions/0003-use-redis-for-caching.md
```

---

## Examples

### Example 1: Simple Feature

```bash
/spec add-dark-mode

# Wizard:
Problem: Users want dark theme option
Goals: Toggle between light and dark themes
User Stories:
- As a user, I want to switch to dark mode, so that I can reduce eye strain
Acceptance Criteria:
- Toggle button in settings
- Preference persists across sessions
- Smooth transition animation

/plan
# Architect creates plan:
# - CSS variables for theming
# - Local storage for persistence
# - Context provider for theme state
# - Toggle component

/tasks
# Task Planner creates 8 tasks (~4 hours)

/execute
# ✓ 8/8 tasks complete
# ✓ 12 tests generated and passing
# ✓ Coverage: 94%
# ✓ Feature complete
```

### Example 2: Complex Enterprise Feature

```bash
/spec multi-tenant-data-isolation

# Wizard captures:
# - Tenant isolation requirements
# - RBAC within tenants
# - Database strategy (schema per tenant vs shared)
# - Cross-tenant admin access rules
# Tags: multi-tenancy, authorization, database

/plan
# Architect (with multi-tenancy domain loaded):
# - TenantId on all entities
# - HasQueryFilter for automatic filtering
# - Tenant resolution middleware
# - Admin bypass mechanism
# - Migration strategy

/tasks
# 28 tasks generated (~18 hours):
# - Data layer: 8 tasks
# - Business logic: 12 tasks
# - API layer: 5 tasks
# - Testing: 15 tests
# - Documentation: 3 tasks

/execute
# ✓ 28/28 tasks complete
# ✓ 127 tests passing
# ✓ Coverage: 89%
# ✓ architecture.md updated with multi-tenancy patterns
# ✓ Retrospective generated
```

### Example 3: Architectural Decision

```bash
/think Our monolith is getting large. Should we move to microservices?

🧠 Thinking deeply about architecture tradeoffs...

Context Analysis:
- Current: Monolith, 50K LOC, 3 team members
- Pain: Deployment takes 15 min, occasional conflicts
- Strengths: Simple operations, fast development

Options:
A) Microservices: Full decomposition
B) Modular Monolith: Modules with clear boundaries
C) Hybrid: Extract 1-2 services, keep core monolithic

Evaluation: [detailed analysis]

Recommendation: Modular Monolith (Option B)
- Current pain doesn't justify microservices complexity
- Modular monolith gives boundaries without operational burden
- Can extract services later if truly needed
- Team size doesn't support microservices operations yet

Create ADR? (y): y
✓ ADR 0005: Remain modular monolith, defer microservices
```

---

## Best Practices

### Do:

✅ Run `/init` first to establish foundation
✅ Use `/status` regularly to check progress
✅ Tag cross-cutting concerns in specs (enables smart loading)
✅ Trust the code reviewer and test engineer
✅ Create ADRs for significant decisions (`/think`)
✅ Update constitution when standards evolve
✅ Review retrospectives to learn from each feature
✅ Pause when interrupted (don't lose context)

### Don't:

❌ Skip phases (spec → execute directly)
❌ Ignore code review warnings
❌ Bypass failing tests
❌ Let documentation lag behind code
❌ Hard-code values that belong in constitution
❌ Work on multiple features simultaneously (single active feature)
❌ Forget to update architecture.md when patterns change

---

## Troubleshooting

### Windows: Commands Fail with "command not found"

**Problem:** Slash commands fail with errors like:
```
'test' is not recognized as an internal or external command
'find' is not recognized as an internal or external command
```

**Cause:** You're running Claude Code in PowerShell or cmd without Git Bash.

**Solution:**

1. **Install Git for Windows** (includes Git Bash):
   ```
   Download: https://git-scm.com/download/win
   ```
   - During installation, ensure "Git Bash Here" is selected
   - Accept default options

2. **Verify installation:**
   Open a new terminal and run:
   ```bash
   bash --version
   ```
   Should show: `GNU bash, version 5.x.x`

3. **Use Git Bash with Claude Code:**
   - Open Git Bash terminal (not PowerShell)
   - Navigate to your project
   - Run Claude Code from Git Bash
   - DevFlow commands will now work

**Alternative:** Use WSL (Windows Subsystem for Linux) for native bash support.

### Commands Work Sometimes But Not Always

**Cause:** You're switching between Git Bash and PowerShell terminals.

**Solution:** Always use Git Bash on Windows. DevFlow slash commands require bash syntax.

### Git Bash Installed But Commands Still Fail

**Check these:**

1. **Git Bash in PATH?**
   ```bash
   where bash
   # Should show path to bash.exe
   ```

2. **Running from Git Bash terminal?**
   - Terminal title should say "MINGW64" or "Git Bash"
   - NOT "PowerShell" or "Windows PowerShell"

3. **Restart terminal after Git installation**
   - Close all terminals
   - Open new Git Bash terminal
   - Try commands again

### State file corrupted

```bash
# Restore from automatic backup
cp .devflow/state.json.bak .devflow/state.json

# Or reinitialize (loses feature progress)
/init
```

### Context too large warning

**NEW in v2025.10.24:** `/execute` automatically monitors context usage and warns at 150K tokens.

```bash
# Automatic warning during execution
⚠️ Context Warning
Current usage: 152,000/200,000 tokens (76%)

Options:
a) Compact context now (recommended)
b) Continue without compacting
c) Pause execution

# Choose option 'a' to compact and continue
# All progress is preserved in state.json and tasks.md
```

**Manual approach:**
```bash
# Create snapshot and pause
/execute
# When prompted at any time: pause → snapshot created

# Resume later with fresh context
/execute  # State preserved, continues from where you left off
```

### Stuck in review/test cycle

After 3 failed attempts:
```
⚠️ Unable to pass review after 3 attempts.

Remaining issues:
- [Issue description]

Options:
a) Continue anyway (not recommended)
b) Skip this task for now
c) Pause for manual intervention
d) Get user help

Choose:
```

### Feature folder deleted accidentally

```bash
# State.json still references it
# Remove from state manually or:
node -e "const s=require('./.devflow/state.json'); delete s.features['20251020-deleted']; require('fs').writeFileSync('.devflow/state.json', JSON.stringify(s,null,2))"
```

---

## Architecture

### Repository Structure (Multi-Agent Ready)

DevFlow is organized to support multiple AI coding assistants:

```
devflow/
├── integrations/
│   └── claude/                    # Claude Code-specific implementation
│       ├── agents/                # 9 specialized agents
│       └── commands/devflow/      # 11 workflow commands
├── templates/                     # 6 shared infrastructure templates
├── lib/                          # 2 utility libraries
└── [schema and instructions]     # Shared validation and docs
```

**User Installation:** Files install to `.claude/` and `.devflow/` in target projects

**Future:** Support for OpenAI Codex, GeminiCLI, and other agents via `integrations/` structure

### Command Layer
- Slash commands in `.claude/commands/devflow/`
- YAML frontmatter (tools, model, argument hints)
- Bash execution (`!`) for dynamic state gathering
- File references (`@`) for context loading
- Model optimization (haiku for simple, sonnet for medium, opus for complex)

### Agent Layer
- Specialized agents in `.claude/agents/` (9 total)
- Opus for deep thinking (Architect, Code Reviewer, Checkpoint Reviewer)
- Sonnet for execution (Task Planner, Test Engineer, State Manager, Git Operations Manager, README Maintainer)
- Haiku for fast operations (Ideas)
- Structured outputs (JSON/markdown)
- Reusable across commands

### State Layer
- JavaScript utilities (`.devflow/lib/state-io.js`)
- Atomic file operations with backups
- JSON schema validation
- State Manager agent for intelligent transitions

### Documentation Layer
- Templates for consistency
- Living docs (architecture.md auto-updates)
- Per-feature lifecycle capture
- Cross-cutting concerns organization

---

## Roadmap

### v2025.10.24 (Current - Released)
- [x] Repository restructure for multi-agent support
- [x] Snapshot functionality for pause/resume workflow
- [x] Phase Review Gate with remediation workflow
- [x] Context management with automatic monitoring
- [x] README Maintainer agent
- [x] Enhanced multi-level quality gates

### Next Release
- [ ] Visual progress dashboard
- [ ] GitHub integration (issues → specs, PRs → features)
- [ ] More domain templates (API versioning, rate limiting)
- [ ] Parallel task execution (when no dependencies)

### v1.2
- [ ] Team collaboration features (assign tasks, review flows)
- [ ] Custom agent templates
- [ ] Analytics and insights (velocity, quality metrics)
- [ ] VSCode extension

### Future
- [ ] Multi-project support
- [ ] Feature dependencies across projects
- [ ] AI-suggested optimizations
- [ ] Integration with project management tools

---

## Contributing

Contributions welcome! Areas of interest:

- **Domain templates**: Add templates for common patterns
- **Agent improvements**: Enhance agent capabilities
- **Command enhancements**: New slash commands or improvements
- **Documentation**: Tutorials, guides, examples
- **Bug fixes**: Report or fix issues
- **Testing**: Validate in different tech stacks

See `CONTRIBUTING.md` for guidelines.

---

## License

MIT License - Use freely in personal and commercial projects.

See `LICENSE` for full text.

---

## Acknowledgments

- Built for **Claude Code CLI** by Anthropic
- Uses **extended thinking** for deep analysis and code review
- Inspired by **Agent-OS** and structured development methodologies
- Created to make feature development systematic and joyful

---

## Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/devflow/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/devflow/discussions)
- **Documentation**: [Full docs](https://devflow.dev/docs) (coming soon)

---

**DevFlow** - Build features with confidence, structure, and AI-powered quality gates.

Made with ❤️ for developers who value quality and maintainability.
