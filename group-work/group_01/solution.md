# Group 01 - NoSQL Lab Submission

## Group Information

**Group Number:** group_01
**Submission Date:** 2026-01-22
**Lab Assignment:** MongoDB Database Operations Lab

---

## Executive Summary

This project implements a comprehensive **Flight Management System** using MongoDB, demonstrating advanced NoSQL database design patterns, query optimization, and analytical capabilities for real-world airline operations. The system tracks airline operations, flight schedules, and passenger reservations while providing business intelligence through complex aggregation pipelines.

### Key Achievements

- **6 Collections**: Designed and implemented a complete schema with reference data (airlines, airports, countries, users) and transactional data (flights, reservations)
- **20+ Queries**: Developed comprehensive CRUD operations, route analytics, revenue analysis, customer analytics, and operational intelligence queries
- **Performance Optimization**: Implemented strategic indexing strategy with 15+ indexes supporting all core query patterns
- **Real-World Application**: Built a production-ready system capable of handling airline operations, customer service, and business analytics

### Dataset Overview

The system uses a dataset consisting of:
- **Reference Data**: 58 airlines, 465 airports, 195 countries, and user accounts
- **Transactional Data**: 10,025 flights and 534,197 reservations
- **Relationships**: Reference-based relationships using IATA codes and ObjectIds for efficient queries

For detailed documentation, see [`project/README.md`](project/README.md) and [`project/architecture.md`](project/architecture.md).

---

## Problem Statement

The Flight Management System addresses the need for a comprehensive database solution to support airline operations, customer service, and business intelligence. The system must handle high-volume transactional data (flights and reservations) while providing efficient access to reference data (airlines, airports, countries, users).

### Business Goals

1. **Operational Management**: Track flight schedules, capacity, and status updates in real-time
2. **Customer Service**: Manage reservations, user accounts, and customer inquiries efficiently
3. **Business Analytics**: Analyze revenue, route popularity, customer lifetime value, and operational efficiency
4. **Strategic Planning**: Identify underperforming routes, optimize pricing, and understand customer behavior patterns

### Constraints and Design Decisions

- **High-Volume Transactions**: Flights and reservations represent high-frequency operations requiring optimized query performance
- **Reference Data Stability**: Airlines, airports, and countries are relatively stable, enabling reference-based relationships
- **Query Patterns**: System must support route-based queries, reservation lookups, revenue analytics, capacity management, and customer analytics
- **Scalability**: Design must support growth in flight and reservation volumes without performance degradation

### Requirements

- [x] Requirement 1 – define the workload and data domain: Flight management domain with 6 collections covering reference and transactional data
- [x] Requirement 2 – outline CRUD/aggregation capabilities: 20+ queries covering CRUD operations, complex aggregations, and business intelligence
- [x] Requirement 3 – capture validation, indexing, or performance goals: Comprehensive indexing strategy with 15+ indexes, performance analysis documented in `project/performance.md`
- [x] Requirement 4 – document stretch objectives agreed with the staff: Advanced analytics including customer lifetime value, cancellation analysis, and route performance metrics

---

## Solution Architecture

### Data Model Design

The system consists of six collections organized into reference data and transactional data:

#### Reference Data Collections

**airlines**
```javascript
{
  _id: ObjectId,
  airlineIata: "NI",              // Unique IATA code (indexed)
  name: "1Time Airline",
  country: "ZA"
}
```

**airports**
```javascript
{
  _id: ObjectId,
  airportIdent: "KSYR",           // Unique airport identifier (indexed)
  name: "Syracuse Hancock International Airport",
  continent: "NA",
  country: "US",
  municipality: "Syracuse"
}
```

**countries**
```javascript
{
  _id: ObjectId,
  code: "US",                     // Country code
  name: "United States"
}
```

**users**
```javascript
{
  _id: ObjectId,
  email: "john.smith@example.com", // Unique email (indexed)
  firstName: "John",
  lastName: "Smith",
  passwordHash: "$2b$10$..."
}
```

#### Transactional Data Collections

**flights**
```javascript
{
  _id: ObjectId,
  flightNumber: "NI5666",          // Unique flight identifier (indexed)
  airlineIata: "NI",               // Reference to airlines.airlineIata
  departureAirportIdent: "KSYR",   // Reference to airports.airportIdent
  arrivalAirportIdent: "MMHO",     // Reference to airports.airportIdent
  departureTime: ISODate("2024-02-25T05:29:55Z"),
  arrivalTime: ISODate("2024-02-25T10:30:55Z"),
  maxCapacity: 197,
  status: "completed",              // completed, scheduled, cancelled, delayed
  price: 175.42
}
```

