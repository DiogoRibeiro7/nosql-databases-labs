// Aggregation example: returning customers grouped by district.
// Usage: mongosh queries/13_returning_customers_by_district.mongosh.js

db = db.getSiblingDB("group_xx_example_final");
print("Districts with repeat visitors:");
db.orders
  .aggregate([
    // Count visits per customer and capture their home district.
    {
      $group: {
        _id: "$customer.customerId",
        district: { $first: "$customer.district" },
        visits: { $sum: 1 },
      },
    },
    // Only consider customers who visited at least twice.
    { $match: { visits: { $gte: 2 } } },
    // Roll up repeat visitor counts by district for planning purposes.
    {
      $group: {
        _id: "$district",
        repeaters: { $sum: 1 },
        customerIds: { $addToSet: "$_id" },
      },
    },
    // Rank districts by how many loyal visitors they generate.
    { $sort: { repeaters: -1 } },
  ])
  .forEach((doc) => printjson(doc));
