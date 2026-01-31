# Group 23 - NoSQL Lab Submission

## Group Information

**Group Number:** group_23
**Submission Date:** 2026-01-06
**Lab Assignment:** MongoDB Database Operations Lab

### Team Members

| Name | Student ID | Email | Contribution % |
| ---- | ---------- | ----- | -------------- |
| Gonçalo Chaves | 40200104 | 40200104@esmad.ipp.pt | 50 |
| José Pedro Silva | TBD | TBD | 50 |
| All members should contribute equally to the project | TBD | TBD | TBD |
| Contact information available in the course management system | TBD | TBD | TBD |
| Any changes to group composition must be reported to the instructor | TBD | TBD | TBD |

**Total:** 100%

---

## Executive Summary

This project is based on Airbnb listing datasets for the cities of Porto and Lisbon, provided in the repository.  
The main objective is to design and query a MongoDB-based accommodation booking system capable of supporting data exploration, reservation management, and analytical insights.

---

## Problem Statement
Accommodation platforms must manage large volumes of listing data while supporting availability checks, reservations, and analytical queries such as pricing trends and occupancy rates.

### Requirements

- [ ] Requirement 1 – Use datasets provided in the course repository (Airbnb Porto and Lisbon)
- [ ] Requirement 2 – Design at least three interrelated MongoDB collections
- [ ] Requirement 3 – Implement CRUD operations and aggregation pipelines
- [ ] Requirement 4 – apply indexing strategies
---

## Solution Architecture

### Data Model Design

The database (staybook) is composed of four interrelated collections:

1. listings

Stores accommodation metadata imported from the Airbnb datasets.

Key fields:

id (number, unique dataset identifier)

name, neighbourhood, room_type

accommodates, availability_365

price (string, original)

price_eur (number, normalized for analytics)

2. users

Represents hosts and guests.

Key fields:

_id (ObjectId)

name, email

roles (array: host, guest)

status, createdAt

3. reservations

Represents booking operations.

Key fields:

listingId → references listings.id

guestId → references users._id

dateFrom, dateTo

totalPrice, status, createdAt

4. reviews

Represents post-stay feedback.

Key fields:

reservationId → references reservations._id

listingId, guestId

rating, comment, createdAt

This design satisfies the requirement for 3+ interconnected collections with explicit references and realistic business relationships.

### Design Decisions

1. **Document modeling** 
  - The "listings" collection was kept as the main catalogue with the data imported from the Airbnb datasets, since it is mostly used for reading and analysis.
  - Reservations and reviews were stored in separate collections ("reservations" and "reviews") to avoid very large documents and to allow bookings and reviews to be managed independently.
  - The collections are connected using references:
     - "reservations.listingId" refers to "listings.id"
     - "reservations.guestId" refers to "users._id"
     -"reviews.reservationId" refers to "reservations._id"
   - This structure makes it easier to scale the system and run queries.

2. **Indexing strategy** 
  - Indexes were created based on the most common queries in the system.
  - In the "listings" collection, indexes on "price_eur", "accommodates", "neighbourhood", and "room_type" improve filtering and sorting when searching for accommodations.
  - In the "reservations" collection, a compound index on "listingId", "status", "dateFrom", and "dateTo" was created to check date conflicts and availability.
  - A unique index on "reviews.reservationId" ensures that each reservation can only have one review.
  - Query performance was verified using "explain("executionStats")".

3. **Validation & governance**
  - Data validation is handled through indexes and automated checks.
  - Unique indexes prevent duplicate data, such as repeated listings or multiple reviews for the same reservation.
  - The script "tests/data_quality.mongosh.js" checks for missing fields, incorrect data types, invalid date ranges, invalid statuses, and broken references between collections.
  - Seed scripts also include checks to ensure required data exists before inserting new documents.

### Trade-offs Considered

| Approach | Pros | Cons | Decision |
| -------- | ---- | ---- | -------- |
| Embedding | Fast reads, single document writes | Larger documents, potential duplication | Selected for read-heavy collections |
| Referencing | Normalized data, smaller docs | Requires joins via `$lookup` | Used where relationships are optional |

---

## Implementation

### Setup Instructions

```bash
npm install
mongosh < import_data.js
node queries.js
```

Clarify environment prerequisites, scripts to run, and configuration secrets (if any) in this section.

### Core Queries

#### Query 1 – Describe the business question

```javascript
db.collection.find({
  status: "active",
  createdAt: { $gte: ISODate("2024-01-01") },
}).sort({ createdAt: -1 });
```

