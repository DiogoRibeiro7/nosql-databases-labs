/**
 * Lab 02 - MongoDB Validation Schemas
 *
 * This file contains MongoDB JSON Schema validation rules for each collection
 * in the e-commerce data model. These schemas enforce data integrity at the
 * database level.
 */

const { MongoClient } = require("mongodb");

const DATABASE_NAME = "lab02_ecommerce";
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

/**
 * Customer collection validation schema
 */
const customerSchema = {
  $jsonSchema: {
    bsonType: "object",
    required: ["customer_id", "name", "email", "address", "created_at"],
    properties: {
      customer_id: {
        bsonType: "string",
        pattern: "^CUST[0-9]{3,}$",
        description: "Customer ID must start with CUST followed by at least 3 digits"
      },
      name: {
        bsonType: "string",
        minLength: 2,
        maxLength: 100,
        description: "Customer name must be between 2 and 100 characters"
      },
      email: {
        bsonType: "string",
        pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
        description: "Must be a valid email address"
      },
      phone: {
        bsonType: "string",
        pattern: "^\\+?[1-9]\\d{1,14}$",
        description: "Must be a valid international phone number"
      },
      address: {
        bsonType: "object",
        required: ["street", "city", "state", "zip", "country"],
        properties: {
          street: {
            bsonType: "string",
            minLength: 5,
            maxLength: 200
          },
          city: {
            bsonType: "string",
            minLength: 2,
            maxLength: 100
          },
          state: {
            bsonType: "string",
            minLength: 2,
            maxLength: 50
          },
          zip: {
            bsonType: "string",
            pattern: "^[0-9]{5}(-[0-9]{4})?$",
            description: "Must be a valid ZIP code"
          },
          country: {
            bsonType: "string",
            minLength: 2,
            maxLength: 100
          }
        }
      },
      order_summary: {
        bsonType: "object",
        properties: {
          total_orders: {
            bsonType: "int",
            minimum: 0
          },
          total_spent: {
            bsonType: "double",
            minimum: 0
          },
          last_order_date: {
            bsonType: "date"
          },
          favorite_category: {
            bsonType: "string"
          }
        }
      },
      created_at: {
        bsonType: "date",
        description: "Customer registration date"
      },
      updated_at: {
        bsonType: "date"
      },
      status: {
        enum: ["active", "inactive", "suspended"],
        description: "Customer account status"
      }
    }
  }
};

/**
 * Product collection validation schema
 */
const productSchema = {
  $jsonSchema: {
    bsonType: "object",
    required: ["product_id", "name", "category", "price", "stock_quantity"],
    properties: {
      product_id: {
        bsonType: "string",
        pattern: "^PROD[0-9]{3,}$",
        description: "Product ID must start with PROD followed by at least 3 digits"
      },
      name: {
        bsonType: "string",
        minLength: 3,
        maxLength: 200,
        description: "Product name must be between 3 and 200 characters"
      },
      description: {
        bsonType: "string",
        maxLength: 2000
      },
      category: {
        bsonType: "string",
        enum: ["Electronics", "Clothing", "Books", "Home & Garden", "Sports", "Toys", "Food & Beverage"],
        description: "Product category must be from predefined list"
      },
      subcategory: {
        bsonType: "string"
      },
      price: {
        bsonType: "double",
        minimum: 0.01,
        maximum: 999999.99,
        description: "Price must be positive and less than 1 million"
      },
      stock_quantity: {
        bsonType: "int",
        minimum: 0,
        description: "Stock quantity cannot be negative"
      },
      images: {
        bsonType: "array",
        minItems: 1,
        maxItems: 10,
        items: {
          bsonType: "string",
          pattern: "^https?://.*\\.(jpg|jpeg|png|gif|webp)$"
        }
      },
      specifications: {
        bsonType: "object",
        additionalProperties: true
      },
      ratings: {
        bsonType: "object",
        properties: {
          average: {
            bsonType: "double",
            minimum: 1,
            maximum: 5
          },
          count: {
            bsonType: "int",
            minimum: 0
          }
        }
      },
      created_at: {
        bsonType: "date"
      },
      updated_at: {
        bsonType: "date"
      }
    }
  }
};

