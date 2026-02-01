// Query 06: Inventory Availability by Film and Store
// Verifies available stock via aggregation with lookup
// Usage: mongosh queries/06_film_inventory_availability.mongosh.js

db = db.getSiblingDB("sakila_mongodb");

print("\n=== Film Inventory Availability ===\n");

db.inventory
  .aggregate([
    // Group by film and store
    {
      $group: {
        _id: { film_id: "$film_id", store_id: "$store_id" },
        total_copies: { $sum: 1 },
        available_copies: { $sum: { $cond: ["$available", 1, 0] } }
      }
    },
    // Join with films to get title
    {
      $lookup: {
        from: "films",
        localField: "_id.film_id",
        foreignField: "film_id",
        as: "film_info"
      }
    },
    { $unwind: "$film_info" },
    // Project final fields with availability rate
    {
      $project: {
        film_id: "$_id.film_id",
        store_id: "$_id.store_id",
        title: "$film_info.title",
        category: "$film_info.category.name",
        total_copies: 1,
        available_copies: 1,
        availability_rate: {
          $multiply: [{ $divide: ["$available_copies", "$total_copies"] }, 100]
        }
      }
    },
    // Sort by availability ascending
    { $sort: { availability_rate: 1, title: 1 } },
    { $limit: 20 }
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");