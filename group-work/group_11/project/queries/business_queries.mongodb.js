use("travel_booking");
// Encontrar casas inteiras em "Cedofeita" para 4+ pessoas
db.porto_listings.find({neighbourhood:"Cedofeita",
    room_type: "Entire home/apt",
    accommodates:{$gte:4}
}).sort({review_scores_rating:-1});

// Pesquisa por multiplos bairros (Ribeira ou Baixa)
db.porto_listings.find({
    neighbourhood: {$in:["Ribeira", "Baixa"]},
    beds: {$gt:1}
});


