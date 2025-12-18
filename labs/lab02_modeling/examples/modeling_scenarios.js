/**
 * Lab 02 - Practical Modeling Scenarios
 *
 * Goal
 * ----
 * This file is a “pattern catalog” for MongoDB data modeling in e-commerce.
 * It provides concrete document shapes (sample JSON-like docs) for common scenarios.
 *
 * What you should learn from this file
 * -----------------------------------
 * 1) Embedding vs Referencing:
 *    - Embed when the relationship is 1:1 or 1:few, and data is usually read together.
 *    - Reference when the relationship is 1:many (potentially unbounded), or when you need
 *      independent lifecycle, independent indexing, or separate query patterns.
 *
 * 2) Denormalization (controlled duplication):
 *    - MongoDB often benefits from duplicating “display fields” (like names) to avoid extra reads.
 *    - Trade-off: faster reads vs keeping duplicates consistent (you must define update strategy).
 *
 * 3) Bounded arrays and document growth:
 *    - Avoid embedding unbounded arrays (e.g., all customer orders forever).
 *    - Documents have a 16MB limit and large documents become slower to update/move.
 *
 * 4) Modeling for access patterns:
 *    - Model for the queries you will run most often, not for strict relational normalization.
 *    - Prefer “read-optimized” shapes for user-facing pages; use separate collections for
 *      large or write-heavy histories (orders, inventory transactions, full reviews, etc.).
 *
 * Notes
 * -----
 * - These objects are examples, not production code. They illustrate shapes, not validation.
 * - In production, add schema validation (MongoDB JSON schema / ODM), indexes, and tests.
 * - Dates use JavaScript Date objects as you would in Node / mongosh.
 */

// ============================================================================
// SCENARIO 1: EMBEDDING VS REFERENCING - Customer and Orders
// ============================================================================
//
// Typical access patterns:
// - Customer profile page: show customer + last N orders (not all orders).
// - Order detail page: show order + items + shipping details.
// - Back office: search orders by date/status/customer/tenant.
//
// Key rule:
// - Orders are 1:many, potentially unbounded => do NOT embed all orders into the customer doc.
// - Embed only small, stable, frequently accessed, bounded data (like address, preferences).
//

// Option A: Embedding (NOT RECOMMENDED for orders - unbounded growth)
const customerWithEmbeddedOrders_BAD = {
  _id: "CUST_EMBED_001",
  customer_id: "CUST_EMBED_001",

  // Customer identity fields
  name: "Alice Johnson",
  email: "alice@example.com",

  // BAD:
  // - The `orders` array grows forever.
  // - Document size increases over time and can hit MongoDB’s 16MB document limit.
  // - Updates become expensive because growing arrays can cause document moves on disk.
  // - Harder to index/query orders by status/date efficiently when nested in a huge doc.
  orders: [
    {
      order_id: "ORD001",
      order_date: new Date("2024-01-15"),
      total_amount: 299.99,

      // Embedding items is fine because items per order are usually bounded,
      // and they are always read with the order.
      items: [
        /* ... */
      ],
    },
    {
      order_id: "ORD002",
      order_date: new Date("2024-01-20"),
      total_amount: 149.99,
      items: [
        /* ... */
      ],
    },
    // This array could grow to thousands of orders!
  ],
};

// Option B: Referencing (RECOMMENDED for orders)
const customerWithReferencedOrders_GOOD = {
  _id: "CUST_REF_001",
  customer_id: "CUST_REF_001",
  name: "Alice Johnson",
  email: "alice@example.com",

  // GOOD: Embed address because it is a 1:1 relationship (typically one active address),
  // and is usually needed when rendering customer details.
  //
  // If you support multiple addresses + history, consider:
  // - embedding a bounded array (e.g., max 5 saved addresses)
  // - or a separate addresses collection if unbounded/history is large.
  address: {
    street: "123 Main St",
    city: "Springfield",
    state: "IL",
    zip: "62701",
    country: "USA",
  },

  // GOOD: Keep an order summary as a “read-optimized” embedded object.
  // This avoids counting orders every time you load the profile.
  //
  // Trade-off: you must update these aggregates when orders are created/updated.
  // Common approaches:
  // - update in the same request that creates the order
  // - or maintain asynchronously via events/streams (eventual consistency)
  order_summary: {
    total_orders: 42,
    total_spent: 5234.5,
    last_order_date: new Date("2024-01-20"),
    favorite_category: "Electronics",
  },
};

