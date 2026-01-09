// Aggregation example: returning customers grouped by district.
// Usage: mongosh queries/13_returning_customers_by_district.mongosh.js

db = db.getSiblingDB("group_xx_example_final");
print("Districts with repeat visitors:");
db.orders
  .aggregate([
    {
      $group: {
        _id: "$customer.customerId",
        district: { $first: "$customer.district" },
        visits: { $sum: 1 },
      },
    },
    { $match: { visits: { $gte: 2 } } },
    {
      $group: {
        _id: "$district",
        repeaters: { $sum: 1 },
        customerIds: { $addToSet: "$_id" },
      },
    },
    { $sort: { repeaters: -1 } },
  ])
  .forEach((doc) => printjson(doc));
