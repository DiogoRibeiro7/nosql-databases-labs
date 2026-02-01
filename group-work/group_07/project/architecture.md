# Architecture & Data Model

## Domain Snapshot

This project focuses on the analysis of motion data collected from IoT devices equipped with inertial sensors. Each device continuously generates sensor readings while the user is in motion, such as during walking, running, or other physical activities. The system is designed to answer questions such as:

1. How intense is the user's movement over time?
2. When do peaks of activity or abrupt movements occur?
3. Which periods correspond to stable or low-movement behaviour?
4. How do acceleration, rotation, gravity and orientation relate to each other?

The solution must efficiently store high-frequency sensor data and support complex analytical queries.

## Collections

| Collection | Role | Notes |
|------------|------|-------|
| `motion_data` | Fact / telemetry data | Each document represents a single sensor reading with embedded motion and orientation data from IoT devices. |

## Schema Highlights

```javascript
// motion_data
{
  _id: ObjectId('69692cc74273119626dfcd5b'),
  userAcceleration: { 
    x: -0.024607, 
    y: -0.168127, 
    z: -0.236179 
  },
  rotationRate: { 
    x: -0.9732940000000001, 
    y: -0.517763, 
    z: -0.941154 
  },
  gravity: { 
    x: -0.208364, 
    y: 0.962102, 
    z: 0.17590699999999998 
  },
  attitude: { 
    roll: -2.271929,
    pitch: -1.29461, 
    yaw: -3.0268509999999997
  }
}
```

## Modeling Decisions

### Single collection for sensor readings
Each sensor measurement is stored as an independent document. This approach matches the nature of IoT data, where readings are generated frequently and do not require transactional relationships. The high write volume and temporal nature of the data make a single collection optimal for both ingestion and analysis.

### Embedded documents for vector data
Acceleration, rotation, gravity and orientation are stored as embedded objects with x, y and z components (pitch, roll, yaw for attitude). This keeps related values together and simplifies aggregation pipelines that compute magnitudes, statistical metrics, or vector operations without requiring additional lookups.

### No normalization or cross-collection references
Since the project focuses on motion analysis rather than user or device management, all relevant sensor data is stored within a single collection. This avoids joins and improves query performance for analytical workloads.

### Optimized for analytical workloads
The data model prioritizes read-heavy analytical queries, such as filtering by thresholds, computing averages and percentiles, detecting extreme values, and statistical aggregations. The document structure minimizes complexity and supports MongoDB's aggregation framework for motion analysis.

## Relationships & Access Patterns

### Relationships
There are no inter-collection relationships in the current model. All queries scan or aggregate documents within `motion_data`.

### Common Access Patterns
- **Threshold filtering**: Identify readings where acceleration or rotation magnitude exceeds a defined threshold to detect sudden movements or impacts
- **Statistical aggregations**: Compute min/max/avg/percentile values across acceleration, rotation, gravity, or attitude fields
- **Magnitude calculations**: Calculate derived fields such as `sqrt(x² + y² + z²)` for acceleration or rotation vectors during aggregation
- **Extreme event detection**: Sort by computed magnitude values to identify the most intense movement events
- **Cross-vector correlation**: Analyze relationships between acceleration, rotation, gravity, and attitude changes
- **Distribution analysis**: Group readings by magnitude ranges to understand movement intensity distribution
- **Global statistics**: Calculate dataset-wide metrics to understand overall motion patterns

## Index Blueprint

Given the analytical nature of the queries, indexing strategies focus on improving filtering and sorting operations on computed values:

### Optional Indexes

```javascript
// Optional: Composite index on acceleration components
{ "userAcceleration.x": 1, "userAcceleration.y": 1, "userAcceleration.z": 1 }

// Optional: Composite index on rotation components  
{ "rotationRate.x": 1, "rotationRate.y": 1, "rotationRate.z": 1 }

// Optional: Composite index on gravity components
{ "gravity.x": 1, "gravity.y": 1, "gravity.z": 1 }

// Optional: Composite index on attitude components
{ "attitude.roll": 1, "attitude.pitch": 1, "attitude.yaw": 1 }
```

### Index Rationale
These indexes are marked as **optional** because:
- Most analytical queries compute derived values (magnitudes) in the aggregation pipeline rather than filtering on individual components
- Aggregation-heavy queries that scan the entire collection are primarily CPU-bound and benefit more from the document structure than from extensive indexing
- For smaller datasets (thousands to low millions of documents), full collection scans may be more efficient than maintaining indexes
- Indexes consume storage and slow down write operations, which may be significant given the high-frequency nature of sensor data

**When to create indexes:**
- If filtering by specific acceleration/rotation/gravity thresholds becomes a common query pattern
- If the dataset grows large enough (millions of documents) that full scans become prohibitively slow
- If queries consistently filter on specific component ranges before aggregation

Indexes can be provisioned via dedicated scripts (`queries/index_blueprint.mongosh.js`) to allow easy re-creation after data reloads or collection drops.

## Summary

This architecture adopts a simple and efficient document-based data model that aligns with real-world IoT sensor data patterns. By storing each sensor reading as a self-contained document and leveraging MongoDB's aggregation framework, the system supports flexible, high-performance analysis of motion patterns. The model is suitable for wearable devices, mobile sensors, fitness trackers, and other IoT scenarios requiring motion analysis.
