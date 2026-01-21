#!/usr/bin/env node

/**
 * Comprehensive Data Management Script
 *
 * This script provides a unified interface for managing all aspects of
 * data in the NoSQL labs repository:
 * - Version tracking
 * - Freshness checking
 * - Validation
 * - Documentation generation
 */

const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");
const DataVersionTracker = require("../data/data_version_tracker");
const {
  schemas,
  validateDocument,
  applySchema,
  validateCollection,
} = require("../data/validation_schemas/dataset_schemas");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";

class DataManager {
  constructor() {
    this.versionTracker = new DataVersionTracker();
    this.reports = [];
  }

  /**
   * Run all data management tasks
   */
  async runAll() {
    console.log("\n" + "=".repeat(60));
    console.log("COMPREHENSIVE DATA MANAGEMENT");
    console.log("=".repeat(60));

    // 1. Version tracking
    console.log("\n📊 Updating version tracking...");
    this.versionTracker.trackAllDatasets();

    // 2. Freshness check
    console.log("\n🔍 Checking data freshness...");
    this.versionTracker.checkFreshness();

    // 3. Validation
    console.log("\n✅ Validating datasets...");
    await this.validateAllDatasets();

    // 4. Generate reports
    console.log("\n📄 Generating reports...");
    this.generateReports();

    // 5. Summary
    this.printSummary();
  }

  /**
   * Validate all datasets
   */
  async validateAllDatasets() {
    const datasetMappings = [
      { file: "data/datasets/books.json", schema: "books", collection: "books" },
      { file: "data/datasets/products.json", schema: "products", collection: "products" },
      { file: "data/datasets/students.json", schema: "students", collection: "students" },
      { file: "data/datasets/companies.json", schema: "companies", collection: "companies" },
      {
        file: "labs/lab02_modeling/starter/data/orders.json",
        schema: "orders",
        collection: "orders",
      },
      {
        file: "labs/lab02_modeling/starter/data/customers.json",
        schema: "customers",
        collection: "customers",
      },
    ];

    const results = [];

    for (const mapping of datasetMappings) {
      if (fs.existsSync(mapping.file)) {
        console.log(`\nValidating ${mapping.file}...`);

        try {
          const content = fs.readFileSync(mapping.file, "utf8");
          const data = JSON.parse(content);
          const documents = Array.isArray(data) ? data : [data];

          let validCount = 0;
          let invalidCount = 0;
          const errors = [];

          documents.forEach((doc, index) => {
            const result = validateDocument(doc, mapping.schema);
            if (result.valid) {
              validCount++;
            } else {
              invalidCount++;
              if (errors.length < 5) {
                errors.push({ index, errors: result.errors });
              }
            }
          });

          const validationResult = {
            file: mapping.file,
            schema: mapping.schema,
            total: documents.length,
            valid: validCount,
            invalid: invalidCount,
            errors: errors,
          };

          results.push(validationResult);

          console.log(
            `  ✓ Total: ${documents.length}, Valid: ${validCount}, Invalid: ${invalidCount}`
          );

          if (errors.length > 0) {
            console.log(`  ⚠️ Sample errors:`);
            errors.slice(0, 3).forEach((err) => {
              console.log(`    Document ${err.index}: ${err.errors[0]}`);
            });
          }
        } catch (error) {
          console.error(`  ✗ Error validating ${mapping.file}: ${error.message}`);
        }
      } else {
        console.log(`  ⚠️ File not found: ${mapping.file}`);
      }
    }

    this.validationResults = results;
    return results;
  }

  /**
   * Apply schemas to MongoDB collections
   */
  async applySchemas() {
    let client;

    try {
      console.log("\n📝 Applying validation schemas to MongoDB...");

      client = new MongoClient(MONGODB_URI);
      await client.connect();

      const db = client.db("nosql_labs");

      const schemaApplications = [
        { collection: "books", schema: schemas.books },
        { collection: "products", schema: schemas.products },
        { collection: "students", schema: schemas.students },
        { collection: "companies", schema: schemas.companies },
        { collection: "orders", schema: schemas.orders },
        { collection: "customers", schema: schemas.customers },
      ];

      for (const { collection, schema } of schemaApplications) {
        await applySchema(db, collection, schema);
      }

      console.log("\n✓ All schemas applied successfully");
    } catch (error) {
      console.error("Error applying schemas:", error);
    } finally {
      if (client) {
        await client.close();
      }
    }
  }

