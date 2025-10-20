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

## Output

```
✅ DevFlow initialized successfully!

Files created:
- .devflow/constitution.md
- .devflow/architecture.md
- .devflow/state.json
- .devflow/domains/_index.md
{{domain docs created}}

Next: Run /spec [feature-name] to create your first feature
Example: /spec user-authentication
```
