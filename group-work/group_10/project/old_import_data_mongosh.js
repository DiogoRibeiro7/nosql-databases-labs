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



/ Drop existing collection if it exists so the script can be re-run idempotently.
db.customers.drop();
db.films.drop()
db.stores.drop()
db.rentals.drop()

//import

mongoimport --db group_10_db --collection films --file project\data\film.json --jsonArray
mongoimport --db group_10_db --collection customers --file project\data\customer.json --jsonArray
mongoimport --db group_10_db --collection rentals --file project\data\rental.json --jsonArray 





/* -------------------- CUSTOMERS -------------------- */
db.createCollection("customers", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["firstName", "lastName", "email", "active", "createDate", "address"],
      properties: {
        firstName: { bsonType: "string", minLength: 1 },
        lastName: { bsonType: "string", minLength: 1 },
        email: { bsonType: "string", pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$" },
        phone: { bsonType: "string", pattern: "^[0-9+\\-\\s]{6,20}$" },
        active: { bsonType: "bool" },
        createDate: { bsonType: "date" },
        lastUpdate: { bsonType: ["date", "null"] },
        address: {
          bsonType: "object",
          required: ["address", "postalCode"],
          properties: {
            address: { bsonType: "string" },
            address2: { bsonType: ["string", "null"] },
            district: { bsonType: "string" },
            city: { bsonType: "string" },
            postalCode: { bsonType: "string", pattern: "^[0-9]{4,10}$" },
          }
        }
      }
    }
  },
  validationLevel: "strict",
  validationAction: "error"
});

// Garante unicidade do email e acelera buscas diretas por email.
// Útil para login/identificação e validação de duplicados.
db.customers.createIndex({ email: 1 }, { unique: true });

// Acelera listagens por apelido+nome (ex.: diretórios, auto-complete).
// // A ordem (lastName, firstName) permite ordenar eficientemente por apelido,// e filtrar por apelido e depois ordenar por nome.
db.customers.createIndex({ lastName: 1, firstName: 1 });

// Acelera filtros por código postal embebido no address.// Útil para relatórios segmentados por zona ou campanhas locais.
db.customers.createIndex({ "address.postalCode":1 });


// (email) recuperação/validação rápida
db.customers.find({ email: "ana@example.com" });

// (apelido+nome) diretórios e ordenações
db.customers.find({ lastName: "Silva" }).sort({ firstName: 1 });

// (postalCode) segmentação por área
db.customers.find({ "address.postalCode": "4480-000" })



/* -------------------- STORES -------------------- */
db.createCollection("stores", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["storeName", "manager", "address"],
      properties: {
        storeName: { bsonType: "string" },
        manager: {
          bsonType: "object",
          required: ["staffId", "name"],
          properties: {
            staffId: { bsonType: "objectId" },
            name: { bsonType: "string" }
          }
        },
        address: {
          bsonType: "object",
          required: ["address", "district", "city", "postalCode", "phone", "location"],
          properties: {
            address: { bsonType: "string" },
            district: { bsonType: "string" },
            city: { bsonType: "string" },
            postalCode: { bsonType: "string" },
            phone: { bsonType: "string" },
            location: {
              bsonType: "object",
              required: ["type", "coordinates"],
              properties: {
                type: { enum: ["Point"] },
                coordinates: {
                  bsonType: "array",
                  items: { bsonType: "double" },
                  minItems: 2,
                  maxItems: 2
                }
              }
            }
          }
        },
        lastUpdate: { bsonType: ["date", "null"] }
      }
    }
  },
  validationLevel: "strict",
  validationAction: "error"
});


// Pesquisa e ordenação por nome da loja (listagens, auto-complete).
db.stores.createIndex({ storeName: 1 })

// (storeName) listar/ordenar lojas

db.stores.find({ storeName: /centro/i }).sort({ storeName: 1 });





