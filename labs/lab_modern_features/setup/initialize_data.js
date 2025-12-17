#!/usr/bin/env node

/**
 * MongoDB Modern Features Lab - Sample Data Initializer
 *
 * Creates baseline collections used across the exercises so students can
 * experiment immediately after cloning the repository.
 */

const path = require("path");
const { MongoClient, GridFSBucket } = require("mongodb");
const { Readable } = require("stream");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

const LOCAL_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.MODERN_FEATURES_DB || "modern_features_lab";
const GRIDFS_BUCKET = process.env.GRIDFS_BUCKET || "modern_files";
const CHARTS_DB = process.env.CHARTS_DATABASE || "modern_features_charts";

async function seedChangeStreamCollections(db) {
  console.log("→ Seeding change stream starter collections");
  const now = new Date();

  const inventory = db.collection("inventory");
  const orders = db.collection("orders");
  const events = db.collection("events");
  const users = db.collection("users");

  await inventory.deleteMany({});
  await orders.deleteMany({});
  await events.deleteMany({});
  await users.deleteMany({});

  await inventory.insertMany([
    { sku: "LAP-001", item: "Laptop Pro 15", qty: 25, price: 1899, warehouse: "A" },
    { sku: "MON-034", item: "4K Monitor", qty: 60, price: 499, warehouse: "B" },
    { sku: "HDP-210", item: "NVMe SSD 2TB", qty: 120, price: 239, warehouse: "A" },
  ]);

  await orders.insertMany([
    {
      orderId: "ORD-1001",
      customer: "Alice Johnson",
      total: 2398,
      status: "pending",
      createdAt: now,
      items: [
        { sku: "LAP-001", qty: 1, price: 1899 },
        { sku: "HDP-210", qty: 1, price: 239 },
      ],
    },
    {
      orderId: "ORD-1002",
      customer: "Diego Marquez",
      total: 998,
      status: "processing",
      createdAt: new Date(now.getTime() - 3600000),
      items: [{ sku: "MON-034", qty: 2, price: 499 }],
    },
  ]);

  await events.insertMany([
    { event: "user_signup", metadata: { userId: "USR-101", plan: "pro" }, timestamp: now },
    {
      event: "page_view",
      metadata: { path: "/docs/change-streams" },
      timestamp: new Date(now.getTime() - 2000),
    },
    { event: "purchase", metadata: { amount: 998 }, timestamp: new Date(now.getTime() - 4000) },
  ]);

  await users.insertMany([
    { username: "john_doe", email: "john@example.com", lastLogin: now },
    {
      username: "sarah_connor",
      email: "sarah@example.com",
      lastLogin: new Date(now.getTime() - 7200000),
    },
  ]);

  await inventory.createIndex({ sku: 1 }, { unique: true });
  await orders.createIndex({ orderId: 1 }, { unique: true });
  await events.createIndex({ timestamp: -1 });
  await users.createIndex({ username: 1 }, { unique: true });
}

async function seedTimeSeriesCollections(db) {
  console.log("→ Creating time-series collections");

  const sensorName = "sensor_readings";
  await db
    .collection(sensorName)
    .drop()
    .catch(() => {});
  await db.createCollection(sensorName, {
    timeseries: {
      timeField: "timestamp",
      metaField: "metadata",
      granularity: "minutes",
    },
    expireAfterSeconds: 60 * 60 * 24 * 30,
  });

  const sensorDocs = [];
  const now = new Date();
  for (let i = 0; i < 30; i++) {
    sensorDocs.push({
      timestamp: new Date(now.getTime() - i * 60000),
      metadata: {
        sensorId: "sensor-001",
        location: "warehouse-A",
        type: "temperature",
      },
      temperature: 22 + Math.random() * 5,
      humidity: 45 + Math.random() * 10,
    });
  }
  await db.collection(sensorName).insertMany(sensorDocs);
}

async function seedAtlasSearchCollections(db) {
  console.log("→ Preparing Atlas Search demo data");
  const products = db.collection("products_catalog");
  const articles = db.collection("articles");

  await products.deleteMany({});
  await articles.deleteMany({});

  await products.insertMany([
    {
      name: "iPhone 14 Pro Max",
      category: "Electronics",
      brand: "Apple",
      description: "Latest flagship smartphone with advanced camera system and A16 Bionic chip",
      price: 1099,
      tags: ["mobile", "phone", "ios", "premium"],
      inStock: true,
    },
    {
      name: "Sony WH-1000XM5",
      category: "Electronics",
      brand: "Sony",
      description:
        "Industry-leading noise canceling wireless headphones with exceptional sound quality",
      price: 399,
      tags: ["audio", "headphones", "wireless"],
      inStock: true,
    },
    {
      name: "Dell XPS 15",
      category: "Electronics",
      brand: "Dell",
      description: "Powerful Windows laptop with stunning display for creators and professionals",
      price: 1799,
      tags: ["laptop", "windows", "creator"],
      inStock: false,
    },
  ]);

  await articles.insertMany([
    {
      title: "Getting Started with MongoDB Atlas Search",
      author: "John Smith",
      content: "Atlas Search makes it easy to build fast, relevance-based search capabilities...",
      category: "Tutorial",
      publishedDate: new Date("2024-01-15"),
    },
    {
      title: "Vector Search and AI Applications with MongoDB",
      author: "Emily Davis",
      content:
        "Explore how MongoDB Atlas Vector Search enables similarity search for AI applications...",
      category: "AI/ML",
      publishedDate: new Date("2024-01-25"),
    },
  ]);

  await products.createIndex({ name: "text", description: "text", brand: "text" });
  await articles.createIndex({ title: "text", content: "text" });
}

