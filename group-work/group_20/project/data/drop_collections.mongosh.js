use("healthcare");

db.Patients.drop();
db.ClinicalEncounters.drop();
db.LabResults.drop();
db.Providers.drop();
db.AuditLogs.drop();

print("✔ Coleções removidas com sucesso!");