**reservations**
```javascript
{
  _id: ObjectId,
  flightNumber: "VD9531",          // Reference to flights.flightNumber
  userId: ObjectId("..."),         // Reference to users._id
  seatNumber: "61F",
  status: "confirmed",             // confirmed, pending, cancelled
  reservationDate: ISODate("2025-01-15T10:30:00Z")
}
```

### Entity Boundaries and Relationships

- **Reference-based relationships**: Flights reference airlines and airports via IATA/ident codes rather than embedding, allowing efficient updates without touching flight documents
- **Reservations reference flights by flightNumber**: Using string identifiers provides human-readable queries and easier data import
- **Reservations reference users by ObjectId**: Ensures strong referential integrity and efficient lookups
- **Separate collections for reference data**: Minimizes duplication and supports independent updates

For comprehensive schema documentation, see [`project/architecture.md`](project/architecture.md).

### Design Decisions

1. **Document modeling** – Documents were structured to optimize for common query patterns:
   - Flights contain all operational data (route, timing, capacity, pricing) in a single document for fast route-based queries
   - Reservations reference flights and users via identifiers, avoiding document bloat
   - Reference data (airlines, airports) kept separate to minimize duplication and enable efficient updates

2. **Indexing strategy** – Comprehensive indexing supports all core workloads:
   - **Reference data indexes**: Unique indexes on `airlineIata`, `airportIdent`, and `email` ensure data integrity
   - **Flight indexes**: Compound index on `{departureAirportIdent, arrivalAirportIdent, departureTime}` supports route and date queries
   - **Reservation indexes**: Indexes on `userId`, `flightNumber`, and compound `{flightNumber, status}` support user lookups and capacity calculations
   - See [`project/queries/index_blueprint.mongosh.js`](project/queries/index_blueprint.mongosh.js) for complete index definitions

3. **Validation & governance** – Unique indexes enforce referential integrity:
   - Unique constraints on `airlineIata`, `airportIdent`, and `email` prevent duplicate reference data
   - Sparse indexes allow null values where appropriate
   - No explicit schema validation rules, relying on application-level validation and unique constraints

### Trade-offs Considered

| Approach | Pros | Cons | Decision |
| -------- | ---- | ---- | -------- |
| Embedding airline/airport data in flights | Fast reads, single document queries | Larger documents, data duplication, difficult updates | **Rejected** – Reference-based approach selected for efficient updates |
| Referencing airlines/airports via IATA codes | Normalized data, smaller docs, easy updates | Requires `$lookup` for full details | **Selected** – Optimal for high-volume flight data |
| Embedding reservations in flights | Single document access | Document size growth, write contention | **Rejected** – Separate collection allows independent scaling |
| Referencing flights in reservations | Normalized, scalable | Requires joins for flight details | **Selected** – Supports efficient user and flight queries |

---

## Implementation

### Setup Instructions

**Prerequisites:**
- MongoDB 7.0 or higher
- MongoDB Shell (mongosh) latest version
- 10GB free disk space for datasets

**Database Setup:**

```bash
cd group-work/group_01/project

# 1. Import data from JSON files
mongosh import_data.mongosh.js

# 2. Create indexes for optimal performance
mongosh queries/index_blueprint.mongosh.js

# 3. Run individual queries
mongosh queries/01_create_flight_reservation.mongosh.js
mongosh queries/13_total_revenue_by_airline.mongosh.js
```

**Connection Configuration:**

The scripts use the default MongoDB connection (`mongodb://127.0.0.1:27017`). To use a different URI:

```bash
export MONGODB_URI="mongodb://your-host:27017"
mongosh import_data.mongosh.js
```

**Database Name:** `group_01_flight_management_system_final`

For detailed setup instructions and troubleshooting, see [`project/README.md`](project/README.md).

### Core Queries

The system provides 20+ comprehensive queries. Below are representative examples:

#### Query 1 – Total Revenue by Airline (Analytics)

**Business Question:** Calculate total revenue generated by each airline from confirmed reservations.

```javascript
db.flights.aggregate([
  {
    $match: {
      airlineIata: "UA"
    }
  },
  {
    $lookup: {
      from: "reservations",
      localField: "flightNumber",
      foreignField: "flightNumber",
      as: "reservations"
    }
  },
  {
    $unwind: "$reservations"
  },
  {
    $match: {
      "reservations.status": "confirmed"
    }
  },
  {
    $group: {
      _id: "$airlineIata",
      totalRevenue: { $sum: "$price" }
    }
  }
]);
```

