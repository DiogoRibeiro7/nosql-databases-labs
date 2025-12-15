#!/usr/bin/env node

/**
 * Setup Verification Script
 *
 * This script verifies that the MongoDB NoSQL Labs environment is properly configured.
 * It checks MongoDB connectivity, Node.js dependencies, and environment variables.
 *
 * Usage: npm run verify:setup
 *        node scripts/setup_verification.js
 */

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const colors = require('colors/safe');

// Configuration
const checks = {
  passed: [],
  warnings: [],
  failed: []
};

// Helper functions
const log = {
  success: (msg) => console.log(colors.green('✓'), msg),
  warning: (msg) => console.log(colors.yellow('⚠'), msg),
  error: (msg) => console.log(colors.red('✗'), msg),
  info: (msg) => console.log(colors.blue('ℹ'), msg),
  header: (msg) => console.log(colors.cyan('\n' + '='.repeat(60) + '\n' + msg + '\n' + '='.repeat(60)))
};

// Check Node.js version
async function checkNodeVersion() {
  log.header('Checking Node.js Version');

  try {
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));

    if (majorVersion >= 16) {
      log.success(`Node.js version ${nodeVersion} is supported`);
      checks.passed.push('Node.js version');
    } else {
      log.warning(`Node.js version ${nodeVersion} is older than recommended (v16+)`);
      checks.warnings.push('Node.js version (old but may work)');
    }
  } catch (error) {
    log.error('Failed to check Node.js version');
    checks.failed.push('Node.js version check');
  }
}

// Check npm dependencies
async function checkDependencies() {
  log.header('Checking NPM Dependencies');

  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const nodeModulesPath = path.join(process.cwd(), 'node_modules');

    if (!fs.existsSync(packageJsonPath)) {
      log.error('package.json not found');
      checks.failed.push('package.json missing');
      return;
    }

    if (!fs.existsSync(nodeModulesPath)) {
      log.warning('node_modules not found - run "npm install"');
      checks.warnings.push('Dependencies not installed');
      return;
    }

    // Check for critical dependencies
    const criticalDeps = ['mongodb', 'dotenv', 'colors'];
    const missingDeps = [];

    for (const dep of criticalDeps) {
      const depPath = path.join(nodeModulesPath, dep);
      if (!fs.existsSync(depPath)) {
        missingDeps.push(dep);
      }
    }

    if (missingDeps.length > 0) {
      log.warning(`Missing dependencies: ${missingDeps.join(', ')}`);
      log.info('Run "npm install" to install missing dependencies');
      checks.warnings.push('Some dependencies missing');
    } else {
      log.success('All critical dependencies installed');
      checks.passed.push('NPM dependencies');
    }
  } catch (error) {
    log.error(`Failed to check dependencies: ${error.message}`);
    checks.failed.push('Dependencies check');
  }
}

// Check MongoDB connectivity
async function checkMongoDB() {
  log.header('Checking MongoDB Connectivity');

  // Load environment variables if .env exists
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    require('dotenv').config();
    log.info('Loaded .env file');
  }

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const client = new MongoClient(uri);

  try {
    log.info(`Connecting to MongoDB at: ${uri}`);

    await client.connect();

    // Check server status
    const admin = client.db().admin();
    const serverStatus = await admin.serverStatus();

    log.success(`MongoDB ${serverStatus.version} is running`);
    log.info(`Host: ${serverStatus.host}`);

    // Check if it's a replica set
    try {
      const replStatus = await admin.command({ replSetGetStatus: 1 });
      log.success(`Replica set "${replStatus.set}" is configured with ${replStatus.members.length} members`);
      checks.passed.push('MongoDB replica set');
    } catch (err) {
      log.info('MongoDB is running in standalone mode (replica set not configured)');
      checks.passed.push('MongoDB standalone');
    }

    checks.passed.push('MongoDB connectivity');
  } catch (error) {
    log.error(`Failed to connect to MongoDB: ${error.message}`);
    log.info('Make sure MongoDB is running:');
    log.info('  - Docker: docker-compose up -d');
    log.info('  - Local: mongod --dbpath /path/to/data');
    checks.failed.push('MongoDB connectivity');
  } finally {
    await client.close();
  }
}

