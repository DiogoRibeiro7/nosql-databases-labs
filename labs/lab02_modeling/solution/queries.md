# Lab 02 - Sample Queries for E-Commerce Data Model

This document contains sample queries demonstrating how the data model supports required operations.

--------------------------------------------------------------------------------

## 1\. Given a Customer, List Their Recent Orders

**Requirement**: Retrieve all orders for a specific customer, sorted by date (most recent first).

### Query (MongoDB Shell)

```javascript
db.orders.find(
  { customer_id: "CUST001" }
).sort({ order_date: -1 }).pretty();
```

### Query (Aggregation Pipeline)

```javascript
db.orders.aggregate([
  {
    $match: { customer_id: "CUST001" }
  },
  {
    $sort: { order_date: -1 }
  },
  {
    $project: {
      order_id: 1,
      order_date: 1,
      status: 1,
      total: 1,
      items: 1
    }
  }
]);
```

### How the Model Supports This

- **Collection**: `orders`
- **Index Used**: Compound index on `(customer_id, order_date)` for optimal performance
- **Efficiency**: Single query retrieves all order data including embedded items
- **No Joins Needed**: Order items are embedded, so no `$lookup` required

### Expected Result

```json
[
  {
    "order_id": "ORD003",
    "customer_id": "CUST001",
    "order_date": "2024-02-10T10:30:00Z",
    "status": "delivered",
    "total": 89.99,
    "items": [...]
  },
  {
    "order_id": "ORD001",
    "customer_id": "CUST001",
    "order_date": "2024-01-15T14:30:00Z",
    "status": "shipped",
    "total": 262.84,
    "items": [...]
  }
]
```

--------------------------------------------------------------------------------

## 2\. Given an Order, Show All Its Items

**Requirement**: Retrieve a complete order with all line items.

### Query

```javascript
db.orders.findOne({ order_id: "ORD001" });
```

### With Projection (Only Relevant Fields)

```javascript
db.orders.findOne(
  { order_id: "ORD001" },
  {
    order_id: 1,
    customer_id: 1,
    order_date: 1,
    status: 1,
    items: 1,
    total: 1,
    _id: 0
  }
);
```

### How the Model Supports This

- **Collection**: `orders`
- **Index Used**: Unique index on `order_id`
- **Efficiency**: **Single document read** - all items are embedded
- **Atomic Operation**: All items retrieved in one atomic operation

### Expected Result

```json
{
  "order_id": "ORD001",
  "customer_id": "CUST001",
  "order_date": "2024-01-15T14:30:00Z",
  "status": "shipped",
  "items": [
    {
      "product_id": "PROD001",
      "product_name": "Wireless Headphones XYZ",
      "quantity": 1,
      "unit_price": 199.99,
      "subtotal": 199.99
    },
    {
      "product_id": "PROD042",
      "product_name": "Phone Case",
      "quantity": 2,
      "unit_price": 15.99,
      "subtotal": 31.98
    }
  ],
  "total": 262.84
}
```

--------------------------------------------------------------------------------

## 3\. List Top N Products by Total Quantity Sold

**Requirement**: Find the best-selling products based on quantity sold.

### Query (Aggregation Pipeline)

```javascript
db.orders.aggregate([
  // Unwind items array to process each item separately
  { $unwind: "$items" },

  // Group by product and sum quantities
  {
    $group: {
      _id: "$items.product_id",
      product_name: { $first: "$items.product_name" },
      total_quantity_sold: { $sum: "$items.quantity" },
      total_revenue: { $sum: "$items.subtotal" },
      order_count: { $sum: 1 }
    }
  },

  // Sort by total quantity (descending)
  { $sort: { total_quantity_sold: -1 } },

  // Limit to top N (e.g., top 10)
  { $limit: 10 },

  // Reshape output
  {
    $project: {
      _id: 0,
      product_id: "$_id",
      product_name: 1,
      total_quantity_sold: 1,
      total_revenue: { $round: ["$total_revenue", 2] },
      order_count: 1
    }
  }
]);
```

### Alternative: Top Products by Revenue

