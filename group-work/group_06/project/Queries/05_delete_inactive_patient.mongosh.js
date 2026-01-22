// Query 05: remove an inactive patient to keep the dataset lean.
// Deletes inactive entries that no longer need to consume storage.
db = db.getSiblingDB("medical_database");

// Clean up storage by removing entries flagged as inactive for reporting.
const deleteResult = db.patients.deleteOne({
	patient_id: "PT000010",
	"medical_history.active": { $ne: true }
});
print("Pacientes eliminados:", deleteResult.deletedCount);