/**
 * Order collection validation schema
 */
const orderSchema = {
  $jsonSchema: {
    bsonType: "object",
    required: ["order_id", "customer_id", "order_date", "items", "total_amount", "status"],
    properties: {
      order_id: {
        bsonType: "string",
        pattern: "^ORD[0-9]{3,}$",
        description: "Order ID must start with ORD followed by at least 3 digits"
      },
      customer_id: {
        bsonType: "string",
        pattern: "^CUST[0-9]{3,}$",
        description: "Must reference a valid customer ID"
      },
      customer_name: {
        bsonType: "string",
        description: "Denormalized customer name for display"
      },
      order_date: {
        bsonType: "date",
        description: "Order placement date"
      },
      status: {
        enum: ["pending", "processing", "shipped", "delivered", "cancelled", "returned"],
        description: "Order status must be from predefined list"
      },
      items: {
        bsonType: "array",
        minItems: 1,
        items: {
          bsonType: "object",
          required: ["product_id", "product_name", "quantity", "unit_price"],
          properties: {
            product_id: {
              bsonType: "string",
              pattern: "^PROD[0-9]{3,}$"
            },
            product_name: {
              bsonType: "string",
              minLength: 3
            },
            quantity: {
              bsonType: "int",
              minimum: 1,
              maximum: 100,
              description: "Quantity must be between 1 and 100"
            },
            unit_price: {
              bsonType: "double",
              minimum: 0.01,
              description: "Unit price must be positive"
            },
            discount: {
              bsonType: "double",
              minimum: 0,
              maximum: 1,
              description: "Discount as decimal (0-1)"
            }
          }
        }
      },
      shipping_address: {
        bsonType: "object",
        required: ["street", "city", "state", "zip"],
        properties: {
          street: {
            bsonType: "string",
            minLength: 5
          },
          city: {
            bsonType: "string",
            minLength: 2
          },
          state: {
            bsonType: "string",
            minLength: 2
          },
          zip: {
            bsonType: "string",
            pattern: "^[0-9]{5}(-[0-9]{4})?$"
          }
        }
      },
      payment: {
        bsonType: "object",
        properties: {
          method: {
            enum: ["credit_card", "debit_card", "paypal", "bank_transfer", "cash_on_delivery"]
          },
          status: {
            enum: ["pending", "completed", "failed", "refunded"]
          },
          transaction_id: {
            bsonType: "string"
          }
        }
      },
      subtotal: {
        bsonType: "double",
        minimum: 0
      },
      tax_amount: {
        bsonType: "double",
        minimum: 0
      },
      shipping_cost: {
        bsonType: "double",
        minimum: 0
      },
      total_amount: {
        bsonType: "double",
        minimum: 0.01,
        description: "Total amount must be positive"
      },
      notes: {
        bsonType: "string",
        maxLength: 500
      }
    },
    additionalProperties: false
  }
};

/**
 * Review collection validation schema
 */
const reviewSchema = {
  $jsonSchema: {
    bsonType: "object",
    required: ["product_id", "customer_id", "rating", "created_at"],
    properties: {
      review_id: {
        bsonType: "string",
        pattern: "^REV[0-9]{3,}$"
      },
      product_id: {
        bsonType: "string",
        pattern: "^PROD[0-9]{3,}$",
        description: "Must reference a valid product ID"
      },
      product_name: {
        bsonType: "string",
        description: "Denormalized product name"
      },
      customer_id: {
        bsonType: "string",
        pattern: "^CUST[0-9]{3,}$",
        description: "Must reference a valid customer ID"
      },
      customer_name: {
        bsonType: "string",
        description: "Denormalized customer name"
      },
      rating: {
        bsonType: "int",
        minimum: 1,
        maximum: 5,
        description: "Rating must be between 1 and 5"
      },
      title: {
        bsonType: "string",
        maxLength: 200
      },
      comment: {
        bsonType: "string",
        minLength: 10,
        maxLength: 5000,
        description: "Review comment must be between 10 and 5000 characters"
      },
      verified_purchase: {
        bsonType: "bool",
        description: "Whether the reviewer purchased the product"
      },
      helpful_votes: {
        bsonType: "int",
        minimum: 0
      },
      total_votes: {
        bsonType: "int",
        minimum: 0
      },
      images: {
        bsonType: "array",
        maxItems: 5,
        items: {
          bsonType: "string"
        }
      },
      created_at: {
        bsonType: "date"
      },
      updated_at: {
        bsonType: "date"
      }
    }
  }
};

