# Group 05 - NoSQL Lab Submission

## Group Information

**Group Number:** group_05  
**Submission Date:** 2026-01-06  
**Lab Assignment:** MongoDB Database Operations Lab

### Team Members

| Name | Student ID | Email | Contribution % |
|------|------------|-------|----------------|
| João Oliveira | 40240391 | 40240391@esmad.ipp.pt | 33.3 |
| Miguel Neto | 40240358 | 40240358@esmad.ipp.pt | 33.3 |
| Miguel Basso | 40240207 | 40240207@esmad.ipp.pt | 33.3 |

**Total:** 100%

---

## Executive Summary

This project implements a backend database architecture for an Airbnb clone focused on the Portuguese market (Porto & Lisbon). Using MongoDB, we designed a scalable system to manage Hosts, Listings, and Reviews. The solution features high-performance geospatial querying for "Hotel Search," complex aggregation pipelines for "Market Analytics," and optimized data models that balance read performance with data integrity. Key achievements include the successful implementation of 2dsphere indexes for radius-based search and IXSCAN-optimized aggregation pipelines for real-time reporting.

---

## Problem Statement

The goal was to build a NoSQL data layer capable of handling the dynamic needs of a vacation rental platform. The system needed to support diverse user personas: travelers searching for properties by location and capacity, hosts managing portfolios, and analysts tracking market trends.

### Requirements

- [x] Requirement 1: Define a domain model for Vacation Rentals (Hosts, Listings, Reviews).
- [x] Requirement 2: Implement advanced CRUD and Aggregation capabilities (e.g., Radius search, Grouping by City).
- [x] Requirement 3: Ensure query performance using strategic Indexing (Geospatial, Compound, Unique).
- [x] Requirement 4: Handle data relationships efficiently (References vs. Embedding) to support scalability.

---

## Solution Architecture

### Data Model Design

Our schema uses a hybrid approach: References for major entities (Hosts, Listings) to ensure scalability and reduce redundancy, but denormalized computed fields where read speed is critical.

```javascript
// Collection: listings
{
  _id: ObjectId("..."),
  id: 10001,                           // Unique Integer ID
  host_id: 1001,                       // Reference to hosts.id
  name: "Charming Porto Apartment",
  location: {                          // GeoJSON Point
    type: "Point",
    coordinates: [-8.6109, 41.1496]
  },
  room_type: "Entire home/apt",
  price: "€40",
  accommodates: 2,
  review_scores_rating: 4.8
}

// Collection: hosts
{
  _id: ObjectId("..."),
  id: 1001,
  name: "Porto_Host_1",
  is_superhost: true,
  location: "Porto, Portugal"
}

// Collection: reviews
{
  _id: ObjectId("..."),
  listing_id: 10001,                   // Reference to listings.id
  reviewer_name: "Alice",
  rating: 5.0,
  comments: "Great stay!"
}
```

### Design Decisions

1. **Reference-based Host Relationships:** We separated hosts into their own collection.
   - **Reason:** Allows for "Portfolio Analysis" (grouping listings by brand) and prevents data duplication when one host manages 50+ properties.

2. **GeoJSON Implementation:** We migrated raw lat/long fields to GeoJSON Point objects.
   - **Reason:** Enabled the use of 2dsphere indexes for accurate distance calculations ($near, $geoNear).

3. **Indexing Strategy:** We implemented the ESR (Equality, Sort, Range) rule.
   - **Example:** `idx_geo_hotel_capacity ({ location: "2dsphere", room_type: 1, accommodates: 1 })` allows filtering by location, type, and size in a single index scan.

### Trade-offs Considered

| Approach | Pros | Cons | Decision |
|----------|------|------|----------|
| Embed Reviews | Ultra-fast read for single listing | Document size limit (16MB) risk | Rejected: Popular listings have thousands of reviews. |
| Embed Hosts | No need for `$lookup` joins | Hard to update host profile across 50 listings | Rejected: Referenced via `host_id` for maintainability. |
| Computed Fields | Fast sorting (e.g., numeric_price) | Requires storage update or aggregation | Selected: Used Aggregation pipelines to compute on-the-fly. |

---

## Implementation

### Setup Instructions

1. **Start MongoDB:** Ensure local instance is running on port 27017.
2. **Install Dependencies:**
   ```bash
   npm install mongodb
   ```
3. **Import Data & Create Indexes:**
   ```bash
   node import_data.js
   ```
   (This script automatically loads JSON files and applies the index blueprint.)

### Core Queries

#### Query 1 – Geospatial Radius Search

Find hotels for at least 4 people within 5km of Porto City Center.

```javascript
db.listings.aggregate([
  {
    $geoNear: {
      near: { type: "Point", coordinates: [-8.6104, 41.1488] },
      distanceField: "dist_meters",
      maxDistance: 5000,
      query: { room_type: "Hotel room", accommodates: { $gte: 4 } },
      key: "location"
    }
  },
  { $sort: { review_scores_rating: -1 } },
  { $limit: 5 }
])
```

