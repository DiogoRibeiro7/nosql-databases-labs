# NoSQL Databases - Final Project Specifications

## Project 1: Real-Time Social Media Analytics Platform

### Project Overview

Build a Twitter/X-like social media analytics platform using MongoDB to handle posts, user interactions, and real-time analytics. The system should support high-velocity data ingestion and complex analytical queries.

### Functional Requirements

#### 1.1 Core Entities

- **Users**: Profile information, followers/following relationships
- **Posts**: Text content, media references, timestamps, engagement metrics
- **Interactions**: Likes, reposts, comments, views
- **Hashtags**: Trending topics and associations
- **Analytics**: Aggregated metrics and time-series data

#### 1.2 Key Features

- User timeline generation
- Real-time trending hashtags (last 1h, 24h, 7d)
- User engagement analytics
- Content recommendation based on interactions
- Search functionality (users, posts, hashtags)

### Technical Requirements

#### 2.1 Data Models

```javascript
// User Document
{
  _id: ObjectId,
  username: String (unique index),
  email: String (unique index),
  profile: {
    displayName: String,
    bio: String,
    avatarUrl: String,
    location: String,
    joinedDate: Date,
    verified: Boolean
  },
  stats: {
    followers: Number,
    following: Number,
    posts: Number
  },
  settings: {
    isPrivate: Boolean,
    notifications: Object
  },
  createdAt: Date,
  updatedAt: Date
}

// Post Document
{
  _id: ObjectId,
  userId: ObjectId (index),
  content: {
    text: String (text index),
    media: [{
      type: String, // image, video, gif
      url: String,
      thumbnailUrl: String
    }],
    mentions: [String], // usernames
    hashtags: [String] (index)
  },
  engagement: {
    likes: Number,
    reposts: Number,
    comments: Number,
    views: Number
  },
  repostOf: ObjectId, // null if original
  inReplyTo: ObjectId, // null if not a reply
  visibility: String, // public, followers, private
  createdAt: Date (index),
  updatedAt: Date
}

// Interaction Document
{
  _id: ObjectId,
  userId: ObjectId (compound index with type),
  postId: ObjectId (compound index with type),
  type: String, // like, repost, view
  createdAt: Date
}

// Follow Relationship Document
{
  _id: ObjectId,
  followerId: ObjectId (index),
  followingId: ObjectId (index),
  createdAt: Date
}

// Hashtag Analytics Document (Time-Series Collection)
{
  timestamp: Date,
  hashtag: String,
  count: Number,
  metadata: {
    topPosts: [ObjectId],
    uniqueUsers: Number
  }
}
```

#### 2.2 Required Indexes

```javascript
// Users Collection
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ "profile.displayName": "text" });

// Posts Collection
db.posts.createIndex({ userId: 1, createdAt: -1 });
db.posts.createIndex({ "content.hashtags": 1 });
db.posts.createIndex({ "content.text": "text" });
db.posts.createIndex({ createdAt: -1 });
db.posts.createIndex({ "engagement.likes": -1 });

// Interactions Collection
db.interactions.createIndex({ userId: 1, type: 1, createdAt: -1 });
db.interactions.createIndex({ postId: 1, type: 1 });
db.interactions.createIndex({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days TTL

// Follows Collection
db.follows.createIndex({ followerId: 1, followingId: 1 }, { unique: true });
db.follows.createIndex({ followingId: 1 });
```

#### 2.3 Key Aggregation Pipelines

```javascript
// Get User Timeline
db.posts.aggregate([
  {
    $match: {
      userId: { $in: followedUserIds },
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
  },
  {
    $lookup: {
      from: "users",
      localField: "userId",
      foreignField: "_id",
      as: "author",
    },
  },
  { $unwind: "$author" },
  { $sort: { createdAt: -1 } },
  { $limit: 50 },
]);

// Trending Hashtags
db.posts.aggregate([
  {
    $match: {
      createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) }, // Last hour
    },
  },
  { $unwind: "$content.hashtags" },
  {
    $group: {
      _id: "$content.hashtags",
      count: { $sum: 1 },
      uniqueUsers: { $addToSet: "$userId" },
      topPost: { $first: "$_id" },
    },
  },
  {
    $project: {
      hashtag: "$_id",
      count: 1,
      uniqueUsers: { $size: "$uniqueUsers" },
      topPost: 1,
    },
  },
  { $sort: { count: -1 } },
  { $limit: 10 },
]);
```

### Implementation Requirements

#### 3.1 Data Generation Script

- Generate 10,000 users
- Generate 100,000 posts with realistic distribution
- Generate 1,000,000 interactions
- Implement power-law distribution for follower counts

#### 3.2 Required Queries

1. Get user timeline (posts from followed users)
2. Get trending hashtags (1h, 24h, 7d windows)
3. Search posts by text
4. Get user engagement metrics
5. Find top influencers by follower count
6. Get post thread (replies chain)
7. Recommendation algorithm (users to follow)

#### 3.3 Performance Requirements

- Timeline query < 100ms for 1000 followed users
- Trending hashtags < 500ms
- Post creation with analytics update < 50ms

### Deliverables

1. **Schema Design Document** (DESIGN.md)

- Justify embedding vs reference decisions
- Explain index strategy
- Discuss scalability considerations

2. **Implementation**

- Data generation scripts
- All required queries with examples
- Performance benchmarking script
- Basic CLI or web interface for testing

3. **Analysis Report**

- Performance metrics for each query type
- Scalability analysis
- Optimization strategies employed
- Lessons learned

