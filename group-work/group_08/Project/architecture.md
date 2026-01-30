# Architecture & Data Model

## Domain Snapshot

The municipality sponsors weekend night markets. Each event hosts 3–4 rotating vendors and generates hundreds of small basket orders. The project needs to answer:

1. Which vendors drive the most revenue per hour?
2. How do wait times vary by event/vendor pair?
3. Which neighborhoods deliver the highest repeat attendance?

## Collections

| Collection | Role | Notes |
| ---------- | ---- | ----- |
| `student` | Reference/master data | Stable identifiers (`studentCode`) enriched with demographic attributes, enrollment status, and grade-level or section metadata. |
| `class` | Semi-static reference data | Represents subjects or courses; embeds instructor, term, and schedule details to avoid additional joins during reporting. |
| `grades` | Fact/telemetry | Each document records a student’s grade for a specific class or assessment, including score, grading period, and basic performance context. |
|

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

- `grades` → `student` (N:1 via `studentCode`).
- `grades` → `subject` (N:1 via `subjectCode`).
- Most reports aggregate grades grouped by student, subject, teacher, or term to compute averages and rankings.
- Occasional admin tasks filter by student attributes (for example, gender or address) or by subject metadata (for example, teacher or credits).

## Index Blueprint

- `grades` composite index `{ studentCode: 1, subjectCode: 1 }` – supports efficient lookups of a student's grades per subject and avoids collection scans in analytic pipelines.
- `student` unique index `{ studentCode: 1 }` – allows fast lookups and ensures stable external identifiers when importing data.
- `subject` unique index `{ subjectCode: 1 }` – prevents accidental duplicates when importing subject data from spreadsheets.

Indexes are created in `queries/import_data.mongosh.js` so they are reapplied automatically whenever the seed script is run.