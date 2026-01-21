/**
 * Data Version Tracking System
 *
 * This module provides versioning and freshness tracking for all datasets
 * in the NoSQL labs repository. It tracks schema versions, data updates,
 * and ensures data consistency across labs.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { MongoClient } = require('mongodb');

class DataVersionTracker {
  constructor(basePath = '.') {
    this.basePath = basePath;
    this.dataPath = path.join(basePath, 'data');
    this.versionFile = path.join(this.dataPath, 'data_versions.json');
    this.versions = this.loadVersions();
  }

  /**
   * Load existing version information
   */
  loadVersions() {
    try {
      if (fs.existsSync(this.versionFile)) {
        return JSON.parse(fs.readFileSync(this.versionFile, 'utf8'));
      }
    } catch (error) {
      console.error('Error loading version file:', error);
    }
    return {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      datasets: {}
    };
  }

  /**
   * Save version information
   */
  saveVersions() {
    try {
      fs.writeFileSync(
        this.versionFile,
        JSON.stringify(this.versions, null, 2)
      );
      console.log('✓ Version information saved');
    } catch (error) {
      console.error('Error saving version file:', error);
    }
  }

  /**
   * Calculate checksum for a file
   */
  calculateChecksum(filePath) {
    const hash = crypto.createHash('sha256');
    const data = fs.readFileSync(filePath);
    hash.update(data);
    return hash.digest('hex');
  }

  /**
   * Get file metadata
   */
  getFileMetadata(filePath) {
    const stats = fs.statSync(filePath);
    return {
      size: stats.size,
      modified: stats.mtime.toISOString(),
      created: stats.birthtime.toISOString()
    };
  }

  /**
   * Analyze JSON structure
   */
  analyzeJsonStructure(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);

      const structure = {
        type: Array.isArray(data) ? 'array' : 'object',
        count: Array.isArray(data) ? data.length : Object.keys(data).length,
        fields: [],
        sampleRecord: null
      };

      if (Array.isArray(data) && data.length > 0) {
        structure.fields = Object.keys(data[0]);
        structure.sampleRecord = data[0];
      } else if (typeof data === 'object' && data !== null) {
        structure.fields = Object.keys(data);
        structure.sampleRecord = data;
      }

      return structure;
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
      return null;
    }
  }

  /**
   * Track a single dataset
   */
  trackDataset(filePath, metadata = {}) {
    const fileName = path.basename(filePath);
    const relativePath = path.relative(this.basePath, filePath);

    console.log(`Tracking: ${fileName}`);

    const checksum = this.calculateChecksum(filePath);
    const fileMetadata = this.getFileMetadata(filePath);
    const structure = this.analyzeJsonStructure(filePath);

    const datasetInfo = {
      name: fileName,
      path: relativePath,
      checksum,
      ...fileMetadata,
      structure,
      metadata: {
        description: metadata.description || '',
        source: metadata.source || 'internal',
        license: metadata.license || 'MIT',
        tags: metadata.tags || [],
        usedInLabs: metadata.usedInLabs || [],
        dependencies: metadata.dependencies || []
      },
      version: {
        major: 1,
        minor: 0,
        patch: 0,
        timestamp: new Date().toISOString()
      },
      freshness: {
        lastValidated: new Date().toISOString(),
        updateFrequency: metadata.updateFrequency || 'static',
        expiresAt: metadata.expiresAt || null,
        status: 'fresh'
      }
    };

    // Check if dataset already exists and if it changed
    const existingDataset = this.versions.datasets[fileName];
    if (existingDataset) {
      if (existingDataset.checksum !== checksum) {
        // Data has changed, increment version
        datasetInfo.version.minor = existingDataset.version.minor + 1;
        datasetInfo.previousVersions = existingDataset.previousVersions || [];
        datasetInfo.previousVersions.push({
          version: `${existingDataset.version.major}.${existingDataset.version.minor}.${existingDataset.version.patch}`,
          checksum: existingDataset.checksum,
          timestamp: existingDataset.version.timestamp
        });
        console.log(`  ⚠️ Data changed - version bumped to ${datasetInfo.version.major}.${datasetInfo.version.minor}.${datasetInfo.version.patch}`);
      } else {
        // Keep existing version info
        datasetInfo.version = existingDataset.version;
        datasetInfo.previousVersions = existingDataset.previousVersions;
        console.log(`  ✓ No changes detected`);
      }
    } else {
      console.log(`  ✓ New dataset tracked`);
    }

    this.versions.datasets[fileName] = datasetInfo;
    return datasetInfo;
  }

  /**
   * Track all datasets in a directory
   */
  trackAllDatasets() {
    console.log('\n' + '='.repeat(60));
    console.log('DATA VERSION TRACKING');
    console.log('='.repeat(60));

    const datasetPaths = [
      { dir: 'data/datasets', pattern: '*.json' },
      { dir: 'data/ColoradoScooters', pattern: '*.json' },
      { dir: 'data/crunchbase', pattern: '*.json' },
      { dir: 'data/DBEnvyLoad', pattern: '*.json' },
      { dir: 'data/enron', pattern: '*.json' },
      { dir: 'data/sakila-db', pattern: '*.json' },
      { dir: 'data/sample_data', pattern: '*.json' },
      { dir: 'data/world-db', pattern: '*.json' },
      { dir: 'labs/lab01_intro/data', pattern: '*.json' },
      { dir: 'labs/lab02_modeling/starter/data', pattern: '*.json' }
    ];

    let trackedCount = 0;

    datasetPaths.forEach(({ dir, pattern }) => {
      const fullPath = path.join(this.basePath, dir);
      if (fs.existsSync(fullPath)) {
        const files = fs.readdirSync(fullPath).filter(f => f.endsWith('.json'));
        files.forEach(file => {
          const filePath = path.join(fullPath, file);

          // Load metadata if it exists
          const metadataFile = filePath.replace('.json', '.metadata.json');
          let metadata = {};
          if (fs.existsSync(metadataFile)) {
            try {
              metadata = JSON.parse(fs.readFileSync(metadataFile, 'utf8'));
            } catch (e) {
              // Ignore metadata parse errors
            }
          }

          this.trackDataset(filePath, metadata);
          trackedCount++;
        });
      }
    });

    this.versions.lastUpdated = new Date().toISOString();
    this.versions.totalDatasets = Object.keys(this.versions.datasets).length;

    console.log(`\n✓ Tracked ${trackedCount} datasets`);
    this.saveVersions();
    return this.versions;
  }

  /**
   * Check data freshness
   */
  checkFreshness() {
    console.log('\n' + '='.repeat(60));
    console.log('DATA FRESHNESS CHECK');
    console.log('='.repeat(60));

    const now = new Date();
    const staleThreshold = 30; // days
    let staleCount = 0;
    let expiredCount = 0;

    Object.entries(this.versions.datasets).forEach(([name, dataset]) => {
      const lastModified = new Date(dataset.modified);
      const daysSinceModified = Math.floor((now - lastModified) / (1000 * 60 * 60 * 24));

      let status = 'fresh';
      let message = '✓ Fresh';

      if (dataset.freshness.expiresAt && new Date(dataset.freshness.expiresAt) < now) {
        status = 'expired';
        message = '❌ Expired';
        expiredCount++;
      } else if (daysSinceModified > staleThreshold) {
        status = 'stale';
        message = `⚠️ Stale (${daysSinceModified} days old)`;
        staleCount++;
      }

      dataset.freshness.status = status;
      dataset.freshness.lastChecked = now.toISOString();
      dataset.freshness.daysSinceModified = daysSinceModified;

      console.log(`${message.padEnd(25)} ${name}`);
    });

    console.log('\nSummary:');
    console.log(`  Fresh: ${Object.keys(this.versions.datasets).length - staleCount - expiredCount}`);
    console.log(`  Stale: ${staleCount}`);
    console.log(`  Expired: ${expiredCount}`);

    this.saveVersions();
    return this.versions;
  }

  /**
   * Generate version report
   */
  generateReport() {
    const report = {
      generated: new Date().toISOString(),
      summary: {
        totalDatasets: Object.keys(this.versions.datasets).length,
        totalSize: 0,
        formats: {},
        freshness: {
          fresh: 0,
          stale: 0,
          expired: 0
        }
      },
      datasets: []
    };

    Object.entries(this.versions.datasets).forEach(([name, dataset]) => {
      report.summary.totalSize += dataset.size;

      const ext = path.extname(name).toLowerCase();
      report.summary.formats[ext] = (report.summary.formats[ext] || 0) + 1;

      report.summary.freshness[dataset.freshness.status]++;

      report.datasets.push({
        name,
        version: `${dataset.version.major}.${dataset.version.minor}.${dataset.version.patch}`,
        size: dataset.size,
        records: dataset.structure?.count || 0,
        fields: dataset.structure?.fields || [],
        lastModified: dataset.modified,
        status: dataset.freshness.status
      });
    });

    // Sort by name
    report.datasets.sort((a, b) => a.name.localeCompare(b.name));

    // Save report
    const reportPath = path.join(this.dataPath, 'version_report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Generate markdown report
    const mdReport = this.generateMarkdownReport(report);
    const mdPath = path.join(this.dataPath, 'VERSION_REPORT.md');
    fs.writeFileSync(mdPath, mdReport);

    console.log(`\n✓ Reports generated:`);
    console.log(`  - ${reportPath}`);
    console.log(`  - ${mdPath}`);

    return report;
  }

  /**
   * Generate markdown version report
   */
  generateMarkdownReport(report) {
    let md = `# Data Version Report

Generated: ${report.generated}

## Summary

- **Total Datasets**: ${report.summary.totalDatasets}
- **Total Size**: ${(report.summary.totalSize / 1024 / 1024).toFixed(2)} MB
- **Formats**: ${Object.entries(report.summary.formats).map(([k, v]) => `${k} (${v})`).join(', ')}

### Freshness Status
- ✓ Fresh: ${report.summary.freshness.fresh}
- ⚠️ Stale: ${report.summary.freshness.stale}
- ❌ Expired: ${report.summary.freshness.expired}

## Datasets

| Dataset | Version | Records | Fields | Size (KB) | Last Modified | Status |
|---------|---------|---------|--------|-----------|---------------|--------|
`;

    report.datasets.forEach(dataset => {
      const statusIcon = dataset.status === 'fresh' ? '✓' : dataset.status === 'stale' ? '⚠️' : '❌';
      md += `| ${dataset.name} | ${dataset.version} | ${dataset.records} | ${dataset.fields.length} | ${(dataset.size / 1024).toFixed(1)} | ${dataset.lastModified.split('T')[0]} | ${statusIcon} ${dataset.status} |\n`;
    });

    md += `\n## Version History

To view the complete version history for each dataset, check the \`data_versions.json\` file.

## Update Instructions

To update data versions after making changes:

\`\`\`bash
node data/data_version_tracker.js --update
\`\`\`

To check data freshness:

\`\`\`bash
node data/data_version_tracker.js --check-freshness
\`\`\`
`;

    return md;
  }

  /**
   * Validate dataset against schema
   */
  async validateDataset(datasetName, schema) {
    const dataset = this.versions.datasets[datasetName];
    if (!dataset) {
      console.error(`Dataset ${datasetName} not found`);
      return false;
    }

    const filePath = path.join(this.basePath, dataset.path);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // Basic validation
    const errors = [];

    if (Array.isArray(data)) {
      data.forEach((record, index) => {
        const recordErrors = this.validateRecord(record, schema, index);
        errors.push(...recordErrors);
      });
    } else {
      const recordErrors = this.validateRecord(data, schema, 0);
      errors.push(...recordErrors);
    }

    if (errors.length > 0) {
      console.log(`\n❌ Validation failed for ${datasetName}:`);
      errors.slice(0, 10).forEach(error => console.log(`  - ${error}`));
      if (errors.length > 10) {
        console.log(`  ... and ${errors.length - 10} more errors`);
      }
      return false;
    }

    console.log(`✓ ${datasetName} validated successfully`);
    return true;
  }

  /**
   * Validate a single record against schema
   */
  validateRecord(record, schema, index) {
    const errors = [];

    // Check required fields
    if (schema.required) {
      schema.required.forEach(field => {
        if (!(field in record)) {
          errors.push(`Record ${index}: Missing required field '${field}'`);
        }
      });
    }

    // Check field types
    if (schema.properties) {
      Object.entries(schema.properties).forEach(([field, rules]) => {
        if (field in record) {
          const value = record[field];

          // Type check
          if (rules.type) {
            const actualType = Array.isArray(value) ? 'array' : typeof value;
            if (actualType !== rules.type) {
              errors.push(`Record ${index}: Field '${field}' should be ${rules.type}, got ${actualType}`);
            }
          }

          // Range check for numbers
          if (rules.type === 'number' && typeof value === 'number') {
            if (rules.min !== undefined && value < rules.min) {
              errors.push(`Record ${index}: Field '${field}' value ${value} is below minimum ${rules.min}`);
            }
            if (rules.max !== undefined && value > rules.max) {
              errors.push(`Record ${index}: Field '${field}' value ${value} is above maximum ${rules.max}`);
            }
          }

          // Pattern check for strings
          if (rules.pattern && typeof value === 'string') {
            const regex = new RegExp(rules.pattern);
            if (!regex.test(value)) {
              errors.push(`Record ${index}: Field '${field}' value doesn't match pattern ${rules.pattern}`);
            }
          }

          // Enum check
          if (rules.enum && !rules.enum.includes(value)) {
            errors.push(`Record ${index}: Field '${field}' value '${value}' not in allowed values: ${rules.enum.join(', ')}`);
          }
        }
      });
    }

    return errors;
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const tracker = new DataVersionTracker();

  if (args.includes('--update') || args.includes('-u')) {
    console.log('Updating data versions...');
    tracker.trackAllDatasets();
    tracker.generateReport();
  } else if (args.includes('--check-freshness') || args.includes('-f')) {
    console.log('Checking data freshness...');
    tracker.checkFreshness();
  } else if (args.includes('--report') || args.includes('-r')) {
    console.log('Generating version report...');
    tracker.generateReport();
  } else {
    console.log(`
Data Version Tracker

Usage:
  node data_version_tracker.js [options]

Options:
  --update, -u         Update version tracking for all datasets
  --check-freshness, -f  Check freshness status of all datasets
  --report, -r         Generate version report

Examples:
  node data_version_tracker.js --update
  node data_version_tracker.js --check-freshness
  node data_version_tracker.js --report
    `);
  }
}

module.exports = DataVersionTracker;