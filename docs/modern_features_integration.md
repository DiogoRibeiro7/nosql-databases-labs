# 🚀 Modern Features Integration Guide

This guide shows how to enhance your existing labs with MongoDB's modern features, transforming basic implementations into production-ready solutions.

## 📊 Upgrading Lab 01: Add Change Streams

Transform the basic CRUD operations into a real-time reactive application.

### Before (Basic CRUD)
```javascript
// Simple insert operation
db.customers.insertOne({
  name: "John Doe",
  email: "john@example.com",
  balance: 1000
});
```

### After (With Change Streams)
```javascript
// Real-time customer activity monitoring
const customerStream = db.customers.watch([
  {
    $match: {
      $or: [
        { "operationType": "insert" },
        { "updateDescription.updatedFields.balance": { $exists: true } }
      ]
    }
  }
], { fullDocument: "updateLookup" });

customerStream.on("change", (change) => {
  console.log("Customer activity detected:");

  if (change.operationType === "insert") {
    // New customer registered
    sendWelcomeEmail(change.fullDocument);
    updateDashboard("newCustomer", change.fullDocument);
  } else if (change.operationType === "update") {
    // Balance changed
    const balanceChange = change.updateDescription.updatedFields.balance;
    if (balanceChange < 0) {
      checkForOverdraft(change.fullDocument);
    }
    updateCustomerMetrics(change.fullDocument);
  }
});

// Resume from last position after restart
const resumeToken = getStoredResumeToken();
if (resumeToken) {
  const resumedStream = db.customers.watch([], {
    resumeAfter: resumeToken
  });
}
```

### Integration Benefits
- ✅ Real-time dashboards
- ✅ Instant notifications
- ✅ Audit logging
- ✅ Cache invalidation

---

## 📈 Upgrading Lab 02: Add Schema Validation

Enhance your data models with MongoDB's JSON Schema validation.

### Before (No Validation)
```javascript
// Any structure accepted
db.products.insertOne({
  name: "Laptop",
  price: "expensive"  // Wrong type!
});
```

### After (With JSON Schema Validation)
```javascript
// Define and enforce schema
db.runCommand({
  collMod: "products",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "price", "category", "sku"],
      properties: {
        name: {
          bsonType: "string",
          description: "Product name is required"
        },
        price: {
          bsonType: "number",
          minimum: 0,
          description: "Price must be a positive number"
        },
        category: {
          enum: ["Electronics", "Clothing", "Books", "Home"],
          description: "Category must be from predefined list"
        },
        sku: {
          bsonType: "string",
          pattern: "^[A-Z]{3}-[0-9]{4}$",
          description: "SKU must match pattern XXX-0000"
        },
        inventory: {
          bsonType: "object",
          required: ["available", "reserved"],
          properties: {
            available: { bsonType: "int", minimum: 0 },
            reserved: { bsonType: "int", minimum: 0 }
          }
        },
        attributes: {
          bsonType: "object",
          additionalProperties: true  // Flexible for product variants
        }
      }
    }
  },
  validationLevel: "moderate",  // Validate inserts and updates
  validationAction: "error"     // Reject invalid documents
});

// Test validation
try {
  db.products.insertOne({
    name: "Laptop",
    price: "expensive",  // Will fail validation!
    category: "Electronics",
    sku: "LAP-0001"
  });
} catch (e) {
  console.log("Validation error:", e.message);
}
```

---

## 🕐 Upgrading Lab 03: Add Time-Series Collections

Transform regular collections into optimized time-series storage.

### Before (Regular Collection)
```javascript
// Inefficient for time-series data
db.sensor_readings.insertMany([
  { sensorId: "temp_01", value: 22.5, timestamp: new Date() },
  { sensorId: "temp_01", value: 22.6, timestamp: new Date() },
  // Thousands more...
]);

// Slow aggregation on large dataset
db.sensor_readings.aggregate([
  { $match: {
    sensorId: "temp_01",
    timestamp: { $gte: startDate, $lt: endDate }
  }},
  { $group: {
    _id: null,
    avgTemp: { $avg: "$value" }
  }}
]);
```

