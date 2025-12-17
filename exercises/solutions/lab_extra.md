# Extra Labs – Practice Exercise Solutions (mongosh)

**Business Goal:** As customers scale, the platform must guarantee transactional integrity, geographically aware data placement, and consistently fast queries. Product managers need proof that critical booking workflows stay atomic even under contention, compliance officers demand tenant-aware sharding to respect residency rules, and performance teams want indexing patterns that prevent regressions as schemas evolve. These mongosh-driven experiments give leadership the evidence they need to green-light enterprise deployments.

## Transactions Track

- **Booking workflow:** Confirms to business stakeholders that inventory decrements and booking writes happen atomically. The transaction guards against overselling and provides a template for other critical flows (payments, shipping).
- **Booking workflow:**
  ```javascript
  const session = db
    .getMongo()
    .startSession({ readConcern: { level: "majority" }, writeConcern: { w: "majority" } });
  session.startTransaction();
  try {
    const inventoryColl = session.getDatabase("lab_extra").inventory;
    const bookingsColl = session.getDatabase("lab_extra").bookings;
    const item = inventoryColl.findOne({ sku: "SKU-01" });
    if (!item || item.qty < 2) throw new Error("insufficient stock");
    inventoryColl.updateOne({ sku: "SKU-01" }, { $inc: { qty: -2 } });
    bookingsColl.insertOne({ bookingId: "B-1001", sku: "SKU-01", qty: 2, status: "confirmed" });
    session.commitTransaction();
  } catch (err) {
    print("Transaction aborted:", err.message);
    session.abortTransaction();
  } finally {
    session.endSession();
  }
  ```
- **Saga state document:**
  ```javascript
  db.saga_state.updateOne(
    { _id: "order-123" },
    {
      $set: {
        state: "payment_approved",
        steps: [
          { name: "charge-card", status: "completed" },
          { name: "reserve-shipment", status: "pending" },
        ],
        lastUpdated: new Date(),
      },
    },
    { upsert: true }
  );
  ```
  Resume by reading `steps` array and executing pending compensations.
- **ReadConcern comparison:**
  ```javascript
  const s1 = db.getMongo().startSession({ readConcern: { level: "snapshot" } });
  const s2 = db.getMongo().startSession({ readConcern: { level: "local" } });
  const coll1 = s1.getDatabase("lab_extra").rc_test;
  const coll2 = s2.getDatabase("lab_extra").rc_test;
  s1.startTransaction();
  coll1.insertOne({ _id: 1, value: "snapshot" });
  print("Snapshot read within txn:", coll1.findOne({ _id: 1 }));
  print("Local read from other session (should be null until commit):", coll2.findOne({ _id: 1 }));
  s1.commitTransaction();
  print("Local read after commit:", coll2.findOne({ _id: 1 }));
  s1.endSession();
  s2.endSession();
  ```

## Sharding Track

- **Shard key benchmarking:** Ops needs evidence that the proposed shard key balances data. Running `getShardDistribution()` after seeding synthetic events gives a tangible readout to share with leadership.
- **Shard key benchmarking:**
  ```javascript
  sh.enableSharding("practice");
  sh.shardCollection("practice.sensor_events", { deviceId: "hashed" });
  sh.status();
  db.getSiblingDB("practice").sensor_events.getShardDistribution();
  ```
- **Zone sharding:**
  ```javascript
  sh.addShardTag("shard0000", "EU");
  sh.updateZoneKeyRange("practice.users", { region: "EU" }, { region: "EU" }, "EU");
  db.getSiblingDB("practice").users.insertMany([
    { userId: "U1", region: "EU" },
    { userId: "U2", region: "US" },
  ]);
  sh.status(); // verify placement
  ```
- **Chunk migration stress test:**
  ```javascript
  const seq = db.getSiblingDB("practice").seq;
  for (let i = 0; i < 100000; i++) {
    seq.insertOne({ _id: i, payload: "x".repeat(32) });
  }
  sh.status();
  db.adminCommand({ balancerStatus: 1 });
  ```

## Indexing Track

- **Workload simulator:** Product support escalations often stem from slow dashboards. Replaying representative workloads and comparing profiler output before/after index changes demonstrates performance gains to non-technical stakeholders.
- **Workload simulator:**
  ```javascript
  for (let i = 0; i < 10000; i++) {
    db.orders
      .find({ customerId: `C${i % 1000}` })
      .hint({ customerId: 1, orderDate: -1 })
      .toArray();
    db.orders.updateOne({ orderId: i }, { $inc: { total: 5 } });
  }
  db.system.profile.find().sort({ ts: -1 }).limit(5).forEach(printjson);
  ```
- **Wildcard vs targeted:**
  ```javascript
  db.events.createIndex({ "$**": 1 });
  db.events.createIndex({ "payload.temperature": 1 });
  db.events.find({ "payload.temperature": { $gt: 30 } }).explain("executionStats");
  db.events.find({ "payload.unknownField": { $exists: true } }).explain("executionStats");
  ```
- **TTL + partial filter:**
  ```javascript
  db.sessions.createIndex(
    { lastSeen: 1 },
    { expireAfterSeconds: 3600, partialFilterExpression: { type: "guest" } }
  );
  db.sessions.insertMany([
    { sessionId: "guest-1", type: "guest", lastSeen: new Date() },
    { sessionId: "member-1", type: "member", lastSeen: new Date() },
  ]);
  // After an hour, confirm guest docs expired while member remains.
  ```
