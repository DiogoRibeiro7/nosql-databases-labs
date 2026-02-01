# Presentation Question Bank

Expect a subset of these prompts during the final presentation. Use them to rehearse your story and ensure every teammate can answer confidently.

## Modeling & Data Ingest

1. **Why embed venue info in `events`?** Venues rarely change per event, and every dashboard needs the venue name/district alongside metrics. Embedding keeps queries single-collection, avoids joins during presentations, and still allows duplication if the same venue hosts multiple events with different capacities.
2. **How is the import script idempotent?** It calls `db.dropDatabase()` before inserting, ensuring a clean slate, then reports `countDocuments()` after each insert. Because documents are defined inline (not generated dynamically), rerunning the script always recreates the same state with no duplicates.
3. **Scale-up plan for 500 vendors:** Replace the inline array with a JSON loader or stream from a CSV, enforce schema validation (e.g., `db.createCollection` with validator), and split the insertion into batches to avoid a massive `insertMany`.

## Indexing & Performance

4. **Index list + purpose:**
   - `vendors.vendorId` unique → protects reference integrity, supports lookups in `08_vendor_event_presence`.
   - `events.eventCode` unique → same reason for events.
   - `orders` compound `{ eventCode, vendorId, createdAt }` → used by revenue, hourly pulse, and payment mix pipelines that group on event/vendor/time.
   - `orders.customer.customerId` → powers repeat-visitor queries and dedupes.
5. **Feedback KPI index:** Add `{ vendorId: 1, feedbackScore: -1 }` (or `{ feedbackScore: -1 }` if global) so percentiles or window functions on feedback stay index-covered.
6. **Sharding impact:** If sharding by `eventCode`, the compound index should include the shard key (`{ eventCode: 1, createdAt: 1, vendorId: 1 }`) to keep queries targeted. Aggregations would lean on `$match` early to route to the right shard.

## Query Logic & Insights

7. **Pipeline walkthrough (`09_payment_mix_by_event`):** First `$group` tallies revenue/orders per event/payment pair, second `$group` reshapes into a payment mix array, and final `$sort` ranks events by activity—showing which events need more POS terminals.
8. **Neighborhood recommendation:** `03_neighborhood_heatmap` shows Foz and Miragaia leading in both orders and revenue, so we would argue for scheduling more pop-ups there.
9. **Surprising finding:** We expected grill vendors to dominate wait times, but `11_vendor_waittime_trends` revealed the juice bar (VNDR-06) consistently delivers in ~2 minutes, so we considered moving them to high-traffic venues.
