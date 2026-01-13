#!/usr/bin/env node

/**
 * Orchestrates lab test suites (Labs 01–05)
 * Usage:
 *   node scripts/run_lab_tests.js
 *   node scripts/run_lab_tests.js --lab=lab03
 */

const { spawnSync } = require("child_process");
const { MongoClient } = require("mongodb");
const path = require("path");

const isWindows = process.platform === "win32";
const projectRoot = path.resolve(__dirname, "..");

const labs = [
  {
    id: "lab01",
    name: "Lab 01 – Introduction",
    steps: [
      { title: "Import sample dataset", cmd: "node", args: ["labs/lab01_intro/import_data.js"] },
      { title: "Run test suite", cmd: "node", args: ["labs/lab01_intro/test_lab01.js"] },
    ],
  },
  {
    id: "lab02",
    name: "Lab 02 – Data Modeling",
    steps: [
      {
        title: "Import modeling fixtures",
        cmd: "node",
        args: ["labs/lab02_modeling/import_data.js"],
      },
      { title: "Run modeling tests", cmd: "node", args: ["labs/lab02_modeling/run_all_tests.js"] },
    ],
  },
  {
    id: "lab03",
    name: "Lab 03 – Advanced Queries",
    steps: [
      { title: "Import movie dataset", cmd: "node", args: ["labs/lab03_queries/import_data.js"] },
      {
        title: "Run data integrity tests",
        cmd: "node",
        args: ["labs/lab03_queries/test_data_integrity.js"],
      },
    ],
  },
  {
    id: "lab04",
    name: "Lab 04 – Aggregation Pipeline",
    steps: [
      {
        title: "Import sales dataset",
        cmd: "node",
        args: ["labs/lab04_aggregation/import_data.js"],
      },
      {
        title: "Run aggregation tests",
        cmd: "node",
        args: ["labs/lab04_aggregation/test_lab04.js"],
      },
    ],
  },
  {
    id: "lab05",
    name: "Lab 05 – Replication",
    steps: [
      {
        title: "Run replication checks",
        cmd: "node",
        args: ["labs/lab05_replication/test_replication.js"],
        skipMessage:
          "Replica set not detected (skipping). Run node labs/lab05_replication/setup_replica_set.js first.",
      },
    ],
  },
];

async function ensureMongoConnection(
  uri,
  clientFactory = (mongoUri) => new MongoClient(mongoUri, { serverSelectionTimeoutMS: 2000 })
) {
  const client = clientFactory(uri);
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    return true;
  } catch {
    return false;
  } finally {
    if (client && typeof client.close === "function") {
      await client.close().catch(() => {});
    }
  }
}

function runCommand(step, { spawn = spawnSync } = {}) {
  const commandString = `${step.cmd} ${step.args.join(" ")}`;
  console.log(`\n→ ${step.title}`);
  console.log(`   ${commandString}`);

  const result = spawn(step.cmd, step.args, {
    cwd: projectRoot,
    stdio: "inherit",
    shell: isWindows,
    env: process.env,
  });

  if (result.status !== 0) {
    if (step.skipMessage) {
      console.warn(`⚠ ${step.skipMessage}`);
      return { skipped: true, status: 0 };
    }
    console.error(`✗ Step failed with exit code ${result.status}`);
  } else {
    console.log("✓ Completed");
  }

  return { skipped: false, status: result.status };
}

function parseArgs(argv = process.argv.slice(2)) {
  const args = argv;
  const params = {};

  args.forEach((arg) => {
    const [key, value] = arg.split("=");
    if (key === "--lab") {
      params.lab = value?.toLowerCase();
    }
  });

  return params;
}

async function main() {
  const { lab } = parseArgs();
  const selectedLabs = lab
    ? labs.filter((item) => item.id === lab || item.id === `${lab}_intro`)
    : labs;

  if (selectedLabs.length === 0) {
    console.error(
      `Unknown lab identifier "${lab}". Valid ids: ${labs.map((l) => l.id).join(", ")}`
    );
    process.exit(1);
  }

  const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017";
  const mongoAvailable = await ensureMongoConnection(mongoUri);

  if (!mongoAvailable && selectedLabs.length > 0) {
    console.error("\n⚠ Unable to reach MongoDB at", mongoUri);
    console.error("   • Ensure mongod is running locally or update MONGODB_URI");
    console.error("   • For Docker users, start the MongoDB container/compose stack\n");
    process.exit(1);
  }

  let failures = 0;

  for (const labConfig of selectedLabs) {
    console.log("\n" + "=".repeat(60));
    console.log(`${labConfig.name}`);
    console.log("=".repeat(60));

    for (const step of labConfig.steps) {
      const result = runCommand(step);
      if (!result.skipped && result.status !== 0) {
        failures++;
        break;
      }
    }
  }

  console.log("\n" + "=".repeat(60));
  if (failures === 0) {
    console.log("All selected lab tests completed successfully.");
    process.exit(0);
  } else {
    console.error(`${failures} step(s) failed. See logs above for details.`);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error("Unexpected test runner error:", error);
    process.exit(1);
  });
}

module.exports = {
  labs,
  ensureMongoConnection,
  runCommand,
  parseArgs,
  main,
};