  /**
   * Validate data in MongoDB collections
   */
  async validateMongoDB() {
    let client;

    try {
      console.log("\n🔍 Validating MongoDB collections...");

      client = new MongoClient(MONGODB_URI);
      await client.connect();

      const db = client.db("nosql_labs");

      const validations = [
        { collection: "books", schema: "books" },
        { collection: "products", schema: "products" },
        { collection: "students", schema: "students" },
        { collection: "companies", schema: "companies" },
        { collection: "orders", schema: "orders" },
        { collection: "customers", schema: "customers" },
      ];

      const results = [];

      for (const { collection, schema } of validations) {
        const result = await validateCollection(db, collection, schema);
        results.push({ collection, ...result });
      }

      return results;
    } catch (error) {
      console.error("Error validating MongoDB:", error);
      return [];
    } finally {
      if (client) {
        await client.close();
      }
    }
  }

  /**
   * Generate comprehensive reports
   */
  generateReports() {
    // Version report
    const versionReport = this.versionTracker.generateReport();
    console.log("Version report generated:", versionReport);

    // Data quality report
    const qualityReport = {
      generated: new Date().toISOString(),
      validation: this.validationResults || [],
      freshness: this.extractFreshnessStats(),
      coverage: this.calculateCoverage(),
    };

    // Save quality report
    const qualityReportPath = path.join("data", "quality_report.json");
    fs.writeFileSync(qualityReportPath, JSON.stringify(qualityReport, null, 2));

    // Generate markdown summary
    const summaryMd = this.generateMarkdownSummary(qualityReport);
    const summaryPath = path.join("data", "DATA_SUMMARY.md");
    fs.writeFileSync(summaryPath, summaryMd);

    console.log(`\n📄 Reports generated:`);
    console.log(`  - data/data_versions.json`);
    console.log(`  - data/version_report.json`);
    console.log(`  - data/VERSION_REPORT.md`);
    console.log(`  - data/quality_report.json`);
    console.log(`  - data/DATA_SUMMARY.md`);
  }

  /**
   * Extract freshness statistics
   */
  extractFreshnessStats() {
    const stats = {
      fresh: 0,
      stale: 0,
      expired: 0,
    };

    if (this.versionTracker.versions && this.versionTracker.versions.datasets) {
      Object.values(this.versionTracker.versions.datasets).forEach((dataset) => {
        const status = dataset.freshness?.status || "unknown";
        if (status in stats) {
          stats[status]++;
        }
      });
    }

    return stats;
  }

  /**
   * Calculate data coverage
   */
  calculateCoverage() {
    const coverage = {
      totalDatasets: 0,
      documented: 0,
      validated: 0,
      versioned: 0,
      percentageDocumented: 0,
      percentageValidated: 0,
    };

    if (this.versionTracker.versions && this.versionTracker.versions.datasets) {
      coverage.totalDatasets = Object.keys(this.versionTracker.versions.datasets).length;
      coverage.versioned = coverage.totalDatasets;

      // Check documentation (simplified check)
      coverage.documented = Object.values(this.versionTracker.versions.datasets).filter(
        (d) => d.metadata && d.metadata.description
      ).length;

      // Check validation
      if (this.validationResults) {
        coverage.validated = this.validationResults.filter((r) => r.invalid === 0).length;
      }

      if (coverage.totalDatasets > 0) {
        coverage.percentageDocumented = Math.round(
          (coverage.documented / coverage.totalDatasets) * 100
        );
        coverage.percentageValidated = Math.round(
          (coverage.validated / coverage.totalDatasets) * 100
        );
      }
    }

    return coverage;
  }

