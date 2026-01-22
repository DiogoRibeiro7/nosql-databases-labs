db = db.getSiblingDB("lab_results");
print("Distribution of Patients by City:");
db.patients.aggregate([
  {
    $group: {
      _id: "$contact.address.city",
      count: { $sum: 1 }
    }
  },
  {
    $project: {
      _id: 0,
      City: "$_id",
      NumberOfPatients: "$count"
    }
  },
  { $sort: { NumberOfPatients: -1 } }
]).forEach((doc) => printjson(doc));