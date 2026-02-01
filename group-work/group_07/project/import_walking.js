// Simple importer to load walking sensor CSV into MongoDB.
// Set MONGODB_URI, MONGODB_DB, and MONGODB_COLLECTION as needed.

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGODB_DB || 'iot_sensors';
const collectionName = process.env.MONGODB_COLLECTION || 'motion_data';
const csvPath = path.join(__dirname, 'Data', 'walking (1).csv');

const toNumber = (value) => {
  if (value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const parseCsv = (content) => {
  const lines = content.trim().split(/\r?\n/);
  lines.shift(); // drop header line
  const docs = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    const cols = line.split(',');

    docs.push({
      index: toNumber(cols[0]),
      attitude: {
        roll: toNumber(cols[1]),
        pitch: toNumber(cols[2]),
        yaw: toNumber(cols[3]),
      },
      gravity: {
        x: toNumber(cols[4]),
        y: toNumber(cols[5]),
        z: toNumber(cols[6]),
      },
      rotationRate: {
        x: toNumber(cols[7]),
        y: toNumber(cols[8]),
        z: toNumber(cols[9]),
      },
      userAcceleration: {
        x: toNumber(cols[10]),
        y: toNumber(cols[11]),
        z: toNumber(cols[12]),
      },
    });
  }

  return docs;
};

(async () => {
  const client = new MongoClient(uri);

  try {
    const csvRaw = fs.readFileSync(csvPath, 'utf8');
    const docs = parseCsv(csvRaw);

    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    await collection.deleteMany({});
    if (docs.length) {
      await collection.insertMany(docs, { ordered: false });
    }

    console.log(`Imported ${docs.length} documents into ${dbName}.${collectionName}`);
  } catch (err) {
    console.error('Import failed:', err);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
})();
