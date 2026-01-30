// Query 04: update an existing patient's contact details to keep records current.
// Applies contact updates to keep patient communication channels valid.
load("group-work/group_06/project/queries/ensure_medical_db.mongosh.js");

// Keep communication channels current by updating contact info and timestamp.
const outcome = db.patients.updateOne(
	{ patient_id: "PT000003" },
	{
		$set: {
			"contact.phone": "+351911000111",
			"contact.address.city": "Lisboa",
			"contact.address.street": "Av. Liberdade, 100"
		},
		$currentDate: { contact_last_updated: true }
	}
);
print("Pacientes atualizados:", outcome.modifiedCount);