// Separate orders collection
const orderDocument = {
  _id: "ORD_001",
  order_id: "ORD_001",

  // Reference to customer: enables querying orders by customer_id quickly with an index.
  customer_id: "CUST_REF_001",

  // Denormalized “display” field:
  // - Saves an extra lookup when listing orders.
  // - Trade-off: if customer name changes, historical orders may keep old name (often OK).
  // - If you require strict consistency, do not denormalize or implement a backfill job.
  customer_name: "Alice Johnson",

  order_date: new Date("2024-01-15"),
  status: "delivered",

  // Copy of shipping address at the time of order:
  // - Important for historical accuracy (address can change later).
  // - Common e-commerce requirement (auditing, refunds, disputes).
  shipping_address: {
    street: "123 Main St",
    city: "Springfield",
    state: "IL",
    zip: "62701",
  },

  // Items embedded:
  // - Bounded by “reasonable max items per order”.
  // - Order is typically read with items as a single document read.
  items: [
    {
      product_id: "PROD001",

      // Denormalized product name:
      // - Captures what the customer saw at purchase time.
      // - Avoids joining to product catalog for historical invoices.
      product_name: "Wireless Headphones XYZ",

      // Price at time of purchase:
      // - Must be stored to prevent catalog price changes from affecting history.
      unit_price: 199.99,
      quantity: 1,
      subtotal: 199.99,
    },
  ],

  // Total computed at order time:
  // - Makes reads fast.
  // - Ensure server-side calculation to avoid client manipulation.
  total_amount: 299.99,

  // Index suggestions (production):
  // - db.orders.createIndex({ customer_id: 1, order_date: -1 })
  // - db.orders.createIndex({ order_id: 1 }, { unique: true })
  // - db.orders.createIndex({ status: 1, order_date: -1 })
};

// ============================================================================
// SCENARIO 2: PRODUCT CATALOG WITH VARIATIONS
// ============================================================================
//
// Typical access patterns:
// - Product page needs a single product with attributes + available variations.
// - Checkout needs SKU-specific price/stock.
// - Admin needs to update stock frequently.
//
// Key rule:
// - A product has many SKUs/variations, but usually bounded (dozens/hundreds, not millions).
// - Keep variations embedded if the set is reasonably sized and read together.
// - If variations become huge (marketplaces, complex catalogs), split variations into another
//   collection keyed by product_id.
//

// Pattern 1: Attribute Pattern for Product Variations
const productWithAttributes = {
  _id: "PROD_ATTR_001",
  product_id: "PROD_ATTR_001",
  name: "Classic T-Shirt",
  base_price: 19.99,
  category: "Clothing",

  // Attribute Pattern:
  // - Store flexible attributes without changing schema for each category.
  // - Helps when different categories have different attribute sets.
  //
  // Trade-off:
  // - You may need custom indexes or computed fields for fast attribute filtering at scale.
  // - For high-scale faceted search, consider a dedicated search engine (Atlas Search / ES).
  attributes: [
    { name: "color", values: ["Red", "Blue", "Green", "Black", "White"] },
    { name: "size", values: ["S", "M", "L", "XL", "XXL"] },
    { name: "material", values: ["Cotton", "Polyester Blend"] },
  ],

  // Variations embedded:
  // - Works well when product page needs variations and there aren’t too many.
  // - Each variation can have stock and price modifiers.
  //
  // Index considerations:
  // - If you query by sku often, you might want sku at top-level in a dedicated collection,
  //   or ensure sku uniqueness with application-level constraints.
  variations: [
    { sku: "TSH-RED-M", color: "Red", size: "M", stock: 25, price_modifier: 0 },
    { sku: "TSH-RED-L", color: "Red", size: "L", stock: 30, price_modifier: 0 },
    { sku: "TSH-BLU-M", color: "Blue", size: "M", stock: 20, price_modifier: 0 },
    { sku: "TSH-BLK-XL", color: "Black", size: "XL", stock: 15, price_modifier: 2 },
  ],
};

