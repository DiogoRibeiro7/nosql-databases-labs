# Architecture & Data Modeling

## Domain Analysis

### Business Context

Sakila represents a DVD rental business with physical stores managing inventory, customer relationships, and rental transactions. The system must support:

1. **Inventory Management:** Track film availability across multiple store locations
2. **Customer Service:** Retrieve customer rental history and payment records
3. **Financial Reporting:** Aggregate revenue by film category, store, and time period
4. **Catalog Discovery:** Enable efficient film search by title, actor, category, or rating

### Original Relational Model

The Sakila relational schema comprises 16 normalized tables with complex relationships requiring multiple JOINs for common queries:
- Customer rental history requires joining 5+ tables
- Film search with actors requires bridging through film_actor table
- Revenue analysis spans multiple normalized entities

## MongoDB Collections Design

### Core Collections

| Collection | Primary Key | Notes |
|------------|-------------|-------|
| `films` | `film_id` (int) | Catalog with embedded category and actors array |
| `customers` | `customer_id` (int) | Includes embedded address and recent rental summary |
| `rentals` | `rental_id` (int) | Fact table with embedded payment and film/customer references |
| `inventory` | `inventory_id` (int) | Minimal schema for availability tracking |
| `stores` | `store_id` (int) | Reference data with embedded manager details |

### Schema Definitions

#### 1. Films Collection (Enriched Catalog)

```javascript
{
  _id: ObjectId("..."),
  film_id: 1,
  title: "ACADEMY DINOSAUR",
  description: "A Epic Drama of a Feminist And a Mad Scientist...",
  release_year: 2006,
  language: {
    language_id: 1,
    name: "English"
  },
  rental_duration: 6,
  rental_rate: NumberDecimal("0.99"),
  length: 86,
  replacement_cost: NumberDecimal("20.99"),
  rating: "PG",
  special_features: ["Deleted Scenes", "Behind the Scenes"],
  
  // Embedded category (denormalized from film_category)
  category: {
    category_id: 6,
    name: "Documentary"
  },
  
  // Embedded actors array (denormalized from film_actor + actor)
  actors: [
    { actor_id: 1, first_name: "PENELOPE", last_name: "GUINESS" },
    { actor_id: 10, first_name: "CHRISTIAN", last_name: "GABLE" },
    { actor_id: 20, first_name: "LUCILLE", last_name: "TRACY" }
  ],
  
  last_update: ISODate("2006-02-15T05:03:42Z")
}
```

**Modeling Rationale:**
- **Embedded language** (1:1): Languages rarely change, embedding eliminates lookup
- **Embedded category** (N:1): Each film has exactly one category; embedding avoids JOIN
- **Embedded actors array** (N:M): Typical films have 3-8 actors; array embedding faster than film_actor bridge table lookups
- **Array fields:** `special_features` stored as array for flexible querying

#### 2. Customers Collection (Relationship Hub)

```javascript
{
  _id: ObjectId("..."),
  customer_id: 1,
  store_id: 1,
  first_name: "MARY",
  last_name: "SMITH",
  email: "MARY.SMITH@sakilacustomer.org",
  
  // Embedded address (denormalized from address + city + country)
  address: {
    address_id: 5,
    address_line: "1913 Hanoi Way",
    district: "Nagasaki",
    postal_code: "35200",
    phone: "28303384290",
    city: {
      city_id: 463,
      city_name: "Sasebo",
      country: "Japan"
    }
  },
  
  active: true,
  create_date: ISODate("2006-02-14T22:04:36Z"),
  
  // Embedded rental summary (last 10 rentals for dashboard performance)
  recent_rentals: [
    {
      rental_id: 76,
      rental_date: ISODate("2005-05-25T11:30:37Z"),
      film_title: "BAKED CLEOPATRA",
      return_date: ISODate("2005-05-28T07:32:37Z"),
      amount: NumberDecimal("3.99")
    }
    // ... up to 10 most recent
  ],
  
  // Customer metrics (calculated fields)
  lifetime_rentals: 32,
  lifetime_value: NumberDecimal("128.68"),
  
  last_update: ISODate("2006-02-15T04:57:20Z")
}
```

