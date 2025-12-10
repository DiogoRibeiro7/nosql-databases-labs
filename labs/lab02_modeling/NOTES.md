---
>-
  This lab focuses on designing a data model for an e-commerce application using
  MongoDB's document-oriented approach. The model balances performance,
  scalability, and data integrity by strategically using embedding, referencing,
  and denormalization.
---

# Lab 02 - Data Modeling Notes

## Student Information

- **Lab**: Lab 02 - Data Modeling in NoSQL
- **Scenario**: E-Commerce Application (Option A)
- **Database**: `lab02_ecommerce`
- **Target System**: MongoDB

## 2\. Files in This Lab

```
labs/lab02_modeling/
├── README.md             # Lab instructions
├── model.md              # Complete data model design and justification
├── queries.md            # Sample queries for required operations (documentation)
├── queries.js            # Executable queries demonstrating the model
├── import_data.js        # Script to import sample data
├── reset_database.js     # Script to reset the database
├── test_queries.js       # Test script to validate queries
├── setup_database.sh     # Unix/Linux/Mac setup script
├── setup_database.bat    # Windows setup script
├── NOTES.md              # This file
├── starter/
│   └── data/
│       ├── customers.json # Sample customer documents
│       ├── products.json  # Sample product documents
│       ├── orders.json    # Sample order documents
│       └── reviews.json   # Sample review documents
└── solution/
    ├── model.md          # Complete model solution
    └── queries.md        # Complete queries solution
```

--------------------------------------------------------------------------------

## 3\. How to Set Up and Use This Model

### 3.1\. Automated Setup (Recommended)

```bash
# For Unix/Linux/Mac:
./setup_database.sh

# For Windows:
setup_database.bat

# Or using Node.js directly:
node import_data.js
```

### 3.2\. Manual Import (Alternative)

```bash
# Create/switch to database
mongosh
use lab02_ecommerce

# Import collections manually
mongoimport --db lab02_ecommerce --collection customers \
  --file labs/lab02_modeling/starter/data/customers.json --jsonArray

mongoimport --db lab02_ecommerce --collection products \
  --file labs/lab02_modeling/starter/data/products.json --jsonArray

mongoimport --db lab02_ecommerce --collection orders \
  --file labs/lab02_modeling/starter/data/orders.json --jsonArray

mongoimport --db lab02_ecommerce --collection reviews \
  --file labs/lab02_modeling/starter/data/reviews.json --jsonArray
```

### 3.3\. Create Indexes

After importing data, create the necessary indexes:

```javascript
use lab02_ecommerce

// Customers collection
db.customers.createIndex({ customer_id: 1 }, { unique: true });
db.customers.createIndex({ email: 1 }, { unique: true });

// Products collection
db.products.createIndex({ product_id: 1 }, { unique: true });
db.products.createIndex({ category: 1 });
db.products.createIndex({ price: 1 });
db.products.createIndex({ category: 1, price: 1 });
db.products.createIndex({ name: "text", description: "text" });

// Orders collection
db.orders.createIndex({ order_id: 1 }, { unique: true });
db.orders.createIndex({ customer_id: 1 });
db.orders.createIndex({ order_date: -1 });
db.orders.createIndex({ customer_id: 1, order_date: -1 });
db.orders.createIndex({ status: 1 });
db.orders.createIndex({ "items.product_id": 1 });

// Reviews collection
db.reviews.createIndex({ review_id: 1 }, { unique: true });
db.reviews.createIndex({ product_id: 1 });
db.reviews.createIndex({ customer_id: 1 });
db.reviews.createIndex({ product_id: 1, created_at: -1 });
db.reviews.createIndex({ rating: 1 });
```

### 3.4\. Verify Data Import

```javascript
// Check document counts
db.customers.countDocuments()  // Should return 3
db.products.countDocuments()   // Should return 4
db.orders.countDocuments()     // Should return 4
db.reviews.countDocuments()    // Should return 6

// View sample documents
db.customers.findOne()
db.products.findOne()
db.orders.findOne()
db.reviews.findOne()
```

--------------------------------------------------------------------------------

## 4\. Key Design Decisions

### 4.1\. Embedding vs Referencing

Relationship                   | Decision                        | Rationale
------------------------------ | ------------------------------- | -----------------------------------------------
**Customer → Address**         | Embed                           | Address always needed with customer, not shared
**Order → Order Items**        | Embed                           | Items never queried separately, atomic updates
**Order → Customer**           | Reference                       | Customer has many orders, avoid duplication
**Product → Reviews**          | Reference (separate collection) | Unbounded growth, prevent huge documents
**Order Items → Product Info** | Denormalize                     | Preserve historical prices at purchase time

