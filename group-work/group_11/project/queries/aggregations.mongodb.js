use('travel_booking'); 

// --- 1. CRIAÇÃO DE ÍNDICES (Otimização conforme requisito 6.2) --- 
// Devem ser criados para melhorar a performance das queries 
db.porto_listings.createIndex({ neighbourhood: 1, room_type: 1 });
db.porto_listings.createIndex({ price: 1 });
db.porto_listings.createIndex({ neighbourhood: 1, beds: 1, review_scores_rating: -1 });

// --- 2. PIPELINES DE AGREGAÇÃO ---

// Q1: Preço Médio por Bairro
// Resolve problemas de tipos de dados convertendo string para número [cite: 298]
db.porto_listings.aggregate([
  {
    $project: {
      neighbourhood: 1,
      price_clean: { 
        $ltrim: { 
          input: { $ifNull: ["$price", "€0"] }, 
          chars: "€" 
        } 
      }
    }
  },
  {
    $project: {
      neighbourhood: 1,
      price_numeric: { $convert: { input: "$price_clean", to: "double", onError: 0 } }
    }
  },
  {
    $group: {
      _id: "$neighbourhood",
      avgPrice: { $avg: "$price_numeric" },
      totalListings: { $sum: 1 }
    }
  },
  { $sort: { avgPrice: -1 } }
]);

// Q4: Interconexão de Dados (Requirement: Referenced Collections)
// Cruzamos a coleção porto_listings com a coleção hosts
print("--- Q4: Detalhes do Alojamento e do Anfitrião (Join) ---");
db.porto_listings.aggregate([
  { 
    $match: { 
      neighbourhood: "Ribeira",
      review_scores_rating: { $gte: 90 } // Ajustado para a escala do teu JSON
    } 
  },
  {
    $lookup: {
      from: "hosts",         // Coleção de destino
      localField: "host_id", // Campo na porto_listings
      foreignField: "id",    // Campo na hosts
      as: "host_details"     // Nome do array de saída
    }
  },
  {
    $project: {
      name: 1,
      price: 1,
      "host_details.name": 1,
      _id: 0
    }
  },
  { $limit: 5 }
]).forEach(printjson);

// --- SECÇÃO DE PERFORMANCE ---
print("\n--- ANÁLISE TÉCNICA DE PERFORMANCE (Explain) ---");
const performancePipeline = [
  { $match: { neighbourhood: "Ribeira" } },
  { $group: { _id: "$room_type", count: { $sum: 1 } } }
];

const explainResult = db.porto_listings.explain("executionStats").aggregate(performancePipeline);
printjson(explainResult.executionStats);