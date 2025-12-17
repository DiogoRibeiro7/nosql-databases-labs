# Lab 03 – Practice Exercise Solutions

**Business Goal:** Stakeholders demand three high-impact insights from the data platform. The product team needs personalized content feeds that blend editorial priorities (staff picks) with engagement metrics, so the recommendation aggregation surfaces titles likely to drive watch time. The real estate team wants location-aware searches that honour both proximity and amenities, helping customers find the right theaters on mobile. Meanwhile, the risk team must flag fraudulent ticket purchases in near-real time to minimize chargebacks. The queries and indexes provided here are optimized to satisfy those user stories within the existing MongoDB infrastructure.

## Exercise A · Recommendation Feed

Product asked for a feed that balances editorial influence with engagement metrics. The pipeline below filters out titles the user already watched, boosts staff picks, factors in recency via `viewsLast7Days`, and produces a composite `score` field so frontend teams can rank recommendations consistently. Indexes on genres/staff picks keep the sorter efficient even as the catalog grows.

```javascript
const pipeline = [
  { $match: { genres: { $in: user.preferredGenres }, _id: { $nin: user.watchedIds } } },
  {
    $addFields: {
      staffBonus: { $cond: ["$isStaffPick", 2, 0] },
      weeklyWeight: { $divide: ["$viewsLast7Days", 1000] },
      score: { $add: ["$imdb.rating", "$staffBonus", "$weeklyWeight"] },
    },
  },
  { $sort: { score: -1 } },
  { $limit: 20 },
  { $project: { title: 1, genres: 1, score: 1, relatedTitles: 1 } },
];
db.movies_practice.aggregate(pipeline);
```

Indexes:

```javascript
db.movies_practice.createIndex({ genres: 1, isStaffPick: 1, viewsLast7Days: -1 });
db.movies_practice.createIndex({ _id: 1 }); // default for exclusion match
```

## Exercise B · Geo + Text Search Combo

Mobile users search for theaters by both proximity and amenities (e.g., “IMAX recliner”). We import the theater data, create both geo and text indexes, and run a `$geoNear` pipeline that scopes results to a radius while passing the text filter through the `query` parameter. Sorting by text score ensures the best amenity matches rise to the top. Creating an alternate index order demonstrates to the team how compound index order affects planner choices, which is useful during capacity planning.

1. Import data:
   ```javascript
   db.theaters_practice.insertMany(theatersArray);
   db.theaters_practice.createIndex({ location: "2dsphere" });
   db.theaters_practice.createIndex({ description: "text", amenities: "text" });
   ```
2. Query:
   ```javascript
   db.theaters_practice.aggregate([
     {
       $geoNear: {
         near: { type: "Point", coordinates: [-9.15, 38.72] },
         distanceField: "distance",
         maxDistance: 10000,
         query: { $text: { $search: '"IMAX recliner"' } },
       },
     },
     { $project: { name: 1, distance: 1, score: { $meta: "textScore" } } },
     { $sort: { score: { $meta: "textScore" } } },
   ]);
   ```
3. Alternative index order (text + geo compound) to show effect on plan:
   ```javascript
   db.theaters_practice.createIndex({ description: "text", location: "2dsphere" });
   ```

## Exercise C · Fraud Detection Rules

Risk analysts flagged two fraud patterns: rapid purchases from the same IP and anomalous ticket prices. We generate synthetic data, index the relevant fields, and run two aggregations. The first groups orders by IP/time bucket to catch bursts (writing matches to `tickets_alerts`). The second calculates daily averages/std devs and flags tickets deviating by ≥3σ, again storing alerts for investigators. These pipelines can be scheduled in the existing job system to feed the fraud dashboard.

1. Insert synthetic data:
   ```javascript
   const bulk = [];
   for (let i = 0; i < 50000; i++) {
     bulk.push({
       ticketId: i,
       price: (Math.random() * 200).toFixed(2),
       userId: `U${Math.floor(Math.random() * 5000)}`,
       paymentMethod: ["card", "paypal"][i % 2],
       ipAddress: `192.168.1.${i % 255}`,
       createdAt: new Date(Date.now() - Math.random() * 86400000),
     });
   }
   db.tickets_practice.insertMany(bulk);
   db.tickets_practice.createIndex({ ipAddress: 1, createdAt: 1 });
   db.tickets_practice.createIndex({ createdAt: 1 });
   ```
2. Rapid IP grouping:
   ```javascript
   db.tickets_practice.aggregate([
     { $match: { createdAt: { $gte: new Date(Date.now() - 5 * 60000) } } },
     {
       $group: {
         _id: {
           ipAddress: "$ipAddress",
           minute: { $dateTrunc: { date: "$createdAt", unit: "minute" } },
         },
         orders: { $sum: 1 },
         tickets: { $push: "$$ROOT" },
       },
     },
     { $match: { orders: { $gte: 3 } } },
     { $merge: { into: "tickets_alerts", whenMatched: "replace" } },
   ]);
   ```
3. Price anomaly detection:
   ```javascript
   db.tickets_practice.aggregate([
     { $match: { createdAt: { $gte: new Date(Date.now() - 86400000) } } },
     {
       $group: {
         _id: { day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } } },
         avgPrice: { $avg: { $toDouble: "$price" } },
         stdDev: { $stdDevPop: { $toDouble: "$price" } },
         tickets: { $push: "$$ROOT" },
       },
     },
     { $unwind: "$tickets" },
     {
       $addFields: {
         deviation: {
           $divide: [
             { $abs: [{ $subtract: [{ $toDouble: "$tickets.price" }, "$avgPrice"] }] },
             "$stdDev",
           ],
         },
       },
     },
     { $match: { deviation: { $gte: 3 } } },
     { $project: { ticket: "$tickets", deviation: 1 } },
     { $merge: { into: "tickets_alerts", whenMatched: "keepExisting" } },
   ]);
   ```
