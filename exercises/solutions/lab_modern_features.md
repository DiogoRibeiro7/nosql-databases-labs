# Modern Features – Practice Exercise Solutions (mongosh)

**Business Goal:** Multiple departments depend on advanced MongoDB features to keep customer experiences fresh and operations compliant. Inventory planners need real-time low-stock alerts wired into downstream systems. Infrastructure teams must quantify time-series storage savings to justify retention policies. Search teams want to roll out synonym-rich Atlas Search indexes and hybrid vector personalization without rewriting the stack. Compliance requires regular GridFS backups, and analytics leaders need automated dashboard exports for weekly reviews. The solutions below translate those business imperatives into practical mongosh workflows.

Set the database:
```javascript
db = db.getSiblingDB('modern_features_lab');
```

## Exercise A · Change Stream Webhook Simulator
Inventory planners need low-stock alerts streamed to downstream systems. Instead of writing direct webhooks from mongosh, we stage events in a `webhook_outbox` collection alongside a persisted resume token. This pattern (often called the outbox pattern) lets ops teams build reliable worker services that read from the outbox and deliver HTTP requests with retries, while the mongosh script focuses solely on capturing change events with resume safety.
You can emulate a webhook queue by writing change events to `webhook_outbox` and letting another process POST them.
```javascript
const tokenDoc = db.resume_tokens.findOne({ stream: 'inventory_tracking_low_stock' });
const cursor = db.inventory_tracking.watch(
  [{ $match: { 'updateDescription.updatedFields.quantity': { $lt: 10 } } }],
  { fullDocument: 'updateLookup', resumeAfter: tokenDoc?.token }
);

while (cursor.hasNext()) {
  const change = cursor.next();
  db.webhook_outbox.insertOne({
    stream: 'inventory_tracking_low_stock',
    payload: {
      sku: change.fullDocument.sku,
      quantity: change.fullDocument.quantity,
      minStock: change.fullDocument.minStock
    },
    createdAt: new Date(),
    delivered: false
  });
  db.resume_tokens.updateOne(
    { stream: 'inventory_tracking_low_stock' },
    { $set: { token: change._id, updatedAt: new Date() } },
    { upsert: true }
  );
}
```
Later, an HTTP worker can read from `webhook_outbox` and deliver payloads.

## Exercise B · Time-Series Capacity Planner
Storage/infra teams asked for empirical data comparing time-series collections vs plain collections, especially when tweaking TTLs. The stats commands compare sizes (in MB) and show how TTL changes immediately affect storage, arming the team with concrete savings numbers for budget discussions.
```javascript
const tsStats = db.sensor_readings.aggregate([{ $collStats: { storageStats: {} } }]).next();
const plainStats = db.sensor_readings_plain.aggregate([{ $collStats: { storageStats: {} } }]).next();
printjson({
  tsSizeMB: tsStats.storageStats.size / (1024 * 1024),
  plainSizeMB: plainStats.storageStats.size / (1024 * 1024)
});

db.runCommand({ collMod: 'sensor_readings', expireAfterSeconds: 3600 });
const ttlStats = db.sensor_readings.aggregate([{ $collStats: { storageStats: {} } }]).next();
print('Post-TTL size MB:', ttlStats.storageStats.size / (1024 * 1024));
```

## Exercise C · Atlas Search Synonym Builder
Search PMs want to roll out synonyms (e.g., headphones/earbuds) across product descriptions. The Atlas Search pipeline demonstrates using the synonyms index plus highlighting, while the `$text` fallback keeps QA moving locally even without Atlas access. This dual approach helps teams test the experience before provisioning cloud resources.
When connected to Atlas via mongosh:
```javascript
const terms = ['headphones', 'earphones', 'earbuds'];
db.products_catalog.aggregate([
  {
    $search: {
      index: 'products_synonyms',
      text: {
        query: 'headphones',
        path: ['name', 'description'],
        synonyms: 'audio_synonyms'
      },
      highlight: { path: 'description' }
    }
  },
  { $project: { name: 1, highlights: { $meta: 'searchHighlights' } } }
]).forEach(doc => printjson(doc));

// Local fallback
db.products_catalog.find({ $text: { $search: terms.join(' ') } }, { score: { $meta: 'textScore' } }).sort({ score: { $meta: 'textScore' } });
```

