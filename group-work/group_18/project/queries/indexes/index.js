// Restaurants
db.restaurants.createIndex({ type_of_food: 1 });
db.restaurants.createIndex({ rating: -1 });

// Reviews
db.reviews.createIndex({ restaurantId: 1 });

// Favorites
db.favorites.createIndex({ user: 1 });
db.favorites.createIndex({ restaurantId: 1 });

// EXPLAIN EXAMPLE
db.restaurants.find({ type_of_food: "Chinese" })
  .explain("executionStats");

db.restaurants.find({ rating: { $gte: 5 } })
  .sort({ rating: -1 })
  .explain("executionStats");
