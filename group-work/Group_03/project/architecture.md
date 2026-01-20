# Architecture & Data Model

## Domain Snapshot

This project analyzes Lisbon Airbnb listings, hosts and bookings to answer operational
and commercial questions such as revenue by neighbourhood, host performance, listing
availability, and trend detection. Key business drivers in the supplied scripts are:

1. Identify top-performing listings and hosts for partnerships and incentives.
2. Measure neighbourhood-level revenue and price signals for local strategies.
3. Monitor availability and booking trends to inform promotions and capacity planning.

## Collections

| Collection | Role                    | Notes                                                                  |
| ---------- | ----------------------- | ---------------------------------------------------------------------- |
| `listings` | Reference / master data | Listing metadata, pricing, reviews, location and embedded host summary |
| `bookings` | Fact / event stream     | Each booking/transaction with status, nights, prices and dates         |
| `hosts`    | Reference / analytics   | Host-level aggregates and portfolio metadata                           |

### Collection Schemas

1. `listings`
   The main collection storing all property information with embedded host, location, and review data.

```
{
listing_id: Number, // Primary identifier
name: String, // Property name
host: { // Embedded host info
host_id: Number,
host_name: String
},
location: { // Embedded location
neighbourhood: String,
coordinates: {
latitude: Number,
longitude: Number
}
},
room_type: String, // "Entire home/apt", "Private room", etc.
price: Decimal128, // Nightly price in EUR
price_category: String, // "budget", "mid-range", "premium", "luxury"
capacity: { // Embedded capacity info
accommodates: Number,
bedrooms: Number,
beds: Number
},
booking_rules: { // Embedded booking rules
minimum_nights: Number,
availability_365: Number
},
reviews: { // Embedded review summary
number_of_reviews: Number,
review_scores_rating: Number
},
created_at: Date,
last_update: Date
}
```

Design Rationale:

- Host info is embedded since it's frequently accessed with listing data
- Location uses nested structure for geographical queries
- Price category is computed at import time for fast segmentation queries
- Reviews are embedded as summary stats (not individual reviews) for performance

2. `hosts`
   Aggregated host collection for host-centric analytics.

```
{
host_id: Number, // Primary identifier
host_name: String,
listings_count: Number, // Pre-computed count
total_capacity: Number, // Sum of all accommodates
neighbourhoods: [String], // Array of unique neighbourhoods
room_types: [String], // Array of unique room types
avg_price: Decimal128, // Pre-computed average
created_at: Date
}

Design Rationale:

- Denormalized from listings for fast host analytics
- Pre-computed aggregates avoid expensive runtime calculations
- Arrays store unique values for portfolio diversity analysis
```

3. `bookings`
   Transactional collection for revenue and booking analytics.

```
{
booking_id: Number, // Primary identifier
listing_id: Number, // Reference to listing
listing_name: String, // Denormalized for display
host_id: Number, // Reference to host
guest: { // Embedded guest info
guest_id: Number,
guest_name: String
},
check_in: Date,
check_out: Date,
nights: Number, // Pre-computed duration
total_price: Decimal128, // Pre-computed total
status: String, // "completed", "cancelled"
created_at: Date
}
```

Design Rationale:

- Keep high-volume transactional booking events separate from `listings` to avoid growth and update contention
- Denormalize `listing_name` and `host_id` to simplify reporting and reduce lookups when presenting booking summaries
- Store pre-computed totals and durations to speed up aggregations

## Embedding vs Referencing Decisions

| Decision Area            | Approach    | Rationale                                                                                                        |
| ------------------------ | ----------- | ---------------------------------------------------------------------------------------------------------------- |
| Host summary in listings | Embedding   | Frequently accessed host name and id are embedded in listings to avoid lookups during read-heavy listing queries |
| Reviews in listings      | Embedding   | Review counts and ratings are read often and change infrequently                                                 |
| Bookings → listings      | Referencing | High-volume transactional data kept separate to avoid document growth                                            |
| Bookings → hosts         | Referencing | Enables host-level aggregation without duplicating large datasets                                                |
| Geo location data        | Embedding   | Required for potential geospatial queries and indexing                                                           |

## Index Strategy

### Listings Collection