/* -------------------- FILMS -------------------- */
db.createCollection("films", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["title", "rentalDurationDays", "rentalRate"],
      properties: {
        title: { bsonType: "string", minLength: 1 },
        description: { bsonType: ["string", "null"] },
        releaseYear: { bsonType: ["int", "null"], minimum: 1888, maximum: 2100 },
        rentalDurationDays: { bsonType: "int", minimum: 1, maximum: 60 },
        rentalRate: { bsonType: ["double", "decimal", "int"], minimum: 0 },
        stockPolicy: {
          bsonType: ["object", "null"],
          properties: {
            maxLateFeePerRental: { bsonType: ["double", "decimal", "int"], minimum: 0 }
          }
        },
        lastUpdate: { bsonType: ["date", "null"] }
      }
    }
  },
  validationLevel: "strict",
  validationAction: "error"
});


// Índice de texto para pesquisa full-text por título (e opcionalmente descrição).
// Ideal para caixas de pesquisa. Um collection só pode ter UM índice de texto;
// se quiseres incluir description, cria composto { title: "text", description: "text" }.

db.films.createIndex({ title: "text" });

// Filtros/ordenações por ano de lançamento (catálogos, filtros por década).

db.films.createIndex({ releaseYear: 1 });


// (text) procurar por palavras no título
db.films.find({ $text: { $search: "Matrix" } });

// (releaseYear) filtrar por intervalo temporal
db.films.find({ releaseYear: { $gte: 2000, $lte: 2010 } }).sort({ releaseYear: 1 });



/* -------------------- RENTALS -------------------- */
db.createCollection("rentals", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "rentalDate",
        "dueDate",
        "status",
        "films",
        "customerId",
        "storeId",
        "staffId"
      ],
      properties: {
        rentalDate: { bsonType: "date" },
        dueDate: { bsonType: "date" },
        returnDate: { bsonType: ["date", "null"] },
        status: { enum: ["rented", "returned", "overdue", "cancelled"] },

        films: {
          bsonType: "array",
          minItems: 1,
          items: {
            bsonType: "object",
            required: ["filmId", "amount"],
            properties: {
              filmId: { bsonType: "objectId" },
              amount: {
                bsonType: ["double", "decimal", "int"],
                minimum: 0
              }
            }
          }
        },

        customerId: { bsonType: "objectId" },
        storeId: { bsonType: "objectId" },
        staffId: { bsonType: "objectId" },
        lastUpdate: { bsonType: ["date", "null"] }
      }
    }
  },
  validationLevel: "strict",
  validationAction: "error"
});

// A coleção rentals foi modelada de forma a suportar múltiplos filmes por aluguer, recorrendo a um array de subdocumentos. Esta abordagem reflete um cenário realista e tira partido da validação por schema do MongoDB

// Acelera histórico por cliente, ordenado do mais recente para o mais antigo.
// A ordem composta (customerId, rentalDate:-1) casa com o padrão de consultar
// por cliente e ordenar por data desc, evitando sort custoso.
db.rentals.createIndex({ customerId: 1, rentalDate: -1 });


// Procura rápida por alugueres de uma loja específica (quando storeId
// existe na coleção rentals), útil para relatórios por loja.
db.rentals.createIndex({ storeId: 1 });


// Filtragem por estado operacional (rented, returned, overdue, cancelled).
// Bom para dashboards operacionais.
db.rentals.createIndex({ status: 1 });


// Encontrar alugueres em atraso ou gerir batchs por proximidade do prazo.
// Importante para jobs que notificam clientes/atualizam estados.
db.rentals.createIndex({ dueDate: 1 });


//Índice composto (loja + estado + data) para dashboards filtrados
db.rentals.createIndex({ storeId: 1, status: 1, dueDate: 1 });

//Parcial (só alugueres “em curso”) para reduzir tamanho de índice
db.rentals.createIndex(
  { dueDate: 1 },
  { partialFilterExpression: { status: "rented" } }
);


// (customerId+rentalDate) histórico recente de um cliente
db.rentals.find({ customerId: ObjectId("...") }).sort({ rentalDate: -1 });

// (storeId) alugueres de uma loja
db.rentals.find({ storeId: ObjectId("...") });

// (status) todos os alugueres em curso
db.rentals.find({ status: "rented" });

// (dueDate) em atraso
db.rentals.find({ status: "rented", dueDate: { $lt: new Date() } });

//








