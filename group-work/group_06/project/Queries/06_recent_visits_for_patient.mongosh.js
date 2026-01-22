// Query 06: list the most recent visits of a patient to review recent history.
db = db.getSiblingDB("medical_database");

// Fetch latest five visits in descending order so coordinators see recent encounters first.
db.visits
	.find({ patient_id: "PT000002" }, { visit_date: 1, department: 1, provider: 1 })
	.sort({ visit_date: -1 })
	.limit(5)
	.forEach((visit) => {
		const providerName = (visit.provider && visit.provider.name) || "Prestador desconhecido";
		print(`${visit.visit_date} | ${visit.department} | ${providerName}`);
	});
