db = db.getSiblingDB("lab_results");
print("Top 3 Departments by Number of Visits:");
db.visits.aggregate([
  {
    $group: {
      _id: "$department",
      total_visits: { $sum: 1 }
    }
  },
  { $sort: { total_visits: -1 } },
  { $limit: 3 },
  {
    $project: {
      _id: 0,
      Department: "$_id",
      TotalVisits: "$total_visits"
    }
  }
]).forEach((doc) => printjson(doc));