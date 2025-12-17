# Lab 02 – Data Modeling in NoSQL

## Objectives

By the end of this lab you should be able to:

- Design a schema for a simple application using a NoSQL database.
- Decide when to **embed** data vs when to **reference** it.
- Model common relationships (one-to-many, many-to-many) in a document or key–value store.
- Relate modeling decisions to expected query patterns.

This lab focuses more on **structure and reasoning** than on large amounts of code.

---

## 1. Scenario

You are designing the data model for a simple application (choose one, or use the one defined by the instructor):

- **Option A – E-commerce (default)**
  - Customers, products, orders, order items.

- **Option B – Content platform**
  - Users, posts/articles, comments, tags.

- **Option C – Custom scenario**
  - A domain proposed by the instructor.

Ask in class which scenario to use for this edition of the course.

---

## 2. Requirements (functional view)

Your application must support at least the following operations (adapt names to your scenario):

1. Given a **customer/user**, list their recent orders/posts.
2. Given an **order/post**, show all its items/comments.
3. List the **top N products/posts** by some metric (e.g. total quantity sold, views, likes).
4. Optional: search or filter by **category/tag**.

You do **not** need to implement the full application UI, but your **data model** must make these operations feasible and reasonably efficient.

---

## 3. Tasks

**Important:** Before running any JavaScript files, please refer to [FILE_USAGE_GUIDE.md](FILE_USAGE_GUIDE.md) to understand which files should be run with Node.js vs MongoDB Shell (mongosh).

### 3.1. Conceptual model

1. Identify the main **entities** and their **attributes**.
2. Identify the relationships between them (1–N, N–N, etc.).
3. Draw a simple diagram (hand-drawn + photo is acceptable) or describe the model in `NOTES.md`.

### 3.2. NoSQL logical model

Choose a target NoSQL database (e.g. MongoDB, DynamoDB, etc.) and design your collections/tables.

You must:

1. Define the collections/tables and give them names.
2. For each collection/table, specify:
   - Example document/item structure.
   - Which fields are required.
   - Which fields are identifiers, foreign references, or denormalized copies.
3. Explain for each relationship whether you chose **embedding** or **referencing**, and why.

Document this in a file:

```text
labs/lab02_modeling/model.md
```

or as `.json` / `.yaml` files if you prefer to show example documents.

### 3.3. Query-driven refinement

Based on the operations listed in Section 2:

1. For each required operation, write a **sample query** (pseudo-code or real query in your database's language).
2. Explain how your model supports this query efficiently:
   - Which collection is read first?
   - Do you need joins/lookups/extra round-trips?
   - Are there fields that should be indexed?

You can save sample queries in:

```text
labs/lab02_modeling/queries.md
```

### 3.4. Indexes and trade-offs

1. Propose at least **two indexes** that would be useful for the expected workload.
2. For each index, explain:
   - Which query (from 3.3) it helps.
   - Potential trade-offs (e.g. slower writes, more storage).

Add this discussion to `model.md` or `NOTES.md`.

---

## 4. What to submit

Inside `labs/lab02_modeling/`, you should have at least:

- `model.md` – your NoSQL schema design and explanation of embedding/reference choices.
- `queries.md` – sample queries for the required operations.
- `NOTES.md` – how to read your files, any assumptions, and optional diagrams (you may link to images).

If you create example JSON documents, place them under:

```text
labs/lab02_modeling/examples/
```

Follow the general submission rules in
[`instructions/submission_guide.md`](../../instructions/submission_guide.md).

---

## 5. Self-Assessment Checklist

Use this informal rubric to gauge whether you’ve covered the essentials:

- Conceptual model clearly identifies entities, attributes, and relationships.
- Embedding vs referencing decisions are justified in `model.md` or `NOTES.md`.
- Sample queries demonstrate each required workload from Section 2.
- Proposed indexes include trade-off discussions (write cost, storage).

If you can explain each bullet to a peer, you’ve extracted the intended lessons.

---

## 6. Optional extensions

The following items are optional but recommended if you finish early:

- Propose a **version 2** of your model optimized for a different workload (e.g. analytics vs transactional use).
- Discuss how your model would change if you needed to support **multi-region** or **sharded** deployments.
- Sketch how you would migrate from a relational schema to this NoSQL schema.

If you do any extensions, briefly describe them in `NOTES.md`.

---

### Basic Warm-up (Optional)

New to data modeling? Start with the lightweight prompts in [`BASIC_EXERCISES.md`](BASIC_EXERCISES.md). They walk you through listing entities, mapping relationships, drafting embed vs reference decisions, and writing a tiny sample document before you commit to the full deliverables.

---

### Advanced Challenges (Bonus)

Structured stretch goals are documented in [`ADVANCED_EXERCISES.md`](ADVANCED_EXERCISES.md). They cover:

1. Designing multi-tenant strategies.
2. Building an index prioritization/backlog process.
3. Planning a relational-to-document migration.

Record any progress in the “Advanced Exercises Summary” section of your `NOTES.md` and link to the supporting files you created.

---

### Feedback & Collaboration

- File ideas or bugs in the [Issues tab](https://github.com/diogoribeiro7/nosql-databases-labs/issues) with the `lab02` label.
- Share modeling tips or diagrams via [Discussions](https://github.com/diogoribeiro7/nosql-databases-labs/discussions) so others can benefit.