**Modeling Rationale:**
- **Embedded address hierarchy** (3 table denormalization): Address changes are rare; embedding reduces 3 lookups to 0
- **Embedded recent_rentals** (bounded array): Dashboard "last rentals" query becomes single-document read
  - **Bounded to 10 items** to prevent unbounded document growth
  - Full rental history maintained in `rentals` collection
- **Pre-calculated metrics:** `lifetime_value` updated via aggregation pipelines; trades write complexity for read performance

#### 3. Rentals Collection (Transactional Facts)

```javascript
{
  _id: ObjectId("..."),
  rental_id: 1,
  rental_date: ISODate("2005-05-24T22:53:30Z"),
  
  // Reference to inventory (maintains FK integrity)
  inventory_id: 367,
  
  // Embedded customer summary (for reporting without JOIN)
  customer: {
    customer_id: 130,
    full_name: "CHARLOTTE HUNTER",
    email: "CHARLOTTE.HUNTER@sakilacustomer.org"
  },
  
  // Embedded film summary (denormalized for analytics)
  film: {
    film_id: 80,
    title: "BLANKET BEVERLY",
    category: "Family",
    rental_rate: NumberDecimal("4.99")
  },
  
  // Embedded store info
  store_id: 1,
  staff_id: 1,
  
  return_date: ISODate("2005-05-26T22:04:30Z"),
  
  // Embedded payment (1:1 relationship)
  payment: {
    payment_id: 1,
    amount: NumberDecimal("4.99"),
    payment_date: ISODate("2005-05-25T11:30:37Z")
  },
  
  // Calculated field
  rental_duration_days: 2,
  is_overdue: false,
  
  last_update: ISODate("2006-02-15T21:30:53Z")
}
```

**Modeling Rationale:**
- **Hybrid approach:** Maintains `inventory_id` reference for FK integrity while embedding summary data
- **Embedded customer/film summaries:** Revenue reports no longer require JOINs
- **Embedded payment:** Payments always 1:1 with rentals in Sakila; embedding simplifies financial queries
- **Calculated fields:** `rental_duration_days` and `is_overdue` pre-computed during import

#### 4. Inventory Collection (Store Assets)

```javascript
{
  _id: ObjectId("..."),
  inventory_id: 1,
  film_id: 1,
  store_id: 1,
  
  // Availability tracking
  available: true,
  current_rental_id: null, // or rental_id if rented
  
  last_update: ISODate("2006-02-15T05:09:17Z")
}
```

**Modeling Rationale:**
- **Minimal denormalization:** Inventory frequently updated; keeping lean reduces write overhead
- **Availability flag:** Pre-computed for instant "in-stock" queries without scanning rentals
- **Reference-based:** Links to `films` collection; film metadata changes don't cascade

#### 5. Stores Collection (Operational Hubs)

```javascript
{
  _id: ObjectId("..."),
  store_id: 1,
  
  // Embedded manager staff
  manager: {
    staff_id: 1,
    first_name: "Mike",
    last_name: "Hillyer",
    email: "Mike.Hillyer@sakilastaff.com",
    active: true
  },
  
  // Embedded address
  address: {
    address_line: "47 MySakila Drive",
    district: "Alberta",
    city: "Lethbridge",
    country: "Canada",
    postal_code: "",
    phone: "14033335568"
  },
  
  // Store metrics
  total_inventory: 2270,
  total_customers: 326,
  
  last_update: ISODate("2006-02-15T04:57:12Z")
}
```

**Modeling Rationale:**
- **Embedded staff:** Only 2 stores; manager data embedded for operational simplicity
- **Embedded address:** Store relocations are rare events
- **Aggregate metrics:** Pre-calculated counts speed up admin dashboards

