# Performance Notes

> All metrics were captured locally on MongoDB Community 7.0 running on the default Docker compose stack. Numbers focus on patterns, not raw throughput.

## Workload Recap

- 3 collections, 34 orders (fixture) but scripts expect tens of thousands once students scale up.
- 4 primary query families:
  1. Revenue and satisfaction by `eventCode` × `vendorId`.
  2. Repeat visitor detection (grouping by `customer.customerId`).
  3. Neighborhood heatmaps (grouping by `customer.district`).
  4. Rolling-hour service metrics (bucket by `createdAt`).

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

**Revenue by event/vendor pipeline**

```javascript
db.orders
  .aggregate([
    {
      $group: {
        _id: { event: "$eventCode", vendor: "$vendorId" },
        revenue: { $sum: "$totalAmount" },
        avgWait: { $avg: "$waitTimeMinutes" },
      },
    },
    { $sort: { revenue: -1 } },
  ])
  .explain("executionStats");
```

Highlight: `executionStats` reports `inputStage.indexName: "eventCode_1_vendorId_1_createdAt_1"` with `totalDocsExamined` matching `nReturned`, indicating a fully covered read (no COLLSCAN).

**Loyalty tracker**

```javascript
db.orders
  .aggregate([
    {
      $group: {
        _id: "$customer.customerId",
        visits: { $sum: 1 },
        districts: { $addToSet: "$customer.district" },
        lastVisit: { $max: "$createdAt" },
      },
    },
    { $match: { visits: { $gte: 2 } } },
    { $sort: { lastVisit: -1 } },
  ])
  .explain("executionStats");
```

Result: `totalDocsExamined` equals `nReturned` with the `{ customer.customerId: 1 }` index, so loyalty lookups scale linearly with the number of engaged visitors.

## Operational Considerations

- **Data reloads:** `import_data.mongosh.js` drops/recreates the database to keep grading predictable. For production, switch to upserts keyed by `vendorId`/`eventCode`.
- **Sharding path:** If the dataset grows to millions of orders per city, shard `orders` on `{ eventCode, createdAt }` to collocate event traffic and support time-series dashboards.
- **Profiling:** Before submission, run `db.setProfilingLevel(1)` temporarily and copy the slowest query summaries into this document to prove observability.