async function seedVectorCollections(db) {
  console.log("→ Populating vector search demo collections");

  const products = db.collection("products_with_embeddings");
  const knowledge = db.collection("knowledge_base");
  const images = db.collection("image_gallery");

  await products.deleteMany({});
  await knowledge.deleteMany({});
  await images.deleteMany({});

  const normalize = (vector) => vector.map((v) => parseFloat(v.toFixed(4)));

  await products.insertMany([
    {
      sku: "SPK-100",
      name: "Smart Home Speaker",
      category: "Smart Home",
      description: "Voice-controlled speaker with built-in assistant and premium audio drivers.",
      embedding: normalize([0.12, 0.33, 0.45, 0.11, 0.29, 0.54, 0.61, 0.22]),
    },
    {
      sku: "CAM-411",
      name: "4K Action Camera",
      category: "Photography",
      description:
        "Rugged action cam supporting 4K60, waterproof up to 10m, and Gyro stabilization.",
      embedding: normalize([0.42, 0.11, 0.16, 0.38, 0.09, 0.27, 0.45, 0.19]),
    },
  ]);

  await knowledge.insertMany([
    {
      topic: "change_streams",
      content: "Change streams provide real-time data feeds of operations on collections.",
      embedding: normalize([0.33, 0.27, 0.51, 0.19, 0.44, 0.07, 0.13, 0.4]),
    },
    {
      topic: "time_series",
      content: "Time-series collections optimize storage for measurements indexed by time.",
      embedding: normalize([0.26, 0.18, 0.42, 0.36, 0.39, 0.17, 0.22, 0.31]),
    },
  ]);

  await images.insertMany([
    {
      fileName: "dashboard.png",
      labels: ["charts", "analytics", "metrics"],
      embedding: normalize([0.55, 0.12, 0.23, 0.41, 0.17, 0.39, 0.28, 0.09]),
    },
    {
      fileName: "workshop.jpg",
      labels: ["team", "collaboration", "whiteboard"],
      embedding: normalize([0.21, 0.44, 0.12, 0.33, 0.51, 0.19, 0.08, 0.38]),
    },
  ]);
}

async function seedChartsDataset(client) {
  console.log("→ Preparing charts dataset");
  const db = client.db(CHARTS_DB);
  const sales = db.collection("sales_summary");

  await sales.deleteMany({});
  await sales.insertMany([
    {
      date: new Date("2024-01-01"),
      region: "NA",
      product: "Laptop Pro 15",
      channel: "Online",
      units: 42,
      revenue: 79800,
    },
    {
      date: new Date("2024-01-01"),
      region: "EU",
      product: "Laptop Pro 15",
      channel: "Retail",
      units: 25,
      revenue: 47500,
    },
    {
      date: new Date("2024-01-08"),
      region: "NA",
      product: "4K Monitor",
      channel: "Online",
      units: 60,
      revenue: 29940,
    },
    {
      date: new Date("2024-01-08"),
      region: "APAC",
      product: "Smart Speaker",
      channel: "Resellers",
      units: 75,
      revenue: 18750,
    },
  ]);
}

async function seedGridFS(db) {
  console.log("→ Uploading sample file to GridFS");

  await db
    .collection(`${GRIDFS_BUCKET}.files`)
    .drop()
    .catch(() => {});
  await db
    .collection(`${GRIDFS_BUCKET}.chunks`)
    .drop()
    .catch(() => {});

  const bucket = new GridFSBucket(db, { bucketName: GRIDFS_BUCKET });

  const sampleContent = `
MongoDB Modern Features Lab
===========================

This document lives in GridFS so you can experiment with file
storage APIs (upload, download, stream) without hunting for data.
`;

  const uploadStream = bucket.openUploadStream("lab-guide.txt", {
    metadata: { topic: "gridfs", createdAt: new Date() },
  });

  await new Promise((resolve, reject) => {
    Readable.from([sampleContent]).pipe(uploadStream).on("error", reject).on("finish", resolve);
  });
}

async function main() {
  console.log("MongoDB Modern Features Lab - Data Initialization");
  console.log("================================================");

  const client = new MongoClient(LOCAL_URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME);

    await seedChangeStreamCollections(db);
    await seedTimeSeriesCollections(db);
    await seedAtlasSearchCollections(db);
    await seedVectorCollections(db);
    await seedGridFS(db);
    await seedChartsDataset(client);

    console.log("\n✓ Sample data created successfully.");
    console.log(`   Database: ${DB_NAME}`);
    console.log(`   Charts DB: ${CHARTS_DB}`);
    console.log(`   GridFS bucket: ${GRIDFS_BUCKET}`);
  } catch (error) {
    console.error("\nInitialization failed:", error);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  seedChangeStreamCollections,
  seedTimeSeriesCollections,
  seedAtlasSearchCollections,
  seedVectorCollections,
  seedGridFS,
  seedChartsDataset,
};