## Relationships & Access Patterns

### Relationship Mapping

| Relationship | Relational Approach | MongoDB Approach | Justification |
|--------------|---------------------|------------------|---------------|
| Film → Category | N:1 via `film_category` | Embedded subdocument | Read-heavy; category changes rare |
| Film → Actor | N:M via `film_actor` | Embedded array | Typical actor count per film: 5-10 |
| Customer → Address | N:1 via FK | Embedded hierarchy | Address updates infrequent |
| Rental → Payment | 1:1 via FK | Embedded subdocument | Always retrieved together |
| Rental → Inventory | N:1 via FK | Reference (FK preserved) | Inventory status frequently changes |

### Query Access Patterns

#### Pattern 1: Film Catalog Search
```javascript
// Original SQL: 3 JOINs (film, film_category, category)
db.films.find({ 
  "category.name": "Action", 
  rental_rate: { $lte: NumberDecimal("2.99") } 
})
```

#### Pattern 2: Customer Rental History
```javascript
// Original SQL: 5 JOINs (customer, rental, inventory, film, payment)
db.customers.findOne({ customer_id: 130 }, { recent_rentals: 1 })
// or full history:
db.rentals.find({ "customer.customer_id": 130 }).sort({ rental_date: -1 })
```

#### Pattern 3: Revenue by Category
```javascript
// Original SQL: 6 JOINs + GROUP BY
db.rentals.aggregate([
  { $group: { 
      _id: "$film.category", 
      total_revenue: { $sum: "$payment.amount" } 
  }},
  { $sort: { total_revenue: -1 } }
])
```

## Denormalization Trade-offs

### Benefits
- Eliminates multiple JOINs for common queries (rental history, film search, revenue reports)
- Reduces query complexity for dashboard operations
- Embedded data allows single-document reads for frequent access patterns

### Challenges
- Data duplication requires update coordination (film title changes must cascade to rentals)
- Document size management via bounded arrays (recent_rentals limited to 10 items)
- Application logic handles consistency for denormalized fields

## Index Strategy

### Compound Indexes

```javascript
// Customer rental history
db.rentals.createIndex({ "customer.customer_id": 1, rental_date: -1 })

// Film inventory availability by store
db.inventory.createIndex({ film_id: 1, store_id: 1, available: 1 })

// Revenue aggregation by category and time
db.rentals.createIndex({ "film.category": 1, "payment.payment_date": 1 })
```

### Text Indexes

```javascript
// Film catalog search
db.films.createIndex({ 
  title: "text", 
  description: "text" 
}, { 
  weights: { title: 10, description: 1 },
  name: "film_search_index" 
})
```

Indexes are provisioned via migration scripts to support primary access patterns.

## Schema Validation

```javascript
db.createCollection("films", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["film_id", "title", "category", "actors"],
      properties: {
        film_id: { bsonType: "int", minimum: 1 },
        title: { bsonType: "string", maxLength: 255 },
        rental_rate: { bsonType: "decimal" },
        actors: { 
          bsonType: "array",
          minItems: 1,
          items: {
            bsonType: "object",
            required: ["actor_id", "first_name", "last_name"]
          }
        }
      }
    }
  }
})
```

## Scalability Considerations

### Potential Optimizations
- Sharding by `store_id` for multi-location growth
- Archive old rentals to separate collection for historical analysis
- Consider read replicas for reporting workloads

## Conclusion

The MongoDB schema transformation reduces query complexity through strategic denormalization while preserving referential integrity for critical relationships. The hybrid embedding/referencing approach balances read performance (customer dashboards) with write simplicity (inventory updates) and data consistency (financial transactions).

Embedding frequently accessed data (actors, categories, addresses) eliminates JOINs for common operations while maintaining normalized inventory tracking for operational requirements.
