#!/usr/bin/env node

const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const analyticsDb = process.env.CHARTS_DATABASE || "modern_features_charts";

class ChartsStarter {
  constructor(connectionString = uri) {
    this.connectionString = connectionString;
    this.client = null;
    this.db = null;
  }

  async connect() {
    this.client = new MongoClient(this.connectionString);
    await this.client.connect();
    this.db = this.client.db(analyticsDb);
    console.log(`Connected to MongoDB (charts DB: ${analyticsDb})`);
  }

  async buildSalesSummary() {
    // TODO: aggregate from modern_features_lab collections into the charts database
  }

  async exportDataset() {
    // TODO: write aggregated docs to JSON/CSV for MongoDB Charts
  }

  async cleanup() {
    if (this.client) {
      await this.client.close();
    }
  }
}

async function main() {
  const exercise = new ChartsStarter();
  try {
    await exercise.connect();
    await exercise.buildSalesSummary();
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

module.exports = ChartsStarter;
