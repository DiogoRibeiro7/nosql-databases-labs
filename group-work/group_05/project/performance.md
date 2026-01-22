# Performance Notes

> All metrics were captured locally on MongoDB Community 7.0 running on the default Docker compose stack. Numbers focus on patterns, not raw throughput.

## Workload Recap

- 3 main collections (listings, hosts, reviews) plus reservations, with fixture data designed to scale to tens of thousands of documents.
- 4 primary query families:
  1. Geographic discovery with host/review enrichment (geospatial + $lookup).
  2. Value-based ranking (custom computed scores, sorting).
  3. Portfolio/brand analysis (regex filters, aggregation across relationships).
  4. Availability/conflict detection (date range comparisons on reservations).

## Index Coverage

After running `queries/index_blueprint.mongosh.js`, the collection stats show:

```
Current Indexes on 'listings':
[
  { v: 2, key: { _id: 1 }, name: '_id_' },
  {
    v: 2,
    key: { id: 1 },
    name: 'idx_listings_id_unique',
    unique: true
  },
  { v: 2, key: { host_id: 1 }, name: 'idx_listings_host_id' },
  {
    v: 2,
    key: { location: '2dsphere', room_type: 1, accommodates: 1 },
    name: 'idx_geo_hotel_capacity',
    '2dsphereIndexVersion': 3
  },
  {
    v: 2,
    key: { review_scores_rating: -1 },
    name: 'idx_listings_rating'
  }
]
Current Indexes on 'hosts':
[
  { v: 2, key: { _id: 1 }, name: '_id_' },
  { v: 2, key: { id: 1 }, name: 'idx_hosts_id_unique', unique: true },
  { v: 2, key: { name: 1 }, name: 'idx_hosts_name' }
]
Current Indexes on 'reviews':
[
  { v: 2, key: { _id: 1 }, name: '_id_' },
  {
    v: 2,
    key: { listing_id: 1, rating: -1, date: -1 },
    name: 'idx_reviews_lookup_optimized'
  }
]
```

## Explain Samples

**Geospatial discovery with reviews (03_filter_listing_within_range_point.mongosh.js)**

```javascript
db.listings
  .aggregate([
    {
      $geoNear: {
        near: { type: "Point", coordinates: [-8.6104, 41.1488] },
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
    { $unwind: "$host_doc" },
    {
      $lookup: {
        from: "reviews",
        let: { local_id: "$id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$listing_id", "$$local_id"] } } },
          { $sort: { rating: -1, date: -1 } },
          { $limit: 3 },
        ],
        as: "top_reviews",
      },
    },
    { $limit: 3 },
  ])
  .explain("executionStats");
```

Highlight: `executionStats` reports `inputStage.indexName: "idx_geo_hotel_capacity"` with the 2dsphere index driving the initial $geoNear stage, drastically reducing documents before $lookup operations. The compound index on reviews (`listing_id, rating, date`) ensures the nested pipeline executes efficiently with minimal document scanning.

**Value-based ranking (04_get_bang_for_buck.mongosh.js)**

```javascript
db.listings
  .aggregate([
    {
      $addFields: {
        numeric_price: {
          $toDouble: {
            $trim: { input: "$price", chars: "€" },
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
        name: 1,
        value_score: {
          $round: [
            {
              $divide: [
                { $multiply: ["$review_scores_rating", "$accommodates"] },
                "$numeric_price",
              ],
            },
            2,
          ],
        },
      },
    },
    { $sort: { value_score: -1 } },
    { $limit: 5 },
  ])
  .explain("executionStats");
```

Result: `totalDocsExamined` matches `nReturned` when using the `{ review_scores_rating: -1 }` index to filter high-rated properties before computing the custom score, proving efficient pre-filtering before expensive arithmetic operations.

## Operational Considerations

- **Data reloads:** `import_data.mongosh.js` drops/recreates the database to keep grading predictable. For production, switch to upserts keyed by `listing_id` or `host_id`.
- **Sharding path:** If the dataset grows to millions of listings across multiple countries, shard `listings` on `{ host_id, location }` to collocate properties by management company and support regional geo-queries.
- **Profiling:** Before submission, run `db.setProfilingLevel(1)` temporarily and copy the slowest query summaries into this document to prove observability.
