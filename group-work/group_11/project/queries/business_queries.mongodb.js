use("travel_booking");

// Q1: Segmentação de Mercado - Casas de Luxo na Cedofeita
// Procura casas inteiras para grupos grandes com rating alto
db.porto_listings.find({
    neighbourhood: "Cedofeita",
    room_type: "Entire home/apt",
    accommodates: { $gte: 4 },
    review_scores_rating: { $gte: 4.5 }
}).sort({ price: -1 });

// Q2: Análise de Procura - Opções económicas em bairros centrais
db.porto_listings.aggregate([
  {
    $match: {
      neighbourhood: { $in: ["Ribeira", "Baixa"] },
      beds: { $gt: 1 }
    }
  },
  {
    // Converter preço de string para número
    $addFields: {
      priceNum: {
        $convert: {
          input: {
            $replaceAll: {
              input: "$price",
              find: "€",
              replacement: ""
            }
          },
          to: "double",
          onError: null,
          onNull: null
        }
      }
    }
  },
  {
    $match: { priceNum: { $lt: 100 } }
  },
  {
    $sort: { priceNum: 1 }
  },
  {
    $project: { priceNum: 0 } //removr o campo temporario
  }
]);

// Q3: Verificação de Disponibilidade e Fidelização
// Alojamentos com alta disponibilidade mas poucas reviews (oportunidade de marketing)
db.porto_listings.find({
    availability_365: { $gt: 300 },
    number_of_reviews: { $lt: 5 }
});

// Q4: Query de Geolocalização (Diferencial Técnico)
// Encontrar alojamentos próximos de um ponto central (Ribeira)
// Nota: O teu JSON tem latitude/longitude, isto valoriza muito o trabalho
db.porto_listings.find({
    latitude: { $gte: 41.1400, $lte: 41.1500 },
    longitude: { $gte: -8.6200, $lte: -8.6100 }
}).limit(5);

// Q6: Pesquisa por Anfitrião Específico (Filtro simples)
// Útil para quando um utilizador quer ver todas as propriedades de um host
db.porto_listings.find({ host_name: "Porto_Host_17" });

// Q7: Filtro para Famílias (Capacidade e Quartos)
// Procura alojamentos com pelo menos 3 camas e mais que 1 quarto
db.porto_listings.find({ 
    beds: { $gte: 3 }, 
    bedrooms: { $gt: 1 } 
}).sort({ accommodates: -1 });

// Q8: Urgência/Disponibilidade
// Encontrar alojamentos com pouca disponibilidade (menos de 30 dias/ano)
db.porto_listings.find({ availability_365: { $lte: 30 } });

// Q9: Segmentação por Tipo de Quarto e Bairro
// Ideal para viajantes individuais que procuram quartos privados em Paranhos
db.porto_listings.find({ 
    neighbourhood: "Paranhos", 
    room_type: "Private room" 
});

db.porto_listings.find({ 
    neighbourhood: "Bonfim", 
    room_type: "Entire home/apt",
    accommodates: { $gte: 4 },
    review_scores_rating: { $gte: 4.5 }
}).sort({ price: -1 });