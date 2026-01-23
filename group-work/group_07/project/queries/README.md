# Motion Data Analysis Queries

This directory contains 15 individual queries for analyzing device motion data.

## Structure

Each query is in a separate file:

- `query_01.js` - Count total documents
- `query_02.js` - Find the first 10 documents
- `query_03.js` - Find documents with high acceleration
- `query_04.js` - Calculate acceleration statistics
- `query_05.js` - Find documents with high rotation rate
- `query_06.js` - Calculate total acceleration magnitude
- `query_07.js` - Find documents with specific orientation
- `query_08.js` - Calculate average gravity by component
- `query_09.js` - Find movement peaks
- `query_10.js` - Group by acceleration ranges
- `query_11.js` - Find extreme yaw values
- `query_12.js` - Calculate correlation between acceleration and rotation
- `query_13.js` - Find stable movement periods
- `query_14.js` - Calculate acceleration percentiles
- `query_15.js` - Complete movement pattern analysis

## How to Use

### In MongoDB Compass:

1. Connect to the `iot_sensors` database
2. Select the `motion_data` collection
3. Go to the appropriate tab:
   - **"Documents"** for `find()` queries
   - **"Aggregations"** for `aggregate()` queries
4. Open the desired query file
5. Copy and paste the content into Compass

### In mongosh (terminal):

**Run an individual query:**

```bash
mongosh iot_sensors query_01.js
```

**Run all queries:**

```bash
mongosh iot_sensors query_*.js
```

**Or inside mongosh:**

```bash
mongosh iot_sensors
use iot_sensors
load("query_01.js")
```

## Database and Collection

- **Database:** `iot_sensors`
- **Collection:** `motion_data`

## Query Types

- **Basic queries (1-2):** Counting and initial visualization
- **Filters (3, 5, 7, 9, 11, 13):** Find specific documents
- **Statistics (4, 8, 12):** Calculate averages, maximums, minimums
- **Advanced analysis (6, 10, 14):** Magnitude calculations, buckets, percentiles
- **Complete analysis (15):** General summary of all patterns

## Data Structure

Each document contains:

- `_id`: MongoDB unique identifier
- ``: Sequential index (may be empty)
- `attitude`: { roll, pitch, yaw } - Orientation in radians
- `gravity`: { x, y, z } - Gravitational vector in m/s²
- `rotationRate`: { x, y, z } - Rotation rate in rad/s
- `userAcceleration`: { x, y, z } - User acceleration in m/s²