### After (Time-Series Collection)
```javascript
// Create optimized time-series collection
db.createCollection("sensor_readings_ts", {
  timeseries: {
    timeField: "timestamp",
    metaField: "metadata",
    granularity: "seconds"
  },
  expireAfterSeconds: 2592000  // 30 days retention
});

// Insert with metadata
db.sensor_readings_ts.insertMany([
  {
    timestamp: new Date(),
    metadata: {
      sensorId: "temp_01",
      location: "warehouse_a",
      type: "temperature"
    },
    temperature: 22.5,
    humidity: 45
  }
]);

// Optimized time-window aggregations
db.sensor_readings_ts.aggregate([
  {
    $match: {
      "metadata.sensorId": "temp_01",
      timestamp: {
        $gte: ISODate("2024-01-15T00:00:00Z"),
        $lt: ISODate("2024-01-16T00:00:00Z")
      }
    }
  },
  {
    $group: {
      _id: {
        $dateTrunc: {
          date: "$timestamp",
          unit: "hour"
        }
      },
      avgTemp: { $avg: "$temperature" },
      maxTemp: { $max: "$temperature" },
      minTemp: { $min: "$temperature" },
      readings: { $sum: 1 }
    }
  }
]);

// Advanced: Window functions on time-series
db.sensor_readings_ts.aggregate([
  {
    $setWindowFields: {
      partitionBy: "$metadata.sensorId",
      sortBy: { timestamp: 1 },
      output: {
        movingAverage: {
          $avg: "$temperature",
          window: {
            range: [-300, 0],  // 5 minutes
            unit: "second"
          }
        },
        temperatureChange: {
          $derivative: {
            input: "$temperature",
            unit: "minute"
          }
        }
      }
    }
  }
]);
```

### Benefits
- ✅ 10x storage compression
- ✅ 5x faster queries
- ✅ Automatic data expiration
- ✅ Optimized for time-based analytics

---

## 🔍 Upgrading Lab 04: Add Atlas Search

Enhance aggregation with full-text search capabilities.

### Before (Basic Text Search)
```javascript
// Limited text search
db.products.createIndex({ name: "text", description: "text" });
db.products.find({ $text: { $search: "laptop" } });
```

### After (Atlas Search)
```javascript
// Create Atlas Search index (in Atlas UI or API)
{
  "name": "product_search",
  "mappings": {
    "dynamic": false,
    "fields": {
      "name": {
        "type": "string",
        "analyzer": "lucene.standard"
      },
      "description": {
        "type": "string",
        "analyzer": "lucene.english"
      },
      "category": {
        "type": "string",
        "facet": true
      },
      "price": {
        "type": "number",
        "facet": true
      },
      "attributes": {
        "type": "document",
        "dynamic": true
      },
      "name_autocomplete": {
        "type": "autocomplete",
        "analyzer": "lucene.standard",
        "tokenization": "edgeGram"
      }
    }
  }
}

// Advanced search with fuzzy matching and facets
db.products.aggregate([
  {
    $search: {
      index: "product_search",
      compound: {
        should: [
          {
            text: {
              query: "laptp",  // Typo handled!
              path: "name",
              fuzzy: {
                maxEdits: 2
              },
              score: { boost: { value: 2 } }
            }
          },
          {
            text: {
              query: "laptop",
              path: "description"
            }
          }
        ],
        filter: [
          {
            range: {
              path: "price",
              gte: 500,
              lte: 2000
            }
          }
        ]
      }
    }
  },
  {
    $facet: {
      results: [
        { $limit: 20 },
        { $project: {
          name: 1,
          price: 1,
          score: { $meta: "searchScore" }
        }}
      ],
      categories: [
        { $group: {
          _id: "$category",
          count: { $sum: 1 }
        }}
      ],
      priceRanges: [
        { $bucket: {
          groupBy: "$price",
          boundaries: [0, 500, 1000, 2000, 5000],
          default: "5000+",
          output: { count: { $sum: 1 } }
        }}
      ]
    }
  }
]);

// Autocomplete for search-as-you-type
db.products.aggregate([
  {
    $search: {
      index: "product_search",
      autocomplete: {
        query: "lap",
        path: "name_autocomplete"
      }
    }
  },
  { $limit: 5 },
  { $project: { name: 1 } }
]);
```

---

## 🤖 Upgrading Lab 05: Add Vector Search

Enhance replication lab with AI-powered similarity search.

### Before (Keyword Search Only)
```javascript
// Traditional text matching
db.articles.find({
  $text: { $search: "mongodb database" }
});
```