### 4.2\. Why This Approach?

#### **Embedded Order Items**

```javascript
// ✅ GOOD: One query gets complete order
{
  "order_id": "ORD001",
  "items": [
    { "product_id": "PROD001", "quantity": 1, "unit_price": 199.99 }
  ]
}

// ❌ BAD: Would require $lookup or multiple queries
// orders: { "order_id": "ORD001" }
// order_items: { "order_id": "ORD001", "product_id": "PROD001" }
```

#### **Separate Reviews Collection**

```javascript
// ✅ GOOD: Reviews in separate collection
// products: 5KB per document
// reviews: 200+ reviews, separate collection

// ❌ BAD: Embedding all reviews
// products: 500KB per document (with 200 reviews)
// Would hit 16MB limit for popular products
```

#### **Denormalized Product Info in Orders**

```javascript
// ✅ GOOD: Order preserves historical data
{
  "items": [
    {
      "product_id": "PROD001",
      "product_name": "Wireless Headphones XYZ",  // Historical name
      "unit_price": 199.99                         // Historical price
    }
  ]
}

// Even if product is renamed or price changed later,
// order shows what customer actually bought
```

--------------------------------------------------------------------------------

## 5\. Query Patterns and Performance

### 5.1\. Required Operations Support

✅ **1\. Get customer's recent orders**

- **Collection**: `orders`
- **Index**: `{ customer_id: 1, order_date: -1 }`
- **Performance**: O(log N) - indexed query
- **Query**: `db.orders.find({ customer_id: "CUST001" }).sort({ order_date: -1 })`

✅ **2\. Get order with all items**

- **Collection**: `orders`
- **Index**: `{ order_id: 1 }`
- **Performance**: O(1) - single document read
- **Query**: `db.orders.findOne({ order_id: "ORD001" })`

✅ **3\. Top N products by sales**

- **Collection**: `orders`
- **Pipeline**: Unwind items → Group by product → Sort
- **Performance**: O(N) - aggregation pipeline
- **Query**: See `queries.md` section 3

✅ **4\. Search/filter products by category**

- **Collection**: `products`
- **Index**: `{ category: 1, price: 1 }` or text index
- **Performance**: O(log N) - indexed query
- **Query**: `db.products.find({ category: "Electronics" })`

### 5.2\. Performance Benchmarks (Estimated)

Operation           | Without Index | With Index | Improvement
------------------- | ------------- | ---------- | -------------------
Find by customer_id | 50ms          | 2ms        | 25x faster
Find by category    | 30ms          | 1ms        | 30x faster
Get order by ID     | 40ms          | 0.5ms      | 80x faster
Text search         | N/A           | 5ms        | Text index required

_Note: Times are estimates for ~100K documents. Actual times vary by hardware and dataset._

--------------------------------------------------------------------------------

## 6\. Assumptions and Constraints

### 6.1\. Assumptions

1. **Order History is Immutable**

  - Once an order is placed, item details don't change
  - Justifies denormalizing product info in orders

2. **Product Names and Prices Change Infrequently**

  - Reviews denormalize product names
  - If names change, historical reviews keep old name (acceptable)

3. **Reviews are Frequent but Bounded**

  - Popular products may have 1000s of reviews
  - Separate collection prevents document size issues

4. **Customers Have Multiple Addresses**

  - For simplicity, only one address is stored
  - In production, would have `addresses` array with `is_default` flag

5. **Orders Fit Within 16MB Limit**

  - Assuming max ~100 items per order
  - Each item ~200 bytes → 100 items = 20KB (safe)

### 6.2\. Constraints

