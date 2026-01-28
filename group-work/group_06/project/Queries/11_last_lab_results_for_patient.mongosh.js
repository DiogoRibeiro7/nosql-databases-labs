// Query 11: get the last three lab results for a specific patient.
db = db.getSiblingDB("medical_database");

// Project only key lab fields so the cursor remains lean for UI panels.
db.lab_results
	.find({ patient_id: "PT000002" }, { result_id: 1, test_code: 1, test_date: 1, result_value: 1 })
	.sort({ test_date: -1 }) // newest tests first to show fresh data.
	.limit(3)
	.forEach((result) => {
		print(`${result.test_date} | ${result.result_id} | ${result.test_code} | ${result.result_value}`);
	});
