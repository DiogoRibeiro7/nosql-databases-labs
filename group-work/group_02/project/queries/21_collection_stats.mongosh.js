// Query 21: Estatísticas das Collections
// Análise de tamanho e performance das collections
// Usage: mongosh queries/21_collection_stats.mongosh.js

db = db.getSiblingDB("sakila_mongodb");

print("\n=== Estatísticas das Collections ===\n");

const collections = ["films", "customers", "rentals", "inventory", "stores"];

collections.forEach((collName) => {
  const stats = db[collName].stats();
  
  print(`\n${collName.toUpperCase()}:`);
  printjson({
    namespace: stats.ns,
    documents: stats.count,
    avgDocSize: stats.avgObjSize,
    dataSizeMB: (stats.size / (1024 * 1024)).toFixed(2),
    storageSizeMB: (stats.storageSize / (1024 * 1024)).toFixed(2),
    totalIndexes: stats.nindexes
  });
});

print("\n✓ Query executada com sucesso\n");
