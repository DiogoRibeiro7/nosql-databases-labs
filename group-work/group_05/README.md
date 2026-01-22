# Group 05 - MongoDB NoSQL Database Project

## Team Members

| Name          | Student ID | Email                 |
| ------------- | ---------- | --------------------- |
| João Oliveira | 40240391   | 40240391@esmad.ipp.pt |
| Miguel Neto   | 40240358   | 40240358@esmad.ipp.pt |
| Miguel Basso  | 40240207   | 40240207@esmad.ipp.pt |

## Project Overview

This project demonstrates our comprehensive understanding of MongoDB database operations and NoSQL concepts through the implementation of an Airbnb clone focused on the Portuguese market (Porto & Lisbon). We have designed a scalable system to manage Hosts, Listings, Reviews and Reservations with high-performance geospatial querying and complex aggregation pipelines.

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

4. **reservations** - Property reservations
   - Referenced to listings via `listing_id`
   - Separated to avoid 16MB document size limits

### Schema Design Decisions

- **Referencing for Scalability**: Separated Hosts and Reviews into their own collections to handle hosts with 50+ properties and listings with thousands of reviews
- **GeoJSON Embedding**: Embedded location as GeoJSON Point objects to enable 2dsphere spatial queries
- **Computed Fields**: Used aggregation pipelines to compute derived values on-the-fly rather than storing redundant data

## Data Operations Implemented

### 1. Database Creation & Setup

**Operations Performed:**

- Created `group_05_final` database with Portuguese market data
- Established four primary collections with appropriate field types
- Configured unique constraints on primary keys
- Set up comprehensive indexing strategy (8 total indexes)

**Collections Initialized:**

```javascript
db.createCollection("listings");
db.createCollection("hosts");
db.createCollection("reviews");
db.createCollection("reservations");
```

**Validation Rules Applied:**

- Integer validation for IDs and numeric fields
- Price range validation (€10-€500)
- Rating score bounds (0-5)
- Coordinate validation for GeoJSON points

### 2. Data Insertion

**Bulk Operations:**

- Imported 200+ realistic listings across Porto and Lisbon
- Loaded 40+ host profiles including property management companies
- Seeded review dataset with diverse ratings and dates
- Created sample reservations for availability testing

**Data Quality Measures:**

- Generated valid GeoJSON coordinates using real Porto/Lisbon landmarks
- Ensured referential integrity (all `host_id` values exist in hosts collection)
- Validated price ranges and rating distributions
- Included edge cases (superhosts, budget properties, luxury listings)

**Import Script Features:**

```javascript
// Automated import with index creation
await loadAndInsert("hosts", "data/hosts.json");
await loadAndInsert("listings", "data/listings.json");
await loadAndInsert("reviews", "data/reviews.json");
await loadAndInsert("reservations", "data/reservations.json");
```

### 3. Query Operations

#### 3.1 Basic Queries

**Find Operations:**

- Filter by room type, price range, and guest capacity
- Neighborhood-based searches using regex patterns
- Availability filtering (365-day calendar)
- Rating threshold queries (4.5+ stars)

**Example - Find Budget Private Rooms:**

```javascript
db.listings.find({
  room_type: "Private room",
  price: { $regex: /^€[1-5][0-9]$/ },
  review_scores_rating: { $gte: 4.5 },
});
```

**Projection Queries:**

- Retrieve specific fields to minimize network transfer
- Exclude large embedded arrays
- Include computed fields with `$project`

**Sorting Operations:**

- Sort by rating (descending) for best-match results
- Price sorting (ascending) for budget searches
- Distance-based ordering using computed fields

#### 3.2 Advanced Queries

**Geospatial Radius Searches:**

- `$geoNear` aggregation for distance-based discovery
- Combined with filters for room type and capacity
- Distance calculations in meters with spherical geometry
- Results include computed `distance_from_center` field

**Example - Properties Within 5km of Porto Center:**

```javascript
db.listings.aggregate([
  {
    $geoNear: {
      near: { type: "Point", coordinates: [-8.6104, 41.1488] },
      distanceField: "distance_meters",
      maxDistance: 5000,
      spherical: true,
    },
  },
]);
```

**Complex Filtering:**

- Multi-condition queries with `$and`, `$or` operators
- Range queries for price and capacity
- Nested field filtering in embedded documents
- Array matching for amenities and features

**Text Pattern Matching:**

- Regular expressions for partial name/neighborhood matches
- Case-insensitive searches
- Wildcard patterns for brand filtering

### 4. Aggregation Pipelines (15 Use Cases)

#### 4.1 Regional Discovery & Road Trip Planner (Query 01)

**Business Goal:** Consolidated catalog grouped by city for multi-destination planning

