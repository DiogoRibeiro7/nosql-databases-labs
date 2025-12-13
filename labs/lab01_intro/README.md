# Lab 01 – Introduction to NoSQL & Setup

## Objectives

By the end of this lab you should be able to:

- Install and run the required NoSQL database(s) locally or via Docker.
- Create a database and at least one collection/table.
- Perform basic CRUD operations on JSON-like documents.
- Import data from a JSON file into your database.

---

## 1. Setup

## 1. Install MongoDB locally on your system.

### For MacOS

### 1. Install Homebrew
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Make Sure you have XCode CLI Tools
```bash
xcode-select --install
``` 

### 3. Install MongoDB Community Edition

#### 1. Install MongoDB for Brew
```bash
brew tap mongodb/brew
```

#### 2. Update Homebrew
```bash
brew update
```

#### 3. Install MongoDB Community
```bash
brew install mongodb-community@7.0
```

#### If you have any error in step 3 reinstall llvm
```bash
brew reinstall llvm
```

#### 4. Start Mongo Server
```bash
brew services start mongodb-community@7.0
```

#### 5. Install Mongo Shell
```bash
brew install mongosh
```

#### 6. Install Mongo Compass
```bash
brew install --cask mongodb-compass
```

#### 7. Verify if it's Installed
```bash
mongosh --version
```

Your done!

### 2. Verify that your database server is running.

Examples:

```bash
# Check MongoDB version
mongod --version
mongosh --version
```

### 3. Make sure you know how to connect to your database (host, port, credentials if any).

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

**Important:** Before running any JavaScript files, please refer to [FILE_USAGE_GUIDE.md](FILE_USAGE_GUIDE.md) to understand which files should be run with Node.js vs MongoDB Shell (mongosh).

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

## 5. Self-Assessment Checklist

Use this list to confirm you practiced the core skills before moving on:

* Successfully import `sample.json` and document the command used.
* Run basic CRUD queries (find, insert, update, delete) without errors.
* Create at least one index (e.g., on `city`) and explain why it helps.
* Capture troubleshooting notes and setup steps inside `NOTES.md`.

If each item feels comfortable, you are ready to continue to the next lab.

---

## 6. Optional extensions (for practice)

These items are **not required** for full marks, but are recommended if you finish early:

* Experiment with different index types (if supported) and compare performance on larger datasets.
* Add a small script (in any language supported in the course) that:

  * Connects to the database.
  * Runs a query.
  * Prints a short report to the console.

If you implement any extensions, mention them in `NOTES.md`.

---

### Basic Warm-up (Optional)

Need a gentler starting point? Work through the four-step primer in [`BASIC_EXERCISES.md`](BASIC_EXERCISES.md) before tackling the main lab. It guides you through dataset inspection, a partial import, simple CRUD, and a quick query sampler.

---

### Advanced Challenges (Bonus)

If you want structured stretch goals, see [`ADVANCED_EXERCISES.md`](ADVANCED_EXERCISES.md). It outlines:

1. An environment diagnostics script (`env_check.*`).
2. An idempotent database seeder.
3. A minimal API + smoke test harness.

Document any progress in the “Advanced Exercises Status” section of your `NOTES.md`.
