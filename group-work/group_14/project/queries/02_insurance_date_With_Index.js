db = db.getSiblingDB("lab_results");
print("INDEX ANALYSIS: Search Insurance Date");

var stats = db.patients.explain("executionStats").aggregate([
    { $match: { "insurance.effective_date": "2024-12-30" } },
    { $unwind: "$insurance" },
    { $match: { "insurance.effective_date": "2024-12-30" } },
    { $limit: 10 },
    {
      $project: {
        _id: 0,
        "demographics.full_name": 1,
        "insurance.effective_date": 1,
      },
    },
]);

printjson(stats);