### Bonus Challenges

- Implement change streams for real-time notifications
- Add geospatial queries for location-based posts
- Implement post recommendations using collaborative filtering
- Design sharding strategy for horizontal scaling

---

## Project 2: E-Commerce Recommendation Engine

### Project Overview

Design and implement a complete e-commerce backend with focus on product catalog management, user behavior tracking, and sophisticated recommendation algorithms using MongoDB.

### Functional Requirements

#### 1.1 Core Features

- Product catalog with categories and variants
- Shopping cart and order management
- User behavior tracking (views, purchases, cart additions)
- Multiple recommendation strategies
- Search with faceted filtering
- Inventory management with real-time updates
- Review and rating system

#### 1.2 Business Rules

- Products can have multiple variants (size, color)
- Prices can vary by variant
- Inventory tracked at variant level
- Orders must be atomic transactions
- Reviews require verified purchases

### Technical Requirements

#### 2.1 Data Models

```javascript
// Product Document
{
  _id: ObjectId,
  sku: String (unique index),
  name: String (text index),
  slug: String (unique index),
  description: String,
  category: {
    main: String,
    sub: [String],
    path: String // "Electronics/Computers/Laptops"
  },
  brand: String (index),
  variants: [{
    variantId: ObjectId,
    sku: String,
    attributes: {
      color: String,
      size: String,
      // ... other attributes
    },
    price: {
      regular: Decimal128,
      sale: Decimal128,
      currency: String
    },
    inventory: {
      quantity: Number,
      reserved: Number,
      available: Number // quantity - reserved
    },
    images: [String]
  }],
  specifications: Object, // Flexible schema for product-specific specs
  tags: [String] (index),
  ratings: {
    average: Decimal128,
    count: Number,
    distribution: {
      5: Number,
      4: Number,
      3: Number,
      2: Number,
      1: Number
    }
  },
  seo: {
    title: String,
    description: String,
    keywords: [String]
  },
  status: String, // active, discontinued, draft
  createdAt: Date,
  updatedAt: Date
}

// User Document
{
  _id: ObjectId,
  email: String (unique index),
  profile: {
    firstName: String,
    lastName: String,
    dateOfBirth: Date,
    gender: String,
    preferences: {
      categories: [String],
      brands: [String],
      priceRange: {
        min: Number,
        max: Number
      }
    }
  },
  addresses: [{
    type: String, // billing, shipping
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
    isDefault: Boolean
  }],
  cart: {
    items: [{
      productId: ObjectId,
      variantId: ObjectId,
      quantity: Number,
      addedAt: Date
    }],
    updatedAt: Date
  },
  wishlist: [ObjectId], // Product IDs
  recentlyViewed: [{
    productId: ObjectId,
    viewedAt: Date
  }], // Capped at 50 items
  createdAt: Date
}

// Order Document
{
  _id: ObjectId,
  orderNumber: String (unique index),
  userId: ObjectId (index),
  status: String, // pending, processing, shipped, delivered, cancelled
  items: [{
    productId: ObjectId,
    variantId: ObjectId,
    sku: String,
    name: String,
    price: Decimal128,
    quantity: Number,
    subtotal: Decimal128
  }],
  pricing: {
    subtotal: Decimal128,
    tax: Decimal128,
    shipping: Decimal128,
    discount: Decimal128,
    total: Decimal128
  },
  payment: {
    method: String,
    transactionId: String,
    status: String
  },
  shipping: {
    address: Object,
    method: String,
    trackingNumber: String,
    estimatedDelivery: Date
  },
  timestamps: {
    placed: Date,
    processed: Date,
    shipped: Date,
    delivered: Date
  }
}

// User Behavior Document (Time-Series Collection)
{
  timestamp: Date,
  userId: ObjectId,
  sessionId: String,
  eventType: String, // view, add_to_cart, purchase, search
  productId: ObjectId,
  variantId: ObjectId,
  metadata: {
    searchQuery: String,
    referrer: String,
    deviceType: String,
    // Event-specific data
  }
}

// Review Document
{
  _id: ObjectId,
  productId: ObjectId (index),
  userId: ObjectId,
  orderId: ObjectId,
  rating: Number (index),
  title: String,
  content: String,
  pros: [String],
  cons: [String],
  images: [String],
  verified: Boolean,
  helpful: {
    yes: Number,
    no: Number
  },
  createdAt: Date (index)
}
```

#### 2.2 Aggregation Pipelines

```javascript
// Product Recommendations - Collaborative Filtering
db.orders.aggregate([
  // Find users who bought the same products
  {
    $match: {
      "items.productId": { $in: userPurchasedProducts },
    },
  },
  { $unwind: "$items" },
  {
    $group: {
      _id: "$items.productId",
      purchaseCount: { $sum: 1 },
      buyers: { $addToSet: "$userId" },
    },
  },
  {
    $match: {
      _id: { $nin: userPurchasedProducts },
    },
  },
  { $sort: { purchaseCount: -1 } },
  { $limit: 10 },
  {
    $lookup: {
      from: "products",
      localField: "_id",
      foreignField: "_id",
      as: "product",
    },
  },
]);

// Faceted Search
db.products.aggregate([
  {
    $match: {
      $text: { $search: searchQuery },
      status: "active",
    },
  },
  {
    $facet: {
      products: [{ $skip: skip }, { $limit: limit }],
      categories: [
        { $group: { _id: "$category.main", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ],
      brands: [{ $group: { _id: "$brand", count: { $sum: 1 } } }, { $sort: { count: -1 } }],
      priceRanges: [
        {
          $bucket: {
            groupBy: "$variants.price.regular",
            boundaries: [0, 25, 50, 100, 200, 500, 1000],
            default: "1000+",
            output: { count: { $sum: 1 } },
          },
        },
      ],
      totalCount: [{ $count: "total" }],
    },
  },
]);
```