**Pipeline Stages:**

1. `$lookup` - Join listings with hosts to resolve location
2. `$unwind` - Flatten host details array
3. `$addFields` - Parse city name from "City, Country" format
4. `$group` - Aggregate by destination with metrics (total properties, avg rating, min price)
5. `$project` - Format output with rounded averages
6. `$sort` - Alphabetical order by destination

**Metrics Calculated:**

- Total properties per city
- Average city rating (rounded to 2 decimals)
- Minimum price per destination
- Complete catalog of properties

**Key Technique:** String parsing with `$split` and `$arrayElemAt` to extract city from location string

#### 4.2 Host Portfolio & Geographic Spread (Query 02)

**Business Goal:** Analyze market dominance of property management brands

**Pipeline Stages:**

1. `$match` - Filter hosts by brand name pattern (e.g., "Lisbon\*")
2. `$lookup` - Retrieve all listings for matched hosts
3. `$unwind` - Expand property portfolio array
4. `$group` - Calculate unique neighborhoods and total inventory
5. `$project` - Format final output

**Metrics Calculated:**

- Unique neighborhoods covered
- Total listings managed
- Geographic footprint analysis

**Optimization:** Starts with hosts collection (40 docs) instead of listings (200 docs) to minimize scan

#### 4.3 Central Stays & Quality Assurance (Query 03)

**Business Goal:** Find quality properties near city center with validated reviews

**Pipeline Stages:**

1. `$geoNear` - Filter by 5km radius from central point
2. `$lookup` - Enrich with host details
3. `$unwind` - Flatten host document
4. `$lookup` with sub-pipeline - Fetch top 3 reviews sorted by rating
5. `$project` - Format output with distance in km
6. `$limit` - Return top results

**Advanced Features:**

- Cascading lookups (listings → hosts → reviews)
- Sub-pipeline sorting and limiting within `$lookup`
- Distance unit conversion (meters to km)
- Nested data enrichment

**Key Technique:** Sub-pipeline in `$lookup` prevents loading all reviews into memory

#### 4.4 Best Value Group Stays (Query 04)

**Business Goal:** Find properties with optimal price-to-quality-to-capacity ratio

**Pipeline Stages:**

1. `$addFields` - Convert price string "€XX" to numeric
2. `$match` - Filter valid prices and high ratings (4.5+)
3. `$project` - Calculate value score: (Rating × Capacity) / Price
4. `$sort` - Highest value score first
5. `$limit` - Top 5 results

**Custom Metric Formula:**

```javascript
value_score = (review_scores_rating × accommodates) / numeric_price
```

**Business Logic:** Higher score = more quality and space per euro spent

#### 4.5 Host Onboarding & Multi-Collection Insert (Query 05)

**Business Goal:** Atomic onboarding process creating host, listing, and initial review

**Operations:**

1. `updateOne` with upsert - Create or update host record
2. `insertOne` - Add new listing with GeoJSON location
3. `insertOne` - Create welcome review from system

**Data Transformations:**

- Add GeoJSON Point from latitude/longitude
- Remove denormalized fields before insertion
- Generate system review with current timestamp

**Transactional Logic:** Ensures referential integrity across three collections

#### 4.6 Neighborhood Price Distribution (Query 06)

**Business Goal:** Market analysis of pricing by neighborhood

**Pipeline Stages:**

1. `$match` - Filter listings by city (Porto)
2. `$group` - Calculate average price per neighborhood
3. `$project` - Format output with clean field names

**Price Conversion:** String "€XX" to integer using `$toInt` and `$trim`

#### 4.7 Listing Performance Scoring (Query 07)

**Business Goal:** Categorize listings by demand using availability and reviews

**Pipeline Stages:**

1. `$project` - Calculate demand score using `$switch` with conditions
2. `$sort` - Order by demand (High → Medium → Low)

**Demand Categories:**

- **High**: availability < 121 days AND reviews > 50
- **Medium**: availability 121-242 days OR reviews 10-50
- **Low**: All other cases

**Key Technique:** Multi-branch conditional logic with `$switch` operator

#### 4.8 Reservation Date Modification (Query 08)

**Business Goal:** Update booking dates for existing reservation

**Operation:**

```javascript
db.reservations.updateOne({ id: reservation_id }, { $set: { dates: new_dates_array } });
```

**Use Case:** Last-minute travel plan changes

#### 4.9 Availability Conflict Detection (Query 09)

**Business Goal:** Prevent double-booking with date overlap checking

**Query Logic:**

```javascript
db.reservations.countDocuments({
  listing_id: input_listing_id,
  "dates.0": { $lt: input_end_date },
  "dates.1": { $gt: input_start_date },
});
```

