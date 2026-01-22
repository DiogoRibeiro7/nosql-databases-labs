// Selecionar base de dados
use("healthcare");

// Importar ficheiros JSON diretamente da pasta data/
const patients = JSON.parse(("./project/data/patients.json"));
const encounters = JSON.parse(("./project/data/clinical_encounters.json"));
const labs = JSON.parse(("./project/data/lab_results.json"));
const providers = JSON.parse(("./project/data/providers.json"));
const logs = JSON.parse(("./project/data/audit_logs.json"));

// Inserir dados nas coleções
db.Patients.insertMany(patients);
db.ClinicalEncounters.insertMany(encounters);
db.LabResults.insertMany(labs);
db.Providers.insertMany(providers);
db.AuditLogs.insertMany(logs);

print("✔ Dados importados com sucesso!");
