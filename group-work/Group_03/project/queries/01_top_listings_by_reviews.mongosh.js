// Query 01: Top 10 Listings by Number of Reviews
// Query name: Top 10 Listings by Number of Reviews
// Query question: Which listings have the most reviews?
// Business purpose: identify highly-reviewed properties for marketing and priority support

db = db.getSiblingDB("group_03_airbnb");

print("\n=== Top 10 Listings by Number of Reviews ===\n");

db.listings
  .aggregate([
    {
      $project: {
        _id: 0,
        listing_id: "$_id",
        name: 1,
        neighbourhood: "$location.neighbourhood",
        room_type: "$details.room_type",
        price: "$pricing.daily_price",
        number_of_reviews: "$reviews.count",
        review_score: "$reviews.rating",
      },
    },
    { $sort: { number_of_reviews: -1, review_score: -1 } },
    { $limit: 10 },
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");
print("\nRun next query!\n");
