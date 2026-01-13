// Query 17: Inserir Novo Cliente (CREATE)
// Demonstra operação de inserção com validação
// Usage: mongosh queries/17_insert_new_customer.mongosh.js

db = db.getSiblingDB("sakila_mongodb");

print("\n=== Inserir Novo Cliente ===\n");

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

// Verificar se cliente já existe
const exists = db.customers.findOne({ customer_id: newCustomer.customer_id });

if (exists) {
  print("Cliente já existe. A remover para demonstração...");
  db.customers.deleteOne({ customer_id: newCustomer.customer_id });
}

print("A inserir novo cliente:");
const result = db.customers.insertOne(newCustomer);
printjson(result);

print("\nCliente inserido:");
db.customers
  .find(
    { customer_id: 9999 },
    { _id: 0, customer_id: 1, first_name: 1, last_name: 1, email: 1, "address.city.city_name": 1 }
  )
  .forEach((doc) => printjson(doc));

print("\n✓ Query executada com sucesso\n");
