db = db.getSiblingDB("lab_results");
print("List of Patients with O+ Blood Type:");
db.patients
  .aggregate([
    { $match: { "demographics.blood_type": "O+" } },
    {
      $project: {
        _id: 0,
        "demographics.blood_type": 1,
        "demographics.full_name": 1,
      },
    },
  ])
  .forEach((doc) => printjson(doc));
