// Query to find all restaurants located in the city of Toulouse

db.restaurants.find({ "address.city": "Toulouse" });