//Project group_10


// This script can be run directly in mongosh to set up the database
// Run with: mongosh --file import_data.js

// Connect to the group_10_db database
db = db.getSiblingDB("group_10_db");
print(`Using database: ${db.getName()}`);

// Reset the database before every run so inserts remain idempotent. 
print("Dropping previous data (if any)...");
db.dropDatabase();




// Schemas

db.createCollection("customers", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["customerId", "firstName", "lastName", "email", "phone", "active", "createDate", "address"],
      additionalProperties: false,
      properties: {
        _id: {},
        customerId: { bsonType: "string", pattern: "^CUST-[0-9]{3}$" },
        firstName: { bsonType: "string" },
        lastName: { bsonType: "string" },
        email: { bsonType: "string", pattern: "^[^@]+@[^@]+\\.[^@]+$"},
        phone: { bsonType: "string" },
        active: { bsonType: "bool" },
        createDate: { bsonType: "date" },
        lastUpdate: { bsonType: ["date", "null"] },
        address: {
          bsonType: "object",
          required: ["address", "district", "city", "postalCode"],
          additionalProperties: false,
          properties: {
            address: { bsonType: "string" },
            address2: { bsonType: ["string", "null"] },
            district: { bsonType: "string" },
            city: { bsonType: "string" },
            postalCode: { bsonType: "string" }
          }
        }
      }
    }
  }
});



db.createCollection("films", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["filmId", "title", "releaseYear", "rentalDurationDays", "rentalRate"],
      additionalProperties: false,
      properties: {
        _id: {},
        filmId: { bsonType: "string", pattern: "^FILM-[0-9]{3}$" },
        title: { bsonType: "string" },
        description: { bsonType: ["string", "null"] },
        releaseYear: { bsonType: "int" },
        rentalDurationDays: { bsonType: "int" },
        rentalRate: { bsonType: ["double", "int"], minimum: 0 },
        stockPolicy: {
          bsonType: ["object", "null"],
          additionalProperties: false,
          properties: {
            maxLateFeePerRental: { bsonType: ["double", "int"], minimum: 0 }
          }
        },
        lastUpdate: { bsonType: ["date", "null"] }
      }
    }
  }
});


db.createCollection("stores", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["storeId", "storeName", "manager", "address"],
      additionalProperties: false,
      properties: {
        _id: {},
        storeId: { bsonType: "string", pattern: "^STORE-[0-9]{2}$" },
        storeName: { bsonType: "string" },
        manager: {
          bsonType: "object",
          required: ["name"],
          additionalProperties: false,
          properties: {
            name: { bsonType: "string" },
            staffId: { bsonType: ["int", "null"] }
          }
        },
        address: {
          bsonType: "object",
          required: ["city", "location"],
          additionalProperties: false,
          properties: {
            city: { bsonType: "string" },
            location: {
              bsonType: "object",
              required: ["type", "coordinates"],
              additionalProperties: false,
              properties: {
                type: { enum: ["Point"] },
                coordinates: {
                  bsonType: "array",
                  minItems: 2,
                  maxItems: 2,
                  items: { bsonType: "double" }
                }
              }
            }
          }
        }
      }
    }
  }
});


db.createCollection("rentals", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["rentalDate", "dueDate", "status", "films", "customerId", "storeId"],
      additionalProperties: false,
      properties: {
        _id: {},
        rentalDate: { bsonType: "date" },
        dueDate: { bsonType: "date" },
        status: { bsonType: "string", enum: ["rented", "returned", "overdue", "cancelled"] },
        films: {
          bsonType: "array",
          minItems: 1,
          items: {
            bsonType: "object",
            required: ["filmId", "title", "amount"],
            additionalProperties: false,
            properties: {
              filmId: { bsonType: "string", pattern: "^FILM-[0-9]{3}$" },
              title: { bsonType: "string" },
              amount: { bsonType: ["double", "int"], minimum: 0 }
            }
          }
        },
        customerId: { bsonType: "string", pattern: "^CUST-[0-9]{3}$" },
        storeId: { bsonType: "string", pattern: "^STORE-[0-9]{2}$" }
      }
    }
  }
});



