db = db.getSiblingDB("lab_results");
print("Visits with High Blood Pressure (Systolic >= 140):");
db.visits
  .aggregate([
    {
      $match: {
        "vital_signs.blood_pressure.systolic": { $gte: 140 },
      },
    },
    {
      $lookup: {
        from: "patients",
        localField: "patient_id",
        foreignField: "patient_id",
        as: "patient_info",
      },
    },
    { $unwind: "$patient_info" },
    {
      $project: {
        _id: 0,
        Patient: "$patient_info.demographics.full_name",
        Date: "$visit_date",
        SystolicBP: "$vital_signs.blood_pressure.systolic",
        Department: "$department",
      },
    },
  ])
  .forEach((doc) => printjson(doc));
