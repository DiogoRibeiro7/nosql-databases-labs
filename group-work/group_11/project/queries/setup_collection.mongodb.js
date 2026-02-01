use('travel_booking');

// --- 1. COLEÇÃO 'hosts' ---
// Extraímos os dados dos anfitriões para uma coleção à parte
db.porto_listings.aggregate([
  {
    $group: {
      _id: "$host_id",
      host_name: { $first: "$host_name" }
    }
  },
  { $project: { id: "$_id", name: "$host_name", _id: 0 } },
  { $out: "hosts" }
]);

// --- 2. COLEÇÃO 'neighborhood_stats' ---
// Criamos uma coleção de estatísticas por bairro (contagem, preço médio, rating médio, etc.) para análise rápida
db.porto_listings.aggregate([
 {
    $group: {
      _id: "$neighbourhood",
      total_listings: { $sum: 1 },
      avg_price: { $avg: "$price" },
      min_price: { $min: "$price" },
      max_price: { $max: "$price" },
      avg_rating: { $avg: "$review_scores_rating" }
    }
  },
  {
    $project: {
      neighborhood: "$_id",
      total_listings: 1,
      avg_price: 1,
      min_price: 1,
      max_price: 1,
      avg_rating: 1,
      _id: 0
    }
  },
])