// Reference data 

const customers = [
  {
    customerId: "CUST-001",
    firstName: "Ana",
    lastName: "Silva",
    email: "ana.silva1@email.com",
    phone: "+351 912345001",
    active: true,
    createDate: ISODate("2025-01-02"),
    lastUpdate: null,
    address: {
      address: "Rua das Flores 12",
      address2: null,
      district: "Lisboa",
      city: "Lisboa",
      postalCode: "1000"
    }
  },
  {
    customerId: "CUST-002",
    firstName: "João",
    lastName: "Pereira",
    email: "joao.pereira2@email.com",
    phone: "+351 912345002",
    active: true,
    createDate: ISODate("2025-01-03"),
    lastUpdate: null,
    address: {
      address: "Avenida Central 45",
      address2: "3º Esq",
      district: "Porto",
      city: "Porto",
      postalCode: "4000"
    }
  },
  {
    customerId: "CUST-003",
    firstName: "Maria",
    lastName: "Costa",
    email: "maria.costa3@email.com",
    phone: "+351 912345003",
    active: false,
    createDate: ISODate("2024-12-20"),
    lastUpdate: ISODate("2025-01-10"),
    address: {
      address: "Rua do Sol 8",
      address2: null,
      district: "Braga",
      city: "Braga",
      postalCode: "4700"
    }
  },
  {
    customerId: "CUST-004",
    firstName: "Pedro",
    lastName: "Santos",
    email: "pedro.santos4@email.com",
    phone: "+351 912345004",
    active: true,
    createDate: ISODate("2025-01-05"),
    lastUpdate: null,
    address: {
      address: "Travessa Nova 21",
      address2: null,
      district: "Coimbra",
      city: "Coimbra",
      postalCode: "3000"
    }
  },
  {
    customerId: "CUST-005",
    firstName: "Rita",
    lastName: "Fernandes",
    email: "rita.fernandes5@email.com",
    phone: "+351 912345005",
    active: true,
    createDate: ISODate("2025-01-06"),
    lastUpdate: null,
    address: {
      address: "Rua do Norte 90",
      address2: null,
      district: "Aveiro",
      city: "Aveiro",
      postalCode: "3800"
    }
  },
  {
    customerId: "CUST-006",
    firstName: "Tiago",
    lastName: "Almeida",
    email: "tiago.almeida6@email.com",
    phone: "+351 912345006",
    active: false,
    createDate: ISODate("2024-11-15"),
    lastUpdate: ISODate("2025-01-01"),
    address: {
      address: "Rua das Oliveiras 3",
      address2: "R/C",
      district: "Faro",
      city: "Faro",
      postalCode: "8000"
    }
  },
  {
    customerId: "CUST-007",
    firstName: "Inês",
    lastName: "Rocha",
    email: "ines.rocha7@email.com",
    phone: "+351 912345007",
    active: true,
    createDate: ISODate("2025-01-07"),
    lastUpdate: null,
    address: {
      address: "Rua da Praia 56",
      address2: null,
      district: "Setúbal",
      city: "Setúbal",
      postalCode: "2900"
    }
  },
  {
    customerId: "CUST-008",
    firstName: "Miguel",
    lastName: "Martins",
    email: "miguel.martins8@email.com",
    phone: "+351 912345008",
    active: true,
    createDate: ISODate("2025-01-08"),
    lastUpdate: null,
    address: {
      address: "Rua do Mercado 14",
      address2: null,
      district: "Viseu",
      city: "Viseu",
      postalCode: "3500"
    }
  },
  {
    customerId: "CUST-009",
    firstName: "Carla",
    lastName: "Lopes",
    email: "carla.lopes9@email.com",
    phone: "+351 912345009",
    active: false,
    createDate: ISODate("2024-10-10"),
    lastUpdate: ISODate("2024-12-30"),
    address: {
      address: "Rua Nova 77",
      address2: null,
      district: "Leiria",
      city: "Leiria",
      postalCode: "2400"
    }
  },
  {
    customerId: "CUST-010",
    firstName: "Bruno",
    lastName: "Gomes",
    email: "bruno.gomes10@email.com",
    phone: "+351 912345010",
    active: true,
    createDate: ISODate("2025-01-09"),
    lastUpdate: null,
    address: {
      address: "Avenida do Parque 102",
      address2: "1º Dto",
      district: "Sintra",
      city: "Sintra",
      postalCode: "2710"
    }
  },
  {
    customerId: "CUST-011",
    firstName: "Sofia",
    lastName: "Ribeiro",
    email: "sofia.ribeiro11@email.com",
    phone: "+351 912345011",
    active: true,
    createDate: ISODate("2025-01-10"),
    lastUpdate: null,
    address: {
      address: "Rua das Acácias 9",
      address2: null,
      district: "Évora",
      city: "Évora",
      postalCode: "7000"
    }
  },
  {
    customerId: "CUST-012",
    firstName: "Daniel",
    lastName: "Correia",
    email: "daniel.correia12@email.com",
    phone: "+351 912345012",
    active: true,
    createDate: ISODate("2025-01-11"),
    lastUpdate: null,
    address: {
      address: "Rua do Castelo 1",
      address2: null,
      district: "Guimarães",
      city: "Guimarães",
      postalCode: "4800"
    }
  },
  {
    customerId: "CUST-013",
    firstName: "Patrícia",
    lastName: "Azevedo",
    email: "patricia.azevedo13@email.com",
    phone: "+351 912345013",
    active: false,
    createDate: ISODate("2024-09-05"),
    lastUpdate: ISODate("2024-11-20"),
    address: {
      address: "Rua das Fontes 6",
      address2: null,
      district: "Chaves",
      city: "Chaves",
      postalCode: "5400"
    }
  },
  {
    customerId: "CUST-014",
    firstName: "Fábio",
    lastName: "Teixeira",
    email: "fabio.teixeira14@email.com",
    phone: "+351 912345014",
    active: true,
    createDate: ISODate("2025-01-12"),
    lastUpdate: null,
    address: {
      address: "Rua do Rio 33",
      address2: null,
      district: "Tomar",
      city: "Tomar",
      postalCode: "2300"
    }
  },
  {
    customerId: "CUST-015",
    firstName: "Helena",
    lastName: "Moura",
    email: "helena.moura15@email.com",
    phone: "+351 912345015",
    active: true,
    createDate: ISODate("2025-01-13"),
    lastUpdate: null,
    address: {
      address: "Rua da Escola 4",
      address2: null,
      district: "Beja",
      city: "Beja",
      postalCode: "7800"
    }
  },
  {
    customerId: "CUST-016",
    firstName: "Nuno",
    lastName: "Batista",
    email: "nuno.batista16@email.com",
    phone: "+351 912345016",
    active: false,
    createDate: ISODate("2024-08-18"),
    lastUpdate: ISODate("2024-10-02"),
    address: {
      address: "Rua das Vinhas 11",
      address2: null,
      district: "Palmela",
      city: "Palmela",
      postalCode: "2950"
    }
  },
  {
    customerId: "CUST-017",
    firstName: "Andreia",
    lastName: "Figueiredo",
    email: "andreia.figueiredo17@email.com",
    phone: "+351 912345017",
    active: true,
    createDate: ISODate("2025-01-14"),
    lastUpdate: null,
    address: {
      address: "Rua do Pinhal 19",
      address2: null,
      district: "Matosinhos",
      city: "Matosinhos",
      postalCode: "4450"
    }
  },
  {
    customerId: "CUST-018",
    firstName: "Ricardo",
    lastName: "Neves",
    email: "ricardo.neves18@email.com",
    phone: "+351 912345018",
    active: true,
    createDate: ISODate("2025-01-15"),
    lastUpdate: null,
    address: {
      address: "Avenida Atlântica 200",
      address2: "2º Dto",
      district: "Cascais",
      city: "Cascais",
      postalCode: "2750"
    }
  },
  {
    customerId: "CUST-019",
    firstName: "Marta",
    lastName: "Pinto",
    email: "marta.pinto19@email.com",
    phone: "+351 912345019",
    active: false,
    createDate: ISODate("2024-07-22"),
    lastUpdate: ISODate("2024-09-15"),
    address: {
      address: "Rua do Jardim 5",
      address2: null,
      district: "Lamego",
      city: "Lamego",
      postalCode: "5100"
    }
  },
  {
    customerId: "CUST-020",
    firstName: "Alexandre",
    lastName: "Sousa",
    email: "alexandre.sousa20@email.com",
    phone: "+351 912345020",
    active: true,
    createDate: ISODate("2025-01-16"),
    lastUpdate: null,
    address: {
      address: "Rua da Liberdade 88",
      address2: null,
      district: "Almada",
      city: "Almada",
      postalCode: "2800"
    }
  }
];


