---
name: devflow-state
description: Reads DevFlow state including active features, workflow phases, task progress, and feature metadata. Use when needing DevFlow project context or checking workflow status.
---

# DevFlow State Reader

## Overview

This skill provides access to DevFlow's state management system, enabling reading of active features, workflow phases, task progress, and feature metadata. Use this skill to understand the current state of DevFlow-managed features without manual state.json inspection.

## When to Use

Use this skill when:
- User asks about active features or project status
- Determining what feature is currently being worked on
- Checking workflow phase (SPEC, PLAN, TASKS, EXECUTE, DONE)
- Validating task progress or completion
- Gathering context before executing workflow commands
- User asks "what are we working on?" or similar questions

## State Schema

DevFlow maintains state in `.devflow/state.json`:

```json
{
  "initialized": boolean,
  "initialized_at": "ISO timestamp",
  "active_feature": "yyyymmdd-feature-name" | null,
  "features": {
    "yyyymmdd-feature-name": {
      "display_name": "Human Friendly Name",
      "status": "pending" | "active" | "paused" | "completed",
      "phase": "SPEC" | "PLAN" | "TASKS" | "EXECUTE" | "DONE",
      "current_task": 0 | "X.Y",
      "concerns": ["security", "performance"],
      "created_at": "ISO timestamp",
      "snapshot": "snapshot.md" | null
    }
  }
}
```

## How to Use This Skill

### Query Active Feature

To get the currently active feature:

```bash
node .claude/skills/devflow-state/scripts/query_state.js active_feature
```

Returns the feature key (e.g., "20251025-user-authentication") or "none".

### Get Feature Details

To get complete information about a specific feature:

```bash
node .claude/skills/devflow-state/scripts/get_feature.js [feature-name]
```

If no feature name provided, returns details for the active feature.
Returns JSON with all feature properties.

### Available Queries

The `query_state.js` script supports:

- `active_feature` - Get active feature key
- `active_feature_name` - Get display name of active feature
- `active_phase` - Get current workflow phase
- `active_status` - Get status (pending/active/paused/completed)
- `active_progress` - Get task progress
- `feature_count` - Total number of features
- `pending_count` - Features in pending status
- `active_count` - Features in active status
- `paused_count` - Features in paused status
- `completed_count` - Features in completed status
- `all_features` - List all feature keys

## Prerequisites

This skill requires DevFlow to be initialized in the project (`.devflow/state.json` must exist).

If DevFlow is not initialized, the scripts will return an error message directing the user to run `/devflow:init`.

## Examples

**Example 1: Check what's being worked on**
```bash
$ node .claude/skills/devflow-state/scripts/query_state.js active_feature
20251025-user-authentication
```

**Example 2: Get full feature details**
```bash
$ node .claude/skills/devflow-state/scripts/get_feature.js
{
  "key": "20251025-user-authentication",
  "display_name": "User Authentication System",
  "status": "active",
  "phase": "EXECUTE",
  "current_task": "3.2",
  "concerns": ["security", "authentication"],
  "created_at": "2025-10-25T10:30:00Z",
  "snapshot": null
}
```

**Example 3: Check progress across all features**
```bash
$ node .claude/skills/devflow-state/scripts/query_state.js feature_count
5
$ node .claude/skills/devflow-state/scripts/query_state.js completed_count
3
```
