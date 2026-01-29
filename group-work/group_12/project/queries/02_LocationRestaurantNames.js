// Query to list the names of all restaurants located in the city of "Lyon".

db.restaurants.find(
    { "address.city": "Lyon" },
    { name: 1, _id: 0 }
);