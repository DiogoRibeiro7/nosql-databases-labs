// Query 08: Revenue Analysis by Film Rating
// Evaluates audience preferences via lookup between rentals and films
// Usage: mongosh queries/08_revenue_by_rating.mongosh.js

db = db.getSiblingDB("sakila_mongodb");

print("\n=== Revenue and Rentals by Film Rating ===\n");

db.rentals
  .aggregate([
    // Join with films to get rating
    {
      $lookup: {
        from: "films",
        localField: "film.film_id",
        foreignField: "film_id",
        as: "film_details"
      }
    },
    { $unwind: "$film_details" },
    // Group by rating
    {
      $group: {
        _id: "$film_details.rating",
        rental_count: { $sum: 1 },
        total_revenue: { $sum: "$payment.amount" },
        avg_rental_rate: { $avg: "$film_details.rental_rate" }
      }
    },
    // Sort by revenue descending
    { $sort: { total_revenue: -1 } }
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");