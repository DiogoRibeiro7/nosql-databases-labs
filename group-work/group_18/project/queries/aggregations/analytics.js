// 1. Top 5 restaurantes por rating
db.restaurants.aggregate([
  { $match: { rating: { $type: "double" } } },
  { $sort: { rating: -1 } },
  { $limit: 5 }
]);

// 2. Contar restaurantes por tipo de comida
db.restaurants.aggregate([
  { $group: { _id: "$type_of_food", total: { $sum: 1 } } },
  { $sort: { total: -1 } }
]);

// 3. Média de rating por tipo de comida
db.restaurants.aggregate([
  { $match: { rating: { $type: "double" } } },
  { $group: { _id: "$type_of_food", avgRating: { $avg: "$rating" } } },
  { $sort: { avgRating: -1 } }
]);

// 4. Juntar restaurantes com reviews
db.restaurants.aggregate([
  {
    $lookup: {
      from: "reviews",
      localField: "_id",
      foreignField: "restaurantId",
      as: "reviews"
    }
  }
]);

// 5. Restaurantes com mais reviews
db.reviews.aggregate([
  { $group: { _id: "$restaurantId", totalReviews: { $sum: 1 } } },
  { $sort: { totalReviews: -1 } },
  { $limit: 10 }
]);

// 6. Média de rating real (reviews)
db.reviews.aggregate([
  { $group: { _id: "$restaurantId", avgReviewRating: { $avg: "$rating" } } },
  { $sort: { avgReviewRating: -1 } }
]);

// 7. Ranking de popularidade (favoritos)
db.favorites.aggregate([
  { $group: { _id: "$restaurantId", favorites: { $sum: 1 } } },
  { $sort: { favorites: -1 } },
  { $limit: 10 }
]);

// 8. Top tipos de comida
db.restaurants.aggregate([
  { $group: { _id: "$type_of_food", total: { $sum: 1 } } },
  { $sort: { total: -1 } },
  { $limit: 5 }
]);

// 9. Restaurantes por outcode
db.restaurants.aggregate([
  { $group: { _id: "$outcode", total: { $sum: 1 } } },
  { $sort: { total: -1 } }
]);

// 10. Chinese com rating >= 5
db.restaurants.aggregate([
  { $match: { type_of_food: "Chinese", rating: { $gte: 5 } } },
  { $project: { name: 1, rating: 1, outcode: 1, _id: 0 } },
  { $sort: { rating: -1 } }
]);