```javascript
db.orders.aggregate([
  { $unwind: "$items" },
  {
    $group: {
      _id: "$items.product_id",
      product_name: { $first: "$items.product_name" },
      total_revenue: { $sum: "$items.subtotal" },
      total_quantity_sold: { $sum: "$items.quantity" }
    }
  },
  { $sort: { total_revenue: -1 } },
  { $limit: 10 }
]);
```

### How the Model Supports This

- **Collection**: `orders`
- **Index Used**: Index on `items.product_id` helps with grouping
- **Efficiency**:

  - `$unwind` expands the items array
  - `$group` aggregates across all orders
  - Denormalized product names avoid extra lookups

- **Trade-off**: Aggregation pipeline is more expensive than simple queries, but no joins needed

### Expected Result

```json
[
  {
    "product_id": "PROD001",
    "product_name": "Wireless Headphones XYZ",
    "total_quantity_sold": 523,
    "total_revenue": 104577.00,
    "order_count": 523
  },
  {
    "product_id": "PROD042",
    "product_name": "Phone Case",
    "total_quantity_sold": 1247,
    "total_revenue": 19943.53,
    "order_count": 891
  },
  ...
]
```

--------------------------------------------------------------------------------

## 4\. Search or Filter Products by Category/Tag

**Requirement**: Browse products by category with optional price filtering.

### Query: All Products in a Category

```javascript
db.products.find(
  { category: "Electronics" }
).sort({ name: 1 });
```

### Query: Products in Category with Price Range

```javascript
db.products.find({
  category: "Electronics",
  price: { $gte: 50, $lte: 300 }
}).sort({ price: 1 });
```

### Query: Products in Category, Sorted by Rating

```javascript
db.products.find(
  { category: "Electronics" }
).sort({ "ratings.average": -1, "ratings.count": -1 }).limit(20);
```

### Query: Full-Text Search Within Category

```javascript
db.products.find(
  {
    $text: { $search: "wireless noise cancelling" },
    category: "Electronics"
  },
  {
    score: { $meta: "textScore" }
  }
).sort({ score: { $meta: "textScore" } });
```

### Query: Aggregation with Faceted Search

```javascript
db.products.aggregate([
  // Match category
  { $match: { category: "Electronics" } },

  // Create facets for filtering
  {
    $facet: {
      // Price ranges
      priceRanges: [
        {
          $bucket: {
            groupBy: "$price",
            boundaries: [0, 50, 100, 200, 500, 1000],
            default: "1000+",
            output: {
              count: { $sum: 1 }
            }
          }
        }
      ],

      // Rating distribution
      ratingDistribution: [
        {
          $bucket: {
            groupBy: "$ratings.average",
            boundaries: [0, 1, 2, 3, 4, 5],
            default: "unrated",
            output: {
              count: { $sum: 1 }
            }
          }
        }
      ],

      // Products
      products: [
        { $sort: { "ratings.average": -1 } },
        { $limit: 20 },
        {
          $project: {
            product_id: 1,
            name: 1,
            price: 1,
            ratings: 1,
            images: { $arrayElemAt: ["$images", 0] }
          }
        }
      ]
    }
  }
]);
```

### How the Model Supports This

- **Collection**: `products`
- **Indexes Used**:

  - Single index on `category`
  - Compound index on `(category, price)` for filtered queries
  - Text index on `(name, description)` for search

- **Efficiency**:

  - Category browsing is a simple indexed query
  - Price filtering uses compound index
  - Text search provides relevance scoring
  - Faceted search gives counts for filters in one query

### Expected Result (Simple Query)

```json
[
  {
    "product_id": "PROD001",
    "name": "Wireless Headphones XYZ",
    "category": "Electronics",
    "price": 199.99,
    "ratings": {
      "average": 4.5,
      "count": 128
    }
  },
  {
    "product_id": "PROD023",
    "name": "Smart Watch Pro",
    "category": "Electronics",
    "price": 299.99,
    "ratings": {
      "average": 4.7,
      "count": 89
    }
  },
  ...
]
```

--------------------------------------------------------------------------------

## 5\. Additional Queries

### 5.1\. Get Product Details with Recent Reviews

