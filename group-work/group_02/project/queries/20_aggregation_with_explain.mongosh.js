// Query 20: Pipeline de Agregação com Explain
// Demonstra análise de performance de queries
// Usage: mongosh queries/20_aggregation_with_explain.mongosh.js

db = db.getSiblingDB("sakila_mongodb");

print("\n=== Agregação com Estatísticas de Execução ===\n");

const pipeline = [
  {
    $group: {
      _id: { store_id: "$store_id", category: "$film.category" },
      revenue: { $sum: "$payment.amount" },
      rentals: { $sum: 1 }
    }
  },
  { $sort: { revenue: -1 } },
  { $limit: 10 }
];

print("Resultados da agregação:");
db.rentals.aggregate(pipeline).forEach((doc) => printjson(doc));

// Executar com explain para estatísticas
const explain = db.rentals.explain("executionStats").aggregate(pipeline);

let stats = explain.executionStats;
if (!stats && Array.isArray(explain.stages)) { //fallback para oc aso de as estatísticas não estare, ma raiz do explain
  const cursorStage = explain.stages.find((stage) => stage.$cursor && stage.$cursor.executionStats);
  if (cursorStage) {
    stats = cursorStage.$cursor.executionStats;
  }
}

print("\nEstatísticas de execução:");
if (stats) {
  print(`  Tempo de execução (ms): ${stats.executionTimeMillis}`);
  print(`  Documentos examinados: ${stats.totalDocsExamined}`);
  print(`  Chaves examinadas: ${stats.totalKeysExamined}`);
} else {
  print("  Estatísticas não disponíveis nesta versão.");
}

print("\n✓ Query executada com sucesso\n");
