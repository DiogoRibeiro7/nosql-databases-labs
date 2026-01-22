use("healthcare");

// 1. Todos os resultados laboratoriais de um paciente
db.LabResults.find({ patientId: "P0001" });

// 2. Resultados laboratoriais num intervalo de datas
db.LabResults.find({
  collectedAt: {
    $gte: ISODate("2024-01-01T00:00:00Z"),
    $lte: ISODate("2024-12-31T23:59:59Z")
  }
});

// 3. Procurar exames por tipo
db.LabResults.find({ testType: "Hemograma" });

// 4. Listar parâmetros individuais de um exame
db.LabResults.aggregate([
  { $match: { labResultId: "L5001" } },
  { $unwind: "$results" },
  { $project: { parameter: "$results.parameter", value: "$results.value", unit: "$results.unit" } }
]);

// 5. Contar exames por paciente
db.LabResults.aggregate([
  { $group: { _id: "$patientId", totalExams: { $sum: 1 } } }
]);