# DevFlow Branch Strategy

This repository maintains two primary branches with different architectures and use cases.

## Branches

### `stable-manual-install` (RECOMMENDED)

**Status:** ✅ Production Ready
**Version:** 1.9.x
**Installation:** Manual (bash/PowerShell scripts)

**Use this branch if you want:**
- Proven stability
- No plugin system dependencies
- No environment variable issues
- Traditional installation via scripts

**Installation:**
```bash
# Clone and checkout stable branch
git clone https://github.com/mathewtaylor/devflow.git
cd devflow
git checkout stable-manual-install

# Run installer (choose based on your system)
bash scripts/install-devflow.sh          # Linux/Mac/Git Bash
# OR
pwsh scripts/Install-DevFlow.ps1         # Windows PowerShell
```

**Structure:**
```
devflow/
├── integrations/claude/
│   ├── agents/          → Installed to .claude/agents/
│   └── commands/        → Installed to .claude/commands/devflow/
├── templates/           → Copied to .devflow/templates/
├── lib/                 → Copied to .devflow/lib/
└── instructions.md      → Copied to .devflow/instructions.md

scripts/
├── install-devflow.sh   → Bash installer
└── Install-DevFlow.ps1  → PowerShell installer
```

**What works:**
- All 10 commands (`/init`, `/spec`, `/plan`, `/tasks`, `/execute`, etc.)
- All 8 agents (architect, planner, reviewer, tester, etc.)
- State management via `.devflow/state.json`
- Living documentation (constitution, architecture, domain docs)
- Pause/resume functionality
- Phase review gates
- Quality gates (code review + testing)

---

### `main` (EXPERIMENTAL)

**Status:** ⚠️ Experimental - Known Issues
**Version:** 2.x
**Installation:** Plugin (`/plugin install devflow`)

**Current Issues:**
- `CLAUDE_PLUGIN_ROOT` environment variable not available at command load time
- Causes MODULE_NOT_FOUND errors in several commands
- Requires Claude Code plugin system fixes

**Use this branch if you want:**
- Auto-updates via `/plugin update`
- Plugin marketplace distribution
- Skills functionality (model-invoked capabilities)
- Modern plugin architecture

**When to use:**
- When Claude Code fixes `CLAUDE_PLUGIN_ROOT` availability
- For testing/contributing to plugin architecture
- If you want bleeding edge features (and accept bugs)

**Structure:**
```
plugins/devflow/
├── .claude-plugin/
│   └── plugin.json
├── commands/            → Loaded as /devflow:* commands
├── agents/              → Loaded automatically
├── skills/              → Auto-invoked by model
├── scripts/             → Utilities
└── templates/           → Templates
```

---

## Branch History

**Why two branches?**

DevFlow initially used manual installation (v1.x). In October 2025, we migrated to Claude Code's plugin architecture (v2.0.0).

**Timeline:**
```
2025-10-24: v1.8.x - Manual install working perfectly
            ↓
2025-10-25: v2.0.0 - Plugin architecture introduced
            ↓
2025-10-25: v2.1.0 - Multiple fixes for plugin issues
            ↓
2025-10-25: DECISION - Create stable-manual-install branch
```

**Root Issue:** Claude Code's plugin system doesn't expose `CLAUDE_PLUGIN_ROOT` during command load time (`!` immediate bash execution), only during runtime (hooks, agents). This fundamental limitation made the plugin approach problematic.

**Resolution:** Two-branch strategy
- `stable-manual-install`: Continue development on proven manual install
- `main`: Keep plugin architecture for when Claude Code matures

---

## For Contributors

**Where to contribute:**
- **Bug fixes/features:** `stable-manual-install` branch
- **Plugin research:** `main` branch
- **Documentation:** Both branches (context-dependent)

**Workflow:**
```bash
# Work on stable branch
git checkout stable-manual-install
git pull origin stable-manual-install
# ... make changes ...
git add .
git commit -m "feat: your change"
git push origin stable-manual-install
```

**Eventually:** When Claude Code fixes plugin system issues, we may:
1. Merge stable improvements into main
2. Resurrect plugin architecture with fixes
3. Converge on plugin as the standard

---

## Questions

**Q: Which branch should I use?**
A: Use `stable-manual-install` unless you specifically want to test plugin features.

**Q: Will manual install continue to be supported?**
A: Yes! It's the primary development branch until plugin issues are resolved.

**Q: What happens when plugins are fixed?**
A: We'll evaluate merging or migrating. No code will be lost.

**Q: Can I switch between branches?**
A: Yes, but they use different installation methods. Uninstall one before using the other.

---

**Last Updated:** 2025-10-25
