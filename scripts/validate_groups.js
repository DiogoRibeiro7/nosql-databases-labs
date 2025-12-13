#!/usr/bin/env node

/**
 * Group Deliverables Validation Script
 *
 * This script validates all group deliverables for completeness,
 * structure, and quality. It performs integration tests on group
 * submissions and generates reports.
 */

const fs = require("fs");
const path = require("path");

// Configuration
const GROUPS_DIR = path.join(__dirname, "..", "groups");
const REQUIRED_FILES = ["README.md", "solution.md"];
const MIN_FILE_SIZE = 100; // bytes
const MIN_README_SIZE = 500; // bytes for README
const MIN_SOLUTION_SIZE = 1000; // bytes for solution

// Validation results
const results = {
  groups: [],
  summary: {
    total: 0,
    complete: 0,
    incomplete: 0,
    missing: 0,
    warnings: []
  }
};

/**
 * Validate a single file
 */
function validateFile(groupPath, fileName, minSize) {
  const filePath = path.join(groupPath, fileName);

  if (!fs.existsSync(filePath)) {
    return {
      status: "missing",
      message: `${fileName} not found`
    };
  }

  const stats = fs.statSync(filePath);

  if (stats.size < minSize) {
    return {
      status: "incomplete",
      message: `${fileName} too small (${stats.size} bytes, min: ${minSize})`,
      size: stats.size
    };
  }

  // Check file content quality
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");
  const nonEmptyLines = lines.filter(line => line.trim().length > 0);

  if (nonEmptyLines.length < 5) {
    return {
      status: "incomplete",
      message: `${fileName} has insufficient content (${nonEmptyLines.length} non-empty lines)`,
      size: stats.size,
      lines: nonEmptyLines.length
    };
  }

  // Additional checks for specific files
  const checks = {
    hasHeadings: false,
    hasCodeBlocks: false,
    hasLinks: false,
    hasSections: false
  };

  // Check for markdown structure
  if (fileName.endsWith(".md")) {
    checks.hasHeadings = /^#{1,6}\s+.+/m.test(content);
    checks.hasCodeBlocks = /```[\s\S]*?```/.test(content) || /`[^`]+`/.test(content);
    checks.hasLinks = /\[.+\]\(.+\)/.test(content) || /https?:\/\//.test(content);
    checks.hasSections = (content.match(/^#{2,6}\s+.+/gm) || []).length >= 2;

    if (!checks.hasHeadings) {
      return {
        status: "warning",
        message: `${fileName} lacks proper markdown headings`,
        size: stats.size,
        checks
      };
    }
  }

  return {
    status: "valid",
    message: `${fileName} is valid`,
    size: stats.size,
    lines: nonEmptyLines.length,
    checks
  };
}

/**
 * Validate MongoDB queries in solution files
 */
function validateMongoQueries(solutionPath) {
  if (!fs.existsSync(solutionPath)) {
    return { hasQueries: false, queryCount: 0 };
  }

  const content = fs.readFileSync(solutionPath, "utf8");

  // Look for MongoDB query patterns
  const patterns = {
    find: /db\.\w+\.find\(/g,
    aggregate: /db\.\w+\.aggregate\(/g,
    insert: /db\.\w+\.insert/g,
    update: /db\.\w+\.update/g,
    delete: /db\.\w+\.(delete|remove)/g,
    createIndex: /db\.\w+\.createIndex/g
  };

  const queryTypes = {};
  let totalQueries = 0;

  for (const [type, pattern] of Object.entries(patterns)) {
    const matches = content.match(pattern) || [];
    queryTypes[type] = matches.length;
    totalQueries += matches.length;
  }

  return {
    hasQueries: totalQueries > 0,
    queryCount: totalQueries,
    queryTypes,
    hasAdvancedQueries: queryTypes.aggregate > 0 || queryTypes.createIndex > 0
  };
}

/**
 * Validate a group directory
 */
function validateGroup(groupName) {
  const groupPath = path.join(GROUPS_DIR, groupName);

  if (!fs.existsSync(groupPath)) {
    return {
      name: groupName,
      status: "missing",
      message: "Group directory not found",
      files: {}
    };
  }

  const groupResult = {
    name: groupName,
    status: "valid",
    files: {},
    queries: null,
    warnings: []
  };

  // Validate README.md
  const readmeResult = validateFile(groupPath, "README.md", MIN_README_SIZE);
  groupResult.files["README.md"] = readmeResult;

  if (readmeResult.status === "missing") {
    groupResult.status = "incomplete";
  } else if (readmeResult.status === "warning") {
    groupResult.warnings.push(readmeResult.message);
  }

  // Validate solution.md
  const solutionResult = validateFile(groupPath, "solution.md", MIN_SOLUTION_SIZE);
  groupResult.files["solution.md"] = solutionResult;

  if (solutionResult.status === "missing") {
    groupResult.status = "incomplete";
  } else if (solutionResult.status === "warning") {
    groupResult.warnings.push(solutionResult.message);
  }

  // Validate MongoDB queries in solution
  const solutionPath = path.join(groupPath, "solution.md");
  groupResult.queries = validateMongoQueries(solutionPath);

  if (groupResult.queries.queryCount === 0) {
    groupResult.warnings.push("No MongoDB queries found in solution.md");
  }

  // Check for optional files
  const optionalFiles = ["queries.js", "test.js", "data.json"];
  optionalFiles.forEach(file => {
    const filePath = path.join(groupPath, file);
    if (fs.existsSync(filePath)) {
      groupResult.files[file] = {
        status: "present",
        message: `Optional file ${file} found`,
        size: fs.statSync(filePath).size
      };
    }
  });

  // Check for screenshots or images
  const files = fs.readdirSync(groupPath);
  const imageFiles = files.filter(f => /\.(png|jpg|jpeg|gif|svg)$/i.test(f));
  if (imageFiles.length > 0) {
    groupResult.files.images = {
      status: "present",
      message: `${imageFiles.length} image(s) found`,
      files: imageFiles
    };
  }

  // Determine overall status
  const requiredFilesValid = REQUIRED_FILES.every(file =>
    groupResult.files[file] &&
    (groupResult.files[file].status === "valid" || groupResult.files[file].status === "warning")
  );

  if (!requiredFilesValid) {
    groupResult.status = "incomplete";
  } else if (groupResult.warnings.length > 0) {
    groupResult.status = "warning";
  }

  return groupResult;
}

/**
 * Generate validation report
 */
function generateReport() {
  console.log("\n" + "=".repeat(60));
  console.log("GROUP DELIVERABLES VALIDATION REPORT");
  console.log("=".repeat(60));

  console.log(`\nGroups Directory: ${GROUPS_DIR}`);
  console.log(`Total Groups: ${results.summary.total}`);
  console.log("-".repeat(60));

  // Display results for each group
  results.groups.forEach(group => {
    const statusIcon =
      group.status === "valid" ? "✓" :
      group.status === "warning" ? "⚠" :
      group.status === "incomplete" ? "✗" :
      "❌";

    console.log(`\n${statusIcon} ${group.name} - ${group.status.toUpperCase()}`);

    // Display file status
    Object.entries(group.files).forEach(([file, result]) => {
      const fileIcon =
        result.status === "valid" ? "  ✓" :
        result.status === "warning" ? "  ⚠" :
        result.status === "present" ? "  +" :
        "  ✗";

      console.log(`${fileIcon} ${file}: ${result.message}`);

      if (result.checks) {
        const checks = result.checks;
        if (!checks.hasHeadings) console.log("      - Missing markdown headings");
        if (!checks.hasCodeBlocks) console.log("      - No code blocks found");
        if (!checks.hasSections) console.log("      - Insufficient sections");
      }
    });

    // Display query analysis
    if (group.queries && group.queries.hasQueries) {
      console.log(`  📊 MongoDB Queries: ${group.queries.queryCount} total`);
      Object.entries(group.queries.queryTypes).forEach(([type, count]) => {
        if (count > 0) {
          console.log(`      - ${type}: ${count}`);
        }
      });
      if (group.queries.hasAdvancedQueries) {
        console.log("      ✓ Advanced queries detected");
      }
    }

    // Display warnings
    if (group.warnings.length > 0) {
      console.log("  ⚠️ Warnings:");
      group.warnings.forEach(warning => {
        console.log(`      - ${warning}`);
      });
    }
  });

  // Summary statistics
  console.log("\n" + "=".repeat(60));
  console.log("SUMMARY");
  console.log("=".repeat(60));

  const valid = results.groups.filter(g => g.status === "valid").length;
  const warnings = results.groups.filter(g => g.status === "warning").length;
  const incomplete = results.groups.filter(g => g.status === "incomplete").length;
  const missing = results.groups.filter(g => g.status === "missing").length;

  console.log(`\nTotal Groups: ${results.summary.total}`);
  console.log(`  ✓ Valid: ${valid}`);
  console.log(`  ⚠ With Warnings: ${warnings}`);
  console.log(`  ✗ Incomplete: ${incomplete}`);
  console.log(`  ❌ Missing: ${missing}`);

  const passRate = results.summary.total > 0
    ? ((valid + warnings) / results.summary.total * 100).toFixed(1)
    : 0;

  console.log(`\nPass Rate: ${passRate}%`);

  // Groups with best practices
  const exemplaryGroups = results.groups.filter(g =>
    g.status === "valid" &&
    g.queries &&
    g.queries.queryCount > 5 &&
    g.queries.hasAdvancedQueries
  );

  if (exemplaryGroups.length > 0) {
    console.log("\n🌟 Exemplary Submissions:");
    exemplaryGroups.forEach(g => {
      console.log(`  - ${g.name} (${g.queries.queryCount} queries with advanced features)`);
    });
  }

  // Groups needing attention
  const needsAttention = results.groups.filter(g => g.status === "incomplete" || g.status === "missing");
  if (needsAttention.length > 0) {
    console.log("\n⚠️ Groups Needing Attention:");
    needsAttention.forEach(g => {
      console.log(`  - ${g.name}: ${g.status}`);
    });
  }

  // Save JSON report
  const reportPath = path.join(__dirname, "group_validation_report.json");
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n✓ Detailed report saved to: ${reportPath}`);

  // Return exit code based on results
  return incomplete + missing > 0 ? 1 : 0;
}

