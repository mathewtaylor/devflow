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

### Core Workflow Commands

**`/init`** - Initialize DevFlow in your project
- Interactive wizard for project constitution
- Automatic architecture documentation for existing projects
- Sets up cross-cutting concerns documentation

**`/spec [feature-name]`** - Create feature specifications
- Interactive wizard guides requirements gathering
- User stories and acceptance criteria
- Cross-cutting concerns tagging for smart context loading

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
- **Code Review** (Opus + extended thinking)
  - Security, quality, standards validation
  - Constitution compliance checks
  - Auto-fix issues (max 3 attempts)
- **Automated Testing**
  - Generates unit and integration tests
  - Validates coverage requirements
  - Ensures tests pass before proceeding
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

### Intelligent Agents

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

---

## Installation

### 🚀 Quick Start (30 seconds)

**From your project directory:**

```bash
# Navigate to your project
cd /path/to/your/project

# Install DevFlow (creates .claude/ and .devflow/ directories)
curl -sSL https://raw.githubusercontent.com/mathewtaylor/devflow/main/scripts/install-devflow.sh | bash

# Initialize (creates constitution, architecture, integrates with CLAUDE.md)
/init

# Create your first feature
/spec user-authentication
```

**That's it!** DevFlow is now managing your feature development.

---

### Requirements

- **Claude Code CLI** (latest version)
- **Node.js** (for state.json utilities)

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

### PowerShell Installation (Windows)

```powershell
# 1. Navigate to your project directory
cd C:\path\to\your\project

# 2. Download and run installer
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/mathewtaylor/devflow/main/scripts/Install-DevFlow.ps1" -OutFile "Install-DevFlow.ps1"
.\Install-DevFlow.ps1

# Optional: Install to different directory without navigating
.\Install-DevFlow.ps1 -TargetPath "C:\MyProject"

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
cp -r claude/ /path/to/your-project/.claude/
cp -r devflow/ /path/to/your-project/.devflow/

# 3. Initialize DevFlow
cd /path/to/your-project
/init
```

### What Gets Installed

The installer creates:
- `.claude/agents/` - 5 specialized AI agents
- `.claude/commands/devflow/` - 7 slash commands
- `.devflow/` - Templates and utilities

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
For each task:
  1. Display task with dependencies
  2. Ask user confirmation (y/n/skip/pause)
  3. Implement code
  4. Code Review (Opus + extended thinking)
     - If rejected: Fix issues (max 3 attempts)
     - If approved: Continue
  5. Generate Tests (unit + integration)
     - If failing: Fix code/tests (max 3 attempts)
     - If passing: Continue
  6. Mark complete in tasks.md
  7. Log to implementation.md
  8. Update state
  9. Next task or complete

On completion:
  - Update architecture.md
  - Generate retrospective.md
  - Mark feature complete
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
│   └── state-io.js             # State management utilities
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
│       └── retrospective.md    # Lessons learned
│
├── decisions/                  # Architecture Decision Records
│   ├── 0001-use-clean-architecture.md
│   ├── 0002-jwt-for-authentication.md
│   └── 0003-redis-for-caching.md
│
└── snapshots/                  # Context snapshots for resume
    └── snap_feature_timestamp.md
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

⏸️ Execution paused at Task 12/28
Resume: /execute (no arguments needed)

# Later...
/execute
Resuming: User Authentication
Progress: 11/28 complete
Next: Task 12: Write integration tests...
Continue? (y): y
```

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

**Code Review Gate:**
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

### State file corrupted

```bash
# Restore from automatic backup
cp .devflow/state.json.bak .devflow/state.json

# Or reinitialize (loses feature progress)
/init
```

### Context too large warning

```bash
# Create snapshot and continue with fresh context
/execute
# When prompted: pause → create snapshot

# Or manually create snapshot
# Document current progress in .devflow/snapshots/
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

### Command Layer
- Slash commands in `.claude/commands/devflow/`
- YAML frontmatter (tools, model, argument hints)
- Bash execution (`!`) for dynamic state gathering
- File references (`@`) for context loading
- Model optimization (haiku for simple, sonnet for medium, opus for complex)

### Agent Layer
- Specialized agents in `.claude/agents/`
- Opus for thinking (Architect, Code Reviewer)
- Sonnet for execution (Task Planner, Test Engineer, State Manager)
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

### v1.1 (Next Release)
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
