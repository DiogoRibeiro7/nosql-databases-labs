use("healthcare");

print("=== TESTE 1: Histórico clínico de P0001 ===");
printjson(
  db.ClinicalEncounters.aggregate([
    { $match: { patientId: "P0001" } },
    {
      $lookup: {
        from: "LabResults",
        localField: "encounterId",
        foreignField: "encounterId",
        as: "labResults"
      }
    }
  ]).toArray()
);

print("=== TESTE 2: Exames do paciente P0001 ===");
printjson(
  db.LabResults.find({ patientId: "P0001" }).toArray()
);

print("=== TESTE 3: Consultas de urgência ===");
printjson(
  db.ClinicalEncounters.find({ type: "urgencia" }).toArray()
);

print("=== TESTE 4: Exames por tipo ===");
printjson(
  db.LabResults.aggregate([
    { $group: { _id: "$testType", total: { $sum: 1 } } }
  ]).toArray()
);

print("=== TESTE 5: Ações auditadas por utilizador ===");
printjson(
  db.AuditLogs.aggregate([
    { $group: { _id: "$userId", total: { $sum: 1 } } }
  ]).toArray()
);

print("=== FIM DOS TESTES DE QUERIES ===");