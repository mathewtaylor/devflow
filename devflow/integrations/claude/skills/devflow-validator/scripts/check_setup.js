#!/usr/bin/env node
/**
 * DevFlow Setup Validation Script
 *
 * Validates DevFlow project setup and state integrity.
 *
 * Usage:
 *   node check_setup.js                  # Full validation
 *   node check_setup.js --schema-only    # Schema validation only
 *   node check_setup.js --quick          # Quick diagnostic
 */

const path = require('path');
const fs = require('fs');

const projectRoot = process.cwd();

/**
 * Validation checks
 */
const checks = {
    devflowInitialized: () => {
        const devflowPath = path.join(projectRoot, '.devflow');
        return {
            passed: fs.existsSync(devflowPath) && fs.statSync(devflowPath).isDirectory(),
            message: 'DevFlow initialized',
            fix: 'Run /devflow:init to initialize DevFlow'
        };
    },

    constitutionExists: () => {
        const constitutionPath = path.join(projectRoot, '.devflow/constitution.md');
        return {
            passed: fs.existsSync(constitutionPath),
            message: 'Constitution exists (.devflow/constitution.md)',
            fix: 'Run /devflow:init to create constitution.md'
        };
    },

    architectureExists: () => {
        const archPath = path.join(projectRoot, '.devflow/architecture.md');
        return {
            passed: fs.existsSync(archPath),
            message: 'Architecture exists (.devflow/architecture.md)',
            fix: 'Run /devflow:init to create architecture.md'
        };
    },

    stateFileExists: () => {
        const statePath = path.join(projectRoot, '.devflow/state.json');
        return {
            passed: fs.existsSync(statePath),
            message: 'State file exists (.devflow/state.json)',
            fix: 'Run /devflow:init to create state.json'
        };
    },

    stateSchemaValid: () => {
        const stateIOPath = path.join(projectRoot, '.devflow/lib/state-io.js');

        if (!fs.existsSync(stateIOPath)) {
            return {
                passed: false,
                message: 'State utilities missing',
                fix: 'Install DevFlow utilities (state-io.js)'
            };
        }

        try {
            const { readState, validateSchema } = require(stateIOPath);
            const state = readState();
            const validation = validateSchema(state);

            if (!validation.valid) {
                return {
                    passed: false,
                    message: 'State schema invalid',
                    details: validation.errors,
                    fix: 'Fix state.json validation errors or restore from backup'
                };
            }

            return {
                passed: true,
                message: 'State schema valid',
                details: []
            };
        } catch (error) {
            return {
                passed: false,
                message: 'State validation error',
                details: [error.message],
                fix: 'Check state.json format'
            };
        }
    },

    utilitiesPresent: () => {
        const stateIOPath = path.join(projectRoot, '.devflow/lib/state-io.js');
        const cliPath = path.join(projectRoot, '.devflow/lib/cli.js');

        const stateIOExists = fs.existsSync(stateIOPath);
        const cliExists = fs.existsSync(cliPath);

        return {
            passed: stateIOExists && cliExists,
            message: 'Utilities present (state-io.js, cli.js)',
            details: [
                stateIOExists ? '✓ state-io.js' : '✗ state-io.js missing',
                cliExists ? '✓ cli.js' : '✗ cli.js missing'
            ],
            fix: 'Install DevFlow utilities'
        };
    },

    singleActiveFeature: () => {
        const stateIOPath = path.join(projectRoot, '.devflow/lib/state-io.js');

        if (!fs.existsSync(stateIOPath)) {
            return { passed: true, message: 'Single active feature (skipped - no state utilities)' };
        }

        try {
            const { readState } = require(stateIOPath);
            const state = readState();

            const activeFeatures = Object.entries(state.features)
                .filter(([_, feature]) => feature.status === 'active');

            if (activeFeatures.length > 1) {
                return {
                    passed: false,
                    message: 'Multiple active features detected',
                    details: activeFeatures.map(([key, _]) => `  - ${key}`),
                    fix: 'Set only one feature to status="active"'
                };
            }

            return {
                passed: true,
                message: 'Single active feature rule validated',
                details: []
            };
        } catch (error) {
            return {
                passed: false,
                message: 'Active feature check failed',
                details: [error.message]
            };
        }
    }
};

