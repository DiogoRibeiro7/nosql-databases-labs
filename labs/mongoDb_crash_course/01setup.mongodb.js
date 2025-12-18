/* global use, db */
use("EcommerceCrashCourse");

// Reset collections so the script is idempotent when re-run.
db.products.drop();
db.orders.drop();
db.contacts.drop();

const now = new Date();

db.products.insertMany(
  [
    {
      name: "Wireless Mouse",
      description: "Ergonomic wireless mouse with adjustable DPI settings.",
      price: 29.99,
      category: "accessories",
      tags: ["electronics", "wireless"],
      stock: 150,
      rating: 4.5,
      createdAt: now,
    },
    {
      name: "Bluetooth Headphones",
      description: "Over-ear Bluetooth headphones with active noise cancellation.",
      price: 89.99,
      category: "audio",
      tags: ["electronics", "wireless"],
      stock: 80,
      rating: 4.7,
      createdAt: now,
    },
    {
      name: "Gaming Keyboard",
      description: "Mechanical gaming keyboard with RGB backlighting.",
      price: 59.99,
      category: "accessories",
      tags: ["electronics", "gaming"],
      stock: 120,
      rating: 4.3,
      createdAt: now,
    },
    {
      name: "4K Monitor",
      description: "27-inch 4K IPS display with HDR support.",
      price: 349.0,
      category: "displays",
      tags: ["electronics", "productivity"],
      stock: 45,
      rating: 4.6,
      createdAt: now,
    },
    {
      name: "USB-C Hub",
      description: "7-in-1 USB-C hub with HDMI and Ethernet.",
      price: 49.5,
      category: "accessories",
      tags: ["electronics", "travel"],
      stock: 200,
      rating: 4.1,
      createdAt: now,
    },
  ],
  { ordered: true }
);

db.contacts.insertMany(
  [
    { name: "Alice", message: "Loved your website!", phone: "9876543210", createdAt: now },
    {
      name: "Bob",
      message: "Do you have discounts on laptops?",
      phone: "9123456789",
      createdAt: now,
    },
    { name: "Carol", message: "I want to cancel my order.", phone: "9988776655", createdAt: now },
  ],
  { ordered: true }
);

db.orders.insertMany(
  [
    {
      orderId: "ORD001",
      customer: "John Doe",
      status: "Delivered",
      createdAt: now,
      items: [
        { name: "Wireless Mouse", category: "accessories", quantity: 1, unitPrice: 29.99 },
        { name: "Gaming Keyboard", category: "accessories", quantity: 1, unitPrice: 59.99 },
      ],
    },
    {
      orderId: "ORD002",
      customer: "Jane Smith",
      status: "Pending",
      createdAt: now,
      items: [{ name: "4K Monitor", category: "displays", quantity: 1, unitPrice: 349.0 }],
    },
    {
      orderId: "ORD003",
      customer: "Priya Patel",
      status: "Processing",
      createdAt: now,
      items: [
        { name: "Bluetooth Headphones", category: "audio", quantity: 2, unitPrice: 89.99 },
        { name: "USB-C Hub", category: "accessories", quantity: 1, unitPrice: 49.5 },
      ],
    },
  ],
  { ordered: true }
);

db.orders.updateMany({}, [
  {
    $set: {
      total: {
        $sum: {
          $map: {
            input: "$items",
            as: "item",
            in: { $multiply: ["$$item.quantity", "$$item.unitPrice"] },
          },
        },
      },
    },
  },
]);
