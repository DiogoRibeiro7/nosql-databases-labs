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

### Schema Highlights

// listings
{
\_id: ObjectId,
name: String,
host: {
id: String,
name: String
},
location: {
neighbourhood: String,
coordinates: {
type: "Point",
coordinates: [lon, lat]
}
},
pricing: {
daily_price: Number
},
details: {
room_type: String
},
reviews: {
rating: Number,
count: Number
},
availability: {
days_available_365: Number
}
}

// bookings
{
\_id: ObjectId,
listing_id: ObjectId, // reference to listings.\_id
host_id: String, // denormalized for host-level rollups
booking_date: ISODate,
status: "confirmed" | "completed" | "cancelled",
nights: Number,
total_price: Number,
total_revenue: Number // optional: stored to simplify revenue aggregations
}

// hosts
{
\_id: ObjectId,
host_id: String, // stable external identifier
name: String,
listings_count: Number, // number of active listings
avg_price: Number, // average daily price across listings
total_revenue: Number // optional denormalized metric for analytics
}

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