/**
 * Run validations
 */
function runValidation(checkNames = null) {
    console.log('DevFlow Setup Validation\n');

    const checksToRun = checkNames || Object.keys(checks);
    const results = [];

    for (const checkName of checksToRun) {
        if (!checks[checkName]) continue;

        const result = checks[checkName]();
        results.push({ name: checkName, ...result });

        const icon = result.passed ? '✓' : '✗';
        console.log(`${icon} ${result.message}`);

        if (result.details && result.details.length > 0) {
            result.details.forEach(detail => console.log(`  ${detail}`));
        }

        if (!result.passed && result.fix) {
            console.log(`  Fix: ${result.fix}`);
        }

        console.log('');
    }

    const passed = results.filter(r => r.passed).length;
    const total = results.length;
    const allPassed = passed === total;

    const icon = allPassed ? '✓' : '✗';
    console.log(`${icon} Setup validation ${allPassed ? 'passed' : 'failed'} (${passed}/${total} checks)\n`);

    if (!allPassed) {
        console.log('Recommended actions:');
        const fixes = results.filter(r => !r.passed && r.fix).map(r => r.fix);
        const uniqueFixes = [...new Set(fixes)];
        uniqueFixes.forEach((fix, idx) => console.log(`${idx + 1}. ${fix}`));
    }

    return allPassed;
}

/**
 * Quick diagnostic
 */
function quickDiagnostic() {
    console.log('DevFlow Quick Diagnostic\n');

    const devflowExists = fs.existsSync(path.join(projectRoot, '.devflow'));
    console.log(`DevFlow directory: ${devflowExists ? '✓ Present' : '✗ Missing'}`);

    if (!devflowExists) {
        console.log('\nDevFlow is not initialized. Run /devflow:init');
        return false;
    }

    const stateExists = fs.existsSync(path.join(projectRoot, '.devflow/state.json'));
    console.log(`State file: ${stateExists ? '✓ Present' : '✗ Missing'}`);

    const constitutionExists = fs.existsSync(path.join(projectRoot, '.devflow/constitution.md'));
    console.log(`Constitution: ${constitutionExists ? '✓ Present' : '✗ Missing'}`);

    const archExists = fs.existsSync(path.join(projectRoot, '.devflow/architecture.md'));
    console.log(`Architecture: ${archExists ? '✓ Present' : '✗ Missing'}`);

    if (stateExists) {
        try {
            const { readState } = require(path.join(projectRoot, '.devflow/lib/state-io.js'));
            const state = readState();
            console.log(`\nActive feature: ${state.active_feature || 'none'}`);
            console.log(`Total features: ${Object.keys(state.features).length}`);
        } catch (error) {
            console.log(`\nState read error: ${error.message}`);
        }
    }

    return devflowExists && stateExists && constitutionExists && archExists;
}

/**
 * Main execution
 */
function main() {
    const args = process.argv.slice(2);

    if (args.includes('--quick')) {
        const passed = quickDiagnostic();
        process.exit(passed ? 0 : 1);
    }

    if (args.includes('--schema-only')) {
        const result = checks.stateSchemaValid();
        const icon = result.passed ? '✓' : '✗';
        console.log(`${icon} ${result.message}`);
        if (result.details) {
            result.details.forEach(detail => console.log(`  ${detail}`));
        }
        process.exit(result.passed ? 0 : 1);
    }

    // Full validation
    const passed = runValidation();
    process.exit(passed ? 0 : 1);
}

if (require.main === module) {
    main();
}

module.exports = { checks, runValidation };
