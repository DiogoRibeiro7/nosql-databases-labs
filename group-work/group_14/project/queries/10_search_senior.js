db = db.getSiblingDB("lab_results");
print("Search for patients aged 65 and above:");
db.patients.aggregate([
  { 
    $match: { 
      "demographics.age": { $gt: 65 } 
    }
  },
  {
    $lookup: {
      from: "visits",
      localField: "patient_id",
      foreignField: "patient_id",
      as: "visit_history" 
    }
  }, 
  { 
    $unwind: "$visit_history" 
  },
  { $project : {
  _id : 0,
  Name : "$demographics.full_name",
  Age : "$demographics.age",
	notes : "$visit_history.notes"
  }},
		{ $sort: { Age: -1 } }
]).forEach((doc) => printjson(doc));