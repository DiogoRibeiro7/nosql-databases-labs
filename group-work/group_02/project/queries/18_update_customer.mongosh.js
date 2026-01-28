// Query 18: Update Customer Data (UPDATE)
// Demonstrates partial update operation
// Usage: mongosh queries/18_update_customer.mongosh.js

db = db.getSiblingDB("sakila_mongodb");

print("\n=== Update Existing Customer ===\n");

const TARGET_CUSTOMER_ID = 1;

print("State before update:");
db.customers
  .find(
    { customer_id: TARGET_CUSTOMER_ID },
    { _id: 0, customer_id: 1, first_name: 1, last_name: 1, lifetime_rentals: 1, last_update: 1 }
  )
  .forEach((doc) => printjson(doc));

// Update timestamp and increment rental counter
const updateResult = db.customers.updateOne(
  { customer_id: TARGET_CUSTOMER_ID },
  {
    $set: {
      last_update: new Date()
    },
    $inc: {
      lifetime_rentals: 1
    }
  }
);

print("\nUpdate result:");
printjson(updateResult);

print("\nState after update:");
db.customers
  .find(
    { customer_id: TARGET_CUSTOMER_ID },
    { _id: 0, customer_id: 1, first_name: 1, last_name: 1, lifetime_rentals: 1, last_update: 1 }
  )
  .forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");
