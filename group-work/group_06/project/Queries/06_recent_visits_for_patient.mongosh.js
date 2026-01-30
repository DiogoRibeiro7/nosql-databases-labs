// Query 06: list the most recent visits of a patient to review recent history.
// Change PATIENT_ID below to query a different patient.
const PATIENT_ID = "PT000002";
load("group-work/group_06/project/queries/ensure_medical_db.mongosh.js");

// Fetch latest five visits in descending order so coordinators see recent encounters first.
db.visits
	.find({ patient_id: PATIENT_ID }, { visit_date: 1, department: 1, provider: 1 })
	.sort({ visit_date: -1 })
	.limit(5)
	.forEach((visit) => {
		const providerName = (visit.provider && visit.provider.name) || "Prestador desconhecido";
		print(`${visit.visit_date} | ${visit.department} | ${providerName}`);
	});
