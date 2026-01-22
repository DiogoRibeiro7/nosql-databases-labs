db = db.getSiblingDB("lab_results");
print("List of Patients with Nausea Symptom:");
db.patients
  .aggregate([
    {
      $lookup: {
        from: "visits",
        localField: "patient_id",
        foreignField: "patient_id",
        as: "visit_data",
      },
    },
    { $unwind: "$visit_data" },
    {
      $match: { "visit_data.symptoms": "Nausea" },
    },
    {
      $project: {
        _id: 0,
        full_name: "$demographics.full_name",
        symptoms: "$visit_data.symptoms",
      },
    },
  ])
  .forEach((doc) => printjson(doc));