```javascript
// Step 1: Get product
const product = db.products.findOne({ product_id: "PROD001" });

// Step 2: Get recent reviews for this product
const reviews = db.reviews.find(
  { product_id: "PROD001" }
).sort({ created_at: -1 }).limit(10).toArray();

// Combine in application code or use $lookup:
db.products.aggregate([
  { $match: { product_id: "PROD001" } },
  {
    $lookup: {
      from: "reviews",
      let: { prod_id: "$product_id" },
      pipeline: [
        { $match: { $expr: { $eq: ["$product_id", "$$prod_id"] } } },
        { $sort: { created_at: -1 } },
        { $limit: 10 }
      ],
      as: "recent_reviews"
    }
  }
]);
```

**Note**: While `$lookup` works, it's less efficient than separate queries. Consider:

- Caching product data
- Loading reviews separately in application layer
- Embedding a "reviews summary" in products (e.g., recent 5 reviews)

--------------------------------------------------------------------------------

### 5.2\. Customer Order History with Total Spending

```javascript
db.orders.aggregate([
  { $match: { customer_id: "CUST001" } },
  {
    $group: {
      _id: "$customer_id",
      total_orders: { $sum: 1 },
      total_spent: { $sum: "$total" },
      average_order_value: { $avg: "$total" },
      first_order: { $min: "$order_date" },
      last_order: { $max: "$order_date" }
    }
  }
]);
```

--------------------------------------------------------------------------------

### 5.3\. Update Product Rating After New Review

```javascript
// After inserting a new review, recalculate product rating:
db.reviews.aggregate([
  { $match: { product_id: "PROD001" } },
  {
    $group: {
      _id: "$product_id",
      avg_rating: { $avg: "$rating" },
      review_count: { $sum: 1 }
    }
  }
]).forEach(result => {
  db.products.updateOne(
    { product_id: result._id },
    {
      $set: {
        "ratings.average": Math.round(result.avg_rating * 10) / 10,
        "ratings.count": result.review_count
      }
    }
  );
});
```

**Best Practice**: Run this as a background job or trigger after review inserts.

--------------------------------------------------------------------------------

### 5.4\. Find All Orders Containing a Specific Product

```javascript
db.orders.find(
  { "items.product_id": "PROD001" }
).sort({ order_date: -1 });
```

**Index Needed**: `db.orders.createIndex({ "items.product_id": 1 })`

--------------------------------------------------------------------------------

### 5.5\. Products Low in Stock

```javascript
db.products.find(
  { stock_quantity: { $lt: 10 } }
).sort({ stock_quantity: 1 });
```

--------------------------------------------------------------------------------

## 6\. Query Performance Summary

Operation           | Collections           | Indexes Used              | Performance
------------------- | --------------------- | ------------------------- | ----------------------------------
Get customer orders | `orders`              | `customer_id, order_date` | ⚡ Fast (single indexed query)
Get order details   | `orders`              | `order_id`                | ⚡ Fast (single document read)
Top products        | `orders`              | `items.product_id`        | 🔶 Moderate (aggregation pipeline)
Browse by category  | `products`            | `category`                | ⚡ Fast (indexed query)
Product + reviews   | `products`, `reviews` | Multiple                  | 🔶 Moderate ($lookup or 2 queries)
Text search         | `products`            | Text index                | ⚡ Fast (text index)

**Legend**:

- ⚡ Fast: < 10ms for typical datasets
- 🔶 Moderate: 10-100ms, may need optimization for large datasets
- 🔴 Slow: > 100ms, requires optimization

--------------------------------------------------------------------------------

## 7\. Conclusion

This data model efficiently supports all required operations:

1. ✅ **Customer orders**: Fast retrieval with compound index
2. ✅ **Order items**: Embedded for single-query access
3. ✅ **Top products**: Aggregation with denormalized data avoids joins
4. ✅ **Category browsing**: Indexed queries with faceted search support

The model balances:

- **Read performance**: Denormalization and embedding
- **Data integrity**: References where needed
- **Scalability**: Separate collections for reviews, shard-friendly design
- **Flexibility**: NoSQL schema flexibility for product specifications
