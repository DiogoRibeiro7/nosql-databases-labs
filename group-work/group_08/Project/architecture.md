# Architecture & Data Model

## Domain Snapshot

The municipality sponsors weekend night markets. Each event hosts 3–4 rotating vendors and generates hundreds of small basket orders. The project needs to answer:

1. Which vendors drive the most revenue per hour?
2. How do wait times vary by event/vendor pair?
3. Which neighborhoods deliver the highest repeat attendance?

## Collections

| Collection | Role | Notes |
| ---------- | ---- | ----- |
| `student` | Reference/master data | Stable identifiers (`studentCode`) enriched with operational capacity, tier, and featured items. |
| `class` | Semi-static reference data | Embeds venue details to avoid additional joins during reporting. |
| `grades` | Fact/telemetry | Each document captures the sales basket, wait time, payment method, and minimal customer segmentation. |

### Schema Highlights

```javascript
// students
{
  _id: ObjectId,
  studentCode: "STU-002",
  name: "Aimee Zank",
  gender: "male",
  address: "123 Maple Street, Austin, TX",
  email: "aimee.zank@example.com",
  phone_number: "+1-512-555-0101"
}

// subject
{
  _id: ObjectId,
  subjectCode: "SUB-002",
  name: "English Literature",
  code: "ENG102",
  teacher: "Ms. Roberts",
  credits:  Number
  },
}

// grades
{
  _id: ObjectId,
  gradeCode: "GRD-001",
  studentCode: "STU-001",
  subjectCode: "SUB-001",
  score: Number
}
```

### Modeling Decisions

1. **Event venue embedded** – Venues rarely change per event, so embedding reduces lookups and keeps slides self-explanatory.
2. **Customer dimension kept minimal** – Only coarse-grained data (district + loyalty flag) is stored to avoid PII, yet still supports segmentation.
3. **Order items embedded** – Orders are short-lived analytics data; embedding keeps totals and averages in a single document for faster aggregations.

## Relationships & Access Patterns

- `orders` → `events` (N:1 via `eventCode`).
- `orders` → `vendors` (N:1 via `vendorId`).
- Most dashboards aggregate orders grouped by event, vendor, district, or time windows.
- Rare admin tasks filter by `partnershipTier` or `sustainabilityTier`.

## Index Blueprint

- `grades` composite index `{ studentCode: 1, subjectCode: 1, createdAt: 1 }` – supports top-line KPI rollups and chronological trend charts.
- `student` index `{ studentCode: 1 }` – allows deduplicating visitors without scanning the entire collection.
- `subject` unique index `{ subjectCode: 1 }` and `events` unique index `{ eventCode: 1 }` – prevents accidental duplicates when importing data from spreadsheets.

Indexes are provisioned via `queries/index_blueprint.mongosh.js` so students can reapply them after a drop/reload cycle.