- **MongoDB Document Size**: Max 16MB per document
- **Index Limit**: Max 64 indexes per collection (we're using ~5 per collection)
- **Nested Array Depth**: Avoid deeply nested arrays (we only go 1 level deep)

--------------------------------------------------------------------------------

## 7\. Issues Encountered and Solutions

### 7.1\. Issue: Stale Product Ratings

**Problem**: When new reviews are added, the `products.ratings` field becomes outdated.

**Solution**:

- Use a background job or scheduled task to recompute ratings
- Alternative: Use MongoDB triggers (Atlas) or change streams
- See `queries.md` section 5.3 for the update query

### 7.2\. Issue: Product Deletion with Existing Orders

**Problem**: If a product is deleted, orders still reference it via `items.product_id`.

**Solution**:

- Keep the `product_id` reference
- Application layer handles "Product no longer available"
- Historical order data remains intact
- Alternative: Soft delete products (add `is_deleted: true` flag)

### 7.3\. Issue: Duplicate Emails

**Problem**: During development, tried to insert customer with existing email.

**Solution**:

- Created unique index on `email` field
- MongoDB automatically rejects duplicates
- Application shows friendly error message

--------------------------------------------------------------------------------

## 8\. Scalability Considerations

### 8.1\. Horizontal Scaling (Sharding)

When data grows beyond a single server:

**Customers**: Shard by `customer_id`

- Even distribution
- Customer queries are efficient (single shard)

**Products**: Shard by `category` or `product_id`

- Category: Good if categories are balanced
- product_id: Better for even distribution

**Orders**: Shard by `customer_id`

- Keeps a customer's orders on same shard
- "My orders" queries are efficient

**Reviews**: Shard by `product_id`

- Keeps product reviews together
- "Product reviews" queries hit single shard

### 8.2\. Read Scaling

- **Replica Sets**: Add read replicas for read-heavy workloads
- **Caching**: Cache product catalog (changes infrequently)
- **CDN**: Cache product images and static content

### 8.3\. Write Scaling

- **Batch Writes**: Batch review inserts, rating updates
- **Async Processing**: Process order analytics asynchronously
- **Write Concerns**: Use `w: 1` for non-critical writes

--------------------------------------------------------------------------------

## 9\. Alternative Designs Considered

### 9.1\. Alternative 1: Embed Reviews in Products

```javascript
{
  "product_id": "PROD001",
  "reviews": [
    { "customer_id": "CUST001", "rating": 5, "comment": "..." },
    // ... 1000s of reviews
  ]
}
```

**Rejected because**:

- Document size grows unbounded
- Would hit 16MB limit for popular products
- Fetching product requires loading all reviews

--------------------------------------------------------------------------------

### 9.2\. Alternative 2: Separate Order Items Collection

```javascript
// orders collection
{ "order_id": "ORD001", "customer_id": "CUST001" }

// order_items collection
{ "order_id": "ORD001", "product_id": "PROD001", "quantity": 1 }
```

**Rejected because**:

- Requires `$lookup` (join) for every order display
- Two queries instead of one
- Order items are never queried independently

**When this would be better**:

- If analyzing order items across all orders frequently
- If order items have complex lifecycle (e.g., partial cancellations)

--------------------------------------------------------------------------------

## 10\. Testing the Model

### 10.1\. Sample Queries to Test

```bash
# Run executable queries
node queries.js

# Run test suite
node test_queries.js

# Or connect directly with mongosh
mongosh lab02_ecommerce
```

### 10.2\. Performance Testing

```javascript
// Enable profiling
db.setProfilingLevel(2)

// Run your queries
db.orders.find({ customer_id: "CUST001" }).explain("executionStats")

// Check slow queries
db.system.profile.find({ millis: { $gt: 100 } }).sort({ ts: -1 })
```

--------------------------------------------------------------------------------

## 11\. Future Enhancements

If continuing this project:

1. **Add Inventory Management**

  - Track stock levels in real-time
  - Prevent overselling

2. **Add Shopping Cart**

  - Embedded in customer document or separate collection
  - Consider TTL index for abandoned carts

3. **Add Promotions/Discounts**

  - Store applied discount in order items
  - Separate promotions collection

4. **Add Product Variants**

  - Size, color variants
  - Embed as array in products

5. **Add Order Status History**

  - Track status changes over time
  - Embed as array: `status_history: [{ status, timestamp }]`

--------------------------------------------------------------------------------

## 12\. References

- [MongoDB Data Modeling Introduction](https://docs.mongodb.com/manual/core/data-modeling-introduction/)
- [MongoDB Schema Design Patterns](https://www.mongodb.com/blog/post/building-with-patterns-a-summary)
- [Embedding vs Referencing](https://docs.mongodb.com/manual/core/data-model-design/)
- [6 Rules of Thumb for MongoDB Schema Design](https://www.mongodb.com/blog/post/6-rules-of-thumb-for-mongodb-schema-design-part-1)
- [MongoDB Performance Best Practices](https://docs.mongodb.com/manual/administration/analyzing-mongodb-performance/)

--------------------------------------------------------------------------------

## 13\. Conclusion

This data model demonstrates a pragmatic approach to NoSQL schema design:

✅ **Embedded** where it improves read performance (order items, addresses) ✅ **Referenced** where it prevents unbounded growth (reviews) ✅ **Denormalized** where it preserves history (product info in orders) ✅ **Indexed** based on query patterns (customer_id, product_id, category)

The design is optimized for the typical e-commerce workload:

- **Fast order retrieval** (single query)
- **Efficient product browsing** (indexed queries)
- **Scalable reviews** (separate collection)
- **Historical accuracy** (denormalized order data)
