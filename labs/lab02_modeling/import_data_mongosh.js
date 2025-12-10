/**
 * Lab 02 - E-Commerce Data Import (mongosh version)
 *
 * Run this in mongosh to import the e-commerce sample data:
 * mongosh --file import_data_mongosh.js
 *
 * This script creates the database, collections, and loads sample documents
 */

use("lab02_ecommerce");

print("=".repeat(60));
print("Lab 02 - E-Commerce Data Import");
print("=".repeat(60));

// Drop existing collections
print("\nDropping existing collections...");
db.customers.drop();
db.products.drop();
db.orders.drop();
db.reviews.drop();
print("✓ Collections dropped");

// ========================================================================
// Import Customers
// ========================================================================
print("\nImporting customers...");

const customers = [
  {
    _id: ObjectId("65a1b2c3d4e5f6a7b8c9d0e1"),
    customer_id: "CUST001",
    name: "Alice Johnson",
    email: "alice@example.com",
    password_hash: "$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",
    phone: "+1-555-0123",
    address: {
      street: "123 Main St",
      city: "New York",
      state: "NY",
      zip: "10001",
      country: "USA",
    },
    loyalty_points: 1250,
    created_at: ISODate("2023-01-15T10:30:00Z"),
  },
  {
    _id: ObjectId("65a1b2c3d4e5f6a7b8c9d0e2"),
    customer_id: "CUST002",
    name: "Bob Smith",
    email: "bob.smith@example.com",
    password_hash: "$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",
    phone: "+1-555-0456",
    address: {
      street: "456 Oak Ave",
      city: "Los Angeles",
      state: "CA",
      zip: "90001",
      country: "USA",
    },
    loyalty_points: 850,
    created_at: ISODate("2023-02-20T14:45:00Z"),
  },
  {
    _id: ObjectId("65a1b2c3d4e5f6a7b8c9d0e3"),
    customer_id: "CUST003",
    name: "Carol White",
    email: "carol.white@example.com",
    password_hash: "$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",
    phone: "+1-555-0789",
    address: {
      street: "789 Elm St",
      city: "Chicago",
      state: "IL",
      zip: "60601",
      country: "USA",
    },
    loyalty_points: 2100,
    created_at: ISODate("2023-03-10T09:15:00Z"),
  },
];

const custResult = db.customers.insertMany(customers);
print(`✓ Imported ${custResult.insertedIds.length} customers`);

// ========================================================================
// Import Products
// ========================================================================
print("\nImporting products...");

