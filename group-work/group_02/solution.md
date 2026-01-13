# Group 02 - NoSQL Lab Submission

## Group Information

**Group Number:** group_02
**Submission Date:** 2026-01-13
**Lab Assignment:** Sakila MongoDB Transformation Lab
**Database:** sakila_mongodb

### Team Members

| Name | Student ID | Email | Contribution % |
| ---- | ---------- | ----- | -------------- |
| António Amorim | 40240119 | 40240119@esmad.ipp.pt | 40% |
| Gabriel Paiva | 40240137 | 40240137@esmad.ipp.pt | 40% |
| Emanuel Gomes | 40230432 | 40230432@esmad.ipp.pt | 20% |

**Total:** 100%

---

## Executive Summary

This project demonstrates the successful transformation of the Sakila DVD rental database from a normalized relational schema (16 tables) to an optimized MongoDB document model. The solution implements strategic denormalization with embedded documents for frequently accessed data (actors, categories, addresses) while maintaining referential integrity through hybrid embedding/referencing patterns.

**Key Achievements:**
- Transformed 1,000 films, 599 customers, and 16,044 rental transactions into 5 MongoDB collections
- Eliminated multi-table JOINs by embedding related entities, reducing query complexity
- Implemented 26 business-focused queries covering CRUD operations, aggregations, and analytics
- Created compound and text indexes to optimize search and aggregation performance
- Validated data quality with automated testing covering referential integrity and schema conformance

---

## Problem Statement

The Sakila relational database represents a DVD rental business requiring complex multi-table JOINs for common operations. The project goal is to redesign the data model using MongoDB to optimize read-heavy workloads while maintaining data consistency and enabling efficient analytics.

### Requirements

- [x] Transform 16 normalized tables into optimized MongoDB collections
- [x] Implement CRUD operations (insert, update, delete) with data validation
- [x] Create aggregation pipelines for business analytics (revenue, inventory, customer metrics)
- [x] Design indexes supporting primary access patterns (customer history, film search, revenue reports)
- [x] Validate data quality through automated testing scripts
- [x] Document schema decisions and modeling trade-offs

---

## Solution Architecture

### Data Model Design

The database comprises 5 collections optimized for DVD rental business operations:

**1. films** (1,000 documents)
```javascript
{
  film_id: 1,
  title: "ACADEMY DINOSAUR",
  category: { category_id: 6, name: "Documentary" },
  actors: [{ actor_id: 1, first_name: "PENELOPE", last_name: "GUINESS" }],
  language: { language_id: 1, name: "English" },
  rental_rate: NumberDecimal("0.99"),
  rating: "PG"
}
```

**2. customers** (599 documents)
```javascript
{
  customer_id: 1,
  first_name: "MARY",
  email: "MARY.SMITH@sakilacustomer.org",
  address: {
    address_line: "1913 Hanoi Way",
    city: { city_name: "Sasebo", country: "Japan" }
  },
  lifetime_rentals: 32,
  recent_rentals: [/* últimos 10 alugueres */]
}
```

**3. rentals** (16,044 documents)
```javascript
{
  rental_id: 1,
  customer: { customer_id: 130, full_name: "CHARLOTTE HUNTER" },
  film: { film_id: 80, title: "BLANKET BEVERLY", category: "Family" },
  payment: { amount: NumberDecimal("4.99"), payment_date: ISODate() },
  rental_date: ISODate()
}
```

**4. inventory** (4,581 documents)
```javascript
{
  inventory_id: 1,
  film_id: 1,
  store_id: 1,
  available: true
}
```

**5. stores** (2 documents)
```javascript
{
  store_id: 1,
  manager: { first_name: "Mike", last_name: "Hillyer" },
  address: { city: "Lethbridge", country: "Canada" }
}
```

### Design Decisions

1. **Embedded actors array in films** – Films typically have 3-8 actors; embedding eliminates film_actor bridge table lookups
2. **Embedded category in films** – Each film has one category; embedding avoids JOIN for catalog queries
3. **Embedded address hierarchy in customers** – Address changes are rare; embedding consolidates 3 tables into nested document
4. **Bounded recent_rentals array** – Limited to 10 items to prevent unbounded document growth; full history in rentals collection
5. **Hybrid approach in rentals** – Embeds customer/film summaries for analytics while preserving inventory_id reference for operational updates

### Trade-offs Considered

