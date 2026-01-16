// Quick collection stats helper to gauge aggregation performance inputs.
// Usage: mongosh queries/15_orders_collection_stats.mongosh.js

db = db.getSiblingDB("group_xx_example_final");
print("orders collection stats:");

// Pull raw collection stats so everyone sees the dataset footprint.
const stats = db.orders.stats();

// Call out the key metrics you should mention when discussing performance.
print(`  Namespace: ${stats.ns}`);
print(`  Documents: ${stats.count}`);
print(`  Avg doc size (bytes): ${stats.avgObjSize}`);
print(`  Data size (MB): ${(stats.size / (1024 * 1024)).toFixed(2)}`);
print(`  Storage size (MB): ${(stats.storageSize / (1024 * 1024)).toFixed(2)}`);
print(`  Total indexes: ${stats.nindexes}`);

// Report index sizes to spark conversations about memory trade-offs.
Object.keys(stats.indexSizes).forEach((name) => {
  const sizeMB = (stats.indexSizes[name] / (1024 * 1024)).toFixed(2);
  print(`    - ${name}: ${sizeMB} MB`);
});
