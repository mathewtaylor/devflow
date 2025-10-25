#!/usr/bin/env node
/**
 * DevFlow Architecture Documentation Updater
 *
 * Updates architecture.md based on code changes.
 *
 * Usage:
 *   node update_architecture.js [feature-name]     # Update for feature
 *   node update_architecture.js --check-only        # Check for drift
 */

const path = require('path');
const fs = require('fs');

const projectRoot = process.cwd();
const archPath = path.join(projectRoot, '.devflow/architecture.md');

/**
 * Check if architecture.md exists
 */
function checkArchitectureExists() {
    if (!fs.existsSync(archPath)) {
        console.error('ERROR: architecture.md not found at .devflow/architecture.md');
        console.error('');
        console.error('To create architecture.md, run: /devflow:init');
        process.exit(1);
    }
}

/**
 * Get feature implementation details
 */
function getFeatureDetails(featureName) {
    const stateIOPath = path.join(projectRoot, '.devflow/lib/state-io.js');

    if (!fs.existsSync(stateIOPath)) {
        throw new Error('DevFlow not initialized');
    }

    const { readState } = require(stateIOPath);
    const state = readState();

    let featureKey = featureName;

    if (!featureName) {
        if (!state.active_feature) {
            throw new Error('No active feature and no feature name provided');
        }
        featureKey = state.active_feature;
    } else {
        // Try to find feature
        if (!state.features[featureName]) {
            const keys = Object.keys(state.features);
            const match = keys.find(k => k.includes(featureName));
            if (!match) {
                throw new Error(`Feature not found: ${featureName}`);
            }
            featureKey = match;
        }
    }

    const feature = state.features[featureKey];
    const featurePath = path.join(projectRoot, `.devflow/features/${featureKey}`);

    return {
        key: featureKey,
        displayName: feature.display_name,
        phase: feature.phase,
        status: feature.status,
        concerns: feature.concerns,
        path: featurePath
    };
}

/**
 * Read implementation log for changes
 */
function parseImplementationLog(featureDetails) {
    const implPath = path.join(featureDetails.path, 'implementation.md');

    if (!fs.existsSync(implPath)) {
        console.log('No implementation log found - feature may not have been executed yet');
        return {
            filesModified: [],
            componentsAdded: [],
            decisionsMade: []
        };
    }

    const content = fs.readFileSync(implPath, 'utf8');

    // Simple parsing - look for file mentions and decision markers
    const filesModified = [];
    const lines = content.split('\n');

    for (const line of lines) {
        // Look for file paths (simplified pattern)
        const fileMatch = line.match(/([a-zA-Z0-9_/-]+\.(cs|js|ts|py|java|go|rb|php))/);
        if (fileMatch) {
            filesModified.push(fileMatch[1]);
        }
    }

    return {
        filesModified: [...new Set(filesModified)], // Unique files
        summary: `${filesModified.length} files modified during implementation`
    };
}

/**
 * Generate update suggestions
 */
function generateUpdateSuggestions(featureDetails, logData) {
    console.log(`\nAnalyzing changes for feature: ${featureDetails.key}`);
    console.log(`Display name: ${featureDetails.displayName}`);
    console.log(`Phase: ${featureDetails.phase}`);
    console.log(`\n${logData.summary}\n`);

    if (logData.filesModified.length > 0) {
        console.log('Files modified:');
        logData.filesModified.slice(0, 10).forEach(file => {
            console.log(`  - ${file}`);
        });

        if (logData.filesModified.length > 10) {
            console.log(`  ... and ${logData.filesModified.length - 10} more`);
        }
        console.log('');
    }

    if (featureDetails.concerns.length > 0) {
        console.log('Tagged concerns (may need architecture updates):');
        featureDetails.concerns.forEach(concern => {
            console.log(`  - ${concern}`);
        });
        console.log('');
    }

    console.log('Suggested architecture.md sections to review:');
    console.log('  - System Components (for new services/classes)');
    console.log('  - Data Models (if database changes)');
    console.log('  - API Design (if endpoints modified)');
    console.log('  - Cross-Cutting Concerns (based on tagged concerns)');
    console.log('');

    console.log('⚠️  Manual review required:');
    console.log('   This script provides suggestions only.');
    console.log('   Review the feature implementation and update architecture.md manually.');
    console.log('');
    console.log(`   Architecture file: ${archPath}`);
    console.log(`   Feature spec: ${path.join(featureDetails.path, 'spec.md')}`);
    console.log(`   Feature plan: ${path.join(featureDetails.path, 'plan.md')}`);
}

/**
 * Check for documentation drift
 */
function checkDrift() {
    console.log('Checking architecture.md for potential drift...\n');

    const content = fs.readFileSync(archPath, 'utf8');
    const warnings = [];

    // Simple heuristics for drift detection
    const lastModified = fs.statSync(archPath).mtime;
    const daysSinceModified = (Date.now() - lastModified) / (1000 * 60 * 60 * 24);

    if (daysSinceModified > 30) {
        warnings.push(`⚠️  Architecture.md last modified ${Math.floor(daysSinceModified)} days ago`);
    }

    // Check if it's mostly template content
    if (content.includes('TODO') || content.includes('[Description]') || content.includes('[Add ')) {
        warnings.push('⚠️  Architecture.md contains template placeholders');
    }

    // Check if it's very short (likely incomplete)
    if (content.length < 1000) {
        warnings.push('⚠️  Architecture.md is very short - may be incomplete');
    }

    if (warnings.length > 0) {
        console.log('Potential issues detected:\n');
        warnings.forEach(w => console.log(w));
        console.log('\nRecommendation: Review and update architecture.md');
    } else {
        console.log('✓ No obvious drift detected');
        console.log('  (This is a basic check - manual review still recommended)');
    }
}

/**
 * Main execution
 */
function main() {
    const args = process.argv.slice(2);

    checkArchitectureExists();

    if (args.includes('--check-only')) {
        checkDrift();
        return;
    }

    const featureName = args[0];

    try {
        const featureDetails = getFeatureDetails(featureName);
        const logData = parseImplementationLog(featureDetails);
        generateUpdateSuggestions(featureDetails, logData);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { checkArchitectureExists, parseImplementationLog, checkDrift };
