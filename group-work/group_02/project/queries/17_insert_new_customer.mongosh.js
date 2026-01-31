// Query 17: Insert New Customer (CREATE)
// Demonstrates insert operation with validation and flexible schema - uses different field names than import
// to show MongoDB's schema-less

// Usage: mongosh queries/17_insert_new_customer.mongosh.js

db = db.getSiblingDB("sakila_mongodb");

print("\n=== Insert New Customer ===\n");

const newCustomer = {
  customer_id: 9999,
  store_id: 1,
  first_name: "António",
  last_name: "Amorim",
  email: "40240119@esmad.ipp.pt",
  active: true,
  create_date: new Date(),
  last_update: new Date(),
  lifetime_rentals: 0,
  lifetime_value: NumberDecimal("0.00"),
  address: {
    address: "R. Dom Sancho I 1, Argivai",
    address2: null,
    district: "Porto",
    city: { city_id: 1, city_name: "Porto", country: "Portugal" },
    postal_code: "4000-001",
    phone: "912345678"
  },
  recent_rentals: []
};

// Check if customer already exists
const exists = db.customers.findOne({ customer_id: newCustomer.customer_id });

if (exists) {
  print("Customer already exists. Removing for demonstration...");
  db.customers.deleteOne({ customer_id: newCustomer.customer_id });
}

print("Inserting new customer:");
const result = db.customers.insertOne(newCustomer);
printjson(result);

print("\nCustomer inserted:");
db.customers
  .find(
    { customer_id: 9999 },
    { _id: 0, customer_id: 1, first_name: 1, last_name: 1, email: 1, "address.city.city_name": 1 }
  )
  .forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");
