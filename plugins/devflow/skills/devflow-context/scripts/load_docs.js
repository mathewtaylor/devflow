#!/usr/bin/env node
/**
 * DevFlow Context Loader Script
 *
 * Loads relevant domain documentation based on feature tags and keywords.
 * Implements smart 3-tier context loading.
 *
 * Usage:
 *   node load_docs.js                          # Load for active feature
 *   node load_docs.js --keywords "auth payment"  # Load by keywords
 *   node load_docs.js --list                   # List available docs
 *   node load_docs.js --estimate               # Estimate token usage
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
    process.exit(1);
}

const { readState } = require(stateIOPath);

/**
 * Pattern mapping from keywords to domain docs
 * Based on references/pattern_mapping.md
 */
const PATTERNS = {
    authentication: {
        keywords: ['authentication', 'auth', 'login', 'logout', 'signup', 'signin', 'password', 'credentials', 'jwt', 'token', 'oauth', 'saml', 'sso'],
        path: 'domains/security/authentication.md',
        priority: 'high'
    },
    authorization: {
        keywords: ['authorization', 'permissions', 'roles', 'rbac', 'access control', 'acl', 'policy', 'scope'],
        path: 'domains/security/authorization.md',
        priority: 'high'
    },
    dataProtection: {
        keywords: ['encryption', 'hashing', 'secrets', 'sensitive data', 'pii', 'gdpr', 'compliance', 'data privacy'],
        path: 'domains/security/data-protection.md',
        priority: 'high'
    },
    payment: {
        keywords: ['payment', 'stripe', 'paypal', 'billing', 'invoice', 'subscription', 'checkout', 'credit card', 'transaction'],
        path: 'domains/integrations/payment-processing.md',
        priority: 'high'
    },
    thirdPartyAPIs: {
        keywords: ['api integration', 'webhook', 'third party', 'external api', 'rest client', 'graphql client'],
        path: 'domains/integrations/third-party-apis.md',
        priority: 'medium'
    },
    email: {
        keywords: ['email', 'sendgrid', 'mailgun', 'ses', 'smtp', 'notification email'],
        path: 'domains/integrations/email-services.md',
        priority: 'medium'
    },
    database: {
        keywords: ['database', 'schema', 'table', 'relation', 'foreign key', 'index', 'constraint', 'normalization'],
        path: 'domains/data/database-design.md',
        priority: 'high'
    },
    schemaMigration: {
        keywords: ['migration', 'schema change', 'alter table', 'database migration', 'version control'],
        path: 'domains/data/schema-management.md',
        priority: 'high'
    },
    orm: {
        keywords: ['orm', 'entity framework', 'prisma', 'sequelize', 'query builder', 'linq', 'active record'],
        path: 'domains/data/orm-patterns.md',
        priority: 'medium'
    },
    apiDesign: {
        keywords: ['api', 'endpoint', 'rest', 'graphql', 'route', 'controller', 'handler', 'request', 'response'],
        path: 'domains/architecture/api-design.md',
        priority: 'high'
    },
    testing: {
        keywords: ['test', 'testing', 'unit test', 'integration test', 'e2e', 'coverage', 'mock', 'stub', 'assertion'],
        path: 'domains/quality/testing-standards.md',
        priority: 'high'
    }
};

/**
 * Match keywords to patterns
 */
function matchPatterns(keywords) {
    const matches = [];
    const keywordsLower = keywords.map(k => k.toLowerCase());

    for (const [patternName, pattern] of Object.entries(PATTERNS)) {
        for (const keyword of keywordsLower) {
            if (pattern.keywords.some(pk => pk.includes(keyword) || keyword.includes(pk))) {
                matches.push({
                    name: patternName,
                    path: pattern.path,
                    priority: pattern.priority
                });
                break; // Only match once per pattern
            }
        }
    }

    // Sort by priority (high first)
    matches.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    return matches;
}

