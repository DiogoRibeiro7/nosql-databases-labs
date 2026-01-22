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
// Uso do operador $in e limites de preço
db.porto_listings.find({
    neighbourhood: { $in: ["Ribeira", "Baixa", "Sé"] },
    beds: { $gt: 1 },
    price: { $regex: "€[0-9]{1,2}$" } // Filtra preços abaixo de 100€
}).sort({ review_scores_rating: -1 });

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