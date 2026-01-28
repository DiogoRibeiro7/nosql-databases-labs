// Business analytics queries: pricing, capacity, neighbourhood KPIs, reservations revenue, reviews.
// Usage: mongosh queries/06_business_queries.mongosh.js

db = db.getSiblingDB("staybook");
print("Business queries (sample outputs):");

// Q1: Cheapest listings (requires price_eur)
print("Cheapest listings:");
db.listings
  .find(
    { price_eur: { $exists: true } },
    { _id: 0, id: 1, name: 1, neighbourhood: 1, room_type: 1, price: 1, price_eur: 1, accommodates: 1 }
  )
  .sort({ price_eur: 1 })
  .limit(10)
  .forEach((doc) => printjson(doc));

// Q2: Most expensive listings
print("Most expensive listings:");
db.listings
  .find(
    { price_eur: { $exists: true } },
    { _id: 0, id: 1, name: 1, neighbourhood: 1, price: 1, price_eur: 1 }
  )
  .sort({ price_eur: -1 })
  .limit(10)
  .forEach((doc) => printjson(doc));

// Q3: Listings with high capacity
print("High-capacity listings (accommodates >= 6):");
db.listings
  .find(
    { accommodates: { $gte: 6 } },
    { _id: 0, id: 1, name: 1, neighbourhood: 1, accommodates: 1, price_eur: 1 }
  )
  .sort({ accommodates: -1, price_eur: 1 })
  .limit(20)
  .forEach((doc) => printjson(doc));

// Q4: Neighbourhood summary (count + avg price + avg rating)
print("Neighbourhood summary (top by listing count):");
db.listings
  .aggregate([
    { $match: { price_eur: { $exists: true }, review_scores_rating: { $type: "number" } } },
    {
      $group: {
        _id: "$neighbourhood",
        listings: { $sum: 1 },
        avgPrice: { $avg: "$price_eur" },
        avgRating: { $avg: "$review_scores_rating" },
      },
    },
    { $sort: { listings: -1 } },
    { $limit: 10 },
  ])
  .forEach((doc) => printjson(doc));

// Q5: Room type distribution per neighbourhood
print("Room type distribution per neighbourhood (top 20):");
db.listings
  .aggregate([
    { $group: { _id: { neighbourhood: "$neighbourhood", room_type: "$room_type" }, total: { $sum: 1 } } },
    { $sort: { total: -1 } },
    { $limit: 20 },
  ])
  .forEach((doc) => printjson(doc));

// Q6: Availability – top listings by availability_365
print("Top listings by availability_365:");
db.listings
  .find({}, { _id: 0, id: 1, name: 1, neighbourhood: 1, availability_365: 1 })
  .sort({ availability_365: -1 })
  .limit(10)
  .forEach((doc) => printjson(doc));

// Q7: Reservations per status
print("Reservations per status:");
db.reservations
  .aggregate([{ $group: { _id: "$status", total: { $sum: 1 } } }, { $sort: { total: -1 } }])
  .forEach((doc) => printjson(doc));

// Q8: Revenue per listing (join to listing name)
print("Top revenue listings (confirmed/completed):");
db.reservations
  .aggregate([
    { $match: { status: { $in: ["confirmed", "completed"] } } },
    { $group: { _id: "$listingId", revenue: { $sum: "$totalPrice" }, bookings: { $sum: 1 } } },
    { $sort: { revenue: -1 } },
    { $limit: 10 },
    { $lookup: { from: "listings", localField: "_id", foreignField: "id", as: "listing" } },
    { $unwind: "$listing" },
    {
      $project: {
        listingId: "$_id",
        name: "$listing.name",
        neighbourhood: "$listing.neighbourhood",
        revenue: 1,
        bookings: 1,
      },
    },
  ])
  .forEach((doc) => printjson(doc));

// Q9: Reviews distribution (ratings)
print("Reviews distribution (ratings):");
db.reviews
  .aggregate([{ $group: { _id: "$rating", total: { $sum: 1 } } }, { $sort: { _id: 1 } }])
  .forEach((doc) => printjson(doc));

print("06_business_queries completed.");
