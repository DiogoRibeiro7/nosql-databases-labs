# Lab 01 – Introduction to NoSQL & Setup

## Objectives

By the end of this lab you should be able to:

- Install and run the required NoSQL database(s) locally or via Docker.
- Create a database and at least one collection/table.
- Perform basic CRUD operations on JSON-like documents.
- Import data from a JSON file into your database.

---

## 1. Setup

1. Install MongoDB locally on your system.
2. Verify that your database server is running.

Examples:

```bash
# Check MongoDB version
mongod --version
mongosh --version
```

3. Make sure you know how to connect to your database (host, port, credentials if any).

---

## 2. Dataset

A small JSON dataset is provided in:

```text
labs/lab01_intro/starter/data/sample.json
```

Your tasks:

* Inspect the structure of the data (keys, nested fields, types).
* Import it into your NoSQL database using the recommended tool (CLI or GUI).

You may use commands such as (example for MongoDB CLI):

```bash
mongoimport \
  --db lab01_<your_student_id> \
  --collection customers \
  --file starter/data/sample.json \
  --jsonArray
```

The exact command may vary depending on your environment and database.

---

## 3. Tasks

Use a database named:

```text
lab01_<your_student_id>
```

and a collection/table named:

```text
customers
```

### 3.1. Basic queries

1. Insert at least **3 additional documents** into the `customers` collection.
2. Write queries to:

   * Find **all** customers.
   * Find customers from a specific **city**.
   * Find customers whose age (or another numeric field) is greater than a given value.

### 3.2. Aggregations

3. Write queries/aggregations to:

   * Count how many customers there are per **country**.
   * Compute the **average** of a numeric field (e.g. `age` or `balance`).

### 3.3. Indexes

4. Create at least **one index** that improves a query you wrote above (for example, on `city` or `country`).
5. Explain briefly in `NOTES.md` why this index is useful.

You may store your commands/queries in one or more of the following files inside `labs/lab01_intro/`:

* `queries.md` (text with commands and explanation), or
* `queries.js` / `queries.sh` (scripts), or
* any other format specified by the instructor.

---

## 4. What to submit

Inside `labs/lab01_intro/`, you should have at least:

* `queries.*` – file(s) containing your queries and/or scripts.
* `NOTES.md` – explaining:

  * How you imported the data.
  * How to run your queries or scripts.
  * Any issues you encountered and how you solved them.

Follow the general submission workflow in
[`instructions/submission_guide.md`](../../instructions/submission_guide.md).

---

## 5. Grading (summary)

This lab will be graded according to the general rubric in
[`instructions/grading_rubric.md`](../../instructions/grading_rubric.md). A typical breakdown is:

* Correct setup and data import: **30%**
* Correctness of queries and aggregations: **40%**
* Use of at least one meaningful index: **15%**
* Clarity and completeness of `NOTES.md` and file organization: **15%**

---

## 6. Optional extensions (for practice)

These items are **not required** for full marks, but are recommended if you finish early:

* Experiment with different index types (if supported) and compare performance on larger datasets.
* Add a small script (in any language supported in the course) that:

  * Connects to the database.
  * Runs a query.
  * Prints a short report to the console.

If you implement any extensions, mention them in `NOTES.md`.
