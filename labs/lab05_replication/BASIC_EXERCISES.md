# Lab 05 – Basic Replication Exercises

If you are new to replica sets, complete these quick drills (~30 minutes) before the main tasks.

---

## Exercise 1: Setup Verification

1. Run the provided setup script.
2. Connect to port 27017 and execute:
   ```javascript
   rs.status().members.map(m => ({ name: m.name, stateStr: m.stateStr }))
   ```
3. Paste the output into `NOTES.md` to document initial state.

## Exercise 2: Primary/Secondary Reads

1. Insert a sample document on the primary: `db.test.insertOne({ createdAt: new Date() })`.
2. Connect to a secondary with `mongosh --port 27018 --setParameter=replication.oplogSizeMB=...` (or use `rs.slaveOk()` if needed) and confirm the document replicates.
3. Record replication delay (seconds between insert and visibility) in your notes.

## Exercise 3: Manual Failover

1. From the primary shell, run `rs.stepDown(10)`.
2. Observe which member becomes primary via `rs.status()`.
3. Document the timeline (how long the cluster had no primary) and any errors in the shell.

## Exercise 4: Basic Read Preference Test

1. Using the MongoDB driver or `mongosh`, run:
   ```javascript
   db.getMongo().setReadPref("secondaryPreferred")
   db.test.find().limit(1)
   ```
2. Use `db.runCommand({ connectionStatus: 1 })` to confirm which host served the query.

---

Once you can perform these basics confidently, continue with the full replication lab tasks and optional advanced runbooks.
