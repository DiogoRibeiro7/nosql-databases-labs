#!/usr/bin/env python3
"""
Synthetic Medical Records Database Generator
============================================
Generates realistic but FAKE medical records for educational purposes.
Complies with HIPAA/GDPR by using only synthetic data.

Author: Diogo Ribeiro - ESMAD/IPP
"""

import json
import random
import uuid
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Dict, Any
import argparse
from faker import Faker


class MedicalDatabaseGenerator:
    """Generate synthetic medical records for MongoDB."""

    def __init__(self, num_patients: int = 1000):
        self.fake = Faker(["pt_PT", "en_US"])  # Portuguese and English names
        self.num_patients = num_patients
        self.output_dir = Path("./medical_database")
        self.output_dir.mkdir(exist_ok=True)

        # Medical reference data
        self.blood_types = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
        self.allergies = [
            "Penicillin",
            "Amoxicillin",
            "Ibuprofen",
            "Aspirin",
            "Sulfa drugs",
            "Peanuts",
            "Tree nuts",
            "Milk",
            "Eggs",
            "Shellfish",
            "Latex",
            "Pollen",
            "Dust mites",
            "Pet dander",
            "None",
        ]

        self.chronic_conditions = [
            "Hypertension",
            "Type 2 Diabetes",
            "Asthma",
            "COPD",
            "Arthritis",
            "Heart Disease",
            "Chronic Kidney Disease",
            "Depression",
            "Anxiety",
            "Hyperlipidemia",
            "Hypothyroidism",
            "Osteoporosis",
            "None",
        ]

        self.medications = [
            {"name": "Lisinopril", "dosage": "10mg", "frequency": "Once daily", "condition": "Hypertension"},
            {"name": "Metformin", "dosage": "500mg", "frequency": "Twice daily", "condition": "Type 2 Diabetes"},
            {"name": "Albuterol", "dosage": "90mcg", "frequency": "As needed", "condition": "Asthma"},
            {"name": "Atorvastatin", "dosage": "20mg", "frequency": "Once daily", "condition": "Hyperlipidemia"},
            {"name": "Levothyroxine", "dosage": "50mcg", "frequency": "Once daily", "condition": "Hypothyroidism"},
            {"name": "Omeprazole", "dosage": "20mg", "frequency": "Once daily", "condition": "GERD"},
            {"name": "Sertraline", "dosage": "50mg", "frequency": "Once daily", "condition": "Depression"},
            {"name": "Amlodipine", "dosage": "5mg", "frequency": "Once daily", "condition": "Hypertension"},
        ]

        self.test_types = [
            {"name": "Complete Blood Count", "code": "CBC", "unit": "", "normal_range": "Various"},
            {"name": "Blood Glucose", "code": "GLU", "unit": "mg/dL", "normal_range": "70-100"},
            {"name": "Cholesterol Total", "code": "CHOL", "unit": "mg/dL", "normal_range": "<200"},
            {"name": "Blood Pressure", "code": "BP", "unit": "mmHg", "normal_range": "<120/80"},
            {"name": "Hemoglobin A1C", "code": "HBA1C", "unit": "%", "normal_range": "<5.7"},
            {"name": "Creatinine", "code": "CREAT", "unit": "mg/dL", "normal_range": "0.7-1.3"},
            {"name": "TSH", "code": "TSH", "unit": "mIU/L", "normal_range": "0.4-4.0"},
            {"name": "Vitamin D", "code": "VITD", "unit": "ng/mL", "normal_range": "30-100"},
        ]

        self.departments = [
            "Emergency",
            "Cardiology",
            "Orthopedics",
            "Neurology",
            "Pediatrics",
            "Obstetrics",
            "Internal Medicine",
            "Surgery",
            "Psychiatry",
            "Radiology",
        ]

        self.visit_reasons = [
            "Routine checkup",
            "Follow-up visit",
            "Acute illness",
            "Chronic disease management",
            "Vaccination",
            "Physical exam",
            "Lab results review",
            "Medication refill",
            "Emergency",
            "Surgical consultation",
            "Preventive care",
            "Mental health",
        ]

        self.symptoms = [
            "Fever",
            "Cough",
            "Headache",
            "Fatigue",
            "Chest pain",
            "Shortness of breath",
            "Abdominal pain",
            "Back pain",
            "Joint pain",
            "Nausea",
            "Dizziness",
            "Skin rash",
            "Sore throat",
            "Anxiety",
            "Insomnia",
        ]

        self.diagnoses = [
            {"code": "J06.9", "name": "Acute upper respiratory infection"},
            {"code": "I10", "name": "Essential hypertension"},
            {"code": "E11.9", "name": "Type 2 diabetes mellitus"},
            {"code": "J45.909", "name": "Asthma"},
            {"code": "K21.9", "name": "Gastro-esophageal reflux disease"},
            {"code": "M79.3", "name": "Myalgia"},
            {"code": "F32.9", "name": "Major depressive disorder"},
            {"code": "F41.9", "name": "Anxiety disorder"},
            {"code": "E78.5", "name": "Hyperlipidemia"},
            {"code": "N39.0", "name": "Urinary tract infection"},
        ]

    def generate_patient(self, patient_id: int) -> Dict[str, Any]:
        """Generate a single patient record."""

        # Basic demographics
        gender = random.choice(["M", "F"])
        is_portuguese = random.random() > 0.3  # 70% Portuguese patients

        if is_portuguese:
            if gender == "M":
                first_name = self.fake.first_name_male()
                last_name = self.fake.last_name()
            else:
                first_name = self.fake.first_name_female()
                last_name = self.fake.last_name()
        else:
            first_name = self.fake.first_name()
            last_name = self.fake.last_name()

        birth_date = self.fake.date_of_birth(minimum_age=1, maximum_age=95)
        age = (datetime.now().date() - birth_date).days // 365

        # Generate Portuguese health number (SNS) or generic ID
        if is_portuguese:
            health_number = f"SNS{random.randint(100000000, 999999999)}"
        else:
            health_number = f"HC{patient_id:08d}"

        # Medical information
        blood_type = random.choice(self.blood_types)

        # Age-based chronic conditions (more likely in older patients)
        num_conditions = 0 if age < 30 else random.randint(0, min(3, (age // 20)))
        chronic_conditions = (
            random.sample(
                [c for c in self.chronic_conditions if c != "None"], min(num_conditions, len(self.chronic_conditions) - 1)
            )
            if num_conditions > 0
            else []
        )

        # Allergies
        num_allergies = random.randint(0, 2)
        allergies = random.sample([a for a in self.allergies if a != "None"], num_allergies) if num_allergies > 0 else []

        # Current medications based on conditions
        current_medications = []
        for condition in chronic_conditions:
            matching_meds = [m for m in self.medications if m["condition"] == condition]
            if matching_meds:
                current_medications.append(random.choice(matching_meds))

        # Contact information
        if is_portuguese:
            city = random.choice(["Porto", "Lisboa", "Braga", "Coimbra", "Aveiro", "Faro", "Viseu"])
            phone = f"+351 {random.randint(910000000, 969999999)}"
        else:
            city = self.fake.city()
            phone = self.fake.phone_number()

        patient = {
            "patient_id": f"PT{patient_id:06d}",
            "health_number": health_number,
            "demographics": {
                "first_name": first_name,
                "last_name": last_name,
                "full_name": f"{first_name} {last_name}",
                "date_of_birth": birth_date.isoformat(),
                "age": age,
                "gender": gender,
                "blood_type": blood_type,
            },
            "contact": {
                "address": {
                    "street": self.fake.street_address(),
                    "city": city,
                    "postal_code": (
                        f"{random.randint(1000, 9999)}-{random.randint(100, 999)}" if is_portuguese else self.fake.postcode()
                    ),
                    "country": "Portugal" if is_portuguese else self.fake.country(),
                },
                "phone": phone,
                "email": f"{first_name.lower()}.{last_name.lower()}@{self.fake.free_email_domain()}",
                "emergency_contact": {
                    "name": self.fake.name(),
                    "relationship": random.choice(["Spouse", "Parent", "Child", "Sibling", "Friend"]),
                    "phone": self.fake.phone_number(),
                },
            },
            "medical_history": {
                "chronic_conditions": chronic_conditions,
                "allergies": allergies,
                "current_medications": current_medications,
                "family_history": self.generate_family_history(),
                "surgical_history": self.generate_surgical_history(age),
                "immunizations": self.generate_immunizations(age),
            },
            "insurance": {
                "provider": (
                    random.choice(["SNS", "Médis", "Multicare", "AdvanceCare", "Allianz", "Fidelidade"])
                    if is_portuguese
                    else self.fake.company()
                ),
                "policy_number": f"POL{random.randint(100000, 999999)}",
                "group_number": f"GRP{random.randint(1000, 9999)}",
                "effective_date": (datetime.now() - timedelta(days=random.randint(30, 1825))).date().isoformat(),
            },
            "primary_care_physician": {
                "name": f"Dr. {self.fake.name()}",
                "specialty": "Internal Medicine",
                "phone": self.fake.phone_number(),
            },
            "created_at": (datetime.now() - timedelta(days=random.randint(1, 1825))).isoformat(),
            "updated_at": datetime.now().isoformat(),
        }

        return patient

    def generate_family_history(self) -> List[Dict[str, Any]]:
        """Generate family medical history."""
        family_conditions = [
            "Hypertension",
            "Diabetes",
            "Heart Disease",
            "Cancer",
            "Stroke",
            "Alzheimer's",
            "Mental Illness",
            "Kidney Disease",
        ]

        history = []
        for _ in range(random.randint(0, 3)):
            history.append(
                {
                    "relationship": random.choice(["Father", "Mother", "Sibling", "Grandparent"]),
                    "condition": random.choice(family_conditions),
                    "age_at_diagnosis": random.randint(30, 80),
                }
            )

        return history

    def generate_surgical_history(self, age: int) -> List[Dict[str, Any]]:
        """Generate surgical history based on age."""
        surgeries = [
            "Appendectomy",
            "Cholecystectomy",
            "Hernia repair",
            "Knee replacement",
            "Hip replacement",
            "Cataract surgery",
            "Cesarean section",
            "Tonsillectomy",
        ]

        history = []
        num_surgeries = random.randint(0, min(3, age // 20))

        for _ in range(num_surgeries):
            years_ago = random.randint(1, min(age - 18, 40))
            surgery_date = datetime.now() - timedelta(days=years_ago * 365)

            history.append(
                {
                    "procedure": random.choice(surgeries),
                    "date": surgery_date.date().isoformat(),
                    "hospital": f"{random.choice(['São João', 'Santo António', 'Santa Maria', 'General'])} Hospital",
                    "complications": random.choice([None, None, None, "Minor bleeding", "Infection treated"]),
                }
            )

        return history

    def generate_immunizations(self, age: int) -> List[Dict[str, Any]]:
        """Generate immunization records."""
        vaccines = []

        # Standard vaccines
        if age >= 1:
            vaccines.append(
                {
                    "vaccine": "MMR (Measles, Mumps, Rubella)",
                    "date": (datetime.now() - timedelta(days=(age - 1) * 365)).date().isoformat(),
                    "next_due": None,
                }
            )

        if age >= 18:
            # COVID-19 vaccines
            vaccines.append(
                {
                    "vaccine": "COVID-19 (Pfizer/Moderna)",
                    "date": (datetime.now() - timedelta(days=random.randint(365, 1095))).date().isoformat(),
                    "next_due": (datetime.now() + timedelta(days=180)).date().isoformat(),
                }
            )

        # Flu vaccine
        vaccines.append(
            {
                "vaccine": "Influenza",
                "date": (datetime.now() - timedelta(days=random.randint(30, 365))).date().isoformat(),
                "next_due": (datetime.now() + timedelta(days=365)).date().isoformat(),
            }
        )

        if age >= 50:
            vaccines.append(
                {
                    "vaccine": "Shingles (Zoster)",
                    "date": (datetime.now() - timedelta(days=random.randint(30, 730))).date().isoformat(),
                    "next_due": None,
                }
            )

        return vaccines

    def generate_visit(self, patient_id: str, visit_num: int) -> Dict[str, Any]:
        """Generate a medical visit/encounter record."""
        visit_date = datetime.now() - timedelta(days=random.randint(1, 730))

        # Generate vital signs
        vitals = {
            "blood_pressure": {"systolic": random.randint(110, 140), "diastolic": random.randint(70, 90), "unit": "mmHg"},
            "heart_rate": random.randint(60, 100),
            "temperature": round(36 + random.random() * 2, 1),
            "weight": round(50 + random.random() * 50, 1),
            "height": random.randint(150, 195),
            "bmi": round(20 + random.random() * 10, 1),
            "respiratory_rate": random.randint(12, 20),
            "oxygen_saturation": random.randint(95, 100),
        }

        # Generate symptoms and diagnosis
        num_symptoms = random.randint(0, 3)
        symptoms = random.sample(self.symptoms, num_symptoms) if num_symptoms > 0 else []
        diagnosis = random.choice(self.diagnoses)

        visit = {
            "visit_id": f"V{patient_id[2:]}_{visit_num:04d}",
            "patient_id": patient_id,
            "visit_date": visit_date.isoformat(),
            "type": random.choice(self.visit_reasons),
            "department": random.choice(self.departments),
            "provider": {
                "name": f"Dr. {self.fake.name()}",
                "specialty": random.choice(["General Practice", "Internal Medicine", "Cardiology", "Pediatrics"]),
            },
            "chief_complaint": random.choice(symptoms) if symptoms else "Routine checkup",
            "symptoms": symptoms,
            "vital_signs": vitals,
            "diagnosis": [diagnosis],
            "procedures": self.generate_procedures(),
            "prescriptions": self.generate_prescriptions(diagnosis),
            "lab_orders": self.generate_lab_orders(),
            "follow_up": {
                "required": random.choice([True, True, False]),
                "timeframe": random.choice(["1 week", "2 weeks", "1 month", "3 months", "6 months"]),
                "notes": "Continue current treatment plan",
            },
            "notes": f"Patient presents with {', '.join(symptoms) if symptoms else 'no acute symptoms'}. "
            + f"Diagnosis: {diagnosis['name']}. Treatment plan discussed and initiated.",
        }

        return visit

    def generate_procedures(self) -> List[Dict[str, Any]]:
        """Generate medical procedures."""
        procedures = [
            {"code": "99213", "name": "Office visit, established patient", "cost": 150.00},
            {"code": "93000", "name": "Electrocardiogram", "cost": 75.00},
            {"code": "71020", "name": "Chest X-ray", "cost": 125.00},
            {"code": "80053", "name": "Comprehensive metabolic panel", "cost": 85.00},
            {"code": "85025", "name": "Complete blood count", "cost": 45.00},
        ]

        num_procedures = random.randint(1, 3)
        return random.sample(procedures, num_procedures)

    def generate_prescriptions(self, diagnosis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate prescriptions based on diagnosis."""
        prescriptions = []

        # Match medications to diagnosis
        if "hypertension" in diagnosis["name"].lower():
            prescriptions.append(
                {"medication": "Lisinopril", "dosage": "10mg", "frequency": "Once daily", "duration": "90 days", "refills": 3}
            )
        elif "diabetes" in diagnosis["name"].lower():
            prescriptions.append(
                {"medication": "Metformin", "dosage": "500mg", "frequency": "Twice daily", "duration": "90 days", "refills": 3}
            )
        else:
            # Generic prescription
            if random.random() > 0.5:
                prescriptions.append(
                    {
                        "medication": random.choice(["Ibuprofen", "Amoxicillin", "Omeprazole"]),
                        "dosage": random.choice(["200mg", "500mg", "20mg"]),
                        "frequency": random.choice(["As needed", "Twice daily", "Three times daily"]),
                        "duration": random.choice(["7 days", "14 days", "30 days"]),
                        "refills": random.randint(0, 2),
                    }
                )

        return prescriptions

    def generate_lab_orders(self) -> List[Dict[str, Any]]:
        """Generate lab test orders."""
        num_tests = random.randint(0, 4)
        if num_tests == 0:
            return []

        tests = random.sample(self.test_types, num_tests)
        lab_orders = []

        for test in tests:
            lab_orders.append(
                {
                    "test_code": test["code"],
                    "test_name": test["name"],
                    "status": random.choice(["Ordered", "In Progress", "Completed"]),
                    "priority": random.choice(["Routine", "STAT", "ASAP"]),
                }
            )

        return lab_orders

    def generate_lab_result(self, patient_id: str, test_num: int) -> Dict[str, Any]:
        """Generate lab test results."""
        test = random.choice(self.test_types)
        result_date = datetime.now() - timedelta(days=random.randint(1, 365))

        # Generate realistic values
        if test["code"] == "GLU":
            value = random.randint(70, 150)
            abnormal = value > 100
        elif test["code"] == "CHOL":
            value = random.randint(150, 280)
            abnormal = value > 200
        elif test["code"] == "HBA1C":
            value = round(4.5 + random.random() * 4, 1)
            abnormal = value > 5.7
        elif test["code"] == "BP":
            value = f"{random.randint(110, 140)}/{random.randint(70, 90)}"
            abnormal = False
        else:
            value = round(random.uniform(0.5, 10), 2)
            abnormal = random.choice([False, False, False, True])

        result = {
            "result_id": f"LAB{patient_id[2:]}_{test_num:04d}",
            "patient_id": patient_id,
            "test_date": result_date.date().isoformat(),
            "test_code": test["code"],
            "test_name": test["name"],
            "value": str(value),
            "unit": test["unit"],
            "normal_range": test["normal_range"],
            "abnormal_flag": "H" if abnormal else "N",
            "status": "Final",
            "ordering_provider": f"Dr. {self.fake.name()}",
            "lab_facility": random.choice(["Central Lab", "Porto Medical Lab", "Regional Lab Services"]),
            "notes": "Results reviewed and verified" if not abnormal else "Abnormal result - follow up recommended",
        }

        return result

    def run(self):
        """Generate all collections."""
        print("=" * 60)
        print("Medical Records Database Generator")
        print("=" * 60)
        print(f"\nGenerating {self.num_patients} synthetic patient records...")

        # Generate patients
        patients = []
        for i in range(self.num_patients):
            if i % 100 == 0:
                print(f"  Generated {i}/{self.num_patients} patients...")
            patients.append(self.generate_patient(i + 1))

        # Save patients
        patients_file = self.output_dir / "patients.json"
        with open(patients_file, "w", encoding="utf-8") as f:
            json.dump(patients, f, indent=2, ensure_ascii=False)
        print(f"✓ Saved {len(patients)} patients to {patients_file}")

        # Generate visits
        print(f"\nGenerating medical visits...")
        visits = []
        for patient in patients[:500]:  # Generate visits for first 500 patients
            num_visits = random.randint(1, 10)
            for v in range(num_visits):
                visits.append(self.generate_visit(patient["patient_id"], v + 1))

        visits_file = self.output_dir / "visits.json"
        with open(visits_file, "w", encoding="utf-8") as f:
            json.dump(visits, f, indent=2, ensure_ascii=False)
        print(f"✓ Saved {len(visits)} visits to {visits_file}")

        # Generate lab results
        print(f"\nGenerating lab results...")
        lab_results = []
        for patient in patients[:300]:  # Generate lab results for first 300 patients
            num_results = random.randint(2, 15)
            for r in range(num_results):
                lab_results.append(self.generate_lab_result(patient["patient_id"], r + 1))

        labs_file = self.output_dir / "lab_results.json"
        with open(labs_file, "w", encoding="utf-8") as f:
            json.dump(lab_results, f, indent=2, ensure_ascii=False)
        print(f"✓ Saved {len(lab_results)} lab results to {labs_file}")

        # Create MongoDB schema suggestion
        self.create_mongodb_schema()

        # Summary statistics
        print("\n" + "=" * 60)
        print("Generation Complete!")
        print("=" * 60)
        print(f"\nDatabase Statistics:")
        print(f"  • Patients: {len(patients)}")
        print(f"  • Medical Visits: {len(visits)}")
        print(f"  • Lab Results: {len(lab_results)}")
        print(f"  • Total Documents: {len(patients) + len(visits) + len(lab_results)}")

        # Calculate some interesting stats
        avg_age = sum(p["demographics"]["age"] for p in patients) / len(patients)
        print(f"\nPatient Demographics:")
        print(f"  • Average Age: {avg_age:.1f} years")
        print(
            f"  • Gender Distribution: {sum(1 for p in patients if p['demographics']['gender'] == 'M')} M / {sum(1 for p in patients if p['demographics']['gender'] == 'F')} F"
        )

        print(f"\n✓ Files saved in: {self.output_dir.absolute()}")

        print("\nNext Steps:")
        print("1. Import to MongoDB:")
        print("   mongoimport --db medical --collection patients --file medical_database/patients.json --jsonArray")
        print("   mongoimport --db medical --collection visits --file medical_database/visits.json --jsonArray")
        print("   mongoimport --db medical --collection lab_results --file medical_database/lab_results.json --jsonArray")
        print("\n2. Review the MongoDB schema in: medical_database/mongodb_schema.js")

    def create_mongodb_schema(self):
        """Create MongoDB schema recommendations."""
        schema = """// Medical Records MongoDB Schema
// ================================

// 1. Patients Collection - Complete patient profile
db.patients.createIndex({ "patient_id": 1 }, { unique: true });
db.patients.createIndex({ "health_number": 1 }, { unique: true });
db.patients.createIndex({ "demographics.last_name": 1, "demographics.first_name": 1 });
db.patients.createIndex({ "contact.address.city": 1 });
db.patients.createIndex({ "medical_history.chronic_conditions": 1 });

// 2. Visits Collection - Medical encounters
db.visits.createIndex({ "visit_id": 1 }, { unique: true });
db.visits.createIndex({ "patient_id": 1, "visit_date": -1 });
db.visits.createIndex({ "department": 1 });
db.visits.createIndex({ "diagnosis.code": 1 });

// 3. Lab Results Collection - Test results
db.lab_results.createIndex({ "result_id": 1 }, { unique: true });
db.lab_results.createIndex({ "patient_id": 1, "test_date": -1 });
db.lab_results.createIndex({ "test_code": 1 });
db.lab_results.createIndex({ "abnormal_flag": 1 });

// Example Aggregation: Patient Summary
db.patients.aggregate([
  { $match: { "patient_id": "PT000001" } },
  {
    $lookup: {
      from: "visits",
      localField: "patient_id",
      foreignField: "patient_id",
      as: "recent_visits"
    }
  },
  {
    $lookup: {
      from: "lab_results",
      localField: "patient_id",
      foreignField: "patient_id",
      as: "recent_labs"
    }
  },
  {
    $project: {
      patient_id: 1,
      demographics: 1,
      "medical_history.chronic_conditions": 1,
      "medical_history.current_medications": 1,
      last_visit: { $arrayElemAt: ["$recent_visits", -1] },
      abnormal_labs: {
        $filter: {
          input: "$recent_labs",
          as: "lab",
          cond: { $eq: ["$$lab.abnormal_flag", "H"] }
        }
      }
    }
  }
]);

// High-Risk Patients Query
db.patients.find({
  $and: [
    { "demographics.age": { $gte: 65 } },
    { "medical_history.chronic_conditions": { $size: { $gte: 3 } } }
  ]
});
"""

        schema_file = self.output_dir / "mongodb_schema.js"
        with open(schema_file, "w") as f:
            f.write(schema)
        print(f"✓ Created MongoDB schema: {schema_file}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate synthetic medical records database")
    parser.add_argument("--patients", "-p", type=int, default=1000, help="Number of patients to generate (default: 1000)")

    args = parser.parse_args()

    generator = MedicalDatabaseGenerator(num_patients=args.patients)
    generator.run()