### After (Vector Search for Semantic Similarity)
```javascript
// Generate embeddings using OpenAI/Hugging Face
async function generateEmbedding(text) {
  const response = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: text
  });
  return response.data[0].embedding;
}

// Store documents with embeddings
const articleEmbedding = await generateEmbedding(article.content);
db.articles.insertOne({
  title: "Understanding MongoDB Replication",
  content: article.content,
  embedding: articleEmbedding,  // 1536-dimensional vector
  metadata: {
    author: "John Doe",
    category: "Database",
    date: new Date()
  }
});

// Create vector search index
{
  "name": "article_vectors",
  "type": "vectorSearch",
  "fields": [{
    "type": "vector",
    "path": "embedding",
    "numDimensions": 1536,
    "similarity": "cosine"
  }]
}

// Semantic search - finds similar meaning, not just keywords
const queryEmbedding = await generateEmbedding("How does MongoDB handle failover?");

db.articles.aggregate([
  {
    $vectorSearch: {
      index: "article_vectors",
      path: "embedding",
      queryVector: queryEmbedding,
      numCandidates: 100,
      limit: 10
    }
  },
  {
    $project: {
      title: 1,
      content: { $substr: ["$content", 0, 200] },
      score: { $meta: "vectorSearchScore" }
    }
  }
]);

// Hybrid search: Combine vector and text search
db.articles.aggregate([
  {
    $vectorSearch: {
      index: "article_vectors",
      path: "embedding",
      queryVector: queryEmbedding,
      numCandidates: 50,
      limit: 20
    }
  },
  {
    $addFields: {
      vectorScore: { $meta: "vectorSearchScore" }
    }
  },
  {
    $match: {
      $text: { $search: "replication" }  // Also must contain keyword
    }
  },
  {
    $addFields: {
      textScore: { $meta: "textScore" },
      combinedScore: {
        $add: [
          { $multiply: ["$vectorScore", 0.7] },
          { $multiply: ["$textScore", 0.3] }
        ]
      }
    }
  },
  { $sort: { combinedScore: -1 } },
  { $limit: 5 }
]);
```

---

## 📁 Adding GridFS to Any Lab

Store and retrieve large files efficiently.

### Implementation
```javascript
const { GridFSBucket } = require('mongodb');
const fs = require('fs');

// Initialize GridFS
const bucket = new GridFSBucket(db, {
  bucketName: 'uploads'
});

// Upload large file
async function uploadFile(filePath, metadata) {
  const uploadStream = bucket.openUploadStream(
    path.basename(filePath),
    { metadata }
  );

  fs.createReadStream(filePath)
    .pipe(uploadStream)
    .on('finish', () => {
      console.log(`File uploaded: ${uploadStream.id}`);
    });
}

// Download file
async function downloadFile(fileId, outputPath) {
  const downloadStream = bucket.openDownloadStream(fileId);
  const fileStream = fs.createWriteStream(outputPath);

  downloadStream.pipe(fileStream)
    .on('finish', () => {
      console.log('File downloaded');
    });
}

// Stream to HTTP response
app.get('/file/:id', (req, res) => {
  const downloadStream = bucket.openDownloadStream(
    ObjectId(req.params.id)
  );

  downloadStream.on('data', (chunk) => {
    res.write(chunk);
  });

  downloadStream.on('end', () => {
    res.end();
  });
});

// Search files by metadata
async function findFilesByTag(tag) {
  const cursor = bucket.find({
    'metadata.tags': tag
  });

  const files = await cursor.toArray();
  return files;
}
```

---

## 📊 Adding MongoDB Charts

Visualize data from any lab.

### Setup
1. Enable Charts in Atlas
2. Connect to your cluster
3. Create dashboard

### Example Dashboards

#### Lab 01: Customer Analytics
```javascript
// Prepare data for charts
db.customers.aggregate([
  {
    $group: {
      _id: "$city",
      avgBalance: { $avg: "$balance" },
      customerCount: { $sum: 1 }
    }
  },
  { $out: "customer_analytics" }
]);
```

Charts to create:
- Bar chart: Customers by city
- Line chart: Balance trends
- Pie chart: Customer segments
- Number charts: KPIs

