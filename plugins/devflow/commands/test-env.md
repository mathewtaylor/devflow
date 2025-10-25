---
description: Test environment variables for debugging
allowed-tools: [Bash]
model: haiku
---

# Environment Variable Diagnostic Test

This command displays environment variables to help debug plugin path issues.

## Environment Information

**CLAUDE_PLUGIN_ROOT value:**
!`echo "CLAUDE_PLUGIN_ROOT=[${CLAUDE_PLUGIN_ROOT}]"`

**Is it set?**
!`test -n "${CLAUDE_PLUGIN_ROOT}" && echo "YES - Variable is set" || echo "NO - Variable is empty or unset"`

**Current working directory:**
!`pwd`

**Shell information:**
!`echo "SHELL=${SHELL}"`
!`echo "PATH=${PATH}" | head -c 200`

**Node version and location:**
!`node --version`
!`which node`

**Test path construction:**
!`echo "Constructed path: [${CLAUDE_PLUGIN_ROOT}/scripts/cli.js]"`

**Does cli.js exist at constructed path?**
!`test -f "${CLAUDE_PLUGIN_ROOT}/scripts/cli.js" && echo "YES - File exists" || echo "NO - File not found"`

**List contents of CLAUDE_PLUGIN_ROOT (if set):**
!`test -n "${CLAUDE_PLUGIN_ROOT}" && ls -la "${CLAUDE_PLUGIN_ROOT}" | head -20 || echo "Cannot list - variable empty"`

**All environment variables containing 'CLAUDE':**
!`env | grep -i claude || echo "No CLAUDE variables found"`

---

**Analysis:** Review the output above to determine:
1. Is `CLAUDE_PLUGIN_ROOT` actually being set by Claude Code?
2. What is its actual value?
3. Does the path resolve correctly?
4. Are there any other Claude-related environment variables?