const films = [
  {
    filmId: "FILM-001",
    title: "The Last Horizon",
    description: "A sci-fi adventure beyond the known universe.",
    releaseYear: 2021,
    rentalDurationDays: 7,
    rentalRate: 3.99,
    stockPolicy: { maxLateFeePerRental: 9.99 },
    lastUpdate: null
  },
  {
    filmId: "FILM-002",
    title: "Silent Streets",
    description: "A noir crime drama set in a quiet town.",
    releaseYear: 2019,
    rentalDurationDays: 5,
    rentalRate: 2.99,
    stockPolicy: { maxLateFeePerRental: 7.5 },
    lastUpdate: null
  },
  {
    filmId: "FILM-003",
    title: "Ocean of Dreams",
    description: null,
    releaseYear: 2020,
    rentalDurationDays: 6,
    rentalRate: 3.5,
    stockPolicy: null,
    lastUpdate: null
  },
  {
    filmId: "FILM-004",
    title: "Echoes of Time",
    description: "A historical journey across generations.",
    releaseYear: 2018,
    rentalDurationDays: 10,
    rentalRate: 4.25,
    stockPolicy: { maxLateFeePerRental: 12 },
    lastUpdate: ISODate("2025-01-05")
  },
  {
    filmId: "FILM-005",
    title: "Hidden Code",
    description: "A thriller about secrets buried in software.",
    releaseYear: 2022,
    rentalDurationDays: 4,
    rentalRate: 2.5,
    stockPolicy: { maxLateFeePerRental: 6 },
    lastUpdate: null
  },
  {
    filmId: "FILM-006",
    title: "Broken Symphony",
    description: "An emotional story about music and loss.",
    releaseYear: 2017,
    rentalDurationDays: 8,
    rentalRate: 3.75,
    stockPolicy: null,
    lastUpdate: null
  },
  {
    filmId: "FILM-007",
    title: "Iron Skies",
    description: "Fighter pilots in a near-future war.",
    releaseYear: 2023,
    rentalDurationDays: 3,
    rentalRate: 4.99,
    stockPolicy: { maxLateFeePerRental: 15 },
    lastUpdate: ISODate("2025-01-07")
  },
  {
    filmId: "FILM-008",
    title: "Whispers in the Dark",
    description: "A psychological horror film.",
    releaseYear: 2016,
    rentalDurationDays: 5,
    rentalRate: 2.25,
    stockPolicy: null,
    lastUpdate: null
  },
  {
    filmId: "FILM-009",
    title: "Golden Path",
    description: "An inspiring journey of self-discovery.",
    releaseYear: 2015,
    rentalDurationDays: 7,
    rentalRate: 3,
    stockPolicy: { maxLateFeePerRental: 8 },
    lastUpdate: null
  },
  {
    filmId: "FILM-010",
    title: "Neon District",
    description: "Cyberpunk action in a futuristic city.",
    releaseYear: 2024,
    rentalDurationDays: 2,
    rentalRate: 5.5,
    stockPolicy: { maxLateFeePerRental: 18 },
    lastUpdate: ISODate("2025-01-08")
  },
  {
    filmId: "FILM-011",
    title: "Forgotten Letters",
    description: "A romantic drama based on true events.",
    releaseYear: 2014,
    rentalDurationDays: 9,
    rentalRate: 2.75,
    stockPolicy: null,
    lastUpdate: null
  },
  {
    filmId: "FILM-012",
    title: "Midnight Signal",
    description: "A suspense story unfolding in one night.",
    releaseYear: 2020,
    rentalDurationDays: 4,
    rentalRate: 3.25,
    stockPolicy: { maxLateFeePerRental: 6.5 },
    lastUpdate: null
  },
  {
    filmId: "FILM-013",
    title: "Beyond the River",
    description: null,
    releaseYear: 2013,
    rentalDurationDays: 6,
    rentalRate: 2,
    stockPolicy: null,
    lastUpdate: null
  },
  {
    filmId: "FILM-014",
    title: "Steel Heart",
    description: "A boxer fights for redemption.",
    releaseYear: 2019,
    rentalDurationDays: 5,
    rentalRate: 3.1,
    stockPolicy: { maxLateFeePerRental: 7 },
    lastUpdate: null
  },
  {
    filmId: "FILM-015",
    title: "Painted Silence",
    description: "An artistic exploration of grief.",
    releaseYear: 2012,
    rentalDurationDays: 11,
    rentalRate: 2.6,
    stockPolicy: null,
    lastUpdate: null
  },
  {
    filmId: "FILM-016",
    title: "Stormbound",
    description: "Survival against impossible odds.",
    releaseYear: 2021,
    rentalDurationDays: 6,
    rentalRate: 4.1,
    stockPolicy: { maxLateFeePerRental: 10 },
    lastUpdate: ISODate("2025-01-09")
  },
  {
    filmId: "FILM-017",
    title: "Parallel Lives",
    description: "Multiple realities collide.",
    releaseYear: 2022,
    rentalDurationDays: 7,
    rentalRate: 4.5,
    stockPolicy: { maxLateFeePerRental: 11 },
    lastUpdate: null
  },
  {
    filmId: "FILM-018",
    title: "Desert Bloom",
    description: "Hope grows in the harshest places.",
    releaseYear: 2011,
    rentalDurationDays: 10,
    rentalRate: 2.4,
    stockPolicy: null,
    lastUpdate: null
  },
  {
    filmId: "FILM-019",
    title: "Final Algorithm",
    description: "An AI decides the fate of humanity.",
    releaseYear: 2023,
    rentalDurationDays: 3,
    rentalRate: 5.99,
    stockPolicy: { maxLateFeePerRental: 20 },
    lastUpdate: ISODate("2025-01-10")
  },
  {
    filmId: "FILM-020",
    title: "The Long Return",
    description: "A journey home after many years.",
    releaseYear: 2010,
    rentalDurationDays: 12,
    rentalRate: 2.2,
    stockPolicy: null,
    lastUpdate: null
  }
]


