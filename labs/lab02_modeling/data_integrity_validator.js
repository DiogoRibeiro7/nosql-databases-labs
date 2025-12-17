/**
 * Lab 02 - Data Integrity and Relationship Validator
 *
 * This script performs comprehensive data integrity and relationship validation
 * for the e-commerce data model, ensuring consistency and correctness.
 */

const { MongoClient } = require("mongodb");

const DATABASE_NAME = "lab02_ecommerce";
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";

// Validation results tracking
const validationResults = {
  passed: [],
  failed: [],
  warnings: [],
};

/**
 * Log a validation result
 * @param {string} type - 'pass', 'fail', or 'warning'
 * @param {string} category - Validation category
 * @param {string} message - Result message
 * @param {Object} details - Additional details
 */
function logResult(type, category, message, details = {}) {
  const result = { category, message, details, timestamp: new Date() };

  switch (type) {
    case "pass":
      validationResults.passed.push(result);
      console.log(`✓ [${category}] ${message}`);
      break;
    case "fail":
      validationResults.failed.push(result);
      console.error(`✗ [${category}] ${message}`);
      if (details.error) console.error(`  Details: ${details.error}`);
      break;
    case "warning":
      validationResults.warnings.push(result);
      console.warn(`⚠ [${category}] ${message}`);
      break;
  }
}

/**
 * Validate unique constraints
 */
async function validateUniqueConstraints(db) {
  console.log("\n" + "=".repeat(60));
  console.log("VALIDATING UNIQUE CONSTRAINTS");
  console.log("=".repeat(60));

  // Check customer emails are unique
  const customers = await db.collection("customers").find().toArray();
  const emailMap = {};
  let duplicateEmails = 0;

  customers.forEach((customer) => {
    if (emailMap[customer.email]) {
      duplicateEmails++;
      logResult("fail", "Unique Constraint", `Duplicate email: ${customer.email}`, {
        customer_ids: [emailMap[customer.email], customer.customer_id],
      });
    } else {
      emailMap[customer.email] = customer.customer_id;
    }
  });

  if (duplicateEmails === 0) {
    logResult("pass", "Unique Constraint", "All customer emails are unique");
  }

  // Check customer IDs are unique
  const customerIds = customers.map((c) => c.customer_id);
  const uniqueCustomerIds = [...new Set(customerIds)];

  if (customerIds.length === uniqueCustomerIds.length) {
    logResult("pass", "Unique Constraint", "All customer IDs are unique");
  } else {
    logResult(
      "fail",
      "Unique Constraint",
      `Found ${customerIds.length - uniqueCustomerIds.length} duplicate customer IDs`
    );
  }

  // Check product IDs are unique
  const products = await db.collection("products").find().toArray();
  const productIds = products.map((p) => p.product_id);
  const uniqueProductIds = [...new Set(productIds)];

  if (productIds.length === uniqueProductIds.length) {
    logResult("pass", "Unique Constraint", "All product IDs are unique");
  } else {
    logResult(
      "fail",
      "Unique Constraint",
      `Found ${productIds.length - uniqueProductIds.length} duplicate product IDs`
    );
  }

  // Check order IDs are unique
  const orders = await db.collection("orders").find().toArray();
  const orderIds = orders.map((o) => o.order_id);
  const uniqueOrderIds = [...new Set(orderIds)];

  if (orderIds.length === uniqueOrderIds.length) {
    logResult("pass", "Unique Constraint", "All order IDs are unique");
  } else {
    logResult(
      "fail",
      "Unique Constraint",
      `Found ${orderIds.length - uniqueOrderIds.length} duplicate order IDs`
    );
  }
}

/**
 * Validate referential integrity
 */