const products = [
  {
    _id: ObjectId("65a1b2c3d4e5f6a7b8c9d0f1"),
    product_id: "PROD001",
    name: "Wireless Headphones XYZ",
    description: "Premium noise-cancelling wireless headphones with 30-hour battery life",
    category: "Electronics",
    subcategory: "Audio",
    price: 199.99,
    stock_quantity: 50,
    images: ["https://cdn.example.com/prod001_1.jpg", "https://cdn.example.com/prod001_2.jpg"],
    specifications: {
      brand: "AudioTech",
      color: "Black",
      wireless: true,
      battery_life: "30 hours",
      noise_cancellation: true,
    },
    ratings: {
      average: 4.5,
      count: 128,
    },
    created_at: ISODate("2023-06-01T00:00:00Z"),
    updated_at: ISODate("2024-01-10T15:30:00Z"),
  },
  {
    _id: ObjectId("65a1b2c3d4e5f6a7b8c9d0f2"),
    product_id: "PROD002",
    name: "Smartphone Pro Max",
    description: "Latest flagship smartphone with advanced camera system",
    category: "Electronics",
    subcategory: "Mobile",
    price: 999.99,
    stock_quantity: 30,
    images: ["https://cdn.example.com/prod002_1.jpg", "https://cdn.example.com/prod002_2.jpg"],
    specifications: {
      brand: "TechPhone",
      color: "Space Gray",
      storage: "256GB",
      screen_size: "6.7 inches",
      camera: "48MP Triple Camera",
    },
    ratings: {
      average: 4.7,
      count: 342,
    },
    created_at: ISODate("2023-09-15T00:00:00Z"),
    updated_at: ISODate("2024-01-12T10:20:00Z"),
  },
  {
    _id: ObjectId("65a1b2c3d4e5f6a7b8c9d0f3"),
    product_id: "PROD003",
    name: "Laptop Ultra 15",
    description: "High-performance laptop for professionals",
    category: "Electronics",
    subcategory: "Computers",
    price: 1499.99,
    stock_quantity: 15,
    images: ["https://cdn.example.com/prod003_1.jpg"],
    specifications: {
      brand: "CompuTech",
      processor: "Intel Core i7",
      ram: "16GB",
      storage: "512GB SSD",
      screen_size: "15.6 inches",
    },
    ratings: {
      average: 4.6,
      count: 89,
    },
    created_at: ISODate("2023-07-20T00:00:00Z"),
    updated_at: ISODate("2024-01-08T14:15:00Z"),
  },
  {
    _id: ObjectId("65a1b2c3d4e5f6a7b8c9d0f4"),
    product_id: "PROD042",
    name: "Phone Case",
    description: "Protective phone case with shock absorption",
    category: "Accessories",
    subcategory: "Phone Accessories",
    price: 15.99,
    stock_quantity: 200,
    images: ["https://cdn.example.com/prod042_1.jpg"],
    specifications: {
      brand: "CaseMate",
      color: "Clear",
      material: "Polycarbonate",
      compatible_with: ["iPhone 14", "iPhone 15"],
    },
    ratings: {
      average: 4.2,
      count: 567,
    },
    created_at: ISODate("2023-05-10T00:00:00Z"),
    updated_at: ISODate("2024-01-05T11:30:00Z"),
  },
];

const prodResult = db.products.insertMany(products);
print(`✓ Imported ${prodResult.insertedIds.length} products`);

// ========================================================================
// Import Orders
// ========================================================================
print("\nImporting orders...");

