use('travel_booking'); // [cite: 497]

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

// Q4: Interconexão de Dados (Requisito: 3+ coleções)
// Cruza Listings com as coleções Hosts e Reviews 
db.porto_listings.aggregate([
  { 
    $match: { 
      neighbourhood: "Ribeira",
      review_scores_rating: { $gte: 4.0 } 
    } 
  },
  {
    $lookup: {
      from: "hosts",
      localField: "host_id", 
      foreignField: "id",    
      as: "host_details"
    }
  },
  {
    $lookup: {
      from: "reviews",
      localField: "id",
      foreignField: "listing_id",
      as: "customer_reviews"
    }
  },
  {
    $project: {
      name: 1,
      price: 1,
      host_info: { $arrayElemAt: ["$host_details", 0] },
      top_reviews: { $slice: ["$customer_reviews", 3] }
    }
  },
  { $limit: 10 } 
]);

// --- 3. SECÇÃO DE PERFORMANCE (O exemplo do professor) ---
// Aqui escolhemos UMA query para provar a performance com o explain

print("\n--- ANÁLISE TÉCNICA DE PERFORMANCE (Explain) ---");

const myPipeline = [
  { $match: { neighbourhood: "Ribeira" } },
  { $group: { _id: "$room_type", count: { $sum: 1 } } }
];

// Mostra o resultado da análise de performance
const explain = db.porto_listings.explain("executionStats").aggregate(myPipeline);
printjson(explain.executionStats);