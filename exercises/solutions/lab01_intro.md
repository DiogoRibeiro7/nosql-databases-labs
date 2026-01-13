# Lab 01 – Practice Exercise Solutions (mongosh)

**Business Goal:** Empower the operations and growth teams to execute three critical workflows with confidence. First, marketing analysts must slice the customer base into actionable segments and generate dashboards that guide campaign spend; the segmentation aggregation addresses that directly. Second, data engineers routinely ingest ad-hoc event files and need a repeatable import/validation flow that enriches and indexes events for downstream queries. Third, instructors and students require a safe “reset” utility that can restore the canonical datasets without corrupting new practice collections, ensuring labs can be replayed and audited at any time. These solutions support those goals while keeping everything reproducible in mongosh.

Switch to the lab database inside mongosh:

```javascript
db = db.getSiblingDB("lab01_student");
```

## Exercise A · Customer Segmentation Dashboard

Marketing needs a sandboxed copy of the core customer data where they can add segmentation attributes without polluting production collections. We first clone `customers` into `customers_marketing`, then run an aggregation that (1) normalizes missing segments to `"unassigned"`, (2) groups by segment to compute average balance/age and audience size, and (3) sorts by popularity so marketers know which cohorts matter. A follow-up `$bucket` pipeline bins users by age ranges, producing the age distribution tables that often drive campaign briefs.

```javascript
db.customers.aggregate([{ $match: {} }, { $out: "customers_marketing" }]);

const report = db.customers_marketing
  .aggregate([
    { $addFields: { segment: { $ifNull: ["$segment", "unassigned"] } } },
    {
      $group: {
        _id: "$segment",
        avgBalance: { $avg: "$balance" },
        avgAge: { $avg: "$age" },
        customers: { $sum: 1 },
      },
    },
    { $project: { _id: 0, segment: "$_id", avgBalance: 1, avgAge: 1, customers: 1 } },
    { $sort: { customers: -1 } },
  ])
  .toArray();

printjson(report);

db.customers_marketing
  .aggregate([
    {
      $bucket: {
        groupBy: "$age",
        boundaries: [18, 25, 35, 45, 60, 120],
        default: "unknown",
        output: { count: { $sum: 1 }, avgBalance: { $avg: "$balance" } },
      },
    },
  ])
  .forEach((doc) => printjson(doc));
```

## Exercise B · Event Log Importer

Third-party tools send NDJSON dumps that must be enriched before analysts query them. The snippet below shows a resilient pattern: read the file, skip blank lines, parse JSON, coerce `eventDate` into a Date (defaulting to “now” if missing), uppercase the city for consistent filtering, and stamp provenance fields (`sourceFile`, `ingestedAt`). After inserting, we create an index on `{ eventType, eventDate }` so downstream dashboards can filter by event types and time ranges without collection scans, and we print the total count as a quick verification step.

```javascript
const file = cat("labs/lab01_intro/sample.json");
const docs = file
  .split("\n")
  .filter((line) => line.trim().length)
  .map((line) => {
    const doc = JSON.parse(line);
    doc.eventDate = doc.eventDate ? new Date(doc.eventDate) : new Date();
    doc.city = doc.city ? doc.city.toUpperCase() : null;
    doc.sourceFile = "sample.json";
    doc.ingestedAt = new Date();
    return doc;
  });

db.event_log.insertMany(docs);
db.event_log.createIndex({ eventType: 1, eventDate: -1 });
print("Inserted docs:", db.event_log.countDocuments());
```

## Exercise C · Reset Utility (mongosh script)

Labs often need a clean slate, but deleting everything risks wiping out practice collections. This mongosh script accepts flags (`keepMarketing`, `seedExtra`) to control which collections are dropped, reloads the canonical dataset by reusing `import_data.js` (which is dual-runtime), optionally seeds extra demo users for experimentation, and prints the final document counts so instructors can confirm the reset before handing the environment back to students.

```javascript
// Run via: mongosh --file reset_lab01_collections.js --eval "keepMarketing=true; seedExtra=true"
db = db.getSiblingDB("lab01_student");

const keepMarketing = typeof keepMarketing !== "undefined" ? keepMarketing : false;
const seedExtra = typeof seedExtra !== "undefined" ? seedExtra : false;

["customers", "event_log"].forEach((coll) => {
  if (db.getCollectionNames().includes(coll)) {
    db[coll].drop();
    print(`Dropped ${coll}`);
  }
});

if (!keepMarketing && db.getCollectionNames().includes("customers_marketing")) {
  db.customers_marketing.drop();
  print("Dropped customers_marketing");
}

load("labs/lab01_intro/import_data.js"); // dual-runtime script

if (seedExtra) {
  db.customers.insertMany([
    {
      customer_id: 9001,
      name: "Bonus User 1",
      city: "Lisbon",
      country: "Portugal",
      age: 29,
      balance: 1200,
    },
    {
      customer_id: 9002,
      name: "Bonus User 2",
      city: "Porto",
      country: "Portugal",
      age: 33,
      balance: 950,
    },
    {
      customer_id: 9003,
      name: "Bonus User 3",
      city: "Madrid",
      country: "Spain",
      age: 41,
      balance: 2100,
    },
  ]);
  print("Seeded extra customers");
}

print("Customers:", db.customers.countDocuments());
print("Event log:", db.event_log.countDocuments());
```
