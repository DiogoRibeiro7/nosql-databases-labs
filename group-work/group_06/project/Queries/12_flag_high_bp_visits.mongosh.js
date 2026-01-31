// Query 12: flag visits with high blood pressure for priority follow-up.
load("group-work/group_06/project/queries/ensure_medical_db.mongosh.js");

// Update follow_up.required to true for hypertension alerts during triage.
const updateResult = db.visits.updateMany(
	{
		$or: [
			{ "vital_signs.blood_pressure.systolic": { $gte: 140 } },
			{ "vital_signs.blood_pressure.diastolic": { $gte: 90 } }
		]
	},
	{
		$set: {
			"follow_up.required": true,
			"follow_up.timeframe": "72 hours"
		}
	}
);
print("Visitas atualizadas:", updateResult.modifiedCount);