### Implementation Requirements

#### 3.1 Required Features

1. **Product Management**

- CRUD operations for products
- Bulk import from CSV/JSON
- Variant management
- Inventory tracking

2. **Search & Discovery**

- Full-text search
- Faceted filtering
- Sort by price, rating, popularity
- Category browsing

3. **Recommendations**

- "Customers who bought this also bought"
- "Based on your browsing history"
- "Trending in your preferred categories"
- "Similar products" (content-based)

4. **Cart & Checkout**

- Add/remove items with inventory check
- Price calculations
- Order placement with transaction
- Inventory reservation

5. **Analytics Queries**

- Best selling products
- Category performance
- User segmentation
- Conversion funnel

#### 3.2 Transaction Requirements

```javascript
// Order Placement Transaction
const session = await mongoose.startSession();
session.startTransaction();
try {
  // 1\. Check and reserve inventory
  // 2\. Create order
  // 3\. Update inventory
  // 4\. Clear user cart
  // 5\. Record analytics event
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

### Deliverables

1. **Data Model Documentation**

- Entity relationship diagrams
- Denormalization decisions
- Index strategy

2. **Implementation**

- Product catalog with 10,000 products
- Order processing system
- Three recommendation algorithms
- Search with facets
- Performance test suite

3. **Analytics Dashboard**

- Sales metrics
- Popular products
- User behavior patterns
- Inventory alerts

### Bonus Challenges

- Implement real-time inventory sync across warehouses
- Add personalized pricing
- Build recommendation A/B testing framework
- Implement distributed cart for scalability

---

## Project 3: IoT Sensor Data Management System

### Project Overview

Design a comprehensive IoT data platform capable of ingesting, storing, and analyzing high-velocity sensor data using MongoDB's time-series collections and analytics capabilities.

### Functional Requirements

#### 1.1 System Capabilities

- Ingest data from 10,000+ sensors
- Support multiple sensor types (temperature, humidity, pressure, motion, etc.)
- Real-time anomaly detection
- Historical data analysis
- Alerting system based on thresholds
- Data aggregation at multiple time granularities
- Geospatial queries for sensor locations

#### 1.2 Data Characteristics

- High frequency updates (every 10 seconds per sensor)
- Data retention policies (raw: 7 days, hourly: 1 year, daily: 5 years)
- Automatic data rollups
- Compression for historical data

### Technical Requirements

#### 2.1 Data Models

```javascript
// Sensor Registry Document
{
  _id: ObjectId,
  sensorId: String (unique index),
  type: String, // temperature, humidity, pressure, motion
  manufacturer: String,
  model: String,
  location: {
    type: "Point",
    coordinates: [longitude, latitude] // GeoJSON format
  },
  installation: {
    building: String,
    floor: Number,
    room: String,
    zone: String
  },
  metadata: {
    unit: String, // celsius, fahrenheit, percentage
    range: {
      min: Number,
      max: Number
    },
    accuracy: Number,
    calibration: {
      lastDate: Date,
      nextDate: Date
    }
  },
  status: String, // active, maintenance, offline
  alerts: [{
    condition: String, // "value > 30"
    severity: String, // critical, warning, info
    action: String, // email, sms, webhook
    recipients: [String]
  }],
  tags: [String],
  createdAt: Date,
  updatedAt: Date
}

// Raw Sensor Data (Time-Series Collection)
{
  timestamp: Date,
  metadata: {
    sensorId: String,
    type: String,
    location: String
  },
  value: Number,
  quality: Number, // 0-100 data quality score
  // Time-series collection optimized fields
}

// Aggregated Data (Hourly)
{
  _id: ObjectId,
  sensorId: String (compound index with timestamp),
  timestamp: Date, // Rounded to hour
  type: String,
  stats: {
    min: Number,
    max: Number,
    avg: Number,
    stdDev: Number,
    count: Number,
    sum: Number
  },
  percentiles: {
    p50: Number,
    p95: Number,
    p99: Number
  },
  quality: {
    avgQuality: Number,
    missingData: Number
  }
}

// Anomaly Document
{
  _id: ObjectId,
  sensorId: String (index),
  detectedAt: Date (index),
  type: String, // spike, drift, offline, pattern
  severity: String,
  details: {
    expectedRange: { min: Number, max: Number },
    actualValue: Number,
    deviation: Number,
    duration: Number // seconds
  },
  status: String, // active, resolved, acknowledged
  resolution: {
    resolvedAt: Date,
    resolvedBy: String,
    action: String
  }
}

// Alert History Document
{
  _id: ObjectId,
  sensorId: String,
  anomalyId: ObjectId,
  triggeredAt: Date (index),
  alert: {
    condition: String,
    severity: String,
    message: String
  },
  notifications: [{
    method: String,
    recipient: String,
    sentAt: Date,
    status: String
  }]
}
```

#### 2.2 Time-Series Collection Configuration

```javascript
// Create time-series collection for raw data
db.createCollection("sensor_data", {
  timeseries: {
    timeField: "timestamp",
    metaField: "metadata",
    granularity: "seconds",
  },
  expireAfterSeconds: 604800, // 7 days
});

