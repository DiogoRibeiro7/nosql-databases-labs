# Architecture & Data Model

## Domain Snapshot

The Airbnb Clone System manages vacation rentals, host portfolios, and guest reviews across multiple districts (e.g., Porto, Lisbon). The system is designed to handle high-volume geospatial queries and complex analytical aggregations to answer questions such as:

1. Which properties are located within a 5km radius of major city centers (e.g., Avenida dos Aliados)?
2. What are the top-rated listings that accommodate groups of 4 or more?
3. How does the "Value Score" (Quality/Capacity per Euro) vary across different neighbourhoods?
4. What is the market dominance of specific property management brands (e.g., "Lisbon Host" group)?
5. Which listings generate the most engagement in terms of review volume?

## Collections

| Collection  | Role                    | Notes                                                                                       |
| :---------- | :---------------------- | :------------------------------------------------------------------------------------------ |
| `hosts`     | Reference/Master data   | Stores host profiles (`id`, `name`) and metadata (superhost status, location). Normalized to support brand analysis. |
| `listings`  | Fact/Inventory data     | Represents rental units with geospatial data (`location`), capacity, pricing, and foreign key to `hosts`. |
| `reviews`   | Fact/Transactional data | Captures individual guest feedback linked to a specific listing. Kept separate to ensure scalability. |

### Schema Highlights

```javascript
// hosts
{
  _id: ObjectId("..."),
  id: 1001,                             // Unique integer ID (Foreign Key target)
  name: "Porto_Host_1",
  email: "porto_host_1@gmail.com",
  phone: "+351 912 345 678",
  location: "Porto, Portugal",
  is_superhost: true,
  join_date: "2018-05-20"
}

// listings
{
  _id: ObjectId("..."),
  id: 10001,                            // Unique Listing ID
  host_id: 1001,                        // Reference to hosts.id
  name: "Charming Porto Apartment 1",
  neighbourhood: "Ribeira",
  location: {                           // GeoJSON for Spatial Queries
    type: "Point",
    coordinates: [-8.6109, 41.1496]     // [Longitude, Latitude]
  },
  room_type: "Entire home/apt",
  price: "€40",                         // Stored as string, converted at query time
  accommodates: 2,
  bedrooms: 1,
  beds: 1,
  review_scores_rating: 4.8,
  availability_365: 180
}

// reviews
{
  _id: ObjectId("..."),
  id: 1,
  listing_id: 10001,                    // Reference to listings.id
  reviewer_id: 56789,
  reviewer_name: "Alice",
  date: "2023-05-20",
  rating: 5.0,
  comments: "Great place to stay! Very central."
}
```

## Modeling Decisions

1. **Reference-based Host Relationships** – Listings reference hosts via `host_id` (integer) rather than embedding the full host profile. This allows:
   - Efficient updates to host metadata (e.g., "Superhost" status) without rewriting thousands of listing documents.
   - Reduced document size for high-volume listing data.
   - Clear referential integrity for brand analysis queries.

2. **GeoJSON for Location Data** – Coordinates are transformed from raw scalar fields (lat/long) into GeoJSON Point objects. This enables:
   - The use of 2dsphere indexes for high-performance spatial queries.
   - Standardized geospatial calculations (e.g., `$near`, `$geoNear`).
   - Compatibility with external mapping libraries.

3. **Reviews reference listings by listing_id** – Using `listing_id` (integer) instead of embedding an array of review objects provides:
   - Scalability for popular listings that may accumulate thousands of reviews (avoiding the 16MB document limit).
   - Faster read performance for listing details when review text is not immediately needed.

4. **Computed Fields via Aggregation** – Fields like `numeric_price` and `value_score` are calculated on-the-fly via pipelines. This enables:
   - Simple handling of raw string data (e.g., "€50") from imports.
   - Dynamic scoring logic that can be adjusted without mass database updates.
   - Clear separation between storage schema and analytical views.

5. **Separate collections for reference data** – Hosts are treated as a master collection to:
   - Minimize duplication of contact details across properties.
   - Support independent updates to host profiles.
   - Enable efficient lookups via indexed fields.

## Relationships & Access Patterns

- `listings` → `hosts` (N:1 via `host_id`)
- `reviews` → `listings` (N:1 via `listing_id`)

### Primary Query Patterns

- **Geospatial Discovery** – Filter listings by proximity to a specific coordinate (e.g., "Hotels within 5km of City Center").
- **Catalog Aggregation** – Group properties by city or district based on the Host's location metadata using `$lookup`.
- **Portfolio Analytics** – Aggregate inventory statistics (total properties, unique neighbourhoods) for specific property management brands using Regex.
- **Top-Rated Search** – Find high-capacity listings with the highest ratings, sorting by a custom quality metric.
- **Review Highlights** – Retrieve a limited subset (e.g., "Top 5") of reviews for a specific property using efficient lookup pipelines.

## Index Blueprint

Indexes are provisioned via `import_data.js` to strictly follow the ESR (Equality, Sort, Range) rule and support our specific access patterns:

### 1. Hosts Collection

* **`{ id: 1 }` (Unique)** – Name: `idx_hosts_id_unique`
  * **Role:** Critical for the `$lookup` joins. Transforms the "City-by-City Catalog" query from a collection scan into an instant index seek.

* **`{ name: 1 }`** – Name: `idx_hosts_name`
  * **Role:** Supports the "Portfolio Analysis" query, allowing the pipeline to filter hosts by brand name (Regex prefix) before joining with listings.

### 2. Listings Collection

* **`{ id: 1 }` (Unique)** – Name: `idx_listings_id_unique`
  * **Role:** Primary key; ensures data integrity and links reviews to listings.

* **`{ location: "2dsphere", room_type: 1, accommodates: 1 }`** – Name: `idx_geo_hotel_capacity`
  * **Role:** A powerful compound index. It allows the database to filter by distance (Geospatial), Property Type (Equality), and Capacity (Range) simultaneously. Essential for the "Central Group Hotel Search".

* **`{ host_id: 1 }`** – Name: `idx_listings_host_id`
  * **Role:** Foreign key index. Speeds up the retrieval of inventory when querying from the Host perspective.

* **`{ review_scores_rating: -1 }`** – Name: `idx_listings_rating`
  * **Role:** Supports the "Best Value" and "Top Rated" queries by pre-sorting listings by quality.

### 3. Reviews Collection

* **`{ listing_id: 1, rating: -1, date: -1 }`** – Name: `idx_reviews_lookup_optimized`
  * **Role:** The "Perfect Index" for the Highlights pipeline. By including the sort keys (`rating`, `date`) in the index itself, MongoDB can fetch the "Top 5 Reviews" directly from the index tree without needing to load or sort documents in memory.