db = db.getSiblingDB("lab_results");
print("Patients with Diabetes OR Hypertension:");

db.patients
  .aggregate([
    {
      $match: {
        "medical_history.chronic_conditions": {
          $in: ["Diabetes", "Hypertension"],
        },
      },
    },
    {
      $project: {
        _id: 0,
        Name: "$demographics.full_name",
        Conditions: "$medical_history.chronic_conditions",
      },
    },
  ])
  .forEach((doc) => printjson(doc));