| Index                                    | Purpose                              |
| ---------------------------------------- | ------------------------------------ |
| `{ location.neighbourhood: 1 }`          | Fast neighbourhood-level aggregation |
| `{ price: 1 }`                           | Price-based filtering and sorting    |
| `{ room_type: 1 }`                       | Room-type analysis                   |
| `{ host.host_id: 1 }`                    | Host portfolio queries               |
| `{ booking_rules.availability_365: -1 }` | Availability ranking                 |

### Bookings Collection

| Index                 | Purpose                  |
| --------------------- | ------------------------ |
| `{ listing_id: 1 }`   | Join with listings       |
| `{ host_id: 1 }`      | Host revenue aggregation |
| `{ status: 1 }`       | Booking status filtering |
| `{ check_in: 1 }`     | Time-series analysis     |
| `{ total_price: -1 }` | Revenue-based ranking    |

### Hosts Collection

| Index                    | Purpose                |
| ------------------------ | ---------------------- |
| `{ host_id: 1 }`         | Fast host lookup       |
| `{ listings_count: -1 }` | Portfolio size ranking |
| `{ avg_price: -1 }`      | Premium host detection |

## Modeling Decisions

- Listings are the canonical reference for property metadata and are kept relatively
  stable; host minimal info is embedded in `listings.host` for quick reads.
- Bookings are the immutable facts (telemetry) that reference listings by `_id`.
  This keeps write volume lower on the master listing documents and fits the
  analytical patterns in the `queries/` scripts (lookups and group-by operations).
- Location (GeoJSON) is embedded in `listings.location` to support geospatial
  queries and neighbourhood aggregations without extra joins.

## Relationships & Access Patterns

- `bookings` → `listings` via `listing_id` (many-to-one)  
  Many analytical queries start from the `bookings` collection (revenue, trends, demand)
  and use `$lookup` to access listing-level context such as neighbourhood, room type,
  and pricing.

- `listings` → `hosts` via embedded `host.id`  
  A lightweight host summary (id and name) is embedded directly in `listings` to avoid
  joins during read-heavy listing and neighbourhood analyses.

- `bookings` → `hosts` via `host_id` (denormalized reference)  
  The `host_id` field is duplicated in `bookings` to enable efficient host-level revenue
  and booking aggregations without requiring joins to the `listings` collection.

### Common Access Patterns

- Revenue and booking counts grouped by:
  - `listing_id`
  - `host_id`
  - `listing.location.neighbourhood`
- Ranking and filtering listings by `reviews.count` and `reviews.rating`
- Availability and pricing summaries per neighbourhood and room type
- Monthly and temporal trend analysis using `booking_date` with `$dateToString`
- Host performance evaluation combining inventory size and total revenue

## Index Blueprint

The project includes an idempotent index creation script
(`queries/index_blueprint.mongosh.js`).  
The following indexes reflect the query patterns used throughout the project and
significantly improve aggregation and lookup performance.

### Listings Collection

- `{ "location.coordinates": "2dsphere" }`  
  Supports geospatial queries and proximity-based analysis.
- `{ "pricing.daily_price": 1 }`  
  Accelerates price range filters and sort-by-price queries.
- `{ "location.neighbourhood": 1 }`  
  Improves performance of neighbourhood-level aggregations.
- `{ "reviews.rating": -1, "reviews.count": -1 }`  
  Optimizes ranking queries for top-rated and most-reviewed listings.
- `{ "host.id": 1 }`  
  Enables efficient per-host listing aggregations.
- `{ name: "text" }`  
  Supports keyword-based text search on listing names.

### Bookings Collection

- `{ listing_id: 1 }`  
  Required for joins and revenue aggregation by listing.
- `{ host_id: 1 }`  
  Supports host-level revenue and booking analysis.
- `{ booking_date: 1 }`  
  Optimizes time-series queries and trend calculations.
- `{ status: 1 }`  
  Allows fast filtering of confirmed and completed bookings.

### Hosts Collection

- `{ host_id: 1 }`  
  Fast host lookup and joins from listings and bookings.
- `{ listings_count: -1 }`  
  Efficient ranking of hosts by portfolio size.
- `{ avg_price: -1 }`  
  Identifies hosts with premium pricing strategies.

## Operational Notes

- The supplied `import_data.mongosh.js` sample loads `data/sample_lisbon_listings.json`
  and generates mock `bookings` for analytics; run it to create a working dataset.
- Scripts are built to be runnable with `mongosh --quiet --file <script>`; if you use
  `load()` interactively, add `null;` to the end of a script to avoid the loader
  echoing `true` in the shell.
