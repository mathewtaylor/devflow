#!/usr/bin/env node
/**
 * DevFlow Task Completion Script
 *
 * Marks a task as complete in tasks.md and updates state.json.
 *
 * Usage:
 *   node mark_complete.js <task-number> [feature-name]
 *   node mark_complete.js 3                    # Mark task 3 in active feature
 *   node mark_complete.js 3.2                  # Mark subtask 3.2
 *   node mark_complete.js 2 user-auth          # Mark task 2 in specific feature
 */

const path = require('path');
const fs = require('fs');

const projectRoot = process.cwd();
const stateIOPath = path.join(projectRoot, '.devflow/lib/state-io.js');

if (!fs.existsSync(stateIOPath)) {
    console.error('ERROR: DevFlow not initialized');
    process.exit(1);
}

const { readState, writeState, validateSchema } = require(stateIOPath);

/**
 * Resolve feature key
 */
function resolveFeatureKey(state, featureName) {
    if (!featureName) {
        if (!state.active_feature) {
            throw new Error('No active feature and no feature name provided');
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
 * Mark task complete in tasks.md
 */
function markTaskInFile(tasksPath, taskNumber) {
    if (!fs.existsSync(tasksPath)) {
        throw new Error('tasks.md not found');
    }

    const content = fs.readFileSync(tasksPath, 'utf8');
    const lines = content.split('\n');

    // Find the task line
    const taskPattern = new RegExp(`^(\\s*)- \\[ \\] ${taskNumber}\\.?\\s+(.+)$`);
    let found = false;
    let taskDescription = '';

    const updatedLines = lines.map(line => {
        const match = line.match(taskPattern);
        if (match) {
            found = true;
            taskDescription = match[2];
            return line.replace('- [ ]', '- [x]');
        }
        return line;
    });

    if (!found) {
        // Check if already complete
        const completedPattern = new RegExp(`^(\\s*)- \\[x\\] ${taskNumber}\\.?\\s+(.+)$`);
        const alreadyComplete = lines.some(line => completedPattern.test(line));

        if (alreadyComplete) {
            throw new Error(`Task ${taskNumber} is already complete`);
        } else {
            throw new Error(`Task ${taskNumber} not found in tasks.md`);
        }
    }

    // Write updated content
    fs.writeFileSync(tasksPath, updatedLines.join('\n'), 'utf8');

    return taskDescription;
}

/**
 * Count total and completed tasks
 */
function countTasks(tasksPath) {
    const content = fs.readFileSync(tasksPath, 'utf8');
    const lines = content.split('\n');

    const taskLines = lines.filter(line => /^- \[[ x]\]/.test(line.trim()));
    const completedLines = lines.filter(line => /^- \[x\]/.test(line.trim()));

    return {
        total: taskLines.length,
        completed: completedLines.length
    };
}

/**
 * Update state.json current_task
 */
function updateState(featureKey, taskNumber) {
    const state = readState();

    // Update current_task
    state.features[featureKey].current_task = taskNumber.toString();

    // Validate
    const validation = validateSchema(state);
    if (!validation.valid) {
        throw new Error(`State validation failed: ${validation.errors.join(', ')}`);
    }

    // Write
    writeState(state);
}

/**
 * Main execution
 */
function main() {
    const args = process.argv.slice(2);

    if (args.length < 1) {
        console.error('Usage: node mark_complete.js <task-number> [feature-name]');
        console.error('');
        console.error('Examples:');
        console.error('  node mark_complete.js 3');
        console.error('  node mark_complete.js 3.2');
        console.error('  node mark_complete.js 2 user-auth');
        process.exit(1);
    }

    const taskNumber = args[0];
    const featureName = args[1];

    try {
        const state = readState();
        const featureKey = resolveFeatureKey(state, featureName);

        console.log(`Marking task ${taskNumber} complete for feature: ${featureKey}\n`);

        const featurePath = path.join(projectRoot, `.devflow/features/${featureKey}`);
        const tasksPath = path.join(featurePath, 'tasks.md');

        // Mark in file
        const taskDescription = markTaskInFile(tasksPath, taskNumber);
        console.log(`Task: ${taskDescription}`);
        console.log('Status: Updating tasks.md...\n');

        // Update state
        updateState(featureKey, taskNumber);

        // Count progress
        const counts = countTasks(tasksPath);
        const percentage = Math.round((counts.completed / counts.total) * 100);

        console.log('✓ tasks.md updated (checkbox marked)');
        console.log('✓ state.json updated (current_task: ' + taskNumber + ')');
        console.log('');
        console.log(`Completion: ${counts.completed}/${counts.total} tasks (${percentage}%)`);

        // Check if all complete
        if (counts.completed === counts.total) {
            console.log('');
            console.log('🎉 All tasks complete!');
            console.log('   Run /devflow:execute to finalize and move to DONE phase');
        }

    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { markTaskInFile, updateState, countTasks };
