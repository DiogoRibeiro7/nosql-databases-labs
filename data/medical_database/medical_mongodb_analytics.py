"""
Medical Records MongoDB Transformation & Analytics
==================================================
Transform and analyze medical records in MongoDB.

Author: Diogo Ribeiro - ESMAD/IPP
"""

from pymongo import MongoClient, ASCENDING, DESCENDING, TEXT
from datetime import datetime, timedelta
import json
from pathlib import Path
from typing import Dict, List, Any


class MedicalMongoDBAnalytics:
    """Medical records MongoDB operations and analytics."""

    def __init__(self, mongo_uri: str = "mongodb://localhost:27017", db_name: str = "medical"):
        self.client = MongoClient(mongo_uri)
        self.db = self.client[db_name]

    def import_data(self, data_dir: str = "./medical_database"):
        """Import JSON data into MongoDB collections."""
        data_path = Path(data_dir)

        print("Importing Medical Data to MongoDB...")
        print("=" * 50)

        # Import patients
        patients_file = data_path / "patients.json"
        if patients_file.exists():
            with open(patients_file, "r", encoding="utf-8") as f:
                patients = json.load(f)

            self.db.patients.drop()
            self.db.patients.insert_many(patients)
            print(f"✓ Imported {len(patients)} patients")

        # Import visits
        visits_file = data_path / "visits.json"
        if visits_file.exists():
            with open(visits_file, "r", encoding="utf-8") as f:
                visits = json.load(f)

            self.db.visits.drop()
            self.db.visits.insert_many(visits)
            print(f"✓ Imported {len(visits)} visits")

        # Import lab results
        labs_file = data_path / "lab_results.json"
        if labs_file.exists():
            with open(labs_file, "r", encoding="utf-8") as f:
                lab_results = json.load(f)

            self.db.lab_results.drop()
            self.db.lab_results.insert_many(lab_results)
            print(f"✓ Imported {len(lab_results)} lab results")

        # Create indexes
        self.create_indexes()
        print("\n✓ Data import complete!")

    def create_indexes(self):
        """Create optimal indexes for medical queries."""
        print("\nCreating indexes...")

        # Patient indexes
        self.db.patients.create_index([("patient_id", ASCENDING)], unique=True)
        self.db.patients.create_index([("health_number", ASCENDING)], unique=True)
        self.db.patients.create_index([("demographics.last_name", ASCENDING)])
        self.db.patients.create_index([("demographics.age", ASCENDING)])
        self.db.patients.create_index([("contact.address.city", ASCENDING)])
        self.db.patients.create_index([("medical_history.chronic_conditions", ASCENDING)])
        self.db.patients.create_index([("demographics.full_name", TEXT)])

        # Visit indexes
        self.db.visits.create_index([("visit_id", ASCENDING)], unique=True)
        self.db.visits.create_index([("patient_id", ASCENDING), ("visit_date", DESCENDING)])
        self.db.visits.create_index([("department", ASCENDING)])
        self.db.visits.create_index([("diagnosis.code", ASCENDING)])
        self.db.visits.create_index([("visit_date", DESCENDING)])

        # Lab result indexes
        self.db.lab_results.create_index([("result_id", ASCENDING)], unique=True)
        self.db.lab_results.create_index([("patient_id", ASCENDING), ("test_date", DESCENDING)])
        self.db.lab_results.create_index([("test_code", ASCENDING)])
        self.db.lab_results.create_index([("abnormal_flag", ASCENDING)])

        print("✓ Indexes created")

    # ===============================
    # QUERY EXAMPLES
    # ===============================

    def find_high_risk_patients(self):
        """Find patients at high risk (elderly with multiple conditions)."""
        print("\n[High-Risk Patients Analysis]")

        high_risk = list(
            self.db.patients.find(
                {
                    "$and": [
                        {"demographics.age": {"$gte": 65}},
                        {"medical_history.chronic_conditions": {"$exists": True}},
                        {"$expr": {"$gte": [{"$size": "$medical_history.chronic_conditions"}, 3]}},
                    ]
                },
                {"patient_id": 1, "demographics.full_name": 1, "demographics.age": 1, "medical_history.chronic_conditions": 1},
            ).limit(10)
        )

        print(f"Found {len(high_risk)} high-risk patients (showing first 10):")
        for patient in high_risk[:5]:
            conditions = ", ".join(patient["medical_history"]["chronic_conditions"])
            print(f"  • {patient['demographics']['full_name']}, Age: {patient['demographics']['age']}")
            print(f"    Conditions: {conditions}")

        return high_risk

    def analyze_department_load(self):
        """Analyze patient visits by department."""
        print("\n[Department Load Analysis]")

        pipeline = [
            {"$group": {"_id": "$department", "total_visits": {"$sum": 1}, "unique_patients": {"$addToSet": "$patient_id"}}},
            {"$project": {"department": "$_id", "total_visits": 1, "unique_patient_count": {"$size": "$unique_patients"}}},
            {"$sort": {"total_visits": -1}},
        ]

        results = list(self.db.visits.aggregate(pipeline))

        print("Department visit statistics:")
        for dept in results[:5]:
            print(f"  • {dept['department']}: {dept['total_visits']} visits, {dept['unique_patient_count']} unique patients")

        return results

    def find_patients_needing_followup(self):
        """Find patients with abnormal lab results needing follow-up."""
        print("\n[Patients Needing Follow-up]")

        # Find patients with recent abnormal results
        thirty_days_ago = (datetime.now() - timedelta(days=30)).date().isoformat()

        pipeline = [
            {"$match": {"abnormal_flag": "H", "test_date": {"$gte": thirty_days_ago}}},
            {
                "$group": {
                    "_id": "$patient_id",
                    "abnormal_tests": {"$push": {"test": "$test_name", "value": "$value", "date": "$test_date"}},
                    "count": {"$sum": 1},
                }
            },
            {"$sort": {"count": -1}},
            {"$limit": 10},
            {"$lookup": {"from": "patients", "localField": "_id", "foreignField": "patient_id", "as": "patient_info"}},
            {"$unwind": "$patient_info"},
        ]

        results = list(self.db.lab_results.aggregate(pipeline))

        print(f"Patients with recent abnormal lab results:")
        for record in results[:5]:
            patient_name = record["patient_info"]["demographics"]["full_name"]
            print(f"  • {patient_name} ({record['_id']})")
            print(f"    {record['count']} abnormal test(s)")
            for test in record["abnormal_tests"][:2]:
                print(f"    - {test['test']}: {test['value']} on {test['date']}")

        return results

    def medication_analysis(self):
        """Analyze most prescribed medications."""
        print("\n[Medication Analysis]")

        pipeline = [
            {"$unwind": "$medical_history.current_medications"},
            {
                "$group": {
                    "_id": "$medical_history.current_medications.name",
                    "patient_count": {"$sum": 1},
                    "conditions": {"$addToSet": "$medical_history.current_medications.condition"},
                }
            },
            {"$sort": {"patient_count": -1}},
            {"$limit": 10},
        ]

        results = list(self.db.patients.aggregate(pipeline))

        print("Most prescribed medications:")
        for med in results[:5]:
            conditions = ", ".join(med["conditions"])
            print(f"  • {med['_id']}: {med['patient_count']} patients")
            print(f"    For: {conditions}")

        return results

    def patient_360_view(self, patient_id: str = "PT000001"):
        """Get complete patient view with recent activity."""
        print(f"\n[Patient 360° View - {patient_id}]")

        pipeline = [
            {"$match": {"patient_id": patient_id}},
            {
                "$lookup": {
                    "from": "visits",
                    "let": {"pid": "$patient_id"},
                    "pipeline": [
                        {"$match": {"$expr": {"$eq": ["$patient_id", "$$pid"]}}},
                        {"$sort": {"visit_date": -1}},
                        {"$limit": 5},
                    ],
                    "as": "recent_visits",
                }
            },
            {
                "$lookup": {
                    "from": "lab_results",
                    "let": {"pid": "$patient_id"},
                    "pipeline": [
                        {"$match": {"$expr": {"$eq": ["$patient_id", "$$pid"]}}},
                        {"$sort": {"test_date": -1}},
                        {"$limit": 10},
                    ],
                    "as": "recent_labs",
                }
            },
        ]

        result = list(self.db.patients.aggregate(pipeline))

        if result:
            patient = result[0]
            print(f"Patient: {patient['demographics']['full_name']}")
            print(f"Age: {patient['demographics']['age']}, Gender: {patient['demographics']['gender']}")
            print(f"Blood Type: {patient['demographics']['blood_type']}")

            if patient["medical_history"]["chronic_conditions"]:
                print(f"Chronic Conditions: {', '.join(patient['medical_history']['chronic_conditions'])}")

            if patient["medical_history"]["allergies"]:
                print(f"Allergies: {', '.join(patient['medical_history']['allergies'])}")

            print(f"\nRecent Visits ({len(patient['recent_visits'])}):")
            for visit in patient["recent_visits"][:3]:
                print(f"  • {visit['visit_date'][:10]} - {visit['type']}")
                if visit["diagnosis"]:
                    print(f"    Diagnosis: {visit['diagnosis'][0]['name']}")

            # Check for abnormal labs
            abnormal_labs = [lab for lab in patient["recent_labs"] if lab["abnormal_flag"] == "H"]
            if abnormal_labs:
                print(f"\n⚠ Abnormal Lab Results ({len(abnormal_labs)}):")
                for lab in abnormal_labs[:3]:
                    print(f"  • {lab['test_name']}: {lab['value']} {lab['unit']} (Normal: {lab['normal_range']})")

        return result

    def chronic_disease_statistics(self):
        """Analyze chronic disease prevalence."""
        print("\n[Chronic Disease Statistics]")

        pipeline = [
            {"$unwind": "$medical_history.chronic_conditions"},
            {
                "$group": {
                    "_id": "$medical_history.chronic_conditions",
                    "patient_count": {"$sum": 1},
                    "avg_age": {"$avg": "$demographics.age"},
                }
            },
            {"$sort": {"patient_count": -1}},
        ]

        results = list(self.db.patients.aggregate(pipeline))

        total_patients = self.db.patients.count_documents({})

        print(f"Chronic disease prevalence (Total patients: {total_patients}):")
        for disease in results[:10]:
            prevalence = (disease["patient_count"] / total_patients) * 100
            print(f"  • {disease['_id']}: {disease['patient_count']} patients ({prevalence:.1f}%)")
            print(f"    Average age: {disease['avg_age']:.1f} years")

        return results

    def emergency_visits_trend(self):
        """Analyze emergency department visit trends."""
        print("\n[Emergency Department Trends]")

        pipeline = [
            {"$match": {"department": "Emergency"}},
            {"$project": {"month": {"$substr": ["$visit_date", 0, 7]}, "patient_id": 1}},
            {"$group": {"_id": "$month", "visit_count": {"$sum": 1}, "unique_patients": {"$addToSet": "$patient_id"}}},
            {"$project": {"month": "$_id", "visit_count": 1, "unique_patient_count": {"$size": "$unique_patients"}}},
            {"$sort": {"month": -1}},
            {"$limit": 12},
        ]

        results = list(self.db.visits.aggregate(pipeline))

        print("Emergency department visits (last 12 months):")
        for month in results[:6]:
            print(f"  • {month['month']}: {month['visit_count']} visits, {month['unique_patient_count']} unique patients")

        return results

    def run_all_analytics(self):
        """Run all analytics queries."""
        print("\n" + "=" * 60)
        print("MEDICAL DATABASE ANALYTICS")
        print("=" * 60)

        # Basic statistics
        patient_count = self.db.patients.count_documents({})
        visit_count = self.db.visits.count_documents({})
        lab_count = self.db.lab_results.count_documents({})

        print(f"\nDatabase Statistics:")
        print(f"  • Total Patients: {patient_count:,}")
        print(f"  • Total Visits: {visit_count:,}")
        print(f"  • Total Lab Results: {lab_count:,}")

        # Run analytics
        self.find_high_risk_patients()
        self.analyze_department_load()
        self.find_patients_needing_followup()
        self.medication_analysis()
        self.chronic_disease_statistics()
        self.emergency_visits_trend()
        self.patient_360_view()

        print("\n" + "=" * 60)
        print("Analytics Complete!")
        print("=" * 60)


def main():
    """Main execution function."""
    import argparse

    parser = argparse.ArgumentParser(description="Medical MongoDB Analytics")
    parser.add_argument("--import", "-i", action="store_true", help="Import data from JSON files")
    parser.add_argument("--data-dir", "-d", default="./medical_database", help="Directory containing JSON files")
    parser.add_argument("--uri", "-u", default="mongodb://localhost:27017", help="MongoDB URI")
    parser.add_argument("--database", default="medical", help="Database name")

    args = parser.parse_args()

    # Initialize analytics
    analytics = MedicalMongoDBAnalytics(mongo_uri=args.uri, db_name=args.database)

    # Import data if requested
    if getattr(args, "import"):
        analytics.import_data(args.data_dir)

    # Run analytics
    analytics.run_all_analytics()


if __name__ == "__main__":
    main()
