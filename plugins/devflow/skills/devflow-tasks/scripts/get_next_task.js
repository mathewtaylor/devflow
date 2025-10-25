#!/usr/bin/env node
/**
 * DevFlow Next Task Finder
 *
 * Finds the next task to work on, considering dependencies.
 *
 * Usage:
 *   node get_next_task.js [feature-name]      # Get next task
 *   node get_next_task.js --status            # Show status
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
 * Parse tasks from tasks.md
 */
function parseTasks(tasksPath) {
    if (!fs.existsSync(tasksPath)) {
        throw new Error('tasks.md not found');
    }

    const content = fs.readFileSync(tasksPath, 'utf8');
    const lines = content.split('\n');
    const tasks = [];

    for (const line of lines) {
        // Match task format: - [ ] or - [x] followed by number
        const match = line.match(/^(\s*)- \[([ x])\] (\d+(?:\.\d+)?)\.\s+(.+?)(?:\s+\(([^)]+)\))?(?:\s+\[depends:\s*([^\]]+)\])?$/);

        if (match) {
            const [, indent, checkbox, number, description, complexity, depends] = match;
            const isComplete = checkbox === 'x';
            const dependencies = depends ? depends.split(',').map(d => d.trim()) : [];

            tasks.push({
                number: number,
                description: description.trim(),
                complexity: complexity || 'medium',
                isComplete,
                dependencies,
                indent: indent.length
            });
        }
    }

    return tasks;
}

/**
 * Check if task dependencies are met
 */
function checkDependencies(task, allTasks) {
    if (task.dependencies.length === 0) {
        return { met: true, missing: [] };
    }

    const missing = [];

    for (const depNumber of task.dependencies) {
        const depTask = allTasks.find(t => t.number === depNumber);

        if (!depTask) {
            missing.push({ number: depNumber, reason: 'not found' });
        } else if (!depTask.isComplete) {
            missing.push({ number: depNumber, reason: 'not complete', description: depTask.description });
        }
    }

    return {
        met: missing.length === 0,
        missing
    };
}

/**
 * Find next task
 */
function findNextTask(tasks, currentTask) {
    // Find first incomplete task with met dependencies
    for (const task of tasks) {
        if (task.isComplete) continue;

        const depCheck = checkDependencies(task, tasks);
        if (depCheck.met) {
            return {
                task,
                dependenciesMet: true
            };
        }
    }

    // If no tasks with met dependencies, return first incomplete with details
    const firstIncomplete = tasks.find(t => !t.isComplete);
    if (firstIncomplete) {
        const depCheck = checkDependencies(firstIncomplete, tasks);
        return {
            task: firstIncomplete,
            dependenciesMet: false,
            missingDependencies: depCheck.missing
        };
    }

    return null;
}

/**
 * Display task status
 */
function displayStatus(featureKey, tasks) {
    const completed = tasks.filter(t => t.isComplete);
    const remaining = tasks.filter(t => !t.isComplete);
    const percentage = Math.round((completed.length / tasks.length) * 100);

    console.log(`Task Status for: ${featureKey}\n`);
    console.log(`Progress: ${completed.length}/${tasks.length} tasks (${percentage}% complete)\n`);

    if (completed.length > 0) {
        console.log(`Completed: ${completed.length}`);
        completed.slice(0, 5).forEach(t => {
            console.log(`  ✓ ${t.number} ${t.description}`);
        });
        if (completed.length > 5) {
            console.log(`  ... and ${completed.length - 5} more`);
        }
        console.log('');
    }

    if (remaining.length > 0) {
        console.log(`Remaining: ${remaining.length}`);
        remaining.slice(0, 5).forEach(t => {
            const depCheck = checkDependencies(t, tasks);
            const status = depCheck.met ? '' : ' (blocked)';
            console.log(`  - ${t.number} ${t.description}${status}`);
        });
        if (remaining.length > 5) {
            console.log(`  ... and ${remaining.length - 5} more`);
        }
        console.log('');
    }

    // Check for blocked tasks
    const blocked = remaining.filter(t => {
        const depCheck = checkDependencies(t, tasks);
        return !depCheck.met;
    });

    if (blocked.length > 0) {
        console.log(`Blocked: ${blocked.length}`);
        blocked.forEach(t => {
            const depCheck = checkDependencies(t, tasks);
            console.log(`  ✗ ${t.number} ${t.description}`);
            depCheck.missing.forEach(dep => {
                console.log(`    Depends on: ${dep.number} (${dep.reason})`);
            });
        });
    } else {
        console.log('Blocked: 0');
        console.log('  (No tasks blocked by dependencies)');
    }
}

/**
 * Display next task
 */
function displayNextTask(result) {
    const { task, dependenciesMet, missingDependencies } = result;

    console.log('Next task:');
    console.log('─────────────────────────────────────');
    console.log(`Task ${task.number}: ${task.description}`);
    console.log(`Complexity: ${task.complexity}`);

    if (task.dependencies.length > 0) {
        const depStatus = dependenciesMet ? 'all complete ✓' : 'NOT complete ✗';
        console.log(`Dependencies: ${task.dependencies.join(', ')} (${depStatus})`);
    } else {
        console.log('Dependencies: none');
    }

    console.log(`Status: ${dependenciesMet ? 'Ready to start' : 'Blocked'}`);

    if (!dependenciesMet && missingDependencies) {
        console.log('');
        console.log(`Task ${task.number} depends on:`);
        missingDependencies.forEach(dep => {
            console.log(`  ✗ Task ${dep.number}: ${dep.description || '(not found)'}`);
        });
        console.log('');
        console.log('Complete dependencies first.');
    }
}

/**
 * Main execution
 */
function main() {
    const args = process.argv.slice(2);

    try {
        const state = readState();
        const showStatus = args.includes('--status');
        const featureName = args.find(arg => !arg.startsWith('--'));

        const featureKey = resolveFeatureKey(state, featureName);
        const featurePath = path.join(projectRoot, `.devflow/features/${featureKey}`);
        const tasksPath = path.join(featurePath, 'tasks.md');

        const tasks = parseTasks(tasksPath);

        if (showStatus) {
            displayStatus(featureKey, tasks);
            return;
        }

        // Find next task
        const currentTask = state.features[featureKey].current_task;
        console.log(`Finding next task for feature: ${featureKey}\n`);

        const completed = tasks.filter(t => t.isComplete).length;
        console.log(`Current progress: ${completed}/${tasks.length} tasks complete\n`);

        const nextTaskResult = findNextTask(tasks, currentTask);

        if (!nextTaskResult) {
            console.log('🎉 All tasks complete!');
            console.log('');
            console.log('Next steps:');
            console.log('  1. Verify all implementation is tested');
            console.log('  2. Update architecture.md if needed');
            console.log('  3. Generate retrospective');
            console.log('  4. Move to DONE phase');
            return;
        }

        displayNextTask(nextTaskResult);

    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { parseTasks, findNextTask, checkDependencies };
