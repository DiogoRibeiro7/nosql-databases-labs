# Final Project Guidelines

These guidelines describe the required structure, grading rubric, and submission workflow for the optional/final project mentioned throughout the course materials.

## 1. Project Overview

- **Goal:** Design, implement, and justify a complete MongoDB-backed solution for a real-world scenario.
- **Team size:** 1–3 students (groups must be registered in `group-work/`).
- **Timeline:** Recommended to start in Week 4, final deliverables due during the final lab session.
- **Core Expectations:**
  1. Capture business requirements and translate them into MongoDB collections.
  2. Provide runnable import scripts or data pipelines.
  3. Demonstrate representative CRUD, aggregation, and performance-oriented queries.
  4. Document replication/sharding/consistency decisions if they affect the design.

## 2. Required Deliverables

Store the artifacts inside your group folder (`group-work/<group_id>/project/`):

| File | Purpose |
| --- | --- |
| `README.md` | Executive summary, dataset origin, key results, instructions to run the project. |
| `architecture.md` | Schema diagrams, reference flows, and reasoning for design choices. |
| `queries/` | Scripts (Node.js, mongosh, or Python) demonstrating the core use-cases. |
| `data/` | Sanitized sample data or scripts to download/generate it. |
| `performance.md` | Metrics pulled from `docs/performance_expectations.md` template (latency, throughput, indexes). |
| `tests/` | Optional, but highly encouraged; demonstrate how you validate correctness. |

## 3. Suggested Milestones

1. **Proposal (Week 4):** One-page summary of the domain, primary collections, and datasets. Submit via GitHub Discussion or the LMS.
2. **Schema Review (Week 5):** Share draft `architecture.md` with ER-style diagrams. Request async feedback from instructors/TAs.
3. **Dry Run (Week 6):** Run through the entire import → query → presentation flow. Capture screenshots/logs for your README.

## 4. Evaluation Rubric (100 pts)

| Area | Points | Notes |
| --- | --- | --- |
| Requirements Coverage | 20 | Does the solution solve the stated problem end-to-end? |
| Data Modeling Quality | 20 | Appropriate embedding/reference strategy, validation, schema rationale. |
| Query Depth | 20 | Variety of CRUD + aggregations; real use-cases vs generic demos. |
| Performance & Operations | 15 | Indexing, replication/sharding considerations, monitoring insights. |
| Code/Data Hygiene | 15 | Scripts are runnable, configs documented, secrets excluded. |
| Presentation & Documentation | 10 | README clarity, diagrams, screenshot examples. |

Bonus points (up to +5) may be awarded for advanced features (change streams, Atlas Search, vector search, etc.) if accompanied by meaningful write-ups.

## 5. Dataset & Compliance Checklist

- ✅ Verify licensing/usage rights for any external data.
- ✅ Remove PII or sensitive content; anonymize if necessary.
- ✅ Document preprocessing steps in `data/README.md`.
- ✅ Reference `data_version_tracker.js` if you extend repository datasets.

## 6. Submission Workflow

1. Commit all artifacts to your group folder.
2. Ensure `instructions/submission_guide.md` checklist passes.
3. Open a pull request to `main` (or the branch instructed by staff) with:
   - Summary of changes.
   - Demo screenshots/metrics as attachments or links.
   - Tag your TA/instructor.
4. Present live (or record a short video) during the showcase slot.

## 7. Recommended Tools

- **Modeling:** MongoDB Compass, Hackolade, Draw.io.
- **Scripting:** Node.js (official MongoDB driver), Python (PyMongo), mongosh.
- **Visualization:** MongoDB Charts, Grafana, Observable notebooks.
- **Testing:** Jest/Mocha for Node, Pytest for Python, or the provided `test_framework.js`.

## 8. FAQ

**Can we reuse lab datasets?** Yes, but extend them with new fields/collections or combine multiple sources to avoid duplicating existing labs.

**Do we need CI?** Optional, but teams that wire their project scripts into GitHub Actions receive extra credit for reproducibility.

**Atlas vs Local?** Either is acceptable. Document connection details (minus secrets) and provide a `.env.template` describing required variables if you target a cloud environment.

---

Questions? Open a discussion post (`project-help` label) or contact the teaching staff via the standard communication channels.
