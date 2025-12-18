# Lab 03 – Practice Exercises

Additional query/index drills to push beyond the provided movie dataset tasks. Use new collections (`movies_practice`, `tickets_practice`, etc.) to keep results isolated.

---

## Exercise A · Recommendation Feed

1. Starting from `starter/data/movies.json`, create `movies_practice` and add fields:
   - `viewsLast7Days`, `isStaffPick`, and an array `relatedTitles`.
2. Build a “recommendation feed” aggregation that:
   - Filters out titles watched by the user (simulate via `$setDifference`).
   - Prioritizes staff picks with high weekly views.
   - Adds a computed field `score` combining rating + views weight.
3. Explain the pipeline with `executionStats` and document the winning indexes.

## Exercise B · Geo + Text Search Combo

1. Import sample theater data into `theaters_practice`.
2. Create a compound index supporting:
   - `$geoNear` queries for coordinates.
   - `$text` search on theater amenities or description.
3. Write a query that finds theaters within 10 km that match the phrase “IMAX recliner”.
4. Capture the plan summary and demonstrate how changing index order alters the winning plan.

## Exercise C · Fraud Detection Rules

1. Create `tickets_practice` representing online purchases (price, payment method, userId, ipAddress, createdAt).
2. Build aggregation pipelines for:
   - Detecting multiple payments from the same IP within 5 minutes.
   - Flagging tickets where `price` deviates more than 3σ from the daily average.
3. Store flagged tickets in `tickets_alerts` using `$merge`.
4. Design indexes that keep both aggregations under 50 ms on 50k synthetic documents (you can generate them with a short script).

Log findings in `labs/lab03_queries/NOTES.md` under a “Practice Exercises” heading.
