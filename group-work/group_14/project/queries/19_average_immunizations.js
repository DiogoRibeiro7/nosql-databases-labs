db = db.getSiblingDB("lab_results");
print("Average vaccines per patient:");

db.patients
  .aggregate([
    {
      $project: {
        num_immunizations: { $size: "$medical_history.immunizations" },
      },
    },
    {
      $group: {
        _id: null,
        avg_immunizations: { $avg: "$num_immunizations" },
      },
    },
    {
      $project: {
        _id: 0,
        Average_Immunizations: "$avg_immunizations",
      },
    },
  ])
  .forEach((doc) => printjson(doc));