const orders = [
  {
    _id: ObjectId("65a1b2c3d4e5f6a7b8c9d101"),
    order_id: "ORD001",
    customer_id: "CUST001",
    order_date: ISODate("2024-01-15T14:30:00Z"),
    status: "shipped",
    shipping_address: {
      street: "123 Main St",
      city: "New York",
      state: "NY",
      zip: "10001",
      country: "USA",
    },
    billing_address: {
      street: "123 Main St",
      city: "New York",
      state: "NY",
      zip: "10001",
      country: "USA",
    },
    payment_method: "credit_card",
    items: [
      {
        product_id: "PROD001",
        product_name: "Wireless Headphones XYZ",
        quantity: 1,
        unit_price: 199.99,
        subtotal: 199.99,
      },
      {
        product_id: "PROD042",
        product_name: "Phone Case",
        quantity: 2,
        unit_price: 15.99,
        subtotal: 31.98,
      },
    ],
    subtotal: 231.97,
    tax: 20.88,
    shipping_cost: 9.99,
    total: 262.84,
    tracking_number: "1Z999AA10123456784",
    estimated_delivery: ISODate("2024-01-20T00:00:00Z"),
  },
  {
    _id: ObjectId("65a1b2c3d4e5f6a7b8c9d102"),
    order_id: "ORD002",
    customer_id: "CUST002",
    order_date: ISODate("2024-01-18T10:15:00Z"),
    status: "processing",
    shipping_address: {
      street: "456 Oak Ave",
      city: "Los Angeles",
      state: "CA",
      zip: "90001",
      country: "USA",
    },
    billing_address: {
      street: "456 Oak Ave",
      city: "Los Angeles",
      state: "CA",
      zip: "90001",
      country: "USA",
    },
    payment_method: "paypal",
    items: [
      {
        product_id: "PROD002",
        product_name: "Smartphone Pro Max",
        quantity: 1,
        unit_price: 999.99,
        subtotal: 999.99,
      },
    ],
    subtotal: 999.99,
    tax: 90.0,
    shipping_cost: 0,
    total: 1089.99,
  },
  {
    _id: ObjectId("65a1b2c3d4e5f6a7b8c9d103"),
    order_id: "ORD003",
    customer_id: "CUST001",
    order_date: ISODate("2024-02-10T16:45:00Z"),
    status: "delivered",
    shipping_address: {
      street: "123 Main St",
      city: "New York",
      state: "NY",
      zip: "10001",
      country: "USA",
    },
    billing_address: {
      street: "123 Main St",
      city: "New York",
      state: "NY",
      zip: "10001",
      country: "USA",
    },
    payment_method: "credit_card",
    items: [
      {
        product_id: "PROD042",
        product_name: "Phone Case",
        quantity: 5,
        unit_price: 15.99,
        subtotal: 79.95,
      },
    ],
    subtotal: 79.95,
    tax: 7.2,
    shipping_cost: 5.99,
    total: 93.14,
    tracking_number: "1Z999AA10987654321",
    delivered_date: ISODate("2024-02-13T14:30:00Z"),
  },
  {
    _id: ObjectId("65a1b2c3d4e5f6a7b8c9d104"),
    order_id: "ORD004",
    customer_id: "CUST003",
    order_date: ISODate("2024-02-12T11:30:00Z"),
    status: "pending",
    shipping_address: {
      street: "789 Elm St",
      city: "Chicago",
      state: "IL",
      zip: "60601",
      country: "USA",
    },
    billing_address: {
      street: "789 Elm St",
      city: "Chicago",
      state: "IL",
      zip: "60601",
      country: "USA",
    },
    payment_method: "debit_card",
    items: [
      {
        product_id: "PROD003",
        product_name: "Laptop Ultra 15",
        quantity: 1,
        unit_price: 1499.99,
        subtotal: 1499.99,
      },
      {
        product_id: "PROD001",
        product_name: "Wireless Headphones XYZ",
        quantity: 2,
        unit_price: 199.99,
        subtotal: 399.98,
      },
    ],
    subtotal: 1899.97,
    tax: 171.0,
    shipping_cost: 0,
    total: 2070.97,
  },
];

const ordResult = db.orders.insertMany(orders);
print(`✓ Imported ${ordResult.insertedIds.length} orders`);

// ========================================================================
// Import Reviews
// ========================================================================
print("\nImporting reviews...");

const reviews = [
  {
    _id: ObjectId("65a1b2c3d4e5f6a7b8c9d201"),
    review_id: "REV001",
    product_id: "PROD001",
    product_name: "Wireless Headphones XYZ",
    customer_id: "CUST001",
    customer_name: "Alice J.",
    rating: 5,
    title: "Excellent sound quality!",
    comment:
      "These headphones exceeded my expectations. The noise cancellation is superb and battery life is as advertised.",
    helpful_count: 42,
    verified_purchase: true,
    created_at: ISODate("2024-01-20T10:15:00Z"),
  },
  {
    _id: ObjectId("65a1b2c3d4e5f6a7b8c9d202"),
    review_id: "REV002",
    product_id: "PROD001",
    product_name: "Wireless Headphones XYZ",
    customer_id: "CUST002",
    customer_name: "Bob S.",
    rating: 4,
    title: "Good value for money",
    comment: "Sound quality is great, comfort could be better for long sessions.",
    helpful_count: 18,
    verified_purchase: true,
    created_at: ISODate("2024-01-22T14:30:00Z"),
  },
  {
    _id: ObjectId("65a1b2c3d4e5f6a7b8c9d203"),
    review_id: "REV003",
    product_id: "PROD002",
    product_name: "Smartphone Pro Max",
    customer_id: "CUST002",
    customer_name: "Bob S.",
    rating: 5,
    title: "Best phone I've ever owned",
    comment: "Camera is amazing, battery lasts all day, super fast processor.",
    helpful_count: 67,
    verified_purchase: true,
    created_at: ISODate("2024-01-25T09:45:00Z"),
  },
  {
    _id: ObjectId("65a1b2c3d4e5f6a7b8c9d204"),
    review_id: "REV004",
    product_id: "PROD003",
    product_name: "Laptop Ultra 15",
    customer_id: "CUST003",
    customer_name: "Carol W.",
    rating: 4,
    title: "Powerful machine",
    comment: "Great performance for development work. Screen could be brighter.",
    helpful_count: 23,
    verified_purchase: false,
    created_at: ISODate("2024-02-01T16:20:00Z"),
  },
  {
    _id: ObjectId("65a1b2c3d4e5f6a7b8c9d205"),
    review_id: "REV005",
    product_id: "PROD042",
    product_name: "Phone Case",
    customer_id: "CUST001",
    customer_name: "Alice J.",
    rating: 4,
    title: "Good protection",
    comment: "Fits perfectly, provides good protection. A bit slippery though.",
    helpful_count: 8,
    verified_purchase: true,
    created_at: ISODate("2024-02-14T11:00:00Z"),
  },
  {
    _id: ObjectId("65a1b2c3d4e5f6a7b8c9d206"),
    review_id: "REV006",
    product_id: "PROD001",
    product_name: "Wireless Headphones XYZ",
    customer_id: "CUST003",
    customer_name: "Carol W.",
    rating: 3,
    title: "Average headphones",
    comment: "Sound is okay, but connection drops sometimes.",
    helpful_count: 5,
    verified_purchase: false,
    created_at: ISODate("2024-02-15T13:30:00Z"),
  },
];