**Overlap Detection:** Covers all conflict scenarios where date ranges intersect

**Business Rule:** If count > 0, reservation conflicts exist

#### 4.10 Price Per Bedroom Analysis (Query 10)

**Business Goal:** Find best value for families based on room count

**Pipeline Stages:**

1. `$match` - Filter by city
2. `$project` - Calculate price/bedroom ratio
3. `$sort` - Lowest ratio first (best value)

**Metric:** Enables comparison across different property sizes

#### 4.11 Property Sale & Full Cleanup (Query 11)

**Business Goal:** Delete listing and cascade delete all reviews

**Pipeline Stages:**

1. `aggregate` - Find most expensive listing in Lisbon/Porto
2. `deleteOne` - Remove listing document
3. `deleteMany` - Remove all associated reviews

**Cascade Delete:** Maintains referential integrity by cleaning up orphaned reviews

#### 4.12 Emergency Family Stay Finder (Query 12)

**Business Goal:** Find cheapest private room in Lisbon with 2+ beds

**Pipeline Stages:**

1. `$lookup` - Join with hosts to filter by city
2. `$addFields` - Parse city and convert price
3. `$match` - Filter Lisbon + Private room + beds ≥ 2
4. `$sort` - Cheapest first
5. `$limit` - Return single best option

#### 4.13 Corporate Team Stay (Query 13)

**Business Goal:** Budget accommodation for 6-person team in Porto

**Filters Applied:**

- City: Porto
- Capacity: ≥ 6 people
- Minimum nights: 3-5 (corporate travel policies)
- Sort: Cheapest option

#### 4.14 Host Performance Screening (Query 14)

**Business Goal:** Analyze hosts with 95%+ response rates

**Pipeline Stages:**

1. `$addFields` - Convert "95%" string to integer
2. `$match` - Filter response_rate > 95%
3. `$lookup` - Join with listings
4. `$unwind` - Expand listings array
5. `$lookup` - Join with reviews
6. `$group` - Aggregate per host with metrics

**Metrics Calculated:**

- Listings count
- Average property rating
- Total reviews across portfolio

#### 4.15 Multi-City Budget Trip Planner (Query 15)

**Business Goal:** Plan 2-city trip (Porto + Lisbon) within €250 budget

**Pipeline Stages:**

1. `$lookup` - Join with hosts for city filtering
2. `$addFields` - Parse city and price
3. `$match` - Filter Porto/Lisbon private rooms
4. `$facet` - Split into two branches (Porto, Lisbon)
5. Sub-branches sort and select cheapest option per city
6. `$project` - Calculate total trip cost (2 nights Porto + 3 nights Lisbon)
7. `$addFields` - Check if within €250 budget

**Key Technique:** `$facet` enables parallel processing of two city queries in single pipeline

### 5. Update Operations

**Field Updates:**

- Price adjustments across property portfolios
- Review score recalculations after new reviews
- Host status changes (superhost promotions)
- Availability calendar updates

**Array Operations:**

- Add/remove amenities with `$push` and `$pull`
- Update embedded review arrays
- Modify booking date ranges

**Multi-Document Updates:**

```javascript
db.listings.updateMany(
  { neighbourhood: "Ribeira" },
  { $mul: { price_numeric: 1.1 } } // 10% price increase
);
```

**Conditional Updates:**

- Update based on rating thresholds
- Bulk operations for seasonal pricing
- Status changes for high-performing hosts

### 6. Index Management

#### 6.1 Hosts Collection Indexes

**Primary Key Index:**

```javascript
{
  id: 1;
} // Unique index for foreign key lookups
```

- Purpose: Fast joins from listings collection
- Type: Unique B-tree index
- Query benefit: O(log n) lookup vs O(n) scan

**Brand Analysis Index:**

```javascript
{
  name: 1;
} // Text matching for portfolio queries
```

- Purpose: Enable efficient regex filtering on host names
- Query benefit: Index scan instead of collection scan for "Lisbon\*" patterns

#### 6.2 Listings Collection Indexes

**Primary Key Index:**

```javascript
{
  id: 1;
} // Unique identifier
```

- Purpose: Fast lookups for detail pages and reviews join
- Type: Unique B-tree index

**Foreign Key Index:**

```javascript
{
  host_id: 1;
} // Enable reverse lookups
```

- Purpose: Portfolio analysis (find all listings for a host)
- Query benefit: Enables efficient `$lookup` from hosts → listings

**Compound Geospatial Index (ESR Optimized):**

```javascript
{ location: "2dsphere", room_type: 1, accommodates: 1 }
```

