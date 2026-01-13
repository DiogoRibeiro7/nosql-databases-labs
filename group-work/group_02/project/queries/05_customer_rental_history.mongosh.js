// Query 05: Customer Rental History for a Specific Customer
// Customer service dashboard via find()
// Usage: mongosh queries/05_customer_rental_history.mongosh.js

db = db.getSiblingDB("sakila_mongodb");

const TARGET_CUSTOMER_ID = 5;

print(`\n=== Rental History - Customer ID ${TARGET_CUSTOMER_ID} ===\n`);

print("Customer Data:");
db.customers
  .find(
    { customer_id: TARGET_CUSTOMER_ID },
    { _id: 0, customer_id: 1, first_name: 1, last_name: 1, email: 1, lifetime_rentals: 1, lifetime_value: 1 }
  )
  .forEach((doc) => printjson(doc));

print("\nLast 10 Rentals:");
db.rentals
  .find(
    { "customer.customer_id": TARGET_CUSTOMER_ID },
    { _id: 0, rental_id: 1, rental_date: 1, "film.title": 1, "payment.amount": 1, return_date: 1 }
  )
  .sort({ rental_date: -1 })
  .limit(10)
  .forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");