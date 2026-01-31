db = db.getSiblingDB("lab_results");
print("Patients on medication");

db.patients
  .aggregate([
    {
      $match: {
        "medical_history.current_medications.0": { $exists: true },
      },
    },
    {
      $project: {
        _id: 0,
        Patient: "$demographics.full_name",
        Medications: "$medical_history.current_medications",
      },
    },
  ])
  .forEach((doc) => printjson(doc));