// Indexes for time-series collection
db.sensor_data.createIndex({ "metadata.sensorId": 1, timestamp: -1 });
db.sensor_data.createIndex({ "metadata.type": 1, timestamp: -1 });
```

#### 2.3 Complex Aggregations

```javascript
// Real-time moving average (last 5 minutes)
db.sensor_data.aggregate([
  {
    $match: {
      "metadata.sensorId": sensorId,
      timestamp: { $gte: new Date(Date.now() - 5 * 60 * 1000) },
    },
  },
  {
    $setWindowFields: {
      partitionBy: "$metadata.sensorId",
      sortBy: { timestamp: 1 },
      output: {
        movingAverage: {
          $avg: "$value",
          window: {
            range: [-300, 0],
            unit: "second",
          },
        },
      },
    },
  },
]);

// Anomaly detection using statistical analysis
db.sensor_data.aggregate([
  {
    $match: {
      timestamp: { $gte: new Date(Date.now() - 60 * 60 * 1000) },
    },
  },
  {
    $group: {
      _id: "$metadata.sensorId",
      values: { $push: "$value" },
      avg: { $avg: "$value" },
      stdDev: { $stdDevPop: "$value" },
    },
  },
  {
    $unwind: "$values",
  },
  {
    $project: {
      sensorId: "$_id",
      value: "$values",
      avg: 1,
      stdDev: 1,
      zScore: {
        $divide: [{ $subtract: ["$values", "$avg"] }, "$stdDev"],
      },
    },
  },
  {
    $match: {
      $or: [{ zScore: { $gt: 3 } }, { zScore: { $lt: -3 } }],
    },
  },
]);

// Geospatial query for sensors in area
db.sensors.aggregate([
  {
    $geoNear: {
      near: { type: "Point", coordinates: [lon, lat] },
      distanceField: "distance",
      maxDistance: 1000, // meters
      spherical: true,
    },
  },
  {
    $lookup: {
      from: "sensor_data",
      let: { sensorId: "$sensorId" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$metadata.sensorId", "$$sensorId"] },
            timestamp: { $gte: new Date(Date.now() - 60 * 1000) },
          },
        },
        { $sort: { timestamp: -1 } },
        { $limit: 1 },
      ],
      as: "latestReading",
    },
  },
]);
```

### Implementation Requirements

#### 3.1 Data Ingestion System

1. **Simulator Script**

- Generate realistic sensor data
- Support multiple sensor types
- Introduce anomalies and patterns
- Variable data rates

2. **Bulk Ingestion**

- Batch inserts for efficiency
- Handle out-of-order data
- Data validation
- Error handling and retry logic

#### 3.2 Data Processing Pipeline

1. **Real-time Processing**

- Anomaly detection
- Threshold monitoring
- Alert generation
- Moving averages

2. **Batch Processing**

- Hourly aggregations
- Daily rollups
- Data quality metrics
- Trend analysis

#### 3.3 Query Requirements

1. Get latest readings for all sensors
2. Time-series data for specific sensor
3. Sensors exceeding thresholds
4. Geospatial queries (nearby sensors)
5. Statistical analysis (patterns, trends)
6. Anomaly history
7. System health dashboard

### Deliverables

1. **Architecture Document**

- Data flow diagram
- Collection design rationale
- Scaling strategy
- Data retention implementation

2. **Implementation**

- Sensor data simulator
- Ingestion pipeline
- Real-time analytics
- Alert system
- Performance benchmarks

3. **Visualization**

- Real-time dashboard mockup
- Historical trend analysis
- Anomaly detection interface
- Geospatial visualization

### Bonus Challenges

- Implement predictive maintenance using ML
- Add edge computing simulation
- Multi-tenant isolation
- Data compression strategies
- Implement change streams for real-time updates

---

## Project 4: Healthcare Patient Records System

### Project Overview

Design a HIPAA-compliant patient records system focusing on complex medical data modeling, access control, audit trails, and analytics while ensuring data privacy and security.

### Functional Requirements

#### 1.1 Core Features

- Patient demographic and medical history
- Clinical documentation (visits, diagnoses, treatments)
- Laboratory results and imaging records
- Prescription management
- Appointment scheduling
- Insurance and billing information
- Provider collaboration tools
- Comprehensive audit logging

#### 1.2 Compliance Requirements

- HIPAA compliance for data privacy
- Audit trails for all data access
- Role-based access control (RBAC)
- Data encryption at rest and in transit
- Patient consent management
- Data retention policies

### Technical Requirements

#### 2.1 Data Models

```javascript
// Patient Document
{
  _id: ObjectId,
  patientId: String (unique index, encrypted),
  demographics: {
    firstName: String (encrypted),
    lastName: String (encrypted),
    dateOfBirth: Date (encrypted),
    gender: String,
    ssn: String (encrypted),
    contact: {
      phone: String (encrypted),
      email: String (encrypted),
      address: {
        street: String (encrypted),
        city: String,
        state: String,
        zipCode: String
      }
    }
  },
  emergency: [{
    name: String (encrypted),
    relationship: String,
    phone: String (encrypted)
  }],
  insurance: [{
    provider: String,
    policyNumber: String (encrypted),
    groupNumber: String,
    effectiveDate: Date,
    expirationDate: Date
  }],
  allergies: [{
    allergen: String,
    reaction: String,
    severity: String, // mild, moderate, severe
    onsetDate: Date,
    status: String // active, inactive
  }],
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    prescribedBy: ObjectId,
    startDate: Date,
    endDate: Date,
    status: String // active, discontinued, completed
  }],
  medicalHistory: {
    conditions: [{
      diagnosis: String,
      icdCode: String,
      diagnosedDate: Date,
      status: String // active, resolved, chronic
    }],
    surgeries: [{
      procedure: String,
      date: Date,
      hospital: String,
      surgeon: String,
      notes: String
    }],
    familyHistory: [{
      relationship: String,
      condition: String,
      ageAtDiagnosis: Number
    }]
  },
  preferences: {
    language: String,
    communicationMethod: String,
    consentFlags: {
      shareWithSpecialists: Boolean,
      researchParticipation: Boolean,
      marketingCommunication: Boolean
    }
  },
  tags: [String], // high-risk, vip, etc.
  createdAt: Date,
  updatedAt: Date
}

