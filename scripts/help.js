#!/usr/bin/env node

/**
 * Help Command - Display available npm scripts and their descriptions
 */

const { readFileSync } = require('fs');
const { join } = require('path');

// Read package.json
const packageJson = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8'));

const scriptDescriptions = {
  // Linting and Formatting
  'lint': 'Run ESLint on all JavaScript files',
  'lint:fix': 'Run ESLint and automatically fix issues',
  'format': 'Format code with Prettier',
  'format:check': 'Check if code is formatted correctly',

  // Testing
  'test': 'Run linting and data smoke tests',
  'test:data': 'Run data integrity smoke tests',
  'test:labs': 'Run all lab tests',
  'test:lab01': 'Test Lab 01 - Introduction',
  'test:lab02': 'Test Lab 02 - Data Modeling',
  'test:lab03': 'Test Lab 03 - Advanced Queries',
  'test:lab04': 'Test Lab 04 - Aggregation',
  'test:lab05': 'Test Lab 05 - Replication',
  'test:coverage': 'Run tests with code coverage',

  // Setup and Verification
  'verify:setup': 'Verify MongoDB environment setup',
  'standardize:groups': 'Standardize group folder naming',
  'standardize:groups:dry': 'Preview group folder renaming (dry run)',

  // Grading (for instructors)
  'grade:all': 'Grade all group submissions',
  'grade:group': 'Grade specific group submission',
  'grade:report': 'Generate grading report',
  'monitor:progress': 'Monitor student progress',

  // Help
  'help': 'Show this help message'
};

console.log(`
╔════════════════════════════════════════════════════════════════╗
║            MongoDB NoSQL Labs - Available Commands            ║
╚════════════════════════════════════════════════════════════════╝

Usage: npm run <command>

SETUP & VERIFICATION
────────────────────`);

['verify:setup', 'standardize:groups', 'standardize:groups:dry'].forEach(script => {
  if (packageJson.scripts[script]) {
    console.log(`  npm run ${script.padEnd(25)} # ${scriptDescriptions[script] || 'No description'}`);
  }
});

console.log(`
TESTING
───────`);

Object.keys(packageJson.scripts)
  .filter(s => s.startsWith('test'))
  .forEach(script => {
    console.log(`  npm run ${script.padEnd(25)} # ${scriptDescriptions[script] || 'No description'}`);
  });

console.log(`
CODE QUALITY
────────────`);

['lint', 'lint:fix', 'format', 'format:check'].forEach(script => {
  if (packageJson.scripts[script]) {
    console.log(`  npm run ${script.padEnd(25)} # ${scriptDescriptions[script] || 'No description'}`);
  }
});

console.log(`
GRADING & MONITORING (Instructors)
──────────────────────────────────`);

['grade:all', 'grade:group', 'grade:report', 'monitor:progress'].forEach(script => {
  if (packageJson.scripts[script]) {
    console.log(`  npm run ${script.padEnd(25)} # ${scriptDescriptions[script] || 'No description'}`);
  }
});

console.log(`
QUICK START
───────────
  1. npm install              # Install dependencies
  2. npm run verify:setup     # Check environment
  3. npm test                 # Run basic tests
  4. npm run test:labs        # Run all lab tests

DOCUMENTATION
─────────────
  Main Docs:     docs/INDEX.md
  Setup Guide:   docs/SETUP_GUIDE.md
  FAQ:           docs/FAQ.md
  Instructor:    docs/INSTRUCTOR_GUIDE.md

NEED HELP?
──────────
  GitHub Issues: https://github.com/your-repo/issues
  Documentation: docs/FAQ.md
`);

process.exit(0);