// Check environment configuration
async function checkEnvironment() {
  log.header('Checking Environment Configuration');

  const envPath = path.join(process.cwd(), '.env');
  const envTemplatePath = path.join(process.cwd(), '.env.template');

  if (fs.existsSync(envPath)) {
    log.success('.env file exists');
    checks.passed.push('Environment file');

    // Check for required variables
    require('dotenv').config();
    const requiredVars = ['MONGODB_URI', 'MONGODB_DB_NAME'];
    const missingVars = requiredVars.filter(v => !process.env[v]);

    if (missingVars.length > 0) {
      log.warning(`Missing environment variables: ${missingVars.join(', ')}`);
      checks.warnings.push('Some environment variables missing');
    } else {
      log.success('All required environment variables set');
    }
  } else if (fs.existsSync(envTemplatePath)) {
    log.warning('.env file not found, but .env.template exists');
    log.info('Copy .env.template to .env and update values:');
    log.info('  cp .env.template .env');
    checks.warnings.push('.env file missing');
  } else {
    log.warning('No .env or .env.template file found');
    log.info('Using default MongoDB connection (mongodb://localhost:27017)');
    checks.warnings.push('Environment configuration missing');
  }
}

// Check data files
async function checkDataFiles() {
  log.header('Checking Data Files');

  const dataPath = path.join(process.cwd(), 'data');

  if (!fs.existsSync(dataPath)) {
    log.error('Data directory not found');
    checks.failed.push('Data directory missing');
    return;
  }

  const expectedFiles = [
    'customers_data.json',
    'movies.json',
    'sales.json',
    'sakila_films.json'
  ];

  const missingFiles = [];
  let totalSize = 0;

  for (const file of expectedFiles) {
    const filePath = path.join(dataPath, file);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      totalSize += stats.size;
    } else {
      missingFiles.push(file);
    }
  }

  if (missingFiles.length > 0) {
    log.warning(`Missing data files: ${missingFiles.join(', ')}`);
    checks.warnings.push('Some data files missing');
  } else {
    log.success(`All expected data files present (${(totalSize / 1024 / 1024).toFixed(2)} MB total)`);
    checks.passed.push('Data files');
  }
}

// Check lab directories
async function checkLabStructure() {
  log.header('Checking Lab Structure');

  const labsPath = path.join(process.cwd(), 'labs');

  if (!fs.existsSync(labsPath)) {
    log.error('Labs directory not found');
    checks.failed.push('Labs directory missing');
    return;
  }

  const expectedLabs = [
    'lab01_intro',
    'lab02_modeling',
    'lab03_queries',
    'lab04_aggregation',
    'lab05_replication',
    'lab_modern_features'
  ];

  const missingLabs = [];

  for (const lab of expectedLabs) {
    const labPath = path.join(labsPath, lab);
    if (!fs.existsSync(labPath)) {
      missingLabs.push(lab);
    }
  }

  if (missingLabs.length > 0) {
    log.error(`Missing lab directories: ${missingLabs.join(', ')}`);
    checks.failed.push('Lab directories incomplete');
  } else {
    log.success('All lab directories present');
    checks.passed.push('Lab structure');
  }
}

// Check mongosh availability
async function checkMongosh() {
  log.header('Checking MongoDB Shell (mongosh)');

  try {
    const mongoshVersion = execSync('mongosh --version', { encoding: 'utf-8' });
    log.success(`mongosh is installed: ${mongoshVersion.trim()}`);
    checks.passed.push('mongosh installation');
  } catch (error) {
    log.warning('mongosh not found in PATH');
    log.info('Install mongosh from: https://www.mongodb.com/try/download/shell');
    checks.warnings.push('mongosh not installed');
  }
}

