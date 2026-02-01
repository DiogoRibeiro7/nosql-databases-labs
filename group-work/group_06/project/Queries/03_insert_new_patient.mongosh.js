// Query 03: create a new patient record with basic data.
// Real scenario: quick intake for initial triage.
// Simple insert to seed a triage patient for follow-up workflows.
load("group-work/group_06/project/queries/ensure_medical_db.mongosh.js");

// Insert a quick triage patient entry so follow-up teams can access a consistent record.
db.patients.insertOne({
	patient_id: "PT010001",
	demographics: {
		full_name: "Mariana Sousa",
		first_name: "Mariana",
		last_name: "Sousa",
		age: 34,
		gender: "F"
	},
	contact: {
		phone: "+351912345678",
		email: "mariana.sousa@example.pt",
		address: {
			city: "Lisboa",
			district: "Parque das Nações"
		}
	},
	medical_history: {
		chronic_conditions: ["Allergy"],
		active: true
	},
	created_at: new Date()
});
print("Inserido paciente: PT010001");
