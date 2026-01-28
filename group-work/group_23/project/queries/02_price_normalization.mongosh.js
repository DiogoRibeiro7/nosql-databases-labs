// Normalize listing price from "€40" (string) into price_eur (number) for analytics.
// Usage: mongosh queries/02_price_normalization.mongosh.js

db = db.getSiblingDB("staybook");
print("Creating/refreshing numeric field: listings.price_eur");

// Update using a pipeline so we can compute a numeric field.
const result = db.listings.updateMany(
  { price: { $type: "string" } },
  [
    {
      $set: {
        price_eur: {
          $toInt: {
            $replaceAll: { input: "$price", find: "€", replacement: "" },
          },
        },
      },
    },
  ]
);

print("Documents matched: " + result.matchedCount);
print("Documents modified: " + result.modifiedCount);

// Quick sample
print("Sample documents with price_eur:");
db.listings
  .find({ price_eur: { $exists: true } }, { _id: 0, id: 1, price: 1, price_eur: 1 })
  .limit(5)
  .forEach((doc) => printjson(doc));