| Decision | Pros | Cons | Rationale |
| -------- | ---- | ---- | --------- |
| Embed actors in films | Eliminates JOIN, faster catalog search | Data duplication if actor changes name | Actors rarely change; read-heavy workload favors embedding |
| Embed payment in rentals | Single document for financial reports | Cannot query payments independently | Payments always 1:1 with rentals in Sakila |
| Reference inventory | Minimal document size, frequent updates | Requires lookup for availability check | Inventory status changes often; lean documents reduce write overhead |
| Bounded recent_rentals array | Dashboard queries in single read | Full history requires separate collection | Limits document growth while optimizing common use case |

---

## Implementation

### Setup Instructions

**Prerequisites:**
- MongoDB 7.0 or higher
- MongoDB Shell (mongosh)
- CSV/JSON source data in `project/data/` directory

**Database Setup:**
```bash
# Navigate to project directory
cd group-work/group_02/project

# Import data (creates collections and populates with denormalized data)
mongosh import_data.mongosh.js

# Create optimized indexes
mongosh queries/index_blueprint.mongosh.js

# Validate data quality
mongosh tests/data_quality.mongosh.js
```

**Run Queries:**
```bash
# Example: Top 10 customers by rentals
mongosh queries/01_top_renting_customers.mongosh.js

# Revenue by category
mongosh queries/02_revenue_by_film_category.mongosh.js
```

### Core Queries

**Total of 26 queries implemented:**
- Queries 01-16: Read and aggregation operations (business analysis)
- Queries 17-19: CRUD operations (insert, update, delete)
- Queries 20-26: Advanced analysis and optimization

#### Query 01 – Top 10 Customers by Number of Rentals

**Objective:** Identify most active customers for loyalty programs

```javascript
db.customers.aggregate([
  {
    $project: {
      customer_id: 1,
      full_name: { $concat: ["$first_name", " ", "$last_name"] },
      lifetime_rentals: 1,
      lifetime_value: 1
    }
  },
  { $sort: { lifetime_rentals: -1 } },
  { $limit: 10 }
])
```
**Index used:** `idx_customer_id_unique`

#### Query 02 – Total Revenue by Film Category

**Objective:** Financial performance analysis by film genre

```javascript
db.rentals.aggregate([
  {
    $group: {
      _id: "$film.category",
      total_rentals: { $sum: 1 },
      total_revenue: { $sum: "$payment.amount" },
      avg_revenue: { $avg: "$payment.amount" }
    }
  },
  { $sort: { total_revenue: -1 } }
])
```
**Index used:** `idx_store_category_analysis` (compound)

#### Query 15 – Full-Text Search in Films

**Objective:** Search films by title and description

```javascript
db.films.find(
  { $text: { $search: "scientist dinosaur" } },
  { title: 1, rating: 1, score: { $meta: "textScore" } }
).sort({ score: { $meta: "textScore" } })
```
**Index used:** `idx_film_text_search` (text index with weights)

#### Query 17 – Insert New Customer (CREATE)

```javascript
db.customers.insertOne({
  customer_id: 9999,
  first_name: "António",
  last_name: "Amorim",
  email: "40240119@esmad.ipp.pt",
  address: {
    city: { city_name: "Porto", country: "Portugal" }
  },
  lifetime_rentals: 0
})
```

#### Query 18 – Update Customer (UPDATE)

```javascript
db.customers.updateOne(
  { customer_id: 1 },
  {
    $set: { last_update: new Date() },
    $inc: { lifetime_rentals: 1 }
  }
)
```

---

## Testing

### Test Strategy

Implemented automated validation script (`tests/data_quality.mongosh.js`) that verifies:

1. **Document Counts** – Validates that all collections have expected number of records
2. **Referential Integrity** – Ensures references between collections are valid
3. **Schema Consistency** – Checks required fields and data types
4. **Embedding Quality** – Confirms embedded arrays have complete data

### Test Results

**Execution:** `mongosh tests/data_quality.mongosh.js`

| Test Case | Description | Expected | Actual | Status |
| --------- | ----------- | -------- | ------ | ------ |
| TC001 | Films collection count | 1000 docs | 1000 docs | ✅ |
| TC002 | Customers collection count | 599 docs | 599 docs | ✅ |
| TC003 | Rentals collection count | 16044 docs | 16044 docs | ✅ |
| TC004 | Inventory collection count | 4581 docs | 4581 docs | ✅ |
| TC005 | Stores collection count | 2 docs | 2 docs | ✅ |
| TC006 | Rentals reference valid customers | 0 invalid | 0 invalid | ✅ |
| TC007 | Rentals reference valid inventory | 0 invalid | 0 invalid | ✅ |
| TC008 | Films have embedded actors | All films | All films | ✅ |
| TC009 | Customers have embedded addresses | All customers | All customers | ✅ |

### Performance Testing

**Query 20** implements explain() for performance analysis:

