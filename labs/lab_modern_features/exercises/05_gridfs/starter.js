#!/usr/bin/env node

const { MongoClient, GridFSBucket } = require('mongodb');
const { Readable } = require('stream');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const bucketName = process.env.GRIDFS_BUCKET || 'modern_files';

class GridFSStarter {
  constructor(connectionString = uri) {
    this.connectionString = connectionString;
    this.client = null;
    this.db = null;
    this.bucket = null;
  }

  async connect() {
    this.client = new MongoClient(this.connectionString);
    await this.client.connect();
    this.db = this.client.db('modern_features_lab');
    this.bucket = new GridFSBucket(this.db, { bucketName });
    console.log(`Connected to MongoDB (bucket: ${bucketName})`);
  }

  async uploadSample(text) {
    // TODO: use this.bucket.openUploadStream to store a file
    return new Promise((resolve, reject) => {
      Readable.from([text])
        .pipe(this.bucket.openUploadStream('sample.txt'))
        .on('error', reject)
        .on('finish', resolve);
    });
  }

  async downloadSample(fileId) {
    // TODO: stream from bucket.openDownloadStream(fileId) to stdout or a buffer
    console.log(`Download placeholder for fileId: ${fileId}`);
  }

  async cleanup() {
    if (this.client) {
      await this.client.close();
    }
  }
}

async function main() {
  const starter = new GridFSStarter();
  try {
    await starter.connect();
    await starter.uploadSample('Hello, GridFS!');
  } finally {
    await starter.cleanup();
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = GridFSStarter;
