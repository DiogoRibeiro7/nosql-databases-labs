/**
 * Lab 02 - Practical Modeling Scenarios
 *
 * This file contains practical examples demonstrating different modeling patterns
 * in MongoDB for various e-commerce scenarios. Each example shows when to use
 * embedding vs referencing and explains the trade-offs.
 */

// ============================================================================
// SCENARIO 1: EMBEDDING VS REFERENCING - Customer and Orders
// ============================================================================

// Option A: Embedding (NOT RECOMMENDED for orders - unbounded growth)
const customerWithEmbeddedOrders_BAD = {
  _id: "CUST_EMBED_001",
  customer_id: "CUST_EMBED_001",
  name: "Alice Johnson",
  email: "alice@example.com",
  // BAD: Orders array can grow unbounded over time
  orders: [
    {
      order_id: "ORD001",
      order_date: new Date("2024-01-15"),
      total_amount: 299.99,
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
  address: {
    // GOOD: Address is embedded (1:1 relationship, always accessed together)
    street: "123 Main St",
    city: "Springfield",
    state: "IL",
    zip: "62701",
    country: "USA",
  },
  // Store only frequently accessed order summary
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
  customer_id: "CUST_REF_001", // Reference to customer
  customer_name: "Alice Johnson", // Denormalized for display
  order_date: new Date("2024-01-15"),
  status: "delivered",
  shipping_address: {
    // Copy of address at time of order (historical accuracy)
    street: "123 Main St",
    city: "Springfield",
    state: "IL",
    zip: "62701",
  },
  items: [
    // Items are embedded (bounded, always accessed together)
    {
      product_id: "PROD001",
      product_name: "Wireless Headphones XYZ", // Denormalized
      unit_price: 199.99, // Price at time of purchase
      quantity: 1,
      subtotal: 199.99,
    },
  ],
  total_amount: 299.99,
};

// ============================================================================
// SCENARIO 2: PRODUCT CATALOG WITH VARIATIONS
// ============================================================================

// Pattern 1: Attribute Pattern for Product Variations
const productWithAttributes = {
  _id: "PROD_ATTR_001",
  product_id: "PROD_ATTR_001",
  name: "Classic T-Shirt",
  base_price: 19.99,
  category: "Clothing",
  // Flexible attributes using Attribute Pattern
  attributes: [
    { name: "color", values: ["Red", "Blue", "Green", "Black", "White"] },
    { name: "size", values: ["S", "M", "L", "XL", "XXL"] },
    { name: "material", values: ["Cotton", "Polyester Blend"] },
  ],
  // Stock per variation
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
  // Subset Pattern: Keep only recent/top reviews embedded
  recent_reviews: [
    {
      review_id: "REV001",
      customer_name: "John D.",
      rating: 5,
      comment: "Excellent coffee maker!",
      created_at: new Date("2024-01-18"),
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
  product_id: "PROD_SUB_001",
  product_name: "Premium Coffee Maker", // Denormalized
  customer_id: "CUST001",
  customer_name: "John Doe",
  rating: 5,
  title: "Best coffee maker I've owned",
  comment:
    "This coffee maker produces excellent coffee consistently. The programmable features are intuitive and the thermal carafe keeps coffee hot for hours.",
  verified_purchase: true,
  created_at: new Date("2024-01-18"),
  updated_at: new Date("2024-01-18"),
  helpful_votes: 15,
  total_votes: 18,
  images: ["review_img_001.jpg", "review_img_002.jpg"],
};

// ============================================================================
// SCENARIO 3: SHOPPING CART PATTERNS
// ============================================================================

// Pattern 1: TTL-based Cart (Temporary)
const shoppingCart = {
  _id: "CART_001",
  session_id: "SESSION_XYZ123",
  customer_id: "CUST001", // null for guest users
  created_at: new Date("2024-01-20T10:00:00Z"),
  expires_at: new Date("2024-01-20T12:00:00Z"), // TTL index on this field
  items: [
    {
      product_id: "PROD001",
      product_name: "Wireless Headphones",
      unit_price: 199.99,
      quantity: 1,
      image_url: "prod001_thumb.jpg",
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
  subtotal: 799.97,
  estimated_tax: 64.0,
  estimated_shipping: 0, // Free shipping over $100
  estimated_total: 863.97,
  applied_coupons: ["SAVE10"],
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

// Pattern 1: Bucketing Pattern for Inventory Tracking
const inventoryBucket = {
  _id: "INV_BUCKET_202401",
  product_id: "PROD001",
  bucket_date: "2024-01", // Year-Month bucket
  transactions: [
    {
      timestamp: new Date("2024-01-01T09:00:00Z"),
      type: "restock",
      quantity: 100,
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
  opening_balance: 50,
  closing_balance: 149,
  total_sales: 45,
  total_restocks: 150,
  total_returns: 6,
};

// ============================================================================
// SCENARIO 5: CUSTOMER ACTIVITY AND ANALYTICS
// ============================================================================

// Pattern 1: Pre-aggregated Analytics
const customerAnalytics = {
  _id: "ANALYTICS_CUST001_202401",
  customer_id: "CUST001",
  period: "2024-01",
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
  calculated_scores: {
    lifetime_value: 5678.9,
    churn_risk: 0.15, // 15% risk
    engagement_score: 78,
    loyalty_tier: "Gold",
  },
};

// ============================================================================
// SCENARIO 6: HIERARCHICAL DATA (CATEGORIES)
// ============================================================================

// Pattern 1: Materialized Path for Category Hierarchy
const categoryWithPath = {
  _id: "CAT_ELECTRONICS_AUDIO_HEADPHONES",
  category_id: "CAT_HEADPHONES",
  name: "Headphones",
  path: "Electronics,Audio,Headphones",
  parent_id: "CAT_AUDIO",
  ancestors: ["CAT_ELECTRONICS", "CAT_AUDIO"],
  level: 2,
  is_leaf: true,
  attributes: {
    display_name: "Headphones & Earbuds",
    description: "Premium audio headphones and earbuds",
    image: "cat_headphones.jpg",
    seo_keywords: ["headphones", "earbuds", "audio", "wireless headphones"],
    product_count: 45,
  },
};

// ============================================================================
// SCENARIO 7: MULTI-TENANT PATTERN
// ============================================================================

// Pattern 1: Tenant Isolation with Compound Indexes
const multiTenantOrder = {
  _id: "MT_ORD_001",
  tenant_id: "TENANT_ABC", // Always included in queries
  order_id: "ORD_001",
  customer_id: "CUST_001",
  // Rest of order data...
  order_date: new Date("2024-01-20"),
  total_amount: 299.99,
  // Compound index on (tenant_id, order_id) for efficient queries
};

// ============================================================================
// HELPER FUNCTIONS FOR DATA GENERATION
// ============================================================================

/**
 * Generate sample data for testing
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
 * Demonstrate query patterns for each scenario
 */
const queryExamples = {
  // Get customer with recent orders
  customerOrders: {
    description: "Get customer and their recent orders (2 queries with referencing)",
    queries: [
      "db.customers.findOne({ customer_id: 'CUST_REF_001' })",
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
    description: "Find all products in a category and its subcategories",
    query: `db.products.find({
      category_path: { $regex: '^Electronics,Audio' }
    })`,
  },

  // Multi-tenant query
  tenantOrder: {
    description: "All queries include tenant_id for data isolation",
    query: `db.orders.find({
      tenant_id: 'TENANT_ABC',
      customer_id: 'CUST_001'
    })`,
  },
};

// Export for use in tests
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