// Pattern 2: Subset Pattern for Product Reviews
const productWithSubsetReviews = {
  _id: "PROD_SUB_001",
  product_id: "PROD_SUB_001",
  name: "Premium Coffee Maker",
  price: 149.99,

  // Subset Pattern:
  // - Embed only a small subset of reviews (recent, most helpful, top-rated).
  // - This makes product page loads fast (one read).
  //
  // Trade-off:
  // - Not the full truth; it’s a curated subset. Full reviews live elsewhere.
  // - Needs maintenance logic (keep only N entries, replace as new reviews come in).
  recent_reviews: [
    {
      review_id: "REV001",
      customer_name: "John D.",
      rating: 5,
      comment: "Excellent coffee maker!",
      created_at: new Date("2024-01-18"),

      // “helpful_count” supports sorting for “top reviews”.
      helpful_count: 15,
    },
    {
      review_id: "REV002",
      customer_name: "Sarah M.",
      rating: 4,
      comment: "Good quality, fast brewing.",
      created_at: new Date("2024-01-17"),
      helpful_count: 8,
    },
    // Limited to 5 most recent reviews
  ],

  // Pre-aggregated summary:
  // - Avoids computing average rating from all reviews every time.
  // - Used for filtering/sorting in catalog lists.
  //
  // Trade-off: must be updated when a review is created/edited/deleted.
  review_summary: {
    average_rating: 4.3,
    total_reviews: 256,
    rating_distribution: {
      5: 120,
      4: 80,
      3: 30,
      2: 16,
      1: 10,
    },
  },
};

// Full reviews in separate collection
const reviewDocument = {
  _id: "REV_FULL_001",
  review_id: "REV_FULL_001",

  // Reference to product:
  // - Enables “all reviews for product” query with index on product_id + created_at.
  product_id: "PROD_SUB_001",

  // Denormalized product name:
  // - Useful for moderation/admin dashboards.
  // - Trade-off: can go stale if product renamed (usually acceptable).
  product_name: "Premium Coffee Maker",

  // Reference to customer:
  // - Useful to show reviewer profile, detect spam, enforce “one review per order”, etc.
  customer_id: "CUST001",
  customer_name: "John Doe",

  rating: 5,
  title: "Best coffee maker I've owned",
  comment:
    "This coffee maker produces excellent coffee consistently. The programmable features are intuitive and the thermal carafe keeps coffee hot for hours.",

  verified_purchase: true,
  created_at: new Date("2024-01-18"),
  updated_at: new Date("2024-01-18"),

  // Voting fields:
  // - Helpful votes can drive the subset selection logic in the product doc.
  helpful_votes: 15,
  total_votes: 18,

  // Media references:
  // - Usually stored in object storage (S3), with URLs/keys here.
  images: ["review_img_001.jpg", "review_img_002.jpg"],

  // Index suggestions (production):
  // - db.reviews.createIndex({ product_id: 1, created_at: -1 })
  // - db.reviews.createIndex({ customer_id: 1, created_at: -1 })
  // - db.reviews.createIndex({ review_id: 1 }, { unique: true })
};

// ============================================================================
// SCENARIO 3: SHOPPING CART PATTERNS
// ============================================================================
//
// Typical access patterns:
// - A cart is ephemeral (session-based), frequently updated, and can be abandoned.
// - You want automatic cleanup to keep the collection small.
//
// Key rule:
// - Use TTL-based expiration for guest carts and inactive carts.
// - Keep the cart as a single document per session/customer to enable atomic updates.
//