- Expected Output: summarize the shape of the dataset returned.
- Performance Metrics: include `executionStats`, document counts, and index usage.

#### Query 2 – Aggregation pipeline example

```javascript
db.collection.aggregate([
  { $match: { type: "event" } },
  { $group: { _id: "$category", total: { $sum: 1 } } },
  { $sort: { total: -1 } }
]);
```

#### Query 3 – Update/write example

```javascript
db.collection.updateMany(
  { flag: true },
  { $set: { reviewedAt: new Date() } }
);
```

Document any helper scripts or stored procedures needed to run these queries.

---

## Testing

### Test Strategy

Describe functional, integration, and performance testing performed locally or in CI.

### Test Results

| Test Case | Description | Expected | Actual | Status |
| --------- | ----------- | -------- | ------ | ------ |
| TC001 | Database connection and data import | Collections created with data | Listings, users, reservations and reviews loaded | ✅ |
| TC002 | Data quality and integrity checks | No invalid or inconsistent data | All checks passed in `data_quality.mongosh.js` | ✅ |
| TC003 | Referential integrity between collections | All references are valid | No broken references found | ✅ |
| TC004 | Business rule validation | Dates, prices and ratings are valid | All rules enforced successfully | ✅ |

### Performance Testing

Performance testing was done using "explain("executionStats")" to compare query behavior before and after creating indexes.

Two main workloads were analyzed:

-Listings filtering and sorting:
  - Query filters listings by "accommodates" and sorts by "price_eur".
  - Before optimization, MongoDB relied on a single-field index and examined more documents.
  - After adding a compound index, the query execution time was reduced and index scans were consistently used.

-Reservation conflict detection:
  - Query checks for overlapping reservations for a given listing and date range.
  - A compound index on "listingId", "status", "dateFrom", and "dateTo" was used.
  - The optimized query avoided unnecessary document scans and returned results with minimal execution time.


## Challenges and Solutions

### Challenge 1 – Price stored as string

**Problem:**  
The Airbnb datasets store prices as strings (for example "€40"), which made it impossible to sort or aggregate prices correctly.

**Solution:**  
A new numeric field "price_eur" was created by normalizing the original price value. This field is used in all analytical queries and was indexed to improve performance.

### Challenge 2 – Ensuring data consistency across collections

**Problem:**  
MongoDB does not enforce foreign key constraints, which can lead to broken references between listings, users, reservations, and reviews.

**Solution:**  
Automated data-quality tests were implemented in "tests/data_quality.mongosh.js" to validate references, required fields, date ranges, and business rules. Unique indexes were also used to prevent duplicated data.

## Learning Outcomes

1. Improved understanding of how to model real-world data using MongoDB and NoSQL principles.
2. Gained practical experience writing queries and aggregation pipelines for analytical and business scenarios.
3. Learned how to design and test indexes to improve query performance.
4. Developed skills in validating data quality and ensuring consistency across collections.
5. Gained experience organizing and documenting a complete MongoDB project.

### Skills Developed

- [x] MongoDB query optimization
- [x] Data modeling for NoSQL
- [X] Performance tuning (detail work pending)
- [X] Index design experiments
- [X] Aggregation pipeline deep dive

---

## Future Improvements

1. Add dashboards or reporting views for stakeholders.
2. Automate dataset generation and CI validation.
3. Evaluate sharding/partitioning strategies as data volume grows.

---

## References

1. MongoDB Documentation – Schema Design Patterns
2. MongoDB Documentation – Aggregation Framework
3. Course notes or third-party articles used for research

---

## Appendix

### A. Complete Code Listings

- `project/import_data.mongosh.js` – imports the Airbnb datasets into MongoDB  
- `project/queries/` – contains all CRUD and aggregation queries  
- `project/queries/index_blueprint.mongosh.js` – defines the indexing strategy  
- `project/advanced/` – contains performance analysis scripts using "explain()"  
- `project/tests/data_quality.mongosh.js` – automated data quality and integrity checks  


### B. Data Samples

Sample documents used in this project are provided through the Airbnb datasets included in the course repository.  
These datasets contain anonymized and publicly available information about accommodation listings in Porto and Lisbon.

Additional sample data for users, reservations, and reviews was generated through seed scripts to simulate realistic booking and review scenarios while keeping the structure consistent with the original datasets.

## Declaration

We declare that this submission is our own work and that all sources used have been properly cited.
**Signatures:**

- Gonçalo Chaves
- José Silva

_Submission validated on: 2026-01-22_
_Version: 1.0.0_