async function validateReferentialIntegrity(db) {
  console.log("\n" + "=".repeat(60));
  console.log("VALIDATING REFERENTIAL INTEGRITY");
  console.log("=".repeat(60));

  const customers = await db.collection("customers").find().toArray();
  const products = await db.collection("products").find().toArray();
  const orders = await db.collection("orders").find().toArray();

  const customerIdSet = new Set(customers.map((c) => c.customer_id));
  const productIdSet = new Set(products.map((p) => p.product_id));

  let orphanedOrders = 0;
  let orphanedItems = 0;

  // Check orders reference valid customers
  orders.forEach((order) => {
    if (!customerIdSet.has(order.customer_id)) {
      orphanedOrders++;
      logResult(
        "fail",
        "Referential Integrity",
        `Order ${order.order_id} references non-existent customer ${order.customer_id}`
      );
    }

    // Check order items reference valid products (if strict referential integrity is required)
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach((item) => {
        if (!productIdSet.has(item.product_id)) {
          orphanedItems++;
          logResult(
            "warning",
            "Referential Integrity",
            `Order ${order.order_id} contains reference to non-existent product ${item.product_id}`,
            { note: "This may be intentional for historical orders with discontinued products" }
          );
        }
      });
    }
  });

  if (orphanedOrders === 0) {
    logResult("pass", "Referential Integrity", "All orders reference valid customers");
  }

  if (orphanedItems === 0) {
    logResult("pass", "Referential Integrity", "All order items reference valid products");
  }

  // Check reviews reference valid products and customers
  const reviews = await db.collection("reviews").find().toArray();
  let orphanedReviews = 0;

  reviews.forEach((review) => {
    if (!productIdSet.has(review.product_id)) {
      orphanedReviews++;
      logResult(
        "fail",
        "Referential Integrity",
        `Review ${review._id} references non-existent product ${review.product_id}`
      );
    }
    if (!customerIdSet.has(review.customer_id)) {
      orphanedReviews++;
      logResult(
        "fail",
        "Referential Integrity",
        `Review ${review._id} references non-existent customer ${review.customer_id}`
      );
    }
  });

  if (orphanedReviews === 0) {
    logResult(
      "pass",
      "Referential Integrity",
      "All reviews reference valid products and customers"
    );
  }
}

/**
 * Validate data consistency
 */
async function validateDataConsistency(db) {
  console.log("\n" + "=".repeat(60));
  console.log("VALIDATING DATA CONSISTENCY");
  console.log("=".repeat(60));

  const orders = await db.collection("orders").find().toArray();
  let inconsistentTotals = 0;

  // Check order totals match sum of items
  orders.forEach((order) => {
    if (order.items && Array.isArray(order.items)) {
      const calculatedTotal = order.items.reduce((sum, item) => {
        return sum + item.quantity * item.unit_price;
      }, 0);

      // Allow for small floating point differences
      if (Math.abs(order.total_amount - calculatedTotal) > 0.01) {
        inconsistentTotals++;
        logResult("fail", "Data Consistency", `Order ${order.order_id} total mismatch`, {
          stored_total: order.total_amount,
          calculated_total: calculatedTotal,
          difference: Math.abs(order.total_amount - calculatedTotal),
        });
      }
    }
  });

  if (inconsistentTotals === 0) {
    logResult("pass", "Data Consistency", "All order totals are consistent with item sums");
  }

  // Check denormalized product names in orders match current product names
  const products = await db.collection("products").find().toArray();
  const productMap = {};
  products.forEach((p) => (productMap[p.product_id] = p));

  let nameMismatches = 0;
  orders.forEach((order) => {
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach((item) => {
        const currentProduct = productMap[item.product_id];
        if (currentProduct && item.product_name !== currentProduct.name) {
          nameMismatches++;
          logResult(
            "warning",
            "Data Consistency",
            `Denormalized product name mismatch in order ${order.order_id}`,
            {
              stored_name: item.product_name,
              current_name: currentProduct.name,
              note: "This may be intentional for historical accuracy",
            }
          );
        }
      });
    }
  });

  if (nameMismatches === 0) {
    logResult("pass", "Data Consistency", "All denormalized product names match current values");
  }
}

/**
 * Validate required fields
 */
async function validateRequiredFields(db) {
  console.log("\n" + "=".repeat(60));
  console.log("VALIDATING REQUIRED FIELDS");
  console.log("=".repeat(60));

  // Define required fields for each collection
  const requiredFields = {
    customers: ["customer_id", "name", "email", "address"],
    products: ["product_id", "name", "category", "price", "stock_quantity"],
    orders: ["order_id", "customer_id", "order_date", "total_amount", "items"],
    reviews: ["product_id", "customer_id", "rating", "created_at"],
  };

  for (const [collection, fields] of Object.entries(requiredFields)) {
    const documents = await db.collection(collection).find().toArray();
    let missingFields = 0;

    documents.forEach((doc) => {
      fields.forEach((field) => {
        if (doc[field] === undefined || doc[field] === null) {
          missingFields++;
          logResult(
            "fail",
            "Required Fields",
            `Document in ${collection} missing required field: ${field}`,
            { document_id: doc._id || doc[`${collection.slice(0, -1)}_id`] }
          );
        }
      });
    });

    if (missingFields === 0) {
      logResult("pass", "Required Fields", `All documents in ${collection} have required fields`);
    }
  }
}

/**
 * Validate data types and formats
 */