// Clinical Encounter Document
{
  _id: ObjectId,
  encounterId: String (unique index),
  patientId: ObjectId (index),
  providerId: ObjectId (index),
  type: String, // office visit, emergency, telemedicine
  dateTime: Date (index),
  location: {
    facility: String,
    department: String,
    room: String
  },
  chiefComplaint: String,
  vitals: {
    bloodPressure: {
      systolic: Number,
      diastolic: Number
    },
    heartRate: Number,
    temperature: Number,
    weight: Number,
    height: Number,
    bmi: Number,
    respiratoryRate: Number,
    oxygenSaturation: Number
  },
  assessment: {
    symptoms: [String],
    physicalExam: Object, // Flexible schema
    diagnoses: [{
      code: String, // ICD-10
      description: String,
      type: String // primary, secondary
    }]
  },
  plan: {
    medications: [{
      name: String,
      dosage: String,
      instructions: String,
      quantity: Number,
      refills: Number
    }],
    procedures: [{
      code: String, // CPT code
      description: String,
      notes: String
    }],
    followUp: {
      required: Boolean,
      timeframe: String,
      withSpecialist: String
    }
  },
  notes: {
    subjective: String,
    objective: String,
    assessment: String,
    plan: String
  },
  attachments: [{
    type: String, // lab, imaging, document
    fileId: ObjectId,
    description: String,
    uploadedAt: Date
  }],
  billing: {
    charges: [{
      code: String,
      description: String,
      amount: Decimal128
    }],
    insurance: ObjectId,
    copay: Decimal128
  },
  status: String, // draft, signed, amended
  signedBy: ObjectId,
  signedAt: Date
}

// Lab Result Document
{
  _id: ObjectId,
  patientId: ObjectId (index),
  encounterId: ObjectId,
  orderedBy: ObjectId,
  orderDate: Date,
  collectionDate: Date,
  resultDate: Date (index),
  lab: {
    name: String,
    accessionNumber: String
  },
  tests: [{
    name: String,
    code: String,
    result: String,
    value: Number,
    unit: String,
    referenceRange: {
      min: Number,
      max: Number
    },
    flag: String, // normal, high, low, critical
    status: String // final, preliminary, corrected
  }],
  comments: String,
  reviewedBy: ObjectId,
  reviewedAt: Date
}

// Audit Log Document
{
  _id: ObjectId,
  timestamp: Date (index),
  userId: ObjectId (index),
  userRole: String,
  action: String, // view, create, update, delete, print, export
  resource: {
    collection: String,
    documentId: ObjectId,
    patientId: ObjectId (index)
  },
  details: {
    fields: [String], // which fields were accessed/modified
    previousValues: Object, // for updates
    query: Object, // for searches
    reason: String // access justification
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    sessionId: String,
    applicationVersion: String
  },
  compliance: {
    hasConsent: Boolean,
    emergencyAccess: Boolean,
    breakGlassUsed: Boolean
  }
}

// Provider Document
{
  _id: ObjectId,
  npi: String (unique index),
  name: {
    first: String,
    last: String,
    title: String
  },
  credentials: [String], // MD, DO, NP, etc.
  specialties: [String],
  contact: {
    phone: String,
    email: String,
    fax: String
  },
  facilities: [{
    name: String,
    department: String,
    privileges: [String]
  }],
  schedule: {
    defaultHours: Object,
    exceptions: [{
      date: Date,
      available: Boolean,
      reason: String
    }]
  },
  patients: [ObjectId], // Assigned patients
  status: String // active, inactive, suspended
}
```

#### 2.2 Security Implementation

```javascript
// Field-level encryption configuration
const encryption = {
  keyVaultNamespace: "encryption.__dataKeys",
  kmsProviders: {
    local: {
      key: Buffer.from(process.env.MASTER_KEY, "base64"),
    },
  },
  schemaMap: {
    "healthcare.patients": {
      bsonType: "object",
      encryptMetadata: {
        keyId: [UUID], // Reference to data key
      },
      properties: {
        "demographics.firstName": {
          encrypt: {
            bsonType: "string",
            algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
          },
        },
        "demographics.ssn": {
          encrypt: {
            bsonType: "string",
            algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
          },
        },
        // ... other encrypted fields
      },
    },
  },
};

