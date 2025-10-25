---
name: devflow-docs
description: Manages DevFlow living documentation by updating architecture.md after code changes, creating retrospectives, and maintaining implementation logs. Use during and after feature work.
---

# DevFlow Documentation Manager

## Overview

This skill maintains DevFlow's "living documentation" philosophy by ensuring that architecture documentation, implementation logs, and retrospectives stay synchronized with actual code changes. It prevents documentation drift by automating updates after significant work.

## When to Use

Use this skill when:
- After implementing significant code changes during `/execute`
- Feature is complete and needs retrospective
- Architecture has changed and needs documentation update
- Creating implementation log entries
- Generating lessons learned documentation
- Detecting drift between code and documentation

## Living Documentation Philosophy

**The Problem:** Documentation becomes stale and inaccurate over time as code evolves.

**The Solution:** Automated documentation updates triggered by actual code changes.

**Benefits:**
- Architecture docs reflect current reality
- Retrospectives capture lessons while fresh
- Implementation logs provide audit trail
- Future developers have accurate context

## Documentation Types

### Architecture Documentation
**File:** `.devflow/architecture.md`

**Updated when:**
- New components or services added
- Data models changed
- API contracts modified
- Technology stack updated
- Architectural patterns changed

**Content:**
- System structure and components
- Data models and relationships
- API design and contracts
- Technology stack
- Architectural decisions
- Cross-cutting concerns

### Implementation Logs
**File:** `.devflow/features/{feature}/implementation.md`

**Updated when:**
- Task completed
- Significant code change made
- Issue encountered and resolved
- Decision made during implementation

**Content:**
- Chronological log of what was done
- Files modified
- Issues encountered
- Solutions applied
- Decisions made with rationale

### Retrospectives
**File:** `.devflow/features/{feature}/retrospective.md`

**Created when:**
- Feature reaches DONE phase
- Feature is paused for extended period
- Major milestone reached

**Content:**
- What went well
- What could be improved
- Lessons learned
- Time estimates vs actuals
- Challenges encountered
- Recommendations for future

## How to Use This Skill

### Update Architecture Documentation

To update architecture.md after code changes:

```bash
node .claude/skills/devflow-docs/scripts/update_architecture.js [feature-name]
```

Analyzes recent changes and updates architecture.md with:
- New components
- Modified data models
- Updated API contracts
- Technology changes

### Generate Retrospective

To create retrospective for completed feature:

```bash
node .claude/skills/devflow-docs/scripts/generate_retro.js [feature-name]
```

Generates retrospective.md based on:
- implementation.md log
- tasks.md completion
- Time spent
- Challenges documented

### Append to Implementation Log

To add entry to implementation log:

```bash
node .claude/skills/devflow-docs/scripts/log_implementation.js [feature-name] "Log message"
```

Example:
```bash
node log_implementation.js user-auth "Completed OAuth integration with Google. Modified AuthController and added GoogleOAuthService."
```

### Check Documentation Drift

To detect if documentation is out of sync:

```bash
node .claude/skills/devflow-docs/scripts/update_architecture.js --check-only
```

## Documentation Standards

See `references/documentation_standards.md` for:
- Architecture.md structure and sections
- Implementation log format
- Retrospective template
- Writing style guidelines
- What to include/exclude

## Prerequisites

Requires:
- DevFlow initialized
- Active feature (for feature-specific docs)
- Implementation log started (for retrospective generation)

## Examples

**Example 1: Update architecture after adding new component**
```bash
$ node update_architecture.js user-auth
Analyzing changes for feature: 20251025-user-authentication

Changes detected:
✓ New service: GoogleOAuthService
✓ Modified controller: AuthController
✓ New data model: OAuthToken
✓ New API endpoint: POST /auth/oauth/google

Updating architecture.md...

Sections updated:
- Components > Authentication Services (added GoogleOAuthService)
- Data Models (added OAuthToken schema)
- API Contracts (added OAuth endpoints)

✓ Architecture documentation updated
```

**Example 2: Generate retrospective**
```bash
$ node generate_retro.js user-auth
Generating retrospective for: 20251025-user-authentication

Feature details:
- Started: Oct 25, 2025
- Completed: Oct 27, 2025
- Duration: 2 days
- Tasks: 15 (all complete)
- Files modified: 23

Analyzing implementation log...

Generated retrospective at:
.devflow/features/20251025-user-authentication/retrospective.md

Sections:
✓ Summary
✓ What Went Well (3 items)
✓ Challenges (2 items)
✓ Lessons Learned (4 items)
✓ Metrics
✓ Recommendations
```

**Example 3: Add implementation log entry**
```bash
$ node log_implementation.js user-auth "Implemented password hashing with bcrypt. Updated User model validation."
✓ Log entry added to implementation.md

Entry:
[2025-10-26 14:30] Task 3.2: Password Security
Implemented password hashing with bcrypt. Updated User model validation.
Files: User.cs, AuthService.cs
```

**Example 4: Check for drift**
```bash
$ node update_architecture.js --check-only
Checking architecture.md for drift...

Potential drift detected:
⚠️  PaymentService mentioned in code but not in architecture.md
⚠️  EmailQueue component in architecture.md but no longer exists in code
⚠️  API endpoint /users/profile modified but docs show old contract

Recommendation: Run update_architecture.js to sync documentation
```

## Integration with Workflow

This skill integrates with DevFlow commands:

### During /execute
- After each task: Log implementation entry
- After major change: Prompt to update architecture
- On completion: Generate retrospective

### Autonomous Triggers
Claude automatically uses this skill when:
- Detecting significant architectural changes
- User completes feature
- Documentation questions arise
- Architecture and code seem inconsistent

## Best Practices

### For Architecture Updates
1. Update after each significant architectural change, not just at end
2. Keep language clear and concise
3. Include diagrams when helpful (ASCII or mermaid)
4. Document "why" not just "what"
5. Remove outdated information immediately

### For Implementation Logs
1. Log as you work, not after the fact
2. Include files modified
3. Note decisions and rationale
4. Document workarounds and their reasons
5. Keep entries concise but informative

### For Retrospectives
1. Write while experience is fresh
2. Be honest about challenges
3. Include both technical and process insights
4. Quantify where possible (time, LOC, files changed)
5. Make recommendations actionable

## Output Formats

All documentation uses Markdown with consistent formatting:

- **Headers**: `##` for main sections, `###` for subsections
- **Lists**: `-` for unordered, `1.` for ordered
- **Code**: Triple backticks with language identifier
- **Emphasis**: `**bold**` for key points, `*italic*` for terms
- **Links**: `[text](path)` for internal references
- **Dates**: ISO format (YYYY-MM-DD) or readable (Oct 25, 2025)
