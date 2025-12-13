# Lab 01 – Basic Warm-Up Exercises

Start here if you need a gentler on-ramp before attempting the main Lab 01 deliverables. Completing these steps should take 20–30 minutes.

---

## Exercise 1: Dataset Sanity Check

1. Open `starter/data/sample.json` and list three interesting fields (e.g., `name`, `balance`, `address.city`).
2. Run `jq '.[0]' starter/data/sample.json` (or similar) to print the first document.
3. Note any nullable or nested fields in `NOTES.md`.

## Exercise 2: Minimal Import

1. Create a database named `lab01_basic`.
2. Import only the first 10 documents from the dataset (use `--limit 10` or copy into a temp file).
3. Run `db.customers.countDocuments()` to verify the import succeeded.

## Exercise 3: CRUD Micro-Sprint

1. Insert a single custom document containing `name`, `city`, and `createdAt`.
2. Update that document to add a `loyaltyTier` field.
3. Delete any document where `city` equals your hometown.
4. Capture the commands in `basic_exercises.js` or append them to your existing queries file.

## Exercise 4: Quick Query Sampler

Run and record results for:

```javascript
db.customers.findOne()
db.customers.find({ city: { $exists: true } }).limit(3)
db.customers.distinct("country")
```

Mention any surprising observations (duplicate cities, missing data, etc.) in `NOTES.md`.

---

Once these warm-ups feel comfortable, proceed to the primary Lab 01 tasks. You can keep `lab01_basic` as a playground and use `lab01_<student_id>` for your main practice workspace.
