# Lab 04 – Basic Aggregation Exercises

Warm up with these short pipelines (≈30 minutes total) before building the full analytics suite.

---

## Exercise 1: Count and Sum Basics

```javascript
db.sales.aggregate([
  { $match: { status: "Completed" } },
  { $group: { _id: null, totalOrders: { $sum: 1 }, totalRevenue: { $sum: "$amount" } } }
])
```

1. Run the pipeline, note the totals in `NOTES.md`.
2. Remove the `$match` stage and compare the difference.

## Exercise 2: Simple Lookup

1. Join sales with products to show `product.name` alongside `amount`.
2. Keep only the first 5 documents (use `$limit`).
3. Save the pipeline as `basic_lookup.js`.

## Exercise 3: Customer Segments Snapshot

1. Group customers by `segment`.
2. Calculate `avgLifetimeValue` and `customerCount`.
3. Sort descending by `avgLifetimeValue`.

## Exercise 4: Explain Metrics

1. Pick your most complex pipeline above.
2. Run `.explain()` to inspect whether MongoDB can use indexes; capture `stages` summary in `NOTES.md`.

---

These exercises help ensure your aggregation syntax is solid before tackling window functions, complex lookups, and analytics deliverables.