// Check Docker (optional)
async function checkDocker() {
  log.header('Checking Docker (Optional)');

  try {
    const dockerVersion = execSync('docker --version', { encoding: 'utf-8' });
    log.success(`Docker is installed: ${dockerVersion.trim()}`);

    // Check if docker-compose file exists
    const dockerComposePath = path.join(process.cwd(), 'docker-compose.yml');
    if (fs.existsSync(dockerComposePath)) {
      log.success('docker-compose.yml file found');

      // Check if containers are running
      try {
        const psOutput = execSync('docker ps --format "table {{.Names}}"', { encoding: 'utf-8' });
        if (psOutput.includes('mongodb')) {
          log.success('MongoDB Docker container is running');
        } else {
          log.info('MongoDB Docker container not running');
          log.info('Start with: docker-compose up -d');
        }
      } catch (err) {
        log.warning('Could not check Docker container status');
      }
    }

    checks.passed.push('Docker setup');
  } catch (error) {
    log.info('Docker not installed (optional for local MongoDB)');
  }
}

// Generate summary report
function generateSummary() {
  log.header('Setup Verification Summary');

  const totalChecks = checks.passed.length + checks.warnings.length + checks.failed.length;
  const successRate = ((checks.passed.length / totalChecks) * 100).toFixed(1);

  console.log('\n' + colors.bold('Results:'));
  console.log(colors.green(`  Passed:   ${checks.passed.length}/${totalChecks}`));
  console.log(colors.yellow(`  Warnings: ${checks.warnings.length}/${totalChecks}`));
  console.log(colors.red(`  Failed:   ${checks.failed.length}/${totalChecks}`));
  console.log(colors.cyan(`  Success Rate: ${successRate}%`));

  if (checks.failed.length > 0) {
    console.log('\n' + colors.red.bold('Critical Issues (Must Fix):'));
    checks.failed.forEach(item => console.log(`  - ${item}`));
  }

  if (checks.warnings.length > 0) {
    console.log('\n' + colors.yellow.bold('Warnings (Recommended to Fix):'));
    checks.warnings.forEach(item => console.log(`  - ${item}`));
  }

  if (checks.failed.length === 0) {
    console.log('\n' + colors.green.bold('✅ Environment is ready for MongoDB labs!'));
  } else {
    console.log('\n' + colors.red.bold('❌ Please fix critical issues before proceeding.'));
  }

  // Generate report file
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      passed: checks.passed.length,
      warnings: checks.warnings.length,
      failed: checks.failed.length,
      successRate: successRate
    },
    details: checks,
    recommendations: []
  };

  if (checks.failed.includes('MongoDB connectivity')) {
    report.recommendations.push('Install and start MongoDB');
  }
  if (checks.warnings.includes('Dependencies not installed')) {
    report.recommendations.push('Run "npm install" to install dependencies');
  }
  if (checks.warnings.includes('.env file missing')) {
    report.recommendations.push('Create .env file from template');
  }

  const reportPath = path.join(process.cwd(), 'setup-verification-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log.info(`\nDetailed report saved to: ${reportPath}`);
}

// Main execution
async function main() {
  console.log(colors.bold.cyan(`
╔══════════════════════════════════════════════════════════╗
║     MongoDB NoSQL Labs - Environment Verification       ║
╚══════════════════════════════════════════════════════════╝
  `));

  try {
    await checkNodeVersion();
    await checkDependencies();
    await checkEnvironment();
    await checkMongoDB();
    await checkDataFiles();
    await checkLabStructure();
    await checkMongosh();
    await checkDocker();

    generateSummary();
  } catch (error) {
    console.error(colors.red('\nUnexpected error during verification:'), error);
    process.exit(1);
  }

  // Exit with appropriate code
  process.exit(checks.failed.length > 0 ? 1 : 0);
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { main };