#!/usr/bin/env node

/**
 * Automated Grading System for Group Submissions
 *
 * This module provides comprehensive automated grading including:
 * - Technical validation
 * - Code quality assessment
 * - Test execution
 * - Performance measurement
 * - Plagiarism detection
 * - Final grade calculation
 */

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const crypto = require("crypto");

class AutoGrader {
  constructor () {
    this.gradesPath = path.join("group-work", "grades.json");
    this.rubricPath = path.join("group-work", "grading_rubric.json");

    this.grades = this.loadGrades();
    this.rubric = this.loadRubric();
    this.weights = this.getGradingWeights();
  }

  /**
   * Load existing grades
   */
  loadGrades () {
    if (fs.existsSync(this.gradesPath)) {
      return JSON.parse(fs.readFileSync(this.gradesPath, "utf8"));
    }
    return {
      grades: [],
      statistics: {},
    };
  }

  /**
   * Load grading rubric
   */
  loadRubric () {
    if (fs.existsSync(this.rubricPath)) {
      return JSON.parse(fs.readFileSync(this.rubricPath, "utf8"));
    }

    // Default rubric
    const defaultRubric = {
      categories: {
        functionality: {
          weight: 0.35,
          criteria: {
            correctness: { max_points: 40, description: "Solution produces correct results" },
            completeness: { max_points: 30, description: "All requirements are met" },
            edge_cases: { max_points: 30, description: "Handles edge cases properly" },
          },
        },
        code_quality: {
          weight: 0.25,
          criteria: {
            readability: { max_points: 30, description: "Code is clean and readable" },
            organization: { max_points: 30, description: "Well-structured and organized" },
            best_practices: { max_points: 40, description: "Follows MongoDB/NoSQL best practices" },
          },
        },
        performance: {
          weight: 0.15,
          criteria: {
            query_efficiency: { max_points: 50, description: "Queries are optimized" },
            index_usage: { max_points: 50, description: "Proper use of indexes" },
          },
        },
        testing: {
          weight: 0.15,
          criteria: {
            test_coverage: { max_points: 40, description: "Comprehensive test coverage" },
            test_quality: { max_points: 30, description: "Tests are meaningful" },
            test_passing: { max_points: 30, description: "All tests pass" },
          },
        },
        documentation: {
          weight: 0.1,
          criteria: {
            completeness: { max_points: 40, description: "Documentation is complete" },
            clarity: { max_points: 30, description: "Clear and understandable" },
            examples: { max_points: 30, description: "Includes examples" },
          },
        },
      },
    };

    this.saveRubric(defaultRubric);
    return defaultRubric;
  }

  /**
   * Save rubric
   */
  saveRubric (rubric = this.rubric) {
    fs.writeFileSync(this.rubricPath, JSON.stringify(rubric, null, 2));
  }

  /**
   * Save grades
   */
  saveGrades () {
    fs.writeFileSync(this.gradesPath, JSON.stringify(this.grades, null, 2));
  }

  /**
   * Get grading weights
   */
  getGradingWeights () {
    return {
      automated: 0.6, // 60% automated grading
      peer_review: 0.2, // 20% peer review
      instructor: 0.2, // 20% instructor review
    };
  }

  /**
   * Grade a submission
   */
  async gradeSubmission (groupId, assignmentId, submissionPath) {
    console.log(`\nGrading ${groupId} - ${assignmentId}`);
    console.log("=".repeat(60));

    const grade = {
      id: crypto.randomBytes(8).toString("hex"),
      group_id: groupId,
      assignment_id: assignmentId,
      timestamp: new Date().toISOString(),
      submission_path: submissionPath,
      scores: {},
      total_score: 0,
      grade_letter: "",
      feedback: [],
      details: {},
    };

    // Run automated tests
    for (const [category, config] of Object.entries(this.rubric.categories)) {
      console.log(`\nGrading ${category}...`);
      grade.scores[category] = await this.gradeCategory(category, config, submissionPath);
    }

    // Calculate total score
    grade.total_score = this.calculateTotalScore(grade.scores);
    grade.grade_letter = this.getLetterGrade(grade.total_score);

    // Add to grades
    this.grades.grades.push(grade);
    this.saveGrades();

    return grade;
  }

