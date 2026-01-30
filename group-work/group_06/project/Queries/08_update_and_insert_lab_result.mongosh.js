// Query 08: ensure the latest lab result stays recorded using upsert.
load("group-work/group_06/project/queries/ensure_medical_db.mongosh.js");

// Use upsert to overwrite the latest value without duplicating result_id.
const labOutcome = db.lab_results.updateOne(
	{ result_id: "LR010200" },
	{
		$set: {
			patient_id: "PT000002",
			test_code: "CMP",
			test_date: new Date("2025-04-01T10:00:00Z"),
			result_value: "Normal",
			abnormal_flag: "N"
		},
		$setOnInsert: {
			created_at: new Date() // mark when the document was created if new.
		}
	},
	{ upsert: true }
);
print("Documentos afetados:", labOutcome.modifiedCount + labOutcome.upsertedCount);
