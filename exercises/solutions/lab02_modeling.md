# Lab 02 – Practice Exercise Solutions

**Business Goal:** Product management is expanding into three new verticals—vacation rentals, fitness tracking, and multi-tenant support tooling—and needs data models that deliver responsive user experiences without compromising security. The rental marketplace schema must let hosts and guests see up-to-date data while capturing priced snapshots for billing disputes. The fitness app model has to balance high-frequency sensor writes with efficient analytical reads for coaches and users. The support ticketing layout must prevent data bleed between tenants and preserve full audit trails for compliance teams. These solutions document the schema decisions, validation rules, and indexing strategies that meet those business objectives.

## Exercise A · Rental Marketplace

This scenario mirrors a real marketplace where hosts demand responsive dashboards while finance/legal need immutable snapshots for audits. Embedding lightweight listing summaries under each host keeps dashboard reads to a single document, whereas reservations live separately with a `snapshot` field that freezes pricing/rating information the moment a booking is confirmed. Reviews remain reference-based because both listing pages and guest history views query them; we rely on targeted indexes for each access pattern. Validation rules ensure temporal integrity so customer support never has to resolve “negative-night” bookings.

- **Hosts & Listings:** Embed listings under hosts for frequent dashboard queries.

  ```json
  {
    "_id": { "$oid": "507f1f77bcf86cd799439011" },
    "hostId": "H-1001",
    "name": "Jane Smith",
    "listings": [
      {
        "listingId": "L-2001",
        "title": "Historic Loft",
        "city": "Lisbon",
        "avgNightly": 120,
        "rating": 4.92
      }
    ]
  }
  ```

- **Reservations:** Separate collection with snapshot fields.

  ```json
  {
    "_id": { "$oid": "507f191e810c19729de860ea" },
    "reservationId": "R-8888",
    "listingId": "L-2001",
    "guestId": "G-3001",
    "checkIn": { "$date": "2025-04-12T00:00:00Z" },
    "checkOut": { "$date": "2025-04-17T00:00:00Z" },
    "snapshot": { "title": "Historic Loft", "nightly": 120, "hostRating": 4.92 },
    "total": 600,
    "status": "confirmed"
  }
  ```

- **Reviews:** referencing listing + guest; indexes:
  
  ```javascript
  db.reviews.createIndex({ listingId: 1, createdAt: -1 });
  db.reviews.createIndex({ guestId: 1, createdAt: -1 });
  ```

- **Validation snippets:**

  ```javascript
  // Note: MongoDB doesn't support relative date validation in JSON Schema.
  // Use $expr with standard validation for date comparison:
  db.runCommand({
    collMod: 'reservations',
    validator: {
      $and: [
        {
          $jsonSchema: {
            bsonType: 'object',
            required: ['checkIn', 'checkOut', 'listingId', 'guestId'],
            properties: {
              checkIn: { bsonType: 'date' },
              checkOut: { bsonType: 'date' },
              listingId: { bsonType: 'string' },
              guestId: { bsonType: 'string' },
              total: { bsonType: 'number', minimum: 0 },
              status: { enum: ['pending', 'confirmed', 'cancelled'] }
            }
          }
        },
        {
          $expr: {
            $gte: ['$checkOut', '$checkIn']  // Ensure checkout is after checkin
          }
        }
      ]
    }
  });
  ```

## Exercise B · Fitness App

Product managers wanted clarity on how to store high-frequency workout and nutrition logs without degrading mobile UX. The comparison table lays out the trade-offs for each read pattern, helping stakeholders reason about embedding vs referencing. The JSON schema ensures workout entries stay clean (e.g., enumerated exercise types), and the micro-benchmark quantifies the cost of heavy updates when data is embedded—numbers the PMs can use when choosing designs for future features.

- Read pattern options compared in table (example):

| Pattern               | Option 1 (Embed)                                     | Option 2 (Reference)                               | Trade-off                              |
| --------------------- | ---------------------------------------------------- | -------------------------------------------------- | -------------------------------------- |
| Last 30 workouts      | store `workouts` array inside user with bounded size | `workouts` collection referencing `userId` + index | Embedding fastest but needs pruning    |
| Daily calorie summary | `nutrition` subdocument keyed by `YYYY-MM-DD`        | separate `nutrition_logs` with `$group`            | referencing keeps documents small      |
| Sensor anomalies      | `sensorSnapshots` array with only recent entries     | `sensor_logs` TTL collection                       | referencing easier for TTL + analytics |

- `validation_schemas_practice.js` contains JSON Schema for `workouts` with enumeration of exercise types.
- Micro-benchmark sample:

  ```javascript
  console.time('embedded');
  for (let i = 0; i < 1000; i++) {
    db.users_embedded.updateOne(
      { userId: 'U1' },
      { $push: { workouts: { $each: [{ ts: new Date(), kcal: 450 }], $slice: -30 } } }
    );
  }
  console.timeEnd('embedded');
  ```

  Repeat for referencing collection and compare.

## Exercise C · Support Ticketing

Customer success teams insisted on instant access to ticket timelines, but our legal/compliance partners mandated strict tenant separation and detailed audit trails. The blueprint below enforces tenant IDs at the top level (useful for sharding/zone placement), keeps the most recent timeline entries in the ticket document for fast reads, and spills older entries to a history collection to avoid bloating documents. Partial indexes target just the SLA-breached subset so queue views stay performant. The migration note explains how to move legacy tenants into the new layout without downtime—important when pitching enterprise prospects.

- Multi-tenant layout with compound shard key candidate `{ tenantId: 1, ticketId: 1 }`.

  ```json
  {
    "_id": { "$oid": "507f1f77bcf86cd799439012" },
    "tenantId": "TEN-001",
    "ticketId": "T-9001",
    "subject": "API outage",
    "priority": "P1",
    "status": "open",
    "timeline": [
      { "type": "message", "actor": "agent", "body": "Investigating", "ts": { "$date": "2025-02-10T10:00:00Z" } },
      { "type": "attachment", "name": "logs.zip", "size": 102400 }
    ]
  }
  ```

- Timeline buckets: enforce max 50 entries per ticket, spill older entries to `ticket_history` collection.
- Indexes:

  ```javascript
  db.tickets.createIndex({ tenantId: 1, status: 1, priority: 1 });
  db.tickets.createIndex({ tenantId: 1, updatedAt: -1 }, { partialFilterExpression: { slaBreached: true } });
  ```

- Migration steps: script to iterate each tenant, copy tickets to new `tenantId` namespace, update application config to include tenant scoping.
