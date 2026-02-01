// Query 08: High-Value Listings
// Query name: High-Value Listings
// Query question: Which listings combine high price and high rating?
// Business purpose: identify premium inventory for concierge and upsell

db = db.getSiblingDB("group_03_airbnb");

print("\n=== High-Value Listings (price > 150 & rating >= 4.5) ===\n");
db.listings
  .find(
    {
      "pricing.daily_price": { $gt: 150 },
      "reviews.rating": { $gte: 4.5 },
    },
    { name: 1, "pricing.daily_price": 1, "reviews.rating": 1, "location.neighbourhood": 1 }
  )
  .sort({ "pricing.daily_price": -1 })
  .limit(20)
  .forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");
print("\nRun next query!\n");
