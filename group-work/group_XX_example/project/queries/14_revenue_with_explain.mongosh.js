// Aggregation performance helper: print revenue results and execution stats.
// Usage: mongosh queries/14_revenue_with_explain.mongosh.js

db = db.getSiblingDB("group_xx_example_final");
print("Revenue pipeline plus execution stats:");

// Use the same pipeline from the main demo so comparisons stay apples-to-apples.
const pipeline = [
  {
    $group: {
      _id: { eventCode: "$eventCode", vendorId: "$vendorId" },
      revenue: { $sum: "$totalAmount" },
      orders: { $sum: 1 },
    },
  },
  { $sort: { revenue: -1 } },
];

// Display the business output first (what you'd present to stakeholders).
db.orders.aggregate(pipeline).forEach((doc) => printjson(doc));

// Immediately re-run the identical pipeline under explain() to prove the plan.
const explain = db.orders.explain("executionStats").aggregate(pipeline);
let stats = explain.executionStats;
if (!stats && Array.isArray(explain.stages)) {
  const cursorStage = explain.stages.find((stage) => stage.$cursor && stage.$cursor.executionStats);
  if (cursorStage) {
    stats = cursorStage.$cursor.executionStats;
  }
}

print("\nExecution stats summary:");
if (stats) {
  print(`  Execution time (ms): ${stats.executionTimeMillis}`);
  print(`  Documents examined: ${stats.totalDocsExamined}`);
  print(`  Keys examined: ${stats.totalKeysExamined}`);
  print(`  Stage: ${stats.executionStages ? stats.executionStages.stage : "n/a"}`);
} else {
  print("  Unable to retrieve execution stats on this server version.");
}
