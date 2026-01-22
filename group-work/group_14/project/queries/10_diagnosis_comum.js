db = db.getSiblingDB("lab_results");
print("Most Common Diagnoses (Count):");
db.visits.aggregate([
  {
    $group: {
      _id: "$diagnosis.name",
      total_cases: { $sum: 1 }
    }
  },
  {
    $sort: { total_cases: -1 }
  },
  {
    $project: {
      _id: 0,
      Diagnosis: "$_id",
      Count: "$total_cases"
    }
  }
]).forEach((doc) => printjson(doc));