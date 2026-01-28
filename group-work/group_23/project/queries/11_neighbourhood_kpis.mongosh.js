// KPIs by neighbourhood: listings, avg price, avg rating, avg availability.
// Usage: mongosh queries/11_neighbourhood_kpis.mongosh.js

db = db.getSiblingDB("staybook");
print("Neighbourhood KPIs:");

db.listings
  .aggregate([
    {
      $group: {
        _id: "$neighbourhood",
        listings: { $sum: 1 },
        avgAvailability: { $avg: "$availability_365" },
        avgPrice: { $avg: "$price_eur" },
        avgRating: { $avg: "$review_scores_rating" },
      },
    },
    { $sort: { listings: -1 } },
    { $limit: 15 },
  ])
  .forEach((doc) => printjson(doc));
