db = db.getSiblingDB("airbnb");

const avgPrice = db.listings.aggregate([
  { $match: { name: /Porto/ } },
  {
    $group: {
      _id: "$neighbourhood",
      neighbourhoodAverage: { $avg: { $toInt: { $trim: { input: "$price", chars: "€" } } } },
    },
  },
  { $project: { _id: 0, neighbourhoodAverage: 1, neighbourhoodName: "$_id" } },
]);

print(avgPrice);
