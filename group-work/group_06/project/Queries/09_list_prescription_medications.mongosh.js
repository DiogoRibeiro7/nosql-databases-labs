// Query 09: list visits containing Lisinopril to monitor prescription networks.
load("group-work/group_06/project/queries/ensure_medical_db.mongosh.js");

// Limit to visits where Lisinopril appears, projecting only relevant fields for quick review.
db.visits
	.find(
		{ "prescriptions.medication": "Lisinopril" },
		{ patient_id: 1, visit_date: 1, "prescriptions.$": 1 }
	)
	.limit(10) // keep dashboard-ready volume.
	.forEach((visit) => {
		const prescription = (visit.prescriptions && visit.prescriptions[0]) || {};
		print(`${visit.visit_date} | ${visit.patient_id} | ${prescription.medication || "Sem medicação"}`);
	});