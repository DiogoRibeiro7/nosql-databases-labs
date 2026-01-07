# Lab 04 – Practice Exercises

Tackle small analytics use-cases using custom collections so you can refine aggregation muscle memory.

---

## Exercise A · Subscription Revenue Cohorts

1. Build a synthetic `subscriptions_practice` collection with:
   - `userId`, `plan`, `price`, `startedAt`, `renewedAt`, `canceledAt`.
2. Pipeline requirements:
   - Compute monthly recurring revenue (MRR) per plan.
   - Bucket users by cohort month (based on `startedAt`) and track churn rate.
   - Output a table of `cohort`, `activeUsers`, `churnedUsers`, `retainedPercent`.
3. Store results in `subscriptions_reports` via `$merge`.

## Exercise B · Retail Basket Analysis

1. Create `orders_practice` documents with `items: [{ sku, quantity, price }]`.
2. Pipeline tasks:
   - Explode items and compute gross revenue per SKU.
   - Calculate average basket size and attach percentile stats (P50, P90) using `$setWindowFields`.
   - Identify the top-5 SKU combinations appearing together (market-basket style). Hint: `$unwind`, `$group`, and self-join logic.

## Exercise C · Uptime Monitoring

1. Store heartbeats in `uptime_practice` with `service`, `region`, `status`, `latencyMs`, `timestamp`.
2. Build a pipeline that:
   - Aggregates 5-minute windows (use `$dateTrunc`).
   - Calculates uptime percentage per service/region.
   - Highlights windows where latency P95 > 500 ms or uptime < 99.5%.
3. Output alerts to `uptime_alerts` and include recommended mitigation text.

Document each exercise in `labs/lab04_aggregation/NOTES.md` and include screenshots or JSON exports of final pipeline outputs.
