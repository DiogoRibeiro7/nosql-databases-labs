use('travel_booking');

// Create: Adicionar um novo apartamento
db.porto_listings.insertOne({
    id: 10100,
    name: "Porto Riverside View",
    host_id: 2000,
    host_name: "Marcio Tavares",
    neighbourhood: "Ribeira",
    room_type: "Entire home/apt",
    price: "€120",
    accommodates: 4,
    bedrooms: 2,
    review_scores_rating: 5.0
});

// Read : Procurar o apartamento que criei acima
db.porto_listings.find({host_name:"Marcio Tavares"});

// Update: Mudar o preço do "Charming Porto Apartement 2"(ID: 10001)
db.porto_listings.updateOne({id:10001},{$set:{price:"€60"}});

// Delete: Remover o apartamento que criei acima
db.porto_listings.deleteOne({id:10100});

//remover todos os alojamentos com menos de 2 camas
db.porto_listings.deleteMany({beds:{$lt:2}});



