// Query 15: Text Search on Listing Names
// Search functionality demonstration
// Usage: mongosh queries/15_listing_text_search.mongosh.js

db = db.getSiblingDB("group_04_airbnb");

print("\n=== Text Search: Listings with 'Apartment' in Name ===\n");

// First ensure text index exists
try {
  db.listings.createIndex({ name: "text" }, { name: "idx_listing_name_text" });
} catch (e) {
  // Index may already exist
}

// Text search for "Apartment"
db.listings
  .find(
    { $text: { $search: "Apartment" } },
    {
      _id: 0,
      listing_id: 1,
      name: 1,
      neighbourhood: "$location.neighbourhood",
      room_type: 1,
      price: 1,
      score: { $meta: "textScore" }
    }
  )
  .sort({ score: { $meta: "textScore" } })
  .limit(15)
  .forEach((doc) => printjson(doc));

print("\n--- Alternative: Regex Search for 'Porto' ---\n");

db.listings
  .find(
    { name: { $regex: /Porto/i } },
    {
      _id: 0,
      listing_id: 1,
      name: 1,
      neighbourhood: "$location.neighbourhood",
      price: 1
    }
  )
  .limit(10)
  .forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");
