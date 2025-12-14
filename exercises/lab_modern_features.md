# Modern Features – Practice Exercises

Each mini-track below complements the official exercises and can be tackled independently. Create a `practice` subfolder inside `labs/lab_modern_features/` to store your scripts.

---

## Exercise A · Change Stream Webhook Simulator
1. Build a Node script that listens to `inventory_tracking` changes and forwards matching events (e.g., low stock) to a mock webhook endpoint (use `http.Server` or a simple Express app).
2. Support retry logic with exponential backoff when the webhook endpoint fails.
3. Keep a persistent `resumeToken.json` so the script can restart after crashes without missing events.

## Exercise B · Time-Series Capacity Planner
1. Extend `sensor_readings` with synthetic load (e.g., 100 sensors × 24 h at 1‑minute intervals).
2. Write an aggregation that compares storage stats:
   - Time-series collection vs equivalent “plain” collection.
   - TTL impact (simulate different `expireAfterSeconds` values).
3. Produce a markdown report summarizing space savings and performance metrics.

## Exercise C · Atlas Search Synonym Builder
1. Use Atlas Search (or mock data) to build a synonyms index for consumer electronics.
2. Create a script that:
   - Accepts a base term (e.g., “headphones”).
   - Performs `$search` with synonyms enabled and logs highlight fragments.
   - Falls back to local `$text` search with manual synonym expansion when Atlas isn’t available.

## Exercise D · Vector Search Multi-Modal Demo
1. Combine product text embeddings with mock image embeddings.
2. Build a hybrid `$unionWith` pipeline that:
   - Runs `$vectorSearch` for text similarity.
   - Runs a second pipeline for image similarity.
   - Merges and ranks results by a weighted score.
3. Output the blended results as a JSON API response (serve via Express or Fastify).

## Exercise E · GridFS Backup Worker
1. Implement a CLI tool `gridfs_backup.js` that downloads all GridFS files to disk, preserving metadata in adjacent `.meta.json` files.
2. Add options for incremental backup (skip files already present locally using `md5` comparison).
3. Add automatic upload of generated reports back into a separate GridFS bucket for auditing.

## Exercise F · Charts Automation
1. Generate a “Top Regions by Revenue” dataset and push it to the `modern_features_charts` database.
2. Use the MongoDB Charts REST API (or mock) to:
   - Create/update a dashboard definition file.
   - Trigger an export (PNG or PDF) and store it in GridFS.
3. Document the automation flow in `practice/charts_automation.md`.
