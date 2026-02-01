// Aggregation example: how many events does each vendor support?
// Usage: mongosh queries/08_vendor_event_presence.mongosh.js

db = db.getSiblingDB("group_xx_example_final");
print("Event coverage per vendor (using events collection):");
db.events
  .aggregate([
    // Flatten the vendor array so each entry represents a vendor attached to an event.
    { $unwind: "$vendors" },
    {
      $group: {
        _id: "$vendors",
        eventsServed: { $sum: 1 },
        eventCodes: { $addToSet: "$eventCode" },
      },
    },
    // Join back to vendors to recover names and tiers for narrative context.
    {
      $lookup: {
        from: "vendors",
        localField: "_id",
        foreignField: "vendorId",
        as: "vendor",
      },
    },
    { $unwind: "$vendor" },
    {
      $project: {
        _id: 0,
        vendorId: "$_id",
        name: "$vendor.name",
        partnershipTier: "$vendor.partnershipTier",
        eventsServed: 1,
        eventCodes: 1,
      },
    },
    // Bubble the most active partners to the top.
    { $sort: { eventsServed: -1, vendorId: 1 } },
  ])
  .forEach((doc) => printjson(doc));
