db = db.getSiblingDB("lab_results");
print("List of Patients allergic to Pollen:");
db.patients
  .aggregate([
    {
      $match: {
        "medical_history.allergies": "Pollen",
      },
    },
    {
      $project: {
        _id: 0,
        Nome: "$demographics.full_name",
        Alergias: "$medical_history.allergies",
      },
    },
  ])
  .forEach((doc) => printjson(doc));
