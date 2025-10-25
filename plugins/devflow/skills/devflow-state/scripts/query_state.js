#!/usr/bin/env node
/**
 * DevFlow State Query Script
 *
 * Queries DevFlow state.json for specific information.
 * Imports utilities from the user's project .devflow/lib/ directory.
 *
 * Usage:
 *   node query_state.js <query_type>
 *
 * Examples:
 *   node query_state.js active_feature
 *   node query_state.js feature_count
 *   node query_state.js active_phase
 */

const path = require('path');
const fs = require('fs');

// Import from user's project .devflow/lib/
const projectRoot = process.cwd();
const stateIOPath = path.join(projectRoot, '.devflow/lib/state-io.js');

// Check if DevFlow is initialized
if (!fs.existsSync(stateIOPath)) {
    console.error('ERROR: DevFlow not initialized in this project.');
    console.error('');
    console.error('To initialize DevFlow, run: /devflow:init');
    console.error('');
    console.error('Expected file: .devflow/lib/state-io.js');
    process.exit(1);
}

// Import state utilities
const { readState } = require(stateIOPath);

/**
 * Query handlers
 */
const queries = {
    // Active feature queries
    active_feature: (state) => {
        return state.active_feature || 'none';
    },

    active_feature_name: (state) => {
        if (!state.active_feature) return 'N/A';
        return state.features[state.active_feature]?.display_name || 'Unknown';
    },

    active_phase: (state) => {
        if (!state.active_feature) return 'N/A';
        return state.features[state.active_feature]?.phase || 'Unknown';
    },

    active_status: (state) => {
        if (!state.active_feature) return 'N/A';
        return state.features[state.active_feature]?.status || 'Unknown';
    },

    active_progress: (state) => {
        if (!state.active_feature) return 'N/A';
        const feature = state.features[state.active_feature];
        return feature?.current_task?.toString() || '0';
    },

    // Feature count queries
    feature_count: (state) => {
        return Object.keys(state.features).length.toString();
    },

    pending_count: (state) => {
        return Object.values(state.features).filter(f => f.status === 'pending').length.toString();
    },

    active_count: (state) => {
        return Object.values(state.features).filter(f => f.status === 'active').length.toString();
    },

    paused_count: (state) => {
        return Object.values(state.features).filter(f => f.status === 'paused').length.toString();
    },

    completed_count: (state) => {
        return Object.values(state.features).filter(f => f.status === 'completed').length.toString();
    },

    // All features
    all_features: (state) => {
        return Object.keys(state.features).join('\n') || 'None';
    }
};

/**
 * Main execution
 */
function main() {
    const queryType = process.argv[2];

    if (!queryType) {
        console.error('Usage: node query_state.js <query_type>');
        console.error('');
        console.error('Available queries:');
        Object.keys(queries).forEach(q => console.error(`  - ${q}`));
        process.exit(1);
    }

    if (!queries[queryType]) {
        console.error(`Unknown query type: ${queryType}`);
        console.error('');
        console.error('Available queries:');
        Object.keys(queries).forEach(q => console.error(`  - ${q}`));
        process.exit(1);
    }

    try {
        const state = readState();
        const result = queries[queryType](state);
        console.log(result);
    } catch (error) {
        console.error(`Error reading state: ${error.message}`);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { queries };
