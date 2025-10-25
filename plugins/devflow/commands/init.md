---
# Note: Bash unrestricted - safe because all bash commands are read-only detection
# (checking for files, git repos, package managers). File writes use Write tool.
allowed-tools: Read, Write, Glob, Grep, AskUserQuestion, Task(architect), Bash
argument-hint:
description: Initialize DevFlow - create constitution and architecture documentation
model: sonnet
version: 2025.10.23
---

> **Windows Users:** This command uses bash syntax. Ensure you have Git Bash installed and are running Claude Code from a Git Bash terminal, not PowerShell. [Installation guide](https://github.com/mathewtaylor/devflow#requirements)

# Initialize DevFlow

Create personalized constitution and architecture documentation for this project.

## Setup DevFlow Infrastructure

**BEFORE proceeding, ensure .devflow/ directory structure exists:**

- Check if .devflow exists: !`test -d .devflow && echo "exists" || echo "not_exists"`

**If .devflow does NOT exist:**

1. **Check installation method:**
   - Plugin installed: !`test -n "${CLAUDE_PLUGIN_ROOT}" && echo "plugin" || echo "manual"`

2. **If plugin installation detected** (`${CLAUDE_PLUGIN_ROOT}` is set):
   - Create .devflow directory: !`mkdir -p .devflow`
   - Copy templates: !`cp -r "${CLAUDE_PLUGIN_ROOT}/templates" .devflow/`
   - Copy libraries: !`mkdir -p .devflow/lib && cp "${CLAUDE_PLUGIN_ROOT}/lib"/*.js .devflow/lib/`
   - Copy schema: !`cp "${CLAUDE_PLUGIN_ROOT}/state.json.schema" .devflow/`
   - Copy instructions: !`cp "${CLAUDE_PLUGIN_ROOT}/instructions.md" .devflow/`

3. **If manual installation** (`${CLAUDE_PLUGIN_ROOT}` is NOT set):
   - Files should already exist from install script
   - If missing, inform user: "Please run the DevFlow installation script first"
   - Installation guide: https://github.com/mathewtaylor/devflow#installation

**After ensuring .devflow/ exists, proceed with initialization.**

## Current State

- DevFlow initialized: !`test -f .devflow/constitution.md && echo "yes" || echo "no"`
- Existing code detected: !`node "${CLAUDE_PLUGIN_ROOT}/lib/cli.js" query code_detected 2>/dev/null || node .devflow/lib/cli.js query code_detected 2>/dev/null || echo "unknown"`
- Package files found: !`node "${CLAUDE_PLUGIN_ROOT}/lib/cli.js" query package_files 2>/dev/null || node .devflow/lib/cli.js query package_files 2>/dev/null || echo "unknown"`

## Your Task

If already initialized, ask user whether to reinitialize (create backups of existing files).

Run an interactive constitution wizard to gather:

**Project Overview:**
1. What does this project do? (brief description)
2. Who are the target users?
3. Core business rules or constraints

**Tech Stack:**
4. Primary language (JavaScript, TypeScript, C#, Python, Java, Go, etc.)
5. Framework (React, Next.js, ASP.NET Core, Django, Spring Boot, etc.)
6. Database (PostgreSQL, MySQL, SQL Server, MongoDB, etc.)
7. Additional technologies (Redis, Docker, etc.)

**Architecture:**
8. Based on tech stack, suggest patterns:
   - **.NET:** Clean Architecture + CQRS, Vertical Slice, Traditional Layered
   - **Node.js:** MVC, Clean Architecture, Feature-based
   - **React:** Atomic Design, Feature-based, Pages + Components
   - *Ask follow-up questions based on selection (e.g., MediatR? FluentValidation?)*

**Standards:**
9. Linter (ESLint, Pylint, etc.)
10. Formatter (Prettier, Black, etc.)
11. Naming conventions

**Testing:**
12. Unit test framework
13. Coverage requirement
14. Integration testing approach

**Security:**
15. Authentication (JWT, OAuth, session cookies, etc.)
16. Authorization (RBAC, ABAC, custom)

**Performance:**
17. Performance requirements or SLAs

**Cross-Cutting Concerns:**
18. Which patterns apply? (multi-select)
    - Multi-tenancy
    - RBAC/ABAC
    - Caching
    - Message queues
    - Audit logging
    - API versioning
    - Rate limiting

Generate `@../../../.devflow/constitution.md` from template, filling all {{PLACEHOLDERS}} with gathered info.

---

## Architecture Setup

### If Existing Project (code detected):

1. Scan codebase using Glob/Grep:
   - Project structure, tech stack, frameworks
   - Database (ORM files, migrations)
   - API patterns, services, components

2. Present findings to user:
   ```
   Found:
   ✓ ASP.NET Core 8.0, EF Core, SQL Server
   ✓ /Controllers - 12 controllers
   ✓ /Services - 8 services
   ✓ Repository pattern detected

   Is this accurate? (y/n)
   ```

3. Get feedback, generate `@../../../.devflow/architecture.md`

4. Ask user to review: "Check .devflow/architecture.md and refine. Press Enter when ready."

### If New Project (no code):

1. Suggest architecture based on selected patterns
2. Show proposed folder structure and key libraries
3. Ask user: Use this/Different approach/Describe own
4. Generate architecture blueprint in `@../../../.devflow/architecture.md`

---

## Domain Documentation

For each selected cross-cutting concern, create template in `.devflow/domains/`:
- `security/authentication.md`
- `security/authorization.md`
- `infrastructure/multi-tenancy.md`
- `infrastructure/caching.md`
- etc.

Update `@../../../.devflow/domains/_index.md` with one-line summaries.

---

## Initialize State

Create `.devflow/state.json`:
```json
{
  "initialized": true,
  "initialized_at": "{{ISO_TIMESTAMP}}",
  "active_feature": null,
  "features": {}
}
```

---

## Documentation Discovery Notification

Check for existing documentation files:

- Markdown count: !`node "${CLAUDE_PLUGIN_ROOT}/lib/cli.js" query markdown_count "README.md,CONTRIBUTING.md,CHANGELOG.md,LICENSE.md" 2>/dev/null || node .devflow/lib/cli.js query markdown_count "README.md,CONTRIBUTING.md,CHANGELOG.md,LICENSE.md" 2>/dev/null || echo "0"`

**If markdown count > 5:**

Display notification:
```
📚 Documentation Detected

Found {{count}} markdown files in your project with technical documentation.

You can consolidate them into DevFlow's domain structure:
  /consolidate-docs

This will:
  • Analyze existing documentation
  • Extract technical information (auth, database, API, etc.)
  • Organize into structured .devflow/domains/
  • Provide archival recommendations for old docs

Run this now or later. DevFlow works great either way!
```

**If markdown count ≤ 5:**
- Skip notification (too few files to warrant consolidation)

---

## CLAUDE.md Integration

Automatically integrate DevFlow reference with project's CLAUDE.md file.

### Check for existing CLAUDE.md

- CLAUDE.md exists: !`test -f CLAUDE.md && echo "yes" || echo "no"`

### Integration Logic

**If CLAUDE.md EXISTS:**

1. Read existing CLAUDE.md content
2. Check if DevFlow section already present (search for either):
   - `## DevFlow` (heading)
   - `@.devflow/instructions.md` (reference to instructions)

3. **If DevFlow section NOT present:**
   - Append delimiter: `\n---\n\n`
   - Append minimal reference section:
     ```markdown
     ## DevFlow

     This project uses **DevFlow** for structured feature development.

     For complete DevFlow instructions, see: @.devflow/instructions.md

     Last updated: YYYY-MM-DD
     ```
   - Replace `YYYY-MM-DD` with current date: `$(date +%Y-%m-%d)`
   - Write back to CLAUDE.md
   - Track result: "✓ DevFlow reference added to CLAUDE.md"

4. **If DevFlow section ALREADY present:**
   - Find section boundaries:
     - Start: Line containing `## DevFlow`
     - End: Next `---` separator OR next `##` heading OR end of file
   - Replace entire DevFlow section with updated minimal reference (same as step 3)
   - Replace `YYYY-MM-DD` with current date
   - Write back to CLAUDE.md
   - Track result: "✓ DevFlow reference updated in CLAUDE.md"

**If CLAUDE.md DOES NOT EXIST:**

1. Create new CLAUDE.md with minimal reference section:
   ```markdown
   # CLAUDE.md

   This file provides guidance to Claude Code when working with this repository.

   ---

   ## DevFlow

   This project uses **DevFlow** for structured feature development.

   For complete DevFlow instructions, see: @.devflow/instructions.md

   Last updated: YYYY-MM-DD
   ```
2. Replace `YYYY-MM-DD` with current date: `$(date +%Y-%m-%d)`
3. Write to `CLAUDE.md` in project root
4. Track result: "✓ Created CLAUDE.md with DevFlow reference"

### Implementation Notes

- Use current date: `$(date +%Y-%m-%d)`
- Detection searches for `## DevFlow` heading or `@.devflow/instructions.md` reference
- When appending to existing file, use clean delimiter: `\n---\n\n`
- DevFlow section is minimal (5 lines) - full instructions live in `.devflow/instructions.md`
- User's CLAUDE.md stays clean; updates never touch user content

---

## Output

```
✅ DevFlow initialized successfully!

Files created:
- .devflow/constitution.md
- .devflow/architecture.md
- .devflow/state.json
- .devflow/domains/_index.md
{{domain docs created}}

CLAUDE.md: {{status}}
  (Status: "✓ DevFlow section added" | "✓ DevFlow section updated" | "✓ Created with DevFlow instructions")

{{#if docs_detected}}
📚 Optional: Run /consolidate-docs to organize existing documentation
{{/if}}

Next: Run /spec [feature-name] to create your first feature
Example: /spec user-authentication
```
