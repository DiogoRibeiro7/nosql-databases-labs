/* eslint-disable */

db = db.getSiblingDB("group_05_final");

/**
 * USE CASE: "Property Sale & Full Cleanup"
 * USER STORY: "I am the owner of the most expensive Airbnb in Lisbon
 * and Porto, and I have just sold the property to a shopping mall construction company, 
 * which will demolish the building and build a mall in its place. 
 * I need my Airbnb listing to be deleted."
 * TECHNICAL GOAL: find the most expensive listing (Lisbon/Porto via hosts.location) and DELETE it + its reviews.
 */

const target = db.listings
  .aggregate([
    { $lookup: { from: "hosts", localField: "host_id", foreignField: "id", as: "h" } },
    { $unwind: "$h" },
    {
      $addFields: {
        city: { $trim: { input: { $arrayElemAt: [{ $split: ["$h.location", ","] }, 0] } } },
        price_num: { $toDouble: { $trim: { input: "$price", chars: "€" } } },
      },
    },
    { $match: { city: { $in: ["Lisbon", "Porto"] } } },
    { $sort: { price_num: -1 } },
    { $limit: 1 },
    { $project: { _id: 0, id: 1 } },
  ])
  .toArray()[0];

if (!target) {
  print("No Lisbon/Porto listing found. Nothing deleted.");
} else {
  const delListing = db.listings.deleteOne({ id: target.id });
  const delReviews = db.reviews.deleteMany({ listing_id: target.id });

  printjson({
    deleted_listing: delListing.deletedCount,
    deleted_reviews: delReviews.deletedCount,
  });
}
