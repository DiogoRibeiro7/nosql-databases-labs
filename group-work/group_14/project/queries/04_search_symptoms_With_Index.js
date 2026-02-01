db = db.getSiblingDB("lab_results");
print("INDEX ANALYSIS: Search Symptoms");
var stats = db.visits.explain("executionStats").aggregate([
    { $match: { "symptoms": "Nausea" } },
    { $limit: 10 },
    {
      $lookup: {
        from: "patients",
        localField: "patient_id",
        foreignField: "patient_id",
        as: "paciente",
      },
    },
    { $unwind: "$paciente" },
    {
      $project: {
        _id: 0,
        full_name: "$paciente.demographics.full_name",
        symptoms: "$symptoms",
      },
    },
]);

printjson(stats);