/**
 * Shopping cart collection validation schema (with TTL)
 */
const cartSchema = {
  $jsonSchema: {
    bsonType: "object",
    required: ["session_id", "created_at", "expires_at", "items"],
    properties: {
      session_id: {
        bsonType: "string",
        description: "Session identifier for the cart"
      },
      customer_id: {
        bsonType: ["string", "null"],
        pattern: "^CUST[0-9]{3,}$",
        description: "Customer ID if logged in, null for guests"
      },
      created_at: {
        bsonType: "date"
      },
      expires_at: {
        bsonType: "date",
        description: "TTL expiration date for auto-cleanup"
      },
      items: {
        bsonType: "array",
        items: {
          bsonType: "object",
          required: ["product_id", "quantity", "unit_price"],
          properties: {
            product_id: {
              bsonType: "string",
              pattern: "^PROD[0-9]{3,}$"
            },
            product_name: {
              bsonType: "string"
            },
            quantity: {
              bsonType: "int",
              minimum: 1,
              maximum: 99
            },
            unit_price: {
              bsonType: "double",
              minimum: 0.01
            },
            selected_options: {
              bsonType: "object",
              additionalProperties: true
            }
          }
        }
      },
      subtotal: {
        bsonType: "double",
        minimum: 0
      },
      estimated_tax: {
        bsonType: "double",
        minimum: 0
      },
      estimated_shipping: {
        bsonType: "double",
        minimum: 0
      },
      estimated_total: {
        bsonType: "double",
        minimum: 0
      },
      applied_coupons: {
        bsonType: "array",
        items: {
          bsonType: "string"
        }
      }
    }
  }
};

// ============================================================================
// APPLY VALIDATION SCHEMAS
// ============================================================================

/**
 * Apply validation schemas to collections
 */
async function applyValidationSchemas() {
  let client;

  try {
    console.log("Connecting to MongoDB...");
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log(`Connected to database: ${DATABASE_NAME}\n`);

    const db = client.db(DATABASE_NAME);

    console.log("=".repeat(60));
    console.log("APPLYING VALIDATION SCHEMAS");
    console.log("=".repeat(60));

    // Apply schemas to existing collections or create with validation
    const schemas = [
      { name: "customers", schema: customerSchema },
      { name: "products", schema: productSchema },
      { name: "orders", schema: orderSchema },
      { name: "reviews", schema: reviewSchema },
      { name: "carts", schema: cartSchema }
    ];

    for (const { name, schema } of schemas) {
      try {
        // Check if collection exists
        const collections = await db.listCollections({ name }).toArray();

        if (collections.length > 0) {
          // Update existing collection validation
          await db.command({
            collMod: name,
            validator: schema,
            validationLevel: "moderate", // Only validate inserts and updates
            validationAction: "warn"     // Log warnings but don't reject
          });
          console.log(`✓ Updated validation schema for collection: ${name}`);
        } else {
          // Create collection with validation
          await db.createCollection(name, {
            validator: schema,
            validationLevel: "strict",
            validationAction: "error"
          });
          console.log(`✓ Created collection with validation: ${name}`);
        }
      } catch (error) {
        console.error(`✗ Error applying schema to ${name}: ${error.message}`);
      }
    }

    // Create indexes for better performance
    console.log("\n" + "=".repeat(60));
    console.log("CREATING INDEXES");
    console.log("=".repeat(60));

    // Customer indexes
    await db.collection("customers").createIndex({ customer_id: 1 }, { unique: true });
    await db.collection("customers").createIndex({ email: 1 }, { unique: true });
    console.log("✓ Created customer indexes");

    // Product indexes
    await db.collection("products").createIndex({ product_id: 1 }, { unique: true });
    await db.collection("products").createIndex({ category: 1 });
    await db.collection("products").createIndex({ "ratings.average": -1 });
    console.log("✓ Created product indexes");

    // Order indexes
    await db.collection("orders").createIndex({ order_id: 1 }, { unique: true });
    await db.collection("orders").createIndex({ customer_id: 1, order_date: -1 });
    await db.collection("orders").createIndex({ status: 1 });
    console.log("✓ Created order indexes");

    // Review indexes
    await db.collection("reviews").createIndex({ product_id: 1, created_at: -1 });
    await db.collection("reviews").createIndex({ customer_id: 1 });
    await db.collection("reviews").createIndex({ rating: 1 });
    console.log("✓ Created review indexes");

    // Cart TTL index
    await db.collection("carts").createIndex(
      { expires_at: 1 },
      { expireAfterSeconds: 0 } // TTL based on expires_at value
    );
    console.log("✓ Created cart TTL index");

    console.log("\n✓ All validation schemas and indexes applied successfully!");

  } catch (error) {
    console.error("\nError applying validation schemas:", error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log("\nDisconnected from MongoDB");
    }
  }
}

