db = db.getSiblingDB("lab_results");
print("INDEX ANALYSIS: Abnormal Results");
var stats = db.results.explain("executionStats").aggregate([
    { $match: { "notes": "Abnormal result - follow up recommended" } },
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
        test: "$test_name",
        notes: "$notes",
      },
    },
]);

printjson(stats);