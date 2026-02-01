// Query 22: Customers by City and Country
// Geographic analysis of customer distribution
// Usage: mongosh queries/22_customers_by_location.mongosh.js

db = db.getSiblingDB("sakila_mongodb");

print("\n=== Customer Distribution by City/Country ===\n");

db.customers
  .aggregate([
    // Group by country and city
    {
      $group: {
        _id: {
          country: "$address.city.country",
          city: "$address.city.city_name"
        },
        customer_count: { $sum: 1 },
        total_lifetime_value: { $sum: "$lifetime_value" },
        avg_rentals: { $avg: "$lifetime_rentals" }
      }
    },
    // Sort by count descending
    { $sort: { customer_count: -1 } },
    // Top 15 locations
    { $limit: 15 }
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");
