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
// Criamos uma coleção de estatísticas por bairro para análise rápida
db.porto_listings.aggregate([
  {
    $group: {
      _id: "$neighbourhood",
      total_listings: { $sum: 1 }
    }
  },
  { $project: { neighborhood: "$_id", total_listings: 1, _id: 0 } },
  { $out: "neighborhood_stats" }
]);