#!/usr/bin/env node

/**
 * Automated Group Submission Validator
 *
 * This script provides comprehensive validation for group submissions,
 * ensuring consistency, completeness, and quality.
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { MongoClient } = require("mongodb");

class GroupSubmissionValidator {
  constructor () {
    this.validationRules = this.loadValidationRules();
    this.results = {
      groups: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0,
      },
    };
  }

  /**
   * Load validation rules configuration
   */
  loadValidationRules () {
    return {
      requiredFiles: [
        { name: "README.md", minSize: 500 },
        { name: "solution.js", minSize: 100 },
        { name: "queries.md", minSize: 200 },
        { name: "test_results.json", minSize: 50 },
      ],
      optionalFiles: ["presentation.pdf", "data_model.png", "performance_report.md"],
      codeQuality: {
        maxLineLength: 120,
        minCommentRatio: 0.1,
        requiredPatterns: [
          /db\.\w+\.find/, // Must have find queries
          /db\.\w+\.aggregate/, // Must have aggregation
          /createIndex/, // Should have index creation
        ],
        forbiddenPatterns: [
          /eval\(/, // No eval for security
          /password|secret|key/i, // No hardcoded secrets
          /DROP|TRUNCATE/i, // No destructive operations
        ],
      },
      documentation: {
        requiredSections: [
          "## Group Information",
          "## Problem Statement",
          "## Solution",
          "## Testing",
          "## References",
        ],
        minWordCount: 500,
      },
      submission: {
        maxSizeMB: 10,
        allowedExtensions: [".md", ".js", ".json", ".txt", ".pdf", ".png", ".jpg", ".jpeg", ".gif"],
      },
    };
  }

  /**
   * Validate a single group submission
   */
  async validateGroup (groupPath) {
    const groupName = path.basename(groupPath);
    console.log(`\nValidating ${groupName}...`);

    const validation = {
      groupName,
      timestamp: new Date().toISOString(),
      checks: {
        structure: await this.checkStructure(groupPath),
        files: await this.checkFiles(groupPath),
        code: await this.checkCodeQuality(groupPath),
        documentation: await this.checkDocumentation(groupPath),
        queries: await this.checkQueries(groupPath),
        tests: await this.checkTests(groupPath),
      },
      score: 0,
      status: "pending",
      issues: [],
      warnings: [],
    };

    // Calculate score
    validation.score = this.calculateScore(validation.checks);
    validation.status = validation.score >= 70 ? "passed" : "failed";

    // Update summary
    this.results.summary.total++;
    if (validation.status === "passed") {
      this.results.summary.passed++;
    } else {
      this.results.summary.failed++;
    }
    this.results.summary.warnings += validation.warnings.length;

    this.results.groups.push(validation);
    return validation;
  }

  /**
   * Check directory structure
   */
  async checkStructure (groupPath) {
    const result = {
      valid: true,
      score: 100,
      details: [],
    };

    // Check if directory exists and is readable
    if (!fs.existsSync(groupPath)) {
      result.valid = false;
      result.score = 0;
      result.details.push("Directory does not exist");
      return result;
    }

    const stats = fs.statSync(groupPath);
    if (!stats.isDirectory()) {
      result.valid = false;
      result.score = 0;
      result.details.push("Not a directory");
      return result;
    }

    // Check directory size
    const size = await this.getDirectorySize(groupPath);
    const sizeMB = size / (1024 * 1024);

    if (sizeMB > this.validationRules.submission.maxSizeMB) {
      result.score -= 20;
      result.details.push(`Directory size (${sizeMB.toFixed(2)}MB) exceeds limit`);
    }

    // Check for required subdirectories
    const expectedDirs = ["src", "docs", "tests", "data"];
    let foundDirs = 0;

    expectedDirs.forEach(dir => {
      if (fs.existsSync(path.join(groupPath, dir))) {
        foundDirs++;
      }
    });

    result.score = Math.max(0, result.score - (expectedDirs.length - foundDirs) * 10);
    result.details.push(`Found ${foundDirs}/${expectedDirs.length} expected directories`);

    return result;
  }

  /**
   * Check required and optional files
   */
  async checkFiles (groupPath) {
    const result = {
      valid: true,
      score: 100,
      required: {},
      optional: {},
      details: [],
    };

    // Check required files
    let missingRequired = 0;
    for (const fileRule of this.validationRules.requiredFiles) {
      const filePath = path.join(groupPath, fileRule.name);

      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        if (stats.size < fileRule.minSize) {
          result.required[fileRule.name] = "incomplete";
          result.details.push(`${fileRule.name} is too small (${stats.size} bytes)`);
          result.score -= 10;
        } else {
          result.required[fileRule.name] = "present";
        }
      } else {
        result.required[fileRule.name] = "missing";
        result.details.push(`Missing required file: ${fileRule.name}`);
        missingRequired++;
        result.score -= 20;
      }
    }

    // Check optional files
    for (const fileName of this.validationRules.optionalFiles) {
      const filePath = path.join(groupPath, fileName);
      result.optional[fileName] = fs.existsSync(filePath) ? "present" : "missing";
    }

    if (missingRequired > 0) {
      result.valid = false;
    }

    result.score = Math.max(0, result.score);
    return result;
  }

  /**
   * Check code quality
   */
  async checkCodeQuality (groupPath) {
    const result = {
      valid: true,
      score: 100,
      details: [],
      metrics: {},
    };

    // Find all JavaScript files
    const jsFiles = this.findFiles(groupPath, ".js");

    if (jsFiles.length === 0) {
      result.valid = false;
      result.score = 0;
      result.details.push("No JavaScript files found");
      return result;
    }

    let totalLines = 0;
    let totalComments = 0;
    let longLines = 0;
    let securityIssues = [];

    for (const file of jsFiles) {
      const content = fs.readFileSync(file, "utf8");
      const lines = content.split("\n");

      totalLines += lines.length;

      // Count comments
      lines.forEach(line => {
        if (line.trim().startsWith("//") || line.trim().startsWith("/*")) {
          totalComments++;
        }
        if (line.length > this.validationRules.codeQuality.maxLineLength) {
          longLines++;
        }
      });

      // Check for required patterns
      for (const pattern of this.validationRules.codeQuality.requiredPatterns) {
        if (!pattern.test(content)) {
          result.details.push(`Missing required pattern: ${pattern.source}`);
          result.score -= 5;
        }
      }

      // Check for forbidden patterns
      for (const pattern of this.validationRules.codeQuality.forbiddenPatterns) {
        if (pattern.test(content)) {
          securityIssues.push(`Security issue in ${path.basename(file)}: ${pattern.source}`);
          result.score -= 10;
        }
      }
    }

    // Calculate metrics
    const commentRatio = totalLines > 0 ? totalComments / totalLines : 0;
    result.metrics = {
      totalFiles: jsFiles.length,
      totalLines,
      totalComments,
      commentRatio: (commentRatio * 100).toFixed(1) + "%",
      longLines,
    };

    if (commentRatio < this.validationRules.codeQuality.minCommentRatio) {
      result.details.push(`Insufficient comments (${result.metrics.commentRatio})`);
      result.score -= 10;
    }

    if (securityIssues.length > 0) {
      result.valid = false;
      result.details.push(...securityIssues);
    }

    result.score = Math.max(0, result.score);
    return result;
  }

  /**
   * Check documentation quality
   */
  async checkDocumentation (groupPath) {
    const result = {
      valid: true,
      score: 100,
      details: [],
      metrics: {},
    };

    const readmePath = path.join(groupPath, "README.md");

    if (!fs.existsSync(readmePath)) {
      result.valid = false;
      result.score = 0;
      result.details.push("README.md not found");
      return result;
    }

    const content = fs.readFileSync(readmePath, "utf8");
    const wordCount = content.split(/\s+/).length;

    // Check word count
    if (wordCount < this.validationRules.documentation.minWordCount) {
      result.score -= 20;
      result.details.push(`Documentation too short (${wordCount} words)`);
    }

    // Check required sections
    let missingSections = [];
    for (const section of this.validationRules.documentation.requiredSections) {
      if (!content.includes(section)) {
        missingSections.push(section);
        result.score -= 10;
      }
    }

    if (missingSections.length > 0) {
      result.details.push(`Missing sections: ${missingSections.join(", ")}`);
    }

    // Check for proper markdown formatting
    const codeBlocks = (content.match(/```/g) || []).length / 2;
    const headings = (content.match(/^#{1,6}\s/gm) || []).length;
    const links = (content.match(/\[.*?\]\(.*?\)/g) || []).length;

    result.metrics = {
      wordCount,
      codeBlocks: Math.floor(codeBlocks),
      headings,
      links,
      sections: this.validationRules.documentation.requiredSections.length - missingSections.length,
    };

    if (codeBlocks < 2) {
      result.details.push("Insufficient code examples");
      result.score -= 5;
    }

    result.score = Math.max(0, result.score);
    return result;
  }

  /**
   * Check MongoDB queries
   */
  async checkQueries (groupPath) {
    const result = {
      valid: true,
      score: 100,
      details: [],
      queries: [],
    };

    // Look for query files
    const queryFiles = [
      path.join(groupPath, "queries.js"),
      path.join(groupPath, "queries.md"),
      path.join(groupPath, "solution.js"),
    ];

    let foundQueries = false;
    let queryCount = 0;

    for (const file of queryFiles) {
      if (fs.existsSync(file)) {
        foundQueries = true;
        const content = fs.readFileSync(file, "utf8");

        // Count different types of queries
        const findQueries = (content.match(/db\.\w+\.find/g) || []).length;
        const aggregateQueries = (content.match(/db\.\w+\.aggregate/g) || []).length;
        const updateQueries = (content.match(/db\.\w+\.(update|replace)/g) || []).length;
        const indexQueries = (content.match(/createIndex/g) || []).length;

        queryCount = findQueries + aggregateQueries + updateQueries;

        result.queries.push({
          file: path.basename(file),
          find: findQueries,
          aggregate: aggregateQueries,
          update: updateQueries,
          index: indexQueries,
        });

        // Check query variety
        if (findQueries === 0) {
          result.details.push("No find queries found");
          result.score -= 20;
        }
        if (aggregateQueries === 0) {
          result.details.push("No aggregation queries found");
          result.score -= 20;
        }
        if (indexQueries === 0) {
          result.details.push("No index creation found");
          result.score -= 10;
        }
      }
    }

    if (!foundQueries) {
      result.valid = false;
      result.score = 0;
      result.details.push("No query files found");
    } else if (queryCount < 3) {
      result.score -= 30;
      result.details.push(`Insufficient queries (found ${queryCount}, minimum 3)`);
    }

    result.score = Math.max(0, result.score);
    return result;
  }

  /**
   * Check test results
   */
  async checkTests (groupPath) {
    const result = {
      valid: true,
      score: 100,
      details: [],
      testResults: null,
    };

    const testResultsPath = path.join(groupPath, "test_results.json");

    if (!fs.existsSync(testResultsPath)) {
      result.score -= 30;
      result.details.push("No test results file found");
      return result;
    }

    try {
      const testData = JSON.parse(fs.readFileSync(testResultsPath, "utf8"));

      if (!testData.tests || !Array.isArray(testData.tests)) {
        result.score -= 20;
        result.details.push("Invalid test results format");
        return result;
      }

      const totalTests = testData.tests.length;
      const passedTests = testData.tests.filter(t => t.status === "passed").length;
      const failedTests = totalTests - passedTests;

      result.testResults = {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        passRate: totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) + "%" : "0%",
      };

      if (totalTests < 3) {
        result.score -= 20;
        result.details.push(`Insufficient tests (${totalTests} tests, minimum 3)`);
      }

      if (failedTests > 0) {
        result.score -= failedTests * 5;
        result.details.push(`${failedTests} test(s) failed`);
      }
    } catch (error) {
      result.valid = false;
      result.score = 50;
      result.details.push(`Error parsing test results: ${error.message}`);
    }

    result.score = Math.max(0, result.score);
    return result;
  }

  /**
   * Calculate overall score
   */
  calculateScore (checks) {
    const weights = {
      structure: 0.1,
      files: 0.2,
      code: 0.2,
      documentation: 0.2,
      queries: 0.2,
      tests: 0.1,
    };

    let totalScore = 0;
    let totalWeight = 0;

    Object.entries(checks).forEach(([category, result]) => {
      if (result && typeof result.score === "number") {
        totalScore += result.score * weights[category];
        totalWeight += weights[category];
      }
    });

    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  }

  /**
   * Get directory size
   */
  async getDirectorySize (dirPath) {
    let size = 0;

    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        size += await this.getDirectorySize(filePath);
      } else {
        size += stats.size;
      }
    }

    return size;
  }

  /**
   * Find files by extension
   */
  findFiles (dirPath, extension) {
    let files = [];

    if (!fs.existsSync(dirPath)) {
      return files;
    }

    const items = fs.readdirSync(dirPath);
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);

      if (stats.isDirectory() && !item.startsWith(".") && item !== "node_modules") {
        files = files.concat(this.findFiles(itemPath, extension));
      } else if (stats.isFile() && itemPath.endsWith(extension)) {
        files.push(itemPath);
      }
    }

    return files;
  }

  /**
   * Generate validation report
   */
  generateReport () {
    const report = {
      timestamp: new Date().toISOString(),
      summary: this.results.summary,
      groups: this.results.groups,
      statistics: this.calculateStatistics(),
    };

    // Save JSON report
    const reportPath = path.join("group-work", "validation_report.json");
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Generate HTML report
    const htmlReport = this.generateHTMLReport(report);
    const htmlPath = path.join("group-work", "validation_report.html");
    fs.writeFileSync(htmlPath, htmlReport);

    // Generate markdown summary
    const mdReport = this.generateMarkdownReport(report);
    const mdPath = path.join("group-work", "VALIDATION_SUMMARY.md");
    fs.writeFileSync(mdPath, mdReport);

    console.log("\n📊 Reports generated:");
    console.log(`  - ${reportPath}`);
    console.log(`  - ${htmlPath}`);
    console.log(`  - ${mdPath}`);

    return report;
  }

  /**
   * Calculate statistics
   */
  calculateStatistics () {
    const scores = this.results.groups.map(g => g.score);

    return {
      averageScore:
        scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : 0,
      minScore: scores.length > 0 ? Math.min(...scores) : 0,
      maxScore: scores.length > 0 ? Math.max(...scores) : 0,
      passRate:
        this.results.summary.total > 0
          ? ((this.results.summary.passed / this.results.summary.total) * 100).toFixed(1) + "%"
          : "0%",
    };
  }

  /**
   * Generate HTML report
   */
  generateHTMLReport (report) {
    return `<!DOCTYPE html>
<html>
<head>
    <title>Group Submission Validation Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1, h2 { color: #333; }
        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .passed { color: green; font-weight: bold; }
        .failed { color: red; font-weight: bold; }
        .warning { color: orange; }
        .score { font-size: 1.2em; font-weight: bold; }
        .summary-box { background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <h1>Group Submission Validation Report</h1>
    <p>Generated: ${report.timestamp}</p>

    <div class="summary-box">
        <h2>Summary</h2>
        <p>Total Groups: ${report.summary.total}</p>
        <p>Passed: <span class="passed">${report.summary.passed}</span></p>
        <p>Failed: <span class="failed">${report.summary.failed}</span></p>
        <p>Pass Rate: ${report.statistics.passRate}</p>
        <p>Average Score: ${report.statistics.averageScore}</p>
    </div>

    <h2>Group Results</h2>
    <table>
        <tr>
            <th>Group</th>
            <th>Score</th>
            <th>Status</th>
            <th>Structure</th>
            <th>Files</th>
            <th>Code</th>
            <th>Docs</th>
            <th>Queries</th>
            <th>Tests</th>
        </tr>
        ${report.groups
          .map(
            g => `
        <tr>
            <td>${g.groupName}</td>
            <td class="score">${g.score}</td>
            <td class="${g.status}">${g.status.toUpperCase()}</td>
            <td>${g.checks.structure.score}</td>
            <td>${g.checks.files.score}</td>
            <td>${g.checks.code.score}</td>
            <td>${g.checks.documentation.score}</td>
            <td>${g.checks.queries.score}</td>
            <td>${g.checks.tests.score}</td>
        </tr>
        `
          )
          .join("")}
    </table>
</body>
</html>`;
  }

  /**
   * Generate markdown report
   */
  generateMarkdownReport (report) {
    return `# Group Submission Validation Summary

Generated: ${report.timestamp}

## Overall Statistics

- **Total Groups:** ${report.summary.total}
- **Passed:** ${report.summary.passed}
- **Failed:** ${report.summary.failed}
- **Pass Rate:** ${report.statistics.passRate}
- **Average Score:** ${report.statistics.averageScore}
- **Score Range:** ${report.statistics.minScore} - ${report.statistics.maxScore}

## Group Results

| Group | Score | Status | Issues |
|-------|-------|--------|--------|
${report.groups
  .map(g => {
    const issues = [];
    Object.entries(g.checks).forEach(([category, check]) => {
      if (check.details && check.details.length > 0) {
        issues.push(...check.details.slice(0, 2));
      }
    });
    return `| ${g.groupName} | ${g.score} | ${
      g.status === "passed" ? "✅ Passed" : "❌ Failed"
    } | ${issues.slice(0, 2).join("; ")} |`;
  })
  .join("\n")}

## Detailed Breakdown

${report.groups
  .map(
    g => `
### ${g.groupName} - Score: ${g.score}/100

**Status:** ${g.status === "passed" ? "✅ Passed" : "❌ Failed"}

#### Scores by Category:
- Structure: ${g.checks.structure.score}/100
- Files: ${g.checks.files.score}/100
- Code Quality: ${g.checks.code.score}/100
- Documentation: ${g.checks.documentation.score}/100
- Queries: ${g.checks.queries.score}/100
- Tests: ${g.checks.tests.score}/100

#### Issues:
${Object.entries(g.checks)
  .map(([category, check]) =>
    check.details && check.details.length > 0
      ? `**${category}:**\n${check.details.map(d => `- ${d}`).join("\n")}`
      : ""
  )
  .filter(s => s)
  .join("\n\n")}
`
  )
  .join("\n---\n")}

## Recommendations

1. Groups with scores below 70 should review and resubmit
2. Common issues to address:
   - Missing or incomplete documentation
   - Insufficient test coverage
   - Lack of aggregation queries
   - Missing index definitions

## Next Steps

1. Review individual group feedback
2. Schedule resubmissions for failed groups
3. Share best practices from high-scoring groups
`;
  }

  /**
   * Validate all groups
   */
  async validateAll () {
    const groupsDir = path.join(process.cwd(), "group-work");

    if (!fs.existsSync(groupsDir)) {
      console.error("Group work directory not found");
      return;
    }

    const groups = fs.readdirSync(groupsDir).filter(item => {
      const itemPath = path.join(groupsDir, item);
      return (
        fs.statSync(itemPath).isDirectory() &&
        (item.startsWith("group_") || item.startsWith("group-"))
      );
    });

    console.log(`Found ${groups.length} groups to validate\n`);

    for (const group of groups) {
      const groupPath = path.join(groupsDir, group);
      await this.validateGroup(groupPath);
    }

    return this.generateReport();
  }
}

// CLI interface
async function main () {
  const validator = new GroupSubmissionValidator();

  console.log("=".repeat(60));
  console.log("GROUP SUBMISSION VALIDATION");
  console.log("=".repeat(60));

  const report = await validator.validateAll();

  console.log("\n" + "=".repeat(60));
  console.log("VALIDATION COMPLETE");
  console.log("=".repeat(60));
  console.log(`\nTotal Groups: ${report.summary.total}`);
  console.log(`Passed: ${report.summary.passed}`);
  console.log(`Failed: ${report.summary.failed}`);
  console.log(`Pass Rate: ${report.statistics.passRate}`);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = GroupSubmissionValidator;