#### Lab 04: Sales Dashboard
```javascript
// Time-series sales data
db.sales.aggregate([
  {
    $group: {
      _id: {
        year: { $year: "$date" },
        month: { $month: "$date" }
      },
      revenue: { $sum: "$total" },
      orders: { $sum: 1 }
    }
  },
  { $sort: { "_id.year": 1, "_id.month": 1 } },
  { $out: "monthly_sales" }
]);
```

---

## 🔄 Progressive Enhancement Strategy

### Phase 1: Foundation (Week 1-2)
- Complete Labs 1-3 with basic features
- Understand core MongoDB concepts
- Build solid query skills

### Phase 2: Enhancement (Week 3-4)
- Add change streams to Lab 1
- Implement schema validation in Lab 2
- Integrate Atlas Search in Lab 3

### Phase 3: Advanced (Week 5-6)
- Implement time-series for metrics
- Add vector search for recommendations
- Create Charts dashboards

### Phase 4: Production (Week 7-8)
- Combine all features
- Performance optimization
- Security hardening

---

## 🎯 Integration Checklist

### For Each Lab Enhancement

- [ ] **Change Streams**
  - [ ] Identify real-time requirements
  - [ ] Implement change stream listeners
  - [ ] Handle resume tokens
  - [ ] Test failover scenarios

- [ ] **Time-Series**
  - [ ] Identify time-based data
  - [ ] Migrate to time-series collections
  - [ ] Set appropriate granularity
  - [ ] Configure retention policies

- [ ] **Atlas Search**
  - [ ] Create search indexes
  - [ ] Implement fuzzy matching
  - [ ] Add faceted search
  - [ ] Enable autocomplete

- [ ] **Vector Search**
  - [ ] Generate embeddings
  - [ ] Create vector indexes
  - [ ] Implement similarity search
  - [ ] Combine with text search

- [ ] **GridFS**
  - [ ] Identify large file requirements
  - [ ] Implement upload/download
  - [ ] Add metadata search
  - [ ] Handle streaming

- [ ] **Charts**
  - [ ] Connect data sources
  - [ ] Create visualizations
  - [ ] Build dashboards
  - [ ] Set up auto-refresh

---

## 🚀 Performance Impact

### Metrics Improvements

| Feature | Storage | Query Speed | Write Speed | Complexity |
|---------|---------|-------------|-------------|------------|
| Change Streams | No change | No change | -5% | Medium |
| Time-Series | -70% | +400% | +20% | Low |
| Atlas Search | +20% | +500% | No change | Medium |
| Vector Search | +30% | +300% | -10% | High |
| GridFS | Separate | N/A | Good | Low |

### Resource Requirements

| Feature | RAM | CPU | Network | Storage |
|---------|-----|-----|---------|---------|
| Change Streams | Low | Low | Medium | None |
| Time-Series | Medium | Low | Low | Compressed |
| Atlas Search | High | Medium | Low | +20% |
| Vector Search | High | High | Medium | +30% |
| GridFS | Low | Low | High | Separate |

---

## 🔐 Security Considerations

### For Each Modern Feature

1. **Change Streams**
   - Secure resume token storage
   - Rate limit event processing
   - Validate change events

2. **Atlas Search**
   - Control index access
   - Sanitize search queries
   - Limit result exposure

3. **Vector Search**
   - Protect embedding models
   - Validate vector dimensions
   - Rate limit similarity queries

4. **GridFS**
   - Implement access controls
   - Scan uploaded files
   - Limit file sizes

---

## 📚 Additional Resources

### Documentation
- [Change Streams Guide](https://docs.mongodb.com/manual/changeStreams/)
- [Time-Series Collections](https://docs.mongodb.com/manual/core/timeseries-collections/)
- [Atlas Search](https://docs.atlas.mongodb.com/atlas-search/)
- [Vector Search](https://www.mongodb.com/docs/atlas/atlas-vector-search/)
- [GridFS](https://docs.mongodb.com/manual/core/gridfs/)
- [MongoDB Charts](https://www.mongodb.com/products/charts)

### Sample Applications
- [Real-time Dashboard](https://github.com/mongodb/change-streams-demo)
- [E-commerce Search](https://github.com/mongodb/atlas-search-demo)
- [AI Chatbot](https://github.com/mongodb/vector-search-demo)

---

*By integrating these modern features, you transform the basic labs into production-ready applications that leverage MongoDB's full capabilities.*

*Last Updated: December 2024*