// Aggregates orders and revenue by customer district to highlight hotspots.
// Usage: mongosh queries/03_neighborhood_heatmap.mongosh.js

db = db.getSiblingDB("group_xx_example_final");
print("Neighborhood contribution (orders + revenue):");
db.orders
  .aggregate([
    // Group by the stored customer district to measure engagement per area.
    {
      $group: {
        _id: "$customer.district",
        orders: { $sum: 1 },
        revenue: { $sum: "$totalAmount" },
      },
    },
    // Rank districts by raw order count.
    { $sort: { orders: -1 } },
  ])
  .forEach((doc) => printjson(doc));
