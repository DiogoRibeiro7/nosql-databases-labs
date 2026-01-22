db = db.getSiblingDB("lab_results");
print("List of Patients diagnosed with Myalgia:");
db.visits.aggregate([
  {
    $match: {
      "diagnosis.name": "Myalgia",
    },
  },
  {
    $lookup: {
      from: "patients",
      localField: "patient_id",
      foreignField: "patient_id",
      as: "paciente",
    },
  },
  { $unwind: "$paciente" },
  {
    $project: {
      _id: 0,
      Paciente: "$paciente.demographics.full_name",
      Diagnostico: "Myalgia",
      Data: "$visit_date",
    },
  },
]).forEach((doc) => printjson(doc));