// Pattern 1: TTL-based Cart (Temporary)
const shoppingCart = {
  _id: "CART_001",

  // Session identifier:
  // - For guest carts, this is often the primary key.
  // - For logged-in users, you can use customer_id as the key (or both).
  session_id: "SESSION_XYZ123",

  // For guest users, customer_id might be null.
  // For logged-in users, you can merge session cart into customer cart on login.
  customer_id: "CUST001",

  created_at: new Date("2024-01-20T10:00:00Z"),

  // TTL index:
  // - Create a TTL index on expires_at to auto-delete carts after inactivity.
  // - Example: db.carts.createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 })
  expires_at: new Date("2024-01-20T12:00:00Z"),

  // Items embedded:
  // - Cart needs to be read as one thing.
  // - Usually bounded (practical limit for UX + performance).
  items: [
    {
      product_id: "PROD001",
      product_name: "Wireless Headphones",

      // Important:
      // - For carts, prices may change; you may want to re-price on checkout.
      // - Still useful to store last-seen price for display.
      unit_price: 199.99,
      quantity: 1,

      image_url: "prod001_thumb.jpg",

      // Selected options must be captured to map to SKU/variation.
      selected_options: {
        color: "Black",
      },
    },
    {
      product_id: "PROD002",
      product_name: "Smart Watch Pro",
      unit_price: 299.99,
      quantity: 2,
      image_url: "prod002_thumb.jpg",
      selected_options: {
        color: "Silver",
        band: "Sport",
      },
    },
  ],

  // Precomputed totals:
  // - Faster to render cart quickly.
  // - Still recompute on server to prevent manipulation.
  subtotal: 799.97,
  estimated_tax: 64.0,
  estimated_shipping: 0, // Example rule: Free shipping over $100
  estimated_total: 863.97,

  // Coupons embedded:
  // - Usually a small set.
  applied_coupons: ["SAVE10"],

  // “Saved for later” can be a separate array or separate collection.
  // If you allow large “saved for later”, consider a referenced collection.
  saved_for_later: [
    {
      product_id: "PROD003",
      product_name: "USB-C Cable",
      unit_price: 19.99,
      saved_date: new Date("2024-01-19"),
    },
  ],
};

// ============================================================================
// SCENARIO 4: INVENTORY MANAGEMENT PATTERNS
// ============================================================================
//
// Typical access patterns:
// - Need the current stock quickly (for checkout).
// - Need transaction history for audit/reporting.
// - Writes can be frequent (sales/restocks/returns).
//
// Key rule:
// - Don’t store unbounded transaction history in one document.
// - Use the Bucketing Pattern: group transactions into time buckets (e.g., monthly).
//

// Pattern 1: Bucketing Pattern for Inventory Tracking
const inventoryBucket = {
  _id: "INV_BUCKET_202401",

  // Partition key (common):
  // - bucket by product_id + period (or store_id + product_id + period if multi-warehouse).
  product_id: "PROD001",

  // Time bucket identifier:
  // - Use year-month for monthly buckets (or daily/weekly depending on volume).
  bucket_date: "2024-01",

  // Transactions embedded inside the bucket:
  // - Bounded by “transactions per bucket”.
  // - If a month still gets too many rows, bucket smaller (weekly/daily) or by count.
  transactions: [
    {
      timestamp: new Date("2024-01-01T09:00:00Z"),
      type: "restock",
      quantity: 100,

      // running_total is optional but useful:
      // - Allows quick reconstruction of balances without scanning all prior history.
      // - Must be maintained carefully on inserts (or computed in a pipeline).
      running_total: 150,
      reference: "PO_12345",
    },
    {
      timestamp: new Date("2024-01-02T14:30:00Z"),
      type: "sale",
      quantity: -2,
      running_total: 148,
      reference: "ORD_67890",
    },
    {
      timestamp: new Date("2024-01-03T11:15:00Z"),
      type: "return",
      quantity: 1,
      running_total: 149,
      reference: "RET_11111",
    },
    // Bucket holds all transactions for the month
  ],

  // Aggregates for quick monthly reporting:
  // - Useful for dashboards and month-end reconciliation.
  opening_balance: 50,
  closing_balance: 149,
  total_sales: 45,
  total_restocks: 150,
  total_returns: 6,

  // Index suggestions (production):
  // - db.inventory_buckets.createIndex({ product_id: 1, bucket_date: 1 }, { unique: true })
};

// ============================================================================
// SCENARIO 5: CUSTOMER ACTIVITY AND ANALYTICS
// ============================================================================
//
// Typical access patterns:
// - Dashboard loads “summary metrics” quickly (single query).
// - Analytics updates happen periodically (nightly batch or streaming updates).
//
// Key rule:
// - Pre-aggregate if you repeatedly compute the same metrics from raw events.
// - Keep raw events elsewhere (event stream / logs) if you need full fidelity.
//

