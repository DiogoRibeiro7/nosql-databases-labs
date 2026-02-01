// Query 16: Revenue and Metrics by Store and Film Category
// Groups rentals by store_id and category for performance analysis

// Shows total revenue, rental count, average rental time and average value per store/category
// Usage: mongosh queries/16_revenue_by_store_category.mongosh.js

db = db.getSiblingDB("sakila_mongodb");

print("\n=== Revenue and Performance by Store and Film Category ===\n");
print("Analysis of KPIs grouped by store_id and film category:\n");

db.rentals
  .aggregate([
    // Filter only rentals with payment and defined category
    {
      $match: {
        "payment.amount": { $exists: true },
        "film.category": { $exists: true }
      }
    },
    
    // Group by store and film category to calculate KPIs
    {
      $group: {
        _id: { 
          store_id: "$store_id", 
          category: "$film.category" 
        },
        revenue: { $sum: "$payment.amount" },
        rentals: { $sum: 1 },
        avgRentalValue: {  $avg: "$payment.amount" },
        avgRentalDurationDays: { $avg: "$rental_duration_days"}
      },
    },
    
    
    // Sort descending so most profitable combinations appear first
    { $sort: { revenue: -1 } },
    
    // Limit to top 20 combinations
    { $limit: 20 }
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");