const stores = [
  { storeId: "STORE-01", storeName: "Centro Video Lisboa", manager: { name: "Carlos Almeida" }, address: { city: "Lisboa", location: { type: "Point", coordinates: [-9.1393, 38.7223] } } },
  { storeId: "STORE-02", storeName: "Centro Video Porto", manager: { name: "Ana Ribeiro" }, address: { city: "Porto", location: { type: "Point", coordinates: [-8.6110, 41.1496] } } },
  { storeId: "STORE-03", storeName: "Video Clube Coimbra", manager: { name: "Miguel Santos" }, address: { city: "Coimbra", location: { type: "Point", coordinates: [-8.4292, 40.2033] } } },
  { storeId: "STORE-04", storeName: "Centro Video Braga", manager: { name: "Rita Fernandes" }, address: { city: "Braga", location: { type: "Point", coordinates: [-8.4265, 41.5454] } } },
  { storeId: "STORE-05", storeName: "Video Centro Faro", manager: { name: "João Pacheco" }, address: { city: "Faro", location: { type: "Point", coordinates: [-7.9352, 37.0194] } } }
];

// 4. RENTALS 
const rentals = [
  {
    rentalDate: ISODate("2025-01-01"), dueDate: ISODate("2025-01-08"), status: "returned",
    films: [{ filmId: "FILM-002", title: "Silent Streets", amount: 2.99 }, { filmId: "FILM-008", title: "Whispers in the Dark", amount: 1.99 }],
    customerId: "CUST-001", storeId: "STORE-01"
  },
  {
    rentalDate: ISODate("2025-01-02"), dueDate: ISODate("2025-01-09"), status: "rented",
    films: [{ filmId: "FILM-001", title: "The Last Horizon", amount: 3.99 }],
    customerId: "CUST-002", storeId: "STORE-01"
  },
  {
    rentalDate: ISODate("2025-01-03"), dueDate: ISODate("2025-01-10"), status: "overdue",
    films: [{ filmId: "FILM-011", title: "Forgotten Letters", amount: 2.49 }, { filmId: "FILM-014", title: "Steel Heart", amount: 2.49 }],
    customerId: "CUST-003", storeId: "STORE-02"
  },
  {
    rentalDate: ISODate("2025-01-04"), dueDate: ISODate("2025-01-11"), status: "cancelled",
    films: [{ filmId: "FILM-009", title: "Golden Path", amount: 0 }],
    customerId: "CUST-004", storeId: "STORE-02"
  },
  {
    rentalDate: ISODate("2025-01-05"), dueDate: ISODate("2025-01-12"), status: "returned",
    films: [{ filmId: "FILM-019", title: "Final Algorithm", amount: 4.49 }, { filmId: "FILM-004", title: "Echoes of Time", amount: 3.49 }],
    customerId: "CUST-005", storeId: "STORE-01"
  },
  {
    rentalDate: ISODate("2025-01-06"), dueDate: ISODate("2025-01-13"), status: "rented",
    films: [{ filmId: "FILM-015", title: "Painted Silence", amount: 2.99 }],
    customerId: "CUST-006", storeId: "STORE-03"
  },
  {
    rentalDate: ISODate("2025-01-07"), dueDate: ISODate("2025-01-14"), status: "overdue",
    films: [{ filmId: "FILM-020", title: "The Long Return", amount: 6.99 }],
    customerId: "CUST-007", storeId: "STORE-03"
  },
  {
    rentalDate: ISODate("2025-01-08"), dueDate: ISODate("2025-01-15"), status: "returned",
    films: [{ filmId: "FILM-010", title: "Neon District", amount: 4.50 }],
    customerId: "CUST-008", storeId: "STORE-01"
  },
  {
    rentalDate: ISODate("2025-01-09"), dueDate: ISODate("2025-01-16"), status: "returned",
    films: [{ filmId: "FILM-005", title: "Hidden Code", amount: 2.50 }],
    customerId: "CUST-001", storeId: "STORE-01" 
  },
  {
    rentalDate: ISODate("2025-01-10"), dueDate: ISODate("2025-01-17"), status: "rented",
    films: [{ filmId: "FILM-012", title: "Midnight Signal", amount: 3.25 }],
    customerId: "CUST-002", storeId: "STORE-02" 
  },
  {
    rentalDate: ISODate("2025-01-11"), dueDate: ISODate("2025-01-18"), status: "returned",
    films: [{ filmId: "FILM-007", title: "Iron Skies", amount: 4.99 }],
    customerId: "CUST-003", storeId: "STORE-02" 
  },
  {
    rentalDate: ISODate("2025-01-12"), dueDate: ISODate("2025-01-19"), status: "rented",
    films: [{ filmId: "FILM-017", title: "Parallel Lives", amount: 4.50 }],
    customerId: "CUST-001", storeId: "STORE-01" 
  },
  {
    rentalDate: ISODate("2025-01-12"), dueDate: ISODate("2025-01-19"), status: "returned",
    films: [{ filmId: "FILM-003", title: "Ocean of Dreams", amount: 3.50 }],
    customerId: "CUST-005", storeId: "STORE-01" 
  },
  {
    rentalDate: ISODate("2025-01-13"), dueDate: ISODate("2025-01-20"), status: "rented",
    films: [{ filmId: "FILM-010", title: "Neon District", amount: 5.50 }],
    customerId: "CUST-004", storeId: "STORE-04" 
  },
  {
    rentalDate: ISODate("2025-01-14"), dueDate: ISODate("2025-01-21"), status: "overdue",
    films: [{ filmId: "FILM-019", title: "Final Algorithm", amount: 5.99 }],
    customerId: "CUST-002", storeId: "STORE-01"  
  },
  {
    rentalDate: ISODate("2025-01-15"), dueDate: ISODate("2025-01-22"), status: "returned",
    films: [{ filmId: "FILM-006", title: "Broken Symphony", amount: 3.75 }],
    customerId: "CUST-009", storeId: "STORE-05" 
  },
  {
    rentalDate: ISODate("2025-01-16"), dueDate: ISODate("2025-01-23"), status: "rented",
    films: [{ filmId: "FILM-016", title: "Stormbound", amount: 4.10 }],
    customerId: "CUST-003", storeId: "STORE-02" 
  }, 
  {
    rentalDate: ISODate("2025-01-16"), dueDate: ISODate("2025-01-23"), status: "returned",
    films: [{ filmId: "FILM-002", title: "Silent Streets", amount: 2.99 }],
    customerId: "CUST-005", storeId: "STORE-01"  
  }
];