async function validateDataTypes(db) {
  console.log("\n" + "=".repeat(60));
  console.log("VALIDATING DATA TYPES AND FORMATS");
  console.log("=".repeat(60));

  // Validate customer emails
  const customers = await db.collection("customers").find().toArray();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  let invalidEmails = 0;

  customers.forEach((customer) => {
    if (!emailRegex.test(customer.email)) {
      invalidEmails++;
      logResult("fail", "Data Format", `Invalid email format: ${customer.email}`, {
        customer_id: customer.customer_id,
      });
    }
  });

  if (invalidEmails === 0) {
    logResult("pass", "Data Format", "All customer emails have valid format");
  }

  // Validate product prices
  const products = await db.collection("products").find().toArray();
  let invalidPrices = 0;

  products.forEach((product) => {
    if (typeof product.price !== "number" || product.price < 0) {
      invalidPrices++;
      logResult(
        "fail",
        "Data Type",
        `Invalid price for product ${product.product_id}: ${product.price}`
      );
    }
    if (typeof product.stock_quantity !== "number" || product.stock_quantity < 0) {
      invalidPrices++;
      logResult(
        "fail",
        "Data Type",
        `Invalid stock quantity for product ${product.product_id}: ${product.stock_quantity}`
      );
    }
  });

  if (invalidPrices === 0) {
    logResult("pass", "Data Type", "All products have valid prices and quantities");
  }

  // Validate order dates
  const orders = await db.collection("orders").find().toArray();
  let invalidDates = 0;

  orders.forEach((order) => {
    const orderDate = new Date(order.order_date);
    if (isNaN(orderDate.getTime())) {
      invalidDates++;
      logResult(
        "fail",
        "Data Type",
        `Invalid date for order ${order.order_id}: ${order.order_date}`
      );
    }
  });

  if (invalidDates === 0) {
    logResult("pass", "Data Type", "All orders have valid dates");
  }

  // Validate review ratings
  const reviews = await db.collection("reviews").find().toArray();
  let invalidRatings = 0;

  reviews.forEach((review) => {
    if (typeof review.rating !== "number" || review.rating < 1 || review.rating > 5) {
      invalidRatings++;
      logResult("fail", "Data Type", `Invalid rating for review: ${review.rating}`, {
        review_id: review._id,
      });
    }
  });

  if (invalidRatings === 0) {
    logResult("pass", "Data Type", "All reviews have valid ratings (1-5)");
  }
}

/**
 * Validate business rules
 */
async function validateBusinessRules(db) {
  console.log("\n" + "=".repeat(60));
  console.log("VALIDATING BUSINESS RULES");
  console.log("=".repeat(60));

  const orders = await db.collection("orders").find().toArray();

  // Check that all orders have at least one item
  let emptyOrders = 0;
  orders.forEach((order) => {
    if (!order.items || order.items.length === 0) {
      emptyOrders++;
      logResult("fail", "Business Rule", `Order ${order.order_id} has no items`);
    }
  });

  if (emptyOrders === 0) {
    logResult("pass", "Business Rule", "All orders have at least one item");
  }

  // Check that order items have positive quantities
  let invalidQuantities = 0;
  orders.forEach((order) => {
    if (order.items) {
      order.items.forEach((item) => {
        if (item.quantity <= 0) {
          invalidQuantities++;
          logResult(
            "fail",
            "Business Rule",
            `Order ${order.order_id} has item with invalid quantity: ${item.quantity}`
          );
        }
      });
    }
  });

  if (invalidQuantities === 0) {
    logResult("pass", "Business Rule", "All order items have positive quantities");
  }

  // Check for reasonable date ranges
  const now = new Date();
  let futureDates = 0;

  orders.forEach((order) => {
    const orderDate = new Date(order.order_date);
    if (orderDate > now) {
      futureDates++;
      logResult(
        "warning",
        "Business Rule",
        `Order ${order.order_id} has future date: ${order.order_date}`
      );
    }
  });

  if (futureDates === 0) {
    logResult("pass", "Business Rule", "No orders have future dates");
  }
}

/**
 * Validate embedded vs referenced design decisions
 */