// Pattern 1: Pre-aggregated Analytics
const customerAnalytics = {
  _id: "ANALYTICS_CUST001_202401",

  customer_id: "CUST001",

  // Aggregation period:
  // - Choose a period that matches your reporting (day/week/month).
  period: "2024-01",

  // Metrics grouped by domain:
  // - Organization is subjective; structure to support how you query and display.
  metrics: {
    orders: {
      count: 5,
      total_amount: 1234.5,
      average_amount: 246.9,
      categories_purchased: ["Electronics", "Clothing", "Books"],
      top_category: "Electronics",
    },
    products: {
      unique_count: 12,
      total_quantity: 18,
      most_purchased: {
        product_id: "PROD001",
        name: "Wireless Headphones",
        quantity: 3,
      },
    },
    behavior: {
      page_views: 145,
      session_count: 23,
      average_session_duration: 420, // seconds
      abandoned_carts: 2,
      wishlist_adds: 8,
      reviews_written: 3,
    },
    engagement: {
      email_opens: 12,
      email_clicks: 5,
      push_notifications_received: 20,
      push_notifications_clicked: 3,
    },
  },

  // Derived scores:
  // - Often used for segmentation and personalization.
  // - Define clearly how they are computed (model/rules) and how often updated.
  calculated_scores: {
    lifetime_value: 5678.9,
    churn_risk: 0.15, // 15% risk
    engagement_score: 78,
    loyalty_tier: "Gold",
  },

  // Index suggestions (production):
  // - db.analytics.createIndex({ customer_id: 1, period: 1 }, { unique: true })
};

// ============================================================================
// SCENARIO 6: HIERARCHICAL DATA (CATEGORIES)
// ============================================================================
//
// Typical access patterns:
// - Show breadcrumb (ancestors).
// - List all products in a category subtree (category + descendants).
//
// Key rule:
// - Materialized Path is simple and fast for subtree queries using prefix matching,
//   at the cost of path updates when moving nodes.
// - Alternatives include: Parent References, Array of Ancestors, Nested Sets.
//   Choose based on how often the tree changes vs how often you query subtrees.
//

// Pattern 1: Materialized Path for Category Hierarchy
const categoryWithPath = {
  _id: "CAT_ELECTRONICS_AUDIO_HEADPHONES",

  category_id: "CAT_HEADPHONES",
  name: "Headphones",

  // Materialized path:
  // - Simple string or array representation of hierarchy.
  // - Enables prefix queries: “Electronics,Audio” matches all descendants.
  //
  // Trade-off:
  // - Renaming/moving categories requires updating paths for all descendants.
  // - Use with caution if your tree structure changes frequently.
  path: "Electronics,Audio,Headphones",

  parent_id: "CAT_AUDIO",

  // Ancestors list:
  // - Useful for quick breadcrumb generation and access checks.
  ancestors: ["CAT_ELECTRONICS", "CAT_AUDIO"],

  // Depth level:
  // - Helpful for UI and constraints.
  level: 2,
  is_leaf: true,

  attributes: {
    display_name: "Headphones & Earbuds",
    description: "Premium audio headphones and earbuds",
    image: "cat_headphones.jpg",
    seo_keywords: ["headphones", "earbuds", "audio", "wireless headphones"],
    product_count: 45,
  },

  // Index suggestions (production):
  // - db.categories.createIndex({ parent_id: 1 })
  // - db.categories.createIndex({ path: 1 })  // or a prefix-friendly strategy
};

// ============================================================================
// SCENARIO 7: MULTI-TENANT PATTERN
// ============================================================================
//
// Typical access patterns:
// - Every query is scoped to a tenant (B2B SaaS).
// - Tenant isolation is a security and performance requirement.
//
// Key rule:
// - Include tenant_id in every document and every query.
// - Back it with compound indexes (tenant_id first).
// - Consider sharding by tenant_id for large systems.
//

