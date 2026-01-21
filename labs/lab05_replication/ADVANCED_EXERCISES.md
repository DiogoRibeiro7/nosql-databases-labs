# Lab 05 – Advanced Replication Exercises

These optional challenges simulate production incidents and operational runbooks. Attempt them after completing the baseline replication tasks.

---

## Advanced Exercise 1: Election Chaos Simulation

**Goal:** Observe how elections behave under network instability and configuration tweaks.

### Tasks

1. Extend the replica set to include an arbiter or delayed secondary (use the starter scripts as a template).
2. Write `scripts/flaky_network.js` that:
   - Randomly disconnects a node (`rs.stepDown()` or OS-level firewall rules if available).
   - Waits for a new primary to be elected.
   - Logs election time, winner, and reason.
3. Run the script multiple times and capture metrics (min/avg/max failover time) in `NOTES.md`.
4. Experiment with replica priorities and hidden nodes; document how they affect outcomes.

---

## Advanced Exercise 2: Read Preference Load Tester

**Goal:** Validate that read preference policies route traffic as expected.

### Tasks

1. Build a workload script (`read_pref_tester.js`) that:
   - Issues concurrent read operations using the MongoDB driver.
   - Iterates through read preferences (`primary`, `primaryPreferred`, `secondary`, `nearest`).
   - Logs which node served each query (host + port) and latency statistics.
2. Visualize the output (table or small chart) showing distribution of reads per node.
3. Summarize insights in `notes_read_pref.md`: which modes balance best, which have the lowest latency, etc.

---

## Advanced Exercise 3: Oplog Watchdog & Lag Alerts

**Goal:** Detect replication lag and stalled secondaries before they cause incidents.

### Tasks

1. Write `oplog_watchdog.js` that:
   - Connects to each replica set member.
   - Reads the latest entries from `local.oplog.rs`.
   - Calculates replication lag (difference between primary/latest secondary timestamps).
   - Sends an alert (console log, Slack webhook, etc.) if lag exceeds a threshold (e.g., 5 seconds).
2. Trigger a lag scenario (heavy writes on primary or throttle a secondary) to validate the alert.
3. Document remediation procedures in `NOTES.md` (e.g., “increase priority,” “resync secondary”).

---

## Reporting

Add an **“Advanced Replication Runbook”** section to `labs/lab05_replication/NOTES.md`. Include:

- How to run each script
- Observed metrics (failover times, read distribution, lag)
- Follow-up tasks or improvements you would implement in production

Partial implementations are acceptable—make sure to describe current limitations and next steps.
