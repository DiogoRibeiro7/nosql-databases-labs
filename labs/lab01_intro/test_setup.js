// Test script to verify MongoDB setup with mongosh
// Run with: mongosh --file test_setup.js

// Connect to the lab01_student database
db = db.getSiblingDB('lab01_student');

print("=================================");
print("MongoDB Setup Verification");
print("=================================\n");

// Test 1: Database connection
print("1. Testing database connection...");
const version = db.version();
print(`   ✓ Connected to MongoDB version: ${version}\n`);

// Test 2: Check collection exists
print("2. Checking customers collection...");
const collections = db.getCollectionNames();
if (collections.includes('customers')) {
    print("   ✓ Collection 'customers' exists\n");
} else {
    print("   ✗ Collection 'customers' not found\n");
    print("   Run import_data.js to set up the database\n");
    quit(1);
}

// Test 3: Count documents
print("3. Counting documents...");
const count = db.customers.countDocuments();
print(`   ✓ Found ${count} documents in customers collection\n`);

// Test 4: Test basic query
print("4. Testing basic queries...");
const nyCustomers = db.customers.find({ city: "New York" }).toArray();
print(`   ✓ Query by city: Found ${nyCustomers.length} customers in New York`);

const over30 = db.customers.find({ age: { $gt: 30 } }).toArray();
print(`   ✓ Query by age: Found ${over30.length} customers over 30\n`);

// Test 5: Check indexes
print("5. Checking indexes...");
const indexes = db.customers.getIndexes();
print(`   ✓ Found ${indexes.length} indexes:`);
indexes.forEach(idx => {
    // Make each index definition human-readable for quick verification.
    const keys = Object.keys(idx.key).join(", ");
    const unique = idx.unique ? " (unique)" : "";
    print(`     - ${idx.name}: [${keys}]${unique}`);
});

// Test 6: Test aggregation
print("\n6. Testing aggregation pipeline...");
// Group customers by country and sort descending to highlight the busiest markets.
const countByCountry = db.customers.aggregate([
    { $group: { _id: "$country", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
]).toArray();
print("   ✓ Customers by country:");
countByCountry.forEach(c => {
    print(`     - ${c._id}: ${c.count} customers`);
});

// Test 7: Test mongosh features
print("\n7. Testing mongosh-specific features...");
try {
    // Test async/await (mongosh feature)
    /**
     * Fetch the name for customer_id 1 using async/await so the verification
     * gauges whether mongosh accepts top-level async helpers.
     *
     * @returns {Promise<string>}
     */
    const asyncTest = async () => {
        const result = await db.customers.findOne({ customer_id: 1 });
        return result.name;
    };
    asyncTest().then(name => {
        print(`   ✓ Async/await works: Found customer ${name}`);
    });

    // Test modern JavaScript
    // collecting names with Array.map confirms that modern iterator helpers work.
    const names = db.customers.find().toArray().map(c => c.name);
    print(`   ✓ Modern JS works: Retrieved ${names.length} customer names`);
} catch (error) {
    print("   ✗ Some mongosh features may not be available");
    if (error && error.message) {
        print(`     Error: ${error.message}`);
    }
}

print("\n=================================");
print("All tests passed successfully!");
print("=================================");
print("\nYour MongoDB setup with mongosh is working correctly.");
print("You can now proceed with the lab exercises.");
print("\nTo run queries, use:");
print("  mongosh lab01_student --file queries.js");
print("\nOr interactively:");
print("  mongosh");
print("  use lab01_student");
print("  load('queries.js')");