async function validateModelingDecisions(db) {
  console.log("\n" + "=".repeat(60));
  console.log("VALIDATING MODELING DECISIONS");
  console.log("=".repeat(60));

  // Check that order items are embedded (not referenced)
  const orders = await db.collection("orders").find().limit(5).toArray();
  let embeddedItems = true;

  orders.forEach((order) => {
    if (!order.items || !Array.isArray(order.items)) {
      embeddedItems = false;
      logResult(
        "fail",
        "Modeling Decision",
        `Order ${order.order_id} doesn't have embedded items array`
      );
    } else {
      // Check that items contain denormalized product data
      const hasProductData = order.items.every(
        (item) => item.product_name && item.unit_price !== undefined
      );
      if (!hasProductData) {
        logResult(
          "warning",
          "Modeling Decision",
          `Order ${order.order_id} items missing denormalized product data`
        );
      }
    }
  });

  if (embeddedItems) {
    logResult("pass", "Modeling Decision", "Order items are properly embedded");
  }

  // Check that reviews are NOT embedded in products (separate collection)
  const products = await db.collection("products").find().limit(5).toArray();
  let separateReviews = true;

  products.forEach((product) => {
    if (product.reviews && Array.isArray(product.reviews)) {
      separateReviews = false;
      logResult(
        "fail",
        "Modeling Decision",
        `Product ${product.product_id} has embedded reviews (should be separate for unbounded growth)`
      );
    }
  });

  if (separateReviews) {
    logResult("pass", "Modeling Decision", "Reviews are properly stored in separate collection");
  }

  // Check that customer addresses are embedded
  const customers = await db.collection("customers").find().limit(5).toArray();
  let embeddedAddresses = true;

  customers.forEach((customer) => {
    if (!customer.address || typeof customer.address !== "object") {
      embeddedAddresses = false;
      logResult(
        "warning",
        "Modeling Decision",
        `Customer ${customer.customer_id} doesn't have embedded address`
      );
    }
  });

  if (embeddedAddresses) {
    logResult("pass", "Modeling Decision", "Customer addresses are properly embedded");
  }
}

/**
 * Generate validation report
 */
function generateReport() {
  console.log("\n" + "=".repeat(60));
  console.log("VALIDATION SUMMARY");
  console.log("=".repeat(60));

  const totalTests = validationResults.passed.length + validationResults.failed.length;
  const passRate =
    totalTests > 0 ? ((validationResults.passed.length / totalTests) * 100).toFixed(1) : 0;

  console.log(`\nTotal Tests: ${totalTests}`);
  console.log(`Passed: ${validationResults.passed.length} (${passRate}%)`);
  console.log(`Failed: ${validationResults.failed.length}`);
  console.log(`Warnings: ${validationResults.warnings.length}`);

  if (validationResults.failed.length > 0) {
    console.log("\nFailed Validations:");
    console.log("-".repeat(40));

    // Group failures by category
    const failuresByCategory = {};
    validationResults.failed.forEach((result) => {
      if (!failuresByCategory[result.category]) {
        failuresByCategory[result.category] = [];
      }
      failuresByCategory[result.category].push(result.message);
    });

    Object.entries(failuresByCategory).forEach(([category, messages]) => {
      console.log(`\n${category}:`);
      messages.forEach((msg) => console.log(`  - ${msg}`));
    });
  }

  if (validationResults.warnings.length > 0) {
    console.log("\nWarnings:");
    console.log("-".repeat(40));
    validationResults.warnings.forEach((result) => {
      console.log(`  - [${result.category}] ${result.message}`);
    });
  }

  // Export results to JSON
  const reportFile = "validation_report.json";
  require("fs").writeFileSync(
    reportFile,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        database: DATABASE_NAME,
        summary: {
          total_tests: totalTests,
          passed: validationResults.passed.length,
          failed: validationResults.failed.length,
          warnings: validationResults.warnings.length,
          pass_rate: passRate,
        },
        results: validationResults,
      },
      null,
      2
    )
  );

  console.log(`\n✓ Validation report exported to ${reportFile}`);

  if (validationResults.failed.length === 0) {
    console.log("\n🎉 All data integrity validations passed!");
  } else {
    console.log("\n⚠️ Some validations failed. Please review the report above.");
    process.exit(1);
  }
}

/**
 * Run all validations
 */
async function runValidations() {
  let client;

  try {
    // Connect to MongoDB
    console.log("Connecting to MongoDB...");
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log(`Connected to database: ${DATABASE_NAME}\n`);

    const db = client.db(DATABASE_NAME);

    console.log("=".repeat(60));
    console.log("DATA INTEGRITY AND RELATIONSHIP VALIDATION");
    console.log("=".repeat(60));

    // Run all validation suites
    await validateUniqueConstraints(db);
    await validateReferentialIntegrity(db);
    await validateDataConsistency(db);
    await validateRequiredFields(db);
    await validateDataTypes(db);
    await validateBusinessRules(db);
    await validateModelingDecisions(db);

    // Generate summary report
    generateReport();
  } catch (error) {
    console.error("\nError during validation:", error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log("\nDisconnected from MongoDB");
    }
  }
}

// Run validations
if (require.main === module) {
  console.log("Lab 02 - Data Integrity Validator");
  console.log("=".repeat(60));
  runValidations().catch(console.error);
}

module.exports = { runValidations };
