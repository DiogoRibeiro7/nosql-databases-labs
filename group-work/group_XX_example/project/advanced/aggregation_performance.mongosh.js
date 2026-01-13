// Aggregation Performance Tuning Demo
// Usage: mongosh advanced/aggregation_performance.mongosh.js

db = db.getSiblingDB("group_xx_example_final");

const compoundKey = { eventCode: 1, vendorId: 1, createdAt: 1 };
const pipeline = [
  // Focus on the high-level revenue pipeline students already know.
  {
    $match: {
      createdAt: { $gte: ISODate("2025-07-01T00:00:00Z") },
    },
  },
  {
    $group: {
      _id: { event: "$eventCode", vendor: "$vendorId" },
      revenue: { $sum: "$totalAmount" },
      avgWait: { $avg: "$waitTimeMinutes" },
      orders: { $sum: 1 },
    },
  },
  { $sort: { revenue: -1 } },
];

function getExecutionStats(explainResult) {
  if (explainResult && explainResult.executionStats) {
    return explainResult.executionStats;
  }
  if (explainResult && Array.isArray(explainResult.stages)) {
    const cursorStage = explainResult.stages.find((stage) => stage.$cursor && stage.$cursor.executionStats);
    if (cursorStage) {
      return cursorStage.$cursor.executionStats;
    }
  }
  return null;
}

function findCompoundIndex() {
  return db.orders
    .getIndexes()
    .find((idx) => idx.key && idx.key.eventCode === 1 && idx.key.vendorId === 1 && idx.key.createdAt === 1);
}

function printStats(label, stats) {
  print(`\n[${label}]`);
  if (!stats) {
    print("  Unable to read execution stats (check server version).");
    return;
  }
  print(`  Execution time (ms): ${stats.executionTimeMillis}`);
  print(`  Docs examined: ${stats.totalDocsExamined}`);
  print(`  Keys examined: ${stats.totalKeysExamined}`);
}

print("Analyzing revenue aggregation with and without the compound index...");

const existingIndex = findCompoundIndex();
if (existingIndex) {
  db.orders.dropIndex(existingIndex.name);
}

const withoutExplain = db.orders.explain("executionStats").aggregate(pipeline);
printStats("without index", getExecutionStats(withoutExplain));

db.orders.createIndex(compoundKey, { name: existingIndex ? existingIndex.name : "event_vendor_createdAt" });

const withExplain = db.orders.explain("executionStats").aggregate(pipeline);
printStats("with index", getExecutionStats(withExplain));

print("\nTip: Pair explain output with the `performance.md` notes to discuss why indexes matter.");
