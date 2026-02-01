db = db.getSiblingDB("lab_results");
print("List of Patients with insurance from SNS:");
db.patients
  .aggregate([
    { $unwind: "$insurance" },
    { $match: { "insurance.provider": "SNS" } },
    {
      $project: {
        _id: 0,
        "demographics.full_name": 1,
        "insurance.provider": 1,
      },
    },
  ])
  .forEach((doc) => printjson(doc));