/**
 * Test validation by attempting invalid inserts
 */
async function testValidation() {
  let client;

  try {
    console.log("\n" + "=".repeat(60));
    console.log("TESTING VALIDATION SCHEMAS");
    console.log("=".repeat(60));

    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DATABASE_NAME);

    // Test invalid customer (missing required field)
    console.log("\nTest 1: Invalid customer (missing email)");
    try {
      await db.collection("customers").insertOne({
        customer_id: "CUST999",
        name: "Test User"
        // Missing email and address
      });
      console.log("✗ Validation failed: Invalid document was accepted");
    } catch (error) {
      console.log("✓ Validation worked: Invalid document rejected");
      console.log(`  Error: ${error.message}`);
    }

    // Test invalid order (negative quantity)
    console.log("\nTest 2: Invalid order (negative quantity)");
    try {
      await db.collection("orders").insertOne({
        order_id: "ORD999",
        customer_id: "CUST001",
        order_date: new Date(),
        status: "pending",
        items: [{
          product_id: "PROD001",
          product_name: "Test Product",
          quantity: -1, // Invalid: negative
          unit_price: 10.00
        }],
        total_amount: 10.00
      });
      console.log("✗ Validation failed: Invalid document was accepted");
    } catch (error) {
      console.log("✓ Validation worked: Invalid document rejected");
      console.log(`  Error: ${error.message}`);
    }

    // Test invalid review (rating out of range)
    console.log("\nTest 3: Invalid review (rating > 5)");
    try {
      await db.collection("reviews").insertOne({
        product_id: "PROD001",
        customer_id: "CUST001",
        rating: 10, // Invalid: > 5
        created_at: new Date()
      });
      console.log("✗ Validation failed: Invalid document was accepted");
    } catch (error) {
      console.log("✓ Validation worked: Invalid document rejected");
      console.log(`  Error: ${error.message}`);
    }

    console.log("\n✓ Validation testing complete!");

  } catch (error) {
    console.error("\nError during validation testing:", error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Run if executed directly
if (require.main === module) {
  console.log("Lab 02 - MongoDB Validation Schema Setup");
  console.log("=".repeat(60));

  const args = process.argv.slice(2);

  if (args.includes("--test")) {
    applyValidationSchemas()
      .then(() => testValidation())
      .catch(console.error);
  } else {
    applyValidationSchemas().catch(console.error);
  }
}

module.exports = {
  schemas: {
    customerSchema,
    productSchema,
    orderSchema,
    reviewSchema,
    cartSchema
  },
  applyValidationSchemas
};