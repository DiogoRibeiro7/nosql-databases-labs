db = db.getSiblingDB("lab_results");
print("Patients with the Highest IMC:");
db.patients
  .aggregate([
    {
      $match: { "vital_signs.bmi": { $gte: 30 } },
    },
    {
      $group: {
        _id: "$patient_id",
        max_bmi: { $max: "$vital_signs.bmi" },
      },
    },
    {
      $sort: { max_bmi: -1 },
    },
    {
      $limit: 10,
    },
  ])
  .forEach((doc) => printjson(doc));
