db = db.getSiblingDB("lab_results");
print("INDEX ANALYSIS: Search Provider SNS");

var stats = db.patients.explain("executionStats").aggregate([
    { $match: { "insurance.provider": "SNS" } },
    { $unwind: "$insurance" },
    { $match: { "insurance.provider": "SNS" } },
    { $limit: 10 },
    {
      $project: {
        _id: 0,
        "demographics.full_name": 1,
        "insurance.provider": 1,
      },
    },
]);

printjson(stats);