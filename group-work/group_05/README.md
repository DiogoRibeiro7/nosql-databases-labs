# Group 05 - MongoDB NoSQL Database Project

## Team Members

| Name | Student ID | Email |
|------|------------|-------|
| João Oliveira | 40240391 | 40240391@esmad.ipp.pt |
| Miguel Neto | 40240358 | 40240358@esmad.ipp.pt |
| Miguel Basso | 40240207 | 40240207@esmad.ipp.pt |

## Project Overview

This project demonstrates our comprehensive understanding of MongoDB database operations and NoSQL concepts through the implementation of an Airbnb clone focused on the Portuguese market (Porto & Lisbon). We have designed a scalable system to manage Hosts, Listings, and Reviews with high-performance geospatial querying and complex aggregation pipelines.

### Learning Objectives Achieved

- Mastered MongoDB geospatial queries and 2dsphere indexing
- Designed efficient document schemas with hybrid reference/embedding approach
- Implemented complex aggregation pipelines for market analytics
- Created optimized compound indexes following ESR (Equality, Sort, Range) principles
- Developed data insertion strategies for vacation rental platform

## Database Design

### Collections Created

1. **listings** - Vacation rental properties
   - Embedded GeoJSON Point for location data
   - Referenced host via `host_id`
   - Denormalized fields for fast read access (price, rating, capacity)

2. **hosts** - Property owners and managers
   - Normalized collection to prevent duplication
   - Enables portfolio analysis across multiple properties
   - Superhost status and location information

3. **reviews** - Guest reviews and ratings
   - Referenced to listings via `listing_id`
   - Separated to avoid 16MB document size limits
   - Optimized for top-N queries with compound indexes

### Schema Design Decisions

- **Referencing for Scalability**: Separated Hosts and Reviews into their own collections to handle hosts with 50+ properties and listings with thousands of reviews
- **GeoJSON Embedding**: Embedded location as GeoJSON Point objects to enable 2dsphere spatial queries
- **Computed Fields**: Used aggregation pipelines to compute derived values on-the-fly rather than storing redundant data

## Data Operations Implemented

### 1. Database Creation & Setup

- Created `airbnb_clone` database with Portuguese market data
- Established three primary collections with validation rules
- Set up geospatial, compound, and unique indexes

### 2. Data Insertion

- **Bulk Insert Operations**: Efficient insertion of 200+ listings, 40+ hosts, and review datasets
- **GeoJSON Data Generation**: Created realistic test data with valid coordinates for Porto and Lisbon
- **Reference Integrity**: Ensured all `host_id` and `listing_id` references are valid
- **Data Validation**: Integer IDs, price ranges, and rating scores validated during import

### 3. Query Operations

#### Basic Queries

- Find operations filtering by room type, price range, and capacity
- Projection to retrieve specific fields (name, location, price)
- Sorting by rating, price, and distance
- Regular expression searches for neighborhood matching

#### Advanced Queries

- Geospatial radius searches using `$geoNear` aggregation
- Complex filtering with `$and`, `$gte`, `$lte` for price and capacity ranges
- Array queries for amenities using `$all` and `$elemMatch`
- Distance-based sorting with computed `dist_meters` field

### 4. Aggregation Pipelines

#### Geospatial Search Pipeline

- `$geoNear` stage for radius-based property discovery
- `$match` query filters embedded in geoNear for room type and capacity
- `$sort` by review rating for best-match results
- `$limit` to return top N properties

#### Portfolio Analysis Pipeline

- `$match` stage filtering hosts by brand name
- `$lookup` to join listings by `host_id`
- `$unwind` to flatten portfolio array
- `$group` with `$addToSet` to calculate unique neighborhoods and total listings

#### Review Aggregation Pipeline

- `$lookup` with sub-pipeline for efficient top-N review fetching
- Sort and limit pushed down into the lookup stage
- Prevents memory-intensive operations on large review collections

### 5. Update Operations

- Multi-document updates for price adjustments across neighborhoods
- Array update operators for adding/removing amenities
- Field updates for review score recalculations
- Conditional updates based on superhost status changes

### 6. Index Management

- **Geospatial Index**: `{ location: "2dsphere", room_type: 1, accommodates: 1 }` for hotel search
- **Compound Index**: `{ listing_id: 1, rating: -1, date: -1 }` for top reviews query
- **Text Index**: `{ name: 1 }` for host brand filtering
- **Unique Index**: `{ id: 1 }` for data integrity across collections

## Technologies & Tools Used

- **Database**: MongoDB 7.0
- **Shell**: MongoDB Shell (mongosh)
- **Query Language**: MongoDB Query Language (MQL) with Aggregation Framework
- **Driver**: Node.js MongoDB Driver
- **Tools**: MongoDB Compass for index analysis and explain plans
- **Scripts**: JavaScript (Node.js) for data import and query execution

