# Lab 05 – Practice Exercise Solutions (mongosh)

**Business Goal:** The platform promises high availability across regions, so the engineering org must prove that replica sets behave as expected under load and during incidents. Product teams rely on predictable read latency, which requires validating read preferences and tag routing in controlled experiments. SRE teams need automated lag detection to trigger remediations before user-facing delays occur. Disaster recovery plans call for documented failover runbooks, ensuring leadership can make informed decisions about regional promotion during outages. These mongosh scripts and procedures deliver that operational assurance.

## Exercise A · Read Preference Playground
Product teams wanted proof that read routing behaves as documented under different modes. The snippet iterates 100 reads with a specified read preference (`nearest`, `secondaryPreferred`, etc.), tallying which node served the request by inspecting a `servedBy` field. These metrics demonstrate to stakeholders how load shifts when we change read preferences or tag sets.
Run the following inside mongosh connected to the replica-set connection string (e.g., `mongosh "mongodb://localhost:27017,localhost:27018,localhost:27019/?replicaSet=rs0"`):
```javascript
const mode = typeof readMode !== 'undefined' ? readMode : 'nearest';
db.getMongo().setReadPref(mode);

const stats = { primary: 0, secondary: 0, other: 0 };
for (let i = 0; i < 100; i++) {
  const doc = db.ping.findOne({}, { $readPreference: { mode } });
  const source = doc?.servedBy || 'primary';
  if (!stats[source]) stats[source] = 0;
  stats[source]++;
}
printjson(stats);
```
Populate `servedBy` when inserting from each node:
```javascript
db.ping.insertOne({ ts: new Date(), servedBy: db.runCommand({ serverStatus: 1 }).host });
```

## Exercise B · Lag Injection & Alerting
Lag spikes can cause stale reads and delayed failovers. This walkthrough shows how to intentionally freeze a secondary, parse `rs.status()` to compute lag in seconds, and store alerts when thresholds are exceeded. Ops teams can wire this into cron jobs or monitoring agents to get early warnings before customers notice.
1. Pause a secondary (from that node):
   ```javascript
   rs.freeze(600);
   ```
2. Lag watcher script (run from primary or a mongosh connected to the set):
   ```javascript
   const threshold = typeof lagThreshold !== 'undefined' ? lagThreshold : 5;
   const info = rs.printSlaveReplicationInfo();
   // rs.printSlaveReplicationInfo already prints; parse manually:
   const status = rs.status();
   status.members
     .filter(m => m.stateStr === 'SECONDARY')
     .forEach(member => {
       const lagSeconds = member.optimeDate ? (status.date - member.optimeDate) / 1000 : 0;
       if (lagSeconds > threshold) {
         db.replication_alerts.insertOne({
           node: member.name,
           lagSeconds,
           createdAt: new Date()
         });
       }
     });
   ```
3. Resume replication: `rs.freeze(0);`.

## Exercise C · Multi-Region Failover Drill
Business continuity planning demands evidence that we can promote a new primary in another region. The commands initiate a multi-region config, adjust priorities to move leadership to the EU node, and measure downtime by watching for the new primary. Documenting the elapsed time and nodes involved gives leadership confidence that RTO targets are achievable.
Initial configuration:
```javascript
rs.initiate({
  _id: 'rs-global',
  members: [
    { _id: 0, host: 'host1:27017', priority: 2, tags: { region: 'us-east' } },
    { _id: 1, host: 'host2:27018', priority: 1, tags: { region: 'eu-west' } },
    { _id: 2, host: 'host3:27019', priority: 0, hidden: true, tags: { region: 'ap-south' } }
  ]
});
```
Force failover to EU region:
```javascript
rs.stepDown();
const cfg = rs.conf();
cfg.members[0].priority = 0;
cfg.members[1].priority = 2;
cfg.members[2].priority = 1;
rs.reconfig(cfg, { force: true });
```
Measure downtime:
```javascript
const start = new Date();
rs.stepDown();
let newPrimary = null;
while (!newPrimary) {
  const status = rs.status();
  const primary = status.members.find(m => m.stateStr === 'PRIMARY');
  if (primary) {
    newPrimary = primary.name;
    const end = new Date();
    print(`New primary: ${newPrimary} in ${(end - start) / 1000}s`);
  } else {
    sleep(1000);
  }
}
```
