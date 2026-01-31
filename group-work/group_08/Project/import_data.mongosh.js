// School Management - Sample Final Project (mongosh only)
// Run with:
//   mongosh import_data.mongosh.js

// Switch to a dedicated database
db = db.getSiblingDB("group_08_school_final");
print(`Using database: ${db.getName()}`);

// Reset database
print("Dropping previous data (if any)...");
db.dropDatabase();

// Reference data -------------------------------------------------------------

const students = [
  {
    studentCode: "STU-001",
    name: "Aimee Zank",
    gender: "male",
    address: "123 Maple Street, Austin, TX",
    email: "aimee.zank@example.com",
    phone_number: "+1-512-555-0101",
  },
  {
    studentCode: "STU-002",
    name: "John Miller",
    gender: "male",
    address: "456 Oak Avenue, Denver, CO",
    email: "john.miller@example.com",
    phone_number: "+1-303-555-0102",
  },
  {
    studentCode: "STU-003",
    name: "Sarah Collins",
    gender: "female",
    address: "789 Pine Road, Seattle, WA",
    email: "sarah.collins@example.com",
    phone_number: "+1-206-555-0103",
  },
  {
    studentCode: "STU-004",
    name: "David Nguyen",
    gender: "male",
    address: "321 Cedar Lane, San Jose, CA",
    email: "david.nguyen@example.com",
    phone_number: "+1-408-555-0104",
  },
  {
    studentCode: "STU-005",
    name: "Emily Carter",
    gender: "female",
    address: "654 Birch Street, Madison, WI",
    email: "emily.carter@example.com",
    phone_number: "+1-608-555-0105",
  },
  {
    studentCode: "STU-006",
    name: "Michael Brown",
    gender: "male",
    address: "987 Walnut Drive, Columbus, OH",
    email: "michael.brown@example.com",
    phone_number: "+1-614-555-0106",
  },
  {
    studentCode: "STU-007",
    name: "Jessica Lopez",
    gender: "female",
    address: "159 Spruce Court, Phoenix, AZ",
    email: "jessica.lopez@example.com",
    phone_number: "+1-602-555-0107",
  },
  {
    studentCode: "STU-008",
    name: "Daniel Kim",
    gender: "male",
    address: "753 Willow Way, Irvine, CA",
    email: "daniel.kim@example.com",
    phone_number: "+1-949-555-0108",
  },
  {
    studentCode: "STU-009",
    name: "Olivia Turner",
    gender: "female",
    address: "852 Aspen Boulevard, Boulder, CO",
    email: "olivia.turner@example.com",
    phone_number: "+1-720-555-0109",
  },
  {
    studentCode: "STU-010",
    name: "Chris Anderson",
    gender: "male",
    address: "951 Poplar Street, Minneapolis, MN",
    email: "chris.anderson@example.com",
    phone_number: "+1-612-555-0110",
  },
];

const subjects = [
  { subjectCode: "SUB-001", name: "Mathematics", code: "MATH101", teacher: "Mr. Johnson", credits: 3 },
  { subjectCode: "SUB-002", name: "English Literature", code: "ENG102", teacher: "Ms. Roberts", credits: 3 },
  { subjectCode: "SUB-003", name: "Physics", code: "PHY103", teacher: "Dr. Smith", credits: 4 },
  { subjectCode: "SUB-004", name: "Chemistry", code: "CHEM104", teacher: "Dr. Lee", credits: 4 },
  { subjectCode: "SUB-005", name: "Biology", code: "BIO105", teacher: "Ms. Adams", credits: 3 },
  { subjectCode: "SUB-006", name: "Computer Science", code: "CS106", teacher: "Mr. Wilson", credits: 4 },
  { subjectCode: "SUB-007", name: "History", code: "HIST107", teacher: "Mrs. Clark", credits: 3 },
  { subjectCode: "SUB-008", name: "Geography", code: "GEO108", teacher: "Mr. Lewis", credits: 2 },
  { subjectCode: "SUB-009", name: "Economics", code: "ECON109", teacher: "Dr. Patel", credits: 3 },
  { subjectCode: "SUB-010", name: "Physical Education", code: "PE110", teacher: "Coach Miller", credits: 1 },
];

// Fact data ------------------------------------------------------------------

const grades = [
  { gradeCode: "GRD-001", studentCode: "STU-001", subjectCode: "SUB-001", score: 85 },
  { gradeCode: "GRD-002", studentCode: "STU-001", subjectCode: "SUB-002", score: 78 },
  { gradeCode: "GRD-003", studentCode: "STU-002", subjectCode: "SUB-001", score: 90 },
  { gradeCode: "GRD-004", studentCode: "STU-002", subjectCode: "SUB-003", score: 88 },
  { gradeCode: "GRD-005", studentCode: "STU-003", subjectCode: "SUB-002", score: 92 },
  { gradeCode: "GRD-006", studentCode: "STU-003", subjectCode: "SUB-004", score: 81 },
  { gradeCode: "GRD-007", studentCode: "STU-004", subjectCode: "SUB-003", score: 75 },
  { gradeCode: "GRD-008", studentCode: "STU-005", subjectCode: "SUB-005", score: 89 },
  { gradeCode: "GRD-009", studentCode: "STU-006", subjectCode: "SUB-006", score: 94 },
  { gradeCode: "GRD-010", studentCode: "STU-007", subjectCode: "SUB-007", score: 87 },
  { gradeCode: "GRD-011", studentCode: "STU-008", subjectCode: "SUB-006", score: 91 },
  { gradeCode: "GRD-012", studentCode: "STU-009", subjectCode: "SUB-009", score: 84 },
  { gradeCode: "GRD-013", studentCode: "STU-010", subjectCode: "SUB-010", score: 96 },
];

// Insert data ----------------------------------------------------------------

print("\nImporting reference data...");
db.students.insertMany(students);
db.subjects.insertMany(subjects);

print("Importing grades...");
db.grades.insertMany(grades);

// Indexes --------------------------------------------------------------------

print("\nCreating useful indexes...");
db.students.createIndex({ studentCode: 1 }, { unique: true });
db.subjects.createIndex({ subjectCode: 1 }, { unique: true });
db.grades.createIndex({ studentCode: 1, subjectCode: 1 });

// Smoke test -----------------------------------------------------------------

print("\nVerifying counts...");
printjson({
  students: db.students.countDocuments(),
  subjects: db.subjects.countDocuments(),
  grades: db.grades.countDocuments(),
});

print("\nSample grades (first 5):");
db.grades
  .find({}, { gradeCode: 1, studentCode: 1, subjectCode: 1, score: 1 })
  .limit(5)
  .forEach((doc) => printjson(doc));

print("\n=================================");
print("Database setup completed!");
print("Next: build aggregation queries (averages, GPA, joins)");
print("=================================");
