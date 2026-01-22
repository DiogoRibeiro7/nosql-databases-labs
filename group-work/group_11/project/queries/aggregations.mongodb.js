use('travel_booking');

// Q1: Preço Médio por Bairro 
db.porto_listings.aggregate([
  {
    $project: {
      neighbourhood: 1,
      // Remove o símbolo € do início, independentemente dos bytes
      price_clean: { 
        $ltrim: { 
          input: "$price", 
          chars: "€" 
        } 
      }
    }
  },
  {
    $project: {
      neighbourhood: 1,
      // Agora converte o texto limpo para número
      price_numeric: { $toInt: "$price_clean" }
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

// Top 5 Alojamentos com Maior Receita Potencial
db.porto_listings.aggregate([
    { $project: { 
        name: 1, 
        price_num: { $toInt: { $ltrim: { input: "$price", chars: "€" } } },
        availability_365: 1 
    }},
    { $project: { 
        name: 1, 
        potential_revenue: { $multiply: ["$price_num", "$availability_365"] } 
    }},
    { $sort: { potential_revenue: -1 } },
    { $limit: 5 }
  ]);

// Estatisticas por tipo de quarto
db.porto_listings.aggregate([
    { $group: { 
        _id: "$room_type", 
        total: { $sum: 1 }, 
        avgRating: { $avg: "$review_scores_rating" } 
    }},
    { $sort: { total: -1 } }
  ]);

// Bairros com as Melhores Reviews (Apenas com mais de 10 alojamentos)
db.porto_listings.aggregate([
    { $group: { 
        _id: "$neighbourhood", 
        avgRating: { $avg: "$review_scores_rating" },
        count: { $sum: 1 } 
    }},
    { $match: { count: { $gte: 10 } } },
    { $sort: { avgRating: -1 } }
  ]);


//fazer a soma total de listings por tipo de quarto
db.porto_listings.aggregate([
  {
    $group: {
      _id: "$room_type",
      total: { $sum: 1 }
    }
  }
]);
//listar os alojamentos no bairro Baixa com 3 ou mais camas e rating superior a 4.2
db.porto_listings.find({
  neighbourhood: "Baixa",
  beds: { $gte: 3 },
  review_scores_rating: { $gte: 4.2 }
});
//listar todas as zonas e dizer quantos hosts existem em cada zona
db.porto_listings.aggregate([
  {
    $group: {
      _id: {
        neighbourhood: "$neighbourhood",
        host_id: "$host_id"
      }
    }
  },
  {
    $group: {
      _id: "$_id.neighbourhood",
      total_hosts: { $sum: 1 }
    }
  },
  {
    $sort: { total_hosts: -1 }
  }
]);