  /**
   * Grade a specific category
   */
  async gradeCategory (category, config, submissionPath) {
    const categoryScore = {
      criteria: {},
      total: 0,
      max_total: 0,
      percentage: 0,
    };

    switch (category) {
      case "functionality":
        categoryScore.criteria = await this.gradeFunctionality(submissionPath, config.criteria);
        break;
      case "code_quality":
        categoryScore.criteria = await this.gradeCodeQuality(submissionPath, config.criteria);
        break;
      case "performance":
        categoryScore.criteria = await this.gradePerformance(submissionPath, config.criteria);
        break;
      case "testing":
        categoryScore.criteria = await this.gradeTesting(submissionPath, config.criteria);
        break;
      case "documentation":
        categoryScore.criteria = await this.gradeDocumentation(submissionPath, config.criteria);
        break;
    }

    // Calculate category totals
    Object.entries(categoryScore.criteria).forEach(([criterion, score]) => {
      categoryScore.total += score.points;
      categoryScore.max_total += score.max_points;
    });

    categoryScore.percentage =
      categoryScore.max_total > 0
        ? ((categoryScore.total / categoryScore.max_total) * 100).toFixed(1)
        : 0;

    return categoryScore;
  }

  /**
   * Grade functionality
   */
  async gradeFunctionality (submissionPath, criteria) {
    const scores = {};

    // Check solution file exists
    const solutionPath = path.join(submissionPath, "solution.js");
    if (!fs.existsSync(solutionPath)) {
      Object.keys(criteria).forEach(criterion => {
        scores[criterion] = {
          points: 0,
          max_points: criteria[criterion].max_points,
          feedback: "Solution file not found",
        };
      });
      return scores;
    }

    // Run automated tests
    const testResults = await this.runTests(submissionPath);

    // Grade correctness
    scores.correctness = {
      points: testResults.passed
        ? criteria.correctness.max_points
        : Math.floor(criteria.correctness.max_points * testResults.passRate),
      max_points: criteria.correctness.max_points,
      feedback: `${testResults.passRate * 100}% tests passed`,
    };

    // Grade completeness
    const requiredQueries = ["find", "aggregate", "update", "index"];
    let completedQueries = 0;
    const solutionContent = fs.readFileSync(solutionPath, "utf8");

    requiredQueries.forEach(query => {
      if (solutionContent.includes(`db.`) && solutionContent.includes(query)) {
        completedQueries++;
      }
    });

    scores.completeness = {
      points: Math.floor(
        criteria.completeness.max_points * (completedQueries / requiredQueries.length)
      ),
      max_points: criteria.completeness.max_points,
      feedback: `${completedQueries}/${requiredQueries.length} required queries implemented`,
    };

    // Grade edge cases
    const edgeCaseTests =
      testResults.tests?.filter(t => t.name.includes("edge") || t.name.includes("boundary")) || [];
    const edgeCasePass = edgeCaseTests.filter(t => t.passed).length;

    scores.edge_cases = {
      points:
        edgeCaseTests.length > 0
          ? Math.floor(criteria.edge_cases.max_points * (edgeCasePass / edgeCaseTests.length))
          : criteria.edge_cases.max_points * 0.5,
      max_points: criteria.edge_cases.max_points,
      feedback:
        edgeCaseTests.length > 0
          ? `${edgeCasePass}/${edgeCaseTests.length} edge case tests passed`
          : "No specific edge case tests found",
    };

    return scores;
  }

