db = db.getSiblingDB("lab_results");

print("📊 PERFORMANCE REPORT (Search Blood Type O+ - Top 10 Only For Better Reading of The Index)...");
var fullStats = db.patients.explain("executionStats").aggregate([
  {
    $match: {
      "demographics.blood_type": "O+"
    }
  },
  {
    $limit: 10
  },
  {
    $project: {
      _id: 0,
      "demographics.blood_type": 1,
      "demographics.full_name": 1,
    },
  },
]);
printjson(fullStats);