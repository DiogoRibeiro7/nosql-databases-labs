// Query 18: Collection Statistics
// Analysis of size and performance of collections
// Usage: mongosh queries/18_collection_stats.mongosh.js

db = db.getSiblingDB("group_04_airbnb");

print("\n=== Collection Statistics ===\n");

const collections = ["listings", "hosts", "bookings"];

collections.forEach((collName) => {
  const stats = db[collName].stats();

  print(`\n${collName.toUpperCase()}:`);
  printjson({
    namespace: stats.ns,
    documents: stats.count,
    avgDocSize: stats.avgObjSize,
    dataSizeMB: (stats.size / (1024 * 1024)).toFixed(4),
    storageSizeMB: (stats.storageSize / (1024 * 1024)).toFixed(4),
    totalIndexes: stats.nindexes,
  });

  // Show indexes for each collection
  print(`  Indexes on ${collName}:`);
  db[collName].getIndexes().forEach((idx) => {
    print(`    - ${idx.name}: ${JSON.stringify(idx.key)}`);
  });
});

// Overall database stats
print("\n=== Database Statistics ===\n");
const dbStats = db.stats();
printjson({
  database: dbStats.db,
  collections: dbStats.collections,
  objects: dbStats.objects,
  avgObjSize: dbStats.avgObjSize,
  dataSizeMB: (dbStats.dataSize / (1024 * 1024)).toFixed(4),
  storageSizeMB: (dbStats.storageSize / (1024 * 1024)).toFixed(4),
  indexes: dbStats.indexes,
  indexSizeMB: (dbStats.indexSize / (1024 * 1024)).toFixed(4),
});

print("\n✓ Query executed successfully\n");
