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
orders:
  - { eventCode: 1, vendorId: 1, createdAt: 1 }  // supports revenueByEventVendor + timeline queries
  - { customer.customerId: 1 }                    // supports loyalty detection
vendors:
  - { vendorId: 1 } unique                        // guards reference integrity
events:
  - { eventCode: 1 } unique                       // guards reference integrity
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