// Insert data ----------------------------------------------------------------
print("\nImporting reference data...");
db.customers.insertMany(customers,{ ordered: true });
db.films.insertMany(films,{ ordered: true });
db.stores.insertMany(stores,{ ordered: true });

print("Importing rentals...");
db.rentals.insertMany(rentals,{ ordered: true });


//// minimal indexes so analytical queries in the /queries folder have good plans.

print("\nCreating useful indexes...");


// Garante que não existem dois clientes com o mesmo email (segurança e login). Índice Único (unique: true): Além de performance, serve como uma regra de negócio (impede emails duplicados).

db.customers.createIndex({ email: 1 }, { unique: true });

// Acelera a filtragem de listas de clientes "Ativos" ou "Inativos".
db.customers.createIndex({ active: 1 });

// Permite encontrar rapidamente clientes de uma determinada cidade.
db.customers.createIndex({ "address.city": 1 });


// Transforma o título num índice de pesquisa. Permite procurar por palavras soltas.
db.films.createIndex({ title: "text" });

// Otimiza a ordenação (ex: "Mostrar filmes mais recentes primeiro").
db.films.createIndex({ releaseYear: 1 });

// Acelera queries que procuram filmes por preço (ex: "Filmes até 3€").
db.films.createIndex({ rentalRate: 1 });



