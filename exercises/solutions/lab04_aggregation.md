# Lab 04 – Practice Exercise Solutions

**Business Goal:** Executive leadership relies on timely analytics to steer churn mitigation, merchandising, and reliability initiatives. Finance needs recurring revenue cohorts to understand retention and forecast renewals. Merchandising teams want evidence of which item combinations drive incremental sales so they can adjust promotions or bundling. Site Reliability Engineering needs automated uptime summaries with actionable alerts to maintain SLAs. The aggregation pipelines here produce those metrics straight from operational collections, shortening the path from raw data to business action.

## Exercise A · Subscription Revenue Cohorts

Finance wants monthly recurring revenue and cohort retention metrics without exporting to spreadsheets. The aggregation groups subscriptions by month/plan, sums revenue, counts active vs churned users, and computes retained percentages before merging the results into `subscriptions_reports`. This gives analysts a queryable table that powers dashboards or CSV exports.

```javascript
db.subscriptions_practice.insertMany([
  {
    userId: "U1",
    plan: "pro",
    price: 40,
    startedAt: ISODate("2025-01-05"),
    renewedAt: ISODate("2025-02-05"),
    canceledAt: null,
  },
  {
    userId: "U2",
    plan: "basic",
    price: 15,
    startedAt: ISODate("2025-01-10"),
    renewedAt: ISODate("2025-02-10"),
    canceledAt: ISODate("2025-02-20"),
  },
]);

const mrrPipeline = [
  {
    $group: {
      _id: { month: { $dateTrunc: { date: "$renewedAt", unit: "month" } }, plan: "$plan" },
      mrr: { $sum: "$price" },
      activeUsers: { $sum: { $cond: [{ $not: ["$canceledAt"] }, 1, 0] } },
      churnedUsers: { $sum: { $cond: ["$canceledAt", 1, 0] } },
    },
  },
  {
    $addFields: {
      retainedPercent: {
        $cond: [
          { $eq: ["$activeUsers", 0] },
          0,
          {
            $multiply: [
              { $divide: ["$activeUsers", { $add: ["$activeUsers", "$churnedUsers"] }] },
              100,
            ],
          },
        ],
      },
    },
  },
  {
    $merge: {
      into: "subscriptions_reports",
      on: "_id",
      whenMatched: "replace",
      whenNotMatched: "insert",
    },
  },
];
db.subscriptions_practice.aggregate(mrrPipeline);
```

## Exercise B · Retail Basket Analysis

Merchandising needs to know which SKUs drive revenue and which combinations commonly appear together. The sample pipeline explodes items to compute revenue per SKU, uses `$setWindowFields` for basket percentiles, and demonstrates how to generate pair-wise combinations to approximate market-basket analysis. These outputs help decide cross-sell placements on the storefront.

```javascript
const comboPipeline = [
  { $unwind: "$items" },
  { $set: { items: "$items.sku" } },
  {
    $group: {
      _id: "$orderId",
      skus: { $addToSet: "$items" },
    },
  },
  { $project: { pairs: { $setIntersection: ["$skus", "$skus"] } } }, // placeholder for cartesian pairs
  { $unwind: "$pairs" },
];
```

For actual pair detection, generate combinations:

```javascript
db.orders_practice.aggregate([
  { $unwind: "$items" },
  {
    $group: {
      _id: "$orderId",
      items: { $push: "$items.sku" },
    },
  },
  {
    $project: {
      pairs: {
        $map: {
          input: { $range: [0, { $size: "$items" }] },
          as: "i",
          in: {
            $map: {
              input: { $range: [{ $add: ["$$i", 1] }, { $size: "$items" }] },
              as: "j",
              in: {
                first: { $arrayElemAt: ["$items", "$$i"] },
                second: { $arrayElemAt: ["$items", "$$j"] },
              },
            },
          },
        },
      },
    },
  },
  { $unwind: "$pairs" },
  { $unwind: "$pairs" },
  { $group: { _id: "$pairs", count: { $sum: 1 } } },
  { $sort: { count: -1 } },
  { $limit: 5 },
]);
```

Percentiles on basket size:

```javascript
db.orders_practice.aggregate([
  {
    $setWindowFields: {
      partitionBy: null,
      sortBy: { _id: 1 },
      output: {
        p50: { $percentile: { input: "$itemsCount", method: "approximate", p: [0.5] } },
        p90: { $percentile: { input: "$itemsCount", method: "approximate", p: [0.9] } },
      },
    },
  },
]);
```

## Exercise C · Uptime Monitoring

SRE requires rolling 5-minute uptime reports with latency flags. The pipeline groups heartbeats into 5-minute bins, calculates uptime percentage and P95 latency, and writes actionable alerts (with suggested mitigations) into `uptime_alerts`. Because the data stays in MongoDB, the existing observability tooling can query it alongside other lab datasets.

```javascript
db.uptime_practice.aggregate([
  {
    $group: {
      _id: {
        service: "$service",
        region: "$region",
        window: { $dateTrunc: { date: "$timestamp", unit: "minute", binSize: 5 } },
      },
      total: { $sum: 1 },
      healthy: { $sum: { $cond: [{ $eq: ["$status", "up"] }, 1, 0] } },
      latencyP95: { $percentile: { input: "$latencyMs", method: "approximate", p: [0.95] } },
    },
  },
  {
    $addFields: {
      uptimePercent: { $multiply: [{ $divide: ["$healthy", "$total"] }, 100] },
      latencyP95: { $arrayElemAt: ["$latencyP95", 0] },
      alert: {
        $or: [
          { $gt: [{ $arrayElemAt: ["$latencyP95", 0] }, 500] },
          { $lt: ["$uptimePercent", 99.5] },
        ],
      },
    },
  },
  { $match: { alert: true } },
  {
    $project: {
      service: "$_id.service",
      region: "$_id.region",
      window: "$_id.window",
      uptimePercent: 1,
      latencyP95: 1,
      mitigation: {
        $cond: [
          { $lt: ["$uptimePercent", 99.5] },
          "Investigate outages / restart service",
          "Investigate latency spike",
        ],
      },
    },
  },
  {
    $merge: {
      into: "uptime_alerts",
      on: ["service", "region", "window"],
      whenMatched: "replace",
      whenNotMatched: "insert",
    },
  },
]);
```
