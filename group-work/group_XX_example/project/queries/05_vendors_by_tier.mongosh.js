// Simple find() example: list vendors filtered by partnership tier and sorted by capacity.
// Usage: mongosh queries/05_vendors_by_tier.mongosh.js

db = db.getSiblingDB("group_xx_example_final");
print("Gold or silver vendors sorted by capacity:");
db.vendors
  // Filter to premium tiers and only project the fields needed for slides.
  .find({ partnershipTier: { $in: ["gold", "silver"] } }, { _id: 0, vendorId: 1, name: 1, partnershipTier: 1, capacityPerEvent: 1 })
  // Show who can handle the largest crowds first.
  .sort({ capacityPerEvent: -1 })
  .forEach((doc) => printjson(doc));