// Role-based access control
const roles = {
  physician: {
    read: ["patients", "encounters", "labs", "medications"],
    write: ["encounters", "medications"],
    restrictions: {
      patients: { filter: { providers: "$$USER_ID" } },
    },
  },
  nurse: {
    read: ["patients", "encounters", "vitals"],
    write: ["vitals"],
    restrictions: {
      encounters: { fields: { billing: 0 } },
    },
  },
  billing: {
    read: ["patients.insurance", "encounters.billing"],
    write: ["encounters.billing"],
  },
  admin: {
    read: ["*"],
    write: ["providers", "facilities"],
    audit: true,
  },
};
```

#### 2.3 Complex Queries

```javascript
// Patient summary with recent activity
db.patients.aggregate([
  { $match: { _id: patientId } },
  {
    $lookup: {
      from: "encounters",
      let: { patientId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$patientId", "$$patientId"] },
            dateTime: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
          },
        },
        { $sort: { dateTime: -1 } },
        { $limit: 5 },
      ],
      as: "recentEncounters",
    },
  },
  {
    $lookup: {
      from: "labs",
      let: { patientId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$patientId", "$$patientId"] },
            resultDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          },
        },
        { $sort: { resultDate: -1 } },
      ],
      as: "recentLabs",
    },
  },
]);

// Population health analytics
db.patients.aggregate([
  { $match: { "medicalHistory.conditions.diagnosis": "Diabetes" } },
  {
    $lookup: {
      from: "labs",
      let: { patientId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$patientId", "$$patientId"] },
            "tests.name": "Hemoglobin A1c",
          },
        },
        { $sort: { resultDate: -1 } },
        { $limit: 1 },
      ],
      as: "latestA1c",
    },
  },
  {
    $group: {
      _id: {
        controlled: {
          $cond: [
            { $lte: [{ $first: "$latestA1c.tests.value" }, 7] },
            "controlled",
            "uncontrolled",
          ],
        },
      },
      count: { $sum: 1 },
      avgA1c: { $avg: { $first: "$latestA1c.tests.value" } },
    },
  },
]);
```

### Implementation Requirements

#### 3.1 Core Functionality

1. **Patient Management**

- Complete medical records
- Document versioning
- Merge duplicate records
- Demographics updates with audit

2. **Clinical Documentation**

- SOAP notes
- Order entry (labs, imaging, referrals)
- e-Prescribing
- Clinical decision support

3. **Access Control**

- Role-based permissions
- Break-glass emergency access
- Consent-based sharing
- Provider collaboration

4. **Analytics & Reporting**

- Quality measures
- Population health metrics
- Clinical analytics
- Billing reports

#### 3.2 Compliance Features

- Automatic audit logging
- Data retention (7 years)
- Right to amendment
- Data portability (CCD export)
- Breach notification system

### Deliverables

1. **Design Documentation**

- HIPAA compliance matrix
- Security architecture
- Data flow diagrams
- Access control matrix

2. **Implementation**

- Schema with encryption
- RBAC implementation
- Audit system
- 10 complex medical queries
- Sample data generator (synthetic patients)

3. **Compliance Report**

- Security measures implemented
- Audit trail demonstration
- Performance impact of encryption
- Backup and recovery strategy

### Bonus Challenges

- Implement FHIR resource mappings
- Add blockchain for audit immutability
- Clinical decision support rules engine
- Natural language processing for clinical notes

---

## Project 5: Multi-Model Game Leaderboard System

### Project Overview

Build a comprehensive gaming platform backend that supports multiple game types, real-time leaderboards, player progression, social features, and tournament management using MongoDB's flexible schema design.

### Functional Requirements

#### 1.1 Core Features

- Support for multiple game types (puzzle, racing, battle royale, strategy)
- Real-time global and friend leaderboards
- Player profiles with statistics and achievements
- Match history and replay storage
- Tournament and season management
- Social features (friends, teams, guilds)
- In-game economy and virtual goods
- Anti-cheat detection system

#### 1.2 Performance Requirements

- Leaderboard updates < 100ms
- Support 100,000 concurrent players
- Real-time rank calculations
- Historical leaderboard snapshots
- Efficient pagination for large leaderboards

### Technical Requirements

#### 2.1 Data Models

```javascript
// Player Profile Document
{
  _id: ObjectId,
  playerId: String (unique index),
  username: String (unique index),
  displayName: String,
  avatar: {
    url: String,
    frameId: String,
    unlockedAvatars: [String]
  },
  account: {
    email: String (unique index),
    region: String,
    createdAt: Date,
    lastLogin: Date,
    playTime: Number, // total minutes
    status: String // active, banned, suspended
  },
  level: {
    current: Number,
    xp: Number,
    xpToNext: Number,
    prestige: Number
  },
  currency: {
    coins: Number,
    gems: Number,
    tickets: Number
  },
  social: {
    friends: [ObjectId], // Player IDs
    blocked: [ObjectId],
    teamId: ObjectId,
    guildId: ObjectId
  },
  settings: {
    privacy: String, // public, friends, private
    notifications: Object,
    matchmaking: {
      preferredRegion: String,
      skillBasedMatchmaking: Boolean
    }
  }
}

