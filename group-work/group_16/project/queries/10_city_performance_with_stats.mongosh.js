db = db.getSiblingDB("food_express");

const pipeline = [
  { $match: { totalPrice: { $gte: 20 } } },
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

// --- 1. MOSTRAR OS RESULTADOS DE NEGÓCIO ---
print("\n--- Business Output: Revenue by City (Orders >= 20€) ---");
// Isto vai imprimir a lista de cidades e valores
db.orders.aggregate(pipeline).forEach((doc) => printjson(doc));

// --- 2. MOSTRAR A EXPLICAÇÃO TÉCNICA (O plano de execução) ---
print("\n--- Performance Verification ---");
const explain = db.orders.explain("executionStats").aggregate(pipeline);

if (explain.stages && explain.stages[0] && explain.stages[0].$cursor) {
    let plano = explain.stages[0].$cursor.queryPlanner.winningPlan;
    
    // Navegamos pelos níveis do plano para encontrar o IXSCAN ou COLLSCAN
    print("Estágio de Saída: " + plano.stage); 
    
    if (plano.inputStage) {
        print("Estágio de Recuperação: " + plano.inputStage.stage);
        
      
        if (plano.inputStage.inputStage) {
            print("Estágio de Pesquisa: " + plano.inputStage.inputStage.stage);
        }
    }
} else {
    print("Não foi possível extrair os detalhes do plano.");
}