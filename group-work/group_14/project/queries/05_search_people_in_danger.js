db = db.getSiblingDB("lab_results");
print("List of Patients with Abnormal Results - follow up recommended:");
db.patients.aggregate([
  {
    $lookup: {
      from: "results",
      localField: "patient_id",
      foreignField: "patient_id",
      as: "resultados"
    }
  },
  { $unwind: "$resultados" }, 
  { $unwind : "$demographics"},
  { 
    $match: { "resultados.notes": "Abnormal result - follow up recommended" } 
  },
  {
    $project: {
      _id: 0,
      full_name : "$demographics.full_name",
      test:"$resultados.test_name",
      notes: "$resultados.notes",
      normal_range : "$resultados.normal_range",
      result_value : "$resultados.value",
      doctor : "$resultados.ordering_provider",

    }
  }
]).forEach((doc) => printjson(doc));