- **Expected Output:** Document with `_id` (airline IATA code) and `totalRevenue` (sum of all confirmed flight prices)
- **Performance Metrics:** Execution time: 1ms, Documents examined: 14, Index used: `airlineIata_1`
- **File:** [`queries/13_total_revenue_by_airline.mongosh.js`](project/queries/13_total_revenue_by_airline.mongosh.js)

#### Query 2 – Most Popular Routes (Analytics)

**Business Question:** Identify the top 10 most frequently booked flight routes.

```javascript
db.flights.aggregate([
  {
    $lookup: {
      from: "reservations",
      localField: "flightNumber",
      foreignField: "flightNumber",
      as: "reservations"
    }
  },
  {
    $unwind: "$reservations"
  },
  {
    $match: {
      "reservations.status": "confirmed"
    }
  },
  {
    $group: {
      _id: {
        departureAirportIdent: "$departureAirportIdent",
        arrivalAirportIdent: "$arrivalAirportIdent"
      },
      reservationsCount: { $sum: 1 }
    }
  },
  {
    $sort: { reservationsCount: -1 }
  },
  { $limit: 10 }
]);
```

- **Expected Output:** Array of documents with route identifiers and reservation counts, sorted by popularity
- **Performance Metrics:** Execution time: 398ms, Documents examined: 0 (collection scan), Returns: 10 routes
- **File:** [`queries/14_most_popular_routes.mongosh.js`](project/queries/14_most_popular_routes.mongosh.js)

#### Query 3 – Customer Lifetime Value (Analytics)

**Business Question:** Calculate total spending and reservation count per customer for loyalty program targeting.

```javascript
db.users.aggregate([
  {
    $lookup: {
      from: "reservations",
      localField: "_id",
      foreignField: "userId",
      as: "reservations"
    }
  },
  {
    $unwind: {
      path: "$reservations",
      preserveNullAndEmptyArrays: true
    }
  },
  {
    $match: {
      "reservations.status": "confirmed"
    }
  },
  {
    $lookup: {
      from: "flights",
      localField: "reservations.flightNumber",
      foreignField: "flightNumber",
      as: "flight"
    }
  },
  {
    $unwind: {
      path: "$flight",
      preserveNullAndEmptyArrays: true
    }
  },
  {
    $group: {
      _id: "$_id",
      fullName: { $first: { $concat: ["$firstName", " ", "$lastName"] } },
      email: { $first: "$email" },
      totalSpending: { $sum: "$flight.price" },
      reservationCount: { $sum: 1 }
    }
  },
  {
    $sort: { totalSpending: -1 }
  },
  { $limit: 20 }
]);
```

- **Expected Output:** Array of customer documents with `fullName`, `email`, `totalSpending`, and `reservationCount`, sorted by spending
- **Performance Metrics:** Execution time: 4,268ms (4.3s), Documents examined: 58, Returns: 20 customers
- **File:** [`queries/18_customer_lifetime_value.mongosh.js`](project/queries/18_customer_lifetime_value.mongosh.js)

#### Query 4 – Create Flight Reservation (CRUD)

**Business Question:** Create a new flight reservation for a user.

```javascript
db.reservations.insertOne({
  flightNumber: "UA1234",
  userId: ObjectId("..."),
  seatNumber: "12A",
  status: "confirmed",
  reservationDate: new Date()
});
```

- **Expected Output:** Insert result with `insertedId`
- **Performance Metrics:** Execution time: 10ms, Documents returned: 1
- **File:** [`queries/01_create_flight_reservation.mongosh.js`](project/queries/01_create_flight_reservation.mongosh.js)

#### Query 5 – Update User Email (CRUD)

**Business Question:** Update a user's email address.

```javascript
db.users.updateOne(
  { _id: ObjectId("...") },
  { $set: { email: "newemail@example.com" } }
);
```

- **Expected Output:** Update result with `modifiedCount: 1`
- **Performance Metrics:** Execution time: 1ms, Documents examined: 1, Index used: `_id_`
- **File:** [`queries/02_update_user_email.mongosh.js`](project/queries/02_update_user_email.mongosh.js)

**Complete Query List:** All 20 queries are documented in [`project/queries/`](project/queries/) directory.

---

## Testing

### Test Strategy

