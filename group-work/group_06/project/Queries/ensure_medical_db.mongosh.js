// Garante que estamos em medical_database e que as collections existem.
db = db.getSiblingDB("medical_database");
const collections = db.getCollectionNames();
const required = ["patients", "visits", "lab_results"];
const missing = required.filter((c) => !collections.includes(c));
if (missing.length) {
	throw new Error("medical_database falta collections: " + missing.join(", ") + ". Corre primeiro o import_data.sh (ver README).");
}
