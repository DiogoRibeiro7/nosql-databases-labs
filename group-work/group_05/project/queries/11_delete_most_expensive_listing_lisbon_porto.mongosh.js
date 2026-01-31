/* eslint-disable */
db = db.getSiblingDB("group_05_final");

/**
 * USE CASE: "Property Sale & Full Cleanup"
 * USER STORY: "I am the owner of the most expensive Airbnb in Lisbon
 * or Porto, and I have just sold the property to a shopping mall construction company.
 * I need my Airbnb listing to be deleted along with all its reviews."
 * * TECHNICAL GOAL:
 * 1. Find the single most expensive listing (filtered by Host City).
 * 2. Perform a Cascading Delete: Remove the Listing AND its associated Reviews.
 */

// Find the Target
const target = db.listings
  .aggregate([
    {
      $lookup: {
        from: "hosts",
        localField: "host_id",
        foreignField: "id",
        as: "host_info",
      },
    },
    { $unwind: "$host_info" },
    {
      $addFields: {
        // Parse "Lisbon" from "Lisbon, Portugal"
        city: {
          $trim: {
            input: { $arrayElemAt: [{ $split: ["$host_info.location", ","] }, 0] },
          },
        },
      },
    },
    {
      // Filter for valid cities
      $match: {
        city: { $in: ["Lisbon", "Porto"] },
      },
    },
    {
      // Sort by Price Descending (Most Expensive)
      $sort: { price: -1 },
    },
    { $limit: 1 },
    {
      $project: {
        _id: 0,
        id: 1,
        name: 1,
        price: 1,
        city: 1,
      },
    },
  ])
  .toArray()[0]; // Fetch the single document

// Delete
if (!target) {
  print("No matching listing found in Lisbon or Porto.");
} else {
  print(`\n--- DELETING TARGET PROPERTY ---`);
  print(`Name:  ${target.name}`);
  print(`City:  ${target.city}`);
  print(`Price: €${target.price}`);
  print(`ID:    ${target.id}`);

  // Delete the Listing
  const delListing = db.listings.deleteOne({ id: target.id });

  // Cascading Delete
  const delReviews = db.reviews.deleteMany({ listing_id: target.id });

  print("\n--- DELETION SUMMARY ---");
  printjson({
    status: "Success",
    listings_removed: delListing.deletedCount,
    reviews_removed: delReviews.deletedCount,
  });
}
