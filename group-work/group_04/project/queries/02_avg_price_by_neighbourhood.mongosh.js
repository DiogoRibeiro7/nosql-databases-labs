// Query 02: Average Price by Neighbourhood
// Market analysis for pricing strategy
// Usage : mongosh queries/02_avg_price_by_neighbourhood.mongosh.js

db = db.getSiblingDB("group_04_airbnb");

print("\n=== Average Price by Neighbourhood ===\n");

db.listings
  .aggregate([
    // Group by neighbourhood
    {
      $group: {
        _id: "$location.neighbourhood",
        avg_price: { $avg: "$price" },
        min_price: { $min: "$price" },
        max_price: { $max: "$price" },
        listing_count: { $sum: 1 }
      }
    },
    // Sort by average price descending
    { $sort: { avg_price: -1 } }
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");
