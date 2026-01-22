db = db.getSiblingDB("lab_results");
print("Last 10 Surgeries at Santo António Hospital:");
db.patients.aggregate([
  {
    $unwind: "$medical_history.surgical_history"
  },
  {
    $match: {
      "medical_history.surgical_history.hospital": "Santo António Hospital"
    }
  },
  {
    $sort: {
      "medical_history.surgical_history.date": -1
    }
  },
  {
    $limit: 10
  },
  {
    $project: {
      _id: 0,
      Patient: "$demographics.full_name",
      Surgery: "$medical_history.surgical_history.procedure",
      Date: "$medical_history.surgical_history.date",
      Complications: "$medical_history.surgical_history.complications"
    }
  }
]).forEach((doc) => printjson(doc));