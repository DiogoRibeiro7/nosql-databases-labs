#!/usr/bin/env node

const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';

class TimeSeriesStarter {
  constructor(connectionString = uri) {
    this.connectionString = connectionString;
    this.client = null;
    this.db = null;
  }

  async connect() {
    this.client = new MongoClient(this.connectionString);
    await this.client.connect();
    this.db = this.client.db('modern_features_lab');
    console.log('Connected to MongoDB (time-series starter)');
  }

  async createCollection() {
    // TODO: call db.createCollection with the `timeseries` option
  }

  async insertSampleReadings() {
    // TODO: insert mock documents (timestamp + metadata) into your collection
  }

  async queryRecentReadings() {
    // TODO: demonstrate range queries, grouping, and window functions
  }

  async cleanup() {
    if (this.client) {
      await this.client.close();
    }
  }
}

async function main() {
  const exercise = new TimeSeriesStarter();
  try {
    await exercise.connect();
    await exercise.createCollection();
  } finally {
    await exercise.cleanup();
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = TimeSeriesStarter;
