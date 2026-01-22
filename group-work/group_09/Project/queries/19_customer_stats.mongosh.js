//Estatisticas sobre a coleção film
// Usage: mongosh queries/19_customer_stats.mongosh.js
db = db.getSiblingDB("sakila");

const stats = db.customer.stats();

print(`  Namespace: ${stats.ns}`);
print(`  Documents: ${stats.count}`);
print(`  Avg doc size (bytes): ${stats.avgObjSize}`);
print(`  Data size (MB): ${(stats.size / (1024 * 1024)).toFixed(2)}`);
print(`  Storage size (MB): ${(stats.storageSize / (1024 * 1024)).toFixed(2)}`);
print(`  Total indexes: ${stats.nindexes}`);

Object.keys(stats.indexSizes).forEach((name) => {
  const sizeMB = (stats.indexSizes[name] / (1024 * 1024)).toFixed(2);
  print(`    - ${name}: ${sizeMB} MB`);
});
