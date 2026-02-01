//Estatisticas sobre a coleção film
// Usage: mongosh queries/17_film_stats.mongosh.js
db = db.getSiblingDB("sakila");

const stats = db.film.stats(); //obter estatísticas da coleção

print(`  Namespace: ${stats.ns}`); //nome da coleção
print(`  Documents: ${stats.count}`); //numero de documentos
print(`  Avg doc size (bytes): ${stats.avgObjSize}`); //tamanho médio do documento
print(`  Data size (MB): ${(stats.size / (1024 * 1024)).toFixed(2)}`); //tamanho dos dados em MB
print(`  Storage size (MB): ${(stats.storageSize / (1024 * 1024)).toFixed(2)}`); //tamanho físico em MB
print(`  Total indexes: ${stats.nindexes}`); //numero total de índices

Object.keys(stats.indexSizes).forEach((name) => {
  const sizeMB = (stats.indexSizes[name] / (1024 * 1024)).toFixed(2);
  print(`    - ${name}: ${sizeMB} MB`); //tamanho de cada índice
});
