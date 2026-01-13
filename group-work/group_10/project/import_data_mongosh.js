//Project group_10


// This script can be run directly in mongosh to set up the database
// Run with: mongosh --file import_data.js

// Connect to the group_10_db database
db = db.getSiblingDB("group_10_db");


// Drop existing collection if it exists so the script can be re-run idempotently.
db.customers.drop();
db.films.drop()
db.inventory.drop()
db.rentals.drop()

//import

mongoimport --db group_10_db --collection films --file project\data\film.json --jsonArray
mongoimport --db group_10_db --collection customers --file project\data\customer.json --jsonArray
mongoimport --db group_10_db --collection rentals --file project\data\rental.json --jsonArray 





// Collections

//customers*/

db.createCollection("customers", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["firstName","lastName","email","active","createDate"],
      properties: {
        firstName: { bsonType: "string", minLength: 1 },
        lastName:  { bsonType: "string", minLength: 1 },
        email:     { bsonType: "string", pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$" },
        active:    { bsonType: "bool" },
        createDate:{ bsonType: "date" },
        lastUpdate:{ bsonType: ["date","null"] }
      }
    }
  }
});

db.customers.createIndex({ email: 1 }, { unique: true });
db.customers.createIndex({ lastName: 1, firstName: 1 });



// films


db.createCollection("films", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      // Campos obrigatórios na coleção
      required: ["title", "rentalDurationDays", "rentalRate"],
      additionalProperties: true, // permite outros campos futuros (muda para false se quiseres estrito)
      properties: {
        title: {
          bsonType: "string",
          minLength: 1,
          description: "Título obrigatório e não pode ser vazio"
        },
        description: {
          bsonType: ["string", "null"],
          description: "Descrição opcional"
        },
        releaseYear: {
          bsonType: ["int", "null"],
          minimum: 1888,     // ano do primeiro filme conhecido
          maximum: 2100,     // limite superior razoável
          description: "Ano de lançamento (opcional) entre 1888 e 2100"
        },
        rentalDurationDays: {
          bsonType: "int",
          minimum: 1,
          maximum: 60,
          description: "Duração do aluguer em dias (>=1 e <=60)"
        },
        rentalRate: {
          bsonType: ["double", "decimal", "int"],
          minimum: 0,
          description: "Preço do aluguer (>=0)"
        },
        stockPolicy: {
          bsonType: ["object", "null"],
          description: "Política de stock/multa (opcional). Pode ser objeto ou null.",
          properties: {
            maxLateFeePerRental: {
              bsonType: ["double", "decimal", "int"],
              minimum: 0,
              description: "Teto máximo de multa por aluguer (>=0)"
            }
          }
          // Se quiseres obrigar a existência de maxLateFeePerRental quando houver objeto:
          // required: ["maxLateFeePerRental"],
          // Se quiseres bloquear chaves extra dentro de stockPolicy:
          // additionalProperties: false
        },
        lastUpdate: {
          bsonType: ["date", "null"],
          description: "Data da última atualização (opcional)"
        }
      }
    }
  },
  validationLevel: "strict",    // valida todos os writes
  validationAction: "error"      // bloqueia se não cumprir
});




//stores

db.createCollection("stores", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["storeId", "address", "city", "manager"],
      properties: {
        storeId: {
          bsonType: "int"
        },
        address: {
          bsonType: "string"
        },
        city: {
          bsonType: "string"
        },
        manager: {
          bsonType: "object",
          required: ["staffID", "name"],
          properties: {
            staffID: {
              bsonType: "int"
            },
            name: {
              bsonType: "string"
            }
          }
        }
      }
    }
  }
})

db.stores.createIndex(
  { store_id: 1 },
  { unique: true }
)

// rentals


db.createCollection("rentals", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["rentalId", "rentalDate", "inventoryId", "customerId", "staffId"],
      properties: {
        rentalId: { bsonType: "int", description: "ID único do aluguer" },
        rentalDate: { bsonType: "date", description: "Data do aluguer" },
        inventoryId: { bsonType: "int", description: "Referência à cópia do filme" },
        customerId: { bsonType: "int", description: "Referência ao cliente" },
        returnDate: { bsonType: ["date", "null"], description: "Data de devolução (opcional)" },
        staffId: { bsonType: "int", description: "Funcionário que processou o aluguer" },
        lastUpdate: { bsonType: ["date", "null"], description: "Última atualização" }
      }
    }
  }
});


db.rentals.createIndex({ customerId: 1, rentalDate: -1 });
db.rentals.createIndex({ inventoryId: 1, rentalDate: -1 });
db.rentals.createIndex({ status: 1 });
db.rentals.createIndex({ dueDate: 1 });












