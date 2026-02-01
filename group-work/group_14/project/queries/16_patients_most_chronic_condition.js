db = db.getSiblingDB("lab_results");
print("Patients with the most Chronic Conditions:");
db.patients
  .aggregate([
    {
      $unwind: "$medical_history.chronic_conditions",
    },
    {
      $group: {
        _id: "$demographics.full_name",
        total_conditions: { $sum: 1 },
      },
    },
    { $sort: { total_conditions: -1 } },
    { $limit: 5 },
    {
      $project: {
        _id: 0,
        Patient: "$_id",
        ConditionCount: "$total_conditions",
      },
    },
  ])
  .forEach((doc) => printjson(doc));
