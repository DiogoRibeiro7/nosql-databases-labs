#!/usr/bin/env node

const { MongoClient } = require("mongodb");

const atlasUri =
  process.env.MONGODB_ATLAS_URI || process.env.MONGODB_URI || "mongodb://localhost:27017";

class VectorSearchStarter {
  constructor(connectionString = atlasUri) {
    this.connectionString = connectionString;
    this.client = null;
    this.db = null;
  }

  async connect() {
    this.client = new MongoClient(this.connectionString);
    await this.client.connect();
    this.db = this.client.db("modern_features_lab");
    console.log("Connected to MongoDB (vector search starter)");
  }

  async generateEmbedding(text) {
    // TODO: plug in a real embedding model; for now return dummy numbers
    return text
      .split("")
      .map((char) => (char.charCodeAt(0) % 10) / 10)
      .slice(0, 8);
  }

  async insertSampleProducts() {
    // TODO: insert docs with `embedding` arrays using generateEmbedding()
  }

  async findSimilarProducts(queryText) {
    // TODO: run $vectorSearch (Atlas) or a cosine similarity fallback
    console.log(`Vector search placeholder for query: "${queryText}"`);
  }

  async cleanup() {
    if (this.client) {
      await this.client.close();
    }
  }
}

async function main() {
  const exercise = new VectorSearchStarter();
  try {
    await exercise.connect();
    await exercise.insertSampleProducts();
    await exercise.findSimilarProducts("wireless headphones");
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

module.exports = VectorSearchStarter;
