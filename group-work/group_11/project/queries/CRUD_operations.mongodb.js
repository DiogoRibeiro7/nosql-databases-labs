use('travel_booking');

// 1. CREATE: Inserção de um alojamento com estrutura completa
db.porto_listings.insertOne({
    id: 99999,
    name: "Luxury Loft Porto",
    host_id: 5050,
    host_name: "Marcio Tavares",
    neighbourhood: "Paranhos",
    room_type: "Entire home/apt",
    price: "€150",
    accommodates: 4,
    bedrooms: 2,
    beds: 2,
    amenities: ["Wifi", "Elevator", "Heating"], // Exemplo de array
    review_scores_rating: 4.8
});

// 2. READ: Leitura de controlo (diferente das Business Queries)
// Verificar apenas se o documento que inseri existe, projetando apenas 2 campos
db.porto_listings.find({ id: 99999 }, { name: 1, host_name: 1, _id: 0 });

// 3. UPDATE: Uso de operadores complexos 
// Aumentar o rating de um alojamento em 0.2 pontos
db.porto_listings.updateOne(
    { id: 10001 },
    { $inc: { review_scores_rating: 0.2 } }
);

// Adicionar uma nova comodidade (amenity) sem apagar as anteriores e evitar duplicados
db.porto_listings.updateOne(
    { id: 10002 },
    { $addToSet: { amenities: "Air Conditioning" } }
);
// 4. DELETE: Limpeza de dados irrelevantes
// Remover alojamentos que têm preço zero ou não têm camas (dados corrompidos)
db.porto_listings.deleteMany({
    $or: [
        { price: "€0" },
        { beds: { $exists: false } },
        { beds: 0 }
    ]
});