## Database Setup Instructions

### Prerequisites

- MongoDB 7.0 or higher installed locally
- Node.js 18+ for running import scripts
- MongoDB Shell (mongosh) installed
- MongoDB Compass (optional, for GUI access)

### Running Our Solution

1. **Start MongoDB Server**

   ```bash
   mongod --dbpath /path/to/data/directory
   ```

2. **Install Dependencies**

   ```bash
   npm install mongodb
   ```

3. **Import Data & Create Indexes**

   ```bash
   node import_data.js
   ```

4. **Connect to MongoDB**

   ```bash
   mongosh
   use airbnb_clone
   ```

5. **Verify Data**
   ```javascript
   db.getCollectionNames();
   db.listings.countDocuments();
   db.hosts.countDocuments();
   db.reviews.countDocuments();
   ```

## Query Examples from Our Solution

### Example 1: Find Hotels Near Porto City Center

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
]);
```

### Example 2: Analyze Lisbon Host Portfolio

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
]);
```

### Example 3: Get Top 5 Reviews per Listing

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
]);
```

## Performance Optimizations

1. **Query Optimization**
   - Used `$geoNear` with embedded query filters to reduce result set
   - Implemented pipeline reordering (hosts first, then lookup) to minimize scans
   - Leveraged covered queries with compound indexes

2. **Data Modeling**
   - Referenced Hosts to avoid duplication across 50+ listings per owner
   - Separated Reviews to prevent document size limits
   - Embedded GeoJSON for zero-join location queries

3. **Index Strategy**
   - Created `2dsphere` index for accurate distance calculations
   - Used compound indexes `{ listing_id: 1, rating: -1, date: -1 }` to eliminate in-memory sorts
   - Applied ESR rule (Equality, Sort, Range) for optimal index design

## Challenges and Solutions

### Challenge 1: COLLSCAN in Aggregations

- **Problem**: Initial `$lookup` from Listings → Hosts scanned entire listings collection (200 docs)
- **Solution**: Inverted query to start from Hosts (40 docs) and join to listings, reducing scan to ~20 index keys using `idx_hosts_name`

### Challenge 2: Blocking Sort in Review Queries

- **Problem**: Finding "Top 5 Reviews" required sorting all reviews in memory (CPU intensive)
- **Solution**: Created compound index `{ listing_id: 1, rating: -1, date: -1 }` allowing MongoDB to fetch pre-sorted top 5 directly from index tree

### Challenge 3: GeoJSON Migration

- **Problem**: Raw `latitude` and `longitude` fields don't support `$geoNear` queries
- **Solution**: Migrated to GeoJSON Point format `{ type: "Point", coordinates: [lng, lat] }` and created `2dsphere` index

## Testing & Validation

- Tested all queries with realistic Porto/Lisbon dataset (200+ listings)
- Validated aggregation pipeline results against expected metrics
- Verified index effectiveness using `explain("executionStats")`
  - Confirmed IXSCAN instead of COLLSCAN for all optimized queries
  - Measured execution time reduction (from 200-doc scan to 20-key scan)
- Ensured GeoJSON coordinate accuracy for distance calculations

## Learning Outcomes

Through this project, we gained practical experience in:

- **Geospatial Indexing**: Mastered GeoJSON format and 2dsphere index requirements
- **Schema Design**: Learned when to normalize (Hosts) vs denormalize (Location) in document databases
- **Performance Tuning**: Deepened understanding of explain plans and the difference between logical correctness and performance efficiency
- **Aggregation Framework**: Built multi-stage pipelines with `$lookup`, `$unwind`, `$group`, and `$geoNear`
- **Index Optimization**: Applied ESR principles and compound index design strategies

## Future Enhancements

- **Sharding**: Shard reviews collection by `listing_id` as data grows into millions
- **Real-time Availability**: Implement calendar-based booking system with date-range overlapping logic
- **Text Search**: Implement Atlas Search (Lucene) for full-text search on review descriptions
- **Change Streams**: Monitor real-time booking updates and price changes
- **Time-Series Data**: Track pricing trends and occupancy rates over time

## Documentation

Additional files in our submission:

- `README.md` - Complete project documentation (this file)
- `import_data_mongosh.js` - Data seeding script with index creation
- `queries/` - Individual JavaScript files for each user story query
- `data/` - Sample JSON datasets for hosts, listings, and reviews

## References

1. MongoDB Documentation – Model One-to-Many Relationships with Document References
2. MongoDB Documentation – Geospatial Queries ($geoNear)
3. MongoDB University – M121: The Aggregation Framework

## Declaration

We declare that this submission is our own work and that all sources used have been properly cited.

**Signatures:**

- João Oliveira
- Miguel Neto
- Miguel Basso

_Submission Date: 2026-01-06_  
_Version: 1.0.0_