// Fundamental para ligar os alugueres (Rentals) às lojas sem erros.
db.stores.createIndex({ storeId: 1 }, { unique: true });

// Facilita a listagem alfabética das lojas no sistema.
db.stores.createIndex({ storeName: 1 });

// Índice Especial: Permite cálculos de mapas (ex: "Qual a loja mais próxima de mim?").
db.stores.createIndex({ "address.location": "2dsphere" });

// Índice Composto: Mostra o histórico de um cliente específico ordenado pela data.
db.rentals.createIndex({ customerId: 1, rentalDate: -1 });

// Ajuda a gestão a encontrar rapidamente todos os alugueres com estado "overdue" (atrasado).
db.rentals.createIndex({ status: 1, rentalDate: -1 });

// Essencial para relatórios de faturação: agrupa vendas por loja e por tempo.
db.rentals.createIndex({ storeId: 1, rentalDate: -1 });

// Como "films" é uma lista dentro do aluguer, este índice permite saber 
// rapidamente quais os filmes mais alugados de sempre.

db.rentals.createIndex({ "films.filmId": 1 });


print("Indexes created successfully.");


// Quick smoke-test to ensure documents landed correctly.
print("\nVerifying counts...");

printjson({
  customers: db.customers.countDocuments(),
  rentals: db.rentals.countDocuments(),
  films: db.films.countDocuments(),
  stores: db.stores.countDocuments(),
});


// Show a few rentals so students can glance at the embedded structure.
print("\nSample rentals (first 3):");

db.rentals
  .find(
    {},
    {
      rentalDate: 1,
      status: 1,
      customerId: 1,
      storeId: 1,
      films: 1
    }
  )
  .limit(3)
  .forEach((doc) => printjson(doc));

print("\n=================================");
print("Database setup completed!");
print("Next: load('queries/01_receita_por_loja_e_filme.mongosh.js')");
print("=================================");


