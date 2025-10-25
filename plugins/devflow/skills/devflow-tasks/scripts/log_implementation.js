#!/usr/bin/env node
/**
 * DevFlow Implementation Logger
 *
 * Logs implementation progress to implementation.md.
 *
 * Usage:
 *   node log_implementation.js <task-number> "<message>" [feature-name]
 *
 * Examples:
 *   node log_implementation.js 3.2 "Implemented OAuth integration"
 *   node log_implementation.js 2 "Created User model with validation" user-auth
 */

const path = require('path');
const fs = require('fs');

const projectRoot = process.cwd();
const stateIOPath = path.join(projectRoot, '.devflow/lib/state-io.js');

if (!fs.existsSync(stateIOPath)) {
    console.error('ERROR: DevFlow not initialized');
    process.exit(1);
}

const { readState } = require(stateIOPath);

/**
 * Resolve feature key
 */
function resolveFeatureKey(state, featureName) {
    if (!featureName) {
        if (!state.active_feature) {
            throw new Error('No active feature');
        }
        return state.active_feature;
    }

    if (state.features[featureName]) {
        return featureName;
    }

    const keys = Object.keys(state.features);
    const match = keys.find(k => k.includes(featureName));
    if (!match) {
        throw new Error(`Feature not found: ${featureName}`);
    }

    return match;
}

/**
 * Get task description from tasks.md
 */
function getTaskDescription(tasksPath, taskNumber) {
    if (!fs.existsSync(tasksPath)) {
        return null;
    }

    const content = fs.readFileSync(tasksPath, 'utf8');
    const lines = content.split('\n');

    const pattern = new RegExp(`^\\s*- \\[[ x]\\] ${taskNumber}\\.?\\s+(.+?)(?:\\s+\\([^)]+\\))?(?:\\s+\\[depends:[^\\]]+\\])?$`);

    for (const line of lines) {
        const match = line.match(pattern);
        if (match) {
            return match[1].trim();
        }
    }

    return null;
}

/**
 * Ensure implementation.md exists
 */
function ensureImplementationLog(implPath, featureDisplayName) {
    if (fs.existsSync(implPath)) {
        return;
    }

    // Create initial implementation log
    const initialContent = `# Implementation Log - ${featureDisplayName}

This log tracks progress during feature implementation.

---

`;

    fs.writeFileSync(implPath, initialContent, 'utf8');
}

/**
 * Append log entry
 */
function appendLogEntry(implPath, taskNumber, taskDescription, message) {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const date = new Date().toISOString().split('T')[0];

    // Check if there's already a section for today
    const content = fs.existsSync(implPath) ? fs.readFileSync(implPath, 'utf8') : '';
    const hasDateSection = content.includes(`## ${date}`);

    let entry = '';

    // Add date section if needed
    if (!hasDateSection) {
        entry += `## ${date} - EXECUTE Phase\n\n`;
    }

    // Add task entry
    entry += `### Task ${taskNumber}`;
    if (taskDescription) {
        entry += `: ${taskDescription}`;
    }
    entry += '\n';
    entry += `**Logged:** ${timestamp}\n\n`;
    entry += `${message}\n\n`;
    entry += '---\n\n';

    // Append to file
    fs.appendFileSync(implPath, entry, 'utf8');

    return entry;
}

/**
 * Main execution
 */
function main() {
    const args = process.argv.slice(2);

    if (args.length < 2) {
        console.error('Usage: node log_implementation.js <task-number> "<message>" [feature-name]');
        console.error('');
        console.error('Examples:');
        console.error('  node log_implementation.js 3.2 "Implemented OAuth integration"');
        console.error('  node log_implementation.js 2 "Created User model" user-auth');
        process.exit(1);
    }

    const taskNumber = args[0];
    const message = args[1];
    const featureName = args[2];

    try {
        const state = readState();
        const featureKey = resolveFeatureKey(state, featureName);
        const feature = state.features[featureKey];

        const featurePath = path.join(projectRoot, `.devflow/features/${featureKey}`);
        const implPath = path.join(featurePath, 'implementation.md');
        const tasksPath = path.join(featurePath, 'tasks.md');

        console.log(`Logging implementation for task ${taskNumber}...\n`);

        // Ensure implementation log exists
        ensureImplementationLog(implPath, feature.display_name);

        // Get task description
        const taskDescription = getTaskDescription(tasksPath, taskNumber);

        // Append entry
        const entry = appendLogEntry(implPath, taskNumber, taskDescription, message);

        console.log('✓ Entry added to implementation.md\n');
        console.log('Entry preview:');
        console.log('────────────────────────────────────');
        const preview = entry.split('\n').slice(0, 4).join('\n');
        console.log(preview);
        console.log('────────────────────────────────────\n');
        console.log(`Location: ${implPath}`);

    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { appendLogEntry, getTaskDescription, ensureImplementationLog };
