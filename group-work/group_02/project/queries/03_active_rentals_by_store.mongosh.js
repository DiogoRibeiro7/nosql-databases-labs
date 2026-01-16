// Query 03: Active Rentals by Store
// Operational monitoring of rented inventory
// Usage: mongosh queries/03_active_rentals_by_store.mongosh.js

db = db.getSiblingDB("sakila_mongodb");

print("\n=== Active Rentals (Not Returned) by Store ===\n");

db.rentals
  .aggregate([
    // Filter rentals without return date
    { $match: { return_date: null } },
    // Group by store
    {
      $group: {
        _id: "$store_id",
        active_count: { $sum: 1 },
        expected_revenue: { $sum: "$payment.amount" }
      }
    },
    // Sort by store
    { $sort: { _id: 1 } }
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");