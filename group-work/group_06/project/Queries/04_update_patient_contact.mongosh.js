// Query 04: update an existing patient's contact details to keep records current.
// Applies contact updates to keep patient communication channels valid.
db = db.getSiblingDB("medical_database");

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