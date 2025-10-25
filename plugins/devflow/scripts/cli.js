#!/usr/bin/env node

/**
 * DevFlow CLI Helper
 *
 * Centralized command-line interface for DevFlow state queries and operations.
 * Reduces permission prompts by standardizing all queries into a single command pattern.
 *
 * Usage:
 *   node .devflow/scripts/cli.js query <query-type> [args...]
 *
 * Examples:
 *   node .devflow/scripts/cli.js query active_feature
 *   node .devflow/scripts/cli.js query has_spec feature-name
 *   node .devflow/scripts/cli.js query feature_count
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// State Reading
// ============================================================================

function readState() {
    const statePath = path.resolve(process.cwd(), '.devflow/state.json');

    if (!fs.existsSync(statePath)) {
        return null;
    }

    try {
        const content = fs.readFileSync(statePath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        return null;
    }
}

function resolveFeatureKey(featureName) {
    const state = readState();
    if (!state) return null;

    // If no feature name provided, use active feature
    if (!featureName || featureName === '') {
        return state.active_feature;
    }

    // Find feature by partial match
    const keys = Object.keys(state.features);
    return keys.find(k => k.includes(featureName)) || null;
}

// ============================================================================
// Query Handlers
// ============================================================================

const queries = {
    // ========== Active Feature Queries ==========

    active_feature: () => {
        const state = readState();
        return state?.active_feature || 'none';
    },

    active_feature_name: () => {
        const state = readState();
        if (!state || !state.active_feature) return 'N/A';
        return state.features[state.active_feature]?.display_name || 'Unknown';
    },

    active_phase: () => {
        const state = readState();
        if (!state || !state.active_feature) return 'N/A';
        return state.features[state.active_feature]?.phase || 'Unknown';
    },

    active_progress: () => {
        const state = readState();
        if (!state || !state.active_feature) return 'N/A';
        const feature = state.features[state.active_feature];
        return `${feature?.current_task}/tasks`;
    },

    // ========== Feature Count Queries ==========

    feature_count: () => {
        const state = readState();
        return state ? Object.keys(state.features).length.toString() : '0';
    },

    pending_count: () => {
        const state = readState();
        if (!state) return '0';
        return Object.values(state.features).filter(f => f.status === 'pending').length.toString();
    },

    active_count: () => {
        const state = readState();
        if (!state) return '0';
        return Object.values(state.features).filter(f => f.status === 'active').length.toString();
    },

    paused_count: () => {
        const state = readState();
        if (!state) return '0';
        return Object.values(state.features).filter(f => f.status === 'paused').length.toString();
    },

    completed_count: () => {
        const state = readState();
        if (!state) return '0';
        return Object.values(state.features).filter(f => f.status === 'completed').length.toString();
    },

    // ========== Feature-Specific Queries ==========

    feature_exists: (featureName) => {
        const key = resolveFeatureKey(featureName);
        return key ? 'yes' : 'no';
    },

    has_spec: (featureName) => {
        const key = resolveFeatureKey(featureName);
        if (!key) return 'no';

        const specPath = path.resolve(process.cwd(), `.devflow/features/${key}/spec.md`);
        return fs.existsSync(specPath) ? 'yes' : 'no';
    },

    has_plan: (featureName) => {
        const key = resolveFeatureKey(featureName);
        if (!key) return 'no';

        const planPath = path.resolve(process.cwd(), `.devflow/features/${key}/plan.md`);
        return fs.existsSync(planPath) ? 'yes' : 'no';
    },

    has_tasks: (featureName) => {
        const key = resolveFeatureKey(featureName);
        if (!key) return 'no';

        const tasksPath = path.resolve(process.cwd(), `.devflow/features/${key}/tasks.md`);
        return fs.existsSync(tasksPath) ? 'yes' : 'no';
    },

    current_phase: (featureName) => {
        const key = resolveFeatureKey(featureName);
        if (!key) return 'unknown';

        const state = readState();
        return state?.features[key]?.phase || 'unknown';
    },

    // ========== Metadata Queries ==========

    latest_feature: () => {
        const state = readState();
        if (!state) return 'None';

        const keys = Object.keys(state.features).sort().reverse();
        return keys[0] || 'None';
    },

    last_initialized: () => {
        const state = readState();
        if (!state || !state.initialized_at) return 'Never';

        try {
            const date = new Date(state.initialized_at);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return 'Unknown';
        }
    },

    // ========== File System Queries ==========

    code_detected: () => {
        try {
            const glob = require('glob');
            const files = glob.sync('**/*.{js,ts,cs,py}', {
                ignore: ['**/node_modules/**', '**/.git/**'],
                cwd: process.cwd(),
                nodir: true
            });
            return files.length > 0 ? 'yes' : 'no';
        } catch {
            return 'no';
        }
    },

    package_files: () => {
        try {
            const glob = require('glob');
            const commonFiles = ['package.json', 'requirements.txt', 'pom.xml'];
            const found = commonFiles.filter(f => fs.existsSync(path.resolve(process.cwd(), f)));

            // Also check for .csproj files
            const csproj = glob.sync('*.csproj', { cwd: process.cwd() });

            const allFiles = found.concat(csproj);
            return allFiles.length > 0 ? allFiles.join(', ') : 'none';
        } catch {
            return 'none';
        }
    },

    markdown_count: (excludePattern) => {
        try {
            const glob = require('glob');
            const ignore = [
                '**/node_modules/**',
                '**/.git/**',
                '**/dist/**',
                '**/build/**',
                '**/.devflow/**',
                'CLAUDE.md'
            ];

            // Add additional excludes if provided
            if (excludePattern && excludePattern !== '') {
                const additionalExcludes = excludePattern.split(',').map(p => p.trim());
                ignore.push(...additionalExcludes);
            }

            const files = glob.sync('**/*.md', {
                ignore,
                cwd: process.cwd()
            });

            return files.length.toString();
        } catch {
            return '0';
        }
    },

    doc_count: () => {
        try {
            const glob = require('glob');
            const files = glob.sync('**/*.md', {
                ignore: [
                    '**/node_modules/**',
                    '**/.git/**',
                    '**/dist/**',
                    '**/build/**',
                    '**/.devflow/**',
                    'CLAUDE.md'
                ],
                cwd: process.cwd()
            });
            return files.length.toString();
        } catch {
            return '0';
        }
    }
};