```javascript
const explain = db.rentals.explain("executionStats").aggregate(pipeline);
print(`Execution time: ${explain.executionStats.executionTimeMillis}ms`);
print(`Documents examined: ${explain.executionStats.totalDocsExamined}`);
```

**Indexes created:** 15 indexes (5 unique, 10 compound/text) optimize primary queries

---

## Challenges and Solutions

### Challenge 1 – Controlled Denormalization

**Problem:** Deciding which entities to embed vs. reference without creating excessively large documents.
**Solution:** Access pattern analysis led to:
- Embed: actors (bounded array), category (1:1), addresses (rarely changes)
- Reference: inventory (high update frequency)
- Hybrid: rentals embed summaries but maintain inventory_id

### Challenge 2 – Unbounded Array Growth

**Problem:** `recent_rentals` array in customers could grow indefinitely.
**Solution:** Implement bounded array (maximum 10 items) for fast dashboard; complete history remains in `rentals` collection.

### Challenge 3 – Relational Data Migration

**Problem:** Transform 16 normalized tables into 5 collections with embedded data.
**Solution:** `import_data.mongosh.js` script uses JavaScript Maps to build in-memory lookups and embeds data during single iteration over source data.

### Challenge 4 – Integrity Validation without Foreign Keys

**Problem:** MongoDB does not support foreign keys natively.
**Solution:** `data_quality.mongosh.js` script validates cross-references after import, ensuring all referenced IDs exist.

---

## Learning Outcomes

1. **NoSQL Data Modeling:** Understanding trade-offs between embedding and referencing based on real access patterns
2. **Strategic Denormalization:** Transformation of normalized schema (3NF) into document model optimized for reads
3. **Aggregation Pipelines:** Implementation of complex analysis with `$group`, `$lookup`, `$unwind` for business KPIs
4. **Indexing:** Creation of compound and text indexes aligned with primary queries
5. **Data Migration:** Development of scripts to transform relational data into MongoDB documents
6. **Quality Assurance:** Implementation of automated tests to validate integrity and consistency

### Skills Developed

- [x] Relational to NoSQL schema transformation
- [x] MongoDB queries (find, aggregation, updates)
- [x] Compound indexes and text search optimization
- [x] Script development with mongosh
- [x] Data quality validation and testing
- [x] Trade-off analysis (embedding vs. referencing)
- [x] Performance analysis with explain()

---

## Future Improvements

1. **Schema Validation:** Implement JSON Schema validators to ensure type conformance and required fields
2. **Cascade Updates:** Develop triggers or application logic to update denormalized data when source changes (e.g., film title)
3. **Archive Strategy:** Move old rentals to separate collection to improve query performance on recent data
4. **Sharding:** Prepare for horizontal scaling with shard key `{ store_id: 1, customer_id: 1 }` as multiple stores grow
5. **Monitoring:** Add profiling and slow query logging to identify non-optimized queries
6. **Read Replicas:** Configure replica set to separate reporting workloads from transactional application

---

## References

1. MongoDB Documentation – Schema Design Patterns (https://www.mongodb.com/docs/manual/data-modeling/)
2. MongoDB Documentation – Aggregation Pipeline (https://www.mongodb.com/docs/manual/aggregation/)
3. MongoDB Documentation – Indexes (https://www.mongodb.com/docs/manual/indexes/)
4. Sakila Sample Database (MySQL) – Original relational schema
5. Course materials – NoSQL Databases Labs (ESMAD)

---

## Appendix

### A. Complete Code Listings

**Import & Setup:**
- `project/import_data.mongosh.js` – Main import and transformation script
- `project/queries/index_blueprint.mongosh.js` – Creation of 15 optimized indexes
- `project/tests/data_quality.mongosh.js` – Automated validation

**Query Files (26 queries):**
- Queries 01-16: Analysis and aggregations
- Queries 17-19: CRUD operations
- Queries 20-26: Performance and statistics

**Data Sources:**
- `project/data/*.json` – 16 JSON source files (actor, film, rental, etc.)

### B. Data Samples

See [architecture.md](architecture.md) for complete document examples from each collection.

**Collection Sizes:**
- films: 1,000 documents
- customers: 599 documents
- rentals: 16,044 documents
- inventory: 4,581 documents
- stores: 2 documents

### C. Additional Documentation

- [architecture.md](architecture.md) – Modeling decisions and detailed schema
- [readme.md](readme.md) – Project overview and instructions

---

## Declaration

We declare that this work is our own and that all sources used have been properly cited.

**Signatures:**

- António Amorim (40240119)
- Gabriel Paiva
- Emanuel Gomes

_Validation date: 2026-01-13_
_Version: 1.1.0_
_Database: sakila_mongodb_
_Total queries: 26_