// Game Match Document (Polymorphic)
{
  _id: ObjectId,
  matchId: String (unique index),
  gameType: String (index), // puzzle, racing, battle_royale, strategy
  startTime: Date (index),
  endTime: Date,
  duration: Number, // seconds
  server: {
    region: String,
    instanceId: String
  },
  // Polymorphic game data based on gameType
  gameData: {
    // For puzzle games
    puzzle: {
      level: Number,
      moves: Number,
      combos: Number,
      powerUpsUsed: [String]
    },
    // For racing games
    racing: {
      track: String,
      laps: Number,
      bestLap: Number,
      position: Number,
      collisions: Number
    },
    // For battle royale
    battleRoyale: {
      map: String,
      placement: Number,
      eliminations: Number,
      damageDealt: Number,
      survivalTime: Number,
      lootCollected: [String]
    }
  },
  players: [{
    playerId: ObjectId (index),
    team: Number,
    score: Number (index),
    placement: Number,
    stats: Object, // Game-specific stats
    rewards: {
      xp: Number,
      coins: Number,
      items: [String]
    }
  }],
  metadata: {
    version: String,
    ranked: Boolean,
    tournamentId: ObjectId,
    seasonId: String
  }
}

// Leaderboard Document (Bucketed by time period)
{
  _id: ObjectId,
  type: String, // global, regional, friends, guild
  gameType: String,
  period: {
    type: String, // daily, weekly, monthly, season, alltime
    start: Date,
    end: Date
  },
  lastUpdated: Date,
  entries: [{
    rank: Number,
    playerId: ObjectId,
    username: String, // Denormalized for performance
    score: Number,
    wins: Number,
    matches: Number,
    movement: Number, // Rank change from previous period
    rewards: {
      claimed: Boolean,
      tier: String
    }
  }],
  metadata: {
    totalPlayers: Number,
    scoreThresholds: {
      top1Percent: Number,
      top10Percent: Number,
      top25Percent: Number
    }
  }
}

// Achievement Document
{
  _id: ObjectId,
  achievementId: String (unique index),
  category: String,
  name: String,
  description: String,
  icon: String,
  gameType: String, // null for platform achievements
  requirements: {
    type: String, // counter, unique, streak, special
    target: Number,
    conditions: Object
  },
  rewards: {
    xp: Number,
    title: String,
    avatar: String,
    currency: Object
  },
  rarity: {
    tier: String, // common, rare, epic, legendary
    unlockedBy: Number, // Percentage of players
  },
  hidden: Boolean
}

// Player Achievement Progress
{
  _id: ObjectId,
  playerId: ObjectId (compound index with achievementId),
  achievementId: ObjectId,
  progress: {
    current: Number,
    target: Number,
    percentage: Number
  },
  unlockedAt: Date,
  notified: Boolean
}

// Tournament Document
{
  _id: ObjectId,
  tournamentId: String (unique index),
  name: String,
  gameType: String,
  format: String, // single elimination, round robin, swiss
  status: String, // upcoming, active, completed
  schedule: {
    registration: {
      start: Date,
      end: Date
    },
    rounds: [{
      number: Number,
      startTime: Date,
      duration: Number
    }]
  },
  rules: {
    maxPlayers: Number,
    minLevel: Number,
    entryFee: Object,
    scoring: Object
  },
  participants: [{
    playerId: ObjectId,
    seed: Number,
    currentRound: Number,
    eliminated: Boolean,
    stats: {
      wins: Number,
      losses: Number,
      totalScore: Number
    }
  }],
  brackets: Object, // Tournament bracket structure
  prizes: [{
    placement: Number,
    rewards: Object
  }]
}

