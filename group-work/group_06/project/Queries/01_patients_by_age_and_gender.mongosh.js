// Query 01: list Lisbon women aged 18-65 sorted by descending age.
// Use case: screening campaigns targeting eligible patients.
// Aggregation returns the top 5 eligible Lisbon females sorted by age descending.
db = db.getSiblingDB("medical_database");

// Aggregate only Lisbon females who fall in the 18-65 age bracket.
db.patients.aggregate([
	{
		$match: {
			"demographics.gender": "F",
			"demographics.age": { $gte: 18, $lte: 65 },
			"contact.address.city": "Lisboa"
		}
	},
	{ $sort: { "demographics.age": -1 } }, // Sort by descending age to target older patients first.
	{ $limit: 5 }
]).forEach((doc) => {
	const demographics = doc.demographics || {};
	const personName = demographics.full_name || "Nome desconhecido";
	const personAge = demographics.age || "Idade nÃ£o registada";
	print(`Paciente: ${doc.patient_id} | ${personName} | Idade: ${personAge}`);
});