use("healthcare");

// 1. Número de encontros clínicos por tipo
db.ClinicalEncounters.aggregate([
  { $group: { _id: "$type", total: { $sum: 1 } } }
]);

// 2. Média de temperatura em episódios de urgência
db.ClinicalEncounters.aggregate([
  { $match: { type: "urgencia" } },
  { $unwind: "$observations" },
  { $match: { "observations.type": "temperature" } },
  { $group: { _id: null, avgTemp: { $avg: "$observations.value" } } }
]);

// 3. Exames mais frequentes
db.LabResults.aggregate([
  { $group: { _id: "$testType", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
]);

// 4. Acessos auditados por utilizador
db.AuditLogs.aggregate([
  { $group: { _id: "$userId", totalActions: { $sum: 1 } } }
]);

// 5. Ações auditadas por tipo de recurso
db.AuditLogs.aggregate([
  { $group: { _id: "$resourceType", total: { $sum: 1 } } }
]);