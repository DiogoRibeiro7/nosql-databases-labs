use("healthcare");

// 1. Histórico clínico completo de um paciente
db.ClinicalEncounters.aggregate([
  { $match: { patientId: "P0001" } },
  {
    $lookup: {
      from: "LabResults",
      localField: "encounterId",
      foreignField: "encounterId",
      as: "labResults"
    }
  },
  { $sort: { date: -1 } }
]);

// 2. Consultas de urgência
db.ClinicalEncounters.find({ type: "urgencia" });

// 3. Diagnósticos de um paciente
db.ClinicalEncounters.aggregate([
  { $match: { patientId: "P0001" } },
  { $unwind: "$diagnoses" },
  { $project: { _id: 0, encounterId: 1, diagnosis: "$diagnoses" } }
]);

// 4. Observações de pressão arterial
db.ClinicalEncounters.find({
  "observations.type": "blood_pressure"
});