// Porto Night Markets - Sample Final Project (mongosh only)
// Run from group-work/group_XX_example/project with:
//   mongosh import_data.mongosh.js

// Switch to a dedicated database so the example remains isolated from other labs.
db = db.getSiblingDB("group_xx_example_final");
print(`Using database: ${db.getName()}`);

// Reset the database before every run so inserts remain idempotent.
print("Dropping previous data (if any)...");
db.dropDatabase();

// Reference data -------------------------------------------------------------
// Students can tweak these arrays directly--keeping them inline avoids juggling CSV/JSON imports.
const vendors = [
  {
    vendorId: "VNDR-01",
    name: "Pastelaria Solar",
    cuisine: "Portuguese desserts",
    homeBase: "Cedofeita",
    featuredItems: ["pastel de nata", "salted caramel bola de berlim"],
    prepMinutes: 4,
    capacityPerEvent: 180,
    contactEmail: "solar@portofoodhub.pt",
    partnershipTier: "gold",
  },
  {
    vendorId: "VNDR-02",
    name: "Mar Atlantico Bowls",
    cuisine: "Seafood fusion",
    homeBase: "Matosinhos",
    featuredItems: ["cod ceviche", "ocean quinoa bowl"],
    prepMinutes: 7,
    capacityPerEvent: 150,
    contactEmail: "atlanticobowls@portofoodhub.pt",
    partnershipTier: "silver",
  },
  {
    vendorId: "VNDR-03",
    name: "Grillnautas",
    cuisine: "Fire-grilled mains",
    homeBase: "Bonfim",
    featuredItems: ["piri-piri chicken pita", "charred veggie espetada"],
    prepMinutes: 9,
    capacityPerEvent: 220,
    contactEmail: "grillnautas@portofoodhub.pt",
    partnershipTier: "gold",
  },
  {
    vendorId: "VNDR-04",
    name: "Herban Garden",
    cuisine: "Plant-based bites",
    homeBase: "Boavista",
    featuredItems: ["shiitake francesinha", "beetroot bao"],
    prepMinutes: 6,
    capacityPerEvent: 160,
    contactEmail: "herban@portofoodhub.pt",
    partnershipTier: "community",
  },
  {
    vendorId: "VNDR-05",
    name: "Serralves Smokehouse",
    cuisine: "Smoked tapas",
    homeBase: "Lordelo do Ouro",
    featuredItems: ["smoked octopus slider", "maple bacalhau bites"],
    prepMinutes: 8,
    capacityPerEvent: 140,
    contactEmail: "smokehouse@portofoodhub.pt",
    partnershipTier: "silver",
  },
  {
    vendorId: "VNDR-06",
    name: "Norte Juice Lab",
    cuisine: "Cold-pressed juices",
    homeBase: "Foz",
    featuredItems: ["porto sunrise", "mint matcha fuel"],
    prepMinutes: 3,
    capacityPerEvent: 200,
    contactEmail: "nortejuice@portofoodhub.pt",
    partnershipTier: "community",
  },
];

