// Query 18: Update Listing Price (UPDATE)
// Demonstrates partial update operation
// Usage: mongosh queries/18_update_listing_price.mongosh.js

db = db.getSiblingDB("group_04_airbnb");

print("\n=== Update Listing Price ===\n");

const TARGET_LISTING_ID = 10001;

print("State before update:");
db.listings
  .find(
    { listing_id: TARGET_LISTING_ID },
    { _id: 0, listing_id: 1, name: 1, price: 1, price_category: 1, last_update: 1 }
  )
  .forEach((doc) => printjson(doc));

// Update price and recalculate category
const newPrice = NumberDecimal("75.00");
const newCategory = "mid-range"; // 50 < 75 <= 100

const updateResult = db.listings.updateOne(
  { listing_id: TARGET_LISTING_ID },
  {
    $set: {
      price: newPrice,
      price_category: newCategory,
      last_update: new Date()
    }
  }
);

print("\nUpdate result:");
printjson(updateResult);

print("\nState after update:");
db.listings
  .find(
    { listing_id: TARGET_LISTING_ID },
    { _id: 0, listing_id: 1, name: 1, price: 1, price_category: 1, last_update: 1 }
  )
  .forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");
