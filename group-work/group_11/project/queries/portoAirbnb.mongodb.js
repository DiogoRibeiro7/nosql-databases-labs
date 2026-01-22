use('travel_booking');
db.porto_listings.find({
    neighbourhood:"Cedofeita",
    bedrooms:{$gte: 2}
}).sort({price: 1});