**Performance:** Uses `idx_geo_hotel_capacity`. Execution relies on IXSCAN to filter type and capacity inside the index tree.

#### Query 2 – Host Portfolio Analysis

Analyze the market dominance of the "Lisbon" brand (Listings count & Unique Neighbourhoods).

```javascript
db.hosts.aggregate([
  { $match: { name: /^Lisbon/ } },
  {
    $lookup: {
      from: "listings",
      localField: "id",
      foreignField: "host_id",
      as: "portfolio"
    }
  },
  { $unwind: "$portfolio" },
  {
    $group: {
      _id: null,
      unique_neighbourhoods: { $addToSet: "$portfolio.neighbourhood" },
      total_listings: { $sum: 1 }
    }
  }
])
```

**Performance:** Optimized by starting with hosts (filtering 40 docs via index) instead of scanning 200 listings.

#### Query 3 – Top 5 Reviews per Property (Efficient Join)

Fetch the 5 highest-rated reviews for a specific listing without loading the full history.

```javascript
db.listings.aggregate([
  {
    $lookup: {
      from: "reviews",
      localField: "id",
      foreignField: "listing_id",
      pipeline: [
        { $sort: { rating: -1, date: -1 } },
        { $limit: 5 }
      ],
      as: "top_reviews"
    }
  }
])
```

**Performance:** Uses `idx_reviews_lookup_optimized`. The sort and limit happen inside the index lookup, preventing memory overhead.

---

## Testing

### Test Strategy

We performed functional testing using mongosh scripts to validate data integrity and `explain("executionStats")` to verify index usage.

### Test Results

| Test Case | Description | Expected | Actual | Status |
|-----------|-------------|----------|--------|--------|
| TC001 | Data Import | 3 Collections populated (Hosts, Listings, Reviews) | 3 Collections populated | ✅ |
| TC002 | Geo Query | Return hotels < 5km from center | Returns listings with dist_meters < 5000 | ✅ |
| TC003 | Index Usage | $lookup uses IXSCAN | executionStages.stage = "IXSCAN" | ✅ |
| TC004 | Data Integrity | Review listing_id matches Listing id | Type check confirmed (Int vs Int) | ✅ |

### Performance Testing

Using `.explain("executionStats")`, we compared query plans:

- **Without Index:** The "Portfolio Analysis" scanned 200 listings (COLLSCAN).
- **With Optimization:** Re-ordering the pipeline to start with hosts reduced the scan to ~20 index keys (IXSCAN), significantly reducing execution time.

---

## Challenges and Solutions

### Challenge 1 – "COLLSCAN" in Aggregations

**Problem:** Our initial `$lookup` from Listings -> Hosts was scanning the entire listings table, which is inefficient for filtering by Brand.

**Solution:** We inverted the query to start from hosts (filtering by Name first) and then joined to listings. This leveraged the `idx_hosts_name` index efficiently.

### Challenge 2 – "Blocking Sort" in Top Reviews

**Problem:** Finding the "Top 5 Reviews" required sorting all reviews for a listing in memory, which is CPU intensive.

**Solution:** We created a compound index `{ listing_id: 1, rating: -1, date: -1 }`. This allows MongoDB to fetch the pre-sorted top 5 directly from the index tree.

---

## Learning Outcomes

1. **Schema Design:** Learned when to normalize (Hosts) vs denormalize (Location) in a document database.
2. **Geospatial Power:** Mastered the specific requirements of GeoJSON and 2dsphere indexes.
3. **Performance Tuning:** Deepened understanding of how explain() reveals the difference between logical correctness and performance efficiency.

### Skills Developed

- [x] MongoDB Aggregation Framework ($lookup, $unwind, $group)
- [x] Geospatial Indexing & Querying
- [x] Query Performance Analysis (Explain Plans)
- [x] Node.js Driver Integration

---

## Future Improvements

1. **Sharding:** As the number of reviews grows into the millions, we would shard the reviews collection by `listing_id` to distribute the load.
2. **Real-time Availability:** Implement a calendar-based booking system using date-range overlapping logic.
3. **Text Search:** Implement Atlas Search (Lucene) for full-text search on user reviews description.

---

## References

1. MongoDB Documentation – Model One-to-Many Relationships with Document References
2. MongoDB Documentation – Geospatial Queries ($geoNear)
3. MongoDB University – M121: The Aggregation Framework

---

## Appendix

### A. Complete Code Listings

See the attached `scripts/` folder for:
- `import_data.js`: Data seeding and Index creation.
- `queries/`: Individual .js files for each user story.

### B. Data Samples

The dataset represents a snapshot of the Portuguese rental market (Porto and Lisbon districts), including realistic pricing, capacity, and review scores.

---

## Declaration

We declare that this submission is our own work and that all sources used have been properly cited.

**Signatures:**

- João Oliveira
- Miguel Neto
- Miguel Basso

_Submission validated on: 2026-01-06_  
_Version: 1.0.0_