/**
 * Load docs for active feature
 */
function loadForActiveFeature() {
    try {
        const state = readState();

        if (!state.active_feature) {
            console.log('No active feature.');
            return [];
        }

        const feature = state.features[state.active_feature];
        console.log(`Loading context for feature: ${state.active_feature}`);
        console.log(`Tagged concerns: ${feature.concerns.join(', ') || 'none'}`);
        console.log('');

        return matchPatterns(feature.concerns);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        return [];
    }
}

/**
 * Load docs by keywords
 */
function loadByKeywords(keywordString) {
    const keywords = keywordString.split(/\s+/);
    console.log(`Matching patterns for keywords: ${keywords.join(', ')}`);
    console.log('');

    return matchPatterns(keywords);
}

/**
 * List all available domain docs
 */
function listAvailableDocs() {
    const domainsPath = path.join(projectRoot, '.devflow/domains');

    if (!fs.existsSync(domainsPath)) {
        console.log('No domain documentation found.');
        console.log('Create domain docs in .devflow/domains/ directory.');
        return;
    }

    console.log('Available domain documentation:\n');

    // Recursively find all .md files in domains/
    function findDocs(dir, prefix = '') {
        const items = fs.readdirSync(dir, { withFileTypes: true });

        for (const item of items) {
            if (item.isDirectory()) {
                console.log(`${prefix}${item.name}/`);
                findDocs(path.join(dir, item.name), prefix + '  ');
            } else if (item.name.endsWith('.md') && item.name !== '_index.md') {
                console.log(`${prefix}  - ${item.name}`);
            }
        }
    }

    findDocs(domainsPath);
}

/**
 * Estimate token usage for docs
 */
function estimateTokens(docs) {
    // Rough estimate: 1K-1.5K tokens per doc
    const avgTokensPerDoc = 1200;
    return docs.length * avgTokensPerDoc;
}

/**
 * Display matched docs
 */
function displayMatches(matches) {
    if (matches.length === 0) {
        console.log('No matching documentation found.');
        return;
    }

    console.log('Relevant documentation:');
    for (const match of matches) {
        const fullPath = path.join(projectRoot, '.devflow', match.path);
        const exists = fs.existsSync(fullPath);
        const marker = exists ? '✓' : '✗';
        console.log(`${marker} .devflow/${match.path} (${match.priority} priority)`);
    }

    const estimated = estimateTokens(matches);
    console.log('');
    console.log(`Estimated tokens: ~${estimated.toLocaleString()}`);

    if (matches.length > 5) {
        console.log('');
        console.log('⚠️  Warning: Loading >5 documents may impact context budget.');
        console.log('   Consider loading high-priority docs only.');
    }
}

/**
 * Main execution
 */
function main() {
    const args = process.argv.slice(2);

    // Parse arguments
    if (args.includes('--list')) {
        listAvailableDocs();
        return;
    }

    if (args.includes('--keywords')) {
        const keywordIndex = args.indexOf('--keywords');
        const keywords = args[keywordIndex + 1];
        if (!keywords) {
            console.error('Error: --keywords requires a value');
            process.exit(1);
        }
        const matches = loadByKeywords(keywords);
        displayMatches(matches);
        return;
    }

    if (args.includes('--estimate')) {
        const state = readState();
        if (state.active_feature) {
            const feature = state.features[state.active_feature];
            const matches = matchPatterns(feature.concerns);
            console.log(`Token estimate for active feature (${state.active_feature}):`);
            console.log(`  Matched ${matches.length} domain docs`);
            console.log(`  Estimated: ~${estimateTokens(matches).toLocaleString()} tokens`);
        } else {
            console.log('No active feature to estimate.');
        }
        return;
    }

    // Default: load for active feature
    const matches = loadForActiveFeature();
    displayMatches(matches);
}

if (require.main === module) {
    main();
}

module.exports = { matchPatterns, estimateTokens };