// Pattern 1: Tenant Isolation with Compound Indexes
const multiTenantOrder = {
  _id: "MT_ORD_001",

  // Tenant identifier:
  // - MUST be part of the query filter for every tenant-scoped read/write.
  tenant_id: "TENANT_ABC",

  order_id: "ORD_001",
  customer_id: "CUST_001",

  // Rest of order data...
  order_date: new Date("2024-01-20"),
  total_amount: 299.99,

  // Index suggestions (production):
  // - db.orders.createIndex({ tenant_id: 1, order_id: 1 }, { unique: true })
  // - db.orders.createIndex({ tenant_id: 1, customer_id: 1, order_date: -1 })
};

// ============================================================================
// HELPER FUNCTIONS FOR DATA GENERATION
// ============================================================================

/**
 * Generate sample data for testing/demo purposes.
 *
 * Why this exists:
 * - You can import these shapes in unit tests or seed scripts.
 * - It keeps the “example documents” consistent across exercises.
 *
 * Important:
 * - This is not a random data generator; it returns fixed example docs.
 * - In production labs, you might replace this with faker-based generation.
 *
 * @returns {{
 *   embedding_examples: { good: object, bad: object },
 *   product_patterns: { attributes: object, subset_reviews: object },
 *   cart_pattern: object,
 *   inventory_bucketing: object,
 *   analytics: object,
 *   hierarchical_data: object,
 *   multi_tenant: object
 * }}
 */
function generateSampleData() {
  return {
    embedding_examples: {
      good: customerWithReferencedOrders_GOOD,
      bad: customerWithEmbeddedOrders_BAD,
    },
    product_patterns: {
      attributes: productWithAttributes,
      subset_reviews: productWithSubsetReviews,
    },
    cart_pattern: shoppingCart,
    inventory_bucketing: inventoryBucket,
    analytics: customerAnalytics,
    hierarchical_data: categoryWithPath,
    multi_tenant: multiTenantOrder,
  };
}

/**
 * Demonstrate query patterns for each scenario.
 *
 * Why this exists:
 * - Data modeling is inseparable from query patterns.
 * - Each entry here explains what you typically query and why the model supports it.
 *
 * Notes:
 * - These are strings meant for documentation or for execution in mongosh.
 * - In real apps, you’ll likely use the Node driver and build these as JS objects.
 */
const queryExamples = {
  // Get customer with recent orders
  customerOrders: {
    description:
      "Get customer and their recent orders (referencing: 1 query for customer + 1 query for orders)",
    queries: [
      // Customer profile base
      "db.customers.findOne({ customer_id: 'CUST_REF_001' })",

      // Recent orders for that customer (indexed by customer_id + order_date)
      "db.orders.find({ customer_id: 'CUST_REF_001' }).sort({ order_date: -1 }).limit(10)",
    ],
  },

  // Product variations query
  productVariations: {
    description: "Find available sizes for a product in a specific color",
    query: `db.products.aggregate([
      { $match: { product_id: 'PROD_ATTR_001' } },
      { $unwind: '$variations' },
      { $match: { 'variations.color': 'Red', 'variations.stock': { $gt: 0 } } },
      { $project: { size: '$variations.size', stock: '$variations.stock' } }
    ])`,
  },

  // Analytics query (pre-aggregated)
  customerMetrics: {
    description: "Get customer metrics for a period (single query with pre-aggregation)",
    query: "db.analytics.findOne({ customer_id: 'CUST001', period: '2024-01' })",
  },

  // Category hierarchy
  categoryTree: {
    description: "Find all products in a category subtree using a path prefix match",
    query: `db.products.find({
      category_path: { $regex: '^Electronics,Audio' }
    })`,
  },

  // Multi-tenant query
  tenantOrder: {
    description: "All queries include tenant_id for data isolation and index efficiency",
    query: `db.orders.find({
      tenant_id: 'TENANT_ABC',
      customer_id: 'CUST_001'
    })`,
  },
};

// Export for use in tests or other lab scripts
module.exports = {
  generateSampleData,
  queryExamples,
  patterns: {
    customerWithReferencedOrders_GOOD,
    customerWithEmbeddedOrders_BAD,
    orderDocument,
    productWithAttributes,
    productWithSubsetReviews,
    reviewDocument,
    shoppingCart,
    inventoryBucket,
    customerAnalytics,
    categoryWithPath,
    multiTenantOrder,
  },
};
