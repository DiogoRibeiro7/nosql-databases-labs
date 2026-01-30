// Query to find all restaurants located in the city of "Paris" that serve "Italian" cuisine.

db.restaurants.find({ "address.city": "Paris", type: "Italian" });