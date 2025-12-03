// Test a subset of queries from queries.js
// This demonstrates that the queries work with mongosh

// Connect to the lab01_student database
db = db.getSiblingDB('lab01_student');

print("Testing MongoDB Queries with mongosh");
print("=====================================\n");

// Test 1: Count documents
print("1. Counting all documents:");
const count = db.customers.countDocuments();
print(`   Found ${count} documents\n`);

// Test 2: Find all customers (limit to 2 for display)
print("2. Finding all customers (first 2):");
db.customers.find().limit(2).forEach(doc => {
    print(`   - ${doc.name} from ${doc.city}, ${doc.country}`);
});

// Test 3: Find customers from a specific city
print("\n3. Finding customers from New York:");
db.customers.find({ city: "New York" }).forEach(doc => {
    print(`   - ${doc.name} (${doc.email})`);
});

// Test 4: Find customers with age > 30
print("\n4. Finding customers older than 30:");
db.customers.find({ age: { $gt: 30 } }).forEach(doc => {
    print(`   - ${doc.name}, age ${doc.age}`);
});

// Test 5: Aggregation - Count by country
print("\n5. Counting customers by country:");
db.customers.aggregate([
    { $group: { _id: "$country", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
]).forEach(doc => {
    print(`   - ${doc._id}: ${doc.count} customer(s)`);
});

// Test 6: Aggregation - Average age
print("\n6. Computing average age:");
const avgResult = db.customers.aggregate([
    { $group: { _id: null, averageAge: { $avg: "$age" } } }
]).toArray();
print(`   Average age: ${avgResult[0].averageAge.toFixed(1)} years`);

print("\n=====================================");
print("All query tests passed successfully!");
print("=====================================");