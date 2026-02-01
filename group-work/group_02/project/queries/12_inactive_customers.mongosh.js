// Query 12: Inactive Customers (without recent rentals)
// Identification of re-engagement opportunities
// Usage: mongosh queries/12_inactive_customers.mongosh.js

db = db.getSiblingDB("sakila_mongodb");

print("\n=== Inactive Customers (no rentals before 2005-12-31) ===\n");

const inactiveThreshold = new Date("2005-12-31");

db.rentals
  .aggregate([
    // Group by customer
    {
      $group: {
        _id: "$customer.customer_id",
        customer_name: { $first: "$customer.full_name" },
        customer_email: { $first: "$customer.email" },
        last_rental_date: { $max: "$rental_date" },
        total_rentals: { $sum: 1 },
        lifetime_value: { $sum: "$payment.amount" }
      }
    },
    // Filter only inactive
    { $match: { last_rental_date: { $lt: inactiveThreshold } } },
    // Sort by value descending
    { $sort: { lifetime_value: -1 } },
    { $limit: 20 }
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");