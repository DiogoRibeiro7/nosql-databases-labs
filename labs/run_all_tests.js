#!/usr/bin/env node

/**
 * Comprehensive Test Runner for All MongoDB Labs
 *
 * Runs tests and exercises for all labs with detailed reporting
 */

const { MongoClient } = require("mongodb");
const fs = require("fs").promises;
const path = require("path");

class LabTestRunner {
  constructor() {
    this.connectionUrl = process.env.MONGODB_URI || "mongodb://localhost:27017";
    this.results = {
      labs: [],
      summary: {
        totalLabs: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
      },
      timestamp: new Date().toISOString(),
    };
  }

  async checkPrerequisites() {
    console.log("Checking prerequisites...\n");

    // Check MongoDB connection
    const client = new MongoClient(this.connectionUrl);
    try {
      await client.connect();
      const adminDb = client.db().admin();
      const serverInfo = await adminDb.serverInfo();
      console.log(`✅ MongoDB ${serverInfo.version} connected`);

      // Check version requirements
      const majorVersion = parseInt(serverInfo.version.split(".")[0]);
      if (majorVersion < 4) {
        console.warn("⚠️  Some features require MongoDB 4.0+");
      }
      if (majorVersion < 5) {
        console.warn("⚠️  Time-series collections require MongoDB 5.0+");
      }
      if (majorVersion < 6) {
        console.warn("⚠️  Vector search requires MongoDB 6.0+");
      }

      return true;
    } catch (error) {
      console.error("❌ MongoDB connection failed:", error.message);
      return false;
    } finally {
      await client.close();
    }
  }

  async runLab(labNumber, labName, exercises) {
    console.log(`\n${"=".repeat(70)}`);
    console.log(`Lab ${labNumber}: ${labName}`);
    console.log("=".repeat(70));

    const labStart = Date.now();
    const labResult = {
      lab: `Lab ${labNumber}`,
      name: labName,
      exercises: [],
      status: "passed",
      duration: 0,
    };

    for (const exercise of exercises) {
      const exerciseStart = Date.now();
      try {
        console.log(`\n▶ ${exercise.name}`);

        // Check if exercise file exists
        const exercisePath = path.join(__dirname, exercise.path);
        await fs.access(exercisePath);

        // Run exercise
        if (exercise.type === "test") {
          // Run test file
          const TestClass = require(exercisePath);
          const test = new TestClass();
          if (test.run) {
            await test.run();
          }
        } else {
          // Run exercise file
          const ExerciseClass = require(exercisePath);
          const exerciseInstance = new ExerciseClass();

          if (exerciseInstance.connect) {
            await exerciseInstance.connect();
          }

          // Run main methods
          const methods = Object.getOwnPropertyNames(
            Object.getPrototypeOf(exerciseInstance)
          ).filter((m) => m !== "constructor" && m !== "connect" && m !== "cleanup");

          for (const method of methods.slice(0, exercise.limit || 2)) {
            if (typeof exerciseInstance[method] === "function") {
              await exerciseInstance[method]();
            }
          }

          if (exerciseInstance.cleanup) {
            await exerciseInstance.cleanup();
          }
        }

        const duration = Date.now() - exerciseStart;
        labResult.exercises.push({
          name: exercise.name,
          status: "passed",
          duration,
        });
        console.log(`  ✅ Completed (${duration}ms)`);
      } catch (error) {
        const duration = Date.now() - exerciseStart;
        labResult.exercises.push({
          name: exercise.name,
          status: "failed",
          error: error.message,
          duration,
        });
        labResult.status = "failed";
        console.log(`  ❌ Failed: ${error.message}`);
      }
    }

    labResult.duration = Date.now() - labStart;
    this.results.labs.push(labResult);

    // Update summary
    this.results.summary.totalLabs++;
    if (labResult.status === "passed") {
      this.results.summary.passed++;
    } else {
      this.results.summary.failed++;
    }

    console.log(
      `\nLab ${labNumber} Result: ${labResult.status.toUpperCase()} (${labResult.duration}ms)`
    );
  }

