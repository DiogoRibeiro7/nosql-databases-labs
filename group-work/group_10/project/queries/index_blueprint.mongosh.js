
// queries/index_blueprint.mongosh.js


// Connect to the group_10_db database
db = db.getSiblingDB("group_10_db");
print(`Using database: ${db.getName()}`);

print("Applying unique/reference indexes...");

// Evitar clientes duplicados por email
printjson(db.customers.createIndex({ email: 1 }, { unique: true }));
// Pesquisa nominal (apelido+nome) e ordenação
printjson(db.customers.createIndex({ lastName: 1, firstName: 1 }));
// Geo e postal para segmentação local
printjson(db.customers.createIndex({ "address.postalCode": 1 }));
printjson(db.customers.createIndex({ "address.location": "2dsphere" }));

print("\nApplying catalog indexes...");
// Pesquisa por texto no catálogo de filmes
// (se já existir um texto, remove e recria se mudares os campos)
printjson(db.films.createIndex({ title: "text" }));
printjson(db.films.createIndex({ releaseYear: 1 }));

print("\nApplying rentals (operational/analytics) indexes...");
// Histórico por cliente (timeline recente)
printjson(db.rentals.createIndex({ customerId: 1, rentalDate: -1 }));
// Dashboards por loja/estado/prazo
printjson(db.rentals.createIndex({ storeId: 1 }));
printjson(db.rentals.createIndex({ status: 1 }));
printjson(db.rentals.createIndex({ dueDate: 1 }));

print("\nDone. Inspect with db.<collection>.getIndexes().");
