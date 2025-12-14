# Extra Labs – Practice Exercises

Additional ideas to stretch transaction, sharding, and indexing skills. Implement them inside the relevant `lab_extra_xx_*` folders to keep everything organized.

---

## Transactions Track
- **Exercise A:** Implement a “booking” workflow using multi-document transactions. Include compensating logic when inventory falls below zero mid-transaction.
- **Exercise B:** Craft a saga that spans two collections (payments + shipments). Persist saga state so you can resume after simulated crashes.
- **Exercise C:** Compare `readConcern` levels (`local`, `majority`, `snapshot`) under concurrent writers and record the observed anomalies (or lack thereof).

## Sharding Track
- **Exercise A:** Benchmark three shard key candidates for a `sensor_events` collection (e.g., `{ deviceId, timestamp }`, hashed `userId`, geo-based key). Capture chunk distribution charts.
- **Exercise B:** Configure zone sharding so EU data stays on EU shards. Prove it by inserting regional docs and running targeted queries.
- **Exercise C:** Stress-test chunk migrations by inserting a high volume of monotonic keys. Observe balancer behavior and document mitigation strategies.

## Indexing Track
- **Exercise A:** Build a workload simulator that replays a mix of finds, updates, and aggregations. Use it to justify compound index choices.
- **Exercise B:** Experiment with wildcard indexes (`$**`) versus targeted indexes on semi-structured documents; profile memory and query performance.
- **Exercise C:** Explore TTL indexes combined with partial filters (e.g., only expire “guest” sessions). Validate that other sessions persist.
