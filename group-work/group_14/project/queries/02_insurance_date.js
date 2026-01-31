db = db.getSiblingDB("lab_results");
print("List of Patients with O+ Blood Type:");
db.patients
  .aggregate([
    { $unwind: "$insurance" },
    { $match: { "insurance.effective_date": "2024-12-30" } },
    {
      $project: {
        _id: 0,
        "demographics.full_name": 1,
        "insurance.effective_date": 1,
      },
    },
  ])
  .forEach((doc) => printjson(doc));
