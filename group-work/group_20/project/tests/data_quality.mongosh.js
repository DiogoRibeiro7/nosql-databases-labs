use("healthcare");

print("=== TESTE 1: Pacientes com patientId duplicado ===");
printjson(
  db.Patients.aggregate([
    { $group: { _id: "$patientId", count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } }
  ]).toArray()
);

print("=== TESTE 2: ClinicalEncounters sem paciente correspondente ===");
printjson(
  db.ClinicalEncounters.aggregate([
    {
      $lookup: {
        from: "Patients",
        localField: "patientId",
        foreignField: "patientId",
        as: "p"
      }
    },
    { $match: { p: { $size: 0 } } }
  ]).toArray()
);

print("=== TESTE 3: LabResults sem encounter correspondente ===");
printjson(
  db.LabResults.aggregate([
    {
      $lookup: {
        from: "ClinicalEncounters",
        localField: "encounterId",
        foreignField: "encounterId",
        as: "e"
      }
    },
    { $match: { e: { $size: 0 } } }
  ]).toArray()
);

print("=== TESTE 4: Providers sem providerId único ===");
printjson(
  db.Providers.aggregate([
    { $group: { _id: "$providerId", count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } }
  ]).toArray()
);

print("=== TESTE 5: AuditLogs com resourceId inexistente ===");
printjson(
  db.AuditLogs.aggregate([
    {
      $lookup: {
        from: "Patients",
        localField: "resourceId",
        foreignField: "patientId",
        as: "p"
      }
    },
    {
      $lookup: {
        from: "ClinicalEncounters",
        localField: "resourceId",
        foreignField: "encounterId",
        as: "e"
      }
    },
    {
      $match: {
        $and: [
          { p: { $size: 0 } },
          { e: { $size: 0 } }
        ]
      }
    }
  ]).toArray()
);

print("=== FIM DOS TESTES DE INTEGRIDADE ===");