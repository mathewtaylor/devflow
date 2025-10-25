#!/usr/bin/env node
/**
 * DevFlow Feature Details Script
 *
 * Gets detailed information about a specific feature.
 * Imports utilities from the user's project .devflow/lib/ directory.
 *
 * Usage:
 *   node get_feature.js [feature-name]
 *
 * Examples:
 *   node get_feature.js                           # Get active feature
 *   node get_feature.js user-auth                 # Get feature matching "user-auth"
 *   node get_feature.js 20251025-user-auth        # Get specific feature
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
 * Resolve feature key from partial name or return active feature
 */
function resolveFeatureKey(state, featureName) {
    // If no feature name provided, use active feature
    if (!featureName || featureName === '') {
        if (!state.active_feature) {
            throw new Error('No active feature and no feature name provided');
        }
        return state.active_feature;
    }

    // Find feature by exact match
    if (state.features[featureName]) {
        return featureName;
    }

    // Find feature by partial match
    const keys = Object.keys(state.features);
    const match = keys.find(k => k.includes(featureName));

    if (!match) {
        throw new Error(`No feature found matching: ${featureName}`);
    }

    return match;
}

/**
 * Main execution
 */
function main() {
    const featureName = process.argv[2];

    try {
        const state = readState();
        const featureKey = resolveFeatureKey(state, featureName);
        const feature = state.features[featureKey];

        if (!feature) {
            console.error(`Feature not found: ${featureKey}`);
            process.exit(1);
        }

        // Output feature details as JSON
        const output = {
            key: featureKey,
            ...feature
        };

        console.log(JSON.stringify(output, null, 2));
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { resolveFeatureKey };