/**
 * Main execution with error handling
 */
function main() {
  try {
    console.log("Starting group deliverables validation...");

    // Check if groups directory exists
    if (!fs.existsSync(GROUPS_DIR)) {
      console.log(`\n⚠️ Groups directory not found: ${GROUPS_DIR}`);
      console.log("Creating example group structure...");

      // Create example structure
      fs.mkdirSync(GROUPS_DIR, { recursive: true });

      // Create example group
      const exampleGroup = path.join(GROUPS_DIR, "group_example");
      fs.mkdirSync(exampleGroup, { recursive: true });

      fs.writeFileSync(
        path.join(exampleGroup, "README.md"),
        `# Group Example

## Members
- Student 1
- Student 2

## Project Description
This is an example group submission.

## Technologies Used
- MongoDB
- Node.js

## Setup Instructions
1. Install dependencies
2. Run the application
`
      );

      fs.writeFileSync(
        path.join(exampleGroup, "solution.md"),
        `# Solution

## Query 1: Find all users
\`\`\`javascript
db.users.find({})
\`\`\`

## Query 2: Aggregate sales by category
\`\`\`javascript
db.sales.aggregate([
  { $group: { _id: "$category", total: { $sum: "$amount" } } },
  { $sort: { total: -1 } }
])
\`\`\`

## Query 3: Create index
\`\`\`javascript
db.users.createIndex({ email: 1 }, { unique: true })
\`\`\`
`
      );

      console.log(`✓ Created example group structure in ${GROUPS_DIR}`);
    }

    // Get all group directories
    const entries = fs.readdirSync(GROUPS_DIR, { withFileTypes: true });
    const groupDirs = entries
      .filter(entry => entry.isDirectory() && entry.name.startsWith("group"))
      .map(entry => entry.name);

    if (groupDirs.length === 0) {
      console.log("\n⚠️ No group directories found");
      console.log("Group directories should be named 'group_XX' or 'groupXX'");
      process.exit(0);
    }

    results.summary.total = groupDirs.length;

    // Validate each group
    groupDirs.forEach(groupName => {
      const groupResult = validateGroup(groupName);
      results.groups.push(groupResult);

      if (groupResult.status === "valid") {
        results.summary.complete++;
      } else if (groupResult.status === "incomplete") {
        results.summary.incomplete++;
      } else if (groupResult.status === "missing") {
        results.summary.missing++;
      }
    });

    // Generate and display report
    const exitCode = generateReport();
    process.exit(exitCode);

  } catch (error) {
    console.error("\n❌ Error during validation:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { validateGroup, validateMongoQueries };