**Functional Testing:**
- Verified all 20 queries execute successfully and return expected results
- Validated data import script loads all collections correctly
- Confirmed index creation script applies all indexes without errors
- Tested CRUD operations (create, read, update, delete) on all collections

**Integration Testing:**
- Verified reference relationships (flights → airlines, flights → airports, reservations → flights, reservations → users)
- Tested aggregation pipelines with `$lookup` operations across collections
- Validated data consistency after import operations

**Performance Testing:**
- Analyzed query execution plans using `explain("executionStats")`
- Measured execution times for all queries
- Verified index usage and coverage
- Documented performance metrics in `project/performance.md`

### Test Results

| Test Case | Description | Expected | Actual | Status |
| --------- | ----------- | -------- | ------ | ------ |
| TC001 | Database connection & data import | All collections loaded | 6 collections with expected counts | ✅ |
| TC002 | Index creation | All indexes created | 15+ indexes applied successfully | ✅ |
| TC003 | Revenue aggregation query | Returns total revenue by airline | Query executes in 1ms | ✅ |
| TC004 | Route popularity query | Returns top routes | Query executes, returns 10 routes | ✅ |
| TC005 | Customer lifetime value | Returns customer spending | Query executes in 4.3s, returns 20 customers | ✅ |
| TC006 | User reservation lookup | Returns user's reservations | Query uses index, executes in 14ms | ✅ |
| TC007 | Flight capacity check | Returns available seats | Query uses index, executes in 2ms | ✅ |
| TC008 | CRUD operations | Create/update/delete work | All operations successful | ✅ |

### Performance Testing

**Dataset Size:**
- Airlines: 58 documents
- Airports: 465 documents
- Countries: 195 documents
- Users: 58 documents
- Flights: 10,025 documents
- Reservations: 534,197 documents

**Index Coverage:**
- All reference data collections have unique indexes
- Flight queries leverage compound indexes for route and date lookups
- Reservation queries use indexes on `userId` and `flightNumber`
- 15+ indexes total, documented in `project/queries/index_blueprint.mongosh.js`

**Performance Highlights:**
- Simple queries (by ID or indexed field): 1-14ms execution time
- Route-based queries: 0-7ms with compound index support
- Complex aggregations: 398ms - 4.3s depending on data volume
- Index usage verified via `explain("executionStats")` for all queries

**Performance Analysis:** Detailed metrics and execution stats for all queries are documented in [`project/performance.md`](project/performance.md).

---

## Challenges and Solutions

### Challenge 1 – Data Import and Field Mapping

**Problem:** The original dataset used different field names (`iata` vs `airlineIata`, `ident` vs `airportIdent`) than required by the flight schema. Additionally, reservations contained `userEmail` instead of `userId` ObjectId references.

**Solution:** Implemented data transformation in `import_data.mongosh.js`:
- Renamed fields during import (`iata` → `airlineIata`, `ident` → `airportIdent`)
- Created email-to-ObjectId mapping after user insertion
- Transformed reservations to replace `userEmail` with `userId` ObjectId references
- Removed duplicate airlines and airports by IATA/ident codes

### Challenge 2 – Performance Optimization for Complex Aggregations

**Problem:** Initial implementation of customer lifetime value and route popularity queries resulted in slow execution times (4+ seconds) due to collection scans and lack of appropriate indexes.

**Solution:**
- Analyzed query execution plans using `explain("executionStats")`
- Identified missing indexes and created compound indexes for common query patterns
- Optimized aggregation pipelines by adding `$match` stages early to filter data
- Documented performance metrics to identify further optimization opportunities
- Some queries still use collection scans but are acceptable for analytical workloads

### Challenge 3 – Reference Data Integrity

**Problem:** Ensuring referential integrity between flights and airlines/airports, and between reservations and flights/users.

**Solution:**
- Created unique indexes on reference identifiers (`airlineIata`, `airportIdent`, `email`)
- Used sparse indexes where appropriate to allow null values
- Validated data during import to ensure all references exist
- Documented relationship patterns in `architecture.md` for future maintenance

---

## Learning Outcomes

1. **NoSQL Data Modeling**: Gained practical experience in designing document schemas, choosing between embedding and referencing strategies, and optimizing for query patterns.

2. **MongoDB Query Language**: Mastered complex aggregation pipelines with `$lookup`, `$group`, `$unwind`, and other operators to solve real-world business intelligence problems.

3. **Performance Optimization**: Learned to analyze query execution plans, design effective indexes, and balance between query performance and data consistency.