  /**
   * Generate markdown summary
   */
  generateMarkdownSummary(report) {
    const now = new Date().toISOString();

    let md = `# Data Management Summary

Generated: ${now}

## Overview

This summary provides a comprehensive view of all datasets in the NoSQL Labs repository.

## Data Quality Metrics

### Freshness Status
- ✅ Fresh: ${report.freshness.fresh} datasets
- ⚠️ Stale: ${report.freshness.stale} datasets
- ❌ Expired: ${report.freshness.expired} datasets

### Validation Results
`;

    if (report.validation && report.validation.length > 0) {
      md += `
| Dataset | Total Records | Valid | Invalid | Status |
|---------|--------------|-------|---------|--------|
`;

      report.validation.forEach((v) => {
        const status = v.invalid === 0 ? "✅ Pass" : "❌ Fail";
        const filename = path.basename(v.file);
        md += `| ${filename} | ${v.total} | ${v.valid} | ${v.invalid} | ${status} |\n`;
      });
    } else {
      md += `\nNo validation results available.\n`;
    }

    md += `
### Coverage Statistics
- Total Datasets: ${report.coverage.totalDatasets}
- Documented: ${report.coverage.documented} (${report.coverage.percentageDocumented}%)
- Validated: ${report.coverage.validated} (${report.coverage.percentageValidated}%)
- Version Tracked: ${report.coverage.versioned}

## Quick Links

- [Data Dictionary](DATA_DICTIONARY.md) - Complete schema documentation
- [Version Report](VERSION_REPORT.md) - Detailed version information
- [Validation Schemas](validation_schemas/dataset_schemas.js) - MongoDB validation rules

## Management Commands

### Update All Data Tracking
\`\`\`bash
node scripts/manage_data.js --all
\`\`\`

### Check Data Freshness
\`\`\`bash
node scripts/manage_data.js --freshness
\`\`\`

### Validate Datasets
\`\`\`bash
node scripts/manage_data.js --validate
\`\`\`

### Apply MongoDB Schemas
\`\`\`bash
node scripts/manage_data.js --apply-schemas
\`\`\`

## Data Governance

All datasets are:
1. **Version tracked** - Changes are monitored and versioned
2. **Validated** - Schema validation ensures data quality
3. **Documented** - Complete data dictionary available
4. **Fresh** - Regular freshness checks identify stale data

## Contributing

When adding new datasets:
1. Add schema to \`data/validation_schemas/dataset_schemas.js\`
2. Update \`data/DATA_DICTIONARY.md\` with field documentation
3. Run \`node scripts/manage_data.js --all\` to update tracking
4. Ensure validation passes before committing

---

*Last Updated: ${now}*
`;

    return md;
  }

  /**
   * Print summary to console
   */
  printSummary() {
    console.log("\n" + "=".repeat(60));
    console.log("DATA MANAGEMENT SUMMARY");
    console.log("=".repeat(60));

    const coverage = this.calculateCoverage();
    const freshness = this.extractFreshnessStats();

    console.log("\n📊 Statistics:");
    console.log(`  Total Datasets: ${coverage.totalDatasets}`);
    console.log(`  Documented: ${coverage.documented} (${coverage.percentageDocumented}%)`);
    console.log(`  Validated: ${coverage.validated} (${coverage.percentageValidated}%)`);

    console.log("\n🔍 Freshness:");
    console.log(`  Fresh: ${freshness.fresh}`);
    console.log(`  Stale: ${freshness.stale}`);
    console.log(`  Expired: ${freshness.expired}`);

    if (this.validationResults) {
      const totalInvalid = this.validationResults.reduce((sum, r) => sum + r.invalid, 0);
      if (totalInvalid > 0) {
        console.log(`\n⚠️ Validation Issues: ${totalInvalid} invalid documents found`);
      } else {
        console.log("\n✅ All datasets passed validation!");
      }
    }

    console.log("\n✨ Data management tasks completed successfully!");
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const manager = new DataManager();

  const showHelp = () => {
    console.log(`
Data Management Tool

Usage:
  node manage_data.js [options]

Options:
  --all              Run all data management tasks
  --version          Update version tracking
  --freshness        Check data freshness
  --validate         Validate datasets against schemas
  --apply-schemas    Apply validation schemas to MongoDB
  --validate-mongo   Validate data in MongoDB collections
  --help             Show this help message

Examples:
  node manage_data.js --all
  node manage_data.js --validate
  node manage_data.js --apply-schemas
    `);
  };

  if (args.length === 0 || args.includes("--help")) {
    showHelp();
    return;
  }

  try {
    if (args.includes("--all")) {
      await manager.runAll();
    } else {
      if (args.includes("--version")) {
        manager.versionTracker.trackAllDatasets();
      }
      if (args.includes("--freshness")) {
        manager.versionTracker.checkFreshness();
      }
      if (args.includes("--validate")) {
        await manager.validateAllDatasets();
      }
      if (args.includes("--apply-schemas")) {
        await manager.applySchemas();
      }
      if (args.includes("--validate-mongo")) {
        await manager.validateMongoDB();
      }

      manager.generateReports();
      manager.printSummary();
    }
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = DataManager;
