#!/usr/bin/env node

/**
 * Lab 02 - Comprehensive Test Runner
 *
 * This script runs all test suites for Lab 02 in sequence:
 * 1. Basic query tests
 * 2. Data integrity validation
 * 3. Performance benchmarks
 * 4. Integration tests
 * 5. Validation schema tests
 */

const { spawn } = require("child_process");
const fs = require("fs");

// Test suite configuration
const testSuites = [
  {
    name: "Basic Query Tests",
    file: "test_queries.js",
    description: "Validates that the data model supports all required operations",
    required: true,
  },
  {
    name: "Data Integrity Validation",
    file: "data_integrity_validator.js",
    description: "Checks data consistency, referential integrity, and business rules",
    required: true,
  },
  {
    name: "Performance Benchmarks",
    file: "performance_benchmarks.js",
    description: "Measures query performance and identifies optimization opportunities",
    required: false,
  },
  {
    name: "Integration Tests",
    file: "integration_tests.js",
    description: "Validates deliverables and overall lab completion",
    required: true,
  },
  {
    name: "Validation Schemas",
    file: "validation_schemas.js",
    args: ["--test"],
    description: "Tests MongoDB validation schemas",
    required: false,
  },
];

// Test results summary
const results = {
  suites: [],
  totalTime: 0,
  startTime: new Date(),
};

/**
 * Run a single test suite
 */
function runTestSuite(suite) {
  return new Promise((resolve, reject) => {
    console.log("\n" + "=".repeat(60));
    console.log(`Running: ${suite.name}`);
    console.log("=".repeat(60));
    console.log(`Description: ${suite.description}`);
    console.log(`File: ${suite.file}`);
    console.log("-".repeat(60));

    const startTime = Date.now();

    // Check if file exists
    if (!fs.existsSync(suite.file)) {
      console.log(`⚠️ Test file not found: ${suite.file}`);
      if (suite.required) {
        console.log("This is a required test suite. Skipping...");
      }
      resolve({
        name: suite.name,
        status: "skipped",
        reason: "File not found",
        duration: 0,
      });
      return;
    }

    // Run the test
    const args = suite.args || [];
    const child = spawn("node", [suite.file, ...args], {
      stdio: "inherit",
      env: process.env,
    });

    child.on("close", (code) => {
      const duration = Date.now() - startTime;
      const status = code === 0 ? "passed" : "failed";

      console.log("\n" + "-".repeat(60));
      console.log(`${status === "passed" ? "✓" : "✗"} ${suite.name}: ${status.toUpperCase()}`);
      console.log(`Duration: ${(duration / 1000).toFixed(2)}s`);

      resolve({
        name: suite.name,
        status,
        exitCode: code,
        duration,
      });
    });

    child.on("error", (error) => {
      console.error(`Error running ${suite.name}:`, error);
      reject(error);
    });
  });
}

/**
 * Generate final report
 */