4. **Real-World Application Design**: Built a production-ready system capable of handling airline operations, demonstrating understanding of operational and analytical workloads.

5. **Collaboration and Documentation**: Improved skills in documenting architecture decisions, performance metrics, and implementation details for team collaboration.

### Skills Developed

- [x] MongoDB query optimization – Analyzed execution plans and optimized queries with appropriate indexes
- [x] Data modeling for NoSQL – Designed schema with reference-based relationships and optimized document structure
- [x] Performance tuning – Created comprehensive indexing strategy and documented performance metrics
- [x] Index design experiments – Designed compound indexes for route queries, user lookups, and capacity calculations
- [x] Aggregation pipeline deep dive – Built complex pipelines for revenue analysis, customer analytics, and route intelligence
- [x] Business intelligence queries – Developed analytical queries for real-world business scenarios

---

## Future Improvements

1. **Performance Optimization**: Further optimize complex aggregation queries (customer lifetime value, route popularity) that currently use collection scans by creating additional indexes or restructuring queries.

2. **Schema Validation**: Implement MongoDB schema validation rules to enforce data integrity at the database level, complementing application-level validation.

3. **Change Streams**: Implement MongoDB change streams to provide real-time updates for flight status changes and reservation updates.

4. **Sharding Strategy**: Evaluate sharding strategies as data volume grows, potentially sharding by airline or geographic region for distributed deployments.

5. **Dashboard Integration**: Build dashboards using MongoDB Charts or external BI tools to visualize revenue trends, route performance, and customer analytics.

6. **Automated Testing**: Implement automated test suite with CI/CD integration to validate data integrity and query performance on each commit.

7. **Data Archival**: Implement data lifecycle management to archive old flights and reservations, maintaining query performance as data grows.

---

## References

1. MongoDB Documentation – [Schema Design Patterns](https://www.mongodb.com/docs/manual/applications/data-models/)
2. MongoDB Documentation – [Aggregation Framework](https://www.mongodb.com/docs/manual/aggregation/)
3. MongoDB Documentation – [Indexes](https://www.mongodb.com/docs/manual/indexes/)
4. MongoDB Documentation – [Query Performance](https://www.mongodb.com/docs/manual/core/query-plans/)
5. Course repository: https://github.com/diogoribeiro7/nosql-databases-labs
6. Project documentation: [`project/README.md`](project/README.md), [`project/architecture.md`](project/architecture.md), [`project/performance.md`](project/performance.md)

---

## Appendix

### A. Complete Code Listings

All scripts are available in the `project/` directory:

- **Data Import**: [`project/import_data.mongosh.js`](project/import_data.mongosh.js)
- **Index Creation**: [`project/queries/index_blueprint.mongosh.js`](project/queries/index_blueprint.mongosh.js)
- **Query Scripts**: 20 query files in [`project/queries/`](project/queries/):
  - `01_create_flight_reservation.mongosh.js` through `20_find_flights_by_price_range.mongosh.js`

### B. Data Samples

Sample documents for each collection:

**Flight Document:**
```json
{
  "_id": ObjectId("..."),
  "flightNumber": "UA1234",
  "airlineIata": "UA",
  "departureAirportIdent": "KSYR",
  "arrivalAirportIdent": "MMHO",
  "departureTime": ISODate("2024-02-25T05:29:55Z"),
  "arrivalTime": ISODate("2024-02-25T10:30:55Z"),
  "maxCapacity": 197,
  "status": "completed",
  "price": 175.42
}
```

**Reservation Document:**
```json
{
  "_id": ObjectId("..."),
  "flightNumber": "UA1234",
  "userId": ObjectId("..."),
  "seatNumber": "12A",
  "status": "confirmed",
  "reservationDate": ISODate("2025-01-15T10:30:00Z")
}
```

Complete data samples and validation notes are documented in [`project/data/README.md`](project/data/README.md).

### C. Additional Diagrams

- **Architecture Documentation**: [`project/architecture.md`](project/architecture.md) contains detailed schema diagrams and relationship mappings
- **Performance Analysis**: [`project/performance.md`](project/performance.md) includes execution stats and index coverage analysis
- **Project Overview**: [`README.md`](README.md) provides high-level system architecture and capabilities

---

## Declaration

We declare that this submission is our own work and that all sources used have been properly cited.

**Signatures:**

- Petúnia Dias
- João Rego
- João Santos

_Submission validated on: 2026-01-22_
_Version: 1.0.0_
