db=db.getSiblingDB("lab_results");
print("Top 5 insurance providers per number of patients:")
db.patients.aggregate([
  {
    $group: {
        _id: "$insurance.provider",
        count: { $sum: 1 }
    }
  },
  {
    $sort: { count: -1 }
  },
  { $limit: 5 },
]).forEach((doc) => printjson(doc));