function generateFinalReport() {
  const totalDuration = Date.now() - results.startTime.getTime();

  console.log("\n" + "=".repeat(60));
  console.log("TEST SUITE EXECUTION SUMMARY");
  console.log("=".repeat(60));

  console.log("\nTest Results:");
  console.log("-".repeat(40));

  const maxNameLength = Math.max(...results.suites.map((s) => s.name.length));

  results.suites.forEach((suite) => {
    const icon = suite.status === "passed" ? "✓" : suite.status === "failed" ? "✗" : "⚠";

    const name = suite.name.padEnd(maxNameLength);
    const status = suite.status.toUpperCase().padEnd(8);
    const duration = suite.duration > 0 ? `(${(suite.duration / 1000).toFixed(2)}s)` : "";

    console.log(`${icon} ${name} - ${status} ${duration}`);

    if (suite.reason) {
      console.log(`    Reason: ${suite.reason}`);
    }
  });

  // Calculate statistics
  const passed = results.suites.filter((s) => s.status === "passed").length;
  const failed = results.suites.filter((s) => s.status === "failed").length;
  const skipped = results.suites.filter((s) => s.status === "skipped").length;

  console.log("\nStatistics:");
  console.log("-".repeat(40));
  console.log(`Total Suites: ${results.suites.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Total Duration: ${(totalDuration / 1000).toFixed(2)}s`);

  // Overall assessment
  console.log("\n" + "=".repeat(60));
  console.log("OVERALL ASSESSMENT");
  console.log("=".repeat(60));

  const requiredSuites = testSuites.filter((s) => s.required);
  const requiredPassed = results.suites.filter((s) => {
    const suite = requiredSuites.find((rs) => rs.name === s.name);
    return suite && s.status === "passed";
  }).length;

  if (requiredPassed === requiredSuites.length) {
    console.log("\n✅ ALL REQUIRED TESTS PASSED!");
    console.log("The Lab 02 implementation meets all requirements.");
  } else if (requiredPassed >= requiredSuites.length * 0.5) {
    console.log("\n⚠️ PARTIAL SUCCESS");
    console.log("Some required tests failed. Review the output above for details.");
  } else {
    console.log("\n❌ TESTS FAILED");
    console.log("Multiple required test suites failed. The implementation needs work.");
  }

  // Save summary to file
  const reportFile = "test_summary_report.json";
  fs.writeFileSync(
    reportFile,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        duration: totalDuration,
        suites: results.suites,
        statistics: {
          total: results.suites.length,
          passed,
          failed,
          skipped,
        },
      },
      null,
      2
    )
  );

  console.log(`\n✓ Test summary saved to ${reportFile}`);

  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

/**
 * Main execution
 */
async function runAllTests() {
  console.log("Lab 02 - Comprehensive Test Suite");
  console.log("=".repeat(60));
  console.log(`Starting at: ${results.startTime.toISOString()}`);
  console.log(`Running ${testSuites.length} test suites...`);

  // Check for command line arguments
  const args = process.argv.slice(2);
  const quickMode = args.includes("--quick");
  const skipBenchmarks = args.includes("--skip-benchmarks");

  if (quickMode) {
    console.log("\n⚡ Quick mode: Running only required tests");
  }
  if (skipBenchmarks) {
    console.log("⏭️ Skipping performance benchmarks");
  }

  // Filter suites based on mode
  let suitesToRun = testSuites;
  if (quickMode) {
    suitesToRun = testSuites.filter((s) => s.required);
  }
  if (skipBenchmarks) {
    suitesToRun = suitesToRun.filter((s) => s.name !== "Performance Benchmarks");
  }

  // Run test suites sequentially
  for (const suite of suitesToRun) {
    try {
      const result = await runTestSuite(suite);
      results.suites.push(result);

      // Stop if a required test fails (optional)
      if (suite.required && result.status === "failed" && !args.includes("--continue")) {
        console.log("\n⚠️ Required test failed. Stopping execution.");
        console.log("Use --continue flag to run all tests even if some fail.");
        break;
      }
    } catch (error) {
      console.error(`\nFatal error running ${suite.name}:`, error);
      results.suites.push({
        name: suite.name,
        status: "error",
        error: error.message,
      });

      if (suite.required && !args.includes("--continue")) {
        break;
      }
    }
  }

  // Generate final report
  generateFinalReport();
}

/**
 * Show help message
 */
function showHelp() {
  console.log(`
Lab 02 - Comprehensive Test Runner

Usage: node run_all_tests.js [options]

Options:
  --quick           Run only required test suites
  --skip-benchmarks Skip performance benchmark tests
  --continue        Continue running tests even if required tests fail
  --help            Show this help message

Examples:
  node run_all_tests.js                    # Run all tests
  node run_all_tests.js --quick            # Run only required tests
  node run_all_tests.js --skip-benchmarks  # Skip performance tests
  node run_all_tests.js --continue         # Don't stop on failures
`);
  process.exit(0);
}

// Check for help flag
if (process.argv.includes("--help")) {
  showHelp();
}

// Run all tests
runAllTests().catch((error) => {
  console.error("\nFatal error:", error);
  process.exit(1);
});
