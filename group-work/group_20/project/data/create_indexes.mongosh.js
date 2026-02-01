use("healthcare");

// Patients
db.Patients.createIndex({ patientId: 1 }, { unique: true });

// Clinical Encounters
db.ClinicalEncounters.createIndex({ encounterId: 1 }, { unique: true });
db.ClinicalEncounters.createIndex({ patientId: 1, date: -1 });

// Lab Results
db.LabResults.createIndex({ labResultId: 1 }, { unique: true });
db.LabResults.createIndex({ patientId: 1, collectedAt: -1 });

// Providers
db.Providers.createIndex({ providerId: 1 }, { unique: true });

// Audit Logs
db.AuditLogs.createIndex({ resourceId: 1, timestamp: -1 });

print("✔ Índices criados com sucesso!");

