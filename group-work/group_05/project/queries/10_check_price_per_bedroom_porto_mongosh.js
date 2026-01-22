db = db.getSiblingDB("airbnb");

const value = db.listings.aggregate([
  { $match: { name: /Porto/ } },
  {
    $project: {
      _id: 0,
      name: 1,
      pricePerBedroom: {
        $divide: [{ $toInt: { $trim: { input: "$price", chars: "€" } } }, "$bedrooms"],
      },
    },
  },
  { $sort: { pricePerBedroom: 1 } },
]);

print(value);
