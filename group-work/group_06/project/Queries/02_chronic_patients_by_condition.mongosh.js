// Query 02: list patients with Diabetes or Hypertension for chronic care planning.
// Focus: a direct filter that finds patients needing ongoing monitoring.
// This find-call extracts key identifiers for chronic-care follow-up squads.
db = db.getSiblingDB("medical_database");

// Directly project identifiers to keep the cursor lightweight for dashboard feeds.
db.patients
	.find(
		{ "medical_history.chronic_conditions": { $in: ["Diabetes", "Hypertension"] } },
		{
			patient_id: 1,
			"demographics.full_name": 1,
			"demographics.age": 1,
			"medical_history.chronic_conditions": 1
		}
	)
	.limit(15)
	.forEach((patient) => {
		const demographics = patient.demographics || {};
		const conditions = (patient.medical_history && patient.medical_history.chronic_conditions) || [];
		const name = demographics.full_name || "Nome não registado";
		const conditionList = conditions.length ? conditions.join(", ") : "Sem registos";
		print(`${patient.patient_id} | ${name} | Condições: ${conditionList}`);
	});
