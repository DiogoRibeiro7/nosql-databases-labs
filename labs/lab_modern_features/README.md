# Lab: Modern MongoDB Features

## Overview

This lab explores advanced MongoDB features that enable real-time data processing, time-series analysis, full-text search, AI/ML capabilities, file storage, and data visualization.

## Prerequisites

- MongoDB 5.0+ (6.0+ for some features)
- MongoDB Atlas account (for Atlas Search and Charts)
- Node.js 16+ and Python 3.8+
- Basic understanding of MongoDB CRUD operations

## Lab Structure

### 1. Change Streams (Real-time Data)

Learn to monitor real-time data changes in MongoDB collections.

> Requires a replica set (use Lab 05 setup locally or MongoDB Atlas).

### 2. Time-Series Collections

Work with time-stamped data using MongoDB's optimized time-series collections.

### 3. Atlas Search

Implement full-text search capabilities using MongoDB Atlas Search.

### 4. Vector Search for AI/ML

Use vector embeddings for similarity search and AI applications.

### 5. GridFS File Storage

Store and retrieve large files using MongoDB's GridFS.

### 6. MongoDB Charts

Create interactive visualizations from MongoDB data.

## Getting Started

1. **Setup Environment**:

   ```bash
   cd labs/lab_modern_features
   npm install
   ```

2. **Configure MongoDB Connection**:

   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB connection string
   ```

3. **Run Sample Data Setup**:
   ```bash
   node setup/initialize_data.js
   ```

## Exercises

Each exercise folder contains:

- `README.md` - Exercise instructions
- `solution.js` or `solution.py` - Complete solution
- `starter.js` or `starter.py` - Starting template
- `test.js` - Automated tests

## Learning Objectives

By completing this lab, you will:

- Implement real-time data synchronization with change streams
- Design and query time-series data efficiently
- Build advanced search functionality with Atlas Search
- Implement AI/ML features using vector search
- Handle large file storage with GridFS
- Create data visualizations with MongoDB Charts

## Resources

- [MongoDB Change Streams Documentation](https://www.mongodb.com/docs/manual/changeStreams/)
- [Time Series Collections Guide](https://www.mongodb.com/docs/manual/core/timeseries-collections/)
- [Atlas Search Tutorial](https://www.mongodb.com/docs/atlas/atlas-search/)
- [Vector Search Documentation](https://www.mongodb.com/docs/atlas/atlas-search/vector-search/)
- [GridFS Specification](https://www.mongodb.com/docs/manual/core/gridfs/)
- [MongoDB Charts](https://www.mongodb.com/products/charts)
