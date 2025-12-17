# MongoDB Modeling Patterns for Different Database Types

## Database Comparison Table

| Database | Domain | Size | Best For Teaching | Key Challenge |
|----------|--------|------|-------------------|---------------|
| **Sakila** | DVD Rental | 16 tables, ~50MB | Basic denormalization | Film ↔ Actor many-to-many |
| **Northwind** | E-commerce | 13 tables, ~1MB | Order processing patterns | Orders → OrderDetails → Products |
| **Chinook** | Music Store | 11 tables, ~1MB | Hierarchical data | Artist → Album → Track hierarchy |
| **AdventureWorks** | Manufacturing | 70+ tables, ~200MB | Complex enterprise | Multiple business domains |
| **IMDb** | Entertainment | 7 datasets, ~6GB | Big data patterns | Massive scale (millions of movies) |
| **Airbnb** | Real Estate | Single table, ~100MB | Geospatial queries | Location-based searches |
| **Stack Overflow** | Q&A Platform | 8 tables, 50GB+ | Social patterns | Votes, tags, badges system |
| **NYC Taxi** | Transportation | Time-series, ~100GB/year | IoT/Time-series | Billions of events |

## MongoDB Modeling Patterns by Use Case

### 1. **E-Commerce Pattern** (Northwind, AdventureWorks)

```javascript
// Pattern: Order with embedded line items but referenced products
{
  order_id: 10248,
  customer: { /* embedded customer snapshot */ },
  order_date: ISODate("2024-01-15"),
  items: [
    {
      product_id: 17,  // Reference
      product_name: "Alice Mutton",  // Denormalized for performance
      unit_price: 39.00,
      quantity: 2,
      discount: 0.1
    }
  ],
  total: 70.20,
  shipping_address: { /* embedded */ }
}
```

**Teaching Points:**
- Hybrid embedding (snapshot + reference)
- Shopping cart as document
- Price history problem

### 2. **Hierarchical Data Pattern** (Chinook, IMDb)

```javascript
// Pattern A: Embedded Tree (good for read-heavy)
{
  artist_id: 1,
  name: "The Beatles",
  albums: [
    {
      title: "Abbey Road",
      year: 1969,
      tracks: [
        { name: "Come Together", duration: 259 },
        { name: "Something", duration: 183 }
      ]
    }
  ]
}

// Pattern B: Materialized Paths (good for deep trees)
{
  category_id: "electronics/computers/laptops",
  name: "Laptops",
  parent: "electronics/computers",
  ancestors: ["electronics", "electronics/computers"]
}
```

**Teaching Points:**
- Tree storage patterns
- Query efficiency vs update complexity
- When to use graph databases instead

### 3. **Geospatial Pattern** (Airbnb, NYC Taxi)

```javascript
// GeoJSON format with 2dsphere index
{
  listing_id: 12345,
  name: "Downtown Apartment",
  location: {
    type: "Point",
    coordinates: [-8.61308, 41.14053]  // [lng, lat]
  },
  price_per_night: 80
}

// Geospatial queries
db.listings.find({
  location: {
    $near: {
      $geometry: { type: "Point", coordinates: [-8.61, 41.14] },
      $maxDistance: 1000  // meters
    }
  }
})
```

**Teaching Points:**
- GeoJSON standards
- Spatial indexes (2dsphere vs 2d)
- Proximity searches vs polygon queries

### 4. **Time-Series Pattern** (NYC Taxi, IoT sensors)

```javascript
// Pattern: Bucketed time-series
{
  sensor_id: "sensor_001",
  bucket_hour: ISODate("2024-01-15T14:00:00Z"),
  measurements: [
    { timestamp: ISODate("2024-01-15T14:00:05Z"), temp: 22.5, humidity: 45 },
    { timestamp: ISODate("2024-01-15T14:00:10Z"), temp: 22.6, humidity: 44 },
    // ... up to 720 measurements per hour (every 5 seconds)
  ],
  metadata: {
    location: "Building A, Floor 3",
    measurement_count: 720,
    avg_temp: 22.4,
    max_temp: 23.1,
    min_temp: 21.9
  }
}
```

**Teaching Points:**
- Bucket pattern for time-series
- Pre-aggregation strategies
- MongoDB 5.0+ time-series collections

### 5. **Social Network Pattern** (Stack Overflow)

