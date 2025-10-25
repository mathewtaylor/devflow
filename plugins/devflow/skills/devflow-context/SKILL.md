---
name: devflow-context
description: Loads DevFlow domain documentation based on feature tags and keyword detection. Use when working on features to load relevant cross-cutting concern documentation.
---

# DevFlow Context Loader

## Overview

This skill implements DevFlow's smart 3-tier context loading system, automatically loading relevant domain documentation based on feature tags and keyword detection. It helps maintain optimal token usage by loading only relevant cross-cutting concern documentation when needed.

## When to Use

Use this skill when:
- Starting work on a feature that has tagged concerns
- User mentions keywords related to cross-cutting concerns (auth, payment, database, etc.)
- Implementing code that requires domain-specific guidelines
- Need to load specific domain documentation
- Want to check what domain docs are available
- Managing token budget and need selective context loading

## Three-Tier Context Loading System

DevFlow uses a progressive disclosure pattern:

**Tier 1: Always Loaded** (~3K tokens)
- `.devflow/constitution.md` - Project principles
- `.devflow/architecture.md` - System overview
- `.devflow/domains/_index.md` - Quick reference

**Tier 2: Feature-Specific** (~5-7K tokens)
- Current feature: `spec.md`, `plan.md`, `tasks.md`
- Relevant source files

**Tier 3: On-Demand** (~1-3K tokens each)
- Domain docs loaded when:
  - Feature explicitly tags concerns
  - Keywords detected in conversation
  - Patterns recognized requiring specific guidance

## Pattern Matching

The skill uses keyword patterns to automatically load relevant documentation:

**Authentication & Security:**
- Keywords: `authentication`, `auth`, `login`, `password`, `jwt`, `oauth`, `session`
- Loads: `domains/security/authentication.md`

**Payments & Billing:**
- Keywords: `payment`, `stripe`, `billing`, `invoice`, `subscription`, `checkout`
- Loads: `domains/integrations/payment-processing.md`

**Database & Data:**
- Keywords: `database`, `schema`, `migration`, `query`, `sql`, `orm`
- Loads: `domains/data/database-design.md`

**API & Integration:**
- Keywords: `api`, `endpoint`, `rest`, `graphql`, `webhook`
- Loads: `domains/architecture/api-design.md`

**Testing & Quality:**
- Keywords: `test`, `testing`, `coverage`, `mock`, `assertion`
- Loads: `domains/quality/testing-standards.md`

See `references/pattern_mapping.md` for the complete pattern library.

## How to Use This Skill

### Load Docs for Active Feature

To load domain docs based on the active feature's tags:

```bash
node .claude/skills/devflow-context/scripts/load_docs.js
```

Returns paths to relevant domain documentation files.

### Load Docs by Keyword

To load docs matching specific keywords:

```bash
node .claude/skills/devflow-context/scripts/load_docs.js --keywords "authentication database"
```

### List Available Domains

To see all available domain documentation:

```bash
node .claude/skills/devflow-context/scripts/load_docs.js --list
```

### Check Token Budget

To estimate token usage:

```bash
node .claude/skills/devflow-context/scripts/load_docs.js --estimate
```

## Prerequisites

This skill requires:
- DevFlow initialized (`.devflow/state.json` exists)
- Domain documentation structure (`domains/` directory)
- Active feature with tagged concerns (optional, for auto-loading)

## Examples

**Example 1: Auto-load for active feature**
```bash
$ node .claude/skills/devflow-context/scripts/load_docs.js
Loading context for feature: 20251025-user-authentication
Tagged concerns: security, authentication

Relevant documentation:
- .devflow/domains/security/authentication.md
- .devflow/domains/security/authorization.md

Estimated tokens: 2,500
```

**Example 2: Keyword-based loading**
```bash
$ node .claude/skills/devflow-context/scripts/load_docs.js --keywords "payment stripe"
Matching patterns: payment

Relevant documentation:
- .devflow/domains/integrations/payment-processing.md
- .devflow/domains/integrations/stripe-setup.md

Estimated tokens: 1,800
```

**Example 3: List all available domains**
```bash
$ node .claude/skills/devflow-context/scripts/load_docs.js --list
Available domain documentation:

security/
  - authentication.md
  - authorization.md
  - data-protection.md

integrations/
  - payment-processing.md
  - third-party-apis.md

data/
  - database-design.md
  - schema-management.md

Total: 7 documents
```

## Token Budget Management

The skill helps manage context window usage:
- Each domain doc: ~1,000-1,500 tokens
- Quick reference (_index.md): ~500 tokens
- Maximum recommended: 5 domain docs per session (~7.5K tokens)

When approaching limits, the skill prioritizes docs based on:
1. Explicit feature tags (highest priority)
2. Keyword matches in conversation
3. Dependency relationships between concerns
