# Lab 03 – Basic Query Exercises

Use these before jumping into the full query/index workload. They reinforce shell navigation, simple find operations, and explain analysis. Approx. time: 25 minutes.

---

## Exercise 1: Data Verification

1. Switch to `ldb.userss`.
2. Run `db.movies.countDocuments()`, `db.theaters.countDocuments()`, and `db.users.countDocuments()`.
3. Record the values in `NOTES.md` (Basic section) to prove the import worked.

## Exercise 2: Straightforward Finds

Execute each query and copy the command/result snippet into `queries.js` or `queries_mongosh.js`:

```javascript
db.movies.findOne({ year: 2015 });
db.movies.find({ genres: "Drama" }, { title: 1, year: 1 }).limit(5);
db.users.find({ "preferences.genres": "Sci-Fi" }).count();
```

## Exercise 3: Intro Aggregation

Build a three-stage pipeline:

1. `$match` movies released after 2010.
2. `$group` by `year` with `count`.
3. `$sort` by year descending and `$limit` 3.

Save it in `basic_aggregation.js` or append to `aggregations.js` under a “Basic” comment block.

## Exercise 4: First Index + Explain

1. Create an index on `movies(genres: 1)`.
2. Run `db.movies.find({ genres: "Comedy" }).explain("executionStats")`.
3. Jot down `executionTimeMillis` and `totalDocsExamined` in `NOTES.md`.

---

Once these feel comfortable, continue with the full Task 1–4 requirements and optional advanced drills.