const events = [
  {
    eventCode: "EVT-PRT-STREET-001",
    title: "Ribeira Sunset Market",
    eventDate: new Date("2025-07-12T18:00:00Z"),
    venue: { name: "Ribeira Docks", neighborhood: "Ribeira", capacity: 1200 },
    ticketPrice: 7.5,
    focusAreas: ["tourism", "local chefs"],
    vendors: ["VNDR-01", "VNDR-02", "VNDR-03"],
    sustainabilityTier: "B",
  },
  {
    eventCode: "EVT-PRT-RIVERSIDE-002",
    title: "Douro Riverside Brunch",
    eventDate: new Date("2025-08-02T10:00:00Z"),
    venue: { name: "Jardins do Palacio", neighborhood: "Massarelos", capacity: 900 },
    ticketPrice: 5.0,
    focusAreas: ["families", "live music"],
    vendors: ["VNDR-01", "VNDR-02", "VNDR-04"],
    sustainabilityTier: "A",
  },
  {
    eventCode: "EVT-PRT-ARTISANS-003",
    title: "Campanha Makers Night",
    eventDate: new Date("2025-09-14T19:00:00Z"),
    venue: { name: "Campanha Hub", neighborhood: "Campanha", capacity: 1000 },
    ticketPrice: 6.0,
    focusAreas: ["crafts", "live workshops"],
    vendors: ["VNDR-02", "VNDR-03", "VNDR-04"],
    sustainabilityTier: "A",
  },
  {
    eventCode: "EVT-PRT-CLERIGOS-004",
    title: "Clerigos Night Feast",
    eventDate: new Date("2025-09-27T19:00:00Z"),
    venue: { name: "Terraco Clerigos", neighborhood: "Baixa", capacity: 850 },
    ticketPrice: 6.5,
    focusAreas: ["nightlife", "heritage"],
    vendors: ["VNDR-01", "VNDR-03", "VNDR-05", "VNDR-06"],
    sustainabilityTier: "B",
  },
  {
    eventCode: "EVT-PRT-FOZ-005",
    title: "Foz Beach Pop-Up",
    eventDate: new Date("2025-10-18T16:00:00Z"),
    venue: { name: "Praia do Molhe", neighborhood: "Foz", capacity: 1100 },
    ticketPrice: 6.0,
    focusAreas: ["sunset", "families"],
    vendors: ["VNDR-02", "VNDR-04", "VNDR-05", "VNDR-06"],
    sustainabilityTier: "A",
  },
];

