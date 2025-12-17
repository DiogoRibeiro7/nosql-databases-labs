# Lab 02 – Advanced Modeling Exercises

Use these challenges after completing the baseline modeling tasks. They emphasize trade-off analysis, scale planning, and iterative refinement of your data model.

---

## Advanced Exercise 1: Multi-Tenant Extension

**Scenario:** The product team wants to support multiple client organizations inside one deployment (aka multi-tenancy) while preserving data isolation.

### Tasks

1. Extend your conceptual model to include a `tenant` (or `organization`) entity.
2. Evaluate three strategies:
   - **Database-per-tenant**
   - **Shared DB, tenantId per document**
   - **Hybrid (shared DB, but sensitive collections per tenant)**
3. For each strategy describe:
   - Operational pros/cons (cost, isolation, complexity)
   - Impact on existing queries/indexes
   - Migration implications
4. Produce a comparison table in `labs/lab02_modeling/notes_multi_tenant.md` (or append to `NOTES.md`).

---

## Advanced Exercise 2: Workload Backlog & Index Budget

**Goal:** Prioritize indexes when you can only afford three “premium” indexes in production.

### Tasks

1. List at least six candidate indexes covering different query patterns (e.g., “orders by status + date”, “products by category + price”).
2. Score each candidate on:
   - Read benefit (1–5)
   - Write cost (1–5)
   - Storage impact (1–5)
   - Criticality to business goals
3. Use the scores to justify the final three-index budget.
4. Document the rationale (include sample queries) in `labs/lab02_modeling/index_priorities.md`.

---

## Advanced Exercise 3: Relational-to-Document Migration Plan

**Scenario:** You must migrate from an existing relational schema into your proposed NoSQL model without downtime longer than 10 minutes.

### Tasks

1. Sketch the relational source tables (brief schemas).
2. Map each table to your target collections, noting transformations (denormalization, embedding, computed fields).
3. Design a migration workflow:
   - Backfill strategy (bulk export/import, ETL pipeline, change streams, etc.)
   - Order of operations and validation checkpoints
   - Rollback/dual-write considerations
4. Summarize the plan in `labs/lab02_modeling/migration_plan.md` with diagrams or bullet timelines.

---

## Documentation Checklist

Add a section titled **“Advanced Exercises Summary”** to `labs/lab02_modeling/NOTES.md`. Briefly state which exercises you tackled, where supporting files live, and any open questions you still have. Partial completion is acceptable; clarity of reasoning is more important than perfect execution.
