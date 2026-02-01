// Filter: Listings by price range and room type
// Query name: Filter by Price & Room Type
// Query question: Which listings match a price range and room type?
// Business purpose: support price-targeted searches and product filtering
// Usage: mongosh filter_by_price_roomtype.mongosh.js

db = db.getSiblingDB("group_03_airbnb");
print("=== FILTER: PRICE & ROOM TYPE ===");

const minPrice = 50;
const maxPrice = 120;
const roomType = "Entire home/apt"; // change as needed

db.listings
  .find(
    { "pricing.daily_price": { $gte: minPrice, $lte: maxPrice }, "details.room_type": roomType },
    { name: 1, "pricing.daily_price": 1, "location.neighbourhood": 1 }
  )
  .sort({ "pricing.daily_price": 1 })
  .limit(50)
  .forEach((d) => printjson(d));

print("=== FILTER complete ===");
