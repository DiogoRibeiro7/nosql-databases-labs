// Query 02: Top 10 Listings by Rating
// Query name: Top 10 Listings by Rating
// Query question: Which listings have the highest rating?
// Business purpose: surface premium properties for partnerships and featured placement

db = db.getSiblingDB("group_03_airbnb");

print("\n=== Top 10 Listings by Rating ===\n");

db.listings
  .aggregate([
    { $match: { "reviews.rating": { $ne: null } } },
    {
      $project: {
        _id: 0,
        listing_id: "$_id",
        name: 1,
        rating: "$reviews.rating",
        price: "$pricing.daily_price",
        reviews_count: "$reviews.count",
      },
    },
    { $sort: { rating: -1, reviews_count: -1 } },
    { $limit: 10 },
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");
print("\nRun next query!\n");