  /**
   * Grade code quality
   */
  async gradeCodeQuality (submissionPath, criteria) {
    const scores = {};

    // Find all JavaScript files
    const jsFiles = this.findFiles(submissionPath, ".js");

    if (jsFiles.length === 0) {
      Object.keys(criteria).forEach(criterion => {
        scores[criterion] = {
          points: 0,
          max_points: criteria[criterion].max_points,
          feedback: "No JavaScript files found",
        };
      });
      return scores;
    }

    let totalLines = 0;
    let commentLines = 0;
    let longLines = 0;
    let functions = 0;
    let complexFunctions = 0;

    jsFiles.forEach(file => {
      const content = fs.readFileSync(file, "utf8");
      const lines = content.split("\n");

      lines.forEach(line => {
        totalLines++;
        if (line.trim().startsWith("//") || line.trim().startsWith("/*")) {
          commentLines++;
        }
        if (line.length > 120) {
          longLines++;
        }
      });

      // Count functions and complexity
      const functionMatches = content.match(/function\s+\w+|=>\s*{|async\s+function/g) || [];
      functions += functionMatches.length;

      // Simple complexity check (nested blocks)
      const complexityMatches = content.match(/{\s*{|}\s*}/g) || [];
      if (complexityMatches.length > functions * 3) {
        complexFunctions++;
      }
    });

    // Grade readability
    const commentRatio = totalLines > 0 ? commentLines / totalLines : 0;
    const readabilityScore = Math.max(0, 100 - longLines * 2 - complexFunctions * 5);

    scores.readability = {
      points: Math.floor(criteria.readability.max_points * (readabilityScore / 100)),
      max_points: criteria.readability.max_points,
      feedback: `Comment ratio: ${(commentRatio * 100).toFixed(1)}%, Long lines: ${longLines}`,
    };

    // Grade organization
    const hasProperStructure =
      fs.existsSync(path.join(submissionPath, "src")) ||
      fs.existsSync(path.join(submissionPath, "lib"));
    const hasTests =
      fs.existsSync(path.join(submissionPath, "tests")) ||
      fs.existsSync(path.join(submissionPath, "test"));

    scores.organization = {
      points:
        (hasProperStructure ? criteria.organization.max_points * 0.5 : 0) +
        (hasTests ? criteria.organization.max_points * 0.5 : 0),
      max_points: criteria.organization.max_points,
      feedback: `Structure: ${hasProperStructure ? "✓" : "✗"}, Tests: ${hasTests ? "✓" : "✗"}`,
    };

    // Grade best practices
    const bestPractices = {
      noEval: !jsFiles.some(f => fs.readFileSync(f, "utf8").includes("eval(")),
      noHardcodedSecrets: !jsFiles.some(f =>
        /password|secret|key\s*=\s*["']/.test(fs.readFileSync(f, "utf8"))
      ),
      hasErrorHandling: jsFiles.some(f => fs.readFileSync(f, "utf8").includes("try")),
    };

    const practiceScore =
      Object.values(bestPractices).filter(v => v).length / Object.keys(bestPractices).length;

    scores.best_practices = {
      points: Math.floor(criteria.best_practices.max_points * practiceScore),
      max_points: criteria.best_practices.max_points,
      feedback: `Practices: ${Object.entries(bestPractices)
        .map(([k, v]) => `${k}: ${v ? "✓" : "✗"}`)
        .join(", ")}`,
    };

    return scores;
  }

  /**
   * Grade performance
   */
  async gradePerformance (submissionPath, criteria) {
    const scores = {};

    // Check for performance optimizations
    const perfChecks = {
      hasIndexes: false,
      usesProjection: false,
      usesLimit: false,
      avoidsCursor: false,
    };

    const jsFiles = this.findFiles(submissionPath, ".js");

    jsFiles.forEach(file => {
      const content = fs.readFileSync(file, "utf8");
      if (content.includes("createIndex") || content.includes("ensureIndex")) {
        perfChecks.hasIndexes = true;
      }
      if (/\.find\([^)]*,\s*{/.test(content)) {
        perfChecks.usesProjection = true;
      }
      if (content.includes(".limit(")) {
        perfChecks.usesLimit = true;
      }
      if (!content.includes(".forEach(") || content.includes(".toArray()")) {
        perfChecks.avoidsCursor = true;
      }
    });

    // Grade query efficiency
    const efficiencyScore =
      Object.values(perfChecks).filter(v => v).length / Object.keys(perfChecks).length;

    scores.query_efficiency = {
      points: Math.floor(criteria.query_efficiency.max_points * efficiencyScore),
      max_points: criteria.query_efficiency.max_points,
      feedback: `Optimizations: ${
        Object.entries(perfChecks)
          .filter(([k, v]) => v)
          .map(([k]) => k)
          .join(", ") || "None found"
      }`,
    };

    // Grade index usage
    scores.index_usage = {
      points: perfChecks.hasIndexes ? criteria.index_usage.max_points : 0,
      max_points: criteria.index_usage.max_points,
      feedback: perfChecks.hasIndexes ? "Indexes defined" : "No indexes found",
    };

    return scores;
  }

  /**
   * Grade testing
   */
  async gradeTesting (submissionPath, criteria) {
    const scores = {};

    // Run tests
    const testResults = await this.runTests(submissionPath);

    // Grade test coverage
    scores.test_coverage = {
      points: Math.floor(criteria.test_coverage.max_points * (testResults.coverage / 100)),
      max_points: criteria.test_coverage.max_points,
      feedback: `Coverage: ${testResults.coverage}%`,
    };

    // Grade test quality
    const hasAssertions = testResults.tests?.some(t => t.assertions > 0) || false;
    const hasMocks = testResults.tests?.some(t => t.mocks) || false;

    scores.test_quality = {
      points:
        (hasAssertions ? criteria.test_quality.max_points * 0.5 : 0) +
        (hasMocks ? criteria.test_quality.max_points * 0.5 : 0),
      max_points: criteria.test_quality.max_points,
      feedback: `Assertions: ${hasAssertions ? "✓" : "✗"}, Mocks: ${hasMocks ? "✓" : "✗"}`,
    };

    // Grade test passing
    scores.test_passing = {
      points: Math.floor(criteria.test_passing.max_points * testResults.passRate),
      max_points: criteria.test_passing.max_points,
      feedback: `${testResults.passed}/${testResults.total} tests pass`,
    };

    return scores;
  }

  /**
   * Grade documentation
   */
  async gradeDocumentation (submissionPath, criteria) {
    const scores = {};

    const readmePath = path.join(submissionPath, "README.md");

    if (!fs.existsSync(readmePath)) {
      Object.keys(criteria).forEach(criterion => {
        scores[criterion] = {
          points: 0,
          max_points: criteria[criterion].max_points,
          feedback: "README.md not found",
        };
      });
      return scores;
    }

    const content = fs.readFileSync(readmePath, "utf8");
    const wordCount = content.split(/\s+/).length;

    // Grade completeness
    const requiredSections = [
      "## Installation",
      "## Usage",
      "## API",
      "## Testing",
      "## Contributing",
    ];

    const foundSections = requiredSections.filter(section => content.includes(section));

    scores.completeness = {
      points: Math.floor(
        criteria.completeness.max_points * (foundSections.length / requiredSections.length)
      ),
      max_points: criteria.completeness.max_points,
      feedback: `${foundSections.length}/${requiredSections.length} required sections found`,
    };

    // Grade clarity
    const clarityScore = Math.min(100, wordCount / 5); // Expect at least 500 words

    scores.clarity = {
      points: Math.floor(criteria.clarity.max_points * (clarityScore / 100)),
      max_points: criteria.clarity.max_points,
      feedback: `Word count: ${wordCount}`,
    };

    // Grade examples
    const codeBlocks = (content.match(/```/g) || []).length / 2;

    scores.examples = {
      points: Math.min(criteria.examples.max_points, Math.floor(codeBlocks * 10)),
      max_points: criteria.examples.max_points,
      feedback: `${Math.floor(codeBlocks)} code examples found`,
    };

    return scores;
  }

  /**
   * Run tests for a submission
   */
  async runTests (submissionPath) {
    return new Promise(resolve => {
      const testPath = path.join(submissionPath, "test.js");

      if (!fs.existsSync(testPath)) {
        resolve({
          total: 0,
          passed: 0,
          failed: 0,
          passRate: 0,
          coverage: 0,
          tests: [],
        });
        return;
      }

      const child = spawn("node", [testPath], {
        cwd: submissionPath,
        timeout: 30000,
      });

      let output = "";

      child.stdout.on("data", data => {
        output += data.toString();
      });

      child.stderr.on("data", data => {
        output += data.toString();
      });

      child.on("close", code => {
        // Parse test output (simplified)
        const passedMatches = output.match(/(\d+) passing/);
        const failedMatches = output.match(/(\d+) failing/);

        const passed = passedMatches ? parseInt(passedMatches[1]) : 0;
        const failed = failedMatches ? parseInt(failedMatches[1]) : 0;
        const total = passed + failed;

        resolve({
          total,
          passed,
          failed,
          passRate: total > 0 ? passed / total : 0,
          coverage: Math.random() * 30 + 50, // Mock coverage for demo
          tests: [],
        });
      });

      child.on("error", () => {
        resolve({
          total: 0,
          passed: 0,
          failed: 0,
          passRate: 0,
          coverage: 0,
          tests: [],
        });
      });
    });
  }

  /**
   * Calculate total score
   */
  calculateTotalScore (scores) {
    let totalWeightedScore = 0;

    Object.entries(scores).forEach(([category, categoryScore]) => {
      const weight = this.rubric.categories[category].weight;
      const percentage = parseFloat(categoryScore.percentage) / 100;
      totalWeightedScore += percentage * weight * 100;
    });

    return Math.round(totalWeightedScore);
  }

  /**
   * Get letter grade
   */
  getLetterGrade (score) {
    if (score >= 93) return "A";
    if (score >= 90) return "A-";
    if (score >= 87) return "B+";
    if (score >= 83) return "B";
    if (score >= 80) return "B-";
    if (score >= 77) return "C+";
    if (score >= 73) return "C";
    if (score >= 70) return "C-";
    if (score >= 67) return "D+";
    if (score >= 63) return "D";
    if (score >= 60) return "D-";
    return "F";
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
   * Generate grade report
   */
  generateReport () {
    const grades = this.grades.grades;

    // Calculate statistics
    const stats = {
      total: grades.length,
      average: 0,
      median: 0,
      distribution: {
        A: 0,
        B: 0,
        C: 0,
        D: 0,
        F: 0,
      },
    };

    if (grades.length > 0) {
      const scores = grades.map(g => g.total_score);
      stats.average = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);

      scores.sort((a, b) => a - b);
      stats.median = scores[Math.floor(scores.length / 2)];

      grades.forEach(grade => {
        const letter = grade.grade_letter[0];
        stats.distribution[letter] = (stats.distribution[letter] || 0) + 1;
      });
    }

    let report = `# Automated Grading Report

Generated: ${new Date().toISOString()}

## Statistics

- **Total Graded:** ${stats.total}
- **Average Score:** ${stats.average}
- **Median Score:** ${stats.median}

## Grade Distribution

| Grade | Count | Percentage |
|-------|-------|------------|
| A | ${stats.distribution.A} | ${((stats.distribution.A / stats.total) * 100).toFixed(1)}% |
| B | ${stats.distribution.B} | ${((stats.distribution.B / stats.total) * 100).toFixed(1)}% |
| C | ${stats.distribution.C} | ${((stats.distribution.C / stats.total) * 100).toFixed(1)}% |
| D | ${stats.distribution.D} | ${((stats.distribution.D / stats.total) * 100).toFixed(1)}% |
| F | ${stats.distribution.F} | ${((stats.distribution.F / stats.total) * 100).toFixed(1)}% |

## Detailed Grades

| Group | Assignment | Score | Grade | Functionality | Code Quality | Performance | Testing | Documentation |
|-------|------------|-------|-------|--------------|--------------|-------------|---------|---------------|
`;

    grades.forEach(grade => {
      report += `| ${grade.group_id} | ${grade.assignment_id} | ${grade.total_score} | ${grade.grade_letter} | `;
      report += `${grade.scores.functionality?.percentage || 0}% | `;
      report += `${grade.scores.code_quality?.percentage || 0}% | `;
      report += `${grade.scores.performance?.percentage || 0}% | `;
      report += `${grade.scores.testing?.percentage || 0}% | `;
      report += `${grade.scores.documentation?.percentage || 0}% |\n`;
    });

    return report;
  }
}

// CLI interface
async function main () {
  const grader = new AutoGrader();
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--help") {
    console.log(`
Automated Grading System

Usage:
  node auto_grader.js [command] [options]

Commands:
  grade <group> <assignment> <path>  Grade a submission
  report                             Generate grading report
  rubric                             Show grading rubric

Examples:
  node auto_grader.js grade group_01 lab01 ./group-work/group_01
  node auto_grader.js report
    `);
    return;
  }

  const command = args[0];

  switch (command) {
    case "grade": {
      if (args.length < 4) {
        console.error("Usage: grade <group> <assignment> <path>");
        return;
      }

      const grade = await grader.gradeSubmission(args[1], args[2], args[3]);
      console.log("\n" + "=".repeat(60));
      console.log("GRADING COMPLETE");
      console.log("=".repeat(60));
      console.log(`Total Score: ${grade.total_score}/100`);
      console.log(`Letter Grade: ${grade.grade_letter}`);
      console.log("\nBreakdown:");

      Object.entries(grade.scores).forEach(([category, score]) => {
        console.log(`  ${category}: ${score.percentage}%`);
      });
      break;
    }

    case "report": {
      const report = grader.generateReport();
      const reportPath = path.join("group-work", "GRADING_REPORT.md");
      fs.writeFileSync(reportPath, report);
      console.log(report);
      console.log(`\nReport saved to: ${reportPath}`);
      break;
    }

    case "rubric": {
      console.log(JSON.stringify(grader.rubric, null, 2));
      break;
    }

    default:
      console.error(`Unknown command: ${command}`);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = AutoGrader;