```javascript
// Pattern: Hybrid - embedded for small arrays, references for large
{
  user_id: 12345,
  username: "developer123",
  reputation: 5432,
  // Small array - embed
  badges: [
    { name: "gold", count: 3 },
    { name: "silver", count: 15 }
  ],
  // Large array - reference with count
  question_count: 234,
  answer_count: 567,
  // Recent activity - limited embedding
  recent_questions: [
    { id: 9999, title: "How to...", date: ISODate(), votes: 5 }
  ].slice(-10)  // Keep only last 10
}
```

**Teaching Points:**
- Bounded vs unbounded relationships
- Activity feeds pattern
- Follower/following models

### 6. **Catalog Pattern** (IMDb, Product catalogs)

```javascript
// Polymorphic schema with discriminator field
{
  _id: ObjectId(),
  type: "movie",  // Discriminator
  title: "Inception",
  year: 2010,
  runtime: 148,
  
  // Type-specific fields
  director: "Christopher Nolan",
  cast: [...],
  
  // Flexible attributes
  attributes: {
    "box_office": "$836.8M",
    "budget": "$160M",
    "filming_locations": ["London", "Paris", "Tokyo"]
  }
}
```

**Teaching Points:**
- Polymorphic schemas
- Attribute pattern for flexibility
- Schema versioning

## Transformation Strategies

### Strategy 1: Query-Driven Design
1. List all queries needed
2. Design documents to answer queries efficiently
3. Add indexes for query patterns

### Strategy 2: Entity-First Design
1. Identify core business entities
2. Determine relationship cardinalities
3. Apply embedding rules:
   - 1:1 → Embed
   - 1:Few → Embed
   - 1:Many → Reference
   - 1:Squillions → Reference + Bucketing

### Strategy 3: Hybrid Approach
1. Start with entities
2. Denormalize for read performance
3. Keep references for consistency-critical data

## Common Anti-Patterns to Avoid

### ❌ Anti-Pattern 1: Unbounded Arrays
```javascript
// BAD - comments array grows infinitely
{
  post_id: 1,
  title: "My Blog Post",
  comments: [/* could be millions */]
}
```

### ✅ Solution: Bucket Pattern
```javascript
// GOOD - bucket comments by time/count
{
  post_id: 1,
  bucket: "2024-01-page-1",
  comments: [/* max 100 comments */],
  comment_count: 100,
  next_bucket: "2024-01-page-2"
}
```

### ❌ Anti-Pattern 2: Massive Duplication
```javascript
// BAD - full product details in every order item
{
  order_id: 1,
  items: [
    {
      product: {/* entire 10KB product document */}
    }
  ]
}
```

### ✅ Solution: Subset Pattern
```javascript
// GOOD - only what's needed
{
  order_id: 1,
  items: [
    {
      product_id: 123,
      product_name: "Widget",  // Only display fields
      price_at_purchase: 29.99  // Historical data
    }
  ]
}
```

## Performance Benchmarks

| Pattern | Write Speed | Read Speed | Storage | Update Complexity |
|---------|------------|------------|---------|------------------|
| Fully Normalized | Fast | Slow (joins) | Minimal | Simple |
| Fully Denormalized | Slow | Very Fast | High | Complex |
| Hybrid Embedding | Medium | Fast | Medium | Medium |
| Bucketing | Fast | Fast | Low | Simple |
| Materialized Paths | Medium | Very Fast | Low | Complex |

## Recommended Learning Path

1. **Week 1**: Sakila → Basic denormalization
2. **Week 2**: Northwind → E-commerce patterns
3. **Week 3**: Chinook → Hierarchical data
4. **Week 4**: Airbnb → Geospatial queries
5. **Week 5**: NYC Taxi → Time-series data
6. **Week 6**: Stack Overflow → Social patterns
7. **Week 7**: Combined project using multiple patterns

## Quick Setup Commands

```bash
# Download all databases
python download_sample_databases.py --databases all

# Import to MongoDB
mongoimport --db course --collection movies --file imdb/movies.json --jsonArray
mongoimport --db course --collection listings --file airbnb/listings.json --jsonArray

# Create indexes
mongo course --eval "db.listings.createIndex({'location': '2dsphere'})"
mongo course --eval "db.movies.createIndex({'title': 'text'})"
```

## Evaluation Criteria for Student Projects

1. **Correct Pattern Selection** (30%)
   - Appropriate for use case
   - Justified with access patterns

2. **Implementation Quality** (25%)
   - Proper embedding vs referencing
   - Index strategy

3. **Query Performance** (20%)
   - Efficient aggregations
   - Proper use of indexes

4. **Scalability Considerations** (15%)
   - Document size limits
   - Update patterns

5. **Documentation** (10%)
   - Schema explanation
   - Trade-off analysis