const revResult = db.reviews.insertMany(reviews);
print(`✓ Imported ${revResult.insertedIds.length} reviews`);

// ========================================================================
// Create Indexes
// ========================================================================
print("\nCreating indexes...");

// Customers collection
db.customers.createIndex({ customer_id: 1 }, { unique: true });
db.customers.createIndex({ email: 1 }, { unique: true });
print("✓ Created indexes for customers");

// Products collection
db.products.createIndex({ product_id: 1 }, { unique: true });
db.products.createIndex({ category: 1 });
db.products.createIndex({ price: 1 });
db.products.createIndex({ category: 1, price: 1 });
db.products.createIndex({ name: "text", description: "text" }, { name: "product_text_search" });
print("✓ Created indexes for products");

// Orders collection
db.orders.createIndex({ order_id: 1 }, { unique: true });
db.orders.createIndex({ customer_id: 1 });
db.orders.createIndex({ order_date: -1 });
db.orders.createIndex({ customer_id: 1, order_date: -1 });
db.orders.createIndex({ status: 1 });
db.orders.createIndex({ "items.product_id": 1 });
print("✓ Created indexes for orders");

// Reviews collection
db.reviews.createIndex({ review_id: 1 }, { unique: true });
db.reviews.createIndex({ product_id: 1 });
db.reviews.createIndex({ customer_id: 1 });
db.reviews.createIndex({ product_id: 1, created_at: -1 });
db.reviews.createIndex({ rating: 1 });
print("✓ Created indexes for reviews");

// ========================================================================
// Verify Import
// ========================================================================
print("\n" + "=".repeat(60));
print("IMPORT SUMMARY");
print("=".repeat(60));

print("\nDocument counts:");
print(`  Customers: ${db.customers.countDocuments()}`);
print(`  Products: ${db.products.countDocuments()}`);
print(`  Orders: ${db.orders.countDocuments()}`);
print(`  Reviews: ${db.reviews.countDocuments()}`);

print("\nSample data:");
const sampleCustomer = db.customers.findOne();
print(`  Customer: ${sampleCustomer.name} (${sampleCustomer.email})`);

const sampleProduct = db.products.findOne();
print(`  Product: ${sampleProduct.name} - $${sampleProduct.price}`);

const sampleOrder = db.orders.findOne();
print(`  Order: ${sampleOrder.order_id} - Total: $${sampleOrder.total}`);

print("\n✓ E-commerce data import completed successfully!");
print("Database 'lab02_ecommerce' is ready for use.");
print("=".repeat(60));
