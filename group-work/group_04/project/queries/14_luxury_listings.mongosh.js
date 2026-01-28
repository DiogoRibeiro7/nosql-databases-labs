// Query 14: Luxury Listings Analysis (Price > €150)
// Premium market segment analysis
// Usage: mongosh queries/14_luxury_listings.mongosh.js

db = db.getSiblingDB("group_04_airbnb");

print("\n=== Luxury Listings (Price > €150) ===\n");

db.listings
  .aggregate([
    // Filter luxury listings
    { $match: { price: { $gt: NumberDecimal("150") } } },
    // Project relevant fields
    {
      $project: {
        _id: 0,
        listing_id: 1,
        name: 1,
        host_name: "$host.host_name",
        neighbourhood: "$location.neighbourhood",
        room_type: 1,
        price: 1,
        accommodates: "$capacity.accommodates",
        bedrooms: "$capacity.bedrooms",
        rating: "$reviews.review_scores_rating",
        reviews: "$reviews.number_of_reviews"
      }
    },
    // Sort by price descending
    { $sort: { price: -1 } },
    { $limit: 20 }
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");
