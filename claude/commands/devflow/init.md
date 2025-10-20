---
allowed-tools: Read, Write, Glob, Grep, AskUserQuestion, Task(architect)
argument-hint:
description: Initialize DevFlow - create constitution and architecture documentation
model: sonnet
---

# Initialize DevFlow

Create personalized constitution and architecture documentation for this project.

## Current State

- DevFlow initialized: !`test -f .devflow/constitution.md && echo "yes" || echo "no"`
- Existing code detected: !`(find . -name "*.js" -o -name "*.ts" -o -name "*.cs" -o -name "*.py" 2>/dev/null | head -1 | grep -q . && echo "yes") || echo "no"`
- Package files found: !`ls package.json *.csproj requirements.txt pom.xml 2>/dev/null || echo "none"`

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

Generate `@.devflow/constitution.md` from template, filling all {{PLACEHOLDERS}} with gathered info.

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

3. Get feedback, generate `@.devflow/architecture.md`

4. Ask user to review: "Check .devflow/architecture.md and refine. Press Enter when ready."

### If New Project (no code):

1. Suggest architecture based on selected patterns
2. Show proposed folder structure and key libraries
3. Ask user: Use this/Different approach/Describe own
4. Generate architecture blueprint in `@.devflow/architecture.md`

---

## Domain Documentation

For each selected cross-cutting concern, create template in `.devflow/domains/`:
- `security/authentication.md`
- `security/authorization.md`
- `infrastructure/multi-tenancy.md`
- `infrastructure/caching.md`
- etc.

Update `@.devflow/domains/_index.md` with one-line summaries.

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

## CLAUDE.md Integration

Automatically integrate DevFlow instructions with project's CLAUDE.md file.

### Check for existing CLAUDE.md

- CLAUDE.md exists: !`test -f CLAUDE.md && echo "yes" || echo "no"`

### Integration Logic

**If CLAUDE.md EXISTS:**

1. Read existing CLAUDE.md content
2. Check if DevFlow section already present (search for any of these markers):
   - `# DevFlow` (heading)
   - `## DevFlow Integration` (heading)
   - `This project uses **DevFlow**` (content text)

3. **If DevFlow section NOT present:**
   - Append delimiter: `\n---\n\n`
   - Append full content from `@.devflow/CLAUDE.md.template`
   - Replace `{{LAST_UPDATED}}` with current date (YYYY-MM-DD format)
   - Write back to CLAUDE.md
   - Track result: "✓ DevFlow instructions added to CLAUDE.md"

4. **If DevFlow section ALREADY present:**
   - Find section boundaries:
     - Start: First line containing "DevFlow" in a heading (# or ##)
     - End: Next `---` separator OR next top-level `#` heading OR end of file
   - Replace entire DevFlow section with latest content from template
   - Replace `{{LAST_UPDATED}}` with current date
   - Write back to CLAUDE.md
   - Track result: "✓ DevFlow instructions updated in CLAUDE.md"

**If CLAUDE.md DOES NOT EXIST:**

1. Read full content from `@.devflow/CLAUDE.md.template`
2. Replace `{{LAST_UPDATED}}` with current date (YYYY-MM-DD format)
3. Write to `CLAUDE.md` in project root
4. Track result: "✓ Created CLAUDE.md with DevFlow instructions"

### Implementation Notes

- Use current date: `$(date +%Y-%m-%d)`
- Detection is case-insensitive for "DevFlow"
- When appending, use clean delimiter:
  ```
  ---

  ## DevFlow Integration

  This project uses **DevFlow**...
  ```
- When updating, preserve all content before and after DevFlow section
- DevFlow section always starts with heading and ends at next major delimiter

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

Next: Run /spec [feature-name] to create your first feature
Example: /spec user-authentication
```
