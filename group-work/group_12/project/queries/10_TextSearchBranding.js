// Query to find restaurants that mention either "Sushi" or "Pizza" in their text fields

db.restaurants.find({ $text: { $search: "Sushi Pizza" } });