# Lab 05 – Practice Exercises

Push replica-set knowledge with targeted drills. Use disposable replica sets spun up with the provided scripts or Docker Compose.

---

## Exercise A · Read Preference Playground

1. Configure a 3-node replica set with priority weightings (primary pref, hidden node, etc.).
2. Write a Node script `read_preference_playground.js` that:
   - Accepts `--mode=secondaryPreferred|nearest|primaryPreferred`.
   - Issues 100 read operations and logs which node served each request.
3. Capture metrics before/after tweaking custom tag sets or latency thresholds.

## Exercise B · Lag Injection & Alerting

1. Introduce artificial lag by pausing replication on one secondary (`rs.stepDown` alternatives or DB profiling).
2. Implement a watcher (`lag_watchdog.js`) that:
   - Calls `rs.printSlaveReplicationInfo()`.
   - Emits a JSON alert if lag > configurable threshold (default 5 s).
   - Stores alerts in `replication_alerts`.
3. Resume replication and ensure alerting stops automatically once lag clears.

## Exercise C · Multi-Region Failover Drill

1. Simulate three regions by running mongod instances with different logical tags (`region: us-east`, `eu-west`, `ap-south`).
2. Design a failover runbook:
   - Force the primary to step down.
   - Promote a specific region by adjusting `priority`/`votes`.
   - Measure downtime (seconds without a writable primary).
3. Document the sequence of commands and include output snippets from `rs.status()` before/after.

Summaries, scripts, and observations should live in `labs/lab05_replication/practice/`.
