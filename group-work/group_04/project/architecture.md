# Porto Airbnb Database Architecture

## Overview

This document describes the data model design decisions for the Porto Airbnb listings MongoDB implementation. The design prioritizes query performance for analytical workloads while maintaining data consistency through strategic denormalization.

## Collections

### 1. listings

The main collection storing all property information with embedded host, location, and review data.

```javascript
{
  listing_id: Number,           // Primary identifier
  name: String,                 // Property name
  host: {                       // Embedded host info
    host_id: Number,
    host_name: String
  },
  location: {                   // Embedded location
    neighbourhood: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  room_type: String,            // "Entire home/apt", "Private room", etc.
  price: Decimal128,            // Nightly price in EUR
  price_category: String,       // "budget", "mid-range", "premium", "luxury"
  capacity: {                   // Embedded capacity info
    accommodates: Number,
    bedrooms: Number,
    beds: Number
  },
  booking_rules: {              // Embedded booking rules
    minimum_nights: Number,
    availability_365: Number
  },
  reviews: {                    // Embedded review summary
    number_of_reviews: Number,
    review_scores_rating: Number
  },
  created_at: Date,
  last_update: Date
}
```

**Design Rationale:**
- Host info is embedded since it's frequently accessed with listing data
- Location uses nested structure for geographical queries
- Price category is computed at import time for fast segmentation queries
- Reviews are embedded as summary stats (not individual reviews) for performance

### 2. hosts

Aggregated host collection for host-centric analytics.

```javascript
{
  host_id: Number,              // Primary identifier
  host_name: String,
  listings_count: Number,       // Pre-computed count
  total_capacity: Number,       // Sum of all accommodates
  neighbourhoods: [String],     // Array of unique neighbourhoods
  room_types: [String],         // Array of unique room types
  avg_price: Decimal128,        // Pre-computed average
  created_at: Date
}
```

**Design Rationale:**
- Denormalized from listings for fast host analytics
- Pre-computed aggregates avoid expensive runtime calculations
- Arrays store unique values for portfolio diversity analysis

### 3. bookings

Transactional collection for revenue and booking analytics.

```javascript
{
  booking_id: Number,           // Primary identifier
  listing_id: Number,           // Reference to listing
  listing_name: String,         // Denormalized for display
  host_id: Number,              // Reference to host
  guest: {                      // Embedded guest info
    guest_id: Number,
    guest_name: String
  },
  check_in: Date,
  check_out: Date,
  nights: Number,               // Pre-computed duration
  total_price: Decimal128,      // Pre-computed total
  status: String,               // "completed", "cancelled"
  created_at: Date
}
```

**Design Rationale:**
- Listing name is denormalized to avoid joins in booking lists
- Nights and total_price are pre-computed for aggregation performance
- Guest info is embedded (lightweight profile)
- Status enables filtering completed vs cancelled bookings

## Embedding vs Referencing Decisions

| Relationship | Strategy | Justification |
|--------------|----------|---------------|
| Listing → Host | Embed | Always accessed together, host data is small |
| Listing → Location | Embed | 1:1 relationship, always needed |
| Listing → Reviews | Embed (summary) | Aggregated stats, not full reviews |
| Booking → Listing | Reference + Denormalize name | Need listing_id for joins, name for display |
| Booking → Guest | Embed | Lightweight, always accessed together |
| Host → Listings | Reference (via host_id) | Many listings per host, separate aggregation needs |

## Index Strategy

### listings Collection

| Index | Fields | Purpose |
|-------|--------|---------|
| idx_listing_id | `{ listing_id: 1 }` | Primary lookups (unique) |
| idx_neighbourhood | `{ "location.neighbourhood": 1 }` | Geographic filtering |
| idx_price | `{ price: 1 }` | Price range queries |
| idx_price_category_price | `{ price_category: 1, price: 1 }` | Segment analysis |
| idx_room_type_price | `{ room_type: 1, price: 1 }` | Room type analytics |
| idx_reviews_count | `{ "reviews.number_of_reviews": -1 }` | Popularity ranking |
| idx_rating | `{ "reviews.review_scores_rating": -1 }` | Quality filtering |
| idx_availability | `{ "booking_rules.availability_365": -1 }` | Availability analysis |
| idx_host_id | `{ "host.host_id": 1 }` | Host lookups |
| idx_neighbourhood_roomtype_price | Compound | Complex filtering |
| idx_listing_name_text | Text | Full-text search |

### hosts Collection

| Index | Fields | Purpose |
|-------|--------|---------|
| idx_host_id | `{ host_id: 1 }` | Primary lookups (unique) |
| idx_listings_count | `{ listings_count: -1 }` | Top hosts ranking |
| idx_avg_price | `{ avg_price: -1 }` | Price tier analysis |

### bookings Collection

| Index | Fields | Purpose |
|-------|--------|---------|
| idx_booking_id | `{ booking_id: 1 }` | Primary lookups (unique) |
| idx_booking_listing_id | `{ listing_id: 1 }` | Listing revenue analysis |
| idx_booking_host_id | `{ host_id: 1 }` | Host revenue analysis |
| idx_booking_status | `{ status: 1 }` | Status filtering |
| idx_check_in_date | `{ check_in: -1 }` | Temporal queries |
| idx_status_listing | `{ status: 1, listing_id: 1 }` | Completed bookings per listing |
| idx_status_date_revenue | Compound | Revenue aggregations |
| idx_guest_id | `{ "guest.guest_id": 1 }` | Guest history |

## Query Optimization Patterns

### 1. Covered Queries

For listing summaries, project only indexed fields:

```javascript
db.listings.find(
  { "location.neighbourhood": "Baixa" },
  { listing_id: 1, name: 1, price: 1, _id: 0 }
).hint("idx_neighbourhood")
```

### 2. Aggregation Pipeline Optimization

Place `$match` stages early to reduce documents processed:

```javascript
db.bookings.aggregate([
  { $match: { status: "completed" } },  // Filter first
  { $group: { ... } }
])
```

### 3. $lookup Optimization

Ensure foreign field is indexed:

```javascript
// idx_listing_id on listings.listing_id enables efficient lookup
{ $lookup: { from: "listings", localField: "listing_id", foreignField: "listing_id", as: "listing" } }
```

## Performance Considerations

1. **Price Storage**: Using `Decimal128` for monetary values ensures precision
2. **Pre-computed Fields**: `price_category`, `nights`, `total_price` avoid runtime calculations
3. **Array Limits**: Host `neighbourhoods` and `room_types` arrays are bounded by Porto geography
4. **Temporal Indexes**: Descending order for `check_in` optimizes "most recent" queries

## Data Integrity

- **listing_id**, **host_id**, **booking_id**: Unique indexes prevent duplicates
- **Referential integrity**: Application-level (MongoDB doesn't enforce foreign keys)
- **Schema validation**: Can be added via `db.createCollection()` with validators

## Future Enhancements

1. **Geospatial Index**: Add `2dsphere` index on coordinates for proximity queries
2. **TTL Index**: Auto-expire old bookings for data retention
3. **Change Streams**: Real-time booking notifications
4. **Time Series**: Convert bookings to time series collection for analytics
