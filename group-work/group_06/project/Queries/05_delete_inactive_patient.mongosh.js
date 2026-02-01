// Query 05: remove an inactive patient to keep the dataset lean.
// Deletes inactive entries that no longer need to consume storage.
load("group-work/group_06/project/queries/ensure_medical_db.mongosh.js");

// Clean up storage by removing entries flagged as inactive for reporting.
const deleteResult = db.patients.deleteOne({
	patient_id: "PT000010",
	"medical_history.active": { $ne: true }
});
print("Pacientes eliminados:", deleteResult.deletedCount);