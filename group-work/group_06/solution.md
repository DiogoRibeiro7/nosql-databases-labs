# Group 06 - NoSQL Lab Submission

## Group Information

**Group Number:** group_06
**Submission Date:** 2026-01-22
**Lab Assignment:** MongoDB Database Operations Lab

### Team Members

| Name | Student ID | Email | Contribution % |
| ---- | ---------- | ----- | -------------- |
| Pedro Castro | 40240400 | 40240400@esmad.ipp.pt | TBD |
| Rodrigo Gonçalves | 40240398 | 40240398@esmad.ipp.pt | TBD |
| Tiago Gonçalves | 40240199 | 40240199@esmad.ipp.pt | TBD |

**Total:** 100%

---

## Executive Summary

Provide a concise overview of the scenario, dataset, and primary achievements for the lab so reviewers can understand the submission without opening other files.

---

## Problem Statement

Summarize the lab brief, the business goals, and the constraints that shaped the MongoDB design decisions.

### Requirements

- [ ] Requirement 1 – define the workload and data domain
- [ ] Requirement 2 – outline CRUD/aggregation capabilities
- [ ] Requirement 3 – capture validation, indexing, or performance goals
- [ ] Requirement 4 – document stretch objectives agreed with the staff

---

## Solution Architecture

### Data Model Design

```javascript
{
  collection: "example",
  schema: {
    _id: "ObjectId",
    fields: [
      { name: "fieldA", type: "string" },
      { name: "fieldB", type: "int" },
      { name: "fieldC", type: "array" }
    ]
  }
}
```

Describe entity boundaries, embedding vs. referencing choices, and how the schema satisfies the requirements.

### Design Decisions

1. **Document modeling** – explain how documents were structured to optimize reads/writes.
2. **Indexing strategy** – note which indexes back the core workloads.
3. **Validation & governance** – capture schema validation, security, or lifecycle policies.

### Trade-offs Considered

| Approach | Pros | Cons | Decision |
| -------- | ---- | ---- | -------- |
| Embedding | Fast reads, single document writes | Larger documents, potential duplication | Selected for read-heavy collections |
| Referencing | Normalized data, smaller docs | Requires joins via `$lookup` | Used where relationships are optional |

---

## Implementation

### Setup Instructions

```bash
npm install
mongosh < import_data.js
node queries.js
```

Clarify environment prerequisites, scripts to run, and configuration secrets (if any) in this section.

### Core Queries

#### Query 1 – Describe the business question

```javascript
db.collection.find({
  status: "active",
  createdAt: { $gte: ISODate("2024-01-01") },
}).sort({ createdAt: -1 });
```

- Expected Output: summarize the shape of the dataset returned.
- Performance Metrics: include `executionStats`, document counts, and index usage.

#### Query 2 – Aggregation pipeline example

```javascript
db.collection.aggregate([
  { $match: { type: "event" } },
  { $group: { _id: "$category", total: { $sum: 1 } } },
  { $sort: { total: -1 } }
]);
```

#### Query 3 – Update/write example

```javascript
db.collection.updateMany(
  { flag: true },
  { $set: { reviewedAt: new Date() } }
);
```

Document any helper scripts or stored procedures needed to run these queries.

---

## Testing

### Test Strategy

Describe functional, integration, and performance testing performed locally or in CI.

### Test Results

| Test Case | Description | Expected | Actual | Status |
| --------- | ----------- | -------- | ------ | ------ |
| TC001 | Connection & seed data loads | Data available | Data available | ✅ |
| TC002 | Core aggregation returns KPIs | Metrics align with spec | Metrics align | ✅ |
| TC003 | Update operations respect validation | Validation blocks bad data | Validation enforced | ✅ |

### Performance Testing

```javascript
const startTime = Date.now();
// execute workload
const endTime = Date.now();
print(`Execution time: ${endTime - startTime}ms`);
```

Include notes about dataset size, indexes used, and observed resource metrics.

---

## Challenges and Solutions

### Challenge 1 – add short title

**Problem:** Summarize the issue.
**Solution:** Capture the fix or mitigation.

### Challenge 2 – add short title

**Problem:** Summarize the issue.
**Solution:** Capture the fix or mitigation.

---

## Learning Outcomes

1. Reinforced NoSQL data modeling best practices.
2. Practiced MongoDB querying, aggregation, and indexing.
3. Improved collaboration workflow for lab deliverables.

### Skills Developed

- [x] MongoDB query optimization
- [x] Data modeling for NoSQL
- [ ] Performance tuning (detail work pending)
- [ ] Index design experiments
- [ ] Aggregation pipeline deep dive

---

## Future Improvements

1. Add dashboards or reporting views for stakeholders.
2. Automate dataset generation and CI validation.
3. Evaluate sharding/partitioning strategies as data volume grows.

---

## References

1. MongoDB Documentation – Schema Design Patterns
2. MongoDB Documentation – Aggregation Framework
3. Course notes or third-party articles used for research

---

## Appendix

### A. Complete Code Listings

Link to the scripts (`queries.js`, `import_data.js`, etc.) committed alongside this report.

### B. Data Samples

Describe or link to anonymized sample documents to help reviewers understand the schema.

### C. Additional Diagrams

Include ERDs, sequence diagrams, or architecture figures if available.

---

## Declaration

We declare that this submission is our own work and that all sources used have been properly cited.

**Signatures:**

- Pedro Castro
- ____________________
- ____________________
- ____________________

_Submission validated on: 2026-01-06_
_Version: 1.0.0_
