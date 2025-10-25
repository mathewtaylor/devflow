#!/usr/bin/env node
/**
 * DevFlow Phase Transition Validator
 *
 * Validates whether a workflow phase transition is allowed.
 *
 * Usage:
 *   node check_transition.js <from-phase> <to-phase> [feature-name]
 *
 * Examples:
 *   node check_transition.js SPEC PLAN                  # Validate active feature
 *   node check_transition.js TASKS EXECUTE user-auth    # Validate specific feature
 */

const path = require('path');
const fs = require('fs');

const projectRoot = process.cwd();
const stateIOPath = path.join(projectRoot, '.devflow/scripts/state-io.js');

// Check if DevFlow is initialized
if (!fs.existsSync(stateIOPath)) {
    console.error('ERROR: DevFlow not initialized in this project.');
    console.error('To initialize DevFlow, run: /devflow:init');
    process.exit(1);
}

const { readState } = require(stateIOPath);

/**
 * Valid phases
 */
const VALID_PHASES = ['SPEC', 'PLAN', 'TASKS', 'EXECUTE', 'DONE'];

/**
 * Phase transition rules
 * Maps from-phase → to-phase → requirements
 */
const TRANSITION_RULES = {
    'SPEC': {
        'PLAN': {
            requiredFiles: ['spec.md'],
            description: 'Spec must exist before planning'
        },
        'TASKS': {
            requiredFiles: ['spec.md'],
            warning: 'Skipping PLAN phase - consider generating technical plan first'
        },
        'EXECUTE': {
            requiredFiles: ['spec.md', 'tasks.md'],
            warning: 'Skipping PLAN and TASKS phases - tasks.md must exist'
        }
    },
    'PLAN': {
        'TASKS': {
            requiredFiles: ['spec.md', 'plan.md'],
            description: 'Plan must exist before generating tasks'
        },
        'EXECUTE': {
            requiredFiles: ['spec.md', 'plan.md', 'tasks.md'],
            warning: 'Skipping TASKS phase - tasks.md must exist'
        },
        'SPEC': {
            warning: 'Moving backward to SPEC - ensure changes are intentional'
        }
    },
    'TASKS': {
        'EXECUTE': {
            requiredFiles: ['spec.md', 'tasks.md'],
            description: 'Tasks must exist before execution'
        },
        'PLAN': {
            warning: 'Moving backward to PLAN - task definitions may need regeneration'
        },
        'SPEC': {
            warning: 'Moving backward to SPEC - major rework indicated'
        }
    },
    'EXECUTE': {
        'DONE': {
            requiredFiles: ['spec.md', 'tasks.md', 'implementation.md'],
            description: 'Execution complete, moving to done',
            validateTasks: true
        },
        'TASKS': {
            warning: 'Moving backward to TASKS - execution restart required'
        }
    },
    'DONE': {
        'SPEC': {
            warning: 'Reopening completed feature - moving back to SPEC'
        },
        'EXECUTE': {
            warning: 'Reopening completed feature - moving back to EXECUTE'
        }
    }
};

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
        throw new Error(`No feature found matching: ${featureName}`);
    }

    return match;
}

/**
 * Check if required files exist
 */
function checkRequiredFiles(featureKey, requiredFiles) {
    const results = [];

    for (const file of requiredFiles) {
        const filePath = path.join(projectRoot, `.devflow/features/${featureKey}/${file}`);
        const exists = fs.existsSync(filePath);

        results.push({
            file,
            exists,
            path: filePath
        });
    }

    return results;
}

/**
 * Validate task completion (for EXECUTE → DONE)
 */
function validateTaskCompletion(featureKey) {
    const tasksPath = path.join(projectRoot, `.devflow/features/${featureKey}/tasks.md`);

    if (!fs.existsSync(tasksPath)) {
        return {
            valid: false,
            message: 'tasks.md not found'
        };
    }

    try {
        const content = fs.readFileSync(tasksPath, 'utf8');

        // Count tasks
        const taskLines = content.split('\n').filter(line => /^- \[[ x]\]/.test(line.trim()));
        const completedTasks = content.split('\n').filter(line => /^- \[x\]/.test(line.trim()));

        const total = taskLines.length;
        const completed = completedTasks.length;

        if (total === 0) {
            return {
                valid: false,
                message: 'No tasks found in tasks.md',
                total: 0,
                completed: 0
            };
        }

        if (completed < total) {
            return {
                valid: false,
                message: `Not all tasks complete (${completed}/${total})`,
                total,
                completed
            };
        }

        return {
            valid: true,
            message: `All tasks complete (${total}/${total})`,
            total,
            completed
        };
    } catch (error) {
        return {
            valid: false,
            message: `Error reading tasks.md: ${error.message}`
        };
    }
}

/**
 * Validate transition
 */
function validateTransition(fromPhase, toPhase, featureName) {
    console.log(`Validating transition: ${fromPhase} → ${toPhase}\n`);

    // Validate phase names
    if (!VALID_PHASES.includes(fromPhase)) {
        console.error(`Invalid from-phase: ${fromPhase}`);
        console.error(`Valid phases: ${VALID_PHASES.join(', ')}`);
        return false;
    }

    if (!VALID_PHASES.includes(toPhase)) {
        console.error(`Invalid to-phase: ${toPhase}`);
        console.error(`Valid phases: ${VALID_PHASES.join(', ')}`);
        return false;
    }

    // Get state and feature
    const state = readState();
    const featureKey = resolveFeatureKey(state, featureName);
    const feature = state.features[featureKey];

    console.log(`Feature: ${featureKey}`);
    console.log(`Display name: ${feature.display_name}`);
    console.log(`Current phase: ${feature.phase}`);
    console.log(`Status: ${feature.status}\n`);

    // Check if current phase matches from-phase
    if (feature.phase !== fromPhase) {
        console.log(`⚠️  Warning: Current phase is ${feature.phase}, not ${fromPhase}`);
        console.log('   Transition validation based on actual current phase\n');
    }

    // Get transition rules
    const rules = TRANSITION_RULES[fromPhase]?.[toPhase];

    if (!rules) {
        console.log(`ℹ️  No specific rules for ${fromPhase} → ${toPhase}`);
        console.log('   Transition is allowed but uncommon\n');
        return true;
    }

    // Check warnings
    if (rules.warning) {
        console.log(`⚠️  Warning: ${rules.warning}\n`);
    }

    // Check description
    if (rules.description) {
        console.log(`Description: ${rules.description}\n`);
    }

    // Check required files
    if (rules.requiredFiles) {
        console.log('Prerequisites:');
        const fileResults = checkRequiredFiles(featureKey, rules.requiredFiles);

        let allFilesExist = true;
        for (const result of fileResults) {
            const icon = result.exists ? '✓' : '✗';
            console.log(`${icon} ${result.file} ${result.exists ? 'exists' : 'missing'}`);
            if (!result.exists) {
                console.log(`  Expected: .devflow/features/${featureKey}/${result.file}`);
                allFilesExist = false;
            }
        }

        if (!allFilesExist) {
            console.log(`\n✗ Transition ${fromPhase} → ${toPhase} blocked\n`);
            console.log('Required files are missing. Create them before proceeding.');
            return false;
        }
    }

    // Validate tasks if required
    if (rules.validateTasks) {
        console.log('\nTask completion:');
        const taskValidation = validateTaskCompletion(featureKey);

        const icon = taskValidation.valid ? '✓' : '✗';
        console.log(`${icon} ${taskValidation.message}`);

        if (!taskValidation.valid) {
            console.log(`\n✗ Transition ${fromPhase} → ${toPhase} blocked\n`);
            console.log('Complete all tasks before marking feature as DONE.');
            return false;
        }
    }

    // All checks passed
    console.log(`\n✓ Transition ${fromPhase} → ${toPhase} is valid\n`);

    // Next steps
    console.log('Next steps:');
    if (toPhase === 'PLAN') {
        console.log('1. Run /devflow:plan to generate technical plan');
        console.log('2. plan.md will be created in feature folder');
    } else if (toPhase === 'TASKS') {
        console.log('1. Run /devflow:tasks to break plan into executable tasks');
        console.log('2. tasks.md will be created in feature folder');
    } else if (toPhase === 'EXECUTE') {
        console.log('1. Run /devflow:execute to start implementation');
        console.log('2. Tasks will be executed with quality gates');
    } else if (toPhase === 'DONE') {
        console.log('1. Feature will be marked complete');
        console.log('2. Retrospective will be generated');
        console.log('3. Active feature will be cleared');
    }

    return true;
}

/**
 * Main execution
 */
function main() {
    const args = process.argv.slice(2);

    if (args.length < 2) {
        console.error('Usage: node check_transition.js <from-phase> <to-phase> [feature-name]');
        console.error('');
        console.error('Valid phases: SPEC, PLAN, TASKS, EXECUTE, DONE');
        console.error('');
        console.error('Examples:');
        console.error('  node check_transition.js SPEC PLAN');
        console.error('  node check_transition.js TASKS EXECUTE user-auth');
        process.exit(1);
    }

    const fromPhase = args[0].toUpperCase();
    const toPhase = args[1].toUpperCase();
    const featureName = args[2];

    try {
        const valid = validateTransition(fromPhase, toPhase, featureName);
        process.exit(valid ? 0 : 1);
    } catch (error) {
        console.error(`\nError: ${error.message}`);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { validateTransition, checkRequiredFiles, validateTaskCompletion };
