#!/usr/bin/env node

const { MongoClient } = require("mongodb");

const localUri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const atlasUri = process.env.MONGODB_ATLAS_URI || localUri;

class AtlasSearchStarter {
  constructor(connectionString = atlasUri) {
    this.connectionString = connectionString;
    this.client = null;
    this.db = null;
  }

  async connect() {
    this.client = new MongoClient(this.connectionString);
    await this.client.connect();
    this.db = this.client.db("modern_features_lab");
    console.log(
      `Connected to MongoDB (${this.connectionString.includes("mongodb+srv://") ? "Atlas" : "local"})`
    );
  }

  async prepareData() {
    // TODO: insert catalog + article sample documents if you want standalone runs
  }

  async textSearchExample() {
    // TODO: run $search (Atlas) or $text (local) queries here
  }

  async autocompleteExample() {
    // TODO: build autocomplete pipelines using Atlas Search or fallback logic
  }

  async cleanup() {
    if (this.client) {
      await this.client.close();
    }
  }
}

async function main() {
  const exercise = new AtlasSearchStarter();
  try {
    await exercise.connect();
    await exercise.textSearchExample();
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

module.exports = AtlasSearchStarter;