  async runAllLabs() {
    console.log("MongoDB NoSQL Labs - Comprehensive Test Suite");
    console.log("==============================================\n");

    // Check prerequisites
    const ready = await this.checkPrerequisites();
    if (!ready) {
      console.error("\n❌ Prerequisites check failed. Exiting.");
      process.exit(1);
    }

    // Define all labs and their exercises
    const labs = [
      {
        number: "01",
        name: "Introduction to MongoDB",
        exercises: [
          { name: "Basic Operations Test", path: "lab01_intro/test_lab01.js", type: "test" },
          {
            name: "Advanced Exercises",
            path: "lab01_intro/advanced_exercises.js",
            type: "exercise",
          },
        ],
      },
      {
        number: "02",
        name: "Data Modeling",
        exercises: [
          {
            name: "Performance Benchmarks",
            path: "lab02_modeling/performance_benchmarks.js",
            type: "exercise",
          },
          {
            name: "Data Integrity Validator",
            path: "lab02_modeling/data_integrity_validator.js",
            type: "exercise",
          },
          {
            name: "Advanced Modeling",
            path: "lab02_modeling/advanced_exercises.js",
            type: "exercise",
            limit: 3,
          },
        ],
      },
      {
        number: "03",
        name: "Queries",
        exercises: [
          { name: "Query Exercises", path: "lab03_queries/solutions.js", type: "exercise" },
        ],
      },
      {
        number: "04",
        name: "Aggregation",
        exercises: [
          {
            name: "Aggregation Exercises",
            path: "lab04_aggregation/solutions.js",
            type: "exercise",
          },
        ],
      },
      {
        number: "05",
        name: "Replication & Indexes",
        exercises: [
          {
            name: "Replication Setup",
            path: "lab05_replication/replica_set_setup.js",
            type: "exercise",
          },
        ],
      },
      {
        number: "Modern",
        name: "Modern Features",
        exercises: [
          {
            name: "Change Streams",
            path: "lab_modern_features/exercises/01_change_streams/solution.js",
            type: "exercise",
            limit: 2,
          },
          {
            name: "Time-Series",
            path: "lab_modern_features/exercises/02_timeseries_collections/solution.js",
            type: "exercise",
            limit: 2,
          },
          {
            name: "Vector Search",
            path: "lab_modern_features/exercises/04_vector_search/solution.js",
            type: "exercise",
            limit: 2,
          },
        ],
      },
    ];

    // Run each lab
    for (const lab of labs) {
      try {
        await this.runLab(lab.number, lab.name, lab.exercises);
      } catch (error) {
        console.error(`Lab ${lab.number} error:`, error);
      }
    }

    // Generate final report
    this.generateReport();
  }

  generateReport() {
    console.log("\n" + "=".repeat(70));
    console.log("FINAL TEST REPORT");
    console.log("=".repeat(70));

    console.log("\nSummary:");
    console.log(`  Total Labs: ${this.results.summary.totalLabs}`);
    console.log(`  ✅ Passed: ${this.results.summary.passed}`);
    console.log(`  ❌ Failed: ${this.results.summary.failed}`);
    console.log(`  ⚠️ Skipped: ${this.results.summary.skipped}`);

    const successRate = (
      (this.results.summary.passed / this.results.summary.totalLabs) *
      100
    ).toFixed(1);
    console.log(`  Success Rate: ${successRate}%`);

    console.log("\nDetailed Results:");
    this.results.labs.forEach((lab) => {
      const icon = lab.status === "passed" ? "✅" : "❌";
      console.log(`\n${icon} ${lab.lab}: ${lab.name}`);
      console.log(`   Duration: ${lab.duration}ms`);
      console.log("   Exercises:");

      lab.exercises.forEach((exercise) => {
        const exIcon = exercise.status === "passed" ? "✓" : "✗";
        console.log(`     ${exIcon} ${exercise.name} (${exercise.duration}ms)`);
        if (exercise.error) {
          console.log(`       Error: ${exercise.error}`);
        }
      });
    });

    // Performance metrics
    console.log("\n" + "=".repeat(70));
    console.log("PERFORMANCE METRICS");
    console.log("=".repeat(70));

    const totalDuration = this.results.labs.reduce((sum, lab) => sum + lab.duration, 0);
    console.log(`\nTotal Test Duration: ${(totalDuration / 1000).toFixed(2)} seconds`);

    const slowestLab = this.results.labs.reduce((max, lab) =>
      lab.duration > max.duration ? lab : max
    );
    console.log(`Slowest Lab: ${slowestLab.lab} (${slowestLab.duration}ms)`);

    // Save report to file
    this.saveReport();
  }

  async saveReport() {
    const reportPath = path.join(__dirname, "test_report.json");
    try {
      await fs.writeFile(reportPath, JSON.stringify(this.results, null, 2));
      console.log(`\nReport saved to: ${reportPath}`);
    } catch (error) {
      console.error("Failed to save report:", error);
    }
  }
}

// Main execution
async function main() {
  const runner = new LabTestRunner();

  try {
    await runner.runAllLabs();
    process.exit(runner.results.summary.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = LabTestRunner;