// ============================================================================
// Command Handlers
// ============================================================================

function handleQuery(args) {
    const [queryType, ...queryArgs] = args;

    if (!queries[queryType]) {
        process.stderr.write(`Unknown query type: ${queryType}\n`);
        process.stderr.write(`Available queries: ${Object.keys(queries).join(', ')}\n`);
        process.exit(1);
    }

    try {
        const result = queries[queryType](...queryArgs);
        process.stdout.write(result);
    } catch (error) {
        process.stderr.write(`Query error: ${error.message}\n`);
        process.exit(1);
    }
}

// ============================================================================
// Main Entry Point
// ============================================================================

const commands = {
    query: handleQuery
};

function main() {
    const [,, command, ...args] = process.argv;

    if (!command || !commands[command]) {
        process.stderr.write('DevFlow CLI Helper\n\n');
        process.stderr.write('Usage: node .devflow/scripts/cli.js <command> [args...]\n\n');
        process.stderr.write('Commands:\n');
        process.stderr.write('  query <query-type> [args...]  - Query DevFlow state\n\n');
        process.stderr.write('Examples:\n');
        process.stderr.write('  node .devflow/scripts/cli.js query active_feature\n');
        process.stderr.write('  node .devflow/scripts/cli.js query has_spec feature-name\n');
        process.exit(1);
    }

    commands[command](args);
}

// Run main if called directly
if (require.main === module) {
    main();
}

module.exports = { queries, handleQuery };
