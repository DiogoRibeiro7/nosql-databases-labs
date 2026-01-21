
// ============================================================================
// CRUD OPERATIONS FOR group_10_db
// Run with: mongosh --file crud.js
// ============================================================================

db = db.getSiblingDB("group_10_db");
print(`Using database: ${db.getName()}`);


// ============================================================================
// 1. CUSTOMERS
// ============================================================================

// CREATE

db.customers.insertOne({
  customerId: "CUST-999",
  firstName: "Nome",
  lastName: "Apelido",
  email: "email@exemplo.com",
  phone: "+351 912345999",
  active: true,
  createDate: new Date(),
  lastUpdate: null,
  address: {
    address: "Rua X",
    address2: null,
    district: "Porto",
    city: "Porto",
    postalCode: "4000"
  }
});


// READ
db.customers.findOne({ customerId: "CUST-001" })

db.customers.find().limit(20);

// UPDATE

db.customers.updateOne(
  { customerId: "CUST-001" },
  { $set: { active: false } }
)


// DELETE

db.customers.deleteOne({ customerId: "CUST-020" });
``




// ============================================================================
// 2. FILMS
// ============================================================================

// CREATE

db.films.insertOne({
  filmId: "FILM-999",
  title: "Novo Filme",
  description: "Descrição",
  releaseYear: 2025,
  rentalDurationDays: 5,
  rentalRate: 4.99,
  stockPolicy: { maxLateFeePerRental: 10 },
  lastUpdate: new Date()
});


// READ
db.films.findOne({ filmId: "FILM-001" });

db.films.find().limit(20)

// UPDATE
db.films.updateOne(
  { filmId: "FILM-004" },
  { $set: { rentalRate: 5.99 } }
);


// DELETE

db.films.deleteOne({ filmId: "FILM-020"})


// ============================================================================
// 3. STORES
// ============================================================================

// CREATE

db.stores.insertOne({
  storeId: "STORE-99",
  storeName: "Nova Loja Teste",
  manager: { name: "Gestor Teste", staffId: 10 },
  address: {
    city: "Porto",
    location: { type: "Point", coordinates: [-8.61, 41.15] }
  },
  lastUpdate: new Date()
});


// READ
db.stores.findOne({ storeId: "STORE-01" })
db.stores.find()

// UPDATE

db.stores.updateOne(
  { storeId: "STORE-02" },
  { $set: { storeName: "Loja Porto Renovada" } }
);


// DELETE
db.stores.deleteOne({ storeId: "STORE-05" });



// ============================================================================
// 4. RENTALS
// ============================================================================

// CREATE

db.rentals.insertOne({
  rentalDate: new Date("2025-02-01"),
  dueDate: new Date("2025-02-08"),
  status: "rented",
  films: [
    { filmId: "FILM-001", title: "The Last Horizon", amount: 3.99 }
  ],
  customerId: "CUST-001",
  storeId: "STORE-01"
});


// READ
db.rentals.find().limit(10)

db.rentals.findOne({ customerId: "CUST-001" })

// UPDATE

db.rentals.updateOne(
  { customerId: "CUST-001", status: "rented" },
  { $set: { status: "returned" } }
);


// DELETE
db.rentals.deleteOne({ _id: ObjectId("ID_DO_RENTAL") })