// Fact data ------------------------------------------------------------------
// Orders capture the telemetry we will later aggregate (revenue, wait time, satisfaction, etc.).
const orders = [
  {
    orderCode: "ORD-0001",
    eventCode: "EVT-PRT-STREET-001",
    vendorId: "VNDR-01",
    customer: { customerId: "CUS-101", name: "Marta L.", district: "Miragaia", returning: true },
    items: [
      { name: "pastel de nata", qty: 2, unitPrice: 1.8 },
      { name: "iced latte", qty: 1, unitPrice: 2.9 },
    ],
    totalAmount: 6.5,
    waitTimeMinutes: 4,
    paymentMethod: "MB Way",
    feedbackScore: 4.8,
    createdAt: new Date("2025-07-12T18:40:00Z"),
  },
  {
    orderCode: "ORD-0002",
    eventCode: "EVT-PRT-STREET-001",
    vendorId: "VNDR-03",
    customer: { customerId: "CUS-102", name: "Andre P.", district: "Cedofeita", returning: false },
    items: [
      { name: "piri-piri pita", qty: 1, unitPrice: 9.2 },
      { name: "citrus soda", qty: 1, unitPrice: 2.5 },
    ],
    totalAmount: 11.7,
    waitTimeMinutes: 9,
    paymentMethod: "card",
    feedbackScore: 4.2,
    createdAt: new Date("2025-07-12T19:05:00Z"),
  },
  {
    orderCode: "ORD-0003",
    eventCode: "EVT-PRT-STREET-001",
    vendorId: "VNDR-02",
    customer: { customerId: "CUS-103", name: "Sara D.", district: "Foz", returning: true },
    items: [
      { name: "cod ceviche", qty: 1, unitPrice: 10.5 },
      { name: "aquafresca", qty: 2, unitPrice: 2.0 },
    ],
    totalAmount: 14.5,
    waitTimeMinutes: 6,
    paymentMethod: "card",
    feedbackScore: 4.9,
    createdAt: new Date("2025-07-12T19:20:00Z"),
  },
  {
    orderCode: "ORD-0004",
    eventCode: "EVT-PRT-STREET-001",
    vendorId: "VNDR-01",
    customer: { customerId: "CUS-104", name: "Luis G.", district: "Boavista", returning: false },
    items: [{ name: "caramel bola de berlim", qty: 2, unitPrice: 2.6 }],
    totalAmount: 5.2,
    waitTimeMinutes: 5,
    paymentMethod: "cash",
    feedbackScore: 4.0,
    createdAt: new Date("2025-07-12T19:55:00Z"),
  },
  {
    orderCode: "ORD-0005",
    eventCode: "EVT-PRT-RIVERSIDE-002",
    vendorId: "VNDR-02",
    customer: { customerId: "CUS-105", name: "Helena R.", district: "Massarelos", returning: true },
    items: [{ name: "ocean quinoa bowl", qty: 2, unitPrice: 9.0 }],
    totalAmount: 18.0,
    waitTimeMinutes: 7,
    paymentMethod: "card",
    feedbackScore: 4.7,
    createdAt: new Date("2025-08-02T10:45:00Z"),
  },
  {
    orderCode: "ORD-0006",
    eventCode: "EVT-PRT-RIVERSIDE-002",
    vendorId: "VNDR-04",
    customer: { customerId: "CUS-106", name: "Joao T.", district: "Paranhos", returning: false },
    items: [
      { name: "shiitake francesinha", qty: 1, unitPrice: 11.0 },
      { name: "kombucha", qty: 1, unitPrice: 3.8 },
    ],
    totalAmount: 14.8,
    waitTimeMinutes: 8,
    paymentMethod: "MB Way",
    feedbackScore: 4.6,
    createdAt: new Date("2025-08-02T11:10:00Z"),
  },
  {
    orderCode: "ORD-0007",
    eventCode: "EVT-PRT-RIVERSIDE-002",
    vendorId: "VNDR-01",
    customer: { customerId: "CUS-107", name: "Camila F.", district: "Bonfim", returning: true },
    items: [
      { name: "pastel de nata", qty: 3, unitPrice: 1.8 },
      { name: "iced latte", qty: 1, unitPrice: 2.9 },
    ],
    totalAmount: 8.3,
    waitTimeMinutes: 3,
    paymentMethod: "card",
    feedbackScore: 5.0,
    createdAt: new Date("2025-08-02T11:25:00Z"),
  },
  {
    orderCode: "ORD-0008",
    eventCode: "EVT-PRT-ARTISANS-003",
    vendorId: "VNDR-04",
    customer: { customerId: "CUS-103", name: "Sara D.", district: "Foz", returning: true },
    items: [{ name: "beetroot bao", qty: 2, unitPrice: 6.5 }],
    totalAmount: 13.0,
    waitTimeMinutes: 5,
    paymentMethod: "MB Way",
    feedbackScore: 4.3,
    createdAt: new Date("2025-09-14T19:50:00Z"),
  },
  {
    orderCode: "ORD-0009",
    eventCode: "EVT-PRT-ARTISANS-003",
    vendorId: "VNDR-03",
    customer: { customerId: "CUS-108", name: "Renato S.", district: "Campanha", returning: false },
    items: [
      { name: "charred veggie espetada", qty: 1, unitPrice: 10.0 },
      { name: "ginger soda", qty: 1, unitPrice: 2.7 },
    ],
    totalAmount: 12.7,
    waitTimeMinutes: 10,
    paymentMethod: "card",
    feedbackScore: 3.8,
    createdAt: new Date("2025-09-14T20:05:00Z"),
  },
  {
    orderCode: "ORD-0010",
    eventCode: "EVT-PRT-ARTISANS-003",
    vendorId: "VNDR-02",
    customer: { customerId: "CUS-109", name: "Patricia V.", district: "Gaia", returning: false },
    items: [
      { name: "cod ceviche", qty: 1, unitPrice: 10.5 },
      { name: "ocean quinoa bowl", qty: 1, unitPrice: 9.0 },
    ],
    totalAmount: 19.5,
    waitTimeMinutes: 6,
    paymentMethod: "card",
    feedbackScore: 4.5,
    createdAt: new Date("2025-09-14T20:30:00Z"),
  },
  {
    orderCode: "ORD-0011",
    eventCode: "EVT-PRT-RIVERSIDE-002",
    vendorId: "VNDR-04",
    customer: { customerId: "CUS-110", name: "Teresa K.", district: "Ribeira", returning: false },
    items: [{ name: "shiitake francesinha", qty: 2, unitPrice: 11.0 }],
    totalAmount: 22.0,
    waitTimeMinutes: 9,
    paymentMethod: "card",
    feedbackScore: 4.4,
    createdAt: new Date("2025-08-02T12:05:00Z"),
  },
  {
    orderCode: "ORD-0012",
    eventCode: "EVT-PRT-STREET-001",
    vendorId: "VNDR-02",
    customer: { customerId: "CUS-111", name: "Pedro Q.", district: "Campanha", returning: false },
    items: [
      { name: "ocean quinoa bowl", qty: 1, unitPrice: 9.0 },
      { name: "aquafresca", qty: 1, unitPrice: 2.0 },
    ],
    totalAmount: 11.0,
    waitTimeMinutes: 7,
    paymentMethod: "MB Way",
    feedbackScore: 4.1,
    createdAt: new Date("2025-07-12T20:05:00Z"),
  },
  {
    orderCode: "ORD-0013",
    eventCode: "EVT-PRT-CLERIGOS-004",
    vendorId: "VNDR-05",
    customer: { customerId: "CUS-112", name: "Ines C.", district: "Lordelo do Ouro", returning: false },
    items: [
      { name: "smoked octopus slider", qty: 2, unitPrice: 7.5 },
      { name: "maple bacalhau bites", qty: 1, unitPrice: 6.0 },
    ],
    totalAmount: 21.0,
    waitTimeMinutes: 8,
    paymentMethod: "MB Way",
    feedbackScore: 4.6,
    createdAt: new Date("2025-09-27T20:10:00Z"),
  },
  {
    orderCode: "ORD-0014",
    eventCode: "EVT-PRT-CLERIGOS-004",
    vendorId: "VNDR-06",
    customer: { customerId: "CUS-113", name: "Miguel H.", district: "Baixa", returning: false },
    items: [
      { name: "porto sunrise", qty: 1, unitPrice: 6.0 },
      { name: "mint matcha fuel", qty: 1, unitPrice: 4.8 },
    ],
    totalAmount: 10.8,
    waitTimeMinutes: 2,
    paymentMethod: "card",
    feedbackScore: 4.9,
    createdAt: new Date("2025-09-27T20:25:00Z"),
  },
  {
    orderCode: "ORD-0015",
    eventCode: "EVT-PRT-CLERIGOS-004",
    vendorId: "VNDR-03",
    customer: { customerId: "CUS-114", name: "Sofia B.", district: "Aliados", returning: false },
    items: [
      { name: "charred veggie espetada", qty: 1, unitPrice: 10.0 },
      { name: "citrus soda", qty: 1, unitPrice: 2.5 },
      { name: "chimichurri potatoes", qty: 1, unitPrice: 3.2 },
    ],
    totalAmount: 15.7,
    waitTimeMinutes: 11,
    paymentMethod: "card",
    feedbackScore: 4.1,
    createdAt: new Date("2025-09-27T21:00:00Z"),
  },
  {
    orderCode: "ORD-0016",
    eventCode: "EVT-PRT-FOZ-005",
    vendorId: "VNDR-06",
    customer: { customerId: "CUS-107", name: "Camila F.", district: "Bonfim", returning: true },
    items: [{ name: "mint matcha fuel", qty: 2, unitPrice: 4.8 }],
    totalAmount: 9.6,
    waitTimeMinutes: 2,
    paymentMethod: "card",
    feedbackScore: 4.7,
    createdAt: new Date("2025-10-18T16:20:00Z"),
  },
  {
    orderCode: "ORD-0017",
    eventCode: "EVT-PRT-FOZ-005",
    vendorId: "VNDR-05",
    customer: { customerId: "CUS-115", name: "Bruno L.", district: "Matosinhos", returning: false },
    items: [
      { name: "smoked octopus slider", qty: 1, unitPrice: 7.5 },
      { name: "maple bacalhau bites", qty: 2, unitPrice: 6.0 },
    ],
    totalAmount: 19.5,
    waitTimeMinutes: 6,
    paymentMethod: "MB Way",
    feedbackScore: 4.4,
    createdAt: new Date("2025-10-18T16:45:00Z"),
  },
  {
    orderCode: "ORD-0018",
    eventCode: "EVT-PRT-FOZ-005",
    vendorId: "VNDR-02",
    customer: { customerId: "CUS-116", name: "Lea P.", district: "Foz", returning: false },
    items: [
      { name: "ocean quinoa bowl", qty: 1, unitPrice: 9.0 },
      { name: "aquafresca", qty: 2, unitPrice: 2.0 },
    ],
    totalAmount: 13.0,
    waitTimeMinutes: 5,
    paymentMethod: "card",
    feedbackScore: 4.8,
    createdAt: new Date("2025-10-18T17:05:00Z"),
  },
  {
    orderCode: "ORD-0019",
    eventCode: "EVT-PRT-FOZ-005",
    vendorId: "VNDR-04",
    customer: { customerId: "CUS-117", name: "Hugo A.", district: "Gondomar", returning: false },
    items: [
      { name: "shiitake francesinha", qty: 1, unitPrice: 11.0 },
      { name: "beetroot bao", qty: 1, unitPrice: 6.5 },
    ],
    totalAmount: 17.5,
    waitTimeMinutes: 7,
    paymentMethod: "card",
    feedbackScore: 4.2,
    createdAt: new Date("2025-10-18T17:25:00Z"),
  },
  {
    orderCode: "ORD-0020",
    eventCode: "EVT-PRT-CLERIGOS-004",
    vendorId: "VNDR-01",
    customer: { customerId: "CUS-118", name: "Eva R.", district: "Miragaia", returning: true },
    items: [
      { name: "pastel de nata", qty: 2, unitPrice: 1.8 },
      { name: "iced latte", qty: 1, unitPrice: 2.9 },
    ],
    totalAmount: 6.5,
    waitTimeMinutes: 3,
    paymentMethod: "cash",
    feedbackScore: 4.6,
    createdAt: new Date("2025-09-27T20:40:00Z"),
  },
];

// Insert data ----------------------------------------------------------------
print("\nImporting reference data...");
db.vendors.insertMany(vendors);
db.events.insertMany(events);

print("Importing orders...");
db.orders.insertMany(orders);

// Create minimal indexes so analytical queries in the /queries folder have good plans.
print("\nCreating useful indexes...");
db.vendors.createIndex({ vendorId: 1 }, { unique: true });
db.events.createIndex({ eventCode: 1 }, { unique: true });
db.orders.createIndex({ eventCode: 1, vendorId: 1, createdAt: 1 });
db.orders.createIndex({ "customer.customerId": 1 });

// Quick smoke-test to ensure documents landed correctly.
print("\nVerifying counts...");
printjson({
  vendors: db.vendors.countDocuments(),
  events: db.events.countDocuments(),
  orders: db.orders.countDocuments(),
});

// Show a few orders so students can glance at the embedded structure.
print("\nSample orders (first 3):");
db.orders
  .find({}, { orderCode: 1, vendorId: 1, totalAmount: 1, customer: 1 })
  .limit(3)
  .forEach((doc) => printjson(doc));

print("\n=================================");
print("Database setup completed!");
print("Next: load('queries/01_revenue_by_event_vendor.mongosh.js')");
print("=================================");
