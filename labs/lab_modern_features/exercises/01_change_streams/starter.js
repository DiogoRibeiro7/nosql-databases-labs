#!/usr/bin/env node

/**
 * Starter template for the Change Streams exercise.
 * Fill in the TODO blocks to experiment before peeking at solution.js.
 */

const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";

class ChangeStreamsStarter {
  constructor(connectionString = uri) {
    this.connectionString = connectionString;
    this.client = null;
    this.db = null;
  }

  async connect() {
    this.client = new MongoClient(this.connectionString);
    await this.client.connect();
    this.db = this.client.db("modern_features_lab");
    console.log("Connected to MongoDB (starter)");
  }

  async basicChangeStream() {
    // TODO: open a change stream on `inventory` and log insert/update/delete events
  }

  async filteredChangeStream() {
    // TODO: use $match in the change stream pipeline to only process inserts / updates
  }

  async resumableStream() {
    // TODO: capture resume tokens and demonstrate a restarted change stream
  }

  async cleanup() {
    if (this.client) {
      await this.client.close();
    }
  }
}

async function main() {
  const exercise = new ChangeStreamsStarter();
  try {
    await exercise.connect();
    await exercise.basicChangeStream();
  } finally {
    await exercise.cleanup();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = ChangeStreamsStarter;
