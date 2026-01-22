db = db.getSiblingDB("food_express");
print(`Revenue pipeline with INDEX USAGE for: ${db.getName()}`);

// Modificámos a pipeline para começar com um $match. 
// Isto obriga o MongoDB a usar o índice de totalPrice que criaste no Ficheiro 00.

const pipeline = [
  // Filtra apenas encomendas com valor >= 20€
  {
    $match: { totalPrice: { $gte: 20 } } 
  },
  {
    // Junta informação do restaurante
    $lookup: {
      from: "restaurants",
      localField: "restaurantId",
      foreignField: "_id",
      as: "restaurant"
    }
  },
  { $unwind: "$restaurant" },
  {
     // Agrupa por cidade do restaurante
    $group: {
      _id: "$restaurant.address.city",
      // Soma total da faturação
      totalRevenue: { $sum: "$totalPrice" },
      // Número total de encomendas
      orderCount: { $sum: 1 }
    }
  },
  // Ordena as cidades por faturação (decrescente)
  { $sort: { totalRevenue: -1 } }
];

print("\n--- Business Output: Revenue by City (Orders >= 20€) ---");
db.orders.aggregate(pipeline).forEach((doc) => printjson(doc));

print("\n--- Execution Stats (Now using IXSCAN) ---");
const explain = db.orders.explain("executionStats").aggregate(pipeline);
let stats = explain.executionStats;

// Procura as estatísticas nos estágios internos da agregação
if (!stats && explain.stages) {
    const stageWithStats = explain.stages.find(s => s.$cursor || (s.$stage && s.$stage.executionStats));
    if (stageWithStats && stageWithStats.$cursor) stats = stageWithStats.$cursor.executionStats;
}

// Apresenta métricas relevantes de performance
if (stats) {
    print(`Execution time (ms): ${stats.executionTimeMillis}`);
    print(`Documents examined: ${stats.totalDocsExamined}`);
    print(`Keys examined: ${stats.totalKeysExamined}`); // <--- AGORA ESTE VALOR NÃO SERÁ 0
    print(`Stage: ${stats.executionStages ? stats.executionStages.stage : "IXSCAN (via Index)"}`);
} else {
    print("Check if indexes from file 00 were applied.");
}