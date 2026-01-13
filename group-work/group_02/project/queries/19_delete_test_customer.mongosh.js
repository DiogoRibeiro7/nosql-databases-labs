// Query 19: Remove Test Customer (DELETE)
// Demonstrates removal operation with verification
// Usage: mongosh queries/19_delete_test_customer.mongosh.js

db = db.getSiblingDB("sakila_mongodb");

print("\n=== Remove Test Customer ===\n");

const TEST_CUSTOMER_ID = 9999;

// Check if customer exists
const customerBefore = db.customers.findOne({ customer_id: TEST_CUSTOMER_ID });

if (!customerBefore) {
  print("Test customer not found. Nothing to remove.");
} else {
  print("Customer found:");
  printjson({
    customer_id: customerBefore.customer_id,
    name: customerBefore.first_name + " " + customerBefore.last_name,
    email: customerBefore.email
  });

  // Remove customer
  const deleteResult = db.customers.deleteOne({ customer_id: TEST_CUSTOMER_ID });

  print("\nRemoval result:");
  printjson(deleteResult);
}

// Confirm removal
const customerAfter = db.customers.findOne({ customer_id: TEST_CUSTOMER_ID });
print("\nPost-removal verification:");
print(customerAfter ? "Customer still exists" : "Customer removed successfully");

print("\n✓ Query executada com sucesso\n");
