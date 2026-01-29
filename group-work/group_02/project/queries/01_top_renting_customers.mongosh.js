// Query 01: Top 10 Customers by Number of Rentals
// Identifies most active customers for loyalty programs
// Usage: mongosh queries/01_top_renting_customers.mongosh.js

db = db.getSiblingDB("sakila_mongodb");

print("\n=== Top 10 Customers by Number of Rentals ===\n");

db.customers
  .aggregate([
    {
      $project: {
        _id: 0,
        customer_id: 1,
        full_name: { $concat: ["$first_name", " ", "$last_name"] },
        email: 1,
        lifetime_rentals: 1,
        lifetime_value: 1
      }
    },
    // Sort by rentals descending
    { $sort: { lifetime_rentals: -1 } },
    // Top 10
    { $limit: 10 }
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");