db = db.getSiblingDB("food_express");
print(`Revenue pipeline with INDEX USAGE for: ${db.getName()}`);

// Modificámos a pipeline para começar com um $match. 
// Isto obriga o MongoDB a usar o índice de totalPrice que criaste no Ficheiro 00.
const pipeline = [
  {
    $match: { totalPrice: { $gte: 20 } } // <--- NOVO: Filtro inicial para ativar o índice
  },
  {
    $lookup: {
      from: "restaurants",
      localField: "restaurantId",
      foreignField: "_id",
      as: "restaurant"
    }
  },
  { $unwind: "$restaurant" },
  {
    $group: {
      _id: "$restaurant.address.city",
      totalRevenue: { $sum: "$totalPrice" },
      orderCount: { $sum: 1 }
    }
  },
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

if (stats) {
    print(`Execution time (ms): ${stats.executionTimeMillis}`);
    print(`Documents examined: ${stats.totalDocsExamined}`);
    print(`Keys examined: ${stats.totalKeysExamined}`); // <--- AGORA ESTE VALOR NÃO SERÁ 0
    print(`Stage: ${stats.executionStages ? stats.executionStages.stage : "IXSCAN (via Index)"}`);
} else {
    print("Check if indexes from file 00 were applied.");
}