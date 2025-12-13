// MongoDB initialization script for Docker
// This script runs automatically when the MongoDB container starts for the first time

print("=== Initializing NoSQL Labs Database ===");

// Switch to the nosql_labs database
db = db.getSiblingDB('nosql_labs');

// Create a labs user with read/write access
db.createUser({
  user: 'labuser',
  pwd: 'labpass123',
  roles: [
    {
      role: 'readWrite',
      db: 'nosql_labs'
    }
  ]
});

print("Created lab user");

// Create initial collections
db.createCollection('students');
db.createCollection('labs');
db.createCollection('submissions');

// Insert sample data for testing
db.students.insertMany([
  {
    student_id: 'S001',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    group: 'GROUP_01',
    enrolled_date: new Date('2024-01-15')
  },
  {
    student_id: 'S002',
    name: 'Bob Smith',
    email: 'bob@example.com',
    group: 'GROUP_01',
    enrolled_date: new Date('2024-01-15')
  },
  {
    student_id: 'S003',
    name: 'Charlie Davis',
    email: 'charlie@example.com',
    group: 'GROUP_02',
    enrolled_date: new Date('2024-01-16')
  }
]);

db.labs.insertMany([
  {
    lab_id: 'LAB01',
    name: 'Introduction to NoSQL',
    description: 'Basic MongoDB concepts and CRUD operations',
    max_score: 100,
    due_date: new Date('2024-02-01')
  },
  {
    lab_id: 'LAB02',
    name: 'Data Modeling',
    description: 'Schema design patterns and relationships',
    max_score: 100,
    due_date: new Date('2024-02-15')
  },
  {
    lab_id: 'LAB03',
    name: 'Advanced Queries',
    description: 'Complex queries and optimization',
    max_score: 100,
    due_date: new Date('2024-03-01')
  },
  {
    lab_id: 'LAB04',
    name: 'Aggregation Pipeline',
    description: 'Data aggregation and analysis',
    max_score: 100,
    due_date: new Date('2024-03-15')
  },
  {
    lab_id: 'LAB05',
    name: 'Replication',
    description: 'Setting up and managing replica sets',
    max_score: 100,
    due_date: new Date('2024-04-01')
  }
]);

print("Sample data inserted successfully");

// Create indexes for better performance
db.students.createIndex({ student_id: 1 }, { unique: true });
db.students.createIndex({ group: 1 });
db.labs.createIndex({ lab_id: 1 }, { unique: true });
db.submissions.createIndex({ student_id: 1, lab_id: 1 });

print("Indexes created");

// Switch to sakila database for Lab 01
db = db.getSiblingDB('sakila');
db.createUser({
  user: 'labuser',
  pwd: 'labpass123',
  roles: [
    {
      role: 'readWrite',
      db: 'sakila'
    }
  ]
});

print("=== Database initialization complete ===");
print("Connection details:");
print("  Primary DB: nosql_labs");
print("  Username: labuser");
print("  Password: labpass123");
print("  Host: localhost (or mongodb in Docker network)");
print("  Port: 27017");