## Exercise D · Vector Search Multi-Modal Demo
Personalization squads are experimenting with combining text and image embeddings. The code runs `$vectorSearch` against two collections, tags the mode, applies weighted scoring, and surfaces the top blended recommendations. Product designers can tweak the weights without touching backend infrastructure.
Atlas example:
```javascript
const textVector = [0.12, 0.33, 0.45, 0.11, 0.29, 0.54, 0.61, 0.22];
const imageVector = [0.55, 0.12, 0.23, 0.41, 0.17, 0.39, 0.28, 0.09];

const textResults = db.products_with_embeddings.aggregate([
  {
    $vectorSearch: {
      index: 'products_text',
      path: 'embedding',
      queryVector: textVector,
      limit: 5
    }
  },
  { $addFields: { mode: 'text', score: { $meta: 'vectorSearchScore' } } }
]).toArray();

const imageResults = db.image_gallery.aggregate([
  {
    $vectorSearch: {
      index: 'images_index',
      path: 'embedding',
      queryVector: imageVector,
      limit: 5
    }
  },
  { $addFields: { mode: 'image', score: { $meta: 'vectorSearchScore' } } }
]).toArray();

const blended = textResults.concat(imageResults).map(doc => {
  doc.blendedScore = doc.mode === 'text' ? doc.score * 0.6 : doc.score * 0.4;
  return doc;
}).sort((a, b) => b.blendedScore - a.blendedScore).slice(0, 5);
printjson(blended);
```

## Exercise E · GridFS Backup Worker
Compliance mandates regular exports of GridFS content. By shelling out to `mongofiles` directly from mongosh, we can download every file and persist metadata for auditing without leaving the MongoDB ecosystem. Storing metadata in a dedicated collection makes it easy to track checksum/length verification later.
Download files via `mongofiles` directly from mongosh:
```javascript
const bucketName = typeof GRIDFS_BUCKET !== 'undefined' ? GRIDFS_BUCKET : 'modern_files';
db[bucketName + '.files'].find().forEach(file => {
  // Note: runProgram is a legacy mongo shell function. In mongosh, use run() or execute via external script
  // Option 1: Using mongosh's run() command (requires mongosh 2.0+)
  run('mongofiles', [
    '--quiet',
    '--db', db.getName(),
    '--bucket', bucketName,
    'get',
    file.filename
  ]);

  // Option 2: For older mongosh versions, execute as external command:
  // print(`mongofiles --quiet --db ${db.getName()} --bucket ${bucketName} get "${file.filename}"`);
  // Then run the printed commands in a separate shell script

  db.gridfs_backups_metadata.updateOne(
    { filename: file.filename },
    { $set: file },
    { upsert: true }
  );
});
```

## Exercise F · Charts Automation
Analytics leads asked for automated “Top Regions by Revenue” datasets and an artifact of each dashboard export. Aggregating directly into the Charts database keeps the pipeline simple, and reminding teams to upload exports into GridFS ensures there’s a historical record that auditors can access.
Generate dataset:
```javascript
db.sales_summary.aggregate([
  { $group: { _id: '$region', revenue: { $sum: '$revenue' } } },
  { $merge: { into: { db: 'modern_features_charts', coll: 'top_regions' }, whenMatched: 'replace', whenNotMatched: 'insert' } }
]);
```
For automation, export chart configs via Atlas Charts UI and store definitions alongside GridFS exports:
```javascript
db.getSiblingDB('modern_features_charts').top_regions.find().forEach(doc => printjson(doc));
// Upload exported PNG to GridFS bucket
```
