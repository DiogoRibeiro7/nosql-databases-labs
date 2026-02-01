// Query 18: Neighbourhood Performance Dashboard
// Query name: Neighbourhood Performance Dashboard
// Query question: How does each neighbourhood perform across price, rating, availability and reviews?
// Business purpose: neighbourhood-level performance and executive dashboarding

db = db.getSiblingDB("group_03_airbnb");

print("\n=== Neighbourhood Performance Dashboard (Null-Safe) ===\n");

db.listings
  .aggregate([
    {
      $project: {
        neighbourhood: "$location.neighbourhood",
        price: "$price",
        rating: { $ifNull: ["$reviews.review_scores_rating", null] },
        availability: { $ifNull: ["$booking_rules.availability_365", null] },
        review_count: { $ifNull: ["$reviews.number_of_reviews", 0] },
      },
    },
    {
      $group: {
        _id: "$neighbourhood",
        total_listings: { $sum: 1 },
        avg_price: { $avg: "$price" },
        avg_rating: { $avg: "$rating" },
        avg_availability: { $avg: "$availability" },
        total_reviews: { $sum: "$review_count" },
      },
    },
    {
      $project: {
        _id: 0,
        neighbourhood: "$_id",
        total_listings: 1,
        avg_price: { $cond: [{ $gt: ["$avg_price", 0] }, { $round: ["$avg_price", 2] }, null] },
        avg_rating: { $cond: [{ $gt: ["$avg_rating", 0] }, { $round: ["$avg_rating", 2] }, null] },
        avg_availability: {
          $cond: [{ $gt: ["$avg_availability", 0] }, { $round: ["$avg_availability", 1] }, null],
        },
        total_reviews: 1,
      },
    },
    { $sort: { total_listings: -1 } },
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");
print("\nRun next query!\n");