- Purpose: Multi-filter hotel search near location
- ESR Breakdown:
  - **Equality**: room_type filter
  - **Sort**: (implicit in 2dsphere distance)
  - **Range**: accommodates ≥ X filter
- Query benefit: Single index scan covers location + filters
- Geospatial features: Spherical distance calculations, radius queries

**Rating Index:**

```javascript
{
  review_scores_rating: -1;
} // Descending for top-rated queries
```

- Purpose: Fast sorting for "best rated" searches
- Descending order matches common query pattern

#### 6.3 Reviews Collection Index

**Compound Pipeline-Optimized Index:**

```javascript
{ listing_id: 1, rating: -1, date: -1 }
```

- Purpose: Optimized for "top 3 reviews" sub-pipeline queries
- ESR Breakdown:
  - **Equality**: listing_id filter
  - **Sort**: rating DESC, date DESC
  - **Range**: (none in this use case)
- Query benefit: Eliminates in-memory sort (SORT_KEY_GENERATOR stage)
- Performance: Index-only query returns pre-sorted top N reviews

**Why This Order:**

1. `listing_id` first: Narrows to specific listing's reviews
2. `rating` second: Primary sort for "best reviews"
3. `date` last: Tiebreaker for same-rated reviews (most recent first)

#### 6.4 Index Strategy Principles

**ESR Rule Applied:**

- **E**quality filters first
- **S**ort fields second
- **R**ange filters last
- Minimizes index scan range and prevents in-memory sorting

**Compound Index Benefits:**

- Single index serves multiple query patterns
- Reduces index storage overhead
- Enables covered queries (query satisfied entirely from index)

**Index Selectivity:**

- High-cardinality fields (id, location) use unique indexes
- Low-cardinality fields (room_type) combined in compound indexes
- Ensures maximum query optimization

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
   db.reservations.countDocuments();
   ```

## Query Examples from Our Solution

### Example 1: Find Hotels Near Porto City Center

```javascript
db.listings.aggregate([
  {
    $geoNear: {
      near: { type: "Point", coordinates: centerPoint },
      distanceField: "distance_from_center",
      maxDistance: 5000,
      key: "location",
      spherical: true,
    },
  },
  {
    $lookup: {
      from: "hosts",
      localField: "host_id",
      foreignField: "id",
      as: "host_doc",
    },
  },
  {
    $unwind: "$host_doc",
  },
  {
    $lookup: {
      from: "reviews",
      let: { local_id: "$id" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$listing_id", "$$local_id"] },
          },
        },
        {
          $sort: { rating: -1, date: -1 },
        },
        {
          $limit: 3,
        },
        {
          $project: {
            _id: 0,
            reviewer: "$reviewer_name",
            rating: 1,
            comment: "$comments",
          },
        },
      ],
      as: "top_reviews",
    },
  },
  {
    $project: {
      _id: 0,
      listing_name: "$name",
      distance_km: { $round: [{ $divide: ["$distance_from_center", 1000] }, 2] },
      host_name: "$host_doc.name",
      avg_rating: "$review_scores_rating",
      top_3_reviews: "$top_reviews",
    },
  },
  {
    $limit: 3,
  },
]);
```

### Example 2: Analyze Lisbon Host Portfolio

```javascript
db.hosts.aggregate([
  {
    $match: {
      name: /^Lisbon/,
    },
  },
  {
    $lookup: {
      from: "listings",
      localField: "id",
      foreignField: "host_id",
      as: "property_portfolio",
    },
  },
  {
    $unwind: "$property_portfolio",
  },
  {
    $group: {
      _id: null,
      unique_neighbourhoods: { $addToSet: "$property_portfolio.neighbourhood" },
      total_listings: { $sum: 1 },
    },
  },
  {
    $project: {
      _id: 0,
      brand_filter: "Lisbon*",
      total_listings: 1,
      unique_neighbourhoods: 1,
    },
  },
]);
```

### Example 3: Get Best Bang for your Buck

```javascript
db.listings.aggregate([
  {
    $addFields: {
      numeric_price: {
        $toDouble: {
          $trim: {
            input: "$price",
            chars: "€",
          },
        },
      },
    },
  },
  {
    $match: {
      numeric_price: { $gt: 0 },
      review_scores_rating: { $gte: 4.5 },
    },
  },
  {
    $project: {
      _id: 0,
      name: 1,
      formatted_price: "$price",
      rating: "$review_scores_rating",
      capacity: "$accommodates",
      value_score: {
        $round: [
          {
            $divide: [{ $multiply: ["$review_scores_rating", "$accommodates"] }, "$numeric_price"],
          },
          2,
        ],
      },
    },
  },
  {
    $sort: { value_score: -1 },
  },
  {
    $limit: 5,
  },
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