// Replay Data Document
{
  _id: ObjectId,
  matchId: ObjectId (index),
  compressed: Boolean,
  format: String, // json, binary
  data: Binary, // Compressed replay data
  metadata: {
    fileSize: Number,
    duration: Number,
    players: [String],
    highlights: [{
      timestamp: Number,
      type: String,
      description: String
    }]
  },
  views: Number,
  expiresAt: Date // TTL index
}
```

#### 2.2 Leaderboard Optimizations

```javascript
// Real-time leaderboard update
async function updateLeaderboard(gameType, playerId, score) {
  const session = await db.startSession();
  session.startTransaction();

  try {
    // Update player stats
    await db.players.updateOne(
      { _id: playerId },
      {
        $inc: {
          [`stats.${gameType}.totalScore`]: score,
          [`stats.${gameType}.matches`]: 1,
        },
        $max: { [`stats.${gameType}.bestScore`]: score },
      },
      { session }
    );

    // Update multiple leaderboards
    const updates = [
      // Global daily
      updateLeaderboardBucket("global", "daily", gameType, playerId, score),
      // Regional weekly
      updateLeaderboardBucket("regional", "weekly", gameType, playerId, score),
      // Friends
      updateFriendsLeaderboard(playerId, gameType, score),
    ];

    await Promise.all(updates);
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

// Efficient rank calculation
db.leaderboards.aggregate([
  {
    $match: {
      type: "global",
      gameType: gameType,
      "period.type": "daily",
      "period.start": todayStart,
    },
  },
  {
    $unwind: "$entries",
  },
  {
    $setWindowFields: {
      sortBy: { "entries.score": -1 },
      output: {
        "entries.rank": {
          $rank: {},
        },
        "entries.percentile": {
          $percentile: {
            input: "$entries.score",
            p: [0.99, 0.9, 0.75, 0.5],
          },
        },
      },
    },
  },
  {
    $group: {
      _id: "$_id",
      entries: { $push: "$entries" },
    },
  },
]);

// Friend leaderboard with user data
db.players.aggregate([
  {
    $match: { _id: playerId },
  },
  {
    $lookup: {
      from: "players",
      let: { friendIds: "$social.friends" },
      pipeline: [
        {
          $match: {
            $expr: { $in: ["$_id", "$$friendIds"] },
          },
        },
        {
          $project: {
            playerId: "$_id",
            username: 1,
            avatar: "$avatar.url",
            score: `$stats.${gameType}.weeklyScore`,
          },
        },
      ],
      as: "friendScores",
    },
  },
  {
    $unwind: "$friendScores",
  },
  {
    $sort: { "friendScores.score": -1 },
  },
  {
    $group: {
      _id: null,
      leaderboard: {
        $push: {
          rank: { $add: [{ $indexOfArray: ["$friendScores", "$friendScores"] }, 1] },
          player: "$friendScores",
        },
      },
    },
  },
]);
```

#### 2.3 Analytics Queries

```javascript
// Player retention analysis
db.players.aggregate([
  {
    $match: {
      "account.createdAt": {
        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
  },
  {
    $group: {
      _id: {
        cohortWeek: {
          $dateToString: {
            format: "%Y-W%V",
            date: "$account.createdAt",
          },
        },
      },
      totalPlayers: { $sum: 1 },
      day1Retention: {
        $sum: {
          $cond: [
            {
              $gte: ["$account.lastLogin", { $add: ["$account.createdAt", 24 * 60 * 60 * 1000] }],
            },
            1,
            0,
          ],
        },
      },
      day7Retention: {
        $sum: {
          $cond: [
            {
              $gte: [
                "$account.lastLogin",
                { $add: ["$account.createdAt", 7 * 24 * 60 * 60 * 1000] },
              ],
            },
            1,
            0,
          ],
        },
      },
    },
  },
  {
    $project: {
      cohort: "$_id.cohortWeek",
      totalPlayers: 1,
      day1Rate: {
        $multiply: [{ $divide: ["$day1Retention", "$totalPlayers"] }, 100],
      },
      day7Rate: {
        $multiply: [{ $divide: ["$day7Retention", "$totalPlayers"] }, 100],
      },
    },
  },
]);

// Matchmaking balance analysis
db.matches.aggregate([
  {
    $match: {
      gameType: "battle_royale",
      "metadata.ranked": true,
      startTime: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
  },
  {
    $unwind: "$players",
  },
  {
    $lookup: {
      from: "players",
      localField: "players.playerId",
      foreignField: "_id",
      as: "playerData",
    },
  },
  {
    $group: {
      _id: "$_id",
      avgLevel: { $avg: { $first: "$playerData.level.current" } },
      levelStdDev: { $stdDevPop: { $first: "$playerData.level.current" } },
    },
  },
  {
    $bucket: {
      groupBy: "$levelStdDev",
      boundaries: [0, 5, 10, 15, 20, 100],
      output: {
        count: { $sum: 1 },
        avgStdDev: { $avg: "$levelStdDev" },
      },
    },
  },
]);
```

### Implementation Requirements

#### 3.1 Core Systems

1. **Player Management**

- Registration and profiles
- Friend system
- Achievement tracking
- Progression system

2. **Match System**

- Matchmaking queues
- Result processing
- Replay storage
- Anti-cheat checks

3. **Leaderboard Engine**

- Real-time updates
- Multiple views (global, friends, regional)
- Historical snapshots
- Reward distribution

4. **Social Features**

- Friend invites
- Team/guild management
- Chat system (references)
- Activity feed

5. **Analytics Dashboard**

- Player metrics
- Game balance
- Revenue analytics
- Churn prediction

#### 3.2 Performance Requirements

- Support 10,000 concurrent matches
- Leaderboard updates within 100ms
- Friend leaderboard queries < 50ms
- Match history pagination < 100ms

### Deliverables

1. **System Design**

- Architecture diagram
- Schema design rationale
- Scaling strategy
- Caching approach

2. **Implementation**

- Data models for 3+ game types
- Leaderboard system
- Achievement engine
- Matchmaking simulator
- 20+ analytics queries

3. **Performance Analysis**

- Load testing results
- Query optimization report
- Bottleneck identification
- Scaling recommendations

### Bonus Challenges

- Implement ELO/MMR rating system
- Add spectator mode data structure
- Design guild war tournament system
- Implement anti-cheat detection patterns
- Add recommendation engine for friends/content

---

## General Project Guidelines

### Code Structure

```plaintext
project-root/
├── README.md                   # Setup and overview
├── docs/
│   ├── DESIGN.md              # Detailed design decisions
│   ├── API.md                 # API documentation
│   └── PERFORMANCE.md         # Performance analysis
├── docker-compose.yml         # MongoDB + app setup
├── src/
│   ├── models/               # Schema definitions
│   ├── scripts/
│   │   ├── seed.js          # Data generation
│   │   └── migrate.js       # Schema migrations
│   ├── queries/             # Organized by feature
│   └── analytics/           # Complex aggregations
├── tests/
│   ├── unit/               # Model tests
│   ├── integration/        # Query tests
│   └── performance/        # Load tests
└── dashboard/              # Optional UI
```

### Evaluation Rubric

- **Design Quality (30%)**: Schema decisions, index strategy, scalability
- **Implementation (40%)**: Code quality, feature completeness, error handling
- **Performance (20%)**: Query optimization, benchmark results, bottleneck analysis
- **Documentation (10%)**: Clarity, completeness, lessons learned

### Common Requirements

1. Minimum 10,000 documents in main collection
2. At least 10 complex aggregation queries
3. Performance benchmarks for all major operations
4. Proper error handling and data validation
5. Security considerations addressed
6. Clear setup instructions

### Technology Stack Options

- **Required**: MongoDB 7.0+
- **Recommended**: Node.js/Python for scripts
- **Optional**: Express.js API, React